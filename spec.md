# Nalbari Ride

## Current State
New project. No existing screens or backend logic.

## Requested Changes (Diff)

### Add
- Role selection screen (Customer / Rider)
- Registration screen (name, phone, password, role)
- Login screen (phone + password, role-based redirect)
- Customer Home: pickup & drop text inputs, estimated fare preview, Book Ride button
- Customer Booking screen: show pickup, drop, fare, Confirm Ride button
- Customer Ride Confirmed screen: driver name, bike number, fare, Call Driver button (tel link)
- Rider Home: online/offline toggle, current earnings display, View Requests button
- Rider Ride Requests screen: list pending rides with pickup, drop, fare, Accept/Reject buttons
- Rider Ride In Progress screen: pickup/drop display, End Ride button, Call Customer button
- Rider Ride Completed screen: fare, star rating UI, Finish Ride button
- Fare calculation: Base fare 20 + distance (fixed 5 km for MVP) × 8 per km = Rs. 60

### Modify
- Nothing (new project)

### Remove
- Nothing

## Implementation Plan

### Backend (Motoko)
- User type: id, name, phone, passwordHash, role (customer | rider)
- Ride type: id, customerPhone, pickup, drop, fare, status (pending | accepted | completed | cancelled), driverName, driverPhone, bikeNumber, createdAt
- Rider type: phone, status (online | offline), totalEarnings

Functions:
- registerUser(name, phone, password, role) -> Result
- loginUser(phone, password) -> Result<User>
- createRide(customerPhone, pickup, drop, fare) -> Result<Ride>
- getPendingRides() -> [Ride]
- acceptRide(rideId, driverPhone, driverName, bikeNumber) -> Result
- completeRide(rideId) -> Result
- getRideById(rideId) -> ?Ride
- getRideByCustomer(phone) -> ?Ride
- setRiderStatus(phone, status) -> Result
- getRiderEarnings(phone) -> Nat
- addEarnings(phone, amount) -> Result

### Frontend
- React + Tailwind, mobile-first layout (max-width 430px centered)
- Pages: RoleSelect, Register, Login, CustomerHome, BookingConfirm, RideConfirmed, RiderHome, RideRequests, RideInProgress, RideCompleted
- State: currentUser stored in localStorage, currentRide polled from backend
- Polling every 3 seconds on ride status screens for real-time updates
