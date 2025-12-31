"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================================================
// Types - Basic Analytics
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

// ============================================================================
// Types - Advanced Analytics (Deluxe Only)
// ============================================================================

export interface CityBreakdown {
  city: string;
  region: string | null;
  country: string | null;
  count: number;
  percentage: number;
}

export interface BrowserBreakdown {
  browser: string;
  count: number;
  percentage: number;
}

export interface OSBreakdown {
  os: string;
  count: number;
  percentage: number;
}

export interface HourlyDistribution {
  hour: number; // 0-23
  label: string; // "12 AM", "1 AM", etc.
  count: number;
  percentage: number;
}

export interface DayOfWeekDistribution {
  day: number; // 0-6 (Sunday-Saturday)
  label: string; // "Sunday", "Monday", etc.
  count: number;
  percentage: number;
}

export interface VisitorLoyalty {
  new_visitors: number;
  returning_visitors: number;
  new_percentage: number;
  returning_percentage: number;
  avg_visits_per_returning: number;
}

export interface ReferrerDetail {
  full_url: string;
  domain: string;
  count: number;
  is_social: boolean;
  platform?: string; // "instagram", "tiktok", "linkedin", etc.
}

export interface EngagementTrend {
  current_period: number;
  previous_period: number;
  change_percentage: number;
  trend: "up" | "down" | "stable";
}

export interface DeluxeAnalytics {
  // Geographic deep dive
  top_cities: CityBreakdown[];
  
  // Technical breakdown
  browser_breakdown: BrowserBreakdown[];
  os_breakdown: OSBreakdown[];
  
  // Time patterns
  hourly_distribution: HourlyDistribution[];
  day_of_week_distribution: DayOfWeekDistribution[];
  peak_hour: number;
  peak_day: string;
  
  // Visitor behavior
  visitor_loyalty: VisitorLoyalty;
  
  // Referrer details
  referrer_details: ReferrerDetail[];
  social_traffic_percentage: number;
  
