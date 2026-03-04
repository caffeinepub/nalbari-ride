import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bike, Loader2, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

interface Props {
  role: "customer" | "rider";
  onSuccess: () => void;
  onLogin: () => void;
}

export default function RegisterScreen({ role, onSuccess, onLogin }: Props) {
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (phone.length < 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    if (!actor) {
      toast.error("Connection not ready. Please wait.");
      return;
    }

    setLoading(true);
    try {
      const result = await actor.registerUser(
        name.trim(),
        phone.trim(),
        password.trim(),
        role,
      );
      if (
        result.toLowerCase().includes("success") ||
        result.toLowerCase().includes("registered")
      ) {
        toast.success("Account created! Please login.");
        onSuccess();
      } else if (
        result.toLowerCase().includes("already") ||
        result.toLowerCase().includes("exists")
      ) {
        toast.error("Phone number already registered. Please login.");
      } else {
        toast.success("Account created! Please login.");
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isCustomer = role === "customer";

  return (
    <div
      data-ocid="register.page"
      className="screen-fill px-6 pt-12 pb-10 flex flex-col fade-in"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={onLogin}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:border-primary transition-colors"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div className="flex-1" />
        <Badge
          className="px-3 py-1.5 rounded-xl font-semibold text-sm"
          style={
            isCustomer
              ? {
                  background: "oklch(0.72 0.19 45 / 20%)",
                  color: "oklch(0.85 0.15 45)",
                  border: "1px solid oklch(0.72 0.19 45 / 30%)",
                }
              : {
                  background: "oklch(0.78 0.17 142 / 20%)",
                  color: "oklch(0.85 0.15 142)",
                  border: "1px solid oklch(0.78 0.17 142 / 30%)",
                }
          }
        >
          {isCustomer ? (
            <User size={12} className="inline mr-1.5" />
          ) : (
            <Bike size={12} className="inline mr-1.5" />
          )}
          {isCustomer ? "Customer" : "Rider"}
        </Badge>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1"
      >
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">
          Create Account
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Join Nalbari Ride today
        </p>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="reg-name"
              className="text-foreground/80 text-sm font-medium"
            >
              Full Name
            </Label>
            <Input
              id="reg-name"
              data-ocid="register.name_input"
              placeholder="e.g. Rahul Das"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-13 rounded-xl bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="reg-phone"
              className="text-foreground/80 text-sm font-medium"
            >
              Phone Number
            </Label>
            <Input
              id="reg-phone"
              data-ocid="register.phone_input"
              placeholder="10-digit mobile number"
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
              htmlFor="reg-password"
              className="text-foreground/80 text-sm font-medium"
            >
              Password
            </Label>
            <Input
              id="reg-password"
              data-ocid="register.password_input"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-13 rounded-xl bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <div className="mt-8 flex flex-col gap-4">
        <Button
          data-ocid="register.submit_button"
          onClick={handleRegister}
          disabled={loading}
          className="w-full h-14 rounded-2xl font-bold text-base bg-primary text-primary-foreground hover:bg-primary/90 orange-glow transition-all"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="mr-2 spin-loader" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>

        <p className="text-center text-muted-foreground text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onLogin}
            className="text-brand font-semibold hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
