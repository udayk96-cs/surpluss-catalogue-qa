1. No account lockout or rate limiting on login attempts

**What happens**

The login endpoint accepts unlimited incorrect email/password attempts with no lockout, delay, or CAPTCHA challenge. A user can retry indefinitely without any restriction.

**Steps to reproduce**

1. Navigate to the login page.
2. Enter a valid/known email address with an incorrect password.
3. Submit the login form and observe the "invalid credentials" error.
4. Repeat steps 2–3 more than 5–10 times in a row (manually or by replaying the request in DevTools/Burp).
5. Observe that the account is never locked, no CAPTCHA appears, and no delay is introduced between attempts.

**What should happen instead**

After 3–5 consecutive failed login attempts for the same account (and/or same IP), the system should:
- Temporarily lock the account for a defined cooldown period (e.g., 15–30 minutes), or require a CAPTCHA/step-up challenge before allowing further attempts.
- Display a message prompting the user to reset their password or contact the system admin for help.
- Optionally notify the account owner via email of the repeated failed attempts.

**Impact — how bad is this, and why?**

Medium severity. Without rate limiting or lockout, the login endpoint is vulnerable to brute-force and credential-stuffing attacks — an attacker can script unlimited password guesses against any known email address. This risks unauthorized account access, especially for users with weak passwords, and could lead to compromised customer accounts, fraudulent orders, or exposure of stored personal/payment data. All registered users are affected; the precondition is simply that the attacker knows or can enumerate a valid email address.

**Failing test**

Not Automated intentionally  - For reason , please visit Writeup.md. 
Not automated. I ran out of time and have limited experience testing login rate limiting. I would add a test for repeated failed login attempts next; see WRITEUP.md.





2. Staff user is able to publish catalogues - should be restricted to Admin only

**What happens**

Users with the `staff` role are able to publish a catalogue and make it live on the website . Publishing is intended to be an `admin`-only action, since it controls whether internal/draft pricing data becomes publicly exposed. Staff currently have unrestricted access to this action, bypassing the intended role separation.

**Steps to reproduce**

1. Log in as a user with the `staff` role.
2. Create or open a draft catalogue (staff are expected to have build/edit access to this).
3. Save the catalogue by selecting the Live option
4. Observe that the publish action succeeds and the catalogue goes live, accessible via its public URL.
5. Confirm this action does not check for `admin`-level role/permission before executing.

**What should happen instead**

The "Save Catalogue" action should be restricted to users with the `admin` role only. If a `staff` user attempts to publish (via UI or direct API call), the system should reject the action with an authorization error (e.g., 403 Forbidden) and the UI should not expose a publish control to staff at all. The same restriction should apply to the "Delete" catalogue action, per the intended role definitions.

**Impact — how bad is this, and why?**

Critical / Blocker. This is a broken access control issue: any `staff` user — a role intended only for building catalogues, managing products, and working leads — can unilaterally expose internal or draft pricing data to the public internet without admin review or approval. This can lead to premature or unauthorized disclosure of pricing, unapproved catalogues going live, and potential business/reputational harm, since there is no gate between "draft" and "public" states for a role that shouldn't have that authority. All catalogues and all staff-level accounts are affected; no special precondition is needed beyond having a `staff` login.

**Failing test**

Verify that staff user is not able to publish a product catalogue



---


3. Staff role can delete a product which is not part of published catalogue - should be restricted to Admin only

**What happens**

Users with the `staff` role are able to permanently delete a product from the shared product library. Product deletion is a destructive, admin-intended action — similar in risk to catalogue deletion — but is currently accessible to `staff`, who are only meant to create/manage products, not remove them outright.

**Steps to reproduce**

1. Log in as a user with the `staff` role.
2. Navigate to the product library/management screen.
3. Select any existing product (which is not part of published catalogue).
4. Trigger the "Delete" action on the product.
5. Observe that the deletion succeeds without any admin-role check or approval step.
6. Confirm the deleted product is no longer shown in the product library.

**What should happen instead**

Only users with the `admin` role should be able to permanently delete products. Staff should not see the Delete option, and the server action should reject deletion attempts from staff even if they bypass the UI. Staff can use the existing archive option for products that should be removed from active work. This finding concerns an unlisted product; products referenced by catalogues should remain protected from deletion.

**Impact — how bad is this, and why?**

Medium severity. This is broken access control over a permanent, destructive action. Because the product is not in a published catalogue, deleting it does not directly affect buyer-facing catalogues. However, it permanently removes the product record and its inventory details, so restoring it may require staff to recreate the product and its data. The issue affects unlisted products and can be triggered by any signed-in staff user with access to the product library.

**Failing test**

Validate that a staff user does not get an option to delete a product 

---


4. Catalogue with a future "valid until" date incorrectly shows "Expired" status on dashboard

**What happens**

When an admin publishes a new catalogue and sets a "valid until" date in the future, the catalogue dashboard incorrectly displays its status as "Expired," even though the catalogue is actually live and accessible via its public URL. When no Valid upto is set, the dashboard correctly shows "Live" status.

**Steps to reproduce**

1. Log in as admin and create a new catalogue.
2. Set the "valid upto" field to any future date (e.g., 30 days from today).
3. Publish the catalogue.
4. Open the admin dashboard and check the status shown for newly created catalogue.
5. Separately, open the catalogue's public URL directly and confirm it loads and is accessible.
6. Compare: dashboard shows "Expired," but the live URL is fully functional.

**What should happen instead**

If the "valid upto" date is in the future (or no expiry is set), the dashboard should display the catalogue status as "Live," matching the actual accessibility of the catalogue on its public URL. Status should only switch to "Expired" once the current date passes the "valid upto" date.

**Impact — how bad is this, and why?**

Low severity. The catalogue itself functions correctly and remains accessible to end users, so there's no customer-facing or revenue impact. However, it creates confusion for admins/internal users managing catalogues, since the dashboard status is misleading and could cause someone to mistakenly assume a live catalogue needs to be republished or is unavailable, wasting admin time or causing unnecessary follow-up actions.

**Failing test**
Validate that user is able to publish a catalogue and the status is Live on Catalogue Dashboard 

