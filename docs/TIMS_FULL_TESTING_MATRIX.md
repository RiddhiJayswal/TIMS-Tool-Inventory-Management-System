# TIMS Full Testing Matrix

This matrix maps every system feature to its test coverage across backend (pytest), frontend (Vitest), and E2E (Playwright).

Latest automated run: 2026-07-02 02:30 local time.

| Suite | Tests | Passed | Failed | Skipped |
|-------|-------|--------|--------|---------|
| Backend pytest | 227 | 227 | 0 | 0 |
| Frontend Vitest | 53 | 53 | 0 | 0 |
| Playwright E2E | 109 | 109 | 0 | 0 |
| **Total** | **389** | **389** | **0** | **0** |

Legend: Covered | Partial | Not covered | N/A

---

## 1. Authentication

| Test Case | Backend | Frontend | E2E |
|-----------|---------|---------|-----|
| Login with valid credentials (all 4 roles) | Covered `test_integration.py::TestAuth` | Covered `Login.test.jsx` | Covered `auth.spec.js` |
| Login with wrong password returns 401 | Covered | Covered | Covered |
| Login with unknown employee ID returns 401 | Covered | Covered | Covered |
| Employee ID is case-sensitive | Covered | N/A | Covered |
| JWT token returned on login | Covered | N/A | N/A |
| Token attached to subsequent requests | N/A | Covered `api.test.js` | N/A |
| 401 redirect clears localStorage | N/A | Covered `api.test.js` | N/A |
| Logout clears session | Covered | N/A | Covered |
| Protected route blocks unauthenticated | N/A | Covered `ProtectedRoute.test.jsx` | Covered |
| GET /auth/me returns own user | Covered | N/A | N/A |
| Forgot password sends reset token | Covered | N/A | N/A |
| Reset password with valid token | Covered | N/A | N/A |
| Reset with expired/invalid token -> 400 | Covered | N/A | N/A |
| Forgot username returns employee_id | Covered | N/A | N/A |
| Request access OTP send | Covered | N/A | N/A |
| Request access OTP verify | Covered | N/A | N/A |
| Signup blocked without OTP verified | Covered | N/A | N/A |
| Inactive user cannot login | Covered `test_users.py` | N/A | N/A |

---

## 2. Users

| Test Case | Backend | Frontend | E2E |
|-----------|---------|---------|-----|
| Admin can list all users | Covered `test_users.py` | N/A | N/A |
| Non-admin cannot list users | Covered | N/A | Covered `workflow-f.spec.js` |
| Admin can create user (all roles) | Covered | N/A | N/A |
| Duplicate employee_id blocked | Covered | N/A | N/A |
| Duplicate email blocked | Covered | N/A | N/A |
| Invalid role name blocked | Covered | N/A | N/A |
| Admin can update user name/role | Covered | N/A | N/A |
| Admin can deactivate user | Covered | N/A | N/A |
| Deactivated user cannot login | Covered | N/A | N/A |
| Admin cannot deactivate themselves | Covered | N/A | N/A |
| Last admin cannot be deactivated | Covered | N/A | N/A |
| Admin can toggle active status | Covered | N/A | N/A |
| Access request list (admin only) | Covered | N/A | N/A |
| Admin can approve access request | Covered | N/A | N/A |
| Approve creates new user | Covered | N/A | N/A |
| Approve duplicate blocked | Covered | N/A | N/A |
| Admin can reject access request | Covered | N/A | N/A |
| Reject without reason -> 400 | Covered | N/A | N/A |
| Cannot re-reject approved request | Covered | N/A | N/A |
| 404 for non-existent request | Covered | N/A | N/A |

---

## 3. Tools

| Test Case | Backend | Frontend | E2E |
|-----------|---------|---------|-----|
| Admin/staff can create tool | Covered `test_tools.py` | N/A | Covered `workflow-a.spec.js` |
| Requester/head cannot create tool | Covered | N/A | Covered `workflow-f.spec.js` |
| Duplicate tool_code blocked | Covered | N/A | N/A |
| Missing required fields -> 422 | Covered | N/A | N/A |
| Negative quantity -> 422 | Covered | N/A | N/A |
| Negative price -> 422 | Covered | N/A | N/A |
| Consumable 0 qty -> out_of_stock status | Covered | N/A | N/A |
| Calibration calculates next_due date | Covered | N/A | N/A |
| department_access stored correctly | Covered | N/A | N/A |
| Unauthenticated -> 401 | Covered | N/A | N/A |
| Admin sees all tools | Covered | Covered `Tools.test.jsx` | N/A |
| Non-maintenance role sees dept-scoped tools | Covered | Covered | N/A |
| Search by name/code filters results | Covered | Covered | N/A |
| Get tool by ID includes issuances + cal history | Covered | N/A | N/A |
| Filter by status | Covered | N/A | N/A |
| Filter by requires_calibration | Covered | N/A | N/A |
| 404 for missing tool | Covered | N/A | N/A |
| Update tool name | Covered | N/A | N/A |
| Increase quantity adjusts available_quantity | Covered | N/A | N/A |
| Derived fields (status, next_due) rejected | Covered | N/A | N/A |
| Disabling calibration clears schedule | Covered | N/A | N/A |
| Requester cannot update tool | Covered | N/A | N/A |
| Admin can write off tool | Covered | N/A | N/A |
| Write-off sets status + zeroes quantity | Covered | N/A | N/A |
| Non-admin cannot write off | Covered | N/A | N/A |
| Active undamaged tool blocked from write-off | Covered | N/A | N/A |

