'use client';

import type { PortfolioData } from '@/types/portfolio';
import type { RosePage } from '../RoseTemplate';

interface HeaderProps {
  data: PortfolioData;
  currentPage: RosePage;
  onNavigate: (page: RosePage) => void;
  onMenuToggle: () => void;
}

/**
 * Elysian Header Component
 * 
 * Matches the reference design:
 * - Elegant italic name in pink (#FF7AA2)
 * - "Model" subtitle with pink underline accent
 * - Navigation: Portfolio (active), About, Services, Contact
 * - Instagram icon on right
 * - Subtle bottom border separator
 */
export function Header({ data, currentPage, onNavigate, onMenuToggle }: HeaderProps) {
  const accentColor = '#FF7AA2';
  
  const navItems: { id: RosePage; label: string }[] = [
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header style={{
      padding: '16px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      position: 'relative',
      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      backgroundColor: '#FAF8F6',
    }}>
      {/* Logo / Name - Elegant italic styling matching reference */}
      <div style={{ paddingTop: '2px' }}>
        <h1 
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(26px, 5vw, 36px)',
            fontWeight: 300,
            fontStyle: 'italic',
            color: accentColor,
            margin: 0,
            lineHeight: 1.15,
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
          onClick={() => onNavigate('portfolio')}
        >
          {data.profile.displayName}
        </h1>
        <div style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '11px',
          fontWeight: 400,
          letterSpacing: '0.08em',
          color: '#555',
          marginTop: '4px',
          paddingBottom: '5px',
          borderBottom: `2px solid ${accentColor}`,
          display: 'inline-block',
        }}>
          Model
        </div>
      </div>

      {/* Desktop Navigation - Refined spacing matching reference */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        paddingTop: '10px',
      }}>
        {/* Nav Links - Hidden on mobile */}
        <div style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
        }} className="rose-desktop-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="rose-nav-link"
              style={{
                background: 'none',
                border: 'none',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '16px',
                fontWeight: 400,
                color: currentPage === item.id ? accentColor : '#333',
                cursor: 'pointer',
                padding: '4px 0',
                transition: 'color 0.2s ease',
                position: 'relative',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Instagram Icon - Outlined circle style */}
        {data.social.instagram && (
          <a
            href={`https://instagram.com/${data.social.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              color: '#333', 
              display: 'flex',
              padding: '4px',
              marginLeft: '8px',
              transition: 'color 0.2s ease',
            }}
            className="rose-desktop-nav rose-instagram-link"
            onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
            onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
          >
            <InstagramIcon />
          </a>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={onMenuToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'none',
          }}
          className="rose-mobile-menu-btn"
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </nav>

      {/* Responsive Styles */}
      <style>{`
        .rose-nav-link:hover {
          color: #FF7AA2 !important;
        }
        @media (max-width: 768px) {
          .rose-desktop-nav {
            display: none !important;
          }
          .rose-mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
