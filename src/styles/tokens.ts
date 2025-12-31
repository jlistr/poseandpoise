/**
 * Pose & Poise Design Tokens
 * Auto-generated from style guide v1.0
 */

export const colors = {
    // Primary palette
    cream: "#FAF9F7",
    charcoal: "#1A1A1A",
    camel: "#C4A484",
    white: "#FFFFFF",
  
    // Text colors (charcoal with opacity)
    text: {
      primary: "#1A1A1A",
      secondary: "rgba(26, 26, 26, 0.7)",
      tertiary: "rgba(26, 26, 26, 0.6)",
      muted: "rgba(26, 26, 26, 0.4)",
    },
  
    // Text on dark backgrounds
    textLight: {
      primary: "#FAF9F7",
      secondary: "rgba(250, 249, 247, 0.6)",
    },
  
    // Border colors
    border: {
      light: "rgba(26, 26, 26, 0.2)",
      subtle: "rgba(26, 26, 26, 0.05)",
      divider: "rgba(26, 26, 26, 0.1)",
    },
  
    // Accent variants
    accent: {
      solid: "#C4A484",
      hover: "rgba(196, 164, 132, 0.3)",
      light: "rgba(196, 164, 132, 0.2)",
      wash: "rgba(196, 164, 132, 0.1)",
      subtle: "rgba(196, 164, 132, 0.03)",
    },
  
    // Backgrounds
    background: {
      primary: "#FAF9F7",
      card: "rgba(255, 255, 255, 0.6)",
      section: "#FFFFFF",
      dark: "#1A1A1A",
    },
  } as const;
  
  export const typography = {
    // Font families
    fontFamily: {
      display: "'Cormorant Garamond', Georgia, serif",
      body: "'Outfit', sans-serif",
      mono: "'SF Mono', 'Fira Code', monospace",
    },
  
    // Font sizes
    fontSize: {
      heroH1: "clamp(48px, 8vw, 96px)",
      sectionH2: "clamp(36px, 6vw, 64px)",
      featureH2: "clamp(36px, 5vw, 56px)",
      cardH3: "24px",
      logo: "18px",
      bodyLarge: "17px",
      body: "15px",
      bodySmall: "14px",
      button: "13px",
      label: "12px",
      caption: "12px",
      micro: "11px",
    },
  
    // Font weights
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
    },
  
    // Line heights
    lineHeight: {
      tight: 1.05,
      snug: 1.15,
      normal: 1.4,
      relaxed: 1.7,
      loose: 1.8,
    },
  
    // Letter spacing
    letterSpacing: {
      tight: "-1px",
      normal: "0",
      wide: "1px",
      wider: "2px",
      widest: "4px",
    },
  } as const;
  
  export const spacing = {
    // Padding scale
    padding: {
      xs: "8px",
      sm: "16px",
      md: "24px",
      lg: "32px",
      xl: "40px",
      "2xl": "48px",
      "3xl": "80px",
      "4xl": "120px",
      "5xl": "140px",
    },
  
    // Gap scale
    gap: {
      xs: "8px",
      sm: "16px",
      md: "24px",
      lg: "32px",
      xl: "40px",
      "2xl": "48px",
      "3xl": "80px",
    },
  } as const;
  
  export const effects = {
    // Shadows
    shadow: {
      buttonHover: "0 10px 40px rgba(196, 164, 132, 0.3)",
      cardHover: "0 20px 60px rgba(0, 0, 0, 0.06)",
    },
  
    // Backdrop
    backdrop: {
      blur: "blur(10px)",
    },
  
    // Transitions
    transition: {
      fast: "all 0.3s ease",
      smooth: "all 0.4s ease",
      button: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    },
  
    // Border radius
    borderRadius: {
      none: "0",
      sm: "4px",
      full: "50%",
    },
  } as const;
  
  export const borders = {
    card: `1px solid ${colors.border.subtle}`,
    cardHover: `1px solid ${colors.accent.hover}`,
    input: `1px solid ${colors.border.light}`,
    inputFocus: `1px solid ${colors.camel}`,
    divider: `1px solid ${colors.border.divider}`,
    decorative: `1px solid ${colors.accent.light}`,
  } as const;
  
  // Animation keyframes (for use in styled-components or CSS-in-JS)
  export const keyframes = {
    fadeUp: `
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    `,
    fadeIn: `
      from { opacity: 0; }
      to { opacity: 1; }
    `,
  } as const;
  
  // Animation delays for staggered entrance
  export const stagger = {
    delay1: "0.2s",
    delay2: "0.4s",
    delay3: "0.6s",
    delay4: "0.8s",
    delay5: "1s",
  } as const;
  
  // Breakpoints
  export const breakpoints = {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  } as const;
  
  // Z-index scale
  export const zIndex = {
    base: 0,
    above: 1,
    nav: 100,
    modal: 200,
    toast: 300,
  } as const;
  