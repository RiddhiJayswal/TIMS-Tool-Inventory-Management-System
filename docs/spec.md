# spec.md — Technical Specification
# Tool Inventory Management System (TIMS)
# UltraTech Cement — Single Plant Deployment

---

## 1. As-Is Situation

The Maintenance Department at UltraTech Cement currently manages thousands of plant maintenance tools using Excel spreadsheets and manual paper registers. The existing process has the following critical gaps:

- No real-time visibility into tool availability across departments
- Tool issuance recorded manually — prone to data entry errors and duplicate records
- No structured approval workflow; tools taken without formal authorization
- Calibration and service due dates tracked informally — often missed
- No depreciation or penalty tracking for damaged or lost tools
- Physical tool location (bin/shelf) not recorded — finding a tool takes significant time
- No audit trail of who took what, when, and in what condition it was returned

**Trigger for this project:** Manual Excel maintenance is no longer scalable as tool inventory grows. Low visibility causes production delays when a tool is unavailable or a calibration is missed.

---

## 2. Proposed System — To-Be

A web-based, role-aware Tool Inventory Management System with a PostgreSQL database, real-time stock tracking, approval workflows, calibration reminders, and damage/penalty handling.

The system is internet-accessible, hosted on company infrastructure, with the database fully owned and controlled by UltraTech.

---

## 3. System Architecture

```
┌─────────────────────────────────────────────┐
│                  Browser (React)            │
│   Dashboard | Requisition | Reports | Admin │
└──────────────────┬──────────────────────────┘
                   │ HTTPS / REST API
┌──────────────────▼──────────────────────────┐
│             FastAPI Backend                 │
│  Auth | Stock Service | Depreciation Engine │
│  Notification Scheduler | Audit Logger      │
└──────────────────┬──────────────────────────┘
                   │ SQLAlchemy ORM
┌──────────────────▼──────────────────────────┐
│           PostgreSQL Database               │
│  tools | storage_bins | requisitions        │
│  issuance_logs | users | audit_log          │
└─────────────────────────────────────────────┘
```

---

## 4. Module Breakdown

### 4.1 Tool Master Module

Manages the complete catalogue of tools owned by the Maintenance Department.

**Tool attributes:**
- Identification: tool_code, name, category, make, model, serial number
- Classification: tool_type (General / Specialized), department_access
- Inventory: total_quantity, available_quantity, storage_bin
- Financial: purchase_date, purchase_price, standard_life_months, current_value
- Calibration: requires_calibration (bool), calibration_frequency_days, last_calibration_date, next_calibration_due, service_partner
- Status: Active / Calibration Due / Damaged / Written Off

**Tool types:**
| Type | Description | Example |
|---|---|---|
| General | Any department can use | Ladder, screwdriver, plier |
| Specialized — E&I | Electrical & Instrumentation only | Multimeter, insulation tester |
| Specialized — Mechanical | Mechanical department only | Torque wrench, bearing puller |
| Specialized — Civil | Civil department only | Paint brush, spirit level |
| Specialized — Process | Process department only | Process-specific gauges |

**Calibration requirement:**
| Requires Calibration | Example |
|---|---|
| Yes | Weighing machine, temperature tester, scaffolding (strength check) |
| No | Screwdriver, plier, ladder |

---

### 4.2 Storage Bin Module

Maps each tool to a physical location inside the tool crib.

- Bin code (e.g., `E-01`, `M-03`)
- Shelf/section label
- Department category the bin belongs to
- Tools can be organized alphabetically or by department/purpose

This allows the tool crib attendant to locate any tool immediately without searching.

---

### 4.3 Requisition Module

Handles the request-approval workflow before any tool is physically issued.

**Workflow:**

```
Requester raises requisition
        │
        ▼
Department Head reviews → Approve / Reject
        │ (Approved)
        ▼
Requisition appears in Maintenance Department queue
        │
        ▼
Maintenance Staff issues tool physically
        │
        ▼
Stock reduces in real-time; issuance log created
```

**Requisition fields:**
- Tool requested, quantity
- Purpose / nature of job
- Requested from date, requested to date (duration)
- Requester name, employee ID, department

**Rules:**
- A requester cannot approve their own requisition
- Department head can only approve requisitions from their own department
- Maintenance cannot issue without a valid approved requisition
- If tool quantity is insufficient for the request, system blocks issuance and shows available count

---

### 4.4 Issuance Module

Records the physical handover of a tool from Maintenance to the requesting department.