---

## 4. Storage Bins

| Test Case | Backend | Frontend | E2E |
|-----------|---------|---------|-----|
| Admin/staff can create bin | Covered `test_storage_bins.py` | N/A | N/A |
| Requester/head cannot create bin | Covered | N/A | N/A |
| Duplicate bin_code blocked | Covered | N/A | N/A |
| Missing shelf_label -> 422 | Covered | N/A | N/A |
| Missing bin_code -> 422 | Covered | N/A | N/A |
| Capacity shows remaining after creation | Covered | N/A | N/A |
| All optional fields accepted | Covered | N/A | N/A |
| Unauthenticated -> 401 | Covered | N/A | N/A |
| All roles can list bins | Covered | Covered `StorageBins.test.jsx` | N/A |
| tool_count shown in list | Covered | Covered | N/A |
| Requester sees dept-scoped tool count | Covered | N/A | N/A |
| Update bin label | Covered | N/A | N/A |
| Staff can update | Covered | N/A | N/A |
| Requester cannot update | Covered | N/A | N/A |
| 404 for missing bin | Covered | N/A | N/A |
| Capacity below used_units -> 400 | Covered | N/A | N/A |
| Capacity can be increased | Covered | N/A | N/A |
| Tools in bin endpoint | Covered | N/A | N/A |
| Scoped for requester | Covered | N/A | N/A |
| Exceed bin capacity -> 400 | Covered | N/A | N/A |
| Within capacity -> 201 | Covered | N/A | N/A |
| Form input focus not lost on typing | N/A | Covered | N/A |

---

## 5. Requisitions

| Test Case | Backend | Frontend | E2E |
|-----------|---------|---------|-----|
| Requester can submit requisition | Covered `test_integration.py` | Covered `Requisitions.test.jsx` | Covered |
| from_date in past -> 422 | Covered `test_services.py` | N/A | N/A |
| Dept head can view requisitions | Covered | Covered | N/A |
| Requester sees only own requisitions | Covered `test_workflows.py` | Covered | N/A |
| Requisition number auto-generated | Covered | N/A | N/A |
| Status badge displayed correctly | N/A | Covered | N/A |
| Pending status on creation | Covered | N/A | Covered |

---

## 6. Approvals

| Test Case | Backend | Frontend | E2E |
|-----------|---------|---------|-----|
| Dept head can approve own dept req | Covered | N/A | Covered `workflow-a.spec.js` |
| Head cannot approve own requisition | Covered | N/A | Covered `workflow-f.spec.js` |
| Cross-department head blocked | Covered | N/A | Covered |
| Approval with insufficient stock blocked | Covered | N/A | Covered `workflow-c.spec.js` |
| Second approval of reserved stock blocked | Covered | N/A | Covered |
| Requester notified on approval | Covered `test_notifications.py` | N/A | N/A |
| Head can reject with reason | Covered | N/A | Covered `workflow-b.spec.js` |
| Rejection without reason -> 400 | Covered | N/A | Covered |
| Rejection does not affect stock | Covered | N/A | Covered |
| Requester notified on rejection | Covered | N/A | N/A |

---

## 7. Issuance

| Test Case | Backend | Frontend | E2E |
|-----------|---------|---------|-----|
| Maintenance can issue approved requisition | Covered | N/A | Covered `workflow-a.spec.js` |
| Stock decremented after issuance | Covered | N/A | Covered |
| available_quantity never goes negative | Covered | N/A | Covered `workflow-c.spec.js` |
| Calibration-due tool blocked | Covered | N/A | Covered `workflow-d.spec.js` |
| Requester cannot issue | Covered | N/A | Covered `workflow-f.spec.js` |
| Cannot issue rejected/pending req | Covered | N/A | Covered `workflow-b.spec.js` |
| Snapshot value captured at issuance | Covered `test_services.py` | N/A | N/A |
| Issued tool visible to requester | Covered | N/A | Covered |

---

## 8. Returns

