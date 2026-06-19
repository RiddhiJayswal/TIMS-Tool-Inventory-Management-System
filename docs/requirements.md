# requirements.md — Functional & Non-Functional Requirements
# Tools Inventory Management System (TIMS)
# UltraTech Cement — Single Plant

---

## FR-01: Tool Master Management

| ID | Requirement | Priority |
|---|---|---|
| FR-01.1 | System shall allow maintenance_admin and maintenance_staff to create, edit, and deactivate tool records | Must Have |
| FR-01.2 | Each tool record shall store: tool_code, name, category, tool_type, department_access, make, model, serial_number, purchase_date, purchase_price, standard_life_months | Must Have |
| FR-01.3 | System shall classify tools as General or Specialized (E&I / Mechanical / Civil / Process) | Must Have |
| FR-01.4 | System shall flag whether a tool requires calibration (boolean) | Must Have |
| FR-01.5 | System shall store calibration_frequency_days, last_calibration_date, next_calibration_due, and service_partner per tool | Must Have |
| FR-01.6 | System shall track total_quantity and compute available_quantity in real-time | Must Have |
| FR-01.7 | System shall assign each tool to a storage_bin with bin_code and shelf location | Must Have |
| FR-01.8 | System shall support tool status: Active / Calibration Due / Damaged / Written Off | Must Have |
| FR-01.9 | Specialized tools shall only be visible/requestable by their designated department | Must Have |
| FR-01.10 | System shall distinguish consumable tools (e.g., welding rods) from durable tools | Must Have |

---

## FR-02: Storage Bin Management

| ID | Requirement | Priority |
|---|---|---|
| FR-02.1 | System shall allow maintenance_admin and maintenance_staff to create and label storage bins | Must Have |
| FR-02.2 | Each bin shall have a bin_code, shelf_label, section, and department_category | Must Have |
| FR-02.3 | Tools shall be mapped to a bin; bin location displayed on tool detail page | Must Have |
| FR-02.4 | System shall show all tools in a given bin on the bin detail view | Should Have |

---

## FR-03: User Management & Roles

| ID | Requirement | Priority |
|---|---|---|
| FR-03.1 | System shall support four roles: requester, dept_head, maintenance_staff, maintenance_admin | Must Have |
| FR-03.2 | Each user shall belong to one department | Must Have |
| FR-03.3 | dept_head role shall be limited to approving requisitions from their own department only | Must Have |
| FR-03.4 | A requester shall not be able to approve their own requisition under any circumstance | Must Have |
| FR-03.5 | maintenance_admin shall have full system access including master data and financial records | Must Have |
| FR-03.6 | JWT-based authentication with role enforcement at API layer | Must Have |

---

## FR-04: Requisition Workflow

| ID | Requirement | Priority |
|---|---|---|
| FR-04.1 | Any requester shall be able to raise a tool requisition specifying: tool, quantity, purpose, from_date, to_date | Must Have |
| FR-04.2 | Requisition shall be routed automatically to the requester's department head for approval | Must Have |
| FR-04.3 | dept_head shall be able to approve or reject with an optional reason | Must Have |
| FR-04.4 | Approved requisition shall appear in the Maintenance Department issuance queue | Must Have |
| FR-04.5 | System shall prevent issuance if available_quantity < quantity_requested | Must Have |
| FR-04.6 | Requester shall see live status of their requisition (Pending / Approved / Rejected / Issued / Returned) | Must Have |
| FR-04.7 | System shall notify dept_head on new requisition, and requester on approval/rejection | Must Have |
| FR-04.8 | System shall prevent issuance of a tool that is flagged as Calibration Due | Must Have |

---

## FR-05: Tool Issuance

| ID | Requirement | Priority |
|---|---|---|
| FR-05.1 | maintenance_staff shall issue tools only against an approved requisition | Must Have |
| FR-05.2 | On issuance: available_quantity shall reduce immediately and atomically | Must Have |
| FR-05.3 | Issuance record shall store: issued_by, issued_to, quantity_issued, issued_at, expected_return_date | Must Have |
| FR-05.4 | System shall snapshot depreciated_value_at_issue at time of each issuance | Must Have |
| FR-05.5 | Dashboard shall show all open issuances: who has the tool, expected return date, days remaining | Must Have |
| FR-05.6 | Any user viewing tool availability shall see: available quantity + who has outstanding units + due date | Must Have |

---

## FR-06: Tool Return

| ID | Requirement | Priority |
|---|---|---|
| FR-06.1 | maintenance_staff shall process returns against the original issuance record | Must Have |
| FR-06.2 | Return form shall capture: actual_return_date, condition (Good / Damaged / Missing), quantity_returned | Must Have |
| FR-06.3 | On full return in good condition: available_quantity shall restore fully, issuance closed | Must Have |
| FR-06.4 | For consumable tools: partial return shall be valid; quantity_consumed = quantity_issued - quantity_returned | Must Have |
| FR-06.5 | On partial return of consumables: stock restored by quantity_returned only | Must Have |
| FR-06.6 | For non-consumable tools: quantity_returned must equal quantity_issued or damage workflow triggers | Must Have |
| FR-06.7 | System shall require damage_type selection if condition = Damaged or Missing | Must Have |

---

## FR-07: Damage & Write-Off

