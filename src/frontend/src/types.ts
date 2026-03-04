export type UserRole = "customer" | "rider";

export type Screen =
  | "role_select"
  | "register"
  | "login"
  | "customer_home"
  | "customer_ride_status"
  | "rider_home"
  | "rider_requests"
  | "rider_in_progress"
  | "rider_completed";

export interface StoredUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
}

export const FIXED_FARE = 60n;
export const BIKE_NUMBER = "AS-01-AB-1234";
