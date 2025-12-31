'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// =============================================================================
// Rich Text Editor Component
// Features: Font color, Font size, Lists, Text alignment, Link insertion
// =============================================================================

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  accentColor?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  minHeight = '120px',
  accentColor = '#FF7AA2',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize content
  useEffect(() => {
    if (editorRef.current && !isEditing) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value, isEditing]);

  // Execute formatting command
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, []);

  // Handle input changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      // Basic sanitization - strip dangerous tags but keep formatting
      const sanitized = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/javascript:/gi, '');
      onChange(sanitized);
    }
  }, [onChange]);

  // Color options
  const colors = [
    '#1A1A1A', '#333333', '#666666', '#999999',
    '#FF7AA2', '#C4A484', '#22C55E', '#3B82F6',
    '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899',
  ];

  // Font size options
  const fontSizes = [
    { label: 'Small', value: '2' },
    { label: 'Normal', value: '3' },
    { label: 'Medium', value: '4' },
    { label: 'Large', value: '5' },
    { label: 'X-Large', value: '6' },
  ];

  // Insert link
  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  return (
    <div
      style={{
        border: `2px dashed ${accentColor}`,
        borderRadius: '8px',
        background: `${accentColor}08`,
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 12px',
          borderBottom: `1px solid ${accentColor}30`,
          background: '#fff',
        }}
      >
        {/* Bold, Italic, Underline */}
        <ToolbarButton onClick={() => execCommand('bold')} title="Bold">
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('italic')} title="Italic">
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('underline')} title="Underline">
          <span style={{ textDecoration: 'underline' }}>U</span>
        </ToolbarButton>

        <Divider />

        {/* Font Color */}
        <div style={{ position: 'relative' }}>
          <ToolbarButton
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Font Color"
          >
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span>A</span>
              <span style={{ height: '3px', width: '14px', background: accentColor, marginTop: '-2px' }} />
            </span>
          </ToolbarButton>
          {showColorPicker && (
            <ColorPicker
              colors={colors}
              onSelect={(color) => {
                execCommand('foreColor', color);
                setShowColorPicker(false);
              }}
              onClose={() => setShowColorPicker(false)}
            />
          )}
        </div>

        {/* Font Size */}
        <div style={{ position: 'relative' }}>
          <ToolbarButton
            onClick={() => setShowFontSize(!showFontSize)}
            title="Font Size"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ fontSize: '10px' }}>A</span>
              <span style={{ fontSize: '14px' }}>A</span>
            </span>
          </ToolbarButton>
          {showFontSize && (
            <FontSizePicker
              sizes={fontSizes}
              onSelect={(size) => {
                execCommand('fontSize', size);
                setShowFontSize(false);
              }}
              onClose={() => setShowFontSize(false)}
            />
          )}
        </div>

        <Divider />

        {/* Lists */}
        <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
          <ListIcon type="bullet" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered List">
          <ListIcon type="numbered" />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton onClick={() => execCommand('justifyLeft')} title="Align Left">
          <AlignIcon type="left" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('justifyCenter')} title="Align Center">
          <AlignIcon type="center" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('justifyRight')} title="Align Right">
          <AlignIcon type="right" />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton onClick={insertLink} title="Insert Link">
          <LinkIcon />
        </ToolbarButton>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        style={{
          minHeight,
          padding: '16px',
          fontFamily: "'Outfit', sans-serif",
          fontSize: '14px',
          lineHeight: 1.7,
          color: '#333',
          outline: 'none',
          background: 'transparent',
        }}
        data-placeholder={placeholder}
      />

      {/* Placeholder Styles */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: rgba(26, 26, 26, 0.35);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function ToolbarButton({
  children,
  onClick,
  title,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        padding: 0,
        border: 'none',
        borderRadius: '4px',
        background: active ? 'rgba(26, 26, 26, 0.1)' : 'transparent',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#333',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(26, 26, 26, 0.08)'}
      onMouseLeave={(e) => e.currentTarget.style.background = active ? 'rgba(26, 26, 26, 0.1)' : 'transparent'}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div
      style={{
        width: '1px',
        height: '20px',
        background: 'rgba(26, 26, 26, 0.12)',
        margin: '0 4px',
      }}
    />
  );
}

function ColorPicker({
  colors,
  onSelect,
  onClose,
}: {
  colors: string[];
  onSelect: (color: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 99 }}
      />
      <div
        style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '4px',
          padding: '8px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 100,
        }}
      >
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onSelect(color)}
            style={{
              width: '24px',
              height: '24px',
              background: color,
              border: '2px solid #fff',
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
            }}
          />
        ))}
      </div>
    </>
  );
}

function FontSizePicker({
  sizes,
  onSelect,
  onClose,
}: {
  sizes: { label: string; value: string }[];
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 99 }}
      />
      <div
        style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: '100px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          zIndex: 100,
        }}
      >
        {sizes.map((size) => (
          <button
            key={size.value}
            onClick={() => onSelect(size.value)}
            style={{
              padding: '8px 12px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '13px',
              color: '#333',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(26, 26, 26, 0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {size.label}
          </button>
        ))}
      </div>
    </>
  );
}

// =============================================================================
// Icons
// =============================================================================

function ListIcon({ type }: { type: 'bullet' | 'numbered' }) {
  if (type === 'bullet') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="9" y1="6" x2="20" y2="6" />
        <line x1="9" y1="12" x2="20" y2="12" />
        <line x1="9" y1="18" x2="20" y2="18" />
        <circle cx="5" cy="6" r="1.5" fill="currentColor" />
        <circle cx="5" cy="12" r="1.5" fill="currentColor" />
        <circle cx="5" cy="18" r="1.5" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="10" y1="6" x2="20" y2="6" />
      <line x1="10" y1="12" x2="20" y2="12" />
      <line x1="10" y1="18" x2="20" y2="18" />
      <text x="4" y="8" fontSize="8" fill="currentColor" fontFamily="sans-serif">1</text>
      <text x="4" y="14" fontSize="8" fill="currentColor" fontFamily="sans-serif">2</text>
      <text x="4" y="20" fontSize="8" fill="currentColor" fontFamily="sans-serif">3</text>
    </svg>
  );
}

function AlignIcon({ type }: { type: 'left' | 'center' | 'right' }) {
  const x1 = type === 'left' ? 3 : type === 'center' ? 6 : 9;
  const x2 = type === 'left' ? 15 : type === 'center' ? 18 : 21;
  const x3 = type === 'left' ? 12 : type === 'center' ? 15 : 18;
  
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1={x1} y1="12" x2={x2} y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
