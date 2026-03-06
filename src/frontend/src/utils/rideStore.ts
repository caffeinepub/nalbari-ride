/**
 * rideStore.ts
 *
 * localStorage-backed primary data store for Nalbari Ride.
 * All ride and rider state lives here. Backend calls are secondary / optional.
 *
 * Keys:
 *   nr_customers  → Record<phone, StoredCustomer>
 *   nr_riders     → Record<phone, StoredRider>
 *   nr_rides      → Record<id, StoredRide>
 *   nr_next_ride_id → number
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoredCustomer {
  phone: string;
  name: string;
  password: string;
  role: "customer";
  createdAt: number;
}

export interface StoredRider {
  phone: string;
  name: string;
  password: string;
  bikeNumber: string;
  licenceNumber: string;
  aadhaarNumber: string;
  verificationStatus: "pending" | "approved" | "rejected";
  accountStatus: "active" | "suspended";
  isOnline: boolean;
  totalEarnings: number;
  aadhaarImage: string;
  licencePhoto: string;
  bikePhoto: string;
  selfiePhoto: string;
  createdAt: number;
}

export interface StoredRide {
  id: string;
  customerPhone: string;
  customerName: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  riderBikeNumber: string;
  pickup: string;
  drop: string;
  distanceKm: number;
  fare: number;
  status: "searching" | "accepted" | "in_progress" | "completed" | "cancelled";
  startCode: string;
  createdAt: number;
}

export interface AdminStats {
  totalRiders: number;
  activeRiders: number;
  suspendedRiders: number;
  pendingRiders: number;
  totalRides: number;
  completedRides: number;
  totalEarnings: number;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const KEY_CUSTOMERS = "nr_customers";
const KEY_RIDERS = "nr_riders";
const KEY_RIDES = "nr_rides";
const KEY_NEXT_RIDE_ID = "nr_next_ride_id";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — best effort
  }
}

function getCustomers(): Record<string, StoredCustomer> {
  return load<Record<string, StoredCustomer>>(KEY_CUSTOMERS, {});
}

function getRiders(): Record<string, StoredRider> {
  return load<Record<string, StoredRider>>(KEY_RIDERS, {});
}

function getRides(): Record<string, StoredRide> {
  return load<Record<string, StoredRide>>(KEY_RIDES, {});
}

function nextRideId(): string {
  const current = load<number>(KEY_NEXT_RIDE_ID, 1);
  save(KEY_NEXT_RIDE_ID, current + 1);
  return `RIDE${String(current).padStart(4, "0")}`;
}

// ─── Fare calculation ─────────────────────────────────────────────────────────

/** Fare = ₹10 for first 3 km, then ₹5/km after */
export function calcFareAmount(distanceKm: number): number {
  if (distanceKm <= 3) return 10;
  return 10 + Math.round((distanceKm - 3) * 5);
}

function randomDistance(): number {
  // Random distance between 3 and 8 km for text-based addresses
  return Math.round((3 + Math.random() * 5) * 10) / 10;
}

// ─── Customer registration / login ────────────────────────────────────────────

export function registerCustomer(
  name: string,
  phone: string,
  password: string,
): { ok: true } | { error: string } {
  const customers = getCustomers();
  const riders = getRiders();

  if (customers[phone]) {
    return { error: "Phone number already registered as customer." };
  }
  if (riders[phone]) {
    return { error: "Phone number already registered as rider." };
  }
  if (!name.trim() || !phone.trim() || !password.trim()) {
    return { error: "All fields are required." };
  }

  const customer: StoredCustomer = {
    phone,
    name: name.trim(),
    password: password.trim(),
    role: "customer",
    createdAt: Date.now(),
  };
  customers[phone] = customer;
  save(KEY_CUSTOMERS, customers);
  return { ok: true };
}

export function loginCustomer(
  phone: string,
  password: string,
): StoredCustomer | null {
  const customers = getCustomers();
  const c = customers[phone];
  if (!c) return null;
  if (c.password !== password.trim()) return null;
  return c;
}

// ─── Rider registration / login ───────────────────────────────────────────────

