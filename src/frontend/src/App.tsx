import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import CustomerHomeScreen from "./screens/CustomerHomeScreen";
import CustomerRideStatusScreen from "./screens/CustomerRideStatusScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import RiderCompletedScreen from "./screens/RiderCompletedScreen";
import RiderHomeScreen from "./screens/RiderHomeScreen";
import RiderInProgressScreen from "./screens/RiderInProgressScreen";
import RiderRequestsScreen from "./screens/RiderRequestsScreen";
import RoleSelectScreen from "./screens/RoleSelectScreen";
import type { Screen, StoredUser } from "./types";

const STORAGE_KEY = "nalbari_ride_user";

export default function App() {
  const [screen, setScreen] = useState<Screen>("role_select");
  const [selectedRole, setSelectedRole] = useState<"customer" | "rider">(
    "customer",
  );
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [lastRideId, setLastRideId] = useState<bigint | null>(null);
  const [completedFare, setCompletedFare] = useState<bigint>(0n);

  // On mount, check for stored session
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const user: StoredUser = JSON.parse(stored);
        setCurrentUser(user);
        setScreen(user.role === "customer" ? "customer_home" : "rider_home");
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = (user: StoredUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setCurrentUser(user);
    setScreen(user.role === "customer" ? "customer_home" : "rider_home");
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
    setScreen("role_select");
    setLastRideId(null);
  };

  const navigate = (s: Screen) => setScreen(s);

  return (
    <div className="min-h-dvh bg-background flex items-start justify-center">
      <div className="app-shell brand-gradient">
        {screen === "role_select" && (
          <RoleSelectScreen
            onSelectRole={(role) => {
              setSelectedRole(role);
              navigate("register");
            }}
            onLogin={(role) => {
              setSelectedRole(role);
              navigate("login");
            }}
          />
        )}

        {screen === "register" && (
          <RegisterScreen
            role={selectedRole}
            onSuccess={() => navigate("login")}
            onLogin={() => navigate("login")}
          />
        )}

        {screen === "login" && (
          <LoginScreen
            onSuccess={login}
            onRegister={() => navigate("register")}
          />
        )}

        {screen === "customer_home" && currentUser && (
          <CustomerHomeScreen
            user={currentUser}
            onLogout={logout}
            onRideCreated={(rideId) => {
              setLastRideId(rideId);
              navigate("customer_ride_status");
            }}
          />
        )}

        {screen === "customer_ride_status" && currentUser && (
          <CustomerRideStatusScreen
            user={currentUser}
            rideId={lastRideId}
            onBack={() => navigate("customer_home")}
            onBookAnother={() => navigate("customer_home")}
          />
        )}

        {screen === "rider_home" && currentUser && (
          <RiderHomeScreen
            user={currentUser}
            onLogout={logout}
            onViewRequests={() => navigate("rider_requests")}
          />
        )}

        {screen === "rider_requests" && currentUser && (
          <RiderRequestsScreen
            user={currentUser}
            onBack={() => navigate("rider_home")}
            onAccepted={() => navigate("rider_in_progress")}
          />
        )}

        {screen === "rider_in_progress" && currentUser && (
          <RiderInProgressScreen
            user={currentUser}
            onCompleted={(fare) => {
              setCompletedFare(fare);
              navigate("rider_completed");
            }}
          />
        )}

        {screen === "rider_completed" && currentUser && (
          <RiderCompletedScreen
            fare={completedFare}
            onFinish={() => navigate("rider_home")}
          />
        )}
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}
