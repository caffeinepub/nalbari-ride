import { Button } from "@/components/ui/button";
import {
  Bike,
  CheckCircle2,
  IndianRupee,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Ride } from "../backend.d";
import { useActor } from "../hooks/useActor";
import type { StoredUser } from "../types";

interface Props {
  user: StoredUser;
  rideId: bigint | null;
  onBack: () => void;
  onBookAnother: () => void;
}

export default function CustomerRideStatusScreen({
  user,
  onBack,
  onBookAnother,
}: Props) {
  const { actor } = useActor();
  const [ride, setRide] = useState<Ride | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const pollRide = useCallback(async () => {
    if (!actor) return;
    try {
      const active = await actor.getActiveRideForCustomer(user.phone);
      setRide(active);
    } catch (err) {
      console.error("Poll error:", err);
    }
  }, [actor, user.phone]);

  useEffect(() => {
    pollRide();
    const interval = setInterval(pollRide, 3000);
    return () => clearInterval(interval);
  }, [pollRide]);

  const handleCancel = async () => {
    if (!ride || !actor) return;
    setCancelLoading(true);
    try {
      await actor.cancelRide(ride.id);
      toast.success("Ride cancelled");
      onBack();
    } catch (err) {
      console.error(err);
      toast.error("Could not cancel the ride");
    } finally {
      setCancelLoading(false);
    }
  };

  const status = ride?.status ?? "loading";

  return (
    <div
      data-ocid="ride_status.page"
      className="screen-fill px-5 pt-8 pb-8 flex flex-col"
    >
      {/* Top area with status */}
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="flex-1 flex flex-col items-center justify-center gap-6"
        >
          {status === "loading" && <StatusLoading />}
          {status === "pending" && (
            <StatusPending
              ride={ride}
              onCancel={handleCancel}
              cancelLoading={cancelLoading}
            />
          )}
          {status === "accepted" && <StatusAccepted ride={ride} />}
          {status === "in_progress" && <StatusInProgress ride={ride} />}
          {status === "completed" && (
            <StatusCompleted ride={ride} onBookAnother={onBookAnother} />
          )}
          {status === "cancelled" && <StatusCancelled onTryAgain={onBack} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StatusLoading() {
  return (
    <div
      data-ocid="ride_status.loading_state"
      className="flex flex-col items-center gap-4 slide-up"
    >
      <div className="w-20 h-20 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center">
        <Loader2 size={36} className="text-brand spin-loader" />
      </div>
      <p className="text-muted-foreground text-center">
        Connecting to server...
      </p>
    </div>
  );
}

function StatusPending({
  ride,
  onCancel,
  cancelLoading,
}: {
  ride: Ride | null;
  onCancel: () => void;
  cancelLoading: boolean;
}) {
  return (
    <div className="w-full flex flex-col items-center gap-6 slide-up">
      <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
        <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
        <Bike size={36} className="text-brand" />
      </div>
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          Finding your rider...
        </h2>
        <p className="text-muted-foreground text-sm">
          Please wait while we match you with a rider
        </p>
      </div>
      {ride && <RideInfoCard ride={ride} />}
      <div className="w-full">
        <Button
          data-ocid="ride_status.cancel_button"
          onClick={onCancel}
          disabled={cancelLoading}
          variant="outline"
          className="w-full h-13 rounded-2xl border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
        >
          {cancelLoading ? (
            <Loader2 size={16} className="mr-2 spin-loader" />
          ) : null}
          Cancel Ride
        </Button>
      </div>
    </div>
  );
}

function StatusAccepted({ ride }: { ride: Ride | null }) {
  const rideStartCode = ride?.rideStartCode;

  return (
    <div className="w-full flex flex-col items-center gap-6 slide-up">
      <div
        className="w-24 h-24 rounded-full bg-accent/10 border-2 flex items-center justify-center"
        style={{ borderColor: "oklch(0.78 0.17 142 / 40%)" }}
      >
        <Bike size={40} style={{ color: "oklch(0.78 0.17 142)" }} />
      </div>
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          Rider on the way!
        </h2>
        <p className="text-muted-foreground text-sm">
          Your rider is heading to your pickup
        </p>
      </div>

      {/* Ride Start Code — prominent display */}
      <div
        data-ocid="ride_status.panel"
        className="w-full rounded-3xl border-2 p-5 flex flex-col items-center gap-3"
        style={{
          background: "oklch(0.18 0.04 265 / 80%)",
          borderColor: "oklch(0.72 0.19 45 / 60%)",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your Ride Start Code
        </p>
        {rideStartCode ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex items-center gap-2"
          >
            {([0, 1, 2, 3] as const).map((pos) => (
              <div
                key={`digit-pos-${pos}`}
                className="w-14 h-16 rounded-2xl flex items-center justify-center font-mono font-extrabold text-3xl"
                style={{
                  background: "oklch(0.72 0.19 45 / 15%)",
                  color: "oklch(0.85 0.19 45)",
                  border: "2px solid oklch(0.72 0.19 45 / 40%)",
                  letterSpacing: "0.05em",
                }}
              >
                {rideStartCode[pos] ?? ""}
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="flex items-center gap-2 py-2">
            <Loader2 size={16} className="text-muted-foreground spin-loader" />
            <span className="text-muted-foreground text-sm">
              Code loading...
            </span>
          </div>
        )}
        <p className="text-center text-sm text-muted-foreground leading-snug px-2">
          Tell this code to your rider when they arrive at pickup
        </p>
      </div>

      {ride && (
        <div className="w-full rounded-3xl bg-card border border-border p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Bike size={22} className="text-brand" />
            </div>
            <div>
              <p className="font-bold text-foreground">
                {ride.driverName ?? "Your Rider"}
              </p>
              <p className="text-muted-foreground text-sm">
                {ride.bikeNumber ?? "—"}
              </p>
            </div>
          </div>
          <div className="h-px bg-border" />
          <RideRouteInfo pickup={ride.pickup} drop={ride.drop} />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Fare</span>
            <span className="font-bold text-brand text-lg">
              ₹{ride.fare.toString()}
            </span>
          </div>
          {ride.driverPhone && (
            <a
              data-ocid="ride_status.call_button"
              href={`tel:${ride.driverPhone}`}
              className="flex items-center justify-center gap-2 w-full h-13 rounded-2xl font-bold text-sm transition-all"
              style={{
                background: "oklch(0.78 0.17 142)",
                color: "oklch(0.1 0.01 265)",
              }}
            >
              <Phone size={18} />
              Call Driver
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function StatusInProgress({ ride }: { ride: Ride | null }) {
  return (
    <div className="w-full flex flex-col items-center gap-6 slide-up">
      <div
        className="w-24 h-24 rounded-full border-4 flex items-center justify-center relative"
        style={{
          borderColor: "oklch(0.78 0.17 142 / 40%)",
          background: "oklch(0.78 0.17 142 / 10%)",
        }}
      >
        <div
          className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
          style={{
            borderColor:
              "oklch(0.78 0.17 142 / 50%) transparent transparent transparent",
          }}
        />
        <Navigation size={36} style={{ color: "oklch(0.78 0.17 142)" }} />
      </div>
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          Ride In Progress
        </h2>
        <p className="text-muted-foreground text-sm">
          Your rider is taking you to your destination
        </p>
      </div>
      {ride && (
        <div className="w-full rounded-3xl bg-card border border-border p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Bike size={22} className="text-brand" />
            </div>
            <div>
              <p className="font-bold text-foreground">
                {ride.driverName ?? "Your Rider"}
              </p>
              <p className="text-muted-foreground text-sm">
                {ride.bikeNumber ?? "—"}
              </p>
            </div>
            <div className="ml-auto">
              <span className="font-bold text-brand text-lg">
                ₹{ride.fare.toString()}
              </span>
            </div>
          </div>
          <div className="h-px bg-border" />
          <RideRouteInfo pickup={ride.pickup} drop={ride.drop} />
          {ride.driverPhone && (
            <a
              data-ocid="ride_status.call_button"
              href={`tel:${ride.driverPhone}`}
              className="flex items-center justify-center gap-2 w-full h-13 rounded-2xl font-bold text-sm transition-all"
              style={{
                background: "oklch(0.78 0.17 142)",
                color: "oklch(0.1 0.01 265)",
              }}
            >
              <Phone size={18} />
              Call Driver
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function StatusCompleted({
  ride,
  onBookAnother,
}: { ride: Ride | null; onBookAnother: () => void }) {
  return (
    <div className="w-full flex flex-col items-center gap-6 slide-up">
      <div
        className="w-24 h-24 rounded-full bg-accent/10 border-2 flex items-center justify-center"
        style={{ borderColor: "oklch(0.78 0.17 142 / 40%)" }}
      >
        <CheckCircle2 size={44} style={{ color: "oklch(0.78 0.17 142)" }} />
      </div>
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          Ride Complete!
        </h2>
        <p className="text-muted-foreground text-sm">
          Thanks for riding with Nalbari Ride
        </p>
      </div>
      {ride && (
        <div className="w-full rounded-3xl bg-card border border-border p-5">
          <div className="flex items-center justify-center gap-2 mb-4">
            <IndianRupee size={24} className="text-brand" />
            <span className="font-display text-4xl font-extrabold text-brand">
              {ride.fare.toString()}
            </span>
          </div>
          <RideRouteInfo pickup={ride.pickup} drop={ride.drop} />
        </div>
      )}
      <Button
        onClick={onBookAnother}
        className="w-full h-14 rounded-2xl font-bold text-base bg-primary text-primary-foreground hover:bg-primary/90 orange-glow"
      >
        Book Another Ride
      </Button>
    </div>
  );
}

function StatusCancelled({ onTryAgain }: { onTryAgain: () => void }) {
  return (
    <div className="w-full flex flex-col items-center gap-6 slide-up">
      <div className="w-24 h-24 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center">
        <XCircle size={44} className="text-destructive" />
      </div>
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          Ride Cancelled
        </h2>
        <p className="text-muted-foreground text-sm">Your ride was cancelled</p>
      </div>
      <Button
        onClick={onTryAgain}
        className="w-full h-14 rounded-2xl font-bold text-base bg-primary text-primary-foreground hover:bg-primary/90 orange-glow"
      >
        Try Again
      </Button>
    </div>
  );
}

function RideInfoCard({ ride }: { ride: Ride }) {
  return (
    <div className="w-full rounded-3xl bg-card border border-border p-5 flex flex-col gap-4">
      <RideRouteInfo pickup={ride.pickup} drop={ride.drop} />
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">Estimated fare</span>
        <span className="font-bold text-brand text-lg">
          ₹{ride.fare.toString()}
        </span>
      </div>
    </div>
  );
}

function RideRouteInfo({ pickup, drop }: { pickup: string; drop: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <MapPin size={16} className="text-brand flex-shrink-0" />
        <span className="text-foreground text-sm font-medium">{pickup}</span>
      </div>
      <div className="flex items-center gap-3">
        <Navigation
          size={16}
          className="flex-shrink-0"
          style={{ color: "oklch(0.78 0.17 142)" }}
        />
        <span className="text-foreground text-sm font-medium">{drop}</span>
      </div>
    </div>
  );
}
