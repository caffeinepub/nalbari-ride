import { useActor } from "@/hooks/useActor";
import {
  Bike,
  CheckCircle,
  ChevronDown,
  Clock,
  Flag,
  Loader2,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  Phone,
  Shield,
  ShieldCheck,
  Smartphone,
  Tag,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Screen, StoredUser } from "../types";
import { BASE_FARE, FIXED_FARE, MAX_FARE, RATE_PER_KM } from "../types";

interface LandingPageProps {
  currentUser: StoredUser | null;
  onBecomeRider: () => void;
  onNavigate: (screen: Screen) => void;
  onRideCreated: (rideId: bigint) => void;
}

// Hook for scroll-triggered animations
function useInViewAnimation() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = el.querySelectorAll<HTMLElement>(".landing-observe");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        }
      },
      { threshold: 0.12 },
    );

    for (const child of children) {
      observer.observe(child);
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}

function smoothScrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function setGreenColor(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.color = "oklch(0.72 0.2 142)";
}

function setMutedColor(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.color = "oklch(0.7 0.02 265)";
}

function focusGreenBorder(
  e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
) {
  e.currentTarget.style.borderColor = "oklch(0.72 0.2 142 / 60%)";
}

function blurDefaultBorder(
  e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
) {
  e.currentTarget.style.borderColor = "oklch(0.22 0.01 265)";
}

