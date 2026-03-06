import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Shield,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { StoredUser } from "../types";
import {
  type StoredRide,
  completeRide,
  getActiveRideForRider,
  startRide,
} from "../utils/rideStore";

interface Props {
  user: StoredUser;
  onCompleted: (fare: bigint) => void;
}

export default function RiderInProgressScreen({ user, onCompleted }: Props) {
  const [ride, setRide] = useState<StoredRide | null>(null);
  const [endLoading, setEndLoading] = useState(false);
  const [startCode, setStartCode] = useState("");
  const [startLoading, setStartLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const pollRide = useCallback(() => {
    const active = getActiveRideForRider(user.phone);
    setRide(active);
  }, [user.phone]);

  useEffect(() => {
    pollRide();
    const interval = setInterval(pollRide, 3000);
    return () => clearInterval(interval);
  }, [pollRide]);

  const handleStartRide = () => {
    if (!ride) return;
    if (startCode.replace(/\s/g, "").length !== 4) {
      toast.error("Please enter the full 4-digit code.");
      return;
    }
    setStartLoading(true);
    try {
      const result = startRide(ride.id, startCode.trim());
      if ("error" in result) {
        if (result.error === "Invalid ride start code") {
          toast.error("Invalid code. Ask the customer again.");
        } else {
          toast.error(result.error);
        }
        setStartCode("");
        return;
      }
      toast.success("Ride started! Head to the destination.");
      pollRide();
    } catch (err) {
      console.error(err);
      toast.error("Invalid code. Ask the customer again.");
      setStartCode("");
    } finally {
      setStartLoading(false);
    }
  };

  const handleEndRide = () => {
    if (!ride) return;
    setEndLoading(true);
    try {
      completeRide(ride.id);
      toast.success("Ride completed! Great job!");
      onCompleted(BigInt(ride.fare));
    } catch (err) {
      console.error(err);
      toast.error("Failed to end ride. Please try again.");
    } finally {
      setEndLoading(false);
    }
  };

  // Handle individual digit input for OTP-style code entry
  const handleDigitChange = (idx: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const chars = startCode.padEnd(4, "").split("");
    chars[idx] = digit;
    const newCode = chars.join("").replace(/\s/g, "").slice(0, 4);
    setStartCode(newCode.trimEnd());

    // Move focus forward
    if (digit && idx < 3) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (startCode[idx]) {
        const chars = startCode.padEnd(4, " ").split("");
        chars[idx] = " ";
        setStartCode(chars.join("").trimEnd());
      } else if (idx > 0) {
        inputRefs.current[idx - 1]?.focus();
        const chars = startCode.padEnd(4, " ").split("");
        chars[idx - 1] = " ";
        setStartCode(chars.join("").trimEnd());
      }
    }
  };

  const rideStatus = ride?.status;

  return (
    <div
      data-ocid="ride_in_progress.page"
      className="screen-fill px-5 pt-8 pb-8 flex flex-col"
    >
      <AnimatePresence mode="wait">
        {rideStatus === "accepted" || (!ride && rideStatus === undefined) ? (
          <motion.div
            key="at_pickup"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex-1 flex flex-col"
          >
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div
                className="w-16 h-16 rounded-full border-4 mb-4 flex items-center justify-center"
                style={{
                  borderColor: "oklch(0.72 0.19 45 / 50%)",
                  background: "oklch(0.72 0.19 45 / 10%)",
                }}
              >
                <MapPin size={28} style={{ color: "oklch(0.72 0.19 45)" }} />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                At Pickup Location
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Ask the customer for the 4-digit ride code
              </p>
            </div>

            {/* Ride card */}
            {ride && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl bg-card border border-border p-5 flex flex-col gap-4 mb-5"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
                    <span className="font-bold text-brand text-lg">
                      {ride.customerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground">
                      {ride.customerName}
                    </p>
                    <p className="text-muted-foreground text-sm">Passenger</p>
                  </div>
                  <div className="ml-auto font-bold text-brand text-lg">
                    ₹{ride.fare}
                  </div>
                </div>
                <RideRoute pickup={ride.pickup} drop={ride.drop} />
                {ride.customerPhone && (
                  <a
                    data-ocid="ride_in_progress.call_button"
                    href={`tel:${ride.customerPhone}`}
                    className="flex items-center justify-center gap-2 w-full h-11 rounded-2xl font-bold text-sm border border-border hover:bg-muted text-foreground transition-all"
                  >
                    <Phone size={15} />
                    Call Customer
                  </a>
                )}
              </motion.div>
            )}

            {/* Code entry */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-3xl border-2 p-5 flex flex-col items-center gap-4 mb-5"
              style={{
                background: "oklch(0.18 0.04 265 / 80%)",
                borderColor: "oklch(0.72 0.19 45 / 40%)",
              }}
            >
              <div className="flex items-center gap-2">
                <Shield size={16} style={{ color: "oklch(0.72 0.19 45)" }} />
                <p
                  className="text-sm font-semibold uppercase tracking-widest"
                  style={{ color: "oklch(0.72 0.19 45)" }}
                >
                  Enter Ride Start Code
                </p>
              </div>

              {/* 4 individual digit boxes */}
              <div className="flex items-center gap-3">
                {[0, 1, 2, 3].map((idx) => (
                  <Input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    data-ocid="ride_in_progress.input"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={startCode[idx] ?? ""}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    className="w-14 h-16 text-center font-mono font-extrabold text-2xl rounded-2xl border-2 bg-transparent outline-none transition-all"
                    style={{
                      borderColor: startCode[idx]
                        ? "oklch(0.72 0.19 45)"
                        : "oklch(0.72 0.19 45 / 30%)",
                      color: "oklch(0.92 0.04 265)",
                      caretColor: "oklch(0.72 0.19 45)",
                    }}
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-xs text-center">
                The customer has a 4-digit code — ask them to share it
              </p>
            </motion.div>

            {/* Start ride CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                data-ocid="ride_in_progress.primary_button"
                onClick={handleStartRide}
                disabled={
                  startLoading ||
                  startCode.replace(/\s/g, "").length < 4 ||
                  !ride
                }
                className="w-full h-14 rounded-2xl font-bold text-base transition-all"
                style={{
                  background:
                    startCode.replace(/\s/g, "").length === 4
                      ? "oklch(0.72 0.19 45)"
                      : undefined,
                  color:
                    startCode.replace(/\s/g, "").length === 4
                      ? "oklch(0.1 0.01 265)"
                      : undefined,
                }}
              >
                {startLoading ? (
                  <>
                    <Loader2 size={18} className="mr-2 spin-loader" />
                    Starting Ride...
                  </>
                ) : (
                  "Start Ride →"
                )}
              </Button>
            </motion.div>
          </motion.div>
        ) : rideStatus === "in_progress" ? (
          <motion.div
            key="in_progress"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex-1 flex flex-col"
          >
            {/* Status header */}
            <div className="flex flex-col items-center mb-8">
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
            </div>

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
                    <p className="font-bold text-foreground">
                      {ride.customerName}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Your Passenger
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className="font-bold text-brand text-xl">
                      ₹{ride.fare}
                    </span>
                  </div>
                </div>

                {/* Route */}
                <RideRoute pickup={ride.pickup} drop={ride.drop} />

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
          </motion.div>
        ) : (
          /* Loading state while we wait for the first poll */
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="text-brand spin-loader" />
              <p className="text-muted-foreground text-sm">
                Loading ride info...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RideRoute({ pickup, drop }: { pickup: string; drop: string }) {
  return (
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
          <p className="text-foreground font-semibold">{pickup}</p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Navigation size={14} style={{ color: "oklch(0.78 0.17 142)" }} />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Drop
            </p>
          </div>
          <p className="text-foreground font-semibold">{drop}</p>
        </div>
      </div>
    </div>
  );
}
