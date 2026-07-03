# TIMS Database Schema and Data Flow

This document is for developers and server operators only. TIMS must not expose raw database tables through the website UI, including admin screens or debug pages.

## Database Configuration

The backend reads `DATABASE_URL` from environment settings in `backend/app/config.py`. SQLAlchemy connects in `backend/app/database.py` using that URL.

Local Docker Compose defines the PostgreSQL service as `db` in `docker-compose.yml`.

Typical local variables are supplied through `.env`:

- `POSTGRES_USER`
- `POSTGRES_DB`
- `DATABASE_URL`
- `SECRET_KEY`

Do not print or commit database passwords, JWT secrets, SMTP credentials, SMS credentials, password hashes, OTP hashes, reset token hashes, or other secrets.

## Docker and PostgreSQL Inspection

```bash
# show running containers
docker ps

# show docker compose services
docker compose ps

# open PostgreSQL shell through the compose service
docker compose exec db psql -U <db_user> -d <db_name>
```

Use the values from your server environment for `<db_user>` and `<db_name>`.

## Tables and Models

`backend/app/models/master.py`

- `storage_bins`: physical bin master data.
  Important columns: `id`, `bin_code`, `shelf_label`, `section`, `department_cat`, `row_label`, `rack_number`, `shelf_level`, `floor_area`, `capacity`, `created_at`.
- `tools`: tool inventory master data.
  Important columns: `id`, `tool_code`, `name`, `category`, `tool_type`, `department_access`, `is_consumable`, `total_quantity`, `available_quantity`, `storage_bin_id`, `requires_calibration`, `calibration_freq_days`, `last_calibration_date`, `next_calibration_due`, `service_partner`, `status`.

`backend/app/models/transaction.py`

- `users`: TIMS users.
  Important columns: `id`, `employee_id`, `full_name`, `email`, `role`, `department`, `is_active`, `created_at`. Do not select `hashed_password` in routine inspection queries.
- `requisitions`: tool requests.
  Important columns: `id`, `requisition_number`, `tool_id`, `requested_by`, `requester_dept`, `quantity_requested`, `purpose_of_job`, `from_date`, `to_date`, `status`, `approved_by`, `approved_at`, `rejection_reason`, `created_at`.
- `issuance_logs`: issuance, return, consumption, damage/loss lifecycle records.
  Important columns: `id`, `requisition_id`, `tool_id`, `issued_to`, `issued_by`, `quantity_issued`, `issued_at`, `expected_return_date`, `actual_return_date`, `return_condition`, `quantity_returned`, `quantity_consumed`, `damage_type`, `penalty_amount`.
- `audit_log`: activity history and calibration history.
  Important columns: `id`, `user_id`, `action`, `entity`, `entity_id`, `details`, `timestamp`.
- `notifications`: user notifications.
  Important columns: `id`, `user_id`, `message`, `is_read`, `created_at`.
- `access_requests`: public access requests and OTP verification lifecycle.
  Important columns: `id`, `request_id`, `full_name`, `email`, `mobile_number`, `employee_id`, `department`, `requested_role`, `status`, `approved_by`, `approved_at`, `created_at`. Do not select `hashed_password` or `otp_hash`.
- `password_reset_tokens`: password reset lifecycle.
  Important columns: `id`, `user_id`, `expires_at`, `used_at`, `created_at`. Do not select `token_hash`.

## Data Flows

Tool creation:
`tools` gets a new row. If a storage bin is selected, `tools.storage_bin_id` points to `storage_bins.id`. An `audit_log` row records `TOOL_CREATED`, and maintenance users receive `notifications`.

Request creation:
`requisitions` gets a `pending` row linked to `tools.id` and `users.id`. Pending requests do not reserve stock. The department Head is notified if one exists.

Approval:
An eligible approver changes `requisitions.status` from `pending` to `approved`, sets `approved_by` and `approved_at`, and an `audit_log` row records approval. Approved, not-yet-issued requests reserve stock in shared stock calculations.