export default function LandingPage({
  currentUser,
  onBecomeRider,
  onNavigate,
  onRideCreated,
}: LandingPageProps) {
  const { actor } = useActor();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Booking form state
  const [bookingName, setBookingName] = useState(currentUser?.name ?? "");
  const [bookingPhone, setBookingPhone] = useState(currentUser?.phone ?? "");
  const [bookingPickup, setBookingPickup] = useState("");
  const [bookingDrop, setBookingDrop] = useState("");
  const [bookingRideType, setBookingRideType] = useState("Bike Taxi");
  const [bookingLoading, setBookingLoading] = useState(false);

  const heroRef = useInViewAnimation();
  const howItWorksRef = useInViewAnimation();
  const servicesRef = useInViewAnimation();
  const bookingRef = useInViewAnimation();
  const ridersRef = useInViewAnimation();
  const featuresRef = useInViewAnimation();
  const contactRef = useInViewAnimation();

  const handleBookRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName.trim() || !bookingPhone.trim()) {
      toast.error("Please enter your name and phone number");
      return;
    }
    if (!bookingPickup.trim() || !bookingDrop.trim()) {
      toast.error("Please enter pickup and destination");
      return;
    }
    if (!bookingPhone.match(/^[6-9]\d{9}$/)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    if (!currentUser) {
      toast.info("Please log in to confirm your booking");
      onNavigate("login");
      return;
    }

    if (!actor) {
      toast.error("Connection not ready. Please wait.");
      return;
    }

    setBookingLoading(true);
    try {
      const ride = await actor.createRide(
        currentUser.phone,
        currentUser.name,
        bookingPickup.trim(),
        bookingDrop.trim(),
        FIXED_FARE,
      );
      toast.success("Booking confirmed! Your ride is on the way.");
      onRideCreated(ride.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to book ride. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleNavBookRide = () => {
    if (currentUser) {
      onNavigate("customer_home");
    } else {
      smoothScrollTo("booking");
    }
  };

  const navLinks = [
    { label: "How it Works", href: "how-it-works" },
    { label: "Services", href: "services" },
    { label: "Book Ride", href: "booking" },
    { label: "Contact", href: "contact" },
  ];

  return (
    <div
      className="w-full min-h-screen font-sans"
      style={{
        background: "oklch(0.07 0.01 265)",
        color: "oklch(0.95 0.01 90)",
      }}
    >
      {/* ── Navbar ── */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: "oklch(0.08 0.01 265 / 90%)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid oklch(0.18 0.01 265)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            onClick={() => smoothScrollTo("hero")}
            className="flex items-center gap-2 focus:outline-none"
          >
            <img
              src="/assets/generated/ride-nalbari-logo-transparent.dim_320x80.png"
              alt="Ride Nalbari"
              height={40}
              className="h-10 w-auto object-contain"
            />
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => smoothScrollTo(link.href)}
                className="text-sm font-medium transition-colors"
                style={{ color: "oklch(0.7 0.02 265)" }}
                onMouseEnter={setGreenColor}
                onMouseLeave={setMutedColor}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <button
                type="button"
                data-ocid="nav.book_ride_button"
                onClick={() => onNavigate("customer_home")}
                className="btn-green-primary text-sm"
              >
                My Dashboard
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate("login")}
                  className="btn-green-outline text-sm"
                >
                  Log In
                </button>
                <button
                  type="button"
                  data-ocid="nav.book_ride_button"
                  onClick={handleNavBookRide}
                  className="btn-green-primary text-sm"
                >
                  Book Ride
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg"
            style={{ color: "oklch(0.7 0.02 265)" }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div
            className="md:hidden px-4 pb-4 flex flex-col gap-2"
            style={{ borderTop: "1px solid oklch(0.18 0.01 265)" }}
          >
            {navLinks.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => {
                  smoothScrollTo(link.href);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-3 px-2 text-sm font-medium rounded-lg transition-colors"
                style={{ color: "oklch(0.7 0.02 265)" }}
              >
                {link.label}
              </button>
            ))}
            <button
              type="button"
              data-ocid="nav.book_ride_button"
              onClick={() => {
                handleNavBookRide();
                setMobileMenuOpen(false);
              }}
              className="btn-green-primary text-sm w-full mt-2"
            >
              Book Ride
            </button>
          </div>
        )}
      </header>

      {/* ── Hero Section ── */}
      <section
        id="hero"
        className="landing-hero-bg relative overflow-hidden min-h-[90vh] flex items-center"
      >
        {/* Decorative glow blobs */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl"
            style={{ background: "oklch(0.55 0.2 142 / 12%)" }}
          />
          <div
            className="absolute bottom-20 right-10 w-64 h-64 rounded-full blur-3xl"
            style={{ background: "oklch(0.55 0.2 142 / 8%)" }}
          />
        </div>

        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full"
          ref={heroRef}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text content */}
            <div>
              <div
                className="landing-observe inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{
                  background: "oklch(0.72 0.2 142 / 12%)",
                  border: "1px solid oklch(0.72 0.2 142 / 30%)",
                  color: "oklch(0.72 0.2 142)",
                }}
              >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Available Now · Nalbari, Assam
              </div>

              <h1
                className="landing-observe landing-observe-delay-1 font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-6"
                style={{ color: "oklch(0.97 0.01 90)" }}
              >
                Ride{" "}
                <span style={{ color: "oklch(0.72 0.2 142)" }}>Nalbari</span>
                <br />
                <span
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold"
                  style={{ color: "oklch(0.75 0.02 265)" }}
                >
                  Fast, Safe &amp;
                </span>
                <br />
                <span className="text-4xl sm:text-5xl lg:text-6xl">
                  Affordable Rides
                </span>
              </h1>

              <p
                className="landing-observe landing-observe-delay-2 text-lg sm:text-xl mb-10 max-w-md"
                style={{ color: "oklch(0.65 0.02 265)" }}
              >
                Book your ride in Nalbari within seconds. Trusted riders, fair
                prices, no surge pricing.
              </p>

              <div className="landing-observe landing-observe-delay-3 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  data-ocid="hero.book_ride_button"
                  onClick={handleNavBookRide}
                  className="btn-green-primary text-base px-8 py-4"
                >
                  Book a Ride →
                </button>
                <button
                  type="button"
                  data-ocid="hero.become_rider_button"
                  onClick={onBecomeRider}
                  className="btn-green-outline text-base px-8 py-4"
                >
                  Become a Rider
                </button>
              </div>

              {/* Social proof */}
              <div
                className="landing-observe landing-observe-delay-4 flex items-center gap-6 mt-12 pt-8"
                style={{ borderTop: "1px solid oklch(0.18 0.01 265)" }}
              >
                {[
                  { label: "Happy Riders", value: "200+" },
                  { label: "Trips Daily", value: "50+" },
                  { label: "Avg. Rating", value: "4.8★" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div
                      className="font-display text-2xl font-bold"
                      style={{ color: "oklch(0.72 0.2 142)" }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.55 0.02 265)" }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative bike illustration */}
            <div className="hidden lg:flex items-center justify-center relative">
              <div
                className="absolute inset-0 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.55 0.2 142 / 20%) 0%, transparent 70%)",
                }}
              />
              <div className="relative float-animation">
                <div
                  className="w-72 h-72 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "radial-gradient(circle, oklch(0.55 0.2 142 / 15%) 0%, transparent 70%)",
                    border: "2px solid oklch(0.72 0.2 142 / 20%)",
                  }}
                >
                  <Bike
                    size={160}
                    className="bike-glow-ring"
                    style={{ color: "oklch(0.72 0.2 142)" }}
                  />
                </div>
                {/* Floating badges */}
                <div
                  className="absolute -top-4 -right-8 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    background: "oklch(0.72 0.2 142)",
                    color: "oklch(0.07 0.01 265)",
                  }}
                >
                  ₹15–₹30
                </div>
                <div
                  className="absolute -bottom-4 -left-8 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: "oklch(0.11 0.01 265)",
                    border: "1px solid oklch(0.22 0.01 265)",
                    color: "oklch(0.72 0.2 142)",
                  }}
                >
                  Arrive in 5 min
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex justify-center">
            <button
              type="button"
              onClick={() => smoothScrollTo("how-it-works")}
              className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity"
            >
              <span
                className="text-xs"
                style={{ color: "oklch(0.55 0.02 265)" }}
              >
                Scroll to explore
              </span>
              <ChevronDown
                size={18}
                className="animate-bounce"
                style={{ color: "oklch(0.55 0.02 265)" }}
              />
            </button>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        className="landing-section-alt py-20 sm:py-28"
        data-ocid="how_it_works.section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6" ref={howItWorksRef}>
          <div className="text-center mb-16">
            <div
              className="landing-observe inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
              style={{
                color: "oklch(0.72 0.2 142)",
                background: "oklch(0.72 0.2 142 / 10%)",
              }}
            >
              Simple Process
            </div>
            <h2
              className="landing-observe landing-observe-delay-1 font-display text-4xl sm:text-5xl font-extrabold"
              style={{ color: "oklch(0.97 0.01 90)" }}
            >
              How It Works
            </h2>
            <p
              className="landing-observe landing-observe-delay-2 text-base mt-4 max-w-md mx-auto"
              style={{ color: "oklch(0.6 0.02 265)" }}
            >
              Get from A to B in four easy steps
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                icon: MapPin,
                title: "Enter Pickup Location",
                desc: "Tell us where you are. Type your pickup address or use a landmark.",
                delay: "",
              },
              {
                step: 2,
                icon: CheckCircle,
                title: "Rider Accepts the Ride",
                desc: "A nearby verified rider accepts your booking within minutes.",
                delay: "landing-observe-delay-1",
              },
              {
                step: 3,
                icon: Shield,
                title: "Start with Secure Code",
                desc: "Share the trip code with your rider to start the journey safely.",
                delay: "landing-observe-delay-2",
              },
              {
                step: 4,
                icon: Flag,
                title: "Reach Destination Safely",
                desc: "Arrive at your drop point. Rate your experience and pay the simple fare.",
                delay: "landing-observe-delay-3",
              },
            ].map(({ step, icon: Icon, title, desc, delay }) => (
              <div
                key={step}
                className={`landing-observe ${delay} landing-card rounded-2xl p-6 flex flex-col gap-4`}
              >
                <div className="flex items-center gap-3">
                  <div className="step-badge">{step}</div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "oklch(0.72 0.2 142 / 12%)" }}
                  >
                    <Icon size={20} style={{ color: "oklch(0.72 0.2 142)" }} />
                  </div>
                </div>
                <h3
                  className="font-display text-lg font-bold"
                  style={{ color: "oklch(0.95 0.01 90)" }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(0.58 0.02 265)" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section
        id="services"
        className="landing-section py-20 sm:py-28"
        data-ocid="services.section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6" ref={servicesRef}>
          <div className="text-center mb-16">
            <div
              className="landing-observe inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
              style={{
                color: "oklch(0.72 0.2 142)",
                background: "oklch(0.72 0.2 142 / 10%)",
              }}
            >
              What We Offer
            </div>
            <h2
              className="landing-observe landing-observe-delay-1 font-display text-4xl sm:text-5xl font-extrabold"
              style={{ color: "oklch(0.97 0.01 90)" }}
            >
              Our Services
            </h2>
            <p
              className="landing-observe landing-observe-delay-2 text-base mt-4 max-w-md mx-auto"
              style={{ color: "oklch(0.6 0.02 265)" }}
            >
              All your mobility needs covered under one platform
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: Bike,
                title: "Bike Taxi",
                desc: "Quick bike rides across Nalbari. Reach your destination fast and affordably.",
                badge: "Most Popular",
                delay: "",
              },
              {
                icon: Package,
                title: "Local Delivery",
                desc: "Fast package delivery within the city. Send parcels, documents, and more.",
                badge: null,
                delay: "landing-observe-delay-1",
              },
              {
                icon: Clock,
                title: "Quick Pickup Service",
                desc: "On-demand pickup for urgent needs. We arrive within minutes of your call.",
                badge: null,
                delay: "landing-observe-delay-2",
              },
            ].map(({ icon: Icon, title, desc, badge, delay }) => (
              <div
                key={title}
                className={`landing-observe ${delay} landing-card rounded-2xl p-8 flex flex-col gap-5 relative overflow-hidden`}
              >
                {badge && (
                  <span
                    className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: "oklch(0.72 0.2 142)",
                      color: "oklch(0.07 0.01 265)",
                    }}
                  >
                    {badge}
                  </span>
                )}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "oklch(0.72 0.2 142 / 12%)",
                    border: "1px solid oklch(0.72 0.2 142 / 25%)",
                  }}
                >
                  <Icon size={28} style={{ color: "oklch(0.72 0.2 142)" }} />
                </div>
                <h3
                  className="font-display text-xl font-bold"
                  style={{ color: "oklch(0.95 0.01 90)" }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(0.58 0.02 265)" }}
                >
                  {desc}
                </p>
                <button
                  type="button"
                  onClick={handleNavBookRide}
                  className="mt-auto text-sm font-semibold transition-colors"
                  style={{ color: "oklch(0.72 0.2 142)" }}
                >
                  Book Now →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Booking Form ── */}
      <section id="booking" className="landing-section-alt py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6" ref={bookingRef}>
          <div className="text-center mb-12">
            <div
              className="landing-observe inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
              style={{
                color: "oklch(0.72 0.2 142)",
                background: "oklch(0.72 0.2 142 / 10%)",
              }}
            >
              Book Instantly
            </div>
            <h2
              className="landing-observe landing-observe-delay-1 font-display text-4xl sm:text-5xl font-extrabold"
              style={{ color: "oklch(0.97 0.01 90)" }}
            >
              Book Your Ride
            </h2>
            <p
              className="landing-observe landing-observe-delay-2 text-base mt-4"
              style={{ color: "oklch(0.6 0.02 265)" }}
            >
              Fill in your details and we'll connect you with the nearest rider
            </p>
          </div>

          <div
            className="landing-observe landing-observe-delay-1 rounded-3xl p-6 sm:p-10"
            style={{
              background: "oklch(0.10 0.01 265)",
              border: "1px solid oklch(0.22 0.01 265)",
            }}
          >
            {/* Fare badge */}
            <div
              className="flex items-center justify-between px-5 py-3 rounded-xl mb-8"
              style={{
                background: "oklch(0.72 0.2 142 / 10%)",
                border: "1px solid oklch(0.72 0.2 142 / 25%)",
              }}
            >
              <div className="flex flex-col gap-0.5">
                <span
                  className="text-sm font-medium"
                  style={{ color: "oklch(0.7 0.02 265)" }}
                >
                  Estimated fare (₹{BASE_FARE.toString()} base + ₹
                  {RATE_PER_KM.toString()}/km)
                </span>
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.02 265)" }}
                >
                  5–10 km distance range
                </span>
              </div>
              <span
                className="font-display text-2xl font-extrabold whitespace-nowrap"
                style={{ color: "oklch(0.72 0.2 142)" }}
              >
                ₹{FIXED_FARE.toString()}–₹{MAX_FARE.toString()}
              </span>
            </div>

            <form onSubmit={handleBookRide} className="flex flex-col gap-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="booking-name"
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "oklch(0.6 0.02 265)" }}
                  >
                    Your Name
                  </label>
                  <input
                    id="booking-name"
                    data-ocid="booking.name_input"
                    type="text"
                    placeholder="e.g. Ramesh Sharma"
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    required
                    className="w-full h-12 px-4 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "oklch(0.13 0.01 265)",
                      border: "1px solid oklch(0.22 0.01 265)",
                      color: "oklch(0.95 0.01 90)",
                    }}
                    onFocus={focusGreenBorder}
                    onBlur={blurDefaultBorder}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="booking-phone"
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "oklch(0.6 0.02 265)" }}
                  >
                    Phone Number
                  </label>
                  <input
                    id="booking-phone"
                    data-ocid="booking.phone_input"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value)}
                    required
                    maxLength={10}
                    className="w-full h-12 px-4 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "oklch(0.13 0.01 265)",
                      border: "1px solid oklch(0.22 0.01 265)",
                      color: "oklch(0.95 0.01 90)",
                    }}
                    onFocus={focusGreenBorder}
                    onBlur={blurDefaultBorder}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="booking-pickup"
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "oklch(0.6 0.02 265)" }}
                >
                  Pickup Location
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "oklch(0.72 0.2 142)" }}
                  />
                  <input
                    id="booking-pickup"
                    data-ocid="booking.pickup_input"
                    type="text"
                    placeholder="Where should we pick you up?"
                    value={bookingPickup}
                    onChange={(e) => setBookingPickup(e.target.value)}
                    required
                    className="w-full h-12 pl-10 pr-4 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "oklch(0.13 0.01 265)",
                      border: "1px solid oklch(0.22 0.01 265)",
                      color: "oklch(0.95 0.01 90)",
                    }}
                    onFocus={focusGreenBorder}
                    onBlur={blurDefaultBorder}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="booking-destination"
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "oklch(0.6 0.02 265)" }}
                >
                  Destination
                </label>
                <div className="relative">
                  <Flag
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "oklch(0.72 0.2 142)" }}
                  />
                  <input
                    id="booking-destination"
                    data-ocid="booking.destination_input"
                    type="text"
                    placeholder="Where do you want to go?"
                    value={bookingDrop}
                    onChange={(e) => setBookingDrop(e.target.value)}
                    required
                    className="w-full h-12 pl-10 pr-4 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "oklch(0.13 0.01 265)",
                      border: "1px solid oklch(0.22 0.01 265)",
                      color: "oklch(0.95 0.01 90)",
                    }}
                    onFocus={focusGreenBorder}
                    onBlur={blurDefaultBorder}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="booking-ride-type"
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "oklch(0.6 0.02 265)" }}
                >
                  Ride Type
                </label>
                <select
                  id="booking-ride-type"
                  data-ocid="booking.ride_type_select"
                  value={bookingRideType}
                  onChange={(e) => setBookingRideType(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl text-sm outline-none transition-all appearance-none cursor-pointer"
                  style={{
                    background: "oklch(0.13 0.01 265)",
                    border: "1px solid oklch(0.22 0.01 265)",
                    color: "oklch(0.95 0.01 90)",
                  }}
                  onFocus={focusGreenBorder}
                  onBlur={blurDefaultBorder}
                >
                  <option value="Bike Taxi">🏍️ Bike Taxi</option>
                  <option value="Local Delivery">📦 Local Delivery</option>
                  <option value="Quick Pickup">⚡ Quick Pickup Service</option>
                </select>
              </div>

              <button
                type="submit"
                data-ocid="booking.confirm_button"
                disabled={bookingLoading}
                className="btn-green-primary w-full py-4 text-base mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Confirming...
                  </>
                ) : (
                  "Confirm Booking →"
                )}
              </button>

              {!currentUser && (
                <p
                  className="text-center text-xs"
                  style={{ color: "oklch(0.5 0.02 265)" }}
                >
                  You'll be asked to log in or register to confirm your booking.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ── Rider Recruitment ── */}
      <section
        id="riders"
        className="py-20 sm:py-28 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.55 0.18 142 / 12%) 0%, oklch(0.08 0.01 265) 70%)",
        }}
      >
        <div
          className="max-w-4xl mx-auto px-4 sm:px-6 text-center"
          ref={ridersRef}
        >
          <div
            className="landing-observe inline-flex items-center gap-3 mb-6 px-5 py-2 rounded-full"
            style={{
              background: "oklch(0.72 0.2 142 / 10%)",
              border: "1px solid oklch(0.72 0.2 142 / 25%)",
            }}
          >
            <Bike size={18} style={{ color: "oklch(0.72 0.2 142)" }} />
            <span
              className="text-sm font-semibold"
              style={{ color: "oklch(0.72 0.2 142)" }}
            >
              Join Our Rider Fleet
            </span>
          </div>

          <h2
            className="landing-observe landing-observe-delay-1 font-display text-4xl sm:text-6xl font-extrabold mb-6"
            style={{ color: "oklch(0.97 0.01 90)" }}
          >
            Drive with{" "}
            <span style={{ color: "oklch(0.72 0.2 142)" }}>Ride Nalbari</span>
          </h2>
          <p
            className="landing-observe landing-observe-delay-2 text-lg sm:text-xl mb-12 max-w-xl mx-auto"
            style={{ color: "oklch(0.6 0.02 265)" }}
          >
            Earn money on your schedule. Be your own boss. Join 200+ riders
            already earning with us.
          </p>

          <div className="landing-observe landing-observe-delay-2 grid sm:grid-cols-4 gap-4 mb-12">
            {[
              {
                icon: Clock,
                label: "Flexible Hours",
                desc: "Work when you want",
              },
              {
                icon: Zap,
                label: "Daily Earnings",
                desc: "Get paid every day",
              },
              {
                icon: Tag,
                label: "Fuel Allowance",
                desc: "Extra earnings support",
              },
              {
                icon: Smartphone,
                label: "Easy App",
                desc: "Simple rider app",
              },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="landing-card rounded-xl p-4 flex flex-col items-center gap-2 text-center"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: "oklch(0.72 0.2 142 / 12%)" }}
                >
                  <Icon size={20} style={{ color: "oklch(0.72 0.2 142)" }} />
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.9 0.01 90)" }}
                >
                  {label}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.02 265)" }}
                >
                  {desc}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            data-ocid="riders.become_rider_button"
            onClick={onBecomeRider}
            className="landing-observe landing-observe-delay-3 btn-green-primary text-base px-10 py-4"
          >
            Become a Rider →
          </button>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        className="landing-section-alt py-20 sm:py-28"
        data-ocid="features.section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6" ref={featuresRef}>
          <div className="text-center mb-16">
            <div
              className="landing-observe inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
              style={{
                color: "oklch(0.72 0.2 142)",
                background: "oklch(0.72 0.2 142 / 10%)",
              }}
            >
              Why Choose Us
            </div>
            <h2
              className="landing-observe landing-observe-delay-1 font-display text-4xl sm:text-5xl font-extrabold"
              style={{ color: "oklch(0.97 0.01 90)" }}
            >
              Built for Nalbari
            </h2>
            <p
              className="landing-observe landing-observe-delay-2 text-base mt-4 max-w-md mx-auto"
              style={{ color: "oklch(0.6 0.02 265)" }}
            >
              Everything you expect from a great ride service, and more
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: "Fast Pickup",
                desc: "Riders near you respond in minutes. Average arrival time under 5 minutes.",
                delay: "",
              },
              {
                icon: ShieldCheck,
                title: "Trusted Riders",
                desc: "Verified and background-checked riders. Your safety is our priority.",
                delay: "landing-observe-delay-1",
              },
              {
                icon: Tag,
                title: "Affordable Price",
                desc: "Lowest fares in Nalbari, guaranteed. Just ₹15–₹30 with no hidden charges.",
                delay: "landing-observe-delay-2",
              },
              {
                icon: Smartphone,
                title: "Easy Booking",
                desc: "Book in seconds with just your phone. No app download required.",
                delay: "landing-observe-delay-3",
              },
            ].map(({ icon: Icon, title, desc, delay }) => (
              <div
                key={title}
                className={`landing-observe ${delay} landing-card rounded-2xl p-6 flex flex-col gap-4`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: "oklch(0.72 0.2 142 / 12%)",
                    border: "1px solid oklch(0.72 0.2 142 / 20%)",
                  }}
                >
                  <Icon size={24} style={{ color: "oklch(0.72 0.2 142)" }} />
                </div>
                <h3
                  className="font-display text-lg font-bold"
                  style={{ color: "oklch(0.95 0.01 90)" }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(0.58 0.02 265)" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section
        id="contact"
        className="landing-section py-20 sm:py-28"
        data-ocid="contact.section"
      >
        <div
          className="max-w-3xl mx-auto px-4 sm:px-6 text-center"
          ref={contactRef}
        >
          <div
            className="landing-observe inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
            style={{
              color: "oklch(0.72 0.2 142)",
              background: "oklch(0.72 0.2 142 / 10%)",
            }}
          >
            Reach Out
          </div>
          <h2
            className="landing-observe landing-observe-delay-1 font-display text-4xl sm:text-5xl font-extrabold mb-4"
            style={{ color: "oklch(0.97 0.01 90)" }}
          >
            Get in Touch
          </h2>
          <p
            className="landing-observe landing-observe-delay-2 text-base mb-12"
            style={{ color: "oklch(0.6 0.02 265)" }}
          >
            Have questions or need help? We're just a call away.
          </p>

          <div className="landing-observe landing-observe-delay-2 grid sm:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Phone,
                label: "Phone",
                value: "+91 96787 84288",
                sub: "Available 6 AM – 10 PM",
              },
              {
                icon: MapPin,
                label: "Service Area",
                value: "Nalbari, Assam",
                sub: "Full city coverage",
              },
              {
                icon: MessageCircle,
                label: "WhatsApp",
                value: "Chat with us",
                sub: "Quick responses",
              },
            ].map(({ icon: Icon, label, value, sub }) => (
              <div
                key={label}
                className="landing-card rounded-2xl p-6 flex flex-col items-center gap-3 text-center"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: "oklch(0.72 0.2 142 / 12%)",
                    border: "1px solid oklch(0.72 0.2 142 / 20%)",
                  }}
                >
                  <Icon size={22} style={{ color: "oklch(0.72 0.2 142)" }} />
                </div>
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "oklch(0.55 0.02 265)" }}
                >
                  {label}
                </span>
                <span
                  className="text-base font-semibold"
                  style={{ color: "oklch(0.9 0.01 90)" }}
                >
                  {value}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.5 0.02 265)" }}
                >
                  {sub}
                </span>
              </div>
            ))}
          </div>

          <a
            href="https://wa.me/919678784288"
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="contact.whatsapp_button"
            className="inline-flex items-center gap-3 btn-green-primary text-base px-10 py-4"
          >
            <MessageCircle size={20} />
            Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          background: "oklch(0.05 0.01 265)",
          borderTop: "1px solid oklch(0.14 0.01 265)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/assets/generated/ride-nalbari-logo-transparent.dim_320x80.png"
                alt="Ride Nalbari"
                height={32}
                className="h-8 w-auto object-contain"
              />
            </div>

            <div
              className="text-sm text-center"
              style={{ color: "oklch(0.45 0.02 265)" }}
            >
              Service Area:{" "}
              <span style={{ color: "oklch(0.65 0.02 265)" }}>
                Nalbari, Assam
              </span>
            </div>

            <div
              className="flex items-center gap-6 text-xs"
              style={{ color: "oklch(0.45 0.02 265)" }}
            >
              <span className="cursor-default hover:text-gray-300 transition-colors">
                Privacy
              </span>
              <span className="cursor-default hover:text-gray-300 transition-colors">
                Terms
              </span>
            </div>
          </div>

          {/* Admin Login Button */}
          <div
            className="mt-6 pt-6 text-center"
            style={{ borderTop: "1px solid oklch(0.14 0.01 265)" }}
          >
            <button
              type="button"
              data-ocid="admin.open_modal_button"
              onClick={() => onNavigate("admin_login")}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: "oklch(0.18 0.02 265)",
                color: "oklch(0.75 0.12 145)",
                border: "1px solid oklch(0.28 0.06 145)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                role="img"
                aria-label="Admin lock icon"
              >
                <title>Admin lock icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Admin Login
            </button>
          </div>

          <div
            className="mt-4 text-center text-xs"
            style={{
              color: "oklch(0.38 0.02 265)",
            }}
          >
            © {new Date().getFullYear()} Ride Nalbari. All rights reserved. ·
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "ridenalbari")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "oklch(0.5 0.02 265)" }}
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
