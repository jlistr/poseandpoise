"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

// =============================================================================
// Types
// =============================================================================
interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
  attachments?: {
    type: "image";
    url: string;
    name: string;
  }[];
}

interface ExtractedData {
  displayName?: string;
  username?: string;
  location?: string;
  instagram?: string;
  tiktok?: string;
  website?: string;
  agencyName?: string;
  agencyContact?: string;
  agencyWebsite?: string;
  isRepresented?: boolean;
  bio?: string;
  avatarUrl?: string;
  heightCm?: string;
  bustCm?: string;
  waistCm?: string;
  hipsCm?: string;
  shoeSize?: string;
  hairColor?: string;
  eyeColor?: string;
  servicesTitle?: string;
  services?: Array<{ title: string; description: string; price: string }>;
  selectedTemplate?: string;
  photos?: Array<{ url: string; photographer?: string; studio?: string; instagram?: string }>;
  experienceLevel?: "beginner" | "intermediate" | "professional";
}

interface AIOnboardingChatProps {
  onComplete: (data: ExtractedData) => void;
  onSkip: () => void;
  userEmail: string;
  userName?: string;
  subscriptionTier?: "free" | "professional" | "deluxe";
}

type OnboardingStep = "profile" | "about" | "services" | "template" | "photos";

// =============================================================================
// SVG Icons - Custom Icons for the Modeling Industry
// =============================================================================
const Icons = {
  // Photo Analysis - Camera with AI sparkles
  photoAnalysis: (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="12" width="40" height="28" rx="4" />
      <path d="M16 12V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
      <circle cx="24" cy="26" r="8" />
      <circle cx="24" cy="26" r="4" />
      {/* AI Sparkles */}
      <path d="M38 8l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3" strokeWidth="1.5" fill="currentColor" />
      <path d="M8 6l0.7 2 2 0.7-2 0.7L8 12l-0.7-2.6-2-0.7 2-0.7L8 6" strokeWidth="1" fill="currentColor" />
    </svg>
  ),
  
  // Comp Card Scanner - Document with scan lines
  compScanner: (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="8" y="4" width="32" height="40" rx="2" />
      <circle cx="24" cy="16" r="6" />
      <path d="M16 28h16" />
      <path d="M16 34h12" />
      <path d="M16 38h8" />
      {/* Scan beam */}
      <path d="M4 20h40" strokeWidth="2" stroke="#C4A484" strokeDasharray="4 2" />
      {/* Corner markers */}
      <path d="M8 8v-4h4" strokeWidth="2" />
      <path d="M40 8v-4h-4" strokeWidth="2" />
      <path d="M8 40v4h4" strokeWidth="2" />
      <path d="M40 40v4h-4" strokeWidth="2" />
    </svg>
  ),
  
  // Comp Card Generator - Card with plus/create
  compGenerator: (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="6" y="8" width="28" height="36" rx="2" />
      <circle cx="20" cy="20" r="5" />
      <path d="M12 30h16" />
      <path d="M12 35h12" />
      <path d="M12 40h8" />
      {/* Plus badge */}
      <circle cx="38" cy="38" r="8" fill="#C4A484" stroke="none" />
      <path d="M38 34v8M34 38h8" stroke="white" strokeWidth="2" />
    </svg>
  ),
  
  // Bio Generator - Pen with sparkle
  bioGenerator: (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 40l4-16L36 8l4 4-24 24-16 4z" />
      <path d="M28 16l4 4" />
      <path d="M12 36l-4 4" strokeLinecap="round" />
      {/* AI Sparkle */}
      <path d="M40 4l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5 1.5-4" strokeWidth="1.5" fill="currentColor" />
    </svg>
  ),
  
  // Location Pin
  location: (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M24 4C15.2 4 8 11.2 8 20c0 12 16 24 16 24s16-12 16-24c0-8.8-7.2-16-16-16z" />
      <circle cx="24" cy="20" r="6" />
      {/* Crosshair */}
      <path d="M24 10v-6M24 32v-6M14 20h-6M34 20h6" strokeDasharray="2 2" />
    </svg>
  ),
  
  // Services Suggest - Price tag with AI
  servicesSuggest: (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 24L24 4h16a4 4 0 0 1 4 4v16L24 44 4 24z" />
      <circle cx="34" cy="14" r="4" />
      <path d="M16 24l4 4 8-8" strokeWidth="2" />
      {/* AI Sparkle */}
      <path d="M8 8l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3" strokeWidth="1" fill="currentColor" />
    </svg>
  ),
  
  // Upload Image
  uploadImage: (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="6" y="10" width="36" height="28" rx="2" />
      <circle cx="16" cy="20" r="4" />
      <path d="M42 30l-10-10-14 14H6" />
      <path d="M24 4v12M18 10l6-6 6 6" strokeWidth="2" />
    </svg>
  ),
  
  // Template
  template: (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="4" width="40" height="40" rx="2" />
      <path d="M4 14h40" />
      <path d="M16 44V14" />
      <rect x="20" y="18" width="20" height="10" rx="1" />
      <rect x="20" y="32" width="12" height="8" rx="1" />
    </svg>
  ),
  
  // Photos/Gallery
  photos: (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="8" y="12" width="32" height="28" rx="2" />
      <rect x="4" y="8" width="32" height="28" rx="2" fill="white" stroke="currentColor" />
      <circle cx="14" cy="18" r="3" />
      <path d="M36 28l-8-8-12 12H4" />
    </svg>
  ),
  
  // Send
  send: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  ),
  
  // Sparkle/AI
  sparkle: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" />
    </svg>
  ),
  
  // Check
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  
  // Agency
  agency: (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 44h40" />
      <path d="M8 44V16l16-12 16 12v28" />
      <rect x="18" y="28" width="12" height="16" />
      <rect x="14" y="18" width="6" height="6" />
      <rect x="28" y="18" width="6" height="6" />
    </svg>
  ),
  
  // Social Media
  socialMedia: (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Instagram-style camera */}
      <rect x="8" y="8" width="32" height="32" rx="8" />
      <circle cx="24" cy="24" r="8" />
      <circle cx="35" cy="13" r="3" fill="currentColor" />
      {/* Connection dots */}
      <circle cx="6" cy="6" r="2" fill="#C4A484" />
      <circle cx="42" cy="6" r="2" fill="#C4A484" />
      <path d="M6 6l4 4M42 6l-4 4" strokeWidth="1" stroke="#C4A484" />
    </svg>
  ),
  
  // Crown (Pro)
  crown: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M2 8l4 12h12l4-12-5 4-5-8-5 8-5-4z" />
    </svg>
  ),
  
  // Arrow Right
  arrowRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
};

// =============================================================================
// Tool Definitions - Prominent AI-Powered Tools
// =============================================================================
interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  action: "upload" | "click" | "location";
  highlight?: boolean;
}

