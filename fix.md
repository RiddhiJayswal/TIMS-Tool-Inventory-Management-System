The website UI/design is already good. Do not redesign or restyle anything. Keep the same layout, colors, sidebar, cards, tables, spacing, buttons, badges, modals, and page structure.

Now I want a complete bug-fix, sync verification, and manual testing workflow for the full Tool Inventory Management System.

Refer to the current website behavior/screenshots and inspect the full codebase before editing.

Main goal:
Every feature should use one centralized data source/store/database. Data should not be static or duplicated across tabs. All changes should update instantly everywhere across Admin, Maintenance Staff, Department Head, and Requester/User roles.

Fix and verify these issues:

1. Sign-in page Request Access is not working
   Problem:
   From the sign-in page, I submit a Request Access form, but the request does not appear in the Users tab.

Expected behavior:

* When someone submits Request Access from the sign-in page, it should create a pending user access request.
* That request should appear in the Admin Users page.
* Admin should be able to approve or reject the access request.
* If approved, a new user should be created or activated.
* If rejected, the request should show rejected status.
* The access request should not disappear after refresh if persistence/localStorage/database is used.

Check:

* Request Access form submit handler.
* Field mapping.
* User request state/store.
* Users tab data source.
* Whether Users tab is showing only users but not pending access requests.
* Whether access requests need a separate section/table/card in Users page.
* Whether the submitted data is saved in localStorage/store/database.

Required fields for access request:

* requestId
* name
* email/username
* employeeId if entered
* department
* requestedRole
* reason/notes if available
* status: Pending / Approved / Rejected
* createdAt
* approvedBy if approved
* approvedAt if approved

Users page should show:

* Existing active users.
* Pending access requests.
* Approved/rejected access request history if the UI supports it.

2. Demo user passwords and credentials
   Problem:
   I need to know the password of the second admin, second staff, second head, and second user that were added in the database/seed data.

Task:

* Inspect the actual seed/demo user database/store/auth file.
* List all demo users with:

  * name
  * username/email
  * role
  * department
  * password
* If passwords are currently inconsistent or missing, standardize them.

Expected demo users:

* 2 Admin users
* 2 Maintenance Staff users
* 2 Department Head users
* 2 Requester/User users

Recommended:
Use the same password for all demo users:
password123

But verify the actual stored values and return the final credentials clearly in the final output.

3. Notifications are static and text is not visible
   Problem:
   Notifications appear static and some notification text is not visible.

Expected behavior:
Notifications should be dynamic and generated from real system activity, such as:

* New access request submitted
* New tool request created
* Request approved
* Request rejected
* Tool issued
* Tool returned
* Tool overdue
* Calibration due/overdue
* Tool added/edited
* Storage bin added/updated

Fix:

* Remove static notification data.
* Generate notifications from centralized activity/events data.
* Or create notifications when actions happen.
* Notifications should be role-based:

  * Admin sees system-wide notifications.
  * Maintenance Staff sees issue/return/calibration/bin notifications.
  * Department Head sees department request/approval notifications.
  * Requester/User sees their own request/issue/return notifications.
* Notification count should update dynamically.
* Notification text should be fully readable.
* Fix CSS/layout issue causing hidden text.
* Add proper empty state: “No notifications”.
* No notification should show undefined, null, [object Object], or broken blank text.

4. Storage Bin Add Bin form typing bug
   Problem:
   In the Add Bin form, for every word/letter I type, I need to click/select the field again and again. The input loses focus while typing.

Expected behavior:

* User should click a field once and type full text normally.
* Input should not lose focus on each keypress.
* Form should not re-render/remount the input every time the state changes.
* Text fields should accept full words and sentences.

Likely causes to check:

* Component key changes on each render.
* Modal/form component defined inside parent render.
* Form state reset on each keystroke.
* Controlled input value bound incorrectly.
* onChange replacing the whole form incorrectly.
* Conditional rendering remounts the form.
* Random ID/key generated during render.
* setState causing the active input to unmount.
* autoFocus or focus logic stealing focus.

Fix this for:

* Add Storage Bin
* Edit Storage Bin
* Add item/tool inside bin
* Add Tool
* Edit Tool
* Any other form with same behavior

5. Add New Tool form has same typing/focus problem
   Problem:
   While adding a new tool, the same issue occurs as Add Storage Bin. The input field loses focus or does not allow smooth typing.

Fix:

* Apply the same form stability fix.
* Make sure Add Tool form accepts full text in:

  * tool name
  * tool code
  * category/type
  * description
  * notes
  * service partner
  * location/bin
  * any custom field
* Make sure numbers and dates work properly.
* Make sure value/unit cost is saved correctly.
* No object.object / [object Object] should appear.

