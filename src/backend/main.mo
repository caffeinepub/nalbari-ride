import Map "mo:core/Map";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Iter "mo:core/Iter";


// Apply state migration

actor {
  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  public type UserProfile = {
    name : Text;
    phone : Text;
    role : Text;
  };

  public type RideCustomerRequest = {
    name : Text;
    phone : Text;
    source : Text;
    destination : Text;
  };

  public type RideCustomerResponse = {
    requestId : Text;
    name : Text;
    phone : Text;
    source : Text;
    destination : Text;
    status : Text;
    createdAt : Int;
    updatedAt : Int;
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

  module RiderDetails {
    public func compare(details1 : RiderDetails, details2 : RiderDetails) : Order.Order {
      Text.compare(details1.phone, details2.phone);
    };
  };

  var nextUserId = 1;
  var nextRideId = 1;

  let users = Map.empty<Text, User>();
  let rides = Map.empty<Nat, Ride>();
  let riderProfiles = Map.empty<Text, RiderProfile>();
  let riderDetails = Map.empty<Text, RiderDetails>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let principalToPhone = Map.empty<Principal, Text>();
  let demoCustomers = Map.fromIter<Text, RideCustomerRequest>(
    ["1", "2", "3"].values().zip(
      [
        {
          name = "John Doe";
          phone = "8586045702";
          source = "Dumunighat";
          destination = "Nalbarichi flyover";
        },
        {
          name = "Jane Smith";
          phone = "1234567890";
          source = "Kanmuribari";
          destination = "Gopalthan";
        },
        {
          name = "Alice Johnson";
          phone = "9876543210";
          source = "J Park";
          destination = "Khutiapara";
        },
      ].values(),
    )
  );

  // ************************************
  // User Profile Functions (required by frontend)
  // ************************************

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
    principalToPhone.add(caller, profile.phone);
  };

  // ************************************
  // User Functions
  // ************************************

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

        let profile : UserProfile = {
          name;
          phone;
          role;
        };
        userProfiles.add(caller, profile);
        principalToPhone.add(caller, phone);
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
          if (user.role == "rider") {
            switch (riderDetails.get(phone)) {
              case (?details) {
                if (details.accountStatus == "suspended") {
                  return null;
                };
              };
              case (null) { return null };
            };
          };
          ?user;
        } else {
          null;
        };
      };
    };
  };

  public query ({ caller }) func adminLogin(password : Text) : async Bool {
    password == "Faye@9394200176";
  };

  // ************************************
  // Rider Registration and Management
  // ************************************

  public shared ({ caller }) func registerRider(
    phone : Text,
    name : Text,
    licenceNumber : Text,
    aadhaarNumber : Text,
    bikeNumber : Text,
  ) : async Text {
    switch (riderDetails.get(phone)) {
      case (null) {
        let details : RiderDetails = {
          phone;
          name;
          licenceNumber;
          aadhaarNumber;
          bikeNumber;
          accountStatus = "active";
          verificationStatus = "pending";
        };
        riderDetails.add(phone, details);
        "ok";
      };
      case (?_) { Runtime.trap("Rider already registered") };
    };
  };

  public query ({ caller }) func getAllRiders() : async [RiderDetails] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all riders");
    };
    riderDetails.values().toArray();
  };

  public shared ({ caller }) func suspendRider(phone : Text) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can suspend riders");
    };
    switch (riderDetails.get(phone)) {
      case (null) { Runtime.trap("Rider not found") };
      case (?details) {
        let updatedDetails : RiderDetails = {
          phone = details.phone;
          name = details.name;
          licenceNumber = details.licenceNumber;
          aadhaarNumber = details.aadhaarNumber;
          bikeNumber = details.bikeNumber;
          accountStatus = "suspended";
          verificationStatus = details.verificationStatus;
        };
        riderDetails.add(phone, updatedDetails);
        "ok";
      };
    };
  };

  public shared ({ caller }) func activateRider(phone : Text) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can activate riders");
    };
    switch (riderDetails.get(phone)) {
      case (null) { Runtime.trap("Rider not found") };
      case (?details) {
        let updatedDetails : RiderDetails = {
          phone = details.phone;
          name = details.name;
          licenceNumber = details.licenceNumber;
          aadhaarNumber = details.aadhaarNumber;
          bikeNumber = details.bikeNumber;
          accountStatus = "active";
          verificationStatus = details.verificationStatus;
        };
        riderDetails.add(phone, updatedDetails);
        "ok";
      };
    };
  };

  public shared ({ caller }) func verifyRider(phone : Text, verificationStatus : Text) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can verify riders");
    };
    if (verificationStatus != "approved" and verificationStatus != "rejected") {
      Runtime.trap("Invalid verification status");
    };
    switch (riderDetails.get(phone)) {
      case (null) { Runtime.trap("Rider not found") };
      case (?details) {
        let updatedDetails : RiderDetails = {
          phone = details.phone;
          name = details.name;
          licenceNumber = details.licenceNumber;
          aadhaarNumber = details.aadhaarNumber;
          bikeNumber = details.bikeNumber;
          accountStatus = details.accountStatus;
          verificationStatus;
        };
        riderDetails.add(phone, updatedDetails);
        "ok";
      };
    };
  };

  public query ({ caller }) func getRiderDetails(phone : Text) : async ?RiderDetails {
    riderDetails.get(phone);
  };

  // ************************************
  // Ride Management Functions
  // ************************************

  public shared ({ caller }) func createRide(customerPhone : Text, customerName : Text, pickup : Text, drop : Text, fare : Nat) : async Ride {
    switch (users.get(customerPhone)) {
      case (null) { Runtime.trap("Customer not found. Please register first.") };
      case (?_) {
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
    };
  };

  public query ({ caller }) func getPendingRides() : async [Ride] {
    let pendingRides = rides.values().toArray().filter(func(ride) { ride.status == "pending" });
    pendingRides.sort(
      func(a, b) {
        switch (Int.compare(b.createdAt, a.createdAt)) {
          case (#greater) { #greater };
          case (#less) { #less };
          case (#equal) { Nat.compare(b.id, a.id) };
        };
      }
    );
  };

  public shared ({ caller }) func acceptRide(rideId : Nat, driverPhone : Text, driverName : Text, bikeNumber : Text) : async Text {
    switch (riderDetails.get(driverPhone)) {
      case (null) { Runtime.trap("Rider not found") };
      case (?details) {
        if (details.accountStatus != "active") {
          Runtime.trap("Rider account is not active");
        };
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
    };
  };

  public shared ({ caller }) func completeRide(rideId : Nat, driverPhone : Text) : async Text {
    switch (rides.get(rideId)) {
      case (null) { Runtime.trap("Ride not found") };
      case (?ride) {
        switch (ride.driverPhone) {
          case (?rideDriverPhone) {
            if (rideDriverPhone != driverPhone) {
              Runtime.trap("This ride belongs to a different driver");
            };
          };
          case (null) { Runtime.trap("Ride has no assigned driver") };
        };
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

  public query ({ caller }) func getAllRides() : async [Ride] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all rides");
    };
    rides.values().toArray();
  };

  // ************************************
  // Rider Profile Functions
  // ************************************

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

  // ************************************
  // Demo Customer Functions
  // ************************************

  public query ({ caller }) func getDemoCustomers() : async [RideCustomerRequest] {
    demoCustomers.values().toArray();
  };
};

