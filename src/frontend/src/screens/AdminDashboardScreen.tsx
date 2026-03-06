import {
  Bike,
  History,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { type AdminStats, getAdminStats } from "../utils/rideStore";
import AdminRideHistoryScreen from "./AdminRideHistoryScreen";
import AdminRiderManagementScreen from "./AdminRiderManagementScreen";
import AdminSuspendActivateScreen from "./AdminSuspendActivateScreen";

type AdminTab = "dashboard" | "riders" | "history" | "suspend" | "settings";

const NAV_TABS = [
  { value: "dashboard" as AdminTab, icon: LayoutDashboard, label: "Home" },
  { value: "riders" as AdminTab, icon: Users, label: "Riders" },
  { value: "history" as AdminTab, icon: History, label: "History" },
  { value: "suspend" as AdminTab, icon: Shield, label: "Actions" },
  { value: "settings" as AdminTab, icon: Settings, label: "Settings" },
];

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accent: string;
  delay?: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-4 flex items-center gap-4"
      style={{
        background: "oklch(0.17 0.015 265)",
        border: `1px solid ${accent}20`,
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}15` }}
      >
        <Icon size={20} style={{ color: accent }} />
      </div>
      <div>
        <p
          className="font-display text-2xl font-extrabold"
          style={{ color: "oklch(0.97 0.01 90)" }}
        >
          {value}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0.03 265)" }}>
          {label}
        </p>
      </div>
    </motion.div>
  );
}

function AdminFareSettingsPanel() {
  const fareConfig = [
    { label: "Base Fare", value: "₹10", desc: "For first 3 km" },
    { label: "Base Distance", value: "3 km", desc: "Included in base fare" },
    { label: "Extra Rate", value: "₹5/km", desc: "Per km after base distance" },
    {
      label: "Example",
      value: "5 km = ₹20",
      desc: "10 + (5−3) × 5 = ₹20",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 pt-5 pb-6"
    >
      <div className="mb-6">
        <h1
          className="font-display text-2xl font-bold"
          style={{ color: "oklch(0.97 0.01 90)" }}
        >
          Fare Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.55 0.03 265)" }}>
          Current fare configuration
        </p>
      </div>

      {/* Fare formula card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl p-5 mb-5"
        style={{
          background: "oklch(0.17 0.015 265)",
          border: "1px solid oklch(0.28 0.02 265)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.82 0.14 80 / 15%)" }}
          >
            <IndianRupee size={16} style={{ color: "oklch(0.82 0.14 80)" }} />
          </div>
          <p
            className="font-display font-bold text-base"
            style={{ color: "oklch(0.97 0.01 90)" }}
          >
            Fare Formula
          </p>
        </div>
        <div
          className="rounded-xl p-3 mb-4 font-mono text-sm text-center"
          style={{
            background: "oklch(0.13 0.01 265)",
            color: "oklch(0.82 0.14 80)",
            border: "1px solid oklch(0.82 0.14 80 / 20%)",
          }}
        >
          Fare = ₹10 + max(0, km − 3) × ₹5
        </div>
        <div className="space-y-3">
          {fareConfig.map(({ label, value, desc }) => (
            <div
              key={label}
              className="flex items-center justify-between"
              style={{ borderBottom: "1px solid oklch(0.22 0.01 265)" }}
            >
              <div className="pb-3">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.8 0.02 265)" }}
                >
                  {label}
                </p>
                <p className="text-xs" style={{ color: "oklch(0.5 0.03 265)" }}>
                  {desc}
                </p>
              </div>
              <span
                className="pb-3 text-sm font-bold font-mono"
                style={{ color: "oklch(0.82 0.14 80)" }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Info notice */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl p-4 flex items-start gap-3"
        style={{
          background: "oklch(0.72 0.18 260 / 8%)",
          border: "1px solid oklch(0.72 0.18 260 / 25%)",
        }}
      >
        <Settings
          size={16}
          className="flex-shrink-0 mt-0.5"
          style={{ color: "oklch(0.72 0.18 260)" }}
        />
        <p
          className="text-xs leading-relaxed"
          style={{ color: "oklch(0.6 0.03 265)" }}
        >
          To change fare rates, contact the platform team. Dynamic fare
          configuration will be available in a future update.
        </p>
      </motion.div>
    </motion.div>
  );
}

interface Props {
  onLogout: () => void;
}

export default function AdminDashboardScreen({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [stats, setStats] = useState<AdminStats>({
    totalRiders: 0,
    activeRiders: 0,
    suspendedRiders: 0,
    pendingRiders: 0,
    totalRides: 0,
    completedRides: 0,
    totalEarnings: 0,
  });

  const loadStats = useCallback(() => {
    const s = getAdminStats();
    setStats(s);
  }, []);

  useEffect(() => {
    if (activeTab === "dashboard") {
      loadStats();
    }
  }, [loadStats, activeTab]);

  return (
    <div
      data-ocid="admin_dashboard.page"
      className="min-h-dvh flex flex-col"
      style={{ background: "oklch(0.11 0.01 265)" }}
    >
      {/* Top Header */}
      <header
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
        style={{
          background: "oklch(0.11 0.01 265 / 95%)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid oklch(0.22 0.01 265)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "oklch(0.62 0.18 260 / 20%)",
              border: "1px solid oklch(0.62 0.18 260 / 30%)",
            }}
          >
            <Shield size={16} style={{ color: "oklch(0.72 0.18 260)" }} />
          </div>
          <div>
            <p
              className="font-display font-bold text-sm leading-tight"
              style={{ color: "oklch(0.97 0.01 90)" }}
            >
              Nalbari Ride Admin
            </p>
            <p className="text-xs" style={{ color: "oklch(0.5 0.03 265)" }}>
              Management Portal
            </p>
          </div>
        </div>

        <button
          type="button"
          data-ocid="admin_dashboard.logout_button"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: "oklch(0.63 0.22 27 / 12%)",
            border: "1px solid oklch(0.63 0.22 27 / 25%)",
            color: "oklch(0.75 0.16 27)",
          }}
        >
          <LogOut size={13} />
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 pt-5"
          >
            {/* Welcome */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1
                className="font-display text-2xl font-bold"
                style={{ color: "oklch(0.97 0.01 90)" }}
              >
                Overview
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: "oklch(0.55 0.03 265)" }}
              >
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </motion.div>

            {/* Stats grid */}
            <div
              data-ocid="admin_dashboard.success_state"
              className="grid grid-cols-2 gap-3 mb-6"
            >
              <StatCard
                label="Total Riders"
                value={stats.totalRiders}
                icon={Users}
                accent="oklch(0.72 0.18 260)"
                delay={0}
              />
              <StatCard
                label="Active Riders"
                value={stats.activeRiders}
                icon={Bike}
                accent="oklch(0.78 0.17 142)"
                delay={0.05}
              />
              <StatCard
                label="Suspended"
                value={stats.suspendedRiders}
                icon={Shield}
                accent="oklch(0.75 0.16 27)"
                delay={0.1}
              />
              <StatCard
                label="Total Rides"
                value={stats.totalRides}
                icon={IndianRupee}
                accent="oklch(0.82 0.14 80)"
                delay={0.15}
              />
            </div>

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h2
                className="font-display font-bold text-base mb-3"
                style={{ color: "oklch(0.75 0.02 265)" }}
              >
                Quick Actions
              </h2>
              <div className="space-y-2">
                {[
                  {
                    icon: Users,
                    label: "Manage Riders",
                    sub: "Review, approve, and manage riders",
                    tab: "riders" as AdminTab,
                    accent: "oklch(0.72 0.18 260)",
                  },
                  {
                    icon: Shield,
                    label: "Suspend / Activate",
                    sub: "Quick access to account controls",
                    tab: "suspend" as AdminTab,
                    accent: "oklch(0.75 0.16 27)",
                  },
                  {
                    icon: History,
                    label: "Ride History",
                    sub: "View all booking records",
                    tab: "history" as AdminTab,
                    accent: "oklch(0.82 0.14 80)",
                  },
                  {
                    icon: Settings,
                    label: "Fare Settings",
                    sub: "View fare configuration",
                    tab: "settings" as AdminTab,
                    accent: "oklch(0.72 0.18 260)",
                  },
                ].map(({ icon: Icon, label, sub, tab, accent }) => (
                  <button
                    key={tab}
                    type="button"
                    data-ocid="admin_dashboard.tab"
                    onClick={() => setActiveTab(tab)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all"
                    style={{
                      background: "oklch(0.17 0.015 265)",
                      border: "1px solid oklch(0.28 0.02 265)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${accent}15` }}
                    >
                      <Icon size={18} style={{ color: accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-semibold text-sm"
                        style={{ color: "oklch(0.9 0.01 90)" }}
                      >
                        {label}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "oklch(0.5 0.03 265)" }}
                      >
                        {sub}
                      </p>
                    </div>
                    <span style={{ color: "oklch(0.4 0.02 265)" }}>›</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "riders" && <AdminRiderManagementScreen />}
        {activeTab === "history" && <AdminRideHistoryScreen />}
        {activeTab === "suspend" && <AdminSuspendActivateScreen />}
        {activeTab === "settings" && <AdminFareSettingsPanel />}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20"
        style={{
          background: "oklch(0.13 0.01 265 / 96%)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid oklch(0.22 0.01 265)",
        }}
      >
        <div className="flex items-center justify-around px-2 py-2 max-w-[430px] mx-auto">
          {NAV_TABS.map(({ value, icon: Icon, label }) => {
            const isActive = activeTab === value;
            return (
              <button
                key={value}
                type="button"
                data-ocid="admin_dashboard.tab"
                onClick={() => setActiveTab(value)}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl flex-1 transition-all"
                style={
                  isActive
                    ? {
                        background: "oklch(0.65 0.18 260 / 15%)",
                        color: "oklch(0.72 0.18 260)",
                      }
                    : { color: "oklch(0.45 0.03 265)" }
                }
              >
                <Icon size={20} />
                <span className="text-[10px] font-semibold leading-none">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