- Links to approved requisition
- Records: issued_by, issued_to, quantity_issued, issued_at, expected_return_date
- Snapshots `depreciated_value_at_issue` for penalty calculations
- Immediately reduces `available_quantity` in the tool master

**Real-time visibility after issuance:**
- Dashboard shows: "Ladder — 9 available | 1 with IT Dept (Ramesh Kumar) — Due: 15-Jun-2026"
- Other requesters see accurate available count
- Tool crib attendant sees full issuance board

---

### 4.5 Return Module

Handles tool return with condition verification by the Maintenance Department.

**Return scenarios:**

| Scenario | Action |
|---|---|
| Full return, good condition | Stock restored fully, issuance closed |
| Partial return (consumables only) | Quantity consumed recorded, remaining stock restored |
| Returned damaged — mishandling | Penalty = depreciated book value at time of damage |
| Returned damaged — theft | Penalty = current market rate (entered by admin) |
| Returned damaged — wear & tear | Tool written off, no penalty |
| Not returned (overdue) | Flagged on dashboard, department head notified |

**Consumable return example (welding rods):**
- Issued: 10 packets
- Returned: 6 packets
- System records: quantity_consumed = 4, quantity_returned = 6
- Stock restored by 6 only

---

### 4.6 Calibration & Maintenance Module

Tracks service schedules for tools that require periodic calibration or maintenance.

- `next_calibration_due` calculated from `last_calibration_date + calibration_frequency_days`
- Background scheduler checks daily; sends alert 7 days before due date
- Tools overdue for calibration are **blocked from issuance** automatically
- On calibration completion: maintenance_admin updates record, tool status restored to Active
- Service partner contact stored per tool

---

### 4.7 Depreciation Engine

Calculates the declining book value of each tool monthly.

```
monthly_depreciation = purchase_price / standard_life_months
current_value = purchase_price - (months_elapsed × monthly_depreciation)
```

- Value floored at ₹0
- Tool flagged for write-off when current_value = 0
- Depreciated value snapshotted at time of each issuance for accurate penalty reference

---

### 4.8 Damage & Write-Off Module

Handles three damage/loss cases with different financial outcomes.

| Case | Penalty | Process |
|---|---|---|
| Theft | Market rate (admin-entered) | Penalty raised against employee, tool procured again |
| Mishandling | Depreciated book value at incident date | Penalty raised, tool repaired or replaced |
| Wear & Tear / End of Life | None | Tool written off, removed from active stock |

Penalty records are stored against the issuance log with employee ID for HR/finance reference.

---

### 4.9 Procurement Trigger

When stock falls below a threshold (set per tool), maintenance_admin is notified to procure.

On procurement entry:
- New batch added to `total_quantity`
- Purchase price and purchase date recorded for new batch
- Standard life resets for new units
- Depreciation tracked per batch (future enhancement: batch-level tracking)

---

## 5. Reports

| Report | Audience |
|---|---|
| Current stock status (all tools) | All roles |
| Overdue issuances | Maintenance Admin, Dept Head |
| Tool usage history (per tool / per person) | Maintenance Admin |
| Calibration due in next 30 days | Maintenance Admin |
| Damage and penalty register | Maintenance Admin |
| Department-wise tool utilization | Maintenance Admin |
| Tool value and depreciation summary | Maintenance Admin |

---

## 6. Notifications

| Trigger | Recipient |
|---|---|
| Requisition raised | Department Head |
| Requisition approved | Requester + Maintenance Staff |
| Requisition rejected | Requester |
| Tool issued | Requester |
| Return overdue (day of + every 3 days) | Requester + Department Head |
| Calibration due in 7 days | Maintenance Admin |
| Stock below threshold | Maintenance Admin |

Delivery: Email (v1). In-app notification bell (v2).

---

## 7. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Response time | < 2 seconds for all read operations |
| Availability | 99% uptime during plant working hours |
| Data ownership | PostgreSQL on company-controlled server |
| Internet access | Required — no offline mode in v1 |
| Concurrent users | Up to 50 simultaneous users (single plant) |
| Audit trail | All stock-modifying actions logged with user ID + timestamp |
| Future | `plant_id` field on all tables for multi-plant expansion |

---

## 8. Out of Scope — v1

- SAP PM / ERP integration
- Mobile native app (responsive web only)
- Barcode / RFID scanning hardware
- Multi-plant deployment
- Financial ledger / penalty auto-deduction from payroll
