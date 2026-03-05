import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertTriangle,
  Bike,
  IndianRupee,
  LogOut,
  Phone,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { RiderDetails, RiderProfile } from "../backend.d";
import { useActor } from "../hooks/useActor";
import type { StoredUser } from "../types";

interface Props {
  user: StoredUser;
  onLogout: () => void;
  onViewRequests: () => void;
}

export default function RiderHomeScreen({
  user,
  onLogout,
  onViewRequests,
}: Props) {
  const { actor } = useActor();
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [riderDetails, setRiderDetails] = useState<RiderDetails | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [toggling, setToggling] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!actor) return;
    try {
      const [p, details] = await Promise.all([
        actor.getRiderProfile(user.phone),
        actor.getRiderDetails(user.phone),
      ]);
      setProfile(p);
      setRiderDetails(details);
      setIsOnline(p.status === "online");
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  }, [actor, user.phone]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Show suspension notice if rider is suspended
  if (riderDetails && riderDetails.accountStatus === "suspended") {
    return (
      <div
        data-ocid="rider_home.suspended_state"
        className="screen-fill px-6 pt-12 pb-10 flex flex-col items-center justify-center"
        style={{ background: "oklch(0.11 0.01 265)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center text-center gap-5"
        >
          {/* Red warning icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: "oklch(0.63 0.22 27 / 15%)",
              border: "2px solid oklch(0.63 0.22 27 / 35%)",
              boxShadow: "0 0 40px oklch(0.63 0.22 27 / 20%)",
            }}
          >
            <AlertTriangle size={38} style={{ color: "oklch(0.75 0.16 27)" }} />
          </div>

          <div>
            <h2
              className="font-display text-2xl font-bold mb-3"
              style={{ color: "oklch(0.75 0.16 27)" }}
            >
              Account Suspended
            </h2>
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: "oklch(0.62 0.03 265)" }}
            >
              Your account has been suspended. Please contact Ride Nalbari
              support.
            </p>
          </div>

          <div
            className="flex items-center gap-2 px-5 py-3 rounded-xl"
            style={{
              background: "oklch(0.17 0.015 265)",
              border: "1px solid oklch(0.28 0.02 265)",
            }}
          >
            <Phone size={16} style={{ color: "oklch(0.72 0.18 260)" }} />
            <span
              className="font-mono font-semibold text-sm"
              style={{ color: "oklch(0.9 0.01 90)" }}
            >
              +91 96787 84288
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "oklch(0.63 0.22 27 / 15%)",
              border: "1px solid oklch(0.63 0.22 27 / 30%)",
              color: "oklch(0.75 0.16 27)",
            }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </motion.div>
      </div>
    );
  }

  const handleToggle = async (checked: boolean) => {
    if (!actor) return;
    setToggling(true);
    try {
      await actor.setRiderStatus(user.phone, checked ? "online" : "offline");
      setIsOnline(checked);
      toast.success(checked ? "You are now online!" : "You are now offline");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div
      data-ocid="rider_home.page"
      className="screen-fill px-5 pt-6 pb-8 flex flex-col"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <p className="text-muted-foreground text-sm">Rider Dashboard 🏍️</p>
          <h2 className="font-display text-2xl font-bold text-foreground mt-0.5">
            {user.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          Logout
        </button>
      </motion.div>

      {/* Online/Offline toggle card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl p-6 mb-5 flex items-center justify-between"
        style={{
          background: isOnline
            ? "linear-gradient(135deg, oklch(0.78 0.17 142 / 15%) 0%, oklch(0.78 0.17 142 / 5%) 100%)"
            : "oklch(0.17 0.015 265)",
          border: `1px solid ${isOnline ? "oklch(0.78 0.17 142 / 35%)" : "oklch(0.28 0.02 265)"}`,
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isOnline && <span className="pulse-dot" />}
            <span
              className="font-display font-bold text-xl"
              style={{
                color: isOnline
                  ? "oklch(0.85 0.15 142)"
                  : "oklch(0.62 0.03 265)",
              }}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            {isOnline
              ? "You're accepting rides"
              : "Toggle to start accepting rides"}
          </p>
        </div>
        <Switch
          data-ocid="rider_home.toggle"
          checked={isOnline}
          onCheckedChange={handleToggle}
          disabled={toggling}
          className="scale-125"
        />
      </motion.div>

      {/* Earnings card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        data-ocid="rider_home.earnings_card"
        className="rounded-3xl p-6 mb-5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.72 0.19 45) 0%, oklch(0.62 0.22 38) 100%)",
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-foreground/80 text-sm font-medium mb-1">
              Total Earnings
            </p>
            <div className="flex items-baseline gap-1">
              <IndianRupee size={22} className="text-primary-foreground" />
              <span className="font-display text-4xl font-extrabold text-primary-foreground">
                {profile?.totalEarnings?.toString() ?? "0"}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <TrendingUp size={22} className="text-primary-foreground" />
          </div>
        </div>
        <p className="text-primary-foreground/60 text-xs mt-3">
          Bike: AS-01-AB-1234
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl bg-card border border-border p-5 mb-5 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
          <Bike size={22} className="text-brand" />
        </div>
        <div>
          <p className="font-bold text-foreground">Nalbari Ride Rider</p>
          <p className="text-muted-foreground text-sm">{user.phone}</p>
        </div>
      </motion.div>

      {/* Flex spacer */}
      <div className="flex-1" />

      {/* View requests button */}
      {isOnline && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            data-ocid="rider_home.requests_button"
            onClick={onViewRequests}
            className="w-full h-14 rounded-2xl font-bold text-base bg-primary text-primary-foreground hover:bg-primary/90 orange-glow transition-all"
          >
            View Ride Requests →
          </Button>
        </motion.div>
      )}

      {!isOnline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-muted-foreground text-sm">
            Go online to see ride requests
          </p>
        </motion.div>
      )}
    </div>
  );
}
