# Nalbari Ride

## Current State
The app has a working ride booking platform with:
- Customer registration/login, ride booking, ride status tracking
- Rider registration with Aadhaar upload, go online/offline, accept rides, ride start code flow
- Admin dashboard with rider management, ride history, suspend/activate
- Password-based admin login (password: Faye@9394200176)
- Backend: Motoko with full ride lifecycle, rider verification, start code generation
- Frontend: 16 screens across Customer, Rider, and Admin flows

Known issues from conversation history:
- Admin dashboard shows "Stats unavailable" due to AccessControl blocking anonymous callers
- Customers fail to book rides due to principal-phone ownership checks failing for anonymous users
- Riders fail to accept rides for the same reason
- All backend functions that should be reachable by logged-in (but anonymous-principal) users are gated by AccessControl.hasPermission checks that always fail

## Requested Changes (Diff)

### Add
- Complete rebuilt backend that removes all AccessControl permission checks from operational functions (rides, rider status, booking), keeping only password-verified admin operations
- Document upload support for: Aadhaar Card, Driving Licence, bike photo, rider selfie (stored as base64)
- Fare system: Base ₹10 for first 3 km, then ₹5/km extra (stored as configurable admin setting)
- Admin: change fare price setting
- Map integration: OpenStreetMap-based map with Leaflet.js showing pickup, destination, and route
- Ride status flow: Searching → Rider Accepted → Rider Arriving → Ride Started → Ride Completed
- Show nearby riders count on customer home
- Customer sees rider name, phone, bike number after acceptance
- Rider navigates to pickup using map link
- Admin can view all uploaded documents (Aadhaar, licence, bike photo, selfie)
- Admin fare price management
- Forgot password (phone-based reset, no email needed)
- Rider registration: collect licenceNumber, aadhaarNumber, bikeNumber + 4 document uploads

### Modify
- Backend: Remove AccessControl.hasPermission checks from createRide, acceptRide, startRideWithCode, completeRide, cancelRide, getPendingRides, getActiveRideForCustomer, getActiveRideForRider, setRiderStatus, getRiderProfile — use phone-based ownership checks only
- Backend: Remove AccessControl checks from getAllRiders, getAllRides (admin uses password auth, not principal auth)
- RiderDetails type: add licenceImage, bikePhoto, selfiePhoto fields
- Fare calculation: update to ₹10 base for 3 km + ₹5/km
- Admin dashboard: fix stats loading, show all 4 tabs working
- Customer booking: show estimated fare using correct formula
- Rider registration: 4 document upload fields

### Remove
- All AccessControl.hasPermission() guards from ride and rider operational functions
- principalToPhone ownership checks that block anonymous-principal callers
- Hard dependency on ICP identity for function access

## Implementation Plan
1. Rewrite backend main.mo:
   - Remove all AccessControl guards from operational functions
   - Keep only adminLogin for admin auth
   - Add licenceImage, bikePhoto, selfiePhoto to RiderDetails
   - Add uploadRiderDocument(phone, docType, imageData) function
   - Add baseFareKm, baseFareCost, extraFarePerKm variables + setFareConfig admin function
   - Add getFareConfig query
   - Keep rideStartCode generation logic
2. Update frontend:
   - Fix customer booking flow (remove principalToPhone dependency)
   - Fix rider accept/start/complete flow
   - Fix admin stats (direct getAllRiders/getAllRides calls work without permission check)
   - Rider registration form: 4 document upload fields with camera/gallery
   - Admin: document viewer for all 4 doc types
   - Admin: fare price settings panel
   - Map: Leaflet.js embedded map for pickup/drop selection and route display
   - Show correct fare formula throughout
   - Full ride status display (5 states)
