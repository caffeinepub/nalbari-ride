import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Time "mo:core/Time";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";

actor {
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

  module User {
    public func compare(user1 : User, user2 : User) : Order.Order {
      Nat.compare(user1.id, user2.id);
    };
  };

  module Ride {
    public func compare(ride1 : Ride, ride2 : Ride) : Order.Order {
      Nat.compare(ride1.id, ride2.id);
    };
  };

  module RiderProfile {
    public func compare(profile1 : RiderProfile, profile2 : RiderProfile) : Order.Order {
      Text.compare(profile1.phone, profile2.phone);
    };
  };

  var nextUserId = 1;
  var nextRideId = 1;

  let users = Map.empty<Text, User>();
  let rides = Map.empty<Nat, Ride>();
  let riderProfiles = Map.empty<Text, RiderProfile>();

  // User Functions
  public shared ({ caller }) func registerUser(name : Text, phone : Text, password : Text, role : Text) : async Text {
    switch (users.get(phone)) {
      case (null) {
        let user : User = {
          id = nextUserId;
          name;
          phone;
          password;
          role;
        };
        users.add(phone, user);
        nextUserId += 1;
        "ok";
      };
      case (?_) { Runtime.trap("Phone number already registered") };
    };
  };

  public query ({ caller }) func loginUser(phone : Text, password : Text) : async ?User {
    switch (users.get(phone)) {
      case (null) { null };
      case (?user) {
        if (user.password == password) {
          ?user;
        } else {
          null;
        };
      };
    };
  };

  // Ride Functions
  public shared ({ caller }) func createRide(customerPhone : Text, customerName : Text, pickup : Text, drop : Text, fare : Nat) : async Ride {
    let ride : Ride = {
      id = nextRideId;
      customerPhone;
      customerName;
      pickup;
      drop;
      fare;
      status = "pending";
      driverName = null;
      driverPhone = null;
      bikeNumber = null;
      createdAt = Time.now();
    };
    rides.add(nextRideId, ride);
    nextRideId += 1;
    ride;
  };

  public query ({ caller }) func getPendingRides() : async [Ride] {
    rides.values().toArray().filter(func(ride) { ride.status == "pending" });
  };

  public shared ({ caller }) func acceptRide(rideId : Nat, driverPhone : Text, driverName : Text, bikeNumber : Text) : async Text {
    switch (rides.get(rideId)) {
      case (null) { Runtime.trap("Ride not found") };
      case (?ride) {
        if (ride.status != "pending") {
          Runtime.trap("Ride is not available for acceptance");
        } else {
          let updatedRide : Ride = {
            id = ride.id;
            customerPhone = ride.customerPhone;
            customerName = ride.customerName;
            pickup = ride.pickup;
            drop = ride.drop;
            fare = ride.fare;
            status = "accepted";
            driverName = ?driverName;
            driverPhone = ?driverPhone;
            bikeNumber = ?bikeNumber;
            createdAt = ride.createdAt;
          };
          rides.add(rideId, updatedRide);
          "ok";
        };
      };
    };
  };

  public shared ({ caller }) func completeRide(rideId : Nat, driverPhone : Text) : async Text {
    switch (rides.get(rideId)) {
      case (null) { Runtime.trap("Ride not found") };
      case (?ride) {
        if (ride.status != "accepted") {
          Runtime.trap("Ride is not in progress");
        } else {
          let updatedRide : Ride = {
            id = ride.id;
            customerPhone = ride.customerPhone;
            customerName = ride.customerName;
            pickup = ride.pickup;
            drop = ride.drop;
            fare = ride.fare;
            status = "completed";
            driverName = ride.driverName;
            driverPhone = ride.driverPhone;
            bikeNumber = ride.bikeNumber;
            createdAt = ride.createdAt;
          };
          rides.add(rideId, updatedRide);

          // update rider earnings
          switch (riderProfiles.get(driverPhone)) {
            case (null) { Runtime.trap("Rider profile not found") };
            case (?riderProfile) {
              let updatedProfile : RiderProfile = {
                phone = riderProfile.phone;
                name = riderProfile.name;
                status = riderProfile.status;
                totalEarnings = riderProfile.totalEarnings + ride.fare;
              };
              riderProfiles.add(driverPhone, updatedProfile);
              "ok";
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func cancelRide(rideId : Nat) : async Text {
    switch (rides.get(rideId)) {
      case (null) { Runtime.trap("Ride not found") };
      case (?ride) {
        let updatedRide : Ride = {
          id = ride.id;
          customerPhone = ride.customerPhone;
          customerName = ride.customerName;
          pickup = ride.pickup;
          drop = ride.drop;
          fare = ride.fare;
          status = "cancelled";
          driverName = ride.driverName;
          driverPhone = ride.driverPhone;
          bikeNumber = ride.bikeNumber;
          createdAt = ride.createdAt;
        };
        rides.add(rideId, updatedRide);
        "ok";
      };
    };
  };

  public query ({ caller }) func getRideById(rideId : Nat) : async ?Ride {
    rides.get(rideId);
  };

  public query ({ caller }) func getActiveRideForCustomer(customerPhone : Text) : async ?Ride {
    rides.values().find(
      func(ride) {
        ride.customerPhone == customerPhone and (
          ride.status == "pending" or ride.status == "accepted"
        );
      }
    );
  };

  public query ({ caller }) func getActiveRideForRider(driverPhone : Text) : async ?Ride {
    rides.values().find(
      func(ride) {
        switch (ride.driverPhone) {
          case (null) { false };
          case (?phone) { phone == driverPhone and ride.status == "accepted" };
        };
      }
    );
  };

  // Rider Functions
  public shared ({ caller }) func setRiderStatus(phone : Text, status : Text) : async Text {
    switch (riderProfiles.get(phone)) {
      case (null) { Runtime.trap("Rider profile not found") };
      case (?riderProfile) {
        let updatedProfile : RiderProfile = {
          phone = riderProfile.phone;
          name = riderProfile.name;
          status;
          totalEarnings = riderProfile.totalEarnings;
        };
        riderProfiles.add(phone, updatedProfile);
        "ok";
      };
    };
  };

  public shared ({ caller }) func getRiderProfile(phone : Text) : async RiderProfile {
    switch (riderProfiles.get(phone)) {
      case (null) {
        switch (users.get(phone)) {
          case (null) { Runtime.trap("User not found") };
          case (?user) {
            let newProfile : RiderProfile = {
              phone;
              name = user.name;
              status = "offline";
              totalEarnings = 0;
            };
            riderProfiles.add(phone, newProfile);
            newProfile;
          };
        };
      };
      case (?riderProfile) { riderProfile };
    };
  };
};
