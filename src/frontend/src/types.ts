export type UserRole = "customer" | "rider";

export type Screen =
  | "landing"
  | "role_select"
  | "register"
  | "login"
  | "customer_home"
  | "customer_ride_status"
  | "rider_home"
  | "rider_requests"
  | "rider_in_progress"
  | "rider_completed"
  | "admin_login"
  | "admin_dashboard";

export interface StoredUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
}

export const BASE_FARE = 20n;
export const RATE_PER_KM = 3n; // Rs. 3 per km, 5-10km range = Rs. 35–50
export const MIN_FARE = 20n; // short distance minimum
export const MAX_FARE = 50n; // 10km max estimate
export const FIXED_FARE = 35n; // midpoint estimate for bookings
export const BIKE_NUMBER = "AS-01-AB-1234";
