import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  AlertTriangle,
  Bike,
  CheckCircle,
  Loader2,
  RefreshCw,
  UserX,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { RiderDetails } from "../backend.d";
import { useActor } from "../hooks/useActor";

function maskLicence(licence: string): string {
  if (licence.length <= 4) return licence;
  return `DL...${licence.slice(-4)}`;
}

function maskAadhaar(aadhaar: string): string {
  const digits = aadhaar.replace(/\D/g, "");
  if (digits.length < 4) return aadhaar;
  return `XXXX-XXXX-${digits.slice(-4)}`;
}

function StatusBadge({
  status,
  type,
}: { status: string; type: "account" | "verification" }) {
  const lower = status.toLowerCase();

  if (type === "account") {
    if (lower === "active") {
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: "oklch(0.78 0.17 142 / 15%)",
            color: "oklch(0.78 0.17 142)",
            border: "1px solid oklch(0.78 0.17 142 / 30%)",
          }}
        >
          <CheckCircle size={10} />
          Active
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{
          background: "oklch(0.63 0.22 27 / 15%)",
          color: "oklch(0.75 0.16 27)",
          border: "1px solid oklch(0.63 0.22 27 / 30%)",
        }}
      >
        <UserX size={10} />
        Suspended
      </span>
    );
  }

  // verification
  if (lower === "approved") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{
          background: "oklch(0.78 0.17 142 / 15%)",
          color: "oklch(0.78 0.17 142)",
          border: "1px solid oklch(0.78 0.17 142 / 30%)",
        }}
      >
        Approved
      </span>
    );
  }
  if (lower === "rejected") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{
          background: "oklch(0.63 0.22 27 / 15%)",
          color: "oklch(0.75 0.16 27)",
          border: "1px solid oklch(0.63 0.22 27 / 30%)",
        }}
      >
        Rejected
      </span>
    );
  }
  // pending
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        background: "oklch(0.82 0.14 80 / 15%)",
        color: "oklch(0.82 0.14 80)",
        border: "1px solid oklch(0.82 0.14 80 / 30%)",
      }}
    >
      Pending
    </span>
  );
}

