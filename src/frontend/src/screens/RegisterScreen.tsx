import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Bike,
  Camera,
  CheckCircle,
  ImageIcon,
  Loader2,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

interface Props {
  role: "customer" | "rider";
  onSuccess: () => void;
  onLogin: () => void;
}

type DocType = "aadhaar" | "licence" | "bike" | "selfie";

interface DocUploadState {
  base64: string;
}

function useDocUpload() {
  const [docs, setDocs] = useState<Record<DocType, DocUploadState>>({
    aadhaar: { base64: "" },
    licence: { base64: "" },
    bike: { base64: "" },
    selfie: { base64: "" },
  });

  const setDoc = (type: DocType, base64: string) => {
    setDocs((prev) => ({ ...prev, [type]: { base64 } }));
  };

  return { docs, setDoc };
}

interface DocUploadFieldProps {
  label: string;
  required?: boolean;
  docType: DocType;
  value: string;
  onChange: (base64: string) => void;
  ocidPrefix: string;
}

function DocUploadField({
  label,
  required,
  value,
  onChange,
  ocidPrefix,
}: DocUploadFieldProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-foreground/80 text-sm font-medium">
        {label}{" "}
        {required && <span style={{ color: "oklch(0.75 0.16 27)" }}>*</span>}
      </Label>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {value ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <div
            className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
            style={{ border: "1px solid oklch(0.78 0.17 142 / 35%)" }}
          >
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit"
              style={{
                background: "oklch(0.78 0.17 142 / 15%)",
                color: "oklch(0.78 0.17 142)",
                border: "1px solid oklch(0.78 0.17 142 / 30%)",
              }}
            >
              <CheckCircle size={10} />
              Uploaded
            </span>
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="text-xs underline text-left"
              style={{ color: "oklch(0.55 0.03 265)" }}
            >
              Change photo
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            data-ocid={`${ocidPrefix}.upload_button`}
            onClick={() => cameraRef.current?.click()}
            className="flex flex-col items-center justify-center gap-1.5 h-14 rounded-xl font-semibold text-xs transition-all active:scale-95"
            style={{
              background: "oklch(0.78 0.17 142 / 10%)",
              border: "1px solid oklch(0.78 0.17 142 / 30%)",
              color: "oklch(0.78 0.17 142)",
            }}
          >
            <Camera size={16} />
            Camera
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="flex flex-col items-center justify-center gap-1.5 h-14 rounded-xl font-semibold text-xs transition-all active:scale-95"
            style={{
              background: "oklch(0.78 0.17 142 / 10%)",
              border: "1px solid oklch(0.78 0.17 142 / 30%)",
              color: "oklch(0.78 0.17 142)",
            }}
          >
            <ImageIcon size={16} />
            Gallery
          </button>
        </div>
      )}
    </div>
  );
}

