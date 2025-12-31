'use client';

import type { RosePage } from '../RoseTemplate';

interface FullScreenMenuProps {
  isOpen: boolean;
  currentPage: RosePage;
  onNavigate: (page: RosePage) => void;
  onClose: () => void;
  backgroundImage?: string;
}

export function FullScreenMenu({ 
  isOpen, 
  currentPage, 
  onNavigate, 
  onClose,
  backgroundImage,
}: FullScreenMenuProps) {
  const accentColor = '#FF7AA2';

  const navItems: { id: RosePage; label: string }[] = [
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'contact', label: 'Contact' },
  ];

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Blurred Background Image */}
      {backgroundImage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(8px) brightness(0.6)',
            transform: 'scale(1.1)', // Prevent blur edge artifacts
          }}
        />
      )}
      
      {/* Dark Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: backgroundImage 
            ? 'rgba(80, 80, 80, 0.7)' 
            : 'rgba(50, 50, 50, 0.95)',
        }}
      />

      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: '32px',
          cursor: 'pointer',
          padding: '8px',
          lineHeight: 1,
          zIndex: 1,
        }}
        aria-label="Close menu"
      >
        ×
      </button>

      {/* Navigation Links */}
      <nav
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '24px',
              fontWeight: 400,
              color: currentPage === item.id ? accentColor : '#fff',
              cursor: 'pointer',
              padding: '8px 16px',
              textDecoration: currentPage === item.id ? 'underline' : 'none',
              textUnderlineOffset: '6px',
              transition: 'color 0.2s ease',
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

