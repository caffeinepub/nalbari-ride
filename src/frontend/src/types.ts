export type UserRole = "customer" | "rider";

export type Screen =
  | "landing"
  | "role_select"
  | "register"
  | "login"
  | "forgot_password"
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

// Fare system: ₹10 base for first 3 km, then ₹5/km extra
// Formula: fare = 10 + max(0, distKm - 3) * 5
export const BASE_FARE_KM = 3;
export const BASE_FARE_COST = 10n;
export const EXTRA_FARE_PER_KM = 5n;

export function calcFare(distKm: number): bigint {
  if (distKm <= 3) return 10n;
  return 10n + BigInt(Math.round((distKm - 3) * 5));
}

// Default booking fare (assumes ~5 km trip): 10 + (5-3)*5 = ₹20
export const DEFAULT_FARE = 20n;
export const MIN_DISPLAY_FARE = "10";
export const MAX_DISPLAY_FARE = "35";

// Legacy aliases kept for backward compat (LandingPage uses some of these)
export const BASE_FARE = BASE_FARE_COST;
export const RATE_PER_KM = EXTRA_FARE_PER_KM;
export const MIN_FARE = BASE_FARE_COST;
export const MAX_FARE = 35n;
export const FIXED_FARE = DEFAULT_FARE;
export const BIKE_NUMBER = "AS-01-AB-1234";
