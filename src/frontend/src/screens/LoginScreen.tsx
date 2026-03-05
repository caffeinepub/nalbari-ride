import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bike, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import type { StoredUser } from "../types";

interface Props {
  onSuccess: (user: StoredUser) => void;
  onRegister: () => void;
  onForgotPassword: () => void;
}

export default function LoginScreen({
  onSuccess,
  onRegister,
  onForgotPassword,
}: Props) {
  const { actor } = useActor();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      toast.error("Please enter phone and password");
      return;
    }
    if (!actor) {
      toast.error("Connection not ready. Please wait.");
      return;
    }

    setLoading(true);
    try {
      const user = await actor.loginUser(phone.trim(), password.trim());
      if (user) {
        // Re-associate this Principal with the phone number so backend
        // phone-ownership checks (createRide, acceptRide, etc.) pass correctly.
        try {
          await actor.saveCallerUserProfile({
            name: user.name,
            phone: user.phone,
            role: user.role,
          });
        } catch (profileErr) {
          // Non-fatal — proceed with login even if profile save fails
          console.warn("Could not save caller profile:", profileErr);
        }

        const stored: StoredUser = {
          id: user.id.toString(),
          name: user.name,
          phone: user.phone,
          role: user.role as "customer" | "rider",
        };
        toast.success(`Welcome back, ${user.name}!`);
        onSuccess(stored);
      } else {
        toast.error("Invalid phone number or password");
      }
    } catch (err) {
      console.error(err);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-ocid="login.page"
      className="screen-fill px-6 pt-16 pb-10 flex flex-col hero-pattern fade-in"
    >
      {/* Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center mb-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-brand orange-glow flex items-center justify-center mb-4">
          <Bike size={32} className="text-background" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Welcome Back
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Sign in to your account
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex-1"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="login-phone"
              className="text-foreground/80 text-sm font-medium"
            >
              Phone Number
            </Label>
            <Input
              id="login-phone"
              data-ocid="login.phone_input"
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
              htmlFor="login-password"
              className="text-foreground/80 text-sm font-medium"
            >
              Password
            </Label>
            <Input
              id="login-password"
              data-ocid="login.password_input"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="h-13 rounded-xl bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
            />
            <div className="flex justify-end mt-0.5">
              <button
                type="button"
                data-ocid="login.forgot_password_button"
                onClick={onForgotPassword}
                className="text-xs text-muted-foreground hover:text-brand transition-colors font-medium"
              >
                Forgot password?
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <div className="mt-8 flex flex-col gap-4">
        <Button
          data-ocid="login.submit_button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-14 rounded-2xl font-bold text-base bg-primary text-primary-foreground hover:bg-primary/90 orange-glow transition-all"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="mr-2 spin-loader" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        <p className="text-center text-muted-foreground text-sm">
          New here?{" "}
          <button
            type="button"
            onClick={onRegister}
            className="text-brand font-semibold hover:underline"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}
