'use client';

interface BookMeButtonProps {
  onClick: () => void;
}

export function BookMeButton({ onClick }: BookMeButtonProps) {
  const accentColor = '#FF7AA2';

  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        background: accentColor,
        color: '#fff',
        border: 'none',
        padding: '14px 24px',
        borderRadius: '30px',
        fontFamily: "'Outfit', sans-serif",
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(255, 122, 162, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 100,
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 122, 162, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 122, 162, 0.4)';
      }}
    >
      <CalendarIcon />
      <span>Book Me</span>
    </button>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