  // Trends
  views_trend: EngagementTrend;
  visitors_trend: EngagementTrend;
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
  // Deluxe-only advanced analytics
  deluxe_insights: DeluxeAnalytics | null;
  is_deluxe: boolean;
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
// Helper Functions for Advanced Analytics
// ============================================================================

const SOCIAL_PLATFORMS: Record<string, string> = {
  "instagram.com": "Instagram",
  "l.instagram.com": "Instagram",
  "tiktok.com": "TikTok",
  "vm.tiktok.com": "TikTok",
  "twitter.com": "Twitter/X",
  "x.com": "Twitter/X",
  "t.co": "Twitter/X",
  "facebook.com": "Facebook",
  "m.facebook.com": "Facebook",
  "l.facebook.com": "Facebook",
  "linkedin.com": "LinkedIn",
  "lnkd.in": "LinkedIn",
  "pinterest.com": "Pinterest",
  "pin.it": "Pinterest",
  "youtube.com": "YouTube",
  "youtu.be": "YouTube",
};

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function calculateDeluxeAnalytics(
  allViews: PortfolioView[],
  total_views: number,
  days: number
): DeluxeAnalytics {
  // ========== GEOGRAPHIC DEEP DIVE ==========
  const cityCounts: Record<string, { city: string; region: string | null; country: string | null; count: number }> = {};
  allViews.forEach((v) => {
    const city = v.city || "Unknown";
    const key = `${city}-${v.region || ""}-${v.country || ""}`;
    if (!cityCounts[key]) {
      cityCounts[key] = { city, region: v.region, country: v.country, count: 0 };
    }
    cityCounts[key].count++;
  });
  const top_cities: CityBreakdown[] = Object.values(cityCounts)
    .map((c) => ({
      ...c,
      percentage: total_views > 0 ? Math.round((c.count / total_views) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // ========== BROWSER BREAKDOWN ==========
  const browserCounts: Record<string, number> = {};
  allViews.forEach((v) => {
    const browser = v.browser || "Unknown";
    browserCounts[browser] = (browserCounts[browser] || 0) + 1;
  });
  const browser_breakdown: BrowserBreakdown[] = Object.entries(browserCounts)
    .map(([browser, count]) => ({
      browser,
      count,
      percentage: total_views > 0 ? Math.round((count / total_views) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // ========== OS BREAKDOWN ==========
  const osCounts: Record<string, number> = {};
  allViews.forEach((v) => {
    const os = v.os || "Unknown";
    osCounts[os] = (osCounts[os] || 0) + 1;
  });
  const os_breakdown: OSBreakdown[] = Object.entries(osCounts)
    .map(([os, count]) => ({
      os,
      count,
      percentage: total_views > 0 ? Math.round((count / total_views) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // ========== HOURLY DISTRIBUTION ==========
  const hourlyCounts: number[] = new Array(24).fill(0);
  allViews.forEach((v) => {
    const hour = new Date(v.viewed_at).getHours();
    hourlyCounts[hour]++;
  });
  const hourly_distribution: HourlyDistribution[] = hourlyCounts.map((count, hour) => ({
    hour,
    label: formatHour(hour),
    count,
    percentage: total_views > 0 ? Math.round((count / total_views) * 100) : 0,
  }));
  const peak_hour = hourlyCounts.indexOf(Math.max(...hourlyCounts));

  // ========== DAY OF WEEK DISTRIBUTION ==========
  const dayCounts: number[] = new Array(7).fill(0);
  allViews.forEach((v) => {
    const day = new Date(v.viewed_at).getDay();
    dayCounts[day]++;
  });
  const day_of_week_distribution: DayOfWeekDistribution[] = dayCounts.map((count, day) => ({
    day,
    label: DAY_NAMES[day],
    count,
    percentage: total_views > 0 ? Math.round((count / total_views) * 100) : 0,
  }));
  const peak_day = DAY_NAMES[dayCounts.indexOf(Math.max(...dayCounts))];

  // ========== VISITOR LOYALTY ==========
  const visitorViewCounts: Record<string, number> = {};
  allViews.forEach((v) => {
    if (v.visitor_id) {
      visitorViewCounts[v.visitor_id] = (visitorViewCounts[v.visitor_id] || 0) + 1;
    }
  });
  const uniqueVisitorIds = Object.keys(visitorViewCounts);
  const returningVisitorIds = uniqueVisitorIds.filter((id) => visitorViewCounts[id] > 1);
  const newVisitorIds = uniqueVisitorIds.filter((id) => visitorViewCounts[id] === 1);
  
  const returning_visitors = returningVisitorIds.length;
  const new_visitors = newVisitorIds.length;
  const totalKnownVisitors = returning_visitors + new_visitors;
  
  const avg_visits_per_returning = returning_visitors > 0
    ? Math.round(
        (returningVisitorIds.reduce((sum, id) => sum + visitorViewCounts[id], 0) / returning_visitors) * 10
      ) / 10
    : 0;

  const visitor_loyalty: VisitorLoyalty = {
    new_visitors,
    returning_visitors,
    new_percentage: totalKnownVisitors > 0 ? Math.round((new_visitors / totalKnownVisitors) * 100) : 0,
    returning_percentage: totalKnownVisitors > 0 ? Math.round((returning_visitors / totalKnownVisitors) * 100) : 0,
    avg_visits_per_returning,
  };

  // ========== REFERRER DETAILS ==========
  const referrerDetailCounts: Record<string, { url: string; domain: string; count: number }> = {};
  allViews.forEach((v) => {
    const url = v.referrer || "Direct";
    const domain = v.referrer_domain || "Direct";
    if (!referrerDetailCounts[url]) {
      referrerDetailCounts[url] = { url, domain, count: 0 };
    }
    referrerDetailCounts[url].count++;
  });
  
  const referrer_details: ReferrerDetail[] = Object.values(referrerDetailCounts)
    .map((r) => {
      const platform = SOCIAL_PLATFORMS[r.domain.toLowerCase()];
      return {
        full_url: r.url,
        domain: r.domain,
        count: r.count,
        is_social: !!platform,
        platform,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const socialViews = allViews.filter((v) => {
    const domain = v.referrer_domain?.toLowerCase() || "";
    return !!SOCIAL_PLATFORMS[domain];
  }).length;
  const social_traffic_percentage = total_views > 0 ? Math.round((socialViews / total_views) * 100) : 0;

  // ========== ENGAGEMENT TRENDS ==========
  const halfPeriod = Math.floor(days / 2);
  const midPoint = new Date();
  midPoint.setDate(midPoint.getDate() - halfPeriod);

  const currentPeriodViews = allViews.filter((v) => new Date(v.viewed_at) >= midPoint).length;
  const previousPeriodViews = allViews.filter((v) => new Date(v.viewed_at) < midPoint).length;
  
  const viewsChange = previousPeriodViews > 0
    ? Math.round(((currentPeriodViews - previousPeriodViews) / previousPeriodViews) * 100)
    : currentPeriodViews > 0 ? 100 : 0;

  const views_trend: EngagementTrend = {
    current_period: currentPeriodViews,
    previous_period: previousPeriodViews,
    change_percentage: viewsChange,
    trend: viewsChange > 5 ? "up" : viewsChange < -5 ? "down" : "stable",
  };

  const currentVisitors = new Set(
    allViews.filter((v) => new Date(v.viewed_at) >= midPoint).map((v) => v.visitor_id).filter(Boolean)
  ).size;
  const previousVisitors = new Set(
    allViews.filter((v) => new Date(v.viewed_at) < midPoint).map((v) => v.visitor_id).filter(Boolean)
  ).size;
  
  const visitorsChange = previousVisitors > 0
    ? Math.round(((currentVisitors - previousVisitors) / previousVisitors) * 100)
    : currentVisitors > 0 ? 100 : 0;

  const visitors_trend: EngagementTrend = {
    current_period: currentVisitors,
    previous_period: previousVisitors,
    change_percentage: visitorsChange,
    trend: visitorsChange > 5 ? "up" : visitorsChange < -5 ? "down" : "stable",
  };

  return {
    top_cities,
    browser_breakdown,
    os_breakdown,
    hourly_distribution,
    day_of_week_distribution,
    peak_hour,
    peak_day,
    visitor_loyalty,
    referrer_details,
    social_traffic_percentage,
    views_trend,
    visitors_trend,
  };
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

  // Check subscription tier for Deluxe features
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  const isDeluxe = profile?.subscription_tier === "DELUXE";

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

  // Calculate advanced analytics for Deluxe users
  const deluxe_insights = isDeluxe ? calculateDeluxeAnalytics(allViews, total_views, days) : null;

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
      deluxe_insights,
      is_deluxe: isDeluxe,
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