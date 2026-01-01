'use client';

interface BookMeButtonProps {
  onClick: () => void;
}

export function BookMeButton({ onClick }: BookMeButtonProps) {
  const accentColor = '#FF7AA2';

  return (
    <>
      <button
        onClick={onClick}
        className="rose-book-me-btn"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: accentColor,
          color: '#fff',
          border: 'none',
          padding: '14px 22px',
          borderRadius: '8px',
          fontFamily: "'Outfit', sans-serif",
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(255, 122, 162, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 100,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 8px 28px rgba(255, 122, 162, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 122, 162, 0.4)';
        }}
      >
        <CalendarIcon />
        <span>Book Me</span>
      </button>

      {/* Mobile responsiveness */}
      <style>{`
        @media (max-width: 480px) {
          .rose-book-me-btn {
            bottom: 20px !important;
            right: 16px !important;
            padding: 12px 18px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