Issuance:
Staff/Admin issue from approved requisitions in `/api/issuance/queue`. `issuance_logs` gets a row, durable stock availability is reduced, and the requisition becomes `issued`. Consumables reduce `tools.total_quantity` and complete immediately.

Partial return:
`issuance_logs.quantity_returned` increases. Good quantity restores `tools.available_quantity`; damaged/missing quantity remains unavailable until assessed.

Full good return:
The open issuance gets `actual_return_date`, `return_condition = good`, and the requisition becomes `returned`.

Damaged or missing return:
Return details are saved in `issuance_logs`; good quantity returns to available stock, damaged/missing units remain out of availability. Damage/loss assessment later sets `damage_type` and optional penalty fields.

Calibration upload/download:
Current code stores calibration events in `audit_log` with action `CALIBRATION_RECORDED` and updates calibration fields on `tools`. Certificate download looks for a `certificate_path` or `certificate_file` in calibration audit details. If no file path exists, the API returns a clean 404. A future upload feature should store files in a persistent Docker volume and save a non-secret path in audit details or a dedicated calibration records table.

Access request approval:
`access_requests.status` changes to `approved`; a `users` row is created from the request without exposing the stored password hash.

Password reset:
`password_reset_tokens` stores a hash of the reset token, expiry, and `used_at`. On reset, `users.hashed_password` changes and the token is marked used.

OTP verification:
`access_requests` temporarily stores `otp_hash`, expiry, and attempt count. Successful verification clears the OTP hash and sets `otp_verified_at`.

Stock write-off:
A damaged durable tool can be written off. `tools.total_quantity` and `tools.available_quantity` become zero and status becomes `written_off`.

## Safe SQL Examples

```sql
-- list all tables
\dt

-- describe important tables
\d users
\d tools
\d requisitions
\d issuance_logs
\d storage_bins
\d access_requests
\d notifications
\d audit_log

-- view users without sensitive fields
SELECT id, employee_id, full_name, email, role, department, is_active, created_at
FROM users
ORDER BY employee_id;

-- view tools and stock fields
SELECT id, tool_code, name, total_quantity, available_quantity, status
FROM tools
ORDER BY tool_code;

-- view pending/approved requests
SELECT id, requisition_number, requested_by, tool_id, quantity_requested, status,
       from_date, to_date, approved_by, approved_at, created_at
FROM requisitions
ORDER BY created_at DESC;

-- view ready-to-issue approved requests
SELECT id, requisition_number, requested_by, tool_id, quantity_requested, status,
       approved_by, approved_at
FROM requisitions
WHERE status = 'approved'
ORDER BY approved_at DESC;

-- view active issuances
SELECT id, requisition_id, tool_id, issued_to, quantity_issued,
       quantity_returned, issued_at, expected_return_date, actual_return_date
FROM issuance_logs
WHERE actual_return_date IS NULL
ORDER BY issued_at DESC;

-- view returns
SELECT id, requisition_id, tool_id, quantity_returned, return_condition,
       actual_return_date, damage_type, penalty_amount
FROM issuance_logs
WHERE actual_return_date IS NOT NULL
ORDER BY actual_return_date DESC;

-- view calibration records from audit details without secrets
SELECT id, entity_id AS tool_id, details, timestamp
FROM audit_log
WHERE action = 'CALIBRATION_RECORDED'
ORDER BY timestamp DESC;

-- view storage bins
SELECT id, bin_code, shelf_label, section, rack_number, shelf_level, capacity, created_at
FROM storage_bins
ORDER BY bin_code;

-- view damage/loss records
SELECT id, tool_id, requisition_id, damage_type, quantity_issued, quantity_returned,
       penalty_amount, actual_return_date
FROM issuance_logs
WHERE return_condition IN ('damaged', 'missing') OR damage_type IS NOT NULL
ORDER BY actual_return_date DESC;
```

## Role Scope Notes

Admin and maintenance staff see system-wide maintenance data. Department Heads see department-scoped requests, issuances, and tools plus shared tools. Requesters see their own requests and issued tools plus requestable tools for their department/shared access. Different dashboard counts are expected only when caused by these role and department scopes.
