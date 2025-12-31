"use client";

import { useEffect, useRef } from "react";
import { trackPortfolioView } from "@/app/actions/analytics";

interface PortfolioTrackerProps {
  profileId: string;
  pagePath: string;
}

// Simple visitor ID generator (not a full fingerprint, but good enough for basic analytics)
function generateVisitorId(): string {
  // Check if we have an existing visitor ID
  if (typeof window !== "undefined") {
    const existing = localStorage.getItem("pp_visitor_id");
    if (existing) return existing;

    // Generate new ID
    const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("pp_visitor_id", newId);
    return newId;
  }
  return "";
}

// Generate session ID (expires after 30 min of inactivity)
function getSessionId(): string {
  if (typeof window !== "undefined") {
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    const now = Date.now();

    const stored = sessionStorage.getItem("pp_session");
    if (stored) {
      const { id, lastActive } = JSON.parse(stored);
      if (now - lastActive < SESSION_TIMEOUT) {
        // Update last active time
        sessionStorage.setItem("pp_session", JSON.stringify({ id, lastActive: now }));
        return id;
      }
    }

    // Create new session
    const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("pp_session", JSON.stringify({ id: newId, lastActive: now }));
    return newId;
  }
  return "";
}

// Detect device type
function getDeviceType(): string {
  if (typeof window === "undefined") return "unknown";

  const ua = navigator.userAgent;

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }

  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    return "mobile";
  }

  return "desktop";
}

// Detect browser
function getBrowser(): string {
  if (typeof window === "undefined") return "unknown";

  const ua = navigator.userAgent;

  if (ua.indexOf("Firefox") > -1) return "Firefox";
  if (ua.indexOf("SamsungBrowser") > -1) return "Samsung";
  if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) return "Opera";
  if (ua.indexOf("Trident") > -1) return "IE";
  if (ua.indexOf("Edge") > -1) return "Edge";
  if (ua.indexOf("Edg") > -1) return "Edge";
  if (ua.indexOf("Chrome") > -1) return "Chrome";
  if (ua.indexOf("Safari") > -1) return "Safari";

  return "Other";
}

// Detect OS
function getOS(): string {
  if (typeof window === "undefined") return "unknown";

  const ua = navigator.userAgent;

  if (ua.indexOf("Win") > -1) return "Windows";
  if (ua.indexOf("Mac") > -1) return "macOS";
  if (ua.indexOf("Linux") > -1) return "Linux";
  if (ua.indexOf("Android") > -1) return "Android";
  if (ua.indexOf("iPhone") > -1 || ua.indexOf("iPad") > -1) return "iOS";

  return "Other";
}

export function PortfolioTracker({ profileId, pagePath }: PortfolioTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    // Only track once per page load
    if (tracked.current) return;
    tracked.current = true;

    // Don't track if the visitor is the profile owner (check localStorage/cookie)
    const isOwner = localStorage.getItem("pp_user_id") === profileId;
    if (isOwner) return;

    // Gather tracking data
    const visitorId = generateVisitorId();
    const sessionId = getSessionId();
    const referrer = document.referrer || undefined;
    const deviceType = getDeviceType();
    const browser = getBrowser();
    const os = getOS();

    // Track the view
    trackPortfolioView({
      profile_id: profileId,
      visitor_id: visitorId,
      referrer,
      device_type: deviceType,
      browser,
      os,
      page_path: pagePath,
      session_id: sessionId,
      // Note: country/city/region would be set server-side via geo headers
    });
  }, [profileId, pagePath]);

  // This component doesn't render anything
  return null;
}