export default function RegisterScreen({ role, onSuccess, onLogin }: Props) {
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [bikeNumber, setBikeNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { docs, setDoc } = useDocUpload();

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (phone.length < 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    if (role === "rider") {
      if (!licenceNumber.trim()) {
        toast.error("Please enter your Driving Licence Number");
        return;
      }
      if (
        !aadhaarNumber.trim() ||
        aadhaarNumber.replace(/\D/g, "").length !== 12
      ) {
        toast.error("Please enter a valid 12-digit Aadhaar Number");
        return;
      }
      if (!bikeNumber.trim()) {
        toast.error("Please enter your Bike Number");
        return;
      }
      if (!docs.aadhaar.base64) {
        toast.error("Please upload your Aadhaar card image");
        return;
      }
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
        result.toLowerCase().includes("already") ||
        result.toLowerCase().includes("exists")
      ) {
        toast.error("Phone number already registered. Please login.");
        setLoading(false);
        return;
      }

      // CRITICAL: Register principal-phone mapping so backend checks work
      try {
        await actor.saveCallerUserProfile({
          name: name.trim(),
          phone: phone.trim(),
          role,
        });
      } catch (profileErr) {
        console.warn("Could not save caller profile:", profileErr);
      }

      // Also register rider details if role is rider
      if (role === "rider") {
        try {
          await actor.registerRider(
            phone.trim(),
            name.trim(),
            licenceNumber.trim(),
            aadhaarNumber.trim(),
            bikeNumber.trim(),
          );
        } catch (riderErr) {
          console.error("Rider registration error:", riderErr);
          // Continue anyway — user account created
        }

        // Upload Aadhaar image to backend
        if (docs.aadhaar.base64) {
          try {
            await actor.uploadRiderAadhaarImage(
              phone.trim(),
              docs.aadhaar.base64,
            );
          } catch (imgErr) {
            console.error("Aadhaar image upload error:", imgErr);
          }
        }

        // Store other docs in localStorage (backend doesn't support them yet)
        const localDocs: Record<string, string> = {};
        if (docs.licence.base64) localDocs.licencePhoto = docs.licence.base64;
        if (docs.bike.base64) localDocs.bikePhoto = docs.bike.base64;
        if (docs.selfie.base64) localDocs.selfiePhoto = docs.selfie.base64;
        if (Object.keys(localDocs).length > 0) {
          try {
            const key = `rider_docs_${phone.trim()}`;
            localStorage.setItem(key, JSON.stringify(localDocs));
          } catch {
            // localStorage might be full — best effort
          }
        }
      }

      toast.success("Account created! Please login.");
      onSuccess();
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
      className="screen-fill px-6 pt-12 pb-10 flex flex-col fade-in overflow-y-auto"
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

          {/* Rider-specific fields */}
          {role === "rider" && (
            <>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: "oklch(0.78 0.17 142 / 8%)",
                  border: "1px solid oklch(0.78 0.17 142 / 20%)",
                }}
              >
                <Bike size={14} style={{ color: "oklch(0.78 0.17 142)" }} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: "oklch(0.78 0.17 142)" }}
                >
                  Rider Verification Details
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="reg-licence"
                  className="text-foreground/80 text-sm font-medium"
                >
                  Driving Licence Number
                </Label>
                <Input
                  id="reg-licence"
                  data-ocid="register.licence_input"
                  placeholder="e.g. AS-DL-1234567890"
                  value={licenceNumber}
                  onChange={(e) =>
                    setLicenceNumber(e.target.value.toUpperCase())
                  }
                  className="h-13 rounded-xl bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="reg-aadhaar"
                  className="text-foreground/80 text-sm font-medium"
                >
                  Aadhaar Number
                </Label>
                <Input
                  id="reg-aadhaar"
                  data-ocid="register.aadhaar_input"
                  placeholder="12-digit Aadhaar number"
                  value={aadhaarNumber}
                  onChange={(e) =>
                    setAadhaarNumber(
                      e.target.value.replace(/\D/g, "").slice(0, 12),
                    )
                  }
                  inputMode="numeric"
                  className="h-13 rounded-xl bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="reg-bike"
                  className="text-foreground/80 text-sm font-medium"
                >
                  Bike Number
                </Label>
                <Input
                  id="reg-bike"
                  data-ocid="register.bike_input"
                  placeholder="e.g. AS-01-AB-1234"
                  value={bikeNumber}
                  onChange={(e) => setBikeNumber(e.target.value.toUpperCase())}
                  className="h-13 rounded-xl bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary font-mono"
                />
              </div>

              {/* Document uploads section */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl mt-1"
                style={{
                  background: "oklch(0.72 0.19 45 / 8%)",
                  border: "1px solid oklch(0.72 0.19 45 / 20%)",
                }}
              >
                <ImageIcon size={14} style={{ color: "oklch(0.82 0.15 45)" }} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: "oklch(0.82 0.15 45)" }}
                >
                  Document Uploads (Required for activation)
                </span>
              </div>

              <DocUploadField
                label="Aadhaar Card (Front Side)"
                required
                docType="aadhaar"
                value={docs.aadhaar.base64}
                onChange={(b64) => setDoc("aadhaar", b64)}
                ocidPrefix="register.aadhaar"
              />

              <DocUploadField
                label="Driving Licence Photo"
                docType="licence"
                value={docs.licence.base64}
                onChange={(b64) => setDoc("licence", b64)}
                ocidPrefix="register.licence_photo"
              />

              <DocUploadField
                label="Bike Photo"
                docType="bike"
                value={docs.bike.base64}
                onChange={(b64) => setDoc("bike", b64)}
                ocidPrefix="register.bike_photo"
              />

              <DocUploadField
                label="Rider Selfie Photo"
                docType="selfie"
                value={docs.selfie.base64}
                onChange={(b64) => setDoc("selfie", b64)}
                ocidPrefix="register.selfie_photo"
              />
            </>
          )}
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
