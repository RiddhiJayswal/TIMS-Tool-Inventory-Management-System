# TIMS Project Feature And Workflow Report

## 1. Project Overview

TIMS is a Tools Inventory Management System for plant maintenance teams. It manages tool master data, stock visibility, storage bins, requisitions, approvals, issue/return activity, calibration, damage/loss handling, notifications, users, access requests, and reports.

The purpose of the system is to keep maintenance tools traceable from request to issue, return, closure, and reporting. It reduces manual register work, keeps tool availability accurate, and gives each role a focused workflow.

Main user roles are Requester, Staff, Head, and Admin/Maintenance Admin.

## 2. User Roles

Requester: creates requisitions, views requestable tools, tracks their own requests, sees their issued tools, and receives notifications.

Staff: handles approved requisition queues, issues tools, processes returns, records partial and condition-based returns, and manages storage-bin workflows allowed to maintenance staff.

Head: reviews department requests, approves or rejects requisitions, and monitors department-scoped activity.

Admin/Maintenance Admin: manages tools, users, access requests, bins, calibration, reports, damage/loss handling, and system-wide inventory visibility.

## 3. Authentication Workflow

Login uses employee ID and password. On success, the backend returns a JWT access token and user profile. The frontend stores the token and user details locally, then reloads dashboard data for the signed-in role.

Session persistence uses the stored token and `/auth/me` to resume the user after refresh. Invalid or expired sessions are cleared and the user returns to Sign In.

Forgot password now accepts registered email only. The backend returns a generic response to avoid account enumeration, creates a short-lived reset token for active users, sends a reset link when SMTP is configured, and logs the link in development when SMTP is missing.

Password reset validates the token type, expiry, user, and current password hash. A successful reset changes the stored password hash immediately. The same reset token cannot be reused because it contains the previous password hash.

Request access collects name, employee ID, email, mobile number, department, requested role, reason, and password. The public role list excludes Admin. Mobile OTP must be sent and verified before the access request can be submitted.

Mobile OTP is stored hashed with expiry and attempt count. In development, the backend logs the OTP. Production can replace the log provider with a real SMS provider.

Admin approval converts a pending access request into an active user while preserving requested role and preventing email/employee ID overwrite.

## 4. Requester Dashboard Workflow

Requester dashboard cards show requestable tool counts, available tools, issued tools, overdue returns, and calibration visibility where allowed.

Requesters can view tools, search/filter tools, create requisitions with quantity, purpose, and required dates, then track pending, approved, issued, returned, completed, cancelled, or rejected status.

Issued tools are shown as the requester's active issuances. Return processing is handled by maintenance staff, while requesters can follow notifications and request status changes.

## 5. Staff Dashboard Workflow

Staff dashboard cards show operational tool, issuance, return, and queue data allowed to maintenance staff.

Staff can view approved requisition queues, issue tools, process returns, and handle partial returns. Mixed condition returns support good, damaged, and missing quantity breakdowns.

Damaged and missing workflows preserve stock consistency. Good returned quantities restore availability, while damaged/missing quantities stay unavailable until assessed or written off.

Tool availability reflects total, available, issued, reserved, and unavailable stock.

## 6. Head Dashboard Workflow

Head users see department-scoped tools, requests, pending approvals, and issued activity. They approve or reject department requests and provide rejection reasons where needed.

Approved requests reserve stock for issuance. Department visibility keeps unrelated department-specific tools and requests out of normal head workflows.

## 7. Admin Dashboard Workflow

Admin users manage the tool master, add/edit tools, define tool type, consumable/durable behavior, storage-bin assignment, calibration requirements, purchase/life data, and availability fields.

Admins manage users, access request approval/rejection, reports, activity export, stock/reservation logic, damage/loss handling, and last-admin protection.

Consumable tools reduce stock at issuance and complete immediately. Durable tools remain open until returned.

Storage bins track physical location, capacity, occupancy, and tool assignment.

Calibration workflows track due and overdue tools, record calibration, and update next due dates.

## 8. Tool Inventory Workflow

Adding a tool records code, name, category, type, quantity, status, bin, department access, and optional calibration/value fields.

Availability is calculated from total stock minus issued, reserved, unavailable, damaged, missing, or written-off quantities.

Reserved stock is created by approved requisitions before issuance. Issued stock is reduced when tools leave the store. Returned good stock becomes available again.

Damaged or missing stock stays unavailable until assessed or written off. Consumable stock is consumed during issuance and does not require return.

## 9. Requisition To Issuance Workflow

Request creation records tool, quantity, job purpose, from date, and to date.

Head/Admin approval validates availability and reserves stock. Staff issuance validates issue date windows, creates an issuance log, and updates stock.

Returns record quantity, condition, notes, and optional condition breakdowns. Requisitions close after full return or consumable completion.

## 10. Reports Workflow

Reports cover stock, utilization, issuance history, return history, overdue returns, damaged/missing penalties, calibration, depreciation, and activity logs.

Export behavior uses the report data currently visible to the role. Quantity consistency follows the same inventory calculations used by dashboard and stock reports.

## 11. Mobile/Desktop Responsiveness

The app uses a fixed sidebar/header shell with one main scroll area. The sidebar collapses on smaller screens.

Modals keep headers and footers visible while only their body areas scroll. All Tools and Bin detail modals are constrained to the viewport and have responsive padding.

## 12. Testing Summary

Backend tests cover login, forgot password by email, generic unregistered email response, valid reset, token reuse failure, expired token failure, OTP send/verify, access request submission/approval, dashboard summaries for every role, and access approval overwrite protection.

Frontend checks include Vite build, conflict-marker scanning, runtime JSX Babel compilation, served runtime file verification, login-page raw-error checks in normal and incognito contexts, role dashboard browser checks, All Tools modal visibility, Bin detail modal visibility, forgot email-only UI, and Request Access OTP UI fields.

Deployment verification now includes broad conflict-marker checks, backend Python compilation, frontend build, runtime JSX compilation, cache-busted screen loading, and no-store behavior for runtime JSX files.