export function registerRider(
  name: string,
  phone: string,
  password: string,
  bikeNumber: string,
  licenceNumber: string,
  aadhaarNumber: string,
  aadhaarImage: string,
  licencePhoto: string,
  bikePhoto: string,
  selfiePhoto: string,
): { ok: true } | { error: string } {
  const customers = getCustomers();
  const riders = getRiders();

  if (customers[phone]) {
    return { error: "Phone number already registered as customer." };
  }
  if (riders[phone]) {
    return { error: "Phone number already registered as rider." };
  }
  if (!name.trim() || !phone.trim() || !password.trim()) {
    return { error: "All fields are required." };
  }

  const rider: StoredRider = {
    phone,
    name: name.trim(),
    password: password.trim(),
    bikeNumber: bikeNumber.trim(),
    licenceNumber: licenceNumber.trim(),
    aadhaarNumber: aadhaarNumber.trim(),
    verificationStatus: "pending",
    accountStatus: "active",
    isOnline: false,
    totalEarnings: 0,
    aadhaarImage,
    licencePhoto,
    bikePhoto,
    selfiePhoto,
    createdAt: Date.now(),
  };
  riders[phone] = rider;
  save(KEY_RIDERS, riders);
  return { ok: true };
}

export function loginRider(
  phone: string,
  password: string,
): StoredRider | null {
  const riders = getRiders();
  const r = riders[phone];
  if (!r) return null;
  if (r.password !== password.trim()) return null;
  return r;
}

// ─── Password reset ───────────────────────────────────────────────────────────

export function resetPassword(phone: string, newPassword: string): boolean {
  const customers = getCustomers();
  const riders = getRiders();

  if (customers[phone]) {
    customers[phone].password = newPassword.trim();
    save(KEY_CUSTOMERS, customers);
    return true;
  }
  if (riders[phone]) {
    riders[phone].password = newPassword.trim();
    save(KEY_RIDERS, riders);
    return true;
  }
  return false;
}

// ─── Rider profile helpers ────────────────────────────────────────────────────

export function getRider(phone: string): StoredRider | null {
  const riders = getRiders();
  return riders[phone] ?? null;
}

export function updateRiderOnlineStatus(
  phone: string,
  isOnline: boolean,
): void {
  const riders = getRiders();
  if (riders[phone]) {
    riders[phone].isOnline = isOnline;
    save(KEY_RIDERS, riders);
  }
}

// ─── Rides ────────────────────────────────────────────────────────────────────

export function createRide(
  customerPhone: string,
  customerName: string,
  pickup: string,
  drop: string,
): StoredRide {
  const id = nextRideId();
  const distanceKm = randomDistance();
  const fare = calcFareAmount(distanceKm);

  const ride: StoredRide = {
    id,
    customerPhone,
    customerName,
    riderId: "",
    riderName: "",
    riderPhone: "",
    riderBikeNumber: "",
    pickup,
    drop,
    distanceKm,
    fare,
    status: "searching",
    startCode: "",
    createdAt: Date.now(),
  };

  const rides = getRides();
  rides[id] = ride;
  save(KEY_RIDES, rides);
  return ride;
}

export function getActiveRideForCustomer(
  customerPhone: string,
): StoredRide | null {
  const rides = getRides();
  const active = Object.values(rides)
    .filter(
      (r) =>
        r.customerPhone === customerPhone &&
        r.status !== "completed" &&
        r.status !== "cancelled",
    )
    .sort((a, b) => b.createdAt - a.createdAt);
  return active[0] ?? null;
}

export function getActiveRideForRider(riderPhone: string): StoredRide | null {
  const rides = getRides();
  const active = Object.values(rides)
    .filter(
      (r) =>
        r.riderPhone === riderPhone &&
        r.status !== "completed" &&
        r.status !== "cancelled",
    )
    .sort((a, b) => b.createdAt - a.createdAt);
  return active[0] ?? null;
}

