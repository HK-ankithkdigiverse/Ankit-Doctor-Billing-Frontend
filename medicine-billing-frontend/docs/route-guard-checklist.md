# Route Guard Checklist

Use this checklist after auth/routing changes.

## Login and Access

1. Open a private URL directly while logged out (example: `/companies/123/edit`).
Expected: redirected to login.

2. Login + OTP from that flow.
Expected: redirected back to the same original private URL.

3. Open login page while already authenticated.
Expected: redirected to dashboard or pending redirect target.

## Session Expiry

1. Login and open any private page.
2. In browser dev tools, remove token or simulate expired token.
3. Trigger an API call (refresh page or click a data action).
Expected:
- redirected to login with session-expired notice,
- after login + OTP, returned to original page.

## Role Protection

1. Login as non-admin and open admin route (example: `/users`).
Expected: redirected to dashboard.

2. Login as admin and open `/users`.
Expected: page loads.

## Refresh Behavior

1. Open a deep private page (details/edit).
2. Refresh browser.
Expected: same page remains open if token is valid.

## Logout

1. Click logout from a private page.
Expected: token removed and redirected to login.

2. Use browser back button after logout.
Expected: cannot access private pages without login.

