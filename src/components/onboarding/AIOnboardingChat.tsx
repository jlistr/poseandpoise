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
    minHeight: "calc(100vh - 80px)",
    backgroundColor: "#FAF9F7",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
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
  
  // Extracted Data Card
  extractedCard: {
    backgroundColor: "white",
    border: "1px solid rgba(196, 164, 132, 0.3)",
    padding: "20px",
    marginTop: "16px",
  },
  extractedLabel: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    color: "#C4A484",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  dataGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",
  },
  dataItem: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "13px",
    color: "#1A1A1A",
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
// Component
// =============================================================================
export function AIOnboardingChat({ 
  onComplete, 
  onSkip, 
  userEmail,
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
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentToolRef = useRef<string | null>(null);

  const steps: OnboardingStep[] = ["profile", "about", "services", "template", "photos"];
  const currentStepIndex = steps.indexOf(currentStep);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Initial greeting based on step
  useEffect(() => {
    const greeting = getStepGreeting(currentStep);
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: greeting,
      timestamp: new Date(),
    }]);
  }, [currentStep]);

  const getStepGreeting = (step: OnboardingStep): string => {
    switch (step) {
      case "profile":
        return `Welcome to Pose & Poise. I'm your AI assistant, here to help you build a stunning portfolio in minutes.\n\nUse the tools on the left to get started quickly:\n\n- Auto-Detect Location - Find your city instantly\n- Agency Details - Add your representation\n\nOr simply type your information and I'll help organize it.`;
      case "about":
        return `Let's capture your story and stats.\n\nI have powerful AI tools to save you time:\n\n- AI Photo Analyzer - Upload any photo and I'll extract your measurements, hair color, and eye color\n- Comp Card Scanner - Already have a comp card? Scan it to import all your stats instantly\n- AI Bio Writer - I'll craft a compelling professional bio for you\n\nClick a tool to get started, or tell me about yourself.`;
      case "services":
        return `Now let's showcase your services.\n\nUse my tools to build your service offerings quickly:\n\n- Smart Service Suggestions - I'll recommend services with competitive pricing for your market and experience level\n- Comp Card Generator - Create a professional comp card using your profile\n\n${subscriptionTier === "deluxe" ? "As a Deluxe member, you can generate multiple specialized comp cards: Agency, Editorial, Commercial, Fitness, Parts, and more." : ""}`;
      case "template":
        return `Choose a template that reflects your style.\n\n${subscriptionTier === "free" ? "Your plan includes Rose, Poise, and Lumiere templates. Upgrade to unlock the exclusive Noir template." : "You have access to all premium templates."}\n\nClick on a template below to see a preview.`;
      case "photos":
        return `Time to showcase your best work.\n\nUpload your portfolio photos and credit your creative team for each image.\n\n${subscriptionTier === "free" ? "Your plan allows up to 10 photos. Upgrade for more." : subscriptionTier === "professional" ? "Your Professional plan allows up to 50 photos." : "Your Deluxe plan includes unlimited uploads."}\n\nOnce you've uploaded at least 2 photos, you can preview your portfolio.`;
      default:
        return "How can I assist you?";
    }
  };

  const handleToolClick = async (tool: Tool) => {
    setActiveTool(tool.id);
    currentToolRef.current = tool.id;
    
    if (tool.action === "upload") {
      fileInputRef.current?.click();
    } else if (tool.action === "location") {
      handleGetLocation();
    } else if (tool.action === "click") {
      if (tool.id === "bio-generator") {
        addUserMessage("Please help me write a compelling professional bio");
        handleAIRequest("bio-generator", "Generate a professional bio for me");
      } else if (tool.id === "services-suggest") {
        addUserMessage("Suggest services with competitive pricing for my market");
        handleAIRequest("services-suggest", "Suggest modeling services with pricing");
      } else if (tool.id === "comp-generator") {
        addUserMessage("I'd like to generate my comp card");
        handleAIRequest("comp-generator", "Generate my professional comp card");
      } else if (tool.id === "agency") {
        addAssistantMessage("Are you currently represented by a modeling agency?\n\nIf yes, please share:\n- Agency name\n- Agency website (optional)\n- Your agent's email (optional)\n\nThis information will be displayed on your portfolio to help clients and brands contact your representation.");
      }
    }
  };

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      addAssistantMessage("Geolocation is not supported by your browser. Please type your city and country.");
      setActiveTool(null);
      return;
    }

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
          addAssistantMessage(`Found you! Your location is ${locationString}.\n\nThis will help us suggest appropriate services and pricing for your market.\n\nAre you represented by an agency? Click the "Agency Details" tool or just tell me.`);
        } catch {
          addAssistantMessage("I couldn't determine your exact location. Please type your city and country.");
        } finally {
          setIsTyping(false);
          setActiveTool(null);
        }
      },
      () => {
        setIsTyping(false);
        setActiveTool(null);
        addAssistantMessage("Location access was denied. Please type your city and country (e.g., 'Los Angeles, USA').");
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
  }, [inputValue, pendingImages, currentStep, subscriptionTier, extractedData, selectedServices, messages]);

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

  const hasExtractedData = Object.keys(extractedData).length > 0;
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
      <div style={styles.chatPanel}>
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

          {/* Extracted Data Card */}
          {hasExtractedData && (
            <div style={styles.extractedCard}>
              <div style={styles.extractedLabel}>
                {Icons.check}
                Information Captured
              </div>
              <div style={styles.dataGrid}>
                {extractedData.location && <div style={styles.dataItem}><strong>Location:</strong> {extractedData.location}</div>}
                {extractedData.displayName && <div style={styles.dataItem}><strong>Name:</strong> {extractedData.displayName}</div>}
                {extractedData.agencyName && <div style={styles.dataItem}><strong>Agency:</strong> {extractedData.agencyName}</div>}
                {extractedData.heightCm && <div style={styles.dataItem}><strong>Height:</strong> {extractedData.heightCm} cm</div>}
                {extractedData.bustCm && <div style={styles.dataItem}><strong>Bust:</strong> {extractedData.bustCm} cm</div>}
                {extractedData.waistCm && <div style={styles.dataItem}><strong>Waist:</strong> {extractedData.waistCm} cm</div>}
                {extractedData.hipsCm && <div style={styles.dataItem}><strong>Hips:</strong> {extractedData.hipsCm} cm</div>}
                {extractedData.shoeSize && <div style={styles.dataItem}><strong>Shoe:</strong> {extractedData.shoeSize}</div>}
                {extractedData.hairColor && <div style={styles.dataItem}><strong>Hair:</strong> {extractedData.hairColor}</div>}
                {extractedData.eyeColor && <div style={styles.dataItem}><strong>Eyes:</strong> {extractedData.eyeColor}</div>}
                {extractedData.bio && <div style={{ ...styles.dataItem, gridColumn: "1 / -1" }}><strong>Bio:</strong> {extractedData.bio.substring(0, 100)}...</div>}
              </div>
            </div>
          )}

          {/* Upsell */}
          {renderUpsell()}
        </div>

        {/* Input Area */}
        <div style={styles.inputContainer}>
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
              placeholder="Type a message or click a tool to get started..."
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