| Test Case | Backend | Frontend | E2E |
|-----------|---------|---------|-----|
| Maintenance can process good return | Covered | N/A | Covered `workflow-a.spec.js` |
| Good return restores stock | Covered | N/A | Covered |
| Partial return allowed for non-consumable | Covered `test_services.py` | N/A | N/A |
| Partial return leaves correct status | Covered | N/A | N/A |
| Double return blocked | Covered | N/A | N/A |
| Requester cannot process return | Covered | N/A | Covered `workflow-f.spec.js` |
| Return notifies admin + head | Covered `test_notifications.py` | N/A | N/A |
| Consumable return allows partial/full | Covered | N/A | N/A |

---

## 9. Damage / Loss

| Test Case | Backend | Frontend | E2E |
|-----------|---------|---------|-----|
| Damaged return does NOT restore stock | Covered | N/A | Covered `workflow-e.spec.js` |
| Missing/lost return does NOT restore stock | Covered | N/A | Covered |
| Damage assessment reduces total_quantity | Covered | N/A | Covered |
| Penalty calculated for mishandling | Covered | N/A | N/A |
| Penalty = market_rate for theft | Covered | N/A | N/A |
| Penalty = 0 for wear_and_tear | Covered `test_services.py` | N/A | N/A |
| Damage appears in damage report | Covered | N/A | Covered |
| Double damage assessment blocked | Covered | N/A | Covered |
| Tool tracking updated after damage | Covered | N/A | Covered |

---

## 10. Calibration

| Test Case | Backend | Frontend | E2E |
|-----------|---------|---------|-----|
| Tool with requires_calibration=True gets next_due | Covered | N/A | N/A |
| Overdue tool status = calibration_due | Covered | N/A | Covered `workflow-d.spec.js` |
| Calibration-due blocks issuance | Covered | N/A | Covered |
| Calibration record updates next_due | Covered | N/A | Covered |
| After calibration, tool unblocked | Covered | N/A | Covered |
| Overdue tool in calibration report | Covered | N/A | Covered |
| Missing certificate rejected | Covered | N/A | N/A |
| Disabling calibration clears schedule | Covered | N/A | N/A |
| Scheduler safety (no terminal status change) | Covered `test_services.py` | N/A | N/A |

---

## 11. Reports

| Test Case | Backend | Frontend | E2E |
|-----------|---------|---------|-----|
| Maintenance admin can access all reports | Covered | N/A | Covered `workflow-f.spec.js` |
| Requester blocked from all 7 report endpoints | Covered | N/A | Covered |
| Dept head blocked from reports | Covered | N/A | Covered |
| Overdue report lists overdue tools | Covered | N/A | N/A |
| Stock report reflects current issuances | Covered | N/A | N/A |
| Stock accuracy after issuance/return | Covered | N/A | N/A |
| Damage report contains assessed issuances | Covered | N/A | Covered |
| Issuance history report | Covered | N/A | N/A |
| Calibration report | Covered | N/A | Covered |
| CSV export returns correct content-type | Partial ERR-007 | N/A | N/A |
| Report cost totals accurate (Decimal fix) | Partial ERR-002 | N/A | N/A |

---

## 12. Dashboard

| Test Case | Backend | Frontend | E2E |
|-----------|---------|---------|-----|
| Admin sees full summary counts | Covered | Covered `Dashboard.test.jsx` | N/A |
| Staff sees full summary counts | Covered | Covered | N/A |
| Dept head sees summary | Covered | Covered | N/A |
| Requester sees limited view | Covered | Covered | N/A |
| Dashboard count matches DB | Covered | N/A | N/A |
| my_issuances populated correctly | Covered | N/A | N/A |
| Loading state shown while fetching | N/A | Covered | N/A |
| Error state handled gracefully | N/A | Covered | N/A |
| Dashboard 403 for head/staff fixed | Partial ERR-003 | N/A | N/A |

---

## 13. Notifications

| Test Case | Backend | Frontend | E2E |
|-----------|---------|---------|-----|
| GET /auth/notifications returns own | Covered | N/A | N/A |
| All roles can read notifications | Covered | N/A | N/A |
| Required fields present | Covered | N/A | N/A |
| Max 50 notifications returned | Covered | N/A | N/A |
| Unauthenticated -> 401 | Covered | N/A | N/A |
| Mark own notification read | Covered | N/A | N/A |
| Mark other user's notif -> 404 | Covered | N/A | N/A |
| Nonexistent notif -> 404 | Covered | N/A | N/A |
| New requisition notifies head | Covered | N/A | N/A |
| Approval notifies requester | Covered | N/A | N/A |
| Return notifies admin + head | Covered | N/A | N/A |
| Tool addition notifies admins | Covered | N/A | N/A |
| Notifications are user-scoped | Covered | N/A | N/A |

---

## 14. Mobile / Responsive

