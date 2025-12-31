/**
 * Pose & Poise Shared Types
 */

import { ReactNode } from "react";

// Feature card data
export interface Feature {
  num: string;
  title: string;
  desc: string;
}

// Navigation link
export interface NavLink {
  label: string;
  href: string;
}

// CTA/Hero section props
export interface HeroProps {
  tagline?: string;
  headline: ReactNode;
  description: string;
  showEmailCapture?: boolean;
  ctaText?: string;
  ctaHref?: string;
  socialProof?: string;
}

// Feature section props
export interface FeatureSectionProps {
  label?: string;
  headline: ReactNode;
  description?: string;
  features: Feature[];
}

// CTA section props
export interface CTASectionProps {
  label?: string;
  headline: string;
  description?: string;
  ctaText: string;
  ctaHref?: string;
}

// Button variants
export type ButtonVariant = "primary" | "accent" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}

// Input props
export interface InputProps {
  type?: "text" | "email" | "password" | "tel";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

// Card props
export interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

// Layout props
export interface LayoutProps {
  children: ReactNode;
}

// Page metadata
export interface PageMeta {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

// Form state
export interface FormState {
  isSubmitting: boolean;
  isSubmitted: boolean;
  error: string | null;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface SubscribeResponse {
  message: string;
  email: string;
}

// Animation props
export interface AnimatedProps {
  delay?: number;
  duration?: number;
  className?: string;
  children: ReactNode;
}

export type TemplateId = 'editorial' | 'minimal' | 'classic';

export interface PortfolioTemplate {
  id: TemplateId;
  name: string;
  description: string;
  thumbnailUrl?: string;
  isAvailable: boolean;
  isPremium: boolean;
}

// Update your Profile type to include the template
export interface Profile {
  id: string;
  username: string | null;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  selected_template: TemplateId;
  // ... other fields
}