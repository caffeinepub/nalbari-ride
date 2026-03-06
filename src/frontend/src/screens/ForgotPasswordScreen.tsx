import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bike, KeyRound, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { resetPassword } from "../utils/rideStore";

interface Props {
  onBack: () => void;
}

export default function ForgotPasswordScreen({ onBack }: Props) {
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    if (!phone.trim() || phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (!newPassword.trim() || newPassword.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }

    setLoading(true);
    try {
      const success = resetPassword(phone.trim(), newPassword.trim());
      if (success) {
        toast.success("Password reset successfully! Please login.");
        onBack();
      } else {
        toast.error(
          "Phone number not found. Please check your number or register.",
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(
        "Reset failed. Please check your phone number and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-ocid="forgot_password.page"
      className="screen-fill px-6 pt-14 pb-10 flex flex-col hero-pattern fade-in"
    >
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <button
          type="button"
          data-ocid="forgot_password.back_button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:border-primary transition-colors"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
      </motion.div>

      {/* Icon & heading */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center mb-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-brand orange-glow flex items-center justify-center mb-4">
          <KeyRound size={30} className="text-background" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Reset Password
        </h1>
        <p className="text-muted-foreground text-sm mt-1 text-center max-w-xs">
          Enter your phone number and choose a new password
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex-1"
      >
        <div className="flex flex-col gap-5">
          {/* Bike icon brand line */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: "oklch(0.72 0.19 45 / 8%)",
              border: "1px solid oklch(0.72 0.19 45 / 20%)",
            }}
          >
            <Bike size={14} style={{ color: "oklch(0.78 0.17 142)" }} />
            <span
              className="text-xs font-semibold"
              style={{ color: "oklch(0.78 0.17 142)" }}
            >
              Customer &amp; Rider Password Reset
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="forgot-phone"
              className="text-foreground/80 text-sm font-medium"
            >
              Phone Number
            </Label>
            <Input
              id="forgot-phone"
              data-ocid="forgot_password.phone_input"
              placeholder="Your 10-digit number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              inputMode="numeric"
              className="h-13 rounded-xl bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="forgot-password"
              className="text-foreground/80 text-sm font-medium"
            >
              New Password
            </Label>
            <Input
              id="forgot-password"
              data-ocid="forgot_password.password_input"
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReset()}
              className="h-13 rounded-xl bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <div className="mt-8 flex flex-col gap-4">
        <Button
          data-ocid="forgot_password.submit_button"
          onClick={handleReset}
          disabled={loading}
          className="w-full h-14 rounded-2xl font-bold text-base bg-primary text-primary-foreground hover:bg-primary/90 orange-glow transition-all"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="mr-2 spin-loader" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>

        <p className="text-center text-muted-foreground text-sm">
          Remember your password?{" "}
          <button
            type="button"
            onClick={onBack}
            className="text-brand font-semibold hover:underline"
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}
