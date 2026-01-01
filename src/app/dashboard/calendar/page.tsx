'use client';

import { colors, typography, spacing } from '@/styles/tokens';

export default function CalendarPage() {
  return (
    <div style={{ padding: spacing.padding.xl }}>
      {/* Page Header */}
      <div style={{ marginBottom: spacing.padding['2xl'] }}>
        <h1
          style={{
            fontFamily: typography.fontFamily.display,
            fontSize: '32px',
            fontWeight: typography.fontWeight.light,
            color: colors.text.primary,
            marginBottom: spacing.padding.sm,
          }}
        >
          Calendar
        </h1>
        <p
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.body,
            color: colors.text.secondary,
          }}
        >
          Manage your bookings, shoots, and availability
        </p>
      </div>

      {/* Coming Soon Card */}
      <div
        style={{
          background: colors.white,
          border: `1px solid ${colors.border.light}`,
          padding: spacing.padding['2xl'],
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            background: `${colors.camel}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.camel}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <rect x="7" y="14" width="3" height="3" rx="0.5" />
          </svg>
        </div>

        <h2
          style={{
            fontFamily: typography.fontFamily.display,
            fontSize: '24px',
            fontWeight: typography.fontWeight.regular,
            color: colors.text.primary,
            marginBottom: spacing.padding.md,
          }}
        >
          Coming Soon
        </h2>

        <p
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.body,
            color: colors.text.secondary,
            lineHeight: 1.7,
            marginBottom: spacing.padding.lg,
          }}
        >
          We're building a powerful calendar system to help you manage your modeling schedule.
          Soon you'll be able to:
        </p>

        {/* Feature List */}
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: `0 auto ${spacing.padding.xl}`,
            maxWidth: '320px',
            textAlign: 'left',
          }}
        >
          {[
            'Set your availability for bookings',
            'Sync with Google Calendar',
            'Receive booking requests',
            'Send reminders to clients',
            'Track shoot locations & details',
          ].map((feature, index) => (
            <li
              key={index}
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.bodySmall,
                color: colors.text.secondary,
                padding: '10px 0',
                borderBottom: index < 4 ? `1px solid ${colors.border.subtle}` : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  background: colors.camel,
                  color: colors.cream,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
              {feature}
            </li>
          ))}
        </ul>

        {/* Notify Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: colors.charcoal,
            color: colors.cream,
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.caption,
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          We'll notify you when it's ready
        </div>
      </div>
    </div>
  );
}

