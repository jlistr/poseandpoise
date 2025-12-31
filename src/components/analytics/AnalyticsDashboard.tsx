"use client";

import { useState, useEffect } from "react";
import { getAnalyticsSummary, type AnalyticsSummary } from "@/app/actions/analytics";
import { colors, typography, spacing } from "@/styles/tokens";

type TimeRange = "7" | "30" | "90";

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