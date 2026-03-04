import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface User {
    id: bigint;
    password: string;
    name: string;
    role: string;
    phone: string;
}
export interface backendInterface {
    acceptRide(rideId: bigint, driverPhone: string, driverName: string, bikeNumber: string): Promise<string>;
    cancelRide(rideId: bigint): Promise<string>;
    completeRide(rideId: bigint, driverPhone: string): Promise<string>;
    createRide(customerPhone: string, customerName: string, pickup: string, drop: string, fare: bigint): Promise<Ride>;
    getActiveRideForCustomer(customerPhone: string): Promise<Ride | null>;
    getActiveRideForRider(driverPhone: string): Promise<Ride | null>;
    getPendingRides(): Promise<Array<Ride>>;
    getRideById(rideId: bigint): Promise<Ride | null>;
    getRiderProfile(phone: string): Promise<RiderProfile>;
    loginUser(phone: string, password: string): Promise<User | null>;
    registerUser(name: string, phone: string, password: string, role: string): Promise<string>;
    setRiderStatus(phone: string, status: string): Promise<string>;
}
