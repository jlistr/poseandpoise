"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAnalyticsSummary, type AnalyticsSummary } from "@/app/actions/analytics";
import { colors, typography, spacing } from "@/styles/tokens";

type TimeRange = "7" | "30" | "90";

// Trend indicator component
function TrendBadge({ trend, percentage }: { trend: "up" | "down" | "stable"; percentage: number }) {
  const getColor = () => {
    if (trend === "up") return "#22C55E";
    if (trend === "down") return "#EF4444";
    return colors.text.muted;
  };

  const getIcon = () => {
    if (trend === "up") return "↑";
    if (trend === "down") return "↓";
    return "→";
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 8px",
        background: `${getColor()}15`,
        color: getColor(),
        fontSize: "12px",
        fontWeight: 500,
        borderRadius: "4px",
      }}
    >
      {getIcon()} {Math.abs(percentage)}%
    </span>
  );
}

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("30");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);

    const result = await getAnalyticsSummary(parseInt(timeRange));

    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.message || "Failed to load analytics");
    }

    setLoading(false);
  };

  const cardStyle: React.CSSProperties = {
    background: colors.background.card,
    border: `1px solid ${colors.border.subtle}`,
    padding: spacing.padding.lg,
  };

  const deluxeCardStyle: React.CSSProperties = {
    ...cardStyle,
    background: `linear-gradient(135deg, ${colors.background.card} 0%, rgba(196, 164, 132, 0.05) 100%)`,
    border: `1px solid ${colors.camel}30`,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.caption,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: spacing.padding.xs,
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: typography.fontFamily.display,
    fontSize: "32px",
    fontWeight: typography.fontWeight.light,
    color: colors.text.primary,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.cardH3,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.primary,
    marginBottom: spacing.padding.md,
  };

  const deluxeBadgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    background: `linear-gradient(135deg, ${colors.camel} 0%, #D4A574 100%)`,
    color: colors.cream,
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    borderRadius: "2px",
    marginLeft: "8px",
  };

  if (loading) {
    return (
      <div
        style={{
          padding: spacing.padding["2xl"],
          textAlign: "center",
          color: colors.text.muted,
        }}
      >
        <p style={{ fontFamily: typography.fontFamily.body }}>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: spacing.padding["2xl"],
          textAlign: "center",
          color: "#D64545",
        }}
      >
        <p style={{ fontFamily: typography.fontFamily.body }}>{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Calculate max for chart scaling
  const maxViews = Math.max(...data.daily_views.map((d) => d.views), 1);

  return (
    <div>
      {/* Time Range Selector */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: spacing.padding.lg,
          gap: spacing.gap.xs,
        }}
      >
        {[
          { value: "7", label: "7 Days" },
          { value: "30", label: "30 Days" },
          { value: "90", label: "90 Days" },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setTimeRange(option.value as TimeRange)}
            style={{
              padding: `${spacing.padding.xs} ${spacing.padding.md}`,
              background: timeRange === option.value ? colors.charcoal : "transparent",
              color: timeRange === option.value ? colors.cream : colors.text.secondary,
              border: `1px solid ${timeRange === option.value ? colors.charcoal : colors.border.light}`,
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.caption,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: spacing.gap.md,
          marginBottom: spacing.padding.xl,
        }}
      >
        <div style={cardStyle}>
          <p style={labelStyle}>Total Views</p>
          <p style={valueStyle}>{data.total_views.toLocaleString()}</p>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>Unique Visitors</p>
          <p style={valueStyle}>{data.unique_visitors.toLocaleString()}</p>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>Today</p>
          <p style={valueStyle}>{data.views_today.toLocaleString()}</p>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>This Week</p>
          <p style={valueStyle}>{data.views_this_week.toLocaleString()}</p>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>Avg Daily</p>
          <p style={valueStyle}>{data.avg_daily_views.toLocaleString()}</p>
        </div>
      </div>

      {/* Views Chart */}
      <div style={{ ...cardStyle, marginBottom: spacing.padding.xl }}>
        <h3 style={sectionTitleStyle}>Views Over Time</h3>
        <div
          style={{
            height: "200px",
            display: "flex",
            alignItems: "flex-end",
            gap: "2px",
            paddingTop: spacing.padding.md,
          }}
        >
          {data.daily_views.map((day, index) => {
            const height = maxViews > 0 ? (day.views / maxViews) * 100 : 0;
            const isToday = index === data.daily_views.length - 1;

            return (
              <div
                key={day.date}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "100%",
                  justifyContent: "flex-end",
                }}
                title={`${day.date}: ${day.views} views, ${day.unique_visitors} unique`}
              >
                <div
                  style={{
                    width: "100%",
                    height: `${Math.max(height, 2)}%`,
                    background: isToday ? colors.camel : colors.charcoal,
                    opacity: isToday ? 1 : 0.6,
                    transition: "height 0.3s ease",
                    minHeight: day.views > 0 ? "4px" : "2px",
                  }}
                />
              </div>
            );
          })}
        </div>
        {/* X-axis labels */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: spacing.padding.sm,
            fontFamily: typography.fontFamily.body,
            fontSize: "10px",
            color: colors.text.muted,
          }}
        >
          <span>
            {new Date(data.daily_views[0]?.date || "").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <span>
            {new Date(data.daily_views[data.daily_views.length - 1]?.date || "").toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric" }
            )}
          </span>
        </div>
      </div>

      {/* Bottom Grid: Referrers, Locations, Devices */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: spacing.gap.md,
          marginBottom: spacing.padding.xl,
        }}
      >
        {/* Top Referrers */}
        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>Top Referrers</h3>
          {data.top_referrers.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.gap.sm }}>
              {data.top_referrers.map((ref, index) => (
                <div
                  key={ref.domain}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: spacing.gap.sm }}>
                    <span
                      style={{
                        fontFamily: typography.fontFamily.body,
                        fontSize: typography.fontSize.caption,
                        color: colors.text.muted,
                        width: "20px",
                      }}
                    >
                      {index + 1}.
                    </span>
                    <span
                      style={{
                        fontFamily: typography.fontFamily.body,
                        fontSize: typography.fontSize.bodySmall,
                        color: colors.text.primary,
                      }}
                    >
                      {ref.domain}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.bodySmall,
                      color: colors.text.secondary,
                      fontWeight: typography.fontWeight.medium,
                    }}
                  >
                    {ref.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.bodySmall,
                color: colors.text.muted,
                fontStyle: "italic",
              }}
            >
              No referrer data yet
            </p>
          )}
        </div>

        {/* Top Locations */}
        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>Top Locations</h3>
          {data.top_locations.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.gap.sm }}>
              {data.top_locations.map((loc, index) => (
                <div
                  key={loc.country}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: spacing.gap.sm }}>
                    <span
                      style={{
                        fontFamily: typography.fontFamily.body,
                        fontSize: typography.fontSize.caption,
                        color: colors.text.muted,
                        width: "20px",
                      }}
                    >
                      {index + 1}.
                    </span>
                    <span
                      style={{
                        fontFamily: typography.fontFamily.body,
                        fontSize: typography.fontSize.bodySmall,
                        color: colors.text.primary,
                      }}
                    >
                      {loc.country}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.bodySmall,
                      color: colors.text.secondary,
                      fontWeight: typography.fontWeight.medium,
                    }}
                  >
                    {loc.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.bodySmall,
                color: colors.text.muted,
                fontStyle: "italic",
              }}
            >
              No location data yet
            </p>
          )}
        </div>

        {/* Device Breakdown */}
        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>Devices</h3>
          {data.device_breakdown.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.gap.sm }}>
              {data.device_breakdown.map((device) => (
                <div key={device.device}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: typography.fontFamily.body,
                        fontSize: typography.fontSize.bodySmall,
                        color: colors.text.primary,
                        textTransform: "capitalize",
                      }}
                    >
                      {device.device}
                    </span>
                    <span
                      style={{
                        fontFamily: typography.fontFamily.body,
                        fontSize: typography.fontSize.bodySmall,
                        color: colors.text.secondary,
                      }}
                    >
                      {device.percentage}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      background: colors.border.subtle,
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${device.percentage}%`,
                        background: colors.camel,
                        borderRadius: "3px",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.bodySmall,
                color: colors.text.muted,
                fontStyle: "italic",
              }}
            >
              No device data yet
            </p>
          )}
        </div>
      </div>

      {/* Comp Card Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: spacing.gap.md,
        }}
      >
        <div style={cardStyle}>
          <p style={labelStyle}>Comp Card Views</p>
          <p style={valueStyle}>{data.comp_card_views.toLocaleString()}</p>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>Comp Card Downloads</p>
          <p style={valueStyle}>{data.comp_card_downloads.toLocaleString()}</p>
        </div>
      </div>

      {/* ================================================================== */}
      {/* DELUXE ADVANCED ANALYTICS SECTION */}
      {/* ================================================================== */}
      
      {data.is_deluxe && data.deluxe_insights && (
        <>
          {/* Deluxe Section Header */}
          <div
            style={{
              marginTop: spacing.padding["2xl"],
              marginBottom: spacing.padding.lg,
              paddingTop: spacing.padding.xl,
              borderTop: `2px solid ${colors.camel}30`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: spacing.padding.sm }}>
              <h2
                style={{
                  fontFamily: typography.fontFamily.display,
                  fontSize: typography.fontSize.sectionH2,
                  fontWeight: typography.fontWeight.light,
                  color: colors.text.primary,
                }}
              >
                Advanced Insights
              </h2>
              <span style={deluxeBadgeStyle}>✦ Deluxe</span>
            </div>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.bodySmall,
                color: colors.text.secondary,
              }}
            >
              Deep dive into your portfolio performance with exclusive analytics.
            </p>
          </div>

          {/* Engagement Trends */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: spacing.gap.md,
              marginBottom: spacing.padding.xl,
            }}
          >
            <div style={deluxeCardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={labelStyle}>Views Trend</p>
                  <p style={{ ...valueStyle, fontSize: "28px" }}>
                    {data.deluxe_insights.views_trend.current_period.toLocaleString()}
                  </p>
                  <p
                    style={{
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.caption,
                      color: colors.text.muted,
                      marginTop: "4px",
                    }}
                  >
                    vs {data.deluxe_insights.views_trend.previous_period.toLocaleString()} previous
                  </p>
                </div>
                <TrendBadge
                  trend={data.deluxe_insights.views_trend.trend}
                  percentage={data.deluxe_insights.views_trend.change_percentage}
                />
              </div>
            </div>

            <div style={deluxeCardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={labelStyle}>Visitors Trend</p>
                  <p style={{ ...valueStyle, fontSize: "28px" }}>
                    {data.deluxe_insights.visitors_trend.current_period.toLocaleString()}
                  </p>
                  <p
                    style={{
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.caption,
                      color: colors.text.muted,
                      marginTop: "4px",
                    }}
                  >
                    vs {data.deluxe_insights.visitors_trend.previous_period.toLocaleString()} previous
                  </p>
                </div>
                <TrendBadge
                  trend={data.deluxe_insights.visitors_trend.trend}
                  percentage={data.deluxe_insights.visitors_trend.change_percentage}
                />
              </div>
            </div>

            <div style={deluxeCardStyle}>
              <p style={labelStyle}>Social Traffic</p>
              <p style={{ ...valueStyle, fontSize: "28px" }}>
                {data.deluxe_insights.social_traffic_percentage}%
              </p>
              <p
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.caption,
                  color: colors.text.muted,
                  marginTop: "4px",
                }}
              >
                from social platforms
              </p>
            </div>
          </div>

          {/* Visitor Loyalty */}
          <div style={{ ...deluxeCardStyle, marginBottom: spacing.padding.xl }}>
            <h3 style={sectionTitleStyle}>Visitor Loyalty</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: spacing.gap.lg,
              }}
            >
              <div>
                <p style={labelStyle}>New Visitors</p>
                <p style={{ ...valueStyle, fontSize: "24px" }}>
                  {data.deluxe_insights.visitor_loyalty.new_visitors.toLocaleString()}
                </p>
                <p
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.caption,
                    color: colors.text.muted,
                  }}
                >
                  {data.deluxe_insights.visitor_loyalty.new_percentage}% of total
                </p>
              </div>
              <div>
                <p style={labelStyle}>Returning Visitors</p>
                <p style={{ ...valueStyle, fontSize: "24px" }}>
                  {data.deluxe_insights.visitor_loyalty.returning_visitors.toLocaleString()}
                </p>
                <p
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.caption,
                    color: colors.text.muted,
                  }}
                >
                  {data.deluxe_insights.visitor_loyalty.returning_percentage}% of total
                </p>
              </div>
              <div>
                <p style={labelStyle}>Avg. Return Visits</p>
                <p style={{ ...valueStyle, fontSize: "24px" }}>
                  {data.deluxe_insights.visitor_loyalty.avg_visits_per_returning}
                </p>
                <p
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.caption,
                    color: colors.text.muted,
                  }}
                >
                  per returning visitor
                </p>
              </div>
            </div>
          </div>

          {/* Peak Times */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: spacing.gap.md,
              marginBottom: spacing.padding.xl,
            }}
          >
            {/* Hourly Distribution */}
            <div style={deluxeCardStyle}>
              <h3 style={sectionTitleStyle}>
                Peak Hours
                <span
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.caption,
                    color: colors.camel,
                    marginLeft: "12px",
                    fontWeight: typography.fontWeight.regular,
                  }}
                >
                  Peak: {data.deluxe_insights.hourly_distribution[data.deluxe_insights.peak_hour]?.label}
                </span>
              </h3>
              <div
                style={{
                  height: "120px",
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "2px",
                }}
              >
                {data.deluxe_insights.hourly_distribution.map((hour) => {
                  const maxHourly = Math.max(
                    ...data.deluxe_insights!.hourly_distribution.map((h) => h.count),
                    1
                  );
                  const height = (hour.count / maxHourly) * 100;
                  const isPeak = hour.hour === data.deluxe_insights!.peak_hour;

                  return (
                    <div
                      key={hour.hour}
                      style={{
                        flex: 1,
                        height: `${Math.max(height, 3)}%`,
                        background: isPeak ? colors.camel : colors.charcoal,
                        opacity: isPeak ? 1 : 0.4,
                        borderRadius: "2px 2px 0 0",
                        minHeight: "3px",
                      }}
                      title={`${hour.label}: ${hour.count} views (${hour.percentage}%)`}
                    />
                  );
                })}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: spacing.padding.xs,
                  fontFamily: typography.fontFamily.body,
                  fontSize: "9px",
                  color: colors.text.muted,
                }}
              >
                <span>12AM</span>
                <span>6AM</span>
                <span>12PM</span>
                <span>6PM</span>
                <span>12AM</span>
              </div>
            </div>

            {/* Day of Week Distribution */}
            <div style={deluxeCardStyle}>
              <h3 style={sectionTitleStyle}>
                Best Days
                <span
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.caption,
                    color: colors.camel,
                    marginLeft: "12px",
                    fontWeight: typography.fontWeight.regular,
                  }}
                >
                  Peak: {data.deluxe_insights.peak_day}
                </span>
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.gap.sm }}>
                {data.deluxe_insights.day_of_week_distribution.map((day) => {
                  const maxDay = Math.max(
                    ...data.deluxe_insights!.day_of_week_distribution.map((d) => d.count),
                    1
                  );
                  const isPeak = day.label === data.deluxe_insights!.peak_day;

                  return (
                    <div key={day.day}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: typography.fontFamily.body,
                            fontSize: typography.fontSize.caption,
                            color: isPeak ? colors.camel : colors.text.primary,
                            fontWeight: isPeak ? 600 : 400,
                          }}
                        >
                          {day.label.slice(0, 3)}
                        </span>
                        <span
                          style={{
                            fontFamily: typography.fontFamily.body,
                            fontSize: typography.fontSize.caption,
                            color: colors.text.muted,
                          }}
                        >
                          {day.count}
                        </span>
                      </div>
                      <div
                        style={{
                          height: "4px",
                          background: colors.border.subtle,
                          borderRadius: "2px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${(day.count / maxDay) * 100}%`,
                            background: isPeak ? colors.camel : colors.charcoal,
                            opacity: isPeak ? 1 : 0.5,
                            borderRadius: "2px",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Geographic & Technical Deep Dive */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: spacing.gap.md,
              marginBottom: spacing.padding.xl,
            }}
          >
            {/* Top Cities */}
            <div style={deluxeCardStyle}>
              <h3 style={sectionTitleStyle}>Top Cities</h3>
              {data.deluxe_insights.top_cities.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: spacing.gap.sm }}>
                  {data.deluxe_insights.top_cities.slice(0, 8).map((city, index) => (
                    <div
                      key={`${city.city}-${city.region}-${index}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: spacing.gap.sm }}>
                        <span
                          style={{
                            fontFamily: typography.fontFamily.body,
                            fontSize: typography.fontSize.caption,
                            color: colors.text.muted,
                            width: "20px",
                          }}
                        >
                          {index + 1}.
                        </span>
                        <div>
                          <span
                            style={{
                              fontFamily: typography.fontFamily.body,
                              fontSize: typography.fontSize.bodySmall,
                              color: colors.text.primary,
                            }}
                          >
                            {city.city}
                          </span>
                          {city.region && (
                            <span
                              style={{
                                fontFamily: typography.fontFamily.body,
                                fontSize: typography.fontSize.caption,
                                color: colors.text.muted,
                                marginLeft: "6px",
                              }}
                            >
                              {city.region}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: typography.fontFamily.body,
                          fontSize: typography.fontSize.bodySmall,
                          color: colors.text.secondary,
                          fontWeight: typography.fontWeight.medium,
                        }}
                      >
                        {city.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.bodySmall,
                    color: colors.text.muted,
                    fontStyle: "italic",
                  }}
                >
                  No city data yet
                </p>
              )}
            </div>

            {/* Browser & OS Breakdown */}
            <div style={deluxeCardStyle}>
              <h3 style={sectionTitleStyle}>Browsers</h3>
              {data.deluxe_insights.browser_breakdown.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: spacing.gap.sm }}>
                  {data.deluxe_insights.browser_breakdown.slice(0, 5).map((browser) => (
                    <div key={browser.browser}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: typography.fontFamily.body,
                            fontSize: typography.fontSize.bodySmall,
                            color: colors.text.primary,
                          }}
                        >
                          {browser.browser}
                        </span>
                        <span
                          style={{
                            fontFamily: typography.fontFamily.body,
                            fontSize: typography.fontSize.bodySmall,
                            color: colors.text.secondary,
                          }}
                        >
                          {browser.percentage}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: "6px",
                          background: colors.border.subtle,
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${browser.percentage}%`,
                            background: colors.camel,
                            borderRadius: "3px",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.bodySmall,
                    color: colors.text.muted,
                    fontStyle: "italic",
                  }}
                >
                  No browser data yet
                </p>
              )}
            </div>

            <div style={deluxeCardStyle}>
              <h3 style={sectionTitleStyle}>Operating Systems</h3>
              {data.deluxe_insights.os_breakdown.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: spacing.gap.sm }}>
                  {data.deluxe_insights.os_breakdown.slice(0, 5).map((os) => (
                    <div key={os.os}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: typography.fontFamily.body,
                            fontSize: typography.fontSize.bodySmall,
                            color: colors.text.primary,
                          }}
                        >
                          {os.os}
                        </span>
                        <span
                          style={{
                            fontFamily: typography.fontFamily.body,
                            fontSize: typography.fontSize.bodySmall,
                            color: colors.text.secondary,
                          }}
                        >
                          {os.percentage}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: "6px",
                          background: colors.border.subtle,
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${os.percentage}%`,
                            background: colors.charcoal,
                            opacity: 0.7,
                            borderRadius: "3px",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.bodySmall,
                    color: colors.text.muted,
                    fontStyle: "italic",
                  }}
                >
                  No OS data yet
                </p>
              )}
            </div>
          </div>

          {/* Referrer Details */}
          <div style={{ ...deluxeCardStyle, marginBottom: spacing.padding.xl }}>
            <h3 style={sectionTitleStyle}>Traffic Sources (Detailed)</h3>
            {data.deluxe_insights.referrer_details.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.gap.sm }}>
                {data.deluxe_insights.referrer_details.slice(0, 10).map((ref, index) => (
                  <div
                    key={`${ref.full_url}-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: spacing.padding.sm,
                      background: ref.is_social ? "rgba(196, 164, 132, 0.08)" : "transparent",
                      borderRadius: "4px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: spacing.gap.sm, flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          fontFamily: typography.fontFamily.body,
                          fontSize: typography.fontSize.caption,
                          color: colors.text.muted,
                          width: "24px",
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}.
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              fontFamily: typography.fontFamily.body,
                              fontSize: typography.fontSize.bodySmall,
                              color: colors.text.primary,
                            }}
                          >
                            {ref.domain}
                          </span>
                          {ref.is_social && ref.platform && (
                            <span
                              style={{
                                padding: "2px 6px",
                                background: colors.camel,
                                color: colors.cream,
                                fontSize: "9px",
                                fontWeight: 600,
                                borderRadius: "2px",
                              }}
                            >
                              {ref.platform}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: typography.fontFamily.body,
                        fontSize: typography.fontSize.bodySmall,
                        color: colors.text.secondary,
                        fontWeight: typography.fontWeight.medium,
                        flexShrink: 0,
                      }}
                    >
                      {ref.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.bodySmall,
                  color: colors.text.muted,
                  fontStyle: "italic",
                }}
              >
                No referrer data yet
              </p>
            )}
          </div>
        </>
      )}

      {/* Upgrade Prompt for Non-Deluxe Users */}
      {!data.is_deluxe && (
        <div
          style={{
            marginTop: spacing.padding["2xl"],
            padding: spacing.padding.xl,
            background: `linear-gradient(135deg, rgba(196, 164, 132, 0.08) 0%, rgba(196, 164, 132, 0.15) 100%)`,
            border: `1px solid ${colors.camel}40`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: spacing.padding.md,
            }}
          >
            <span style={{ fontSize: "24px" }}>✦</span>
            <h3
              style={{
                fontFamily: typography.fontFamily.display,
                fontSize: typography.fontSize.cardH3,
                fontWeight: typography.fontWeight.regular,
                color: colors.text.primary,
              }}
            >
              Unlock Advanced Analytics
            </h3>
          </div>
          <p
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.body,
              color: colors.text.secondary,
              marginBottom: spacing.padding.lg,
              maxWidth: "500px",
              margin: "0 auto",
              marginBottom: spacing.padding.lg,
            }}
          >
            Upgrade to Deluxe to access city-level insights, visitor loyalty tracking, peak viewing
            times, browser analytics, social traffic breakdown, and engagement trends.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: spacing.gap.sm,
              maxWidth: "600px",
              margin: "0 auto",
              marginBottom: spacing.padding.lg,
            }}
          >
            {[
              "City-level locations",
              "Peak viewing hours",
              "Visitor loyalty",
              "Browser breakdown",
              "Social traffic %",
              "Engagement trends",
            ].map((feature) => (
              <div
                key={feature}
                style={{
                  padding: spacing.padding.sm,
                  background: colors.background.card,
                  border: `1px solid ${colors.border.subtle}`,
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.caption,
                  color: colors.text.secondary,
                }}
              >
                {feature}
              </div>
            ))}
          </div>
          <Link
            href="/pricing"
            style={{
              display: "inline-block",
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.bodySmall,
              letterSpacing: typography.letterSpacing.wider,
              textTransform: "uppercase",
              padding: `${spacing.padding.md} ${spacing.padding.xl}`,
              background: colors.camel,
              color: colors.cream,
              textDecoration: "none",
              transition: "all 0.3s ease",
            }}
          >
            Upgrade to Deluxe
          </Link>
        </div>
      )}

      {/* Empty State */}
      {data.total_views === 0 && (
        <div
          style={{
            marginTop: spacing.padding.xl,
            padding: spacing.padding["2xl"],
            background: "rgba(196, 164, 132, 0.08)",
            border: `1px solid ${colors.accent.light}`,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: typography.fontFamily.display,
              fontSize: typography.fontSize.cardH3,
              color: colors.text.primary,
              marginBottom: spacing.padding.sm,
            }}
          >
            No views yet
          </p>
          <p
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.body,
              color: colors.text.secondary,
            }}
          >
            Share your portfolio link to start tracking visitors. Views will appear here once people
            visit your page.
          </p>
        </div>
      )}
    </div>
  );
}