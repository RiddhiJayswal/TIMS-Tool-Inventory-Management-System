# TIMS Manual Testing Checklist

Use this checklist for manual QA of features that cannot be fully automated (email, SMS, real-time, PDF, print) and for exploratory testing before releases.

Latest automated baseline: 389/389 tests passing on 2026-07-02 02:30 local time.

**Test users:**
| Employee ID | Password | Role | Department |
|-------------|----------|------|------------|
| ADM001 | Admin@123 | maintenance_admin | N/A |
| STF001 | Staff@123 | maintenance_staff | N/A |
| HD001 | Head@123 | dept_head | E&I |
| USR001 | User@123 | requester | E&I |
| HD002 | Head2@123 | dept_head | Mechanical |

For the Docker development seed used by Playwright E2E, all five users use `password123`.

---

## 1. Authentication

- [ ] Login with ADM001/Admin@123 -> lands on /dashboard
- [ ] Login with wrong password -> error message visible, no redirect
- [ ] Login with unknown employee ID -> error message visible
- [ ] Lowercase employee ID (adm001) -> error (case-sensitive)
- [ ] Logout -> redirected to /login
- [ ] Navigate to /dashboard while logged out -> redirected to /login
- [ ] Navigate to /tools while logged out -> redirected to /login
- [ ] "Request Access" link on login page -> opens request form
- [ ] Fill and submit access request -> success message
- [ ] Admin receives OTP email (check inbox) -> enter OTP, verify
- [ ] Complete signup after OTP verified -> new user created
- [ ] Forgot password -> enter employee ID -> success message
- [ ] Password reset email received -> click link -> reset form shown
- [ ] Reset password with link -> can log in with new password
- [ ] Old password no longer works after reset

---

## 2. Dashboard

- [ ] Admin dashboard: shows total tools, available, overdue calibration, active issuances
- [ ] Staff dashboard: same counts visible
- [ ] Head dashboard: shows dept-level counts (not all tools)
- [ ] Requester dashboard: shows only their issuances/requisitions
- [ ] Counts update after issuing a tool (navigate away and back)
- [ ] "My Issuances" section shows correct items

---

## 3. Tools

- [ ] Admin can see all tools (cross-department)
- [ ] Requester sees only E&I department tools
- [ ] Search bar filters by tool name in real-time
- [ ] Search bar filters by tool code
- [ ] Typing in search bar does NOT lose focus (ERR-001 regression check)
- [ ] "Add Tool" button visible for admin/staff
- [ ] "Add Tool" button NOT visible for requester/head
- [ ] Create tool with calibration -> next_due auto-calculated and shown
- [ ] Tool status changes to `calibration_due` when overdue (after scheduler)
- [ ] Tool status changes to `out_of_stock` when available_quantity = 0
- [ ] Write off a damaged tool -> status = written_off, quantity = 0
- [ ] Filter by status = active / calibration_due / out_of_stock
- [ ] Filter by requires_calibration

---

## 4. Storage Bins

- [ ] All roles can view storage bins list
- [ ] Bin code and shelf label visible in list
- [ ] Tool count shown per bin
- [ ] Requester sees only tools assigned to their dept
- [ ] Admin/staff can create new bin
- [ ] Form inputs retain focus while typing bin_code (ERR-001 check)
- [ ] Duplicate bin_code shows error
- [ ] Cannot set bin capacity below number of tools already in it
- [ ] Cannot assign more tools to a bin than its capacity

---

## 5. Requisitions

- [ ] Requester can submit a new requisition
- [ ] from_date in past -> error shown
- [ ] Requisition appears in list with "pending" status
- [ ] Requester sees only their own requisitions
- [ ] Head sees all pending requisitions for their dept
- [ ] Admin/staff can see all requisitions
- [ ] Head can approve with one click
- [ ] Head cannot approve their own requisition (error shown)
- [ ] HD002 cannot approve USR001 (E&I) requisition (403 or error shown)
- [ ] Head can reject with reason
- [ ] Rejecting without reason -> error shown, form stays open
- [ ] After rejection, requester sees rejection reason in list

---

## 6. Issuance

- [ ] Approved requisition appears in issuance queue for staff/admin
- [ ] Staff can issue approved tool -> stock decremented
- [ ] Tool `available_quantity` drops immediately after issue
- [ ] Calibration-due tool shows warning / cannot be issued
- [ ] Requester cannot see issuance queue (redirected or 403 shown)
- [ ] Issued tool appears in requester's "My Issuances"