| Test Case | Backend | Frontend | E2E |
|-----------|---------|---------|-----|
| Login page renders at 320px | N/A | N/A | Covered `responsive.spec.js` |
| Login page renders at 375px | N/A | N/A | Covered |
| Dashboard renders at all viewports | N/A | N/A | Covered |
| Tools renders at all viewports | N/A | N/A | Covered |
| Requisitions renders at all viewports | N/A | N/A | Covered |
| No horizontal scroll at 375px | N/A | N/A | Covered |
| Header visible at all viewports | N/A | N/A | Covered |
| Cards not cut at mobile | N/A | N/A | Covered |
| Long tool names overflow (known issue) | N/A | N/A | Partial ERR-008 |
| Tablet (768px) layout correct | N/A | N/A | Covered |

---

## 15. Workflow A N/A Full Requester-to-Return Lifecycle

| Step | Backend | E2E |
|------|---------|-----|
| Requester submits requisition | Covered | Covered |
| Head approves | Covered | Covered |
| Staff issues tool (stock -1) | Covered | Covered |
| Requester sees issued tool | Covered | Covered |
| Dashboard counts update | Covered | N/A |
| Staff processes good return (stock +1) | Covered | Covered |
| Requisition status = returned | Covered | Covered |
| Reports updated | Covered | N/A |

## 16. Workflow B N/A Rejection Flow

| Step | Backend | E2E |
|------|---------|-----|
| Rejection does not change stock | Covered | Covered |
| Requester sees rejection + reason | Covered | Covered |
| Rejected req cannot be issued | Covered | Covered |
| Rejection requires reason | Covered | Covered |
| Rejected req absent from issuance report | Covered | N/A |

## 17. Workflow C N/A Overbooking Prevention

| Step | Backend | E2E |
|------|---------|-----|
| First approval reserves stock | Covered | Covered |
| Second approval blocked (insufficient stock) | Covered | Covered |
| Issuance blocked when physical stock exhausted | Covered | Covered |
| Availability check reflects reservations | Covered | Covered |
| Stock cannot go negative | Covered | Covered |

## 18. Workflow D N/A Calibration Blocking

| Step | Backend | E2E |
|------|---------|-----|
| Overdue tool blocks issuance (400) | Covered | Covered |
| Calibration record unblocks tool | Covered | Covered |
| Tool in calibration report after | Covered | Covered |
| Requester blocked from cal report (403) | Covered | Covered |

## 19. Workflow E N/A Damage / Loss

| Step | Backend | E2E |
|------|---------|-----|
| Damaged return does not restore stock | Covered | Covered |
| Missing/lost return does not restore stock | Covered | Covered |
| Damage assessment reduces total_quantity | Covered | Covered |
| Damage in report | Covered | Covered |
| Tool tracking updated | Covered | Covered |
| Double damage blocked | Covered | Covered |

## 20. Workflow F N/A Role Restriction Matrix

| Restriction | Backend | E2E |
|-------------|---------|-----|
| Requester blocked from 7 report endpoints | Covered | Covered |
| Dept head blocked from reports | Covered | Covered |
| Requester cannot list users | Covered | Covered |
| Staff cannot list users | Covered | Covered |
| Requester cannot create tools | Covered | Covered |
| Head cannot create tools | Covered | Covered |
| Requester cannot access issuance queue | Covered | Covered |
| Requester cannot process returns | Covered | Covered |
| Head cannot approve own requisition | Covered | Covered |
| Cross-dept head blocked from approval | Covered | Covered |
| Unauthenticated -> 401 | Covered | Covered |
| Requester UI cannot see /users | N/A | Covered |
| Requester UI cannot see /reports | N/A | Covered |

---

## Coverage Summary

| Area | Backend | Frontend | E2E |
|------|---------|---------|-----|
| Authentication | Covered Complete | Covered Login + Guards | Covered Full |
| Users | Covered Complete | Not covered | Not covered |
| Tools | Covered Complete | Covered List/search | Covered Lifecycle |
| Storage Bins | Covered Complete | Covered List/focus | Not covered |
| Requisitions | Covered Covered | Covered List/status | Covered Full |
| Approvals | Covered Complete | Not covered | Covered Full |
| Issuance | Covered Complete | Not covered | Covered Full |
| Returns | Covered Complete | Not covered | Covered Full |
| Damage/Loss | Covered Complete | Not covered | Covered Full |
| Calibration | Covered Complete | Not covered | Covered Full |
| Reports | Covered Complete | Not covered | Covered Access |
| Dashboard | Covered Complete | Covered States | Not covered |
| Notifications | Covered Complete | Not covered | Not covered |
| Responsive | N/A | N/A | Covered Full |
| Role Restrictions | Covered Complete | Partial Guards | Covered Full |

