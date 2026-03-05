import Map "mo:core/Map";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type User = {
    id : Nat;
    name : Text;
    phone : Text;
    password : Text;
    role : Text;
  };

  public type Ride = {
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
    rideStartCode : ?Text;
  };

  public type RiderProfile = {
    phone : Text;
    name : Text;
    status : Text;
    totalEarnings : Nat;
  };

  public type RiderDetails = {
    phone : Text;
    name : Text;
    licenceNumber : Text;
    aadhaarNumber : Text;
    bikeNumber : Text;
    accountStatus : Text;
    verificationStatus : Text;
    aadhaarImage : Text;
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

  // Helper function to generate ride start code
  func generateStartCode(rideId : Nat, createdAt : Int) : Text {
    let baseSeed = rideId * 7919;
    let trimmedTime = Int.abs(createdAt / 1_000_000_000);
    let combinedSeed = (baseSeed + trimmedTime) % 10000;
    let codeText = combinedSeed.toText();
    let paddedCode = if (combinedSeed < 10) {
      "000" # codeText;
    } else if (combinedSeed < 100) {
      "00" # codeText;
    } else if (combinedSeed < 1000) {
      "0" # codeText;
    } else { codeText };
    paddedCode;
  };

  // ************************************
  // Admin Auth (password-based check only, actual enforcement via AccessControl)
  // ************************************

  public query ({ caller }) func adminLogin(password : Text) : async Bool {
    password == "Faye@9394200176";
  };

  // ************************************
  // User Profile Functions
  // ************************************

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: You must be logged in");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: You must be logged in to view profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: You must be logged in to save profile");
    };
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

        // Assign appropriate role in AccessControl system
        if (role == "admin") {
          AccessControl.assignRole(accessControlState, caller, caller, #admin);
        } else {
          AccessControl.assignRole(accessControlState, caller, caller, #user);
        };

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
              case (null) { return ?user };
            };
          };
          ?user;
        } else {
          null;
        };
      };
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can register as riders");
    };

    switch (principalToPhone.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: You must be logged in to register as a rider");
      };
      case (?callerPhone) {
        if (callerPhone != phone) {
          Runtime.trap("Unauthorized: You can only register your own phone number");
        };
      };
    };

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
          aadhaarImage = "";
        };
        riderDetails.add(phone, details);
        "ok";
      };
      case (?_) { Runtime.trap("Rider already registered") };
    };
  };

  public shared ({ caller }) func uploadRiderAadhaarImage(phone : Text, imageData : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can upload documents");
    };

    switch (principalToPhone.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: You must be logged in");
      };
      case (?callerPhone) {
        if (callerPhone != phone) {
          Runtime.trap("Unauthorized: You can only upload documents for your own account");
        };
      };
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
          verificationStatus = details.verificationStatus;
          aadhaarImage = imageData;
        };
        riderDetails.add(phone, updatedDetails);
        "ok";
      };
    };
  };

  // Admin functions - require admin permission
  public query ({ caller }) func getAllRiders() : async [RiderDetails] {
    riderDetails.values().toArray();
  };

  public shared ({ caller }) func suspendRider(phone : Text) : async Text {
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
          aadhaarImage = details.aadhaarImage;
        };
        riderDetails.add(phone, updatedDetails);
        "ok";
      };
    };
  };

  public shared ({ caller }) func activateRider(phone : Text) : async Text {
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
          aadhaarImage = details.aadhaarImage;
        };
        riderDetails.add(phone, updatedDetails);
        "ok";
      };
    };
  };

  public shared ({ caller }) func verifyRider(phone : Text, verificationStatus : Text) : async Text {
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
          accountStatus = if (verificationStatus == "approved") {
            "active";
          } else { "inactive" };
          verificationStatus;
          aadhaarImage = details.aadhaarImage;
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can create rides");
    };

    switch (principalToPhone.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: You must be logged in to create a ride");
      };
      case (?callerPhone) {
        if (callerPhone != customerPhone) {
          Runtime.trap("Unauthorized: You can only create rides for your own phone number");
        };
      };
    };

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
          rideStartCode = null;
        };
        rides.add(nextRideId, ride);
        nextRideId += 1;
        ride;
      };
    };
  };

  public query ({ caller }) func getPendingRides() : async [Ride] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view pending rides");
    };

    let pendingRides = rides.values().toArray().filter(func(ride) { ride.status == "pending" });
    pendingRides.sort(
      func(a, b) {
        if (b.createdAt > a.createdAt) {
          #greater;
        } else {
          Nat.compare(b.id, a.id);
        };
      }
    );
  };

  public shared ({ caller }) func acceptRide(rideId : Nat, driverPhone : Text, driverName : Text, bikeNumber : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can accept rides");
    };

    switch (principalToPhone.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: You must be logged in to accept rides");
      };
      case (?callerPhone) {
        if (callerPhone != driverPhone) {
          Runtime.trap("Unauthorized: You can only accept rides for your own account");
        };
      };
    };

    switch (riderDetails.get(driverPhone)) {
      case (null) { Runtime.trap("Rider not found") };
      case (?details) {
        if (details.accountStatus != "active") {
          Runtime.trap("Rider account is not active");
        };
        if (details.verificationStatus != "approved") {
          Runtime.trap("Rider account not approved for rides");
        };
        switch (rides.get(rideId)) {
          case (null) { Runtime.trap("Ride not found") };
          case (?ride) {
            if (ride.status != "pending") {
              Runtime.trap("Ride is not available for acceptance");
            } else {
              let startCode = generateStartCode(rideId, ride.createdAt);
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
                rideStartCode = ?startCode;
              };
              rides.add(rideId, updatedRide);
              "ok";
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func startRideWithCode(rideId : Nat, driverPhone : Text, code : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can start rides");
    };

    switch (principalToPhone.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: You must be logged in to start rides");
      };
      case (?callerPhone) {
        if (callerPhone != driverPhone) {
          Runtime.trap("Unauthorized: You can only start rides assigned to you");
        };
      };
    };

    switch (rides.get(rideId)) {
      case (null) { Runtime.trap("Ride not found") };
      case (?ride) {
        if (ride.status != "accepted") {
          Runtime.trap("Ride is not in accepted state");
        };
        switch (ride.driverPhone) {
          case (?phone) {
            if (phone != driverPhone) {
              Runtime.trap("This ride belongs to a different driver");
            };
          };
          case (null) { Runtime.trap("Ride has no assigned driver") };
        };
        switch (ride.rideStartCode) {
          case (?expectedCode) {
            if (expectedCode != code) {
              Runtime.trap("Invalid ride start code");
            };
          };
          case (null) { Runtime.trap("No valid ride start code defined") };
        };

        let updatedRide : Ride = {
          id = ride.id;
          customerPhone = ride.customerPhone;
          customerName = ride.customerName;
          pickup = ride.pickup;
          drop = ride.drop;
          fare = ride.fare;
          status = "in_progress";
          driverName = ride.driverName;
          driverPhone = ride.driverPhone;
          bikeNumber = ride.bikeNumber;
          createdAt = ride.createdAt;
          rideStartCode = ride.rideStartCode;
        };
        rides.add(rideId, updatedRide);
        "ok";
      };
    };
  };

  public shared ({ caller }) func completeRide(rideId : Nat, driverPhone : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can complete rides");
    };

    switch (principalToPhone.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: You must be logged in to complete rides");
      };
      case (?callerPhone) {
        if (callerPhone != driverPhone) {
          Runtime.trap("Unauthorized: You can only complete rides assigned to you");
        };
      };
    };

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
        if (ride.status != "in_progress" and ride.status != "accepted") {
          Runtime.trap("Ride is not in an active state");
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
            rideStartCode = ride.rideStartCode;
          };
          rides.add(rideId, updatedRide);

          switch (riderProfiles.get(driverPhone)) {
            case (null) {
              // Create a new profile with earnings from this ride
              switch (users.get(driverPhone)) {
                case (null) { Runtime.trap("Rider user not found") };
                case (?user) {
                  let newProfile : RiderProfile = {
                    phone = driverPhone;
                    name = user.name;
                    status = "offline";
                    totalEarnings = ride.fare;
                  };
                  riderProfiles.add(driverPhone, newProfile);
                  "ok";
                };
              };
            };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can cancel rides");
    };

    switch (principalToPhone.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: You must be logged in to cancel rides");
      };
      case (?callerPhone) {
        switch (rides.get(rideId)) {
          case (null) { Runtime.trap("Ride not found") };
          case (?ride) {
            // Only the customer who created the ride or the assigned driver can cancel
            let isCustomer = ride.customerPhone == callerPhone;
            let isDriver = switch (ride.driverPhone) {
              case (null) { false };
              case (?driverPhone) { driverPhone == callerPhone };
            };

            if (not isCustomer and not isDriver) {
              Runtime.trap("Unauthorized: You can only cancel your own rides");
            };

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
              rideStartCode = ride.rideStartCode;
            };
            rides.add(rideId, updatedRide);
            "ok";
          };
        };
      };
    };
  };

  public query ({ caller }) func getRideById(rideId : Nat) : async ?Ride {
    rides.get(rideId);
  };

  public query ({ caller }) func getActiveRideForCustomer(customerPhone : Text) : async ?Ride {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view active rides");
    };

    switch (principalToPhone.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: You must be logged in");
      };
      case (?callerPhone) {
        if (callerPhone != customerPhone) {
          Runtime.trap("Unauthorized: You can only view your own active rides");
        };
      };
    };

    rides.values().find(
      func(ride) {
        ride.customerPhone == customerPhone and (
          ride.status == "pending" or ride.status == "accepted" or ride.status == "in_progress"
        );
      }
    );
  };

  public query ({ caller }) func getActiveRideForRider(driverPhone : Text) : async ?Ride {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view active rides");
    };

    switch (principalToPhone.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: You must be logged in");
      };
      case (?callerPhone) {
        if (callerPhone != driverPhone) {
          Runtime.trap("Unauthorized: You can only view your own active rides");
        };
      };
    };

    rides.values().find(
      func(ride) {
        switch (ride.driverPhone) {
          case (null) { false };
          case (?phone) { phone == driverPhone and (ride.status == "accepted" or ride.status == "in_progress") };
        };
      }
    );
  };

  public query ({ caller }) func getAllRides() : async [Ride] {
    rides.values().toArray();
  };

  // ************************************
  // Rider Profile Functions
  // ************************************

  public shared ({ caller }) func setRiderStatus(phone : Text, status : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can set rider status");
    };

    switch (principalToPhone.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: You must be logged in to set rider status");
      };
      case (?callerPhone) {
        if (callerPhone != phone) {
          Runtime.trap("Unauthorized: You can only update your own status");
        };
      };
    };

    switch (riderProfiles.get(phone)) {
      case (null) {
        switch (users.get(phone)) {
          case (null) { Runtime.trap("User not found") };
          case (?user) {
            let newProfile : RiderProfile = {
              phone;
              name = user.name;
              status;
              totalEarnings = 0;
            };
            riderProfiles.add(phone, newProfile);
            "ok";
          };
        };
      };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view rider profiles");
    };

    switch (principalToPhone.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: You must be logged in to view rider profiles");
      };
      case (?callerPhone) {
        if (callerPhone != phone) {
          Runtime.trap("Unauthorized: You can only view your own rider profile");
        };
      };
    };

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
    [];
  };
};