const STEP_TOOLS: Record<OnboardingStep, Tool[]> = {
  profile: [
    {
      id: "location",
      name: "Auto-Detect Location",
      description: "Instantly find your city based on your current location",
      icon: Icons.location,
      action: "location",
    },
    {
      id: "social-media",
      name: "Connect Socials",
      description: "Add your Instagram, TikTok, and website in one click",
      icon: Icons.socialMedia,
      action: "click",
    },
    {
      id: "agency",
      name: "Agency Details",
      description: "Add your representation details for professional credibility",
      icon: Icons.agency,
      action: "click",
    },
  ],
  about: [
    {
      id: "photo-analysis",
      name: "AI Photo Analyzer",
      description: "Upload a photo and let AI extract your measurements, hair color, and eye color automatically",
      icon: Icons.photoAnalysis,
      action: "upload",
      highlight: true,
    },
    {
      id: "comp-scanner",
      name: "Comp Card Scanner",
      description: "Scan your existing comp card to import all your stats instantly",
      icon: Icons.compScanner,
      action: "upload",
      highlight: true,
    },
    {
      id: "bio-generator",
      name: "AI Bio Writer",
      description: "Generate a compelling professional bio based on your details",
      icon: Icons.bioGenerator,
      action: "click",
    },
    {
      id: "upload-avatar",
      name: "Upload Profile Photo",
      description: "Add your headshot for your About page",
      icon: Icons.uploadImage,
      action: "upload",
    },
  ],
  services: [
    {
      id: "services-suggest",
      name: "Smart Service Suggestions",
      description: "Get personalized service recommendations with competitive pricing for your market",
      icon: Icons.servicesSuggest,
      action: "click",
      highlight: true,
    },
    {
      id: "comp-generator",
      name: "Comp Card Generator",
      description: "Create a professional comp card using your profile and best photos",
      icon: Icons.compGenerator,
      action: "click",
      highlight: true,
    },
  ],
  template: [
    {
      id: "template-preview",
      name: "Preview Templates",
      description: "See how your portfolio will look with each template design",
      icon: Icons.template,
      action: "click",
    },
  ],
  photos: [
    {
      id: "upload-photos",
      name: "Upload Portfolio Photos",
      description: "Drag and drop or click to add your best work",
      icon: Icons.photos,
      action: "upload",
    },
  ],
};

// =============================================================================
// Styles (Following Pose & Poise Style Guide)
// =============================================================================
const styles = {
  container: {
    display: "flex",
    height: "100%",
    backgroundColor: "#FAF9F7",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    overflow: "hidden",
  },
  
  // Left Panel - Tools
  toolsPanel: {
    width: "360px",
    borderRight: "1px solid rgba(26, 26, 26, 0.08)",
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
  },
  toolsPanelHeader: {
    padding: "32px 24px 24px",
    borderBottom: "1px solid rgba(26, 26, 26, 0.08)",
  },
  toolsPanelTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    color: "#C4A484",
    marginBottom: "8px",
  },
  toolsPanelSubtitle: {
    fontSize: "24px",
    fontWeight: 300,
    color: "#1A1A1A",
    lineHeight: 1.3,
  },
  toolsList: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "16px",
  },
  toolCard: (highlight: boolean = false, active: boolean = false) => ({
    padding: "20px",
    marginBottom: "12px",
    backgroundColor: active ? "rgba(196, 164, 132, 0.12)" : highlight ? "rgba(196, 164, 132, 0.06)" : "#FAF9F7",
    border: active ? "2px solid #C4A484" : highlight ? "1px solid rgba(196, 164, 132, 0.3)" : "1px solid rgba(26, 26, 26, 0.08)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
  }),
  toolIcon: (highlight: boolean = false) => ({
    width: "56px",
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: highlight ? "#1A1A1A" : "white",
    color: highlight ? "#FAF9F7" : "#1A1A1A",
    border: highlight ? "none" : "1px solid rgba(26, 26, 26, 0.1)",
    flexShrink: 0,
  }),
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "14px",
    fontWeight: 600,
    color: "#1A1A1A",
    marginBottom: "4px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  toolDescription: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "12px",
    color: "rgba(26, 26, 26, 0.6)",
    lineHeight: 1.5,
  },
  aiBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "2px 8px",
    backgroundColor: "#C4A484",
    color: "white",
    fontSize: "9px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
  },
  
  // Right Panel - Chat
  chatPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    minWidth: 0, // Allow flex item to shrink
  },
  chatHeader: {
    padding: "24px 32px",
    borderBottom: "1px solid rgba(26, 26, 26, 0.08)",
    backgroundColor: "white",
  },
  stepIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
  },
  stepDot: (active: boolean, completed: boolean) => ({
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: completed ? "#1A1A1A" : active ? "#C4A484" : "rgba(26, 26, 26, 0.15)",
    transition: "all 0.3s ease",
  }),
  stepName: (active: boolean) => ({
    fontFamily: "'Outfit', sans-serif",
    fontSize: "11px",
    fontWeight: active ? 600 : 400,
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
    color: active ? "#C4A484" : "rgba(26, 26, 26, 0.4)",
  }),
  chatTitle: {
    fontSize: "clamp(24px, 3vw, 32px)",
    fontWeight: 300,
    color: "#1A1A1A",
    marginBottom: "8px",
  },
  chatSubtitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "14px",
    color: "rgba(26, 26, 26, 0.6)",
    lineHeight: 1.6,
  },
  
  // Messages
  messagesContainer: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "24px 32px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
    minHeight: 0, // Required for flex item to scroll properly
  },
  messageWrapper: (isUser: boolean) => ({
    display: "flex",
    justifyContent: isUser ? "flex-end" : "flex-start",
    gap: "12px",
    alignItems: "flex-start",
  }),
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#1A1A1A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "#C4A484",
  },
  messageBubble: (isUser: boolean) => ({
    maxWidth: "80%",
    padding: "16px 20px",
    backgroundColor: isUser ? "#1A1A1A" : "white",
    color: isUser ? "#FAF9F7" : "#1A1A1A",
    fontFamily: "'Outfit', sans-serif",
    fontSize: "14px",
    lineHeight: 1.6,
    border: isUser ? "none" : "1px solid rgba(26, 26, 26, 0.08)",
  }),
  attachmentPreview: {
    marginTop: "12px",
    display: "flex",
    gap: "8px",
    flexWrap: "wrap" as const,
  },
  attachmentImage: {
    width: "80px",
    height: "80px",
    objectFit: "cover" as const,
    border: "1px solid rgba(26, 26, 26, 0.1)",
  },
  typingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "16px 20px",
    backgroundColor: "white",
    border: "1px solid rgba(26, 26, 26, 0.08)",
    maxWidth: "100px",
  },
  dot: (delay: number) => ({
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#C4A484",
    animation: `pulse 1.4s infinite ease-in-out both`,
    animationDelay: `${delay}s`,
  }),
  
  // Floating Data Summary
  dataSummaryWrapper: {
    position: "absolute" as const,
    bottom: "16px",
    right: "16px",
    zIndex: 10,
    maxWidth: "320px",
  },
  dataSummaryBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#1A1A1A",
    color: "#FAF9F7",
    cursor: "pointer",
    fontFamily: "'Outfit', sans-serif",
    fontSize: "12px",
    fontWeight: 500,
    borderRadius: "24px",
    boxShadow: "0 4px 20px rgba(26, 26, 26, 0.15)",
    transition: "all 0.3s ease",
  },
  dataSummaryPanel: {
    backgroundColor: "white",
    border: "1px solid rgba(196, 164, 132, 0.3)",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(26, 26, 26, 0.12)",
    overflow: "hidden",
    marginBottom: "8px",
  },
  dataSummaryHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(26, 26, 26, 0.08)",
    backgroundColor: "rgba(196, 164, 132, 0.05)",
  },
  dataSummaryTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "1.5px",
    textTransform: "uppercase" as const,
    color: "#C4A484",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  dataSummaryContent: {
    padding: "16px 20px",
    maxHeight: "280px",
    overflowY: "auto" as const,
  },
  dataGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "10px",
  },
  dataItem: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "13px",
    color: "#1A1A1A",
    display: "flex",
    gap: "8px",
  },
  dataLabel: {
    fontWeight: 500,
    color: "rgba(26, 26, 26, 0.6)",
    minWidth: "80px",
    flexShrink: 0,
  },
  dataValue: {
    color: "#1A1A1A",
    wordBreak: "break-word" as const,
  },
  
  // Input Area
  inputContainer: {
    padding: "20px 32px 24px",
    borderTop: "1px solid rgba(26, 26, 26, 0.08)",
    backgroundColor: "white",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "flex-end",
    gap: "12px",
  },
  textInput: {
    flex: 1,
    padding: "14px 18px",
    fontSize: "14px",
    fontFamily: "'Outfit', sans-serif",
    border: "1px solid rgba(26, 26, 26, 0.15)",
    backgroundColor: "#FAF9F7",
    color: "#1A1A1A",
    outline: "none",
    resize: "none" as const,
    minHeight: "50px",
    maxHeight: "100px",
    lineHeight: 1.5,
    transition: "border-color 0.3s ease",
  },
  sendButton: (disabled: boolean) => ({
    width: "50px",
    height: "50px",
    border: "none",
    backgroundColor: disabled ? "rgba(26, 26, 26, 0.2)" : "#1A1A1A",
    color: "#FAF9F7",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  }),
  
  // Navigation
  navigationContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "1px solid rgba(26, 26, 26, 0.08)",
  },
  navButton: (primary: boolean) => ({
    padding: "12px 28px",
    fontSize: "13px",
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 500,
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
    border: primary ? "none" : "1px solid rgba(26, 26, 26, 0.2)",
    backgroundColor: primary ? "#1A1A1A" : "transparent",
    color: primary ? "#FAF9F7" : "#1A1A1A",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }),
  skipLink: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "12px",
    color: "rgba(26, 26, 26, 0.5)",
    background: "none",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
  },
  
  // Upsell
  upsellCard: {
    backgroundColor: "rgba(196, 164, 132, 0.08)",
    border: "1px solid rgba(196, 164, 132, 0.2)",
    padding: "20px",
    marginTop: "16px",
  },
  upsellTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "18px",
    fontWeight: 400,
    color: "#1A1A1A",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  upsellText: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "13px",
    color: "rgba(26, 26, 26, 0.7)",
    lineHeight: 1.5,
    marginBottom: "12px",
  },
  upsellButton: {
    padding: "10px 20px",
    backgroundColor: "#C4A484",
    color: "white",
    border: "none",
    fontFamily: "'Outfit', sans-serif",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
    cursor: "pointer",
  },
};