---

## 7. Returns

- [ ] Staff can process return -> good condition
- [ ] Good return restores available_quantity
- [ ] Damaged return does NOT restore stock
- [ ] Missing/lost return does NOT restore stock
- [ ] Penalty shown after damage assessment
- [ ] Requester cannot process returns (UI hides or shows error)
- [ ] Partial return: return 1 of 2, status stays "issued"
- [ ] Full return: status changes to "returned"
- [ ] Cannot return an already-returned issuance

---

## 8. Calibration

- [ ] Tool with overdue calibration shows `calibration_due` status
- [ ] Overdue tool cannot be issued (issuance button disabled or error)
- [ ] Record new calibration -> next_due updated (today + freq_days)
- [ ] After recording, tool status returns to `active`
- [ ] Calibration history visible on tool detail page
- [ ] Calibration report accessible to maintenance
- [ ] Calibration report blocked for requester/head
- [ ] PDF certificate can be uploaded with calibration record

---

## 9. Damage / Loss

- [ ] Process "damaged" return -> stock not restored
- [ ] Process "missing" return -> stock not restored
- [ ] Damage assessment records penalty amount
- [ ] Tool `total_quantity` reduced after assessment
- [ ] Damage appears in damage report
- [ ] Cannot assess damage twice on same issuance (error shown)

---

## 10. Reports

- [ ] Admin can access all 7 report types:
  - [ ] Issuance history
  - [ ] Returns
  - [ ] Stock status
  - [ ] Overdue tools
  - [ ] Calibration
  - [ ] Damage/loss
  - [ ] Financial summary
- [ ] Reports show correct totals (check for â‚¹0 bug N/A ERR-002)
- [ ] CSV export button downloads a file
- [ ] Downloaded CSV opens in Excel/Sheets correctly
- [ ] Requester sees "unauthorized" when navigating to /reports
- [ ] Head sees "unauthorized" when navigating to /reports

---

## 11. Notifications

- [ ] After submitting a requisition, head receives notification
- [ ] After approval, requester receives notification
- [ ] After good return, admin + head receive notification
- [ ] After adding a tool, admin receives notification
- [ ] Notifications are user-scoped (USR001 cannot see HD001's)
- [ ] Mark notification as read -> read indicator updates
- [ ] Max 50 notifications shown at once

---

## 12. User Management (Admin only)

- [ ] Admin can create a new user (all 4 roles)
- [ ] Non-admin cannot access /users (redirect or 403)
- [ ] Duplicate employee ID shows error
- [ ] Duplicate email shows error
- [ ] Admin can change a user's role
- [ ] Admin can deactivate a user
- [ ] Deactivated user cannot log in
- [ ] Admin can reactivate user
- [ ] Admin cannot deactivate themselves
- [ ] Cannot deactivate the last active admin

---

## 13. Mobile / Responsive

Test at 375px (iPhone SE), 768px (tablet), 1024px (desktop).

- [ ] Login page: form centered, all fields visible, no horizontal scroll
- [ ] Dashboard: cards stack vertically on mobile
- [ ] Tools: list/grid readable, search input usable
- [ ] Requisitions: status badges visible, not cut
- [ ] Navigation menu: hamburger or drawer on mobile
- [ ] Long tool names do not overflow cards (ERR-008 check)
- [ ] Notification dropdown not cut off on mobile
- [ ] Forms: all labels visible above inputs on mobile

---

## 14. Non-Automatable Scenarios

These require manual verification with real infrastructure:

| Scenario | How to test |
|----------|------------|
| OTP delivery via SMS | Trigger access request with real mobile number, confirm SMS received |
| Password reset email | Trigger forgot password with real email, confirm email received |
| PDF calibration certificate upload | Upload a PDF file, confirm it saves and is retrievable |
| Browser push notifications | Grant permission, trigger event, confirm notification appears in OS |
| Print report formatting | Click print on any report, check print preview for correct layout |
| WebSocket real-time updates | Open dashboard in two browser tabs, create requisition, check if second tab updates (if implemented) |

---

## Sign-off

| Tester | Date | Environment | Pass/Fail |
|--------|------|-------------|----------|
| | | | |
| | | | |

