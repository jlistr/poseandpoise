'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { colors, typography, spacing } from '@/styles/tokens';
import { getPortfolioUrl } from '@/lib/utils/portfolioUrl';
import { togglePortfolioVisibility } from '@/app/actions/portfolio';

interface PortfolioVisibilityToggleProps {
  username: string;
  initialIsPublic: boolean;
}

export function PortfolioVisibilityToggle({ username, initialIsPublic }: PortfolioVisibilityToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPublic, setIsPublic] = useState(initialIsPublic);

  const handleToggle = () => {
    const newValue = !isPublic;
    setIsPublic(newValue);
    
    startTransition(async () => {
      const result = await togglePortfolioVisibility(newValue);
      if (!result.success) {
        // Revert on error
        setIsPublic(!newValue);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div
      style={{
        marginTop: spacing.padding.xl,
        padding: spacing.padding.lg,
        background: "rgba(196, 164, 132, 0.05)",
        border: `1px solid ${colors.accent.light}`,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: spacing.gap.lg,
      }}>
        <div>
          <p
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.caption,
              color: colors.text.muted,
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: spacing.padding.xs,
            }}
          >
            Your Portfolio URL
          </p>
          <p
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.body,
              color: colors.text.primary,
              marginBottom: spacing.padding.sm,
            }}
          >
            {isPublic ? (
              <a
                href={getPortfolioUrl(username)}
                target="_blank"
                rel="noopener noreferrer"
                className="portfolio-link"
                style={{
                  color: colors.text.primary,
                  textDecoration: "underline",
                  textDecorationColor: colors.accent.solid,
                  textUnderlineOffset: "4px",
                }}
              >
                <span style={{ color: colors.charcoal }}>{username}</span>.poseandpoise.studio
              </a>
            ) : (
              <>
                <span style={{ color: colors.charcoal }}>{username}</span>.poseandpoise.studio
                <span
                  style={{
                    marginLeft: "12px",
                    fontSize: typography.fontSize.caption,
                    color: colors.text.muted,
                    background: "rgba(26, 26, 26, 0.05)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}
                >
                  Private
                </span>
              </>
            )}
          </p>
          <p style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.caption,
            color: colors.text.muted,
          }}>
            {isPublic 
              ? "Your portfolio is live and visible to everyone"
              : "Enable to make your portfolio visible to the public"
            }
          </p>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.gap.sm,
            cursor: isPending ? 'wait' : 'pointer',
            opacity: isPending ? 0.7 : 1,
            flexShrink: 0,
            background: 'none',
            border: 'none',
            padding: 0,
          }}
        >
          <span style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.bodySmall,
            color: colors.text.secondary,
          }}>
            {isPublic ? 'Public' : 'Private'}
          </span>
          <div
            style={{
              position: 'relative',
              width: '48px',
              height: '26px',
              background: isPublic ? colors.camel : 'rgba(26, 26, 26, 0.15)',
              borderRadius: '13px',
              transition: 'background 0.2s ease',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '3px',
                left: isPublic ? '25px' : '3px',
                width: '20px',
                height: '20px',
                background: '#fff',
                borderRadius: '50%',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'left 0.2s ease',
              }}
            />
          </div>
        </button>
      </div>
    </div>
  );
}

