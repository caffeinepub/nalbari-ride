import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

const ADMIN_SESSION_KEY = "nalbari_admin_session";

interface Props {
  onSuccess: () => void;
  onBack: () => void;
}

/** Poll for actor to become available, up to 5 seconds. */
async function waitForActor(
  getActor: () => ReturnType<
    typeof import("../hooks/useActor").useActor
  >["actor"],
  timeoutMs = 5000,
  intervalMs = 500,
): Promise<ReturnType<typeof import("../hooks/useActor").useActor>["actor"]> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const a = getActor();
    if (a) return a;
    await new Promise((res) => setTimeout(res, intervalMs));
  }
  return getActor();
}

export default function AdminLoginScreen({ onSuccess, onBack }: Props) {
  const actorState = useActor();
  const actorRef = useRef(actorState.actor);
  actorRef.current = actorState.actor;

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleLogin = async () => {
    if (!password.trim()) {
      toast.error("Please enter the admin password");
      return;
    }

    setLoading(true);

    // If actor isn't ready yet, poll for it
    let currentActor = actorRef.current;
    if (!currentActor) {
      setConnecting(true);
      currentActor = await waitForActor(() => actorRef.current);
      setConnecting(false);
    }

    if (!currentActor) {
      toast.error("Could not connect to server. Please reload and try again.");
      setLoading(false);
      return;
    }

    try {
      const result = await currentActor.adminLogin(password.trim());
      if (result) {
        localStorage.setItem(ADMIN_SESSION_KEY, "true");
        toast.success("Welcome, Admin!");
        onSuccess();
      } else {
        toast.error("Invalid admin password");
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
      data-ocid="admin_login.page"
      className="screen-fill px-6 pt-12 pb-10 flex flex-col fade-in"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.11 0.01 265) 0%, oklch(0.09 0.015 260) 100%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
          style={{
            background: "oklch(0.17 0.015 265)",
            border: "1px solid oklch(0.28 0.02 265)",
          }}
        >
          <ArrowLeft size={18} style={{ color: "oklch(0.75 0.02 265)" }} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1"
      >
        {/* Admin badge icon */}
        <div className="mb-8 flex justify-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: "oklch(0.65 0.18 260 / 15%)",
              border: "2px solid oklch(0.65 0.18 260 / 30%)",
              boxShadow: "0 0 40px oklch(0.65 0.18 260 / 20%)",
            }}
          >
            <ShieldCheck size={38} style={{ color: "oklch(0.72 0.18 260)" }} />
          </div>
        </div>

        <h1
          className="font-display text-3xl font-bold text-center mb-1"
          style={{ color: "oklch(0.97 0.01 90)" }}
        >
          Admin Access
        </h1>
        <p
          className="text-sm text-center mb-10"
          style={{ color: "oklch(0.55 0.03 265)" }}
        >
          Ride Nalbari Management Portal
        </p>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="admin-password"
              className="text-sm font-medium"
              style={{ color: "oklch(0.72 0.02 265)" }}
            >
              Admin Password
            </Label>
            <div className="relative">
              <KeyRound
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: "oklch(0.65 0.18 260)" }}
              />
              <Input
                id="admin-password"
                data-ocid="admin_login.password_input"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="pl-10 h-13 rounded-xl"
                style={{
                  background: "oklch(0.17 0.015 265)",
                  border: "1px solid oklch(0.28 0.02 265)",
                  color: "oklch(0.97 0.01 90)",
                }}
              />
            </div>
          </div>

          {/* Connection status */}
          {connecting && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs"
              style={{
                background: "oklch(0.65 0.18 260 / 8%)",
                border: "1px solid oklch(0.65 0.18 260 / 20%)",
                color: "oklch(0.62 0.04 265)",
              }}
            >
              <Loader2
                size={14}
                className="animate-spin"
                style={{ color: "oklch(0.65 0.18 260)" }}
              />
              <span>Connecting to server, please wait...</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mt-8"
      >
        <Button
          data-ocid="admin_login.submit_button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-14 rounded-2xl font-bold text-base transition-all"
          style={{
            background: loading
              ? "oklch(0.45 0.12 260)"
              : "oklch(0.62 0.18 260)",
            color: "oklch(0.97 0.01 90)",
            boxShadow: "0 0 30px oklch(0.62 0.18 260 / 30%)",
          }}
        >
          {connecting ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Connecting...
            </>
          ) : loading ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Access Admin Panel →"
          )}
        </Button>
      </motion.div>
    </div>
  );
}