| ID | Requirement | Priority |
|---|---|---|
| FR-07.1 | System shall support three damage types: theft, mishandling, wear_and_tear | Must Have |
| FR-07.2 | For theft: penalty_amount = market rate entered manually by maintenance_admin | Must Have |
| FR-07.3 | For mishandling: penalty_amount = depreciated_value_at_issue (already snapshotted) | Must Have |
| FR-07.4 | For wear_and_tear: no penalty; tool status updated to Written Off | Must Have |
| FR-07.5 | Penalty record shall be stored against issuance_log with employee ID | Must Have |
| FR-07.6 | maintenance_admin shall be able to formally write off a tool, removing it from active stock | Must Have |
| FR-07.7 | Written-off tools shall remain visible in historical records but not in available inventory | Must Have |

---

## FR-08: Depreciation Engine

| ID | Requirement | Priority |
|---|---|---|
| FR-08.1 | System shall calculate current_value = purchase_price - (months_elapsed × monthly_depreciation) | Must Have |
| FR-08.2 | monthly_depreciation = purchase_price / standard_life_months | Must Have |
| FR-08.3 | current_value shall be floored at ₹0; shall never go negative | Must Have |
| FR-08.4 | Tools with current_value = 0 shall be flagged for write-off review | Should Have |
| FR-08.5 | depreciated_value_at_issue shall be calculated and stored at issuance time, not at return time | Must Have |

---

## FR-09: Calibration & Service Management

| ID | Requirement | Priority |
|---|---|---|
| FR-09.1 | System shall track next_calibration_due per tool where requires_calibration = true | Must Have |
| FR-09.2 | Background job shall run daily and send alert if next_calibration_due is within 7 days | Must Have |
| FR-09.3 | Tools overdue for calibration shall be automatically blocked from new issuances | Must Have |
| FR-09.4 | maintenance_admin shall update calibration records on completion; next_calibration_due recalculates | Must Have |
| FR-09.5 | Service partner name and contact shall be stored per tool | Should Have |
| FR-09.6 | Calibration history (all past calibration dates) shall be viewable per tool | Should Have |

---

## FR-10: Overdue Tracking

| ID | Requirement | Priority |
|---|---|---|
| FR-10.1 | System shall flag any issuance where actual_return_date is NULL and expected_return_date < today | Must Have |
| FR-10.2 | Overdue issuances shall appear prominently on the dashboard with days_overdue count | Must Have |
| FR-10.3 | System shall send overdue notification to requester and their dept_head on due date | Must Have |
| FR-10.4 | Overdue reminder shall repeat every 3 days until tool is returned | Should Have |

---

## FR-11: Procurement

| ID | Requirement | Priority |
|---|---|---|
| FR-11.1 | maintenance_admin shall be able to define a minimum_stock_threshold per tool | Should Have |
| FR-11.2 | System shall notify maintenance_admin when available_quantity falls below threshold | Should Have |
| FR-11.3 | On procuring new tools: admin adds quantity, purchase_price, purchase_date to the tool record | Must Have |
| FR-11.4 | total_quantity increases on procurement entry; available_quantity recalculates | Must Have |

---

## FR-12: Reports & Dashboard

| ID | Requirement | Priority |
|---|---|---|
| FR-12.1 | Dashboard shall show: total tools, available tools, tools currently issued, overdue count, calibration due count | Must Have |
| FR-12.2 | System shall provide a current stock report: all tools with available vs. total quantity | Must Have |
| FR-12.3 | System shall provide an issuance history report filterable by tool, person, department, date range | Must Have |
| FR-12.4 | System shall provide a calibration due report (next 30 days) | Must Have |
| FR-12.5 | System shall provide a damage and penalty register | Must Have |
| FR-12.6 | System shall provide a department-wise tool utilization summary | Should Have |
| FR-12.7 | System shall provide a tool depreciation and value summary | Should Have |
| FR-12.8 | All reports shall be exportable to Excel/CSV | Should Have |

---

## Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-01 | Response time for all read operations | < 2 seconds |
| NFR-02 | System uptime during plant working hours (6 AM – 10 PM) | ≥ 99% |
| NFR-03 | Database hosted on company-controlled infrastructure | PostgreSQL on own server |
| NFR-04 | All data accessible via internet (not LAN-only) | HTTPS enforced |
| NFR-05 | All stock-modifying operations atomic (no partial writes) | Database transactions |
| NFR-06 | Complete audit log: every create/update/delete logged with user ID + timestamp | Must Have |
| NFR-07 | Concurrent users supported | Up to 50 |
| NFR-08 | All tables include `plant_id` field (nullable) for future multi-plant expansion | Must Have |
| NFR-09 | available_quantity shall never go below 0; API returns HTTP 400 if attempted | Must Have |
| NFR-10 | Role enforcement at API layer, not frontend only | Must Have |
| NFR-11 | Passwords hashed (bcrypt); no plain-text credentials stored | Must Have |
| NFR-12 | Session token expiry: 8 hours | Must Have |

---

## Constraints

- v1 is for a single plant only
- No SAP integration in v1
- No offline/mobile-native capability in v1
- No barcode/RFID hardware in v1
- Penalty amount recovery (payroll deduction) is out of scope — TIMS records it, HR acts on it separately

---

## Acceptance Criteria Summary

The system is considered complete for v1 when:
1. A requester can raise a requisition and track it through to return without any paper record
2. Real-time stock visibility is accurate across all departments simultaneously
3. Calibration-due tools are automatically blocked from issuance
4. Damage/penalty is recorded with correct calculation for all three damage types
5. The maintenance department dashboard shows overdue, calibration-due, and low-stock alerts in one view
6. All actions are logged in an audit trail with user ID and timestamp