export function getPendingRides(): StoredRide[] {
  const rides = getRides();
  return Object.values(rides)
    .filter((r) => r.status === "searching")
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function acceptRide(
  rideId: string,
  riderPhone: string,
): { ok: true; startCode: string } | { error: string } {
  const rides = getRides();
  const ride = rides[rideId];
  if (!ride) return { error: "Ride not found." };
  if (ride.status !== "searching")
    return { error: "Ride is no longer available." };

  const rider = getRider(riderPhone);
  if (!rider) return { error: "Rider profile not found." };
  if (rider.verificationStatus !== "approved") {
    return {
      error: "Your account must be approved by admin before accepting rides.",
    };
  }
  if (rider.accountStatus === "suspended") {
    return { error: "Your account has been suspended." };
  }

  const code = String(Math.floor(1000 + Math.random() * 9000));

  rides[rideId] = {
    ...ride,
    status: "accepted",
    riderPhone,
    riderName: rider.name,
    riderBikeNumber: rider.bikeNumber,
    riderId: riderPhone,
    startCode: code,
  };
  save(KEY_RIDES, rides);
  return { ok: true, startCode: code };
}

export function startRide(
  rideId: string,
  code: string,
): { ok: true } | { error: string } {
  const rides = getRides();
  const ride = rides[rideId];
  if (!ride) return { error: "Ride not found." };
  if (ride.status !== "accepted")
    return { error: "Ride is not in accepted state." };

  if (ride.startCode !== code.trim()) {
    return { error: "Invalid ride start code" };
  }

  rides[rideId] = { ...ride, status: "in_progress" };
  save(KEY_RIDES, rides);
  return { ok: true };
}

export function completeRide(rideId: string): void {
  const rides = getRides();
  const ride = rides[rideId];
  if (!ride) return;

  rides[rideId] = { ...ride, status: "completed" };
  save(KEY_RIDES, rides);

  // Add fare to rider earnings
  if (ride.riderPhone) {
    const riders = getRiders();
    if (riders[ride.riderPhone]) {
      riders[ride.riderPhone].totalEarnings += ride.fare;
      save(KEY_RIDERS, riders);
    }
  }
}

export function cancelRide(rideId: string): void {
  const rides = getRides();
  const ride = rides[rideId];
  if (!ride) return;
  rides[rideId] = { ...ride, status: "cancelled" };
  save(KEY_RIDES, rides);
}

// ─── Admin operations ─────────────────────────────────────────────────────────

export function getAllRiders(): StoredRider[] {
  return Object.values(getRiders()).sort((a, b) => b.createdAt - a.createdAt);
}

export function getAllRides(): StoredRide[] {
  return Object.values(getRides()).sort((a, b) => b.createdAt - a.createdAt);
}

export function approveRider(phone: string): void {
  const riders = getRiders();
  if (riders[phone]) {
    riders[phone].verificationStatus = "approved";
    save(KEY_RIDERS, riders);
  }
}

export function rejectRider(phone: string): void {
  const riders = getRiders();
  if (riders[phone]) {
    riders[phone].verificationStatus = "rejected";
    save(KEY_RIDERS, riders);
  }
}

export function suspendRider(phone: string): void {
  const riders = getRiders();
  if (riders[phone]) {
    riders[phone].accountStatus = "suspended";
    riders[phone].isOnline = false;
    save(KEY_RIDERS, riders);
  }
}

export function activateRider(phone: string): void {
  const riders = getRiders();
  if (riders[phone]) {
    riders[phone].accountStatus = "active";
    save(KEY_RIDERS, riders);
  }
}

export function getAdminStats(): AdminStats {
  const riders = getAllRiders();
  const rides = getAllRides();
  return {
    totalRiders: riders.length,
    activeRiders: riders.filter((r) => r.accountStatus === "active").length,
    suspendedRiders: riders.filter((r) => r.accountStatus === "suspended")
      .length,
    pendingRiders: riders.filter((r) => r.verificationStatus === "pending")
      .length,
    totalRides: rides.length,
    completedRides: rides.filter((r) => r.status === "completed").length,
    totalEarnings: rides
      .filter((r) => r.status === "completed")
      .reduce((sum, r) => sum + r.fare, 0),
  };
}

// ─── Migrate old localStorage data ───────────────────────────────────────────
// If a rider registered with the old rider_reg_<phone> key, import it.

export function migrateOldRiderData(): void {
  try {
    const riders = getRiders();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("rider_reg_")) {
        const phone = key.replace("rider_reg_", "");
        if (!riders[phone]) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const data = JSON.parse(raw) as {
              name?: string;
              phone?: string;
              licenceNumber?: string;
              aadhaarNumber?: string;
              bikeNumber?: string;
              aadhaarImage?: string;
              licencePhoto?: string;
              bikePhoto?: string;
              selfiePhoto?: string;
            };
            if (data.name && data.phone) {
              riders[phone] = {
                phone: data.phone,
                name: data.name,
                password: data.phone.slice(-4), // use last 4 digits as temp password
                bikeNumber: data.bikeNumber ?? "",
                licenceNumber: data.licenceNumber ?? "",
                aadhaarNumber: data.aadhaarNumber ?? "",
                verificationStatus: "pending",
                accountStatus: "active",
                isOnline: false,
                totalEarnings: 0,
                aadhaarImage: data.aadhaarImage ?? "",
                licencePhoto: data.licencePhoto ?? "",
                bikePhoto: data.bikePhoto ?? "",
                selfiePhoto: data.selfiePhoto ?? "",
                createdAt: Date.now(),
              };
            }
          }
        }
      }
    }
    save(KEY_RIDERS, riders);
  } catch {
    // ignore migration errors
  }
}
