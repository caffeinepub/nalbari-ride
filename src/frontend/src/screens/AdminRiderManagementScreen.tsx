import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Bike,
  CheckCircle,
  FileImage,
  Loader2,
  RefreshCw,
  UserX,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type StoredRider,
  activateRider,
  approveRider,
  getAllRiders,
  rejectRider,
  suspendRider,
} from "../utils/rideStore";

function maskLicence(licence: string): string {
  if (licence.length <= 4) return licence || "—";
  return `DL...${licence.slice(-4)}`;
}

function maskAadhaar(aadhaar: string): string {
  const digits = aadhaar.replace(/\D/g, "");
  if (digits.length < 4) return aadhaar || "—";
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
        <CheckCircle size={10} />
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
      Pending Verification
    </span>
  );
}

export default function AdminRiderManagementScreen() {
  const [riders, setRiders] = useState<StoredRider[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewingAadhaar, setViewingAadhaar] = useState<string | null>(null);

  const fetchRiders = useCallback(() => {
    setRiders(getAllRiders());
  }, []);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  const handleVerify = (phone: string, status: "approved" | "rejected") => {
    setActionLoading(`verify-${phone}`);
    try {
      if (status === "approved") {
        approveRider(phone);
      } else {
        rejectRider(phone);
      }
      toast.success(`Rider ${status === "approved" ? "approved" : "rejected"}`);
      fetchRiders();
    } catch (err) {
      console.error(err);
      toast.error("Action failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = (phone: string) => {
    setActionLoading(`suspend-${phone}`);
    try {
      suspendRider(phone);
      toast.success("Rider suspended");
      fetchRiders();
    } catch (err) {
      console.error(err);
      toast.error("Action failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = (phone: string) => {
    setActionLoading(`activate-${phone}`);
    try {
      activateRider(phone);
      toast.success("Rider activated");
      fetchRiders();
    } catch (err) {
      console.error(err);
      toast.error("Action failed.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div data-ocid="admin_riders.page" className="pb-6">
      {/* Aadhaar Image Dialog */}
      <Dialog
        open={viewingAadhaar !== null}
        onOpenChange={(open) => {
          if (!open) setViewingAadhaar(null);
        }}
      >
        <DialogContent
          data-ocid="admin_riders.dialog"
          className="max-w-sm mx-auto rounded-2xl p-0 overflow-hidden"
          style={{
            background: "oklch(0.15 0.015 265)",
            border: "1px solid oklch(0.28 0.02 265)",
          }}
        >
          <DialogHeader className="px-5 pt-5 pb-3">
            <DialogTitle
              className="font-display text-lg font-bold"
              style={{ color: "oklch(0.97 0.01 90)" }}
            >
              Aadhaar Card
            </DialogTitle>
          </DialogHeader>
          <div className="px-5 pb-5">
            {viewingAadhaar && (
              <img
                src={viewingAadhaar}
                alt="Rider Aadhaar card"
                className="w-full rounded-xl object-contain"
                style={{ maxHeight: "320px" }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

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

      {riders.length === 0 ? (
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

                  {/* Aadhaar card image section */}
                  <div className="pt-1">
                    <span
                      className="text-xs block mb-2"
                      style={{ color: "oklch(0.5 0.03 265)" }}
                    >
                      Aadhaar Card
                    </span>
                    {rider.aadhaarImage ? (
                      <button
                        type="button"
                        data-ocid={`admin_riders.upload_button.${index + 1}`}
                        onClick={() => setViewingAadhaar(rider.aadhaarImage)}
                        className="relative overflow-hidden rounded-xl transition-all active:scale-95 hover:opacity-90"
                        style={{
                          width: "80px",
                          height: "80px",
                          border: "1px solid oklch(0.78 0.17 142 / 35%)",
                        }}
                        title="View Aadhaar card"
                      >
                        <img
                          src={rider.aadhaarImage}
                          alt="Aadhaar card"
                          className="w-full h-full object-cover"
                        />
                        <div
                          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          style={{
                            background: "oklch(0.13 0.01 265 / 70%)",
                          }}
                        >
                          <FileImage
                            size={18}
                            style={{ color: "oklch(0.85 0.15 142)" }}
                          />
                        </div>
                      </button>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold"
                        style={{
                          background: "oklch(0.82 0.14 80 / 12%)",
                          color: "oklch(0.82 0.14 80)",
                          border: "1px solid oklch(0.82 0.14 80 / 28%)",
                        }}
                      >
                        <AlertCircle size={10} />
                        No Aadhaar uploaded
                      </span>
                    )}
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
                      data-ocid={`admin_riders.delete_button.${index + 1}`}
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
                      data-ocid={`admin_riders.secondary_button.${index + 1}`}
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
