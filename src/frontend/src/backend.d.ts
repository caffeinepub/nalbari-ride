import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RiderDetails {
    licenceNumber: string;
    accountStatus: string;
    bikeNumber: string;
    name: string;
    aadhaarNumber: string;
    phone: string;
    verificationStatus: string;
}
export interface Ride {
    id: bigint;
    customerName: string;
    status: string;
    driverPhone?: string;
    customerPhone: string;
    drop: string;
    fare: bigint;
    bikeNumber?: string;
    createdAt: bigint;
    pickup: string;
    driverName?: string;
}
export interface RiderProfile {
    status: string;
    name: string;
    totalEarnings: bigint;
    phone: string;
}
export interface UserProfile {
    name: string;
    role: string;
    phone: string;
}
export interface User {
    id: bigint;
    password: string;
    name: string;
    role: string;
    phone: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptRide(rideId: bigint, driverPhone: string, driverName: string, bikeNumber: string): Promise<string>;
    activateRider(phone: string): Promise<string>;
    adminLogin(password: string): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelRide(rideId: bigint): Promise<string>;
    completeRide(rideId: bigint, driverPhone: string): Promise<string>;
    createRide(customerPhone: string, customerName: string, pickup: string, drop: string, fare: bigint): Promise<Ride>;
    getActiveRideForCustomer(customerPhone: string): Promise<Ride | null>;
    getActiveRideForRider(driverPhone: string): Promise<Ride | null>;
    getAllRiders(): Promise<Array<RiderDetails>>;
    getAllRides(): Promise<Array<Ride>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPendingRides(): Promise<Array<Ride>>;
    getRideById(rideId: bigint): Promise<Ride | null>;
    getRiderDetails(phone: string): Promise<RiderDetails | null>;
    getRiderProfile(phone: string): Promise<RiderProfile>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    loginUser(phone: string, password: string): Promise<User | null>;
    registerRider(phone: string, name: string, licenceNumber: string, aadhaarNumber: string, bikeNumber: string): Promise<string>;
    registerUser(name: string, phone: string, password: string, role: string): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setRiderStatus(phone: string, status: string): Promise<string>;
    suspendRider(phone: string): Promise<string>;
    verifyRider(phone: string, verificationStatus: string): Promise<string>;
}
