"use client";

import { useState, useRef, useCallback } from "react";
import { updateProfile, type Profile } from "@/app/actions/profile";
import { uploadAgencyLogo, deleteAgencyLogo } from "@/app/actions/agency-logo";
import { colors, typography, spacing } from "@/styles/tokens";

interface ProfileFormProps {
  profile: Profile;
}

/**
 * Formats a phone number string to US format: +1 (XXX) XXX-XXXX
 * Strips all non-digits, then rebuilds with proper formatting
 */
function formatUSPhoneNumber(value: string): string {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, "");
  
  // If empty, return empty
  if (digits.length === 0) return "";
  
  // Remove leading 1 if present (we'll add it back formatted)
  const normalizedDigits = digits.startsWith("1") ? digits.slice(1) : digits;
  
  // Build formatted string based on how many digits we have
  const len = normalizedDigits.length;
  
  if (len === 0) return "+1 ";
  if (len <= 3) return `+1 (${normalizedDigits}`;
  if (len <= 6) return `+1 (${normalizedDigits.slice(0, 3)}) ${normalizedDigits.slice(3)}`;
  // Cap at 10 digits (US phone number)
  const capped = normalizedDigits.slice(0, 10);
  return `+1 (${capped.slice(0, 3)}) ${capped.slice(3, 6)}-${capped.slice(6)}`;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Agency fields visibility
  const [agencyName, setAgencyName] = useState(profile.agency || "");
  const [agencyLogoUrl, setAgencyLogoUrl] = useState(profile.agency_logo_url || "");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Controlled phone input with auto-formatting
  const [agencyPhone, setAgencyPhone] = useState(() => {
    const initial = (profile as Profile & { agency_phone?: string }).agency_phone || "";
    // Format existing value on load
    return initial ? formatUSPhoneNumber(initial) : "";
  });
  
  const logoInputRef = useRef<HTMLInputElement>(null);

  const showAgencyDetails = agencyName.trim().length > 0;

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setMessage(null);

    const result = await updateProfile(formData);

    setLoading(false);
    setMessage({
      type: result.success ? "success" : "error",
      text: result.message,
    });

    if (result.success) {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleLogoDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadLogo(file);
    }
  }, []);

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadLogo(file);
    }
  };

  const uploadLogo = async (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: "error", text: "Please upload a JPEG, PNG, WebP, or SVG file" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "File too large. Maximum size is 2MB." });
      return;
    }

    setUploadingLogo(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadAgencyLogo(formData);

    setUploadingLogo(false);

    if (result.success && result.url) {
      setAgencyLogoUrl(result.url);
      setMessage({ type: "success", text: "Agency logo uploaded!" });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: result.message });
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm("Remove agency logo?")) return;

    setUploadingLogo(true);
    const result = await deleteAgencyLogo();
    setUploadingLogo(false);

    if (result.success) {
      setAgencyLogoUrl("");
      setMessage({ type: "success", text: "Logo removed" });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: result.message });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatUSPhoneNumber(e.target.value);
    setAgencyPhone(formatted);
  };

  const inputStyle: React.CSSProperties = {
    background: "transparent",
    border: "1px solid rgba(26, 26, 26, 0.2)",
    padding: "14px 18px",
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    width: "100%",
    outline: "none",
    transition: "border-color 0.3s ease",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: spacing.padding.xl,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.cardH3,
    fontWeight: typography.fontWeight.regular,
    marginBottom: spacing.padding.md,
    paddingBottom: spacing.padding.sm,
    borderBottom: `1px solid ${colors.border.divider}`,
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: spacing.gap.md,
  };

  return (
    <form action={handleSubmit}>
      {/* Basic Info */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Basic Information</h3>
        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>Display Name</label>
            <input
              type="text"
              name="display_name"
              defaultValue={profile.display_name || ""}
              placeholder="Your name"
              className="pp-input"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              name="username"
              defaultValue={profile.username || ""}
              placeholder="yourname"
              pattern="^[-a-z0-9_]{3,20}$"
              className="pp-input"
              style={inputStyle}
            />
            <p style={{
              fontFamily: typography.fontFamily.body,
              fontSize: "11px",
              color: colors.text.muted,
              marginTop: "6px",
            }}>
              poseandpoise.studio/{profile.username || "yourname"}
            </p>
          </div>
        </div>
        <div style={{ marginTop: spacing.padding.md }}>
          <label style={labelStyle}>Bio</label>
          <textarea
            name="bio"
            defaultValue={profile.bio || ""}
            placeholder="Tell your story..."
            rows={4}
            className="pp-input"
            style={{
              ...inputStyle,
              resize: "vertical",
              minHeight: "100px",
            }}
          />
        </div>
      </div>

      {/* Measurements */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Measurements</h3>
        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>Height (cm)</label>
            <input
              type="number"
              name="height_cm"
              defaultValue={profile.height_cm || ""}
              placeholder="175"
              min="100"
              max="250"
              className="pp-input"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Bust (cm)</label>
            <input
              type="number"
              name="bust_cm"
              defaultValue={profile.bust_cm || ""}
              placeholder="86"
              min="50"
              max="150"
              className="pp-input"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Waist (cm)</label>
            <input
              type="number"
              name="waist_cm"
              defaultValue={profile.waist_cm || ""}
              placeholder="61"
              min="40"
              max="150"
              className="pp-input"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Hips (cm)</label>
            <input
              type="number"
              name="hips_cm"
              defaultValue={profile.hips_cm || ""}
              placeholder="89"
              min="50"
              max="150"
              className="pp-input"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Shoe Size</label>
            <input
              type="text"
              name="shoe_size"
              defaultValue={profile.shoe_size || ""}
              placeholder="EU 39 / US 8"
              className="pp-input"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Appearance</h3>
        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>Hair Color</label>
            <input
              type="text"
              name="hair_color"
              defaultValue={profile.hair_color || ""}
              placeholder="Brown"
              className="pp-input"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Eye Color</label>
            <input
              type="text"
              name="eye_color"
              defaultValue={profile.eye_color || ""}
              placeholder="Blue"
              className="pp-input"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Professional */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Professional</h3>
        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>Location</label>
            <input
              type="text"
              name="location"
              defaultValue={profile.location || ""}
              placeholder="New York, NY"
              className="pp-input"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Agency</label>
            <input
              type="text"
              name="agency"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="Agency name (if represented)"
              className="pp-input"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Conditional Agency Details */}
        {showAgencyDetails && (
          <div
            style={{
              marginTop: spacing.padding.lg,
              padding: spacing.padding.md,
              background: "rgba(196, 164, 132, 0.05)",
              border: `1px solid ${colors.accent.light}`,
            }}
          >
            <h4
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.bodySmall,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.secondary,
                marginBottom: spacing.padding.md,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Agency Details
            </h4>

            {/* Agency Logo Upload */}
            <div style={{ marginBottom: spacing.padding.md }}>
              <label style={labelStyle}>Agency Logo</label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={handleLogoSelect}
                style={{ display: "none" }}
              />

              {agencyLogoUrl ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.gap.md,
                    padding: spacing.padding.sm,
                    background: colors.background.card,
                    border: `1px solid ${colors.border.subtle}`,
                  }}
                >
                  <img
                    src={agencyLogoUrl}
                    alt="Agency logo"
                    style={{
                      height: "50px",
                      width: "auto",
                      maxWidth: "150px",
                      objectFit: "contain",
                    }}
                  />
                  <div style={{ display: "flex", gap: spacing.gap.sm }}>
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      style={{
                        background: "transparent",
                        border: `1px solid ${colors.border.light}`,
                        padding: "6px 12px",
                        fontFamily: typography.fontFamily.body,
                        fontSize: typography.fontSize.caption,
                        color: colors.text.secondary,
                        cursor: "pointer",
                      }}
                    >
                      {uploadingLogo ? "Uploading..." : "Change"}
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      disabled={uploadingLogo}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: colors.text.muted,
                        cursor: "pointer",
                        fontSize: typography.fontSize.caption,
                        textDecoration: "underline",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleLogoDrop}
                  onClick={() => logoInputRef.current?.click()}
                  style={{
                    padding: spacing.padding.lg,
                    background: dragActive ? "rgba(196, 164, 132, 0.1)" : colors.background.card,
                    border: `2px dashed ${dragActive ? colors.camel : colors.border.light}`,
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s ease",
                  }}
                >
                  <p
                    style={{
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.bodySmall,
                      color: colors.text.secondary,
                      marginBottom: "4px",
                    }}
                  >
                    {uploadingLogo
                      ? "Uploading..."
                      : dragActive
                      ? "Drop logo here"
                      : "Drag & drop agency logo, or click to browse"}
                  </p>
                  <p
                    style={{
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.caption,
                      color: colors.text.muted,
                    }}
                  >
                    JPEG, PNG, WebP, or SVG (max 2MB)
                  </p>
                </div>
              )}
            </div>

            {/* Agency Contact Grid */}
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Agency Email</label>
                <input
                  type="email"
                  name="agency_email"
                  defaultValue={(profile as Profile & { agency_email?: string }).agency_email || ""}
                  placeholder="bookings@agency.com"
                  className="pp-input"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Agency Phone</label>
                <input
                  type="tel"
                  name="agency_phone"
                  value={agencyPhone}
                  onChange={handlePhoneChange}
                  placeholder="+1 (555) 123-4567"
                  pattern="^\+1\s\(\d{3}\)\s\d{3}-\d{4}$"
                  className="pp-input"
                  style={inputStyle}
                />
                <p style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: "11px",
                  color: colors.text.muted,
                  marginTop: "6px",
                }}>
                  US numbers only — auto-formats as you type
                </p>
              </div>
              <div>
                <label style={labelStyle}>Agency Instagram</label>
                <input
                  type="text"
                  name="agency_instagram"
                  defaultValue={(profile as Profile & { agency_instagram?: string }).agency_instagram || ""}
                  placeholder="@agencyhandle"
                  className="pp-input"
                  style={inputStyle}
                />
              </div>
            </div>

            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                color: colors.text.muted,
                marginTop: spacing.padding.md,
                fontStyle: "italic",
              }}
            >
              Agency contact info will appear on your branded comp cards instead of personal details.
            </p>
          </div>
        )}
      </div>

      {/* Social Links */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Social Links</h3>
        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>Instagram</label>
            <input
              type="text"
              name="instagram"
              defaultValue={profile.instagram || ""}
              placeholder="@username"
              className="pp-input"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>TikTok</label>
            <input
              type="text"
              name="tiktok"
              defaultValue={profile.tiktok || ""}
              placeholder="@username"
              className="pp-input"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Website</label>
            <input
              type="url"
              name="website"
              defaultValue={profile.website || ""}
              placeholder="https://yourwebsite.com"
              className="pp-input"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Visibility */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Portfolio Visibility</h3>
        <label style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          cursor: "pointer",
        }}>
          <input
            type="checkbox"
            name="is_public"
            value="true"
            defaultChecked={profile.is_public}
            style={{
              width: "20px",
              height: "20px",
              accentColor: colors.camel,
            }}
          />
          <span style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.body,
            color: colors.text.primary,
          }}>
            Make my portfolio public
          </span>
        </label>
        <p style={{
          fontFamily: typography.fontFamily.body,
          fontSize: typography.fontSize.caption,
          color: colors.text.muted,
          marginTop: "8px",
          marginLeft: "32px",
        }}>
          When enabled, anyone can view your portfolio at poseandpoise.studio/{profile.username || "yourname"}
        </p>
      </div>

      {/* Submit */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: spacing.gap.md,
        paddingTop: spacing.padding.md,
        borderTop: `1px solid ${colors.border.divider}`,
      }}>
        <button
          type="submit"
          disabled={loading}
          className="pp-button"
          style={{
            background: colors.charcoal,
            color: colors.cream,
            border: "none",
            padding: `${spacing.padding.md} ${spacing.padding["2xl"]}`,
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.button,
            fontWeight: typography.fontWeight.regular,
            letterSpacing: typography.letterSpacing.wider,
            textTransform: "uppercase",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>

        {message && (
          <p style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.bodySmall,
            color: message.type === "success" ? colors.camel : "#D64545",
          }}>
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}