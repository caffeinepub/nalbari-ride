# Nalbari Ride

## Current State
- Full customer and rider flow with login, register, ride booking, and admin panel.
- Backend has hardcoded demo customer data (`demoCustomers` map with 3 entries: John Doe, Jane Smith, Alice Johnson).
- LoginScreen and RegisterScreen exist but have no "Forgot Password" option.
- Admin login is separate and unaffected.

## Requested Changes (Diff)

### Add
- `resetPassword(phone, newPassword)` backend function: looks up user by phone, updates their password, returns "ok" or traps if not found.
- `ForgotPasswordScreen` frontend component: phone input → enter new password → confirm. Works for both customers and riders. Not accessible from the admin login screen.
- "Forgot password?" link on LoginScreen that navigates to ForgotPasswordScreen.
- New screen type `"forgot_password"` in the Screen type and App.tsx routing.

### Modify
- `main.mo`: Remove the `demoCustomers` map and `getDemoCustomers` function entirely.
- `LoginScreen.tsx`: Add a "Forgot password?" link below the password field.
- `App.tsx`: Add routing for `"forgot_password"` screen, passing role context so after reset the user returns to login.

### Remove
- Demo customer data (`demoCustomers` map with 3 hardcoded entries) from `main.mo`.
- `getDemoCustomers` public query function from `main.mo`.

## Implementation Plan
1. Update `main.mo`: remove demoCustomers map and getDemoCustomers, add `resetPassword` function.
2. Update frontend types to add `"forgot_password"` to the Screen union.
3. Create `ForgotPasswordScreen.tsx`.
4. Update `LoginScreen.tsx` to add "Forgot password?" link.
5. Update `App.tsx` to route to ForgotPasswordScreen.
