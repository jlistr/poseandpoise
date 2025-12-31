'use client';

import type { PortfolioData } from '@/types/portfolio';

interface FooterProps {
  data: PortfolioData;
}

export function Footer({ data }: FooterProps) {
  const { profile, social } = data;
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: '#F5F3F0',
      padding: '40px 24px',
      textAlign: 'center',
      borderTop: '1px solid #eee',
    }}>
      {/* Connect Section */}
      <p style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: '16px',
        color: '#333',
        marginBottom: '16px',
      }}>
        Connect with me:
      </p>

      {/* Social Icons */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '24px',
      }}>
        {social.instagram && (
          <a
            href={`https://instagram.com/${social.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#333',
              transition: 'color 0.2s ease',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </a>
        )}
        {social.tiktok && (
          <a
            href={`https://tiktok.com/@${social.tiktok.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#333',
              transition: 'color 0.2s ease',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </a>
        )}
        {social.website && (
          <a
            href={social.website.startsWith('http') ? social.website : `https://${social.website}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#333',
              transition: 'color 0.2s ease',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </a>
        )}
      </div>

      {/* Copyright */}
      <p style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: '12px',
        color: '#999',
      }}>
        © {currentYear} {profile.displayName}. All Rights Reserved.
      </p>
    </footer>
  );
}

