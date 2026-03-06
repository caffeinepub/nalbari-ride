# Nalbari Ride

## Current State
Previous versions had recurring issues:
- Customer and rider registration/login failing due to backend principal-ownership checks blocking anonymous callers
- Admin panel showing "Stats unavailable" due to AccessControl role checks that password-based login can never satisfy
- Rider accept ride blocked by same principal checks
- 4-digit ride start code flow partially implemented but broken

## Requested Changes (Diff)

### Add
- Clean rebuild of all three panels: Customer App, Rider App, Admin Dashboard
- Customer registration (phone + password) and login
- Customer ride booking: pickup text + drop text, fare estimate (₹10 base for 3km, ₹5/km after)
- Ride status progression: Searching → Accepted → In Progress → Completed
- 4-digit ride start code: generated on acceptance, shown to customer, entered by rider at pickup
- Rider registration: Full Name, Phone, Password, Bike Number, Driving Licence, Aadhaar upload
- Rider online/offline toggle
- Rider accept/reject ride requests
- Rider enters customer code to start ride, End Ride button to complete
- Rider earnings tracker
- Rider verification status: Pending / Approved / Rejected (only Approved can go online)
- Admin dashboard with password login (password: Faye@9394200176)
- Admin: view all riders, approve/reject/suspend/activate riders, view Aadhaar image
- Admin: view all rides with status filters
- Admin: dashboard stats (total riders, active, suspended, total rides)
- Forgot password flow for customers and riders (not admin)
- Contact section: phone +91 9678784288, WhatsApp link
- Landing page with hero, how it works, services, booking form, features sections

### Modify
- All backend functions must work for anonymous callers (no AccessControl/principal ownership checks)
- Backend verifies identity by phone number only
- Admin data functions have no role checks — password check is done frontend-side

### Remove
- All hardcoded demo/seed customer and rider data
- All AccessControl role-based guards on data-reading and data-writing functions
- All principal-ownership checks that block anonymous ICP callers

## Implementation Plan
1. Write spec.md (this file)
2. Select blob-storage component for Aadhaar image uploads
3. Generate Motoko backend:
   - User/Customer CRUD (registerCustomer, loginCustomer, resetPassword)
   - Rider CRUD (registerRider, loginRider, updateRiderStatus, updateRiderVerification)
   - Ride CRUD (createRide, acceptRide, startRide with code, completeRide, getRides, getRideById)
   - Admin functions (getAllRiders, getAllRides, approveRider, rejectRider, suspendRider, activateRider, getAdminStats)
   - All functions accessible by anonymous principal
4. Build frontend:
   - Landing page (public)
   - Customer flow: register → login → book ride → track status → see code
   - Rider flow: register → pending screen → login → online/offline → accept ride → enter code → end ride → earnings
   - Admin flow: password login → dashboard stats → rider management → ride history → suspend/activate
5. Validate and deploy
