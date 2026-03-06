import { Bike, CheckCircle, Loader2, RefreshCw, UserX } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type StoredRider,
  activateRider,
  getAllRiders,
  suspendRider,
} from "../utils/rideStore";

export default function AdminSuspendActivateScreen() {
  const [riders, setRiders] = useState<StoredRider[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRiders = useCallback(() => {
    setRiders(getAllRiders());
  }, []);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

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

  const activeRiders = riders.filter((r) => r.accountStatus === "active");
  const suspendedRiders = riders.filter((r) => r.accountStatus === "suspended");

  return (
    <div data-ocid="admin_suspend.page" className="pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <h2
            className="font-display text-xl font-bold"
            style={{ color: "oklch(0.97 0.01 90)" }}
          >
            Suspend / Activate
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.55 0.03 265)" }}
          >
            Manage rider account access
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

      <div className="px-4 space-y-5">
        {/* Active Riders section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "oklch(0.78 0.17 142)" }}
            />
            <h3
              className="font-display font-bold text-sm"
              style={{ color: "oklch(0.78 0.17 142)" }}
            >
              Active Riders ({activeRiders.length})
            </h3>
          </div>

          {activeRiders.length === 0 ? (
            <div
              className="rounded-xl px-4 py-6 text-center"
              style={{
                background: "oklch(0.15 0.01 265)",
                border: "1px solid oklch(0.22 0.01 265)",
              }}
            >
              <p className="text-sm" style={{ color: "oklch(0.45 0.03 265)" }}>
                No active riders
              </p>
            </div>
          ) : (
            <div data-ocid="admin_suspend.list" className="space-y-2">
              {activeRiders.map((rider, index) => (
                <motion.div
                  key={rider.phone}
                  data-ocid={`admin_suspend.item.${index + 1}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: "oklch(0.17 0.015 265)",
                    border: "1px solid oklch(0.78 0.17 142 / 20%)",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "oklch(0.78 0.17 142 / 12%)",
                      }}
                    >
                      <Bike
                        size={16}
                        style={{ color: "oklch(0.78 0.17 142)" }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="font-semibold text-sm truncate"
                        style={{ color: "oklch(0.9 0.01 90)" }}
                      >
                        {rider.name}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: "oklch(0.5 0.03 265)" }}
                      >
                        {rider.phone}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    data-ocid={`admin_suspend.delete_button.${index + 1}`}
                    onClick={() => handleSuspend(rider.phone)}
                    disabled={actionLoading === `suspend-${rider.phone}`}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
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
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          className="border-t"
          style={{ borderColor: "oklch(0.22 0.01 265)" }}
        />

        {/* Suspended Riders section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "oklch(0.75 0.16 27)" }}
            />
            <h3
              className="font-display font-bold text-sm"
              style={{ color: "oklch(0.75 0.16 27)" }}
            >
              Suspended Riders ({suspendedRiders.length})
            </h3>
          </div>

          {suspendedRiders.length === 0 ? (
            <div
              className="rounded-xl px-4 py-6 text-center"
              style={{
                background: "oklch(0.15 0.01 265)",
                border: "1px solid oklch(0.22 0.01 265)",
              }}
            >
              <p className="text-sm" style={{ color: "oklch(0.45 0.03 265)" }}>
                No suspended riders
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {suspendedRiders.map((rider, index) => (
                <motion.div
                  key={rider.phone}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: "oklch(0.17 0.015 265)",
                    border: "1px solid oklch(0.63 0.22 27 / 20%)",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "oklch(0.63 0.22 27 / 12%)",
                      }}
                    >
                      <UserX
                        size={16}
                        style={{ color: "oklch(0.75 0.16 27)" }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="font-semibold text-sm truncate"
                        style={{ color: "oklch(0.9 0.01 90)" }}
                      >
                        {rider.name}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: "oklch(0.5 0.03 265)" }}
                      >
                        {rider.phone}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    data-ocid={`admin_suspend.primary_button.${index + 1}`}
                    onClick={() => handleActivate(rider.phone)}
                    disabled={actionLoading === `activate-${rider.phone}`}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                    style={{
                      background: "oklch(0.78 0.17 142 / 15%)",
                      border: "1px solid oklch(0.78 0.17 142 / 30%)",
                      color: "oklch(0.78 0.17 142)",
                    }}
                  >
                    {actionLoading === `activate-${rider.phone}` ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <CheckCircle size={12} />
                    )}
                    Activate
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