6. Reports and Calibration data mismatch
   Problem:
   Reports and Calibration seem to have different data. They may not be using the same tool records.

Expected behavior:
Reports and Calibration must both use the same centralized tool data and calibration records.

Check:

* Reports page data source.
* Calibration page data source.
* Whether Reports uses dummy/static tools.
* Whether Calibration uses separate dummy/static tools.
* Whether calibration records are linked by toolId.
* Whether tool name/code/status is coming from the same tools list.
* Whether calibration status in Reports matches Calibration page.

Fix:

* Reports should be calculated from actual tools, issue transactions, return transactions, storage bins, and calibration records.
* Calibration should be linked to actual tools by toolId.
* If calibration due/overdue is updated, Reports must update instantly.
* If a tool is added/edited, both Reports and Calibration should reflect the same tool where relevant.
* No duplicate disconnected data arrays.

7. Reports money/value verification
   Also verify the earlier Reports issue:

* Current Value should not show Rs. 0 unless the actual value is zero.
* Tool value/unit cost should be saved from Add/Edit Tool.
* Reports should calculate value from actual tool data.
* Use numeric value in state/database and format only in UI.
* Example:
  currentValue = availableQuantity * unitCost
  totalValue = totalQuantity * unitCost
  issuedValue = issuedQuantity * unitCost
* If value is missing, show “Not set”, not Rs. 0.

8. Full website sync check
   Check that everything is synced across all tabs:

* Dashboard
* My Requests
* Approvals
* Tools
* Issue Tool
* Returns
* Reports
* Calibration
* Storage Bins
* Users
* Notifications
* Sign-in Request Access

All pages should use centralized data for:

* users
* accessRequests
* tools
* departments
* requests
* approvals
* issueTransactions
* returnTransactions
* reports
* calibrationRecords
* storageBins
* notifications/activityLog

Do not allow disconnected/static data like:

* dummyReports
* staticNotifications
* dummyCalibration
* staticTools
* staticUsers
* dummyRequests
* roleBasedFakeStats
* separate arrays for the same entity in different pages

9. Form global check
   Check every form in the website.

Forms to verify:

* Sign-in Request Access
* Add User
* Edit User
* Add Tool
* Edit Tool
* Issue Tool
* Return Tool
* Create Request
* Approve Request
* Reject Request
* Add Calibration
* Update Calibration
* Add Storage Bin
* Edit Storage Bin
* Add item/tool inside bin
* Search/filter fields
* Notification actions if any

Every form must:

* Accept full text normally.
* Keep focus while typing.
* Not require clicking the field again after every word/letter.
* Save complete values.
* Not reset while typing.
* Validate required fields.
* Show readable validation messages.
* Not show [object Object], object.object, undefined, null, or NaN.
* Persist after refresh if persistence exists.
* Update all related pages instantly.

10. Role-based sync
    Verify with all user types:

Admin:

* Sees and manages everything.
* Sees access requests in Users tab.
* Can approve/reject access requests.
* Sees global dashboard, reports, notifications.

Maintenance Staff:

* Can issue tools.
* Can return tools.
* Can manage calibration and storage bins.
* Sees operational notifications.
* Should not see admin-only user permission actions unless intended.

Department Head:

* Sees department requests.
* Can approve/reject only department requests.
* Dashboard should show department-level data with clear labels.
* Notifications should be department-specific.

Requester/User:

* Can create requests.
* Can see own requests.
* Can return/request return own issued tools.
* Notifications should show own request/issue/return updates only.

11. Manual testing workflow required
    After fixing, provide a clear step-by-step manual testing workflow for the whole website.

The testing workflow should cover:

* Login with each demo user role
* Request Access from sign-in page
* Admin approval/rejection of access request
* Create tool
* Edit tool
* Add tool value/unit cost
* Add storage bin
* Add item/tool inside bin
* Create request
* Approve request
* Reject request
* Issue tool
* Return tool
* Check Dashboard updates
* Check Reports updates
* Check Calibration updates
* Check Notifications updates
* Check role-based permissions
* Refresh page and confirm data persists

12. Final output required
    After completing fixes, provide:

* List of all files changed.
* Final demo login credentials for all 8 users.
* Explain why Request Access was not showing in Users tab.
* Explain how Request Access now works.
* Explain why notifications were static and how they were made dynamic.
* Explain why notification text was not visible and how it was fixed.
* Explain why Add Bin/Add Tool inputs lost focus while typing.
* Explain how form typing/focus was fixed globally.
* Explain whether Reports and Calibration had separate data.
* Explain how Reports and Calibration are now synced.
* Explain how full cross-role sync works now.
* Provide the full manual testing workflow.
* Confirm no [object Object], undefined, null, NaN, broken blank values, or wrong Rs. 0 values appear.
* Confirm npm run dev works without errors.