// =============================================================================
// Step Configuration
// =============================================================================
const STEP_CONFIG: Record<OnboardingStep, { title: string; subtitle: string }> = {
  profile: {
    title: "Your Profile",
    subtitle: "Let's establish your professional identity. Use our tools to quickly set up your profile.",
  },
  about: {
    title: "About You",
    subtitle: "Share your story and stats. Our AI tools can extract your measurements from photos or comp cards.",
  },
  services: {
    title: "Your Services",
    subtitle: "Showcase what you offer. We'll suggest competitive pricing based on your market and experience.",
  },
  template: {
    title: "Choose Your Look",
    subtitle: "Select a stunning template that reflects your unique style and brand.",
  },
  photos: {
    title: "Your Portfolio",
    subtitle: "Upload your best work and credit your creative collaborators.",
  },
};

// =============================================================================
// Tool Sequences for Guided Flow
// =============================================================================
const TOOL_SEQUENCES: Record<OnboardingStep, string[]> = {
  profile: ["location", "social-media", "agency"],
  about: ["photo-analyzer", "comp-scanner", "bio-generator"],
  services: ["services-suggest", "comp-generator"],
  template: [], // Templates are click-to-select, no tool sequence
  photos: ["photo-upload"],
};

// =============================================================================
// Component
// =============================================================================
export function AIOnboardingChat({ 
  onComplete, 
  onSkip, 
  userEmail,
  userName,
  subscriptionTier = "free" 
}: AIOnboardingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("profile");
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [selectedServices] = useState<string[]>([]);
  const [showSocialMediaForm, setShowSocialMediaForm] = useState(false);
  const [socialHandles, setSocialHandles] = useState({ instagram: '', tiktok: '', website: '' });
  const [showAgencyForm, setShowAgencyForm] = useState(false);
  const [agencyDetails, setAgencyDetails] = useState({ name: '', website: '', email: '' });
  const [showDataSummary, setShowDataSummary] = useState(false);
  
  // Guided flow state
  const [currentToolIndex, setCurrentToolIndex] = useState(-1); // -1 means greeting phase
  const currentToolIndexRef = useRef(-1); // Ref to track current index for callbacks
  const [isAutoProgressing] = useState(true);
  const [toolCompleted, setToolCompleted] = useState<Record<string, boolean>>({});
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentToolRef = useRef<string | null>(null);
  const autoProgressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const locationRequestInProgressRef = useRef<boolean>(false);
  const progressInProgressRef = useRef<boolean>(false);

  const steps: OnboardingStep[] = ["profile", "about", "services", "template", "photos"];
  const currentStepIndex = steps.indexOf(currentStep);
  const currentToolSequence = TOOL_SEQUENCES[currentStep];

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Cleanup auto-progress timer
  useEffect(() => {
    return () => {
      if (autoProgressTimerRef.current) {
        clearTimeout(autoProgressTimerRef.current);
      }
    };
  }, []);

  // Track if we've initialized this step to prevent re-initialization
  const stepInitializedRef = useRef<string | null>(null);

  // Initial greeting and auto-start first tool
  useEffect(() => {
    // Prevent re-initialization if we've already initialized this step
    if (stepInitializedRef.current === currentStep) {
      return;
    }

    // Clear any pending timers
    if (autoProgressTimerRef.current) {
      clearTimeout(autoProgressTimerRef.current);
      autoProgressTimerRef.current = null;
    }

    // Mark this step as initialized
    stepInitializedRef.current = currentStep;
    
    // Reset flags
    locationRequestInProgressRef.current = false;
    progressInProgressRef.current = false;

    const greeting = getStepGreeting(currentStep);
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: greeting,
      timestamp: new Date(),
    }]);
    
    // Reset tool index for new step
    setCurrentToolIndex(-1);
    currentToolIndexRef.current = -1;
    setToolCompleted({});
    setShowSocialMediaForm(false);
    setShowAgencyForm(false);
    setActiveTool(null);
    
    // Auto-start first tool after greeting delay
    if (isAutoProgressing && currentToolSequence.length > 0) {
      autoProgressTimerRef.current = setTimeout(() => {
        progressToNextTool();
      }, 2000); // 2 second delay after greeting
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Function to progress to next tool in sequence
  const progressToNextTool = useCallback(() => {
    // Prevent multiple simultaneous progressions
    if (progressInProgressRef.current) {
      return;
    }

    // Use ref to get the current index (avoids stale closure issues)
    const nextIndex = currentToolIndexRef.current + 1;
    
    if (nextIndex < currentToolSequence.length) {
      const nextToolId = currentToolSequence[nextIndex];
      const nextTool = STEP_TOOLS[currentStep]?.find(t => t.id === nextToolId);
      
      if (nextTool) {
        progressInProgressRef.current = true;
        
        // Update both state and ref
        setCurrentToolIndex(nextIndex);
        currentToolIndexRef.current = nextIndex;
        
        // Announce the next tool
        const toolAnnouncement = getToolAnnouncement(nextToolId, nextIndex === 0);
        if (toolAnnouncement) {
          addAssistantMessage(toolAnnouncement);
        }
        
        // Auto-trigger the tool after announcement
        autoProgressTimerRef.current = setTimeout(() => {
          handleToolClick(nextTool);
          progressInProgressRef.current = false;
        }, 1500);
      }
    } else {
      // All tools completed for this step
      progressInProgressRef.current = false;
      addAssistantMessage(getStepCompletionMessage(currentStep));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentToolSequence, currentStep]);

  // Get announcement message for each tool
  const getToolAnnouncement = (toolId: string, isFirst: boolean): string => {
    const prefix = isFirst ? "Let's start by" : "Next, let's";
    
    switch (toolId) {
      case "location":
        return `${prefix} finding your location. This helps me suggest services and pricing tailored to your market.`;
      case "social-media":
        return `${prefix} connect your social profiles. This helps clients discover more of your work.`;
      case "agency":
        return `${prefix} add your agency details if you're represented. This adds credibility to your portfolio.`;
      case "photo-analyzer":
        return `${prefix} analyze a photo to extract your measurements. Upload any full-body photo for best results.`;
      case "comp-scanner":
        return `Already have a comp card? ${prefix} scan it to import all your stats instantly.`;
      case "bio-generator":
        return `${prefix} craft your professional bio. I'll write something compelling based on what you've shared.`;
      case "services-suggest":
        return `${prefix} build your service offerings. I'll suggest popular services with competitive pricing for your market.`;
      case "comp-generator":
        return `${prefix} create your professional comp card using your profile info.`;
      case "photo-upload":
        return `${prefix} upload your portfolio photos. Drag and drop or click to select your best work.`;
      default:
        return "";
    }
  };

  // Get completion message for each step
  const getStepCompletionMessage = (step: OnboardingStep): string => {
    const name = firstName || "there";
    switch (step) {
      case "profile":
        return `Excellent work, ${name}! Your profile is looking great. Click "Continue" to move on to your About section, where we'll capture your story and stats.`;
      case "about":
        return `Perfect, ${name}! Your stats and bio are set. Click "Continue" to set up your services and pricing.`;
      case "services":
        return `Your services are ready, ${name}! Click "Continue" to choose a stunning template for your portfolio.`;
      case "template":
        return `Great choice! Click "Continue" to upload your portfolio photos.`;
      case "photos":
        return `Amazing work, ${name}! Your portfolio is almost ready. Click "Continue" to preview and publish!`;
      default:
        return "Ready to continue!";
    }
  };

  // Mark tool as completed and progress to next
  const completeCurrentTool = useCallback((toolId: string) => {
    setToolCompleted(prev => ({ ...prev, [toolId]: true }));
    setActiveTool(null);
    setShowSocialMediaForm(false);
    
    // Progress to next tool after a short delay
    if (isAutoProgressing) {
      autoProgressTimerRef.current = setTimeout(() => {
        progressToNextTool();
      }, 2000);
    }
  }, [isAutoProgressing, progressToNextTool]);

  // Skip current tool and move to next
  const skipCurrentTool = useCallback(() => {
    const currentToolId = currentToolSequence[currentToolIndex];
    if (currentToolId) {
      addAssistantMessage("No problem, we can skip this for now. You can always update it later.");
      completeCurrentTool(currentToolId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentToolIndex, currentToolSequence, completeCurrentTool]);

  // Get first name for personalized greeting
  const firstName = userName?.split(' ')[0] || '';
  const personalGreeting = firstName ? `Hi ${firstName}! ` : '';

  const getStepGreeting = (step: OnboardingStep): string => {
    switch (step) {
      case "profile":
        return `${personalGreeting}Welcome to Pose & Poise${firstName ? '' : ''}. I'm your AI assistant, here to help you build a stunning portfolio in minutes.${firstName ? `\n\nI already have your name, so we're off to a great start!` : ''}\n\nLet's set up your profile quickly:\n\n• Auto-Detect Location - Find your city instantly\n• Connect Socials - Add Instagram, TikTok & website\n• Agency Details - If you're represented\n\nOr just type your info and I'll organize it for you.`;
      case "about":
        return `${personalGreeting ? `Perfect, ${firstName}! ` : ''}Let's capture your story and stats.\n\nI have powerful AI tools to save you time:\n\n• AI Photo Analyzer - Upload any photo and I'll extract your measurements, hair color, and eye color\n• Comp Card Scanner - Already have a comp card? Scan it to import all your stats instantly\n• AI Bio Writer - I'll craft a compelling professional bio for you\n\nClick a tool to get started, or tell me about yourself.`;
      case "services":
        return `${firstName ? `Great progress, ${firstName}! ` : ''}Now let's showcase your services.\n\nUse my tools to build your service offerings quickly:\n\n• Smart Service Suggestions - I'll recommend services with competitive pricing for your market and experience level\n• Comp Card Generator - Create a professional comp card using your profile\n\n${subscriptionTier === "deluxe" ? "As a Deluxe member, you can generate multiple specialized comp cards: Agency, Editorial, Commercial, Fitness, Parts, and more." : ""}`;
      case "template":
        return `${firstName ? `Almost there, ${firstName}! ` : ''}Choose a template that reflects your style.\n\n${subscriptionTier === "free" ? "Your plan includes Rose, Poise, and Lumiere templates. Upgrade to unlock the exclusive Noir template." : "You have access to all premium templates."}\n\nClick on a template below to see a preview.`;
      case "photos":
        return `${firstName ? `Final step, ${firstName}! ` : ''}Time to showcase your best work.\n\nUpload your portfolio photos and credit your creative team for each image.\n\n${subscriptionTier === "free" ? "Your plan allows up to 10 photos. Upgrade for more." : subscriptionTier === "professional" ? "Your Professional plan allows up to 50 photos." : "Your Deluxe plan includes unlimited uploads."}\n\nOnce you've uploaded at least 2 photos, you can preview your portfolio.`;
      default:
        return "How can I assist you?";
    }
  };

  const handleToolClick = async (tool: Tool) => {
    // Clear any pending auto-progress timer when user manually interacts
    if (autoProgressTimerRef.current) {
      clearTimeout(autoProgressTimerRef.current);
      autoProgressTimerRef.current = null;
    }
    
    // Reset progress flag since we're manually triggering
    progressInProgressRef.current = false;
    
    setActiveTool(tool.id);
    currentToolRef.current = tool.id;
    
    if (tool.action === "upload") {
      fileInputRef.current?.click();
    } else if (tool.action === "location") {
      handleGetLocation();
    } else if (tool.action === "click") {
      if (tool.id === "bio-generator") {
        handleAIRequest("bio-generator", "Generate a professional bio for me");
      } else if (tool.id === "services-suggest") {
        handleAIRequest("services-suggest", "Suggest modeling services with pricing");
      } else if (tool.id === "comp-generator") {
        handleAIRequest("comp-generator", "Generate my professional comp card");
      } else if (tool.id === "agency") {
        setShowAgencyForm(true);
      } else if (tool.id === "social-media") {
        setShowSocialMediaForm(true);
      }
    }
  };

  const handleGetLocation = async () => {
    // Prevent multiple simultaneous location requests
    if (locationRequestInProgressRef.current) {
      return;
    }

    if (!navigator.geolocation) {
      addAssistantMessage("Geolocation is not supported by your browser. Please type your city and country, or click 'Skip' to continue.");
      // Mark as complete so we don't loop
      completeCurrentTool("location");
      return;
    }

    locationRequestInProgressRef.current = true;
    addAssistantMessage("Detecting your location...");
    setIsTyping(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          
          if (!response.ok) throw new Error("Failed to get location");
          
          const locationData = await response.json();
          const city = locationData.city || locationData.locality || "";
          const country = locationData.countryName || "";
          const locationString = [city, country].filter(Boolean).join(", ");
          
          setExtractedData(prev => ({ ...prev, location: locationString }));
          setIsTyping(false);
          addAssistantMessage(`✓ Found you! Your location is **${locationString}**.\n\nThis will help us suggest appropriate services and pricing for your market.`);
          
          // Auto-progress to next tool
          locationRequestInProgressRef.current = false;
          completeCurrentTool("location");
        } catch {
          setIsTyping(false);
          addAssistantMessage("I couldn't determine your exact location. Please type your city and country, or click 'Skip' to continue.");
          locationRequestInProgressRef.current = false;
          // Don't auto-complete on error - let user manually input or skip
        }
      },
      () => {
        setIsTyping(false);
        addAssistantMessage("Location access was denied. Please type your city and country (e.g., 'Los Angeles, USA'), or click 'Skip' to continue.");
        locationRequestInProgressRef.current = false;
        // Don't auto-complete on denial - let user manually input or skip
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleAIRequest = async (tool: string, message: string) => {
    setIsTyping(true);
    
    try {
      const formData = new FormData();
      formData.append("message", message);
      formData.append("step", currentStep);
      formData.append("tool", tool);
      formData.append("subscriptionTier", subscriptionTier);
      formData.append("context", JSON.stringify({
        extractedData,
        selectedServices,
        messageHistory: messages.slice(-5).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }));

      const response = await fetch("/api/onboarding/ai-chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();

      if (data.extractedData) {
        setExtractedData((prev) => ({ ...prev, ...data.extractedData }));
      }

      addAssistantMessage(data.message);
    } catch (error) {
      console.error("AI request error:", error);
      addAssistantMessage("I encountered an issue. Please try again or provide the information manually.");
    } finally {
      setIsTyping(false);
      setActiveTool(null);
    }
  };

  const addUserMessage = (content: string, attachments?: Message["attachments"]) => {
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
      attachments,
    }]);
  };

  const addAssistantMessage = (content: string) => {
    setMessages((prev) => [...prev, {
      id: Date.now().toString() + "-assistant",
      role: "assistant",
      content,
      timestamp: new Date(),
    }]);
  };

  const handleSend = useCallback(async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput && pendingImages.length === 0) return;

    const attachments: Message["attachments"] = pendingImages.map((file) => ({
      type: "image",
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    addUserMessage(trimmedInput || "Uploaded image for analysis", attachments.length > 0 ? attachments : undefined);
    setInputValue("");
    const imagesToProcess = [...pendingImages];
    setPendingImages([]);

    // Handle location input locally
    if (activeTool === "location" && trimmedInput) {
      setExtractedData(prev => ({ ...prev, location: trimmedInput }));
      addAssistantMessage(`✓ Location set to **${trimmedInput}**.\n\nThis will help us suggest appropriate services and pricing for your market.`);
      completeCurrentTool("location");
      return;
    }

    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append("message", trimmedInput);
      formData.append("step", currentStep);
      formData.append("tool", currentToolRef.current || "");
      formData.append("subscriptionTier", subscriptionTier);
      formData.append("context", JSON.stringify({
        extractedData,
        selectedServices,
        messageHistory: messages.slice(-5).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }));

      for (const file of imagesToProcess) {
        formData.append("images", file);
      }

      const response = await fetch("/api/onboarding/ai-chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();

      if (data.extractedData) {
        setExtractedData((prev) => ({ ...prev, ...data.extractedData }));
      }

      addAssistantMessage(data.message);
    } catch (error) {
      console.error("AI chat error:", error);
      addAssistantMessage("I apologize, but I encountered an issue. Please try again.");
    } finally {
      setIsTyping(false);
      currentToolRef.current = null;
    }
  }, [inputValue, pendingImages, currentStep, subscriptionTier, extractedData, selectedServices, messages, activeTool, completeCurrentTool]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setPendingImages((prev) => [...prev, ...files.slice(0, 3 - prev.length)]);
      // Trigger send after image selection
      setTimeout(() => {
        handleSend();
      }, 100);
    }
    // Reset file input
    if (e.target) e.target.value = "";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removePendingImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveSocials = () => {
    const updates: Partial<ExtractedData> = {};
    if (socialHandles.instagram) updates.instagram = socialHandles.instagram.replace('@', '');
    if (socialHandles.tiktok) updates.tiktok = socialHandles.tiktok.replace('@', '');
    if (socialHandles.website) updates.website = socialHandles.website;
    
    if (Object.keys(updates).length > 0) {
      setExtractedData(prev => ({ ...prev, ...updates }));
      
      const connected: string[] = [];
      if (updates.instagram) connected.push(`@${updates.instagram} on Instagram`);
      if (updates.tiktok) connected.push(`@${updates.tiktok} on TikTok`);
      if (updates.website) connected.push(updates.website);
      
      addAssistantMessage(`✓ Saved your social profiles:\n\n${connected.map(s => `• ${s}`).join('\n')}\n\nThese will appear on your portfolio so clients can easily find more of your work.`);
    }
    
    setShowSocialMediaForm(false);
    setSocialHandles({ instagram: '', tiktok: '', website: '' });
    
    // Auto-progress to next tool
    completeCurrentTool("social-media");
  };
  
  const handleSkipSocials = () => {
    setShowSocialMediaForm(false);
    setSocialHandles({ instagram: '', tiktok: '', website: '' });
    skipCurrentTool();
  };

  const handleSaveAgency = () => {
    if (agencyDetails.name) {
      setExtractedData(prev => ({
        ...prev,
        isRepresented: true,
        agencyName: agencyDetails.name,
        agencyWebsite: agencyDetails.website || undefined,
        agencyContact: agencyDetails.email || undefined,
      }));
      
      addAssistantMessage(`✓ Agency details saved!\n\n• **${agencyDetails.name}**${agencyDetails.website ? `\n• ${agencyDetails.website}` : ''}${agencyDetails.email ? `\n• ${agencyDetails.email}` : ''}\n\nYour representation will be displayed on your portfolio.`);
    } else {
      setExtractedData(prev => ({ ...prev, isRepresented: false }));
      addAssistantMessage(`✓ Got it! I've noted that you're currently not represented by an agency.`);
    }
    
    setShowAgencyForm(false);
    setAgencyDetails({ name: '', website: '', email: '' });
    completeCurrentTool("agency");
  };
  
  const handleSkipAgency = () => {
    setShowAgencyForm(false);
    setAgencyDetails({ name: '', website: '', email: '' });
    setExtractedData(prev => ({ ...prev, isRepresented: false }));
    skipCurrentTool();
  };

  const handleNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
      setMessages([]);
      currentToolRef.current = null;
      setActiveTool(null);
    } else {
      onComplete(extractedData);
    }
  };

  const handlePrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
      setMessages([]);
      currentToolRef.current = null;
      setActiveTool(null);
    }
  };

  const extractedDataItems = [
    extractedData.displayName && { label: "Name", value: extractedData.displayName },
    extractedData.location && { label: "Location", value: extractedData.location },
    extractedData.instagram && { label: "Instagram", value: `@${extractedData.instagram}` },
    extractedData.tiktok && { label: "TikTok", value: `@${extractedData.tiktok}` },
    extractedData.website && { label: "Website", value: extractedData.website },
    extractedData.agencyName && { label: "Agency", value: extractedData.agencyName },
    extractedData.heightCm && { label: "Height", value: `${extractedData.heightCm} cm` },
    extractedData.bustCm && { label: "Bust", value: `${extractedData.bustCm} cm` },
    extractedData.waistCm && { label: "Waist", value: `${extractedData.waistCm} cm` },
    extractedData.hipsCm && { label: "Hips", value: `${extractedData.hipsCm} cm` },
    extractedData.shoeSize && { label: "Shoe", value: extractedData.shoeSize },
    extractedData.hairColor && { label: "Hair", value: extractedData.hairColor },
    extractedData.eyeColor && { label: "Eyes", value: extractedData.eyeColor },
    extractedData.bio && { label: "Bio", value: extractedData.bio.length > 60 ? extractedData.bio.substring(0, 60) + "..." : extractedData.bio },
  ].filter(Boolean) as { label: string; value: string }[];
  
  const hasExtractedData = extractedDataItems.length > 0;
  const currentTools = STEP_TOOLS[currentStep] || [];

  // Render Upsell when appropriate
  const renderUpsell = () => {
    if (subscriptionTier !== "free") return null;
    if (currentStep !== "template" && currentStep !== "photos" && currentStep !== "services") return null;

    const upsells: Record<string, { title: string; text: string }> = {
      services: {
        title: "Unlock Comp Card Generator",
        text: "Professional and Deluxe members can generate multiple specialized comp cards for different markets.",
      },
      template: {
        title: "Access Premium Templates",
        text: "Upgrade to unlock the exclusive Noir template and future premium designs.",
      },
      photos: {
        title: "Unlimited Photo Uploads",
        text: "Professional allows 50 photos, Deluxe offers unlimited uploads plus analytics.",
      },
    };

    const upsell = upsells[currentStep];
    if (!upsell) return null;

    return (
      <div style={styles.upsellCard}>
        <div style={styles.upsellTitle}>
          <span style={{ color: "#C4A484" }}>{Icons.crown}</span>
          {upsell.title}
        </div>
        <p style={styles.upsellText}>{upsell.text}</p>
        <button style={styles.upsellButton}>View Plans</button>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .message-enter { animation: fadeIn 0.3s ease forwards; }
        .tool-card:hover { 
          border-color: #C4A484 !important; 
          background-color: rgba(196, 164, 132, 0.08) !important; 
        }
        .send-btn:hover:not(:disabled) { background-color: #C4A484 !important; }
        .nav-btn:hover { background-color: rgba(196, 164, 132, 0.1) !important; }
        .nav-btn-primary:hover { background-color: #C4A484 !important; }
        .input-focus:focus { border-color: #C4A484 !important; }
      `}</style>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />

      {/* Left Panel - AI Tools */}
      <div style={styles.toolsPanel}>
        <div style={styles.toolsPanelHeader}>
          <div style={styles.toolsPanelTitle}>AI-Powered Tools</div>
          <div style={styles.toolsPanelSubtitle}>
            Save time with smart automation
          </div>
        </div>
        
        <div style={styles.toolsList}>
          {currentTools.map((tool) => (
            <div
              key={tool.id}
              style={styles.toolCard(tool.highlight, activeTool === tool.id)}
              className="tool-card"
              onClick={() => handleToolClick(tool)}
            >
              <div style={styles.toolIcon(tool.highlight)}>
                {tool.icon}
              </div>
              <div style={styles.toolInfo}>
                <div style={styles.toolName}>
                  {tool.name}
                  {tool.highlight && (
                    <span style={styles.aiBadge}>AI</span>
                  )}
                </div>
                <div style={styles.toolDescription}>
                  {tool.description}
                </div>
              </div>
            </div>
          ))}
          
          {/* Subscription-based tools */}
          {currentStep === "services" && subscriptionTier === "free" && (
            <div style={{ ...styles.toolCard(false, false), opacity: 0.5, cursor: "not-allowed" }}>
              <div style={styles.toolIcon(false)}>
                {Icons.compGenerator}
              </div>
              <div style={styles.toolInfo}>
                <div style={styles.toolName}>
                  Comp Card Generator
                  <span style={{ ...styles.aiBadge, backgroundColor: "#1A1A1A" }}>PRO</span>
                </div>
                <div style={styles.toolDescription}>
                  Upgrade to Professional or Deluxe to generate comp cards
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div style={{ ...styles.chatPanel, position: "relative" as const }}>
        {/* Chat Header */}
        <div style={styles.chatHeader}>
          <div style={styles.stepIndicator}>
            {steps.map((step, index) => (
              <div key={step} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={styles.stepDot(step === currentStep, index < currentStepIndex)} />
                <span style={styles.stepName(step === currentStep)}>
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <div style={{ width: "20px", height: "1px", backgroundColor: "rgba(26,26,26,0.1)", margin: "0 4px" }} />
                )}
              </div>
            ))}
          </div>
          <h1 style={styles.chatTitle}>{STEP_CONFIG[currentStep].title}</h1>
          <p style={styles.chatSubtitle}>{STEP_CONFIG[currentStep].subtitle}</p>
        </div>

        {/* Messages */}
        <div ref={chatContainerRef} style={styles.messagesContainer}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={styles.messageWrapper(message.role === "user")}
              className="message-enter"
            >
              {message.role === "assistant" && (
                <div style={styles.avatar}>
                  {Icons.sparkle}
                </div>
              )}
              <div>
                <div style={styles.messageBubble(message.role === "user")}>
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {message.content}
                  </div>
                  {message.attachments && message.attachments.length > 0 && (
                    <div style={styles.attachmentPreview}>
                      {message.attachments.map((att, i) => (
                        <Image
                          key={i}
                          src={att.url}
                          alt={att.name}
                          width={80}
                          height={80}
                          style={styles.attachmentImage}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div style={styles.messageWrapper(false)}>
              <div style={styles.avatar}>{Icons.sparkle}</div>
              <div style={styles.typingIndicator}>
                <div style={styles.dot(0)} />
                <div style={styles.dot(0.2)} />
                <div style={styles.dot(0.4)} />
              </div>
            </div>
          )}

          {/* Social Media Form */}
          {showSocialMediaForm && (
            <div style={{
              backgroundColor: "white",
              border: "1px solid rgba(196, 164, 132, 0.3)",
              padding: "24px",
              maxWidth: "420px",
            }}>
              <div style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase" as const,
                color: "#C4A484",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                {Icons.socialMedia}
                Connect Your Socials
              </div>

              {/* Quick Connect Buttons */}
              <div style={{ 
                display: "flex", 
                gap: "12px", 
                marginBottom: "24px",
              }}>
                {/* Connect Instagram Button */}
                <button
                  onClick={() => {
                    // TODO: Implement Instagram OAuth
                    alert('Instagram connection coming soon! For now, enter your handle below.');
                  }}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px 16px",
                    background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(225, 48, 108, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Connect Instagram
                </button>

                {/* Connect TikTok Button */}
                <button
                  onClick={() => {
                    // TODO: Implement TikTok OAuth
                    alert('TikTok connection coming soon! For now, enter your handle below.');
                  }}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px 16px",
                    background: "#000000",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  Connect TikTok
                </button>
              </div>

              {/* Divider */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "20px",
              }}>
                <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(26, 26, 26, 0.1)" }} />
                <span style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "11px",
                  color: "rgba(26, 26, 26, 0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}>or enter manually</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(26, 26, 26, 0.1)" }} />
              </div>
              
              {/* Instagram */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#1A1A1A",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="18" cy="6" r="1.5" fill="currentColor" />
                  </svg>
                  Instagram
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
                  <span style={{
                    padding: "10px 12px",
                    backgroundColor: "#FAF9F7",
                    border: "1px solid rgba(26, 26, 26, 0.15)",
                    borderRight: "none",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "14px",
                    color: "rgba(26, 26, 26, 0.5)",
                  }}>@</span>
                  <input
                    type="text"
                    placeholder="yourhandle"
                    value={socialHandles.instagram}
                    onChange={(e) => setSocialHandles(prev => ({ ...prev, instagram: e.target.value }))}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      fontSize: "14px",
                      fontFamily: "'Outfit', sans-serif",
                      border: "1px solid rgba(26, 26, 26, 0.15)",
                      backgroundColor: "#FAF9F7",
                      color: "#1A1A1A",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
              
              {/* TikTok */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#1A1A1A",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                  TikTok
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
                  <span style={{
                    padding: "10px 12px",
                    backgroundColor: "#FAF9F7",
                    border: "1px solid rgba(26, 26, 26, 0.15)",
                    borderRight: "none",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "14px",
                    color: "rgba(26, 26, 26, 0.5)",
                  }}>@</span>
                  <input
                    type="text"
                    placeholder="yourhandle"
                    value={socialHandles.tiktok}
                    onChange={(e) => setSocialHandles(prev => ({ ...prev, tiktok: e.target.value }))}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      fontSize: "14px",
                      fontFamily: "'Outfit', sans-serif",
                      border: "1px solid rgba(26, 26, 26, 0.15)",
                      backgroundColor: "#FAF9F7",
                      color: "#1A1A1A",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
              
              {/* Website */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#1A1A1A",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Website
                </label>
                <input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={socialHandles.website}
                  onChange={(e) => setSocialHandles(prev => ({ ...prev, website: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    fontFamily: "'Outfit', sans-serif",
                    border: "1px solid rgba(26, 26, 26, 0.15)",
                    backgroundColor: "#FAF9F7",
                    color: "#1A1A1A",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              
              {/* Buttons */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleSkipSocials}
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "12px",
                    fontWeight: 500,
                    letterSpacing: "1px",
                    textTransform: "uppercase" as const,
                    border: "1px solid rgba(26, 26, 26, 0.2)",
                    backgroundColor: "transparent",
                    color: "#1A1A1A",
                    cursor: "pointer",
                  }}
                >
                  Skip
                </button>
                <button
                  onClick={handleSaveSocials}
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "12px",
                    fontWeight: 500,
                    letterSpacing: "1px",
                    textTransform: "uppercase" as const,
                    border: "none",
                    backgroundColor: "#1A1A1A",
                    color: "#FAF9F7",
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Agency Form */}
          {showAgencyForm && (
            <div style={{
              backgroundColor: "white",
              border: "1px solid rgba(196, 164, 132, 0.3)",
              padding: "24px",
              maxWidth: "420px",
            }}>
              <div style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase" as const,
                color: "#C4A484",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                {Icons.agency}
                Agency Representation
              </div>
              
              <p style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "13px",
                color: "rgba(26, 26, 26, 0.6)",
                marginBottom: "20px",
                lineHeight: 1.5,
              }}>
                Are you represented by a modeling agency? If so, add their details below. This information will appear on your portfolio.
              </p>
              
              {/* Agency Name */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#1A1A1A",
                }}>
                  Agency Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Elite Model Management"
                  value={agencyDetails.name}
                  onChange={(e) => setAgencyDetails(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    fontFamily: "'Outfit', sans-serif",
                    border: "1px solid rgba(26, 26, 26, 0.15)",
                    backgroundColor: "#FAF9F7",
                    color: "#1A1A1A",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              
              {/* Agency Website */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#1A1A1A",
                }}>
                  Agency Website <span style={{ color: "rgba(26, 26, 26, 0.4)", fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://agency.com"
                  value={agencyDetails.website}
                  onChange={(e) => setAgencyDetails(prev => ({ ...prev, website: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    fontFamily: "'Outfit', sans-serif",
                    border: "1px solid rgba(26, 26, 26, 0.15)",
                    backgroundColor: "#FAF9F7",
                    color: "#1A1A1A",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              
              {/* Agent Email */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#1A1A1A",
                }}>
                  Agent Contact Email <span style={{ color: "rgba(26, 26, 26, 0.4)", fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="agent@agency.com"
                  value={agencyDetails.email}
                  onChange={(e) => setAgencyDetails(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    fontFamily: "'Outfit', sans-serif",
                    border: "1px solid rgba(26, 26, 26, 0.15)",
                    backgroundColor: "#FAF9F7",
                    color: "#1A1A1A",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              
              {/* Buttons */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleSkipAgency}
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "12px",
                    fontWeight: 500,
                    letterSpacing: "1px",
                    textTransform: "uppercase" as const,
                    border: "1px solid rgba(26, 26, 26, 0.2)",
                    backgroundColor: "transparent",
                    color: "#1A1A1A",
                    cursor: "pointer",
                  }}
                >
                  Not Represented
                </button>
                <button
                  onClick={handleSaveAgency}
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "12px",
                    fontWeight: 500,
                    letterSpacing: "1px",
                    textTransform: "uppercase" as const,
                    border: "none",
                    backgroundColor: "#1A1A1A",
                    color: "#FAF9F7",
                    cursor: "pointer",
                  }}
                >
                  Save Agency
                </button>
              </div>
            </div>
          )}

          {/* Upsell */}
          {renderUpsell()}
          
          {/* Floating Data Summary */}
          {hasExtractedData && (
            <div style={styles.dataSummaryWrapper}>
              {showDataSummary && (
                <div style={styles.dataSummaryPanel}>
                  <div style={styles.dataSummaryHeader}>
                    <div style={styles.dataSummaryTitle}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                      Collected Info
                    </div>
                    <button
                      onClick={() => setShowDataSummary(false)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        color: "rgba(26, 26, 26, 0.4)",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                  <div style={styles.dataSummaryContent}>
                    <div style={styles.dataGrid}>
                      {extractedDataItems.map((item, i) => (
                        <div key={i} style={styles.dataItem}>
                          <span style={styles.dataLabel}>{item.label}</span>
                          <span style={styles.dataValue}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div
                style={styles.dataSummaryBadge}
                onClick={() => setShowDataSummary(!showDataSummary)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#C4A484";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#1A1A1A";
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                {extractedDataItems.length} items collected
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{ 
                    transform: showDataSummary ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease"
                  }}
                >
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={styles.inputContainer}>
          {/* Active Tool Skip Button */}
          {activeTool && !showSocialMediaForm && !showAgencyForm && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "12px",
            }}>
              <button
                onClick={skipCurrentTool}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#C4A484",
                  backgroundColor: "rgba(196, 164, 132, 0.1)",
                  border: "1px solid rgba(196, 164, 132, 0.3)",
                  borderRadius: "20px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(196, 164, 132, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(196, 164, 132, 0.1)";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 5H21M21 5L17 9M21 5L17 1M11 19H3M3 19L7 23M3 19L7 15" />
                </svg>
                Skip this step
              </button>
            </div>
          )}

          {/* Pending Images Preview */}
          {pendingImages.length > 0 && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              {pendingImages.map((file, i) => (
                <div key={i} style={{ position: "relative", width: "50px", height: "50px" }}>
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    width={50}
                    height={50}
                    style={{ objectFit: "cover", border: "1px solid rgba(26,26,26,0.1)" }}
                  />
                  <button
                    onClick={() => removePendingImage(i)}
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      width: "18px",
                      height: "18px",
                      backgroundColor: "#1A1A1A",
                      border: "none",
                      color: "white",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                    }}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={styles.inputWrapper}>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={activeTool === "location" ? "Type your city and country (e.g., Los Angeles, USA)..." : "Type a message or click a tool to get started..."}
              style={styles.textInput}
              className="input-focus"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() && pendingImages.length === 0}
              style={styles.sendButton(!inputValue.trim() && pendingImages.length === 0)}
              className="send-btn"
            >
              {Icons.send}
            </button>
          </div>

          {/* Navigation */}
          <div style={styles.navigationContainer}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {currentStepIndex > 0 && (
                <button
                  onClick={handlePrevStep}
                  style={styles.navButton(false)}
                  className="nav-btn"
                >
                  Back
                </button>
              )}
              <button style={styles.skipLink} onClick={onSkip}>
                Skip AI setup
              </button>
            </div>
            
            <button
              onClick={handleNextStep}
              style={styles.navButton(true)}
              className="nav-btn-primary"
            >
              {currentStepIndex === steps.length - 1 ? "Complete" : "Continue"}
              {Icons.arrowRight}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

