import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, MapPin, Navigation, Phone } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Ride } from "../backend.d";
import { useActor } from "../hooks/useActor";
import type { StoredUser } from "../types";

interface Props {
  user: StoredUser;
  onCompleted: (fare: bigint) => void;
}

export default function RiderInProgressScreen({ user, onCompleted }: Props) {
  const { actor } = useActor();
  const [ride, setRide] = useState<Ride | null>(null);
  const [endLoading, setEndLoading] = useState(false);

  const pollRide = useCallback(async () => {
    if (!actor) return;
    try {
      const active = await actor.getActiveRideForRider(user.phone);
      setRide(active);
    } catch (err) {
      console.error("Poll error:", err);
    }
  }, [actor, user.phone]);

  useEffect(() => {
    pollRide();
    const interval = setInterval(pollRide, 5000);
    return () => clearInterval(interval);
  }, [pollRide]);

  const handleEndRide = async () => {
    if (!ride || !actor) return;
    setEndLoading(true);
    try {
      await actor.completeRide(ride.id, user.phone);
      toast.success("Ride completed! Great job!");
      onCompleted(ride.fare);
    } catch (err) {
      console.error(err);
      toast.error("Failed to end ride. Please try again.");
    } finally {
      setEndLoading(false);
    }
  };

  return (
    <div
      data-ocid="ride_in_progress.page"
      className="screen-fill px-5 pt-8 pb-8 flex flex-col"
    >
      {/* Status header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-8"
      >
        <div
          className="w-16 h-16 rounded-full border-4 mb-4 flex items-center justify-center"
          style={{
            borderColor: "oklch(0.78 0.17 142 / 40%)",
            background: "oklch(0.78 0.17 142 / 10%)",
          }}
        >
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ background: "oklch(0.78 0.17 142)" }}
          />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Ride In Progress
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Head to the destination
        </p>
      </motion.div>

      {/* Ride card */}
      {ride ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 rounded-3xl bg-card border border-border p-6 flex flex-col gap-5"
        >
          {/* Customer */}
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
              <span className="font-bold text-brand text-lg">
                {ride.customerName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-bold text-foreground">{ride.customerName}</p>
              <p className="text-muted-foreground text-sm">Your Passenger</p>
            </div>
            <div className="ml-auto">
              <span className="font-bold text-brand text-xl">
                ₹{ride.fare.toString()}
              </span>
            </div>
          </div>

          {/* Route */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center pt-1">
              <div className="w-3 h-3 rounded-full bg-brand" />
              <div className="w-0.5 flex-1 bg-border my-2" />
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: "oklch(0.78 0.17 142)" }}
              />
            </div>
            <div className="flex-1 flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-brand" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Pickup
                  </p>
                </div>
                <p className="text-foreground font-semibold">{ride.pickup}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Navigation
                    size={14}
                    style={{ color: "oklch(0.78 0.17 142)" }}
                  />
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Drop
                  </p>
                </div>
                <p className="text-foreground font-semibold">{ride.drop}</p>
              </div>
            </div>
          </div>

          {/* Call customer */}
          {ride.customerPhone && (
            <a
              data-ocid="ride_in_progress.call_button"
              href={`tel:${ride.customerPhone}`}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl font-bold text-sm border border-border hover:bg-card/80 text-foreground transition-all"
            >
              <Phone size={16} />
              Call Customer
            </a>
          )}
        </motion.div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-brand spin-loader" />
            <p className="text-muted-foreground text-sm">
              Loading ride info...
            </p>
          </div>
        </div>
      )}

      {/* End ride CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-5"
      >
        <Button
          data-ocid="ride_in_progress.end_button"
          onClick={handleEndRide}
          disabled={endLoading || !ride}
          className="w-full h-14 rounded-2xl font-bold text-base transition-all"
          style={{
            background: "oklch(0.78 0.17 142)",
            color: "oklch(0.1 0.01 265)",
          }}
        >
          {endLoading ? (
            <>
              <Loader2 size={18} className="mr-2 spin-loader" />
              Ending Ride...
            </>
          ) : (
            <>
              <CheckCircle2 size={18} className="mr-2" />
              End Ride
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
