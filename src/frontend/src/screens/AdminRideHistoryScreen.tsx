import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Calendar,
  IndianRupee,
  ListOrdered,
  RefreshCw,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Ride } from "../backend.d";
import { useActor } from "../hooks/useActor";

type FilterTab = "all" | "pending" | "accepted" | "completed" | "cancelled";

const TABS: { label: string; value: FilterTab }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / 1_000_000n);
  if (ms === 0) return "—";
  const date = new Date(ms);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function RideStatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase();
  let bg: string;
  let color: string;
  let border: string;
  let label: string;

  switch (lower) {
    case "completed":
      bg = "oklch(0.78 0.17 142 / 15%)";
      color = "oklch(0.78 0.17 142)";
      border = "oklch(0.78 0.17 142 / 30%)";
      label = "Completed";
      break;
    case "accepted":
    case "in_progress":
      bg = "oklch(0.65 0.18 260 / 15%)";
      color = "oklch(0.72 0.18 260)";
      border = "oklch(0.65 0.18 260 / 30%)";
      label = "Accepted";
      break;
    case "cancelled":
      bg = "oklch(0.63 0.22 27 / 15%)";
      color = "oklch(0.75 0.16 27)";
      border = "oklch(0.63 0.22 27 / 30%)";
      label = "Cancelled";
      break;
    default:
      bg = "oklch(0.82 0.14 80 / 15%)";
      color = "oklch(0.82 0.14 80)";
      border = "oklch(0.82 0.14 80 / 30%)";
      label = "Pending";
  }

  return (
    <span
      className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: bg, color, border: `1px solid ${border}` }}
    >
      {label}
    </span>
  );
}

export default function AdminRideHistoryScreen() {
  const { actor } = useActor();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const fetchRides = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const data = await actor.getAllRides();
      // Sort newest first
      const sorted = [...data].sort((a, b) =>
        b.createdAt > a.createdAt ? 1 : -1,
      );
      setRides(sorted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load ride history");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  const filteredRides = rides.filter((r) => {
    if (activeTab === "all") return true;
    return r.status.toLowerCase() === activeTab;
  });

  if (loading) {
    return (
      <div data-ocid="admin_rides.loading_state" className="p-4 space-y-4">
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
              className="h-5 w-32"
              style={{ background: "oklch(0.22 0.02 265)" }}
            />
            <Skeleton
              className="h-4 w-48"
              style={{ background: "oklch(0.22 0.02 265)" }}
            />
            <Skeleton
              className="h-4 w-24"
              style={{ background: "oklch(0.22 0.02 265)" }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div data-ocid="admin_rides.page" className="pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <h2
            className="font-display text-xl font-bold"
            style={{ color: "oklch(0.97 0.01 90)" }}
          >
            Ride History
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.55 0.03 265)" }}
          >
            {rides.length} total ride{rides.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={fetchRides}
          className="p-2.5 rounded-xl transition-colors"
          style={{
            background: "oklch(0.22 0.02 265)",
            color: "oklch(0.65 0.03 265)",
          }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="px-4 mb-4">
        <div
          className="flex gap-1 p-1 rounded-xl overflow-x-auto scrollbar-none"
          style={{ background: "oklch(0.15 0.01 265)" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              data-ocid="admin_rides.tab"
              onClick={() => setActiveTab(tab.value)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={
                activeTab === tab.value
                  ? {
                      background: "oklch(0.65 0.18 260)",
                      color: "oklch(0.97 0.01 90)",
                    }
                  : {
                      color: "oklch(0.55 0.03 265)",
                    }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ride list */}
      {filteredRides.length === 0 ? (
        <motion.div
          data-ocid="admin_rides.empty_state"
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
            <ListOrdered size={28} style={{ color: "oklch(0.45 0.03 265)" }} />
          </div>
          <p
            className="font-semibold text-base mb-1"
            style={{ color: "oklch(0.65 0.02 265)" }}
          >
            No rides found
          </p>
          <p className="text-sm" style={{ color: "oklch(0.45 0.02 265)" }}>
            {activeTab === "all"
              ? "No rides have been booked yet"
              : `No ${activeTab} rides`}
          </p>
        </motion.div>
      ) : (
        <div data-ocid="admin_rides.list" className="px-4 space-y-3">
          {filteredRides.map((ride, index) => (
            <motion.div
              key={ride.id.toString()}
              data-ocid={`admin_rides.item.${index + 1}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-2xl p-4"
              style={{
                background: "oklch(0.17 0.015 265)",
                border: "1px solid oklch(0.28 0.02 265)",
              }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                    style={{
                      background: "oklch(0.65 0.18 260 / 15%)",
                      color: "oklch(0.72 0.18 260)",
                    }}
                  >
                    #{Number(ride.id)}
                  </span>
                  <RideStatusBadge status={ride.status} />
                </div>
                <div
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "oklch(0.5 0.03 265)" }}
                >
                  <Calendar size={11} />
                  {formatDate(ride.createdAt)}
                </div>
              </div>

              {/* Route */}
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3"
                style={{ background: "oklch(0.13 0.01 265)" }}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs truncate"
                    style={{ color: "oklch(0.55 0.03 265)" }}
                  >
                    From
                  </p>
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: "oklch(0.9 0.01 90)" }}
                  >
                    {ride.pickup}
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  style={{ color: "oklch(0.45 0.03 265)", flexShrink: 0 }}
                />
                <div className="flex-1 min-w-0 text-right">
                  <p
                    className="text-xs truncate"
                    style={{ color: "oklch(0.55 0.03 265)" }}
                  >
                    To
                  </p>
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: "oklch(0.9 0.01 90)" }}
                  >
                    {ride.drop}
                  </p>
                </div>
              </div>

              {/* Bottom details */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <User size={12} style={{ color: "oklch(0.5 0.03 265)" }} />
                    <span
                      className="text-xs"
                      style={{ color: "oklch(0.65 0.02 265)" }}
                    >
                      {ride.customerName}
                    </span>
                  </div>
                  {ride.driverName && (
                    <div className="flex items-center gap-1">
                      <span
                        className="text-xs"
                        style={{ color: "oklch(0.45 0.03 265)" }}
                      >
                        ·
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "oklch(0.65 0.18 260)" }}
                      >
                        {ride.driverName}
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className="flex items-center gap-0.5 font-bold text-sm"
                  style={{ color: "oklch(0.72 0.18 260)" }}
                >
                  <IndianRupee size={13} />
                  {ride.fare.toString()}
                </div>
              </div>

              {ride.bikeNumber && (
                <p
                  className="text-xs mt-1.5"
                  style={{ color: "oklch(0.45 0.03 265)" }}
                >
                  Bike: {ride.bikeNumber}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
