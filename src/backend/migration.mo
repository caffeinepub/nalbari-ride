import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";

module {
  type User = {
    id : Nat;
    name : Text;
    phone : Text;
    password : Text;
    role : Text;
  };

  type UserProfile = {
    name : Text;
    phone : Text;
    role : Text;
  };

  type OldActor = {
    users : Map.Map<Text, User>;
    userProfiles : Map.Map<Principal, UserProfile>;
    principalToPhone : Map.Map<Principal, Text>;
  };

  type NewActor = {
    users : Map.Map<Text, User>;
    userProfiles : Map.Map<Principal, UserProfile>;
    principalToPhone : Map.Map<Principal, Text>;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
