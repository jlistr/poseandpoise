'use client';

import type { PortfolioData } from '@/types/portfolio';
import type { RosePage } from '../RoseTemplate';

interface HeaderProps {
  data: PortfolioData;
  currentPage: RosePage;
  onNavigate: (page: RosePage) => void;
  onMenuToggle: () => void;
}

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
      padding: '24px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      position: 'relative',
    }}>
      {/* Logo / Name */}
      <div>
        <h1 
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '32px',
            fontWeight: 300,
            fontStyle: 'italic',
            color: accentColor,
            margin: 0,
            lineHeight: 1.1,
            cursor: 'pointer',
          }}
          onClick={() => onNavigate('portfolio')}
        >
          {data.profile.displayName}
        </h1>
        <div style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '12px',
          fontWeight: 400,
          letterSpacing: '2px',
          color: '#666',
          marginTop: '4px',
          paddingBottom: '4px',
          borderBottom: `2px solid ${accentColor}`,
          display: 'inline-block',
        }}>
          Model
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
      }}>
        {/* Nav Links - Hidden on mobile */}
        <div style={{
          display: 'flex',
          gap: '24px',
        }} className="rose-desktop-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '16px',
                fontWeight: 400,
                color: currentPage === item.id ? accentColor : '#333',
                cursor: 'pointer',
                padding: 0,
                transition: 'color 0.2s ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Instagram Icon */}
        {data.social.instagram && (
          <a
            href={`https://instagram.com/${data.social.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#333', display: 'flex' }}
            className="rose-desktop-nav"
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

