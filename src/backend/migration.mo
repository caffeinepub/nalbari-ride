import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type User = {
    id : Nat;
    name : Text;
    phone : Text;
    password : Text;
    role : Text;
  };

  type Ride = {
    id : Nat;
    customerPhone : Text;
    customerName : Text;
    pickup : Text;
    drop : Text;
    fare : Nat;
    status : Text;
    driverName : ?Text;
    driverPhone : ?Text;
    bikeNumber : ?Text;
    createdAt : Int;
  };

  type RiderProfile = {
    phone : Text;
    name : Text;
    status : Text;
    totalEarnings : Nat;
  };

  type RiderDetails = {
    phone : Text;
    name : Text;
    licenceNumber : Text;
    aadhaarNumber : Text;
    bikeNumber : Text;
    accountStatus : Text;
    verificationStatus : Text;
  };

  type UserProfile = {
    name : Text;
    phone : Text;
    role : Text;
  };

  type RideCustomerRequest = {
    name : Text;
    phone : Text;
    source : Text;
    destination : Text;
  };

  type RideCustomerResponse = {
    requestId : Text;
    name : Text;
    phone : Text;
    source : Text;
    destination : Text;
    status : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  type Actor = {
    users : Map.Map<Text, User>;
    rides : Map.Map<Nat, Ride>;
    riderProfiles : Map.Map<Text, RiderProfile>;
    riderDetails : Map.Map<Text, RiderDetails>;
    userProfiles : Map.Map<Principal, UserProfile>;
    principalToPhone : Map.Map<Principal, Text>;
    nextUserId : Nat;
    nextRideId : Nat;
    demoCustomers : Map.Map<Text, RideCustomerRequest>;
  };

  public func run(old : Actor) : Actor {
    old;
  };
};
