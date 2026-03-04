import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IndianRupee, Loader2, LogOut, MapPin, Navigation } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { FIXED_FARE, type StoredUser } from "../types";

interface Props {
  user: StoredUser;
  onLogout: () => void;
  onRideCreated: (rideId: bigint) => void;
}

export default function CustomerHomeScreen({
  user,
  onLogout,
  onRideCreated,
}: Props) {
  const { actor } = useActor();
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBookRide = async () => {
    if (!pickup.trim() || !drop.trim()) {
      toast.error("Please enter pickup and drop locations");
      return;
    }
    if (!actor) {
      toast.error("Connection not ready. Please wait.");
      return;
    }

    setLoading(true);
    try {
      const ride = await actor.createRide(
        user.phone,
        user.name,
        pickup.trim(),
        drop.trim(),
        FIXED_FARE,
      );
      toast.success("Ride booked! Finding a rider...");
      onRideCreated(ride.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to book ride. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-ocid="customer_home.page"
      className="screen-fill px-5 pt-6 pb-8 flex flex-col"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <p className="text-muted-foreground text-sm">Good day 👋</p>
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

      {/* Hero fare card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl p-6 mb-6 overflow-hidden relative"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.72 0.19 45) 0%, oklch(0.62 0.22 38) 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)",
          }}
        />
        <p className="text-primary-foreground/80 text-sm font-medium relative z-10">
          Flat rate anywhere
        </p>
        <div className="flex items-baseline gap-1 mt-1 relative z-10">
          <IndianRupee size={28} className="text-primary-foreground" />
          <span className="font-display text-5xl font-extrabold text-primary-foreground">
            {FIXED_FARE.toString()}
          </span>
        </div>
        <p className="text-primary-foreground/70 text-xs mt-2 relative z-10">
          Base ₹20 + 5 km × ₹8
        </p>
      </motion.div>

      {/* Booking form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 rounded-3xl bg-card border border-border p-5 flex flex-col gap-5"
      >
        <h3 className="font-display font-bold text-lg text-foreground">
          Where to?
        </h3>

        {/* Route visual */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center pt-2">
            <div className="w-3 h-3 rounded-full bg-brand" />
            <div className="w-0.5 flex-1 bg-border my-1" />
            <div
              className="w-3 h-3 rounded-full bg-accent"
              style={{ background: "oklch(0.78 0.17 142)" }}
            />
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Pickup
              </Label>
              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brand"
                />
                <Input
                  data-ocid="customer_home.pickup_input"
                  placeholder="Where are you now?"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="pl-9 h-12 rounded-xl bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Drop
              </Label>
              <div className="relative">
                <Navigation
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "oklch(0.78 0.17 142)" }}
                />
                <Input
                  data-ocid="customer_home.drop_input"
                  placeholder="Where do you want to go?"
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                  className="pl-9 h-12 rounded-xl bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 py-2 rounded-xl bg-secondary/50">
          <span className="text-muted-foreground text-sm">Estimated fare</span>
          <span className="font-bold text-brand text-base">
            ₹{FIXED_FARE.toString()}
          </span>
        </div>
      </motion.div>

      {/* Book button */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-5"
      >
        <Button
          data-ocid="customer_home.book_button"
          onClick={handleBookRide}
          disabled={loading}
          className="w-full h-14 rounded-2xl font-bold text-base bg-primary text-primary-foreground hover:bg-primary/90 orange-glow transition-all"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="mr-2 spin-loader" />
              Booking...
            </>
          ) : (
            "Book Ride  →"
          )}
        </Button>
      </motion.div>
    </div>
  );
}
