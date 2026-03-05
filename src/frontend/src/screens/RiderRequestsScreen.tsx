import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  IndianRupee,
  Loader2,
  MapPin,
  Navigation,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Ride } from "../backend.d";
import { useActor } from "../hooks/useActor";
import type { StoredUser } from "../types";

interface Props {
  user: StoredUser;
  onBack: () => void;
  onAccepted: () => void;
}

export default function RiderRequestsScreen({
  user,
  onBack,
  onAccepted,
}: Props) {
  const { actor } = useActor();
  const [rides, setRides] = useState<Ride[]>([]);
  const [acceptingId, setAcceptingId] = useState<bigint | null>(null);

  const fetchRides = useCallback(async () => {
    if (!actor) return;
    try {
      const pending = await actor.getPendingRides();
      setRides(pending);
    } catch (err) {
      console.error("Fetch rides error:", err);
    }
  }, [actor]);

  useEffect(() => {
    fetchRides();
    const interval = setInterval(fetchRides, 5000);
    return () => clearInterval(interval);
  }, [fetchRides]);

  const handleAccept = async (ride: Ride) => {
    if (!actor) return;
    setAcceptingId(ride.id);
    try {
      // Check rider details and verification status first
      const riderDetails = await actor.getRiderDetails(user.phone);
      if (!riderDetails || riderDetails.verificationStatus !== "approved") {
        toast.error(
          "Your account must be approved by admin before accepting rides.",
        );
        setAcceptingId(null);
        return;
      }

      await actor.acceptRide(
        ride.id,
        user.phone,
        user.name,
        riderDetails.bikeNumber,
      );
      toast.success("Ride accepted! Head to pickup.");
      onAccepted();
    } catch (err) {
      console.error(err);
      // Extract actual error message from backend
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Could not accept this ride. Try another.";
      toast.error(message);
    } finally {
      setAcceptingId(null);
    }
  };

  // Only show max 3 for display
  const displayRides = rides.slice(0, 3);

  const ocidForItem = (idx: number) => `ride_requests.item.${idx + 1}` as const;

  return (
    <div
      data-ocid="ride_requests.page"
      className="screen-fill px-5 pt-6 pb-8 flex flex-col"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <button
          type="button"
          onClick={onBack}
          data-ocid="ride_requests.cancel_button"
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:border-primary transition-colors"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Ride Requests
          </h2>
          <p className="text-muted-foreground text-sm">
            {rides.length > 0
              ? `${rides.length} request${rides.length !== 1 ? "s" : ""} available`
              : "Refreshing..."}
          </p>
        </div>
      </motion.div>

      {/* Ride list */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        <AnimatePresence>
          {displayRides.length === 0 ? (
            <motion.div
              data-ocid="ride_requests.empty_state"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-4 py-16"
            >
              <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center">
                <MapPin size={32} className="text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-display font-bold text-lg text-foreground">
                  No ride requests
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Auto-refreshing every 5 seconds
                </p>
              </div>
            </motion.div>
          ) : (
            displayRides.map((ride, idx) => (
              <motion.div
                key={ride.id.toString()}
                data-ocid={ocidForItem(idx)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ delay: idx * 0.08 }}
                className="rounded-3xl bg-card border border-border p-5 flex flex-col gap-4"
              >
                {/* Customer info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
                    <User size={18} className="text-brand" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">
                      {ride.customerName}
                    </p>
                    <p className="text-muted-foreground text-xs">Customer</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <IndianRupee size={14} className="text-brand" />
                    <span className="font-bold text-brand text-base">
                      {ride.fare.toString()}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Route */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand" />
                    <div className="w-0.5 h-6 bg-border my-1" />
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: "oklch(0.78 0.17 142)" }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        From
                      </p>
                      <p className="text-foreground text-sm font-medium">
                        {ride.pickup}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        To
                      </p>
                      <p className="text-foreground text-sm font-medium">
                        {ride.drop}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Accept */}
                <Button
                  data-ocid={
                    `ride_requests.primary_button.${idx + 1}` as string
                  }
                  onClick={() => handleAccept(ride)}
                  disabled={acceptingId !== null}
                  className="w-full h-12 rounded-2xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 orange-glow transition-all"
                >
                  {acceptingId === ride.id ? (
                    <>
                      <Loader2 size={15} className="mr-2 spin-loader" />
                      Accepting...
                    </>
                  ) : (
                    "Accept Ride →"
                  )}
                </Button>
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {rides.length > 3 && (
          <p className="text-center text-muted-foreground text-sm pb-2">
            +{rides.length - 3} more requests
          </p>
        )}
      </div>

      {/* Refresh indicator */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <div
          className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
          style={{ background: "oklch(0.78 0.17 142)" }}
        />
        <p className="text-muted-foreground text-xs">Auto-refreshing</p>
      </div>
    </div>
  );
}
