import { Bike, User } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  onSelectRole: (role: "customer" | "rider") => void;
  onLogin: (role: "customer" | "rider") => void;
}

export default function RoleSelectScreen({ onSelectRole, onLogin }: Props) {
  return (
    <div
      data-ocid="role_select.page"
      className="screen-fill hero-pattern px-6 pt-16 pb-10 flex flex-col"
    >
      {/* Logo area */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mb-12"
      >
        <div className="w-20 h-20 rounded-3xl bg-brand orange-glow flex items-center justify-center mb-6">
          <Bike size={40} className="text-background" />
        </div>
        <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">
          Nalbari Ride
        </h1>
        <p className="text-muted-foreground text-base mt-2 font-sans">
          Your local bike taxi
        </p>
      </motion.div>

      {/* Role selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex-1 flex flex-col justify-center gap-4"
      >
        <p className="text-center text-muted-foreground text-sm mb-2 uppercase tracking-widest font-medium">
          Get started as
        </p>

        {/* Customer button */}
        <button
          type="button"
          data-ocid="role_select.customer_button"
          onClick={() => onSelectRole("customer")}
          className="group relative flex items-center gap-5 rounded-2xl p-6 bg-card border border-border hover:border-primary transition-all duration-300 text-left orange-glow-sm hover:orange-glow"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
            <User size={28} className="text-brand" />
          </div>
          <div className="flex-1">
            <div className="font-display font-bold text-xl text-foreground">
              I'm a Customer
            </div>
            <div className="text-muted-foreground text-sm mt-0.5">
              Book a ride anywhere in Nalbari
            </div>
          </div>
          <div className="text-brand text-xl">›</div>
        </button>

        {/* Rider button */}
        <button
          type="button"
          data-ocid="role_select.rider_button"
          onClick={() => onSelectRole("rider")}
          className="group relative flex items-center gap-5 rounded-2xl p-6 bg-card border border-border hover:border-accent transition-all duration-300 text-left"
        >
          <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center group-hover:bg-accent/25 transition-colors">
            <Bike
              size={28}
              className="text-accent-foreground"
              style={{ color: "oklch(0.78 0.17 142)" }}
            />
          </div>
          <div className="flex-1">
            <div className="font-display font-bold text-xl text-foreground">
              I'm a Rider
            </div>
            <div className="text-muted-foreground text-sm mt-0.5">
              Earn money delivering rides
            </div>
          </div>
          <div
            className="text-accent-foreground text-xl"
            style={{ color: "oklch(0.78 0.17 142)" }}
          >
            ›
          </div>
        </button>
      </motion.div>

      {/* Login links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col items-center gap-2 mt-8"
      >
        <p className="text-muted-foreground text-sm">
          Already have an account?
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => onLogin("customer")}
            className="text-sm text-brand font-semibold hover:underline"
          >
            Login as Customer
          </button>
          <span className="text-border">|</span>
          <button
            type="button"
            onClick={() => onLogin("rider")}
            className="text-sm font-semibold hover:underline"
            style={{ color: "oklch(0.78 0.17 142)" }}
          >
            Login as Rider
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <p className="text-center text-muted-foreground text-xs mt-6">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Built with ♥ using caffeine.ai
        </a>
      </p>
    </div>
  );
}
