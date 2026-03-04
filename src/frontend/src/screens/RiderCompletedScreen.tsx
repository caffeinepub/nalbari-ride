import { Button } from "@/components/ui/button";
import { CheckCircle2, IndianRupee, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface Props {
  fare: bigint;
  onFinish: () => void;
}

export default function RiderCompletedScreen({ fare, onFinish }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  return (
    <div
      data-ocid="ride_completed.page"
      className="screen-fill px-5 pt-12 pb-8 flex flex-col items-center"
    >
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-28 h-28 rounded-full flex items-center justify-center mb-6"
        style={{
          background: "oklch(0.78 0.17 142 / 15%)",
          border: "2px solid oklch(0.78 0.17 142 / 40%)",
        }}
      >
        <CheckCircle2 size={56} style={{ color: "oklch(0.78 0.17 142)" }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <h1 className="font-display text-3xl font-extrabold text-foreground mb-2">
          Ride Completed!
        </h1>
        <p className="text-muted-foreground">Great work! Keep it up 🎉</p>
      </motion.div>

      {/* Fare earned */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="w-full rounded-3xl p-6 mb-6 flex flex-col items-center"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.72 0.19 45) 0%, oklch(0.62 0.22 38) 100%)",
        }}
      >
        <p className="text-primary-foreground/80 text-sm font-medium mb-2">
          Fare Earned
        </p>
        <div className="flex items-baseline gap-1">
          <IndianRupee size={28} className="text-primary-foreground" />
          <span className="font-display text-5xl font-extrabold text-primary-foreground">
            {fare.toString()}
          </span>
        </div>
      </motion.div>

      {/* Star rating (visual only) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full rounded-3xl bg-card border border-border p-6 mb-6 flex flex-col items-center gap-4"
      >
        <p className="font-display font-semibold text-foreground">
          Rate this ride
        </p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                size={36}
                fill={
                  star <= (hovered || rating)
                    ? "oklch(0.72 0.19 45)"
                    : "transparent"
                }
                stroke={
                  star <= (hovered || rating)
                    ? "oklch(0.72 0.19 45)"
                    : "oklch(0.45 0.02 265)"
                }
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground text-sm"
          >
            {rating === 5
              ? "Excellent!"
              : rating === 4
                ? "Good ride!"
                : rating === 3
                  ? "Alright"
                  : rating === 2
                    ? "Could be better"
                    : "Poor"}
          </motion.p>
        )}
      </motion.div>

      <div className="flex-1" />

      {/* Finish CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full"
      >
        <Button
          data-ocid="ride_completed.finish_button"
          onClick={onFinish}
          className="w-full h-14 rounded-2xl font-bold text-base bg-primary text-primary-foreground hover:bg-primary/90 orange-glow transition-all"
        >
          Back to Dashboard
        </Button>
      </motion.div>
    </div>
  );
}