export default function AdminRiderManagementScreen() {
  const { actor } = useActor();
  const [riders, setRiders] = useState<RiderDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRiders = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    setFetchError(null);
    try {
      const data = await actor.getAllRiders();
      setRiders(data);
    } catch (err) {
      console.error(err);
      setFetchError(
        "Admin data requires a special connection. Please reload the page and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  const handleVerify = async (
    phone: string,
    status: "approved" | "rejected",
  ) => {
    if (!actor) return;
    setActionLoading(`verify-${phone}`);
    try {
      await actor.verifyRider(phone, status);
      toast.success(`Rider ${status === "approved" ? "approved" : "rejected"}`);
      await fetchRiders();
    } catch (err) {
      console.error(err);
      toast.error("Action requires admin session. Please reload.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (phone: string) => {
    if (!actor) return;
    setActionLoading(`suspend-${phone}`);
    try {
      await actor.suspendRider(phone);
      toast.success("Rider suspended");
      await fetchRiders();
    } catch (err) {
      console.error(err);
      toast.error("Action requires admin session. Please reload.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (phone: string) => {
    if (!actor) return;
    setActionLoading(`activate-${phone}`);
    try {
      await actor.activateRider(phone);
      toast.success("Rider activated");
      await fetchRiders();
    } catch (err) {
      console.error(err);
      toast.error("Action requires admin session. Please reload.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div data-ocid="admin_riders.loading_state" className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl p-5 space-y-3"
            style={{
              background: "oklch(0.17 0.015 265)",
              border: "1px solid oklch(0.28 0.02 265)",
            }}
          >
            <Skeleton
              className="h-5 w-36"
              style={{ background: "oklch(0.22 0.02 265)" }}
            />
            <Skeleton
              className="h-4 w-28"
              style={{ background: "oklch(0.22 0.02 265)" }}
            />
            <Skeleton
              className="h-4 w-40"
              style={{ background: "oklch(0.22 0.02 265)" }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div data-ocid="admin_riders.page" className="pb-6">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <h2
            className="font-display text-xl font-bold"
            style={{ color: "oklch(0.97 0.01 90)" }}
          >
            Rider Management
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.55 0.03 265)" }}
          >
            {riders.length} rider{riders.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button
          type="button"
          onClick={fetchRiders}
          className="p-2.5 rounded-xl transition-colors"
          style={{
            background: "oklch(0.22 0.02 265)",
            color: "oklch(0.65 0.03 265)",
          }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {fetchError ? (
        <motion.div
          data-ocid="admin_riders.error_state"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 rounded-2xl p-4 flex items-start gap-3"
          style={{
            background: "oklch(0.63 0.22 27 / 10%)",
            border: "1px solid oklch(0.63 0.22 27 / 30%)",
          }}
        >
          <AlertTriangle
            size={18}
            className="flex-shrink-0 mt-0.5"
            style={{ color: "oklch(0.75 0.16 27)" }}
          />
          <div>
            <p
              className="text-sm font-semibold mb-1"
              style={{ color: "oklch(0.75 0.16 27)" }}
            >
              Data unavailable
            </p>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "oklch(0.55 0.03 265)" }}
            >
              {fetchError}
            </p>
            <button
              type="button"
              onClick={fetchRiders}
              className="mt-2 text-xs font-semibold underline"
              style={{ color: "oklch(0.72 0.18 260)" }}
            >
              Retry
            </button>
          </div>
        </motion.div>
      ) : riders.length === 0 ? (
        <motion.div
          data-ocid="admin_riders.empty_state"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 px-8 text-center"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "oklch(0.22 0.02 265)",
              border: "1px solid oklch(0.28 0.02 265)",
            }}
          >
            <Users size={28} style={{ color: "oklch(0.45 0.03 265)" }} />
          </div>
          <p
            className="font-semibold text-base mb-1"
            style={{ color: "oklch(0.65 0.02 265)" }}
          >
            No riders yet
          </p>
          <p className="text-sm" style={{ color: "oklch(0.45 0.02 265)" }}>
            Riders will appear here once they register
          </p>
        </motion.div>
      ) : (
        <div data-ocid="admin_riders.list" className="px-4 space-y-4">
          {riders.map((rider, index) => {
            const isActionPending =
              actionLoading === `suspend-${rider.phone}` ||
              actionLoading === `activate-${rider.phone}` ||
              actionLoading === `verify-${rider.phone}`;

            return (
              <motion.div
                key={rider.phone}
                data-ocid={`admin_riders.item.${index + 1}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl p-5"
                style={{
                  background: "oklch(0.17 0.015 265)",
                  border: `1px solid ${
                    rider.accountStatus === "suspended"
                      ? "oklch(0.63 0.22 27 / 25%)"
                      : "oklch(0.28 0.02 265)"
                  }`,
                }}
              >
                {/* Top row: name + status badges */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p
                      className="font-display font-bold text-base"
                      style={{ color: "oklch(0.97 0.01 90)" }}
                    >
                      {rider.name}
                    </p>
                    <p
                      className="text-sm mt-0.5"
                      style={{ color: "oklch(0.55 0.03 265)" }}
                    >
                      {rider.phone}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <StatusBadge status={rider.accountStatus} type="account" />
                    <StatusBadge
                      status={rider.verificationStatus}
                      type="verification"
                    />
                  </div>
                </div>

                {/* Details */}
                <div
                  className="rounded-xl p-3 mb-4 space-y-2"
                  style={{ background: "oklch(0.13 0.01 265)" }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs"
                      style={{ color: "oklch(0.5 0.03 265)" }}
                    >
                      Bike
                    </span>
                    <span
                      className="text-xs font-mono font-semibold"
                      style={{ color: "oklch(0.8 0.02 265)" }}
                    >
                      {rider.bikeNumber || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs"
                      style={{ color: "oklch(0.5 0.03 265)" }}
                    >
                      Licence
                    </span>
                    <span
                      className="text-xs font-mono font-semibold"
                      style={{ color: "oklch(0.8 0.02 265)" }}
                    >
                      {maskLicence(rider.licenceNumber || "")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs"
                      style={{ color: "oklch(0.5 0.03 265)" }}
                    >
                      Aadhaar
                    </span>
                    <span
                      className="text-xs font-mono font-semibold"
                      style={{ color: "oklch(0.8 0.02 265)" }}
                    >
                      {maskAadhaar(rider.aadhaarNumber || "")}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  {/* Verification actions */}
                  {rider.verificationStatus === "pending" && (
                    <>
                      <button
                        type="button"
                        data-ocid={`admin_riders.primary_button.${index + 1}`}
                        onClick={() => handleVerify(rider.phone, "approved")}
                        disabled={isActionPending}
                        className="flex-1 h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                        style={{
                          background: "oklch(0.78 0.17 142 / 20%)",
                          border: "1px solid oklch(0.78 0.17 142 / 40%)",
                          color: "oklch(0.78 0.17 142)",
                        }}
                      >
                        {actionLoading === `verify-${rider.phone}` ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <CheckCircle size={12} />
                        )}
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerify(rider.phone, "rejected")}
                        disabled={isActionPending}
                        className="flex-1 h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                        style={{
                          background: "oklch(0.63 0.22 27 / 15%)",
                          border: "1px solid oklch(0.63 0.22 27 / 30%)",
                          color: "oklch(0.75 0.16 27)",
                        }}
                      >
                        <AlertCircle size={12} />
                        Reject
                      </button>
                    </>
                  )}

                  {/* Suspend/Activate */}
                  {rider.accountStatus === "active" ? (
                    <button
                      type="button"
                      data-ocid={`admin_riders.suspend_button.${index + 1}`}
                      onClick={() => handleSuspend(rider.phone)}
                      disabled={isActionPending}
                      className="flex-1 h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      style={{
                        background: "oklch(0.63 0.22 27 / 15%)",
                        border: "1px solid oklch(0.63 0.22 27 / 30%)",
                        color: "oklch(0.75 0.16 27)",
                      }}
                    >
                      {actionLoading === `suspend-${rider.phone}` ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <UserX size={12} />
                      )}
                      Suspend
                    </button>
                  ) : (
                    <button
                      type="button"
                      data-ocid={`admin_riders.primary_button.${index + 1}`}
                      onClick={() => handleActivate(rider.phone)}
                      disabled={isActionPending}
                      className="flex-1 h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      style={{
                        background: "oklch(0.78 0.17 142 / 20%)",
                        border: "1px solid oklch(0.78 0.17 142 / 40%)",
                        color: "oklch(0.78 0.17 142)",
                      }}
                    >
                      {actionLoading === `activate-${rider.phone}` ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Bike size={12} />
                      )}
                      Activate
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
