"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { updateProfile, type Profile } from "@/app/actions/profile";
import { uploadAgencyLogo, deleteAgencyLogo } from "@/app/actions/agency-logo";
import { colors, typography, spacing } from "@/styles/tokens";

// =============================================================================
// Unit Conversion Utilities
// =============================================================================

type MeasurementUnit = 'metric' | 'imperial';

function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches: inches === 12 ? 0 : inches };
}

function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}

function cmToInches(cm: number): number {
  return Math.round(cm / 2.54 * 10) / 10;
}

function inchesToCm(inches: number): number {
  return Math.round(inches * 2.54);
}

function formatHeightImperial(cm: number | null | undefined): string {
  if (!cm) return '';
  const { feet, inches } = cmToFeetInches(cm);
  return `${feet}'${inches}"`;
}

function formatMeasurementImperial(cm: number | null | undefined): string {
  if (!cm) return '';
  return `${cmToInches(cm)}"`;
}

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
  
  // Unit preference for measurements
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('metric');
  
  // Controlled measurement inputs for imperial mode
  const [heightFeet, setHeightFeet] = useState(() => {
    if (profile.height_cm) {
      const { feet } = cmToFeetInches(profile.height_cm);
      return feet.toString();
    }
    return '';
  });
  const [heightInches, setHeightInches] = useState(() => {
    if (profile.height_cm) {
      const { inches } = cmToFeetInches(profile.height_cm);
      return inches.toString();
    }
    return '';
  });
  const [bustInches, setBustInches] = useState(() => 
    profile.bust_cm ? cmToInches(profile.bust_cm).toString() : ''
  );
  const [waistInches, setWaistInches] = useState(() => 
    profile.waist_cm ? cmToInches(profile.waist_cm).toString() : ''
  );
  const [hipsInches, setHipsInches] = useState(() => 
    profile.hips_cm ? cmToInches(profile.hips_cm).toString() : ''
  );
  
  // Computed CM values from imperial inputs
  const computedHeightCm = useMemo(() => {
    const ft = parseInt(heightFeet) || 0;
    const inch = parseInt(heightInches) || 0;
    return ft || inch ? feetInchesToCm(ft, inch) : null;
  }, [heightFeet, heightInches]);
  
  const computedBustCm = useMemo(() => {
    const inch = parseFloat(bustInches) || 0;
    return inch ? inchesToCm(inch) : null;
  }, [bustInches]);
  
  const computedWaistCm = useMemo(() => {
    const inch = parseFloat(waistInches) || 0;
    return inch ? inchesToCm(inch) : null;
  }, [waistInches]);
  
  const computedHipsCm = useMemo(() => {
    const inch = parseFloat(hipsInches) || 0;
    return inch ? inchesToCm(inch) : null;
  }, [hipsInches]);
  
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

  const conversionHintStyle: React.CSSProperties = {
    fontFamily: typography.fontFamily.body,
    fontSize: "11px",
    color: colors.camel,
    marginTop: "6px",
    fontWeight: typography.fontWeight.medium,
  };

  const unitLabelStyle: React.CSSProperties = {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.caption,
    color: colors.text.muted,
    pointerEvents: 'none',
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
              {profile.username || "yourname"}.poseandpoise.studio
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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.padding.md,
          paddingBottom: spacing.padding.sm,
          borderBottom: `1px solid ${colors.border.divider}`,
        }}>
          <h3 style={{
            fontFamily: typography.fontFamily.display,
            fontSize: typography.fontSize.cardH3,
            fontWeight: typography.fontWeight.regular,
            margin: 0,
          }}>Measurements</h3>
          
          {/* Unit Toggle */}
          <div style={{
            display: 'flex',
            background: colors.background.card,
            border: `1px solid ${colors.border.light}`,
            padding: '2px',
          }}>
            <button
              type="button"
              onClick={() => setMeasurementUnit('metric')}
              style={{
                padding: '6px 12px',
                background: measurementUnit === 'metric' ? colors.charcoal : 'transparent',
                color: measurementUnit === 'metric' ? colors.cream : colors.text.secondary,
                border: 'none',
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                fontWeight: typography.fontWeight.medium,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              CM
            </button>
            <button
              type="button"
              onClick={() => setMeasurementUnit('imperial')}
              style={{
                padding: '6px 12px',
                background: measurementUnit === 'imperial' ? colors.charcoal : 'transparent',
                color: measurementUnit === 'imperial' ? colors.cream : colors.text.secondary,
                border: 'none',
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                fontWeight: typography.fontWeight.medium,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              FT / IN
            </button>
          </div>
        </div>

        {measurementUnit === 'metric' ? (
          // Metric inputs (cm)
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
              {profile.height_cm && (
                <p style={conversionHintStyle}>
                  = {formatHeightImperial(profile.height_cm)}
                </p>
              )}
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
              {profile.bust_cm && (
                <p style={conversionHintStyle}>
                  = {formatMeasurementImperial(profile.bust_cm)}
                </p>
              )}
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
              {profile.waist_cm && (
                <p style={conversionHintStyle}>
                  = {formatMeasurementImperial(profile.waist_cm)}
                </p>
              )}
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
              {profile.hips_cm && (
                <p style={conversionHintStyle}>
                  = {formatMeasurementImperial(profile.hips_cm)}
                </p>
              )}
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
        ) : (
          // Imperial inputs (ft/in)
          <>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Height</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="number"
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(e.target.value)}
                      placeholder="5"
                      min="3"
                      max="7"
                      className="pp-input"
                      style={{ ...inputStyle, paddingRight: '36px' }}
                    />
                    <span style={unitLabelStyle}>ft</span>
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="number"
                      value={heightInches}
                      onChange={(e) => setHeightInches(e.target.value)}
                      placeholder="9"
                      min="0"
                      max="11"
                      className="pp-input"
                      style={{ ...inputStyle, paddingRight: '36px' }}
                    />
                    <span style={unitLabelStyle}>in</span>
                  </div>
                </div>
                {computedHeightCm && (
                  <p style={conversionHintStyle}>= {computedHeightCm} cm</p>
                )}
                {/* Hidden input for form submission */}
                <input type="hidden" name="height_cm" value={computedHeightCm || ''} />
              </div>
              <div>
                <label style={labelStyle}>Bust</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={bustInches}
                    onChange={(e) => setBustInches(e.target.value)}
                    placeholder="34"
                    min="20"
                    max="60"
                    step="0.5"
                    className="pp-input"
                    style={{ ...inputStyle, paddingRight: '36px' }}
                  />
                  <span style={unitLabelStyle}>in</span>
                </div>
                {computedBustCm && (
                  <p style={conversionHintStyle}>= {computedBustCm} cm</p>
                )}
                <input type="hidden" name="bust_cm" value={computedBustCm || ''} />
              </div>
              <div>
                <label style={labelStyle}>Waist</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={waistInches}
                    onChange={(e) => setWaistInches(e.target.value)}
                    placeholder="24"
                    min="15"
                    max="60"
                    step="0.5"
                    className="pp-input"
                    style={{ ...inputStyle, paddingRight: '36px' }}
                  />
                  <span style={unitLabelStyle}>in</span>
                </div>
                {computedWaistCm && (
                  <p style={conversionHintStyle}>= {computedWaistCm} cm</p>
                )}
                <input type="hidden" name="waist_cm" value={computedWaistCm || ''} />
              </div>
              <div>
                <label style={labelStyle}>Hips</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={hipsInches}
                    onChange={(e) => setHipsInches(e.target.value)}
                    placeholder="35"
                    min="20"
                    max="60"
                    step="0.5"
                    className="pp-input"
                    style={{ ...inputStyle, paddingRight: '36px' }}
                  />
                  <span style={unitLabelStyle}>in</span>
                </div>
                {computedHipsCm && (
                  <p style={conversionHintStyle}>= {computedHipsCm} cm</p>
                )}
                <input type="hidden" name="hips_cm" value={computedHipsCm || ''} />
              </div>
              <div>
                <label style={labelStyle}>Shoe Size</label>
                <input
                  type="text"
                  name="shoe_size"
                  defaultValue={profile.shoe_size || ""}
                  placeholder="US 8 / EU 39"
                  className="pp-input"
                  style={inputStyle}
                />
              </div>
            </div>
          </>
        )}
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