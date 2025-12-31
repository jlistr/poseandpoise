"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================================================
// Types
// ============================================================================

export interface PortfolioView {
  id: string;
  profile_id: string;
  visitor_id: string | null;
  referrer: string | null;
  referrer_domain: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  page_path: string | null;
  session_id: string | null;
  viewed_at: string;
}

export interface DailyViewData {
  date: string;
  views: number;
  unique_visitors: number;
}

export interface TopReferrer {
  domain: string;
  count: number;
}

export interface TopLocation {
  country: string;
  count: number;
}

export interface DeviceBreakdown {
  device: string;
  count: number;
  percentage: number;
}

export interface AnalyticsSummary {
  total_views: number;
  unique_visitors: number;
  views_today: number;
  views_this_week: number;
  views_this_month: number;
  avg_daily_views: number;
  top_referrers: TopReferrer[];
  top_locations: TopLocation[];
  device_breakdown: DeviceBreakdown[];
  daily_views: DailyViewData[];
  comp_card_views: number;
  comp_card_downloads: number;
}

export interface TrackViewInput {
  profile_id: string;
  visitor_id?: string;
  referrer?: string;
  country?: string;
  city?: string;
  region?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  page_path?: string;
  session_id?: string;
}

// ============================================================================
// Track Portfolio View (called from public pages)
// ============================================================================

export async function trackPortfolioView(input: TrackViewInput): Promise<{ success: boolean }> {
  const supabase = await createClient();

  // Extract domain from referrer
  let referrer_domain: string | null = null;
  if (input.referrer) {
    try {
      const url = new URL(input.referrer);
      referrer_domain = url.hostname.replace(/^www\./, "");
    } catch {
      referrer_domain = input.referrer;
    }
  }

  const { error } = await supabase.from("portfolio_views").insert({
    profile_id: input.profile_id,
    visitor_id: input.visitor_id || null,
    referrer: input.referrer || null,
    referrer_domain,
    country: input.country || null,
    city: input.city || null,
    region: input.region || null,
    device_type: input.device_type || null,
    browser: input.browser || null,
    os: input.os || null,
    page_path: input.page_path || null,
    session_id: input.session_id || null,
  });

  if (error) {
    console.error("Failed to track portfolio view:", error);
    return { success: false };
  }

  return { success: true };
}

// ============================================================================
// Track Comp Card View/Download
// ============================================================================

export async function trackCompCardView(
  compCardId: string,
  profileId: string,
  action: "view" | "download" = "view",
  visitorId?: string,
  referrer?: string
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  const { error } = await supabase.from("comp_card_views").insert({
    comp_card_id: compCardId,
    profile_id: profileId,
    visitor_id: visitorId || null,
    action,
    referrer: referrer || null,
  });

  if (error) {
    console.error("Failed to track comp card view:", error);
    return { success: false };
  }

  return { success: true };
}

// ============================================================================
// Get Analytics Summary (for dashboard)
// ============================================================================

export async function getAnalyticsSummary(
  days: number = 30
): Promise<{ success: boolean; data?: AnalyticsSummary; message?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const monthStart = new Date();
  monthStart.setDate(monthStart.getDate() - 30);

  // Fetch all views for the period
  const { data: views, error: viewsError } = await supabase
    .from("portfolio_views")
    .select("*")
    .eq("profile_id", user.id)
    .gte("viewed_at", startDateStr)
    .order("viewed_at", { ascending: false });

  if (viewsError) {
    console.error("Failed to fetch views:", viewsError);
    return { success: false, message: "Failed to fetch analytics" };
  }

  const allViews = views || [];

  // Calculate totals
  const total_views = allViews.length;
  const unique_visitors = new Set(allViews.map((v) => v.visitor_id).filter(Boolean)).size;

  const views_today = allViews.filter((v) => new Date(v.viewed_at) >= todayStart).length;
  const views_this_week = allViews.filter((v) => new Date(v.viewed_at) >= weekStart).length;
  const views_this_month = allViews.filter((v) => new Date(v.viewed_at) >= monthStart).length;

  const avg_daily_views = days > 0 ? Math.round(total_views / days) : 0;

  // Top referrers
  const referrerCounts: Record<string, number> = {};
  allViews.forEach((v) => {
    const domain = v.referrer_domain || "Direct";
    referrerCounts[domain] = (referrerCounts[domain] || 0) + 1;
  });
  const top_referrers: TopReferrer[] = Object.entries(referrerCounts)
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top locations
  const locationCounts: Record<string, number> = {};
  allViews.forEach((v) => {
    const country = v.country || "Unknown";
    locationCounts[country] = (locationCounts[country] || 0) + 1;
  });
  const top_locations: TopLocation[] = Object.entries(locationCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Device breakdown
  const deviceCounts: Record<string, number> = {};
  allViews.forEach((v) => {
    const device = v.device_type || "Unknown";
    deviceCounts[device] = (deviceCounts[device] || 0) + 1;
  });
  const device_breakdown: DeviceBreakdown[] = Object.entries(deviceCounts)
    .map(([device, count]) => ({
      device,
      count,
      percentage: total_views > 0 ? Math.round((count / total_views) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Daily views
  const dailyCounts: Record<string, { views: number; visitors: Set<string> }> = {};
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    dailyCounts[dateStr] = { views: 0, visitors: new Set() };
  }

  allViews.forEach((v) => {
    const dateStr = v.viewed_at.split("T")[0];
    if (dailyCounts[dateStr]) {
      dailyCounts[dateStr].views++;
      if (v.visitor_id) {
        dailyCounts[dateStr].visitors.add(v.visitor_id);
      }
    }
  });

  const daily_views: DailyViewData[] = Object.entries(dailyCounts)
    .map(([date, data]) => ({
      date,
      views: data.views,
      unique_visitors: data.visitors.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Comp card stats
  const { data: compCardViews } = await supabase
    .from("comp_card_views")
    .select("action")
    .eq("profile_id", user.id)
    .gte("viewed_at", startDateStr);

  const comp_card_views = compCardViews?.filter((v) => v.action === "view").length || 0;
  const comp_card_downloads = compCardViews?.filter((v) => v.action === "download").length || 0;

  return {
    success: true,
    data: {
      total_views,
      unique_visitors,
      views_today,
      views_this_week,
      views_this_month,
      avg_daily_views,
      top_referrers,
      top_locations,
      device_breakdown,
      daily_views,
      comp_card_views,
      comp_card_downloads,
    },
  };
}

// ============================================================================
// Get Recent Views (activity feed)
// ============================================================================

export async function getRecentViews(
  limit: number = 20
): Promise<{ success: boolean; data?: PortfolioView[]; message?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("portfolio_views")
    .select("*")
    .eq("profile_id", user.id)
    .order("viewed_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch recent views:", error);
    return { success: false, message: "Failed to fetch recent views" };
  }

  return { success: true, data: data || [] };
}