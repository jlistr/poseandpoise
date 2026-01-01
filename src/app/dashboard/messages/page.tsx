'use client';

import { colors, typography, spacing } from '@/styles/tokens';

export default function MessagesPage() {
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
          Messages
        </h1>
        <p
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.body,
            color: colors.text.secondary,
          }}
        >
          Communicate with photographers, agencies, and clients
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="8" y1="9" x2="16" y2="9" />
            <line x1="8" y1="13" x2="13" y2="13" />
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
          We're building a secure messaging platform to connect you with industry professionals.
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
            'Direct message photographers',
            'Receive inquiries from clients',
            'Discuss project details securely',
            'Share files and mood boards',
            'Get instant notifications',
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

