'use client';

import { useState } from 'react';
import type { PortfolioData } from '@/types/portfolio';

interface ContactPageProps {
  data: PortfolioData;
}

export function ContactPage({ data }: ContactPageProps) {
  const accentColor = '#FF7AA2';
  const { profile } = data;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    
    try {
      // Submit to contact API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          subject: `Portfolio Contact from ${formData.firstName}`,
          message: formData.message,
        }),
      });

      if (response.ok) {
        setStatus('sent');
        setFormData({ firstName: '', lastName: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '60px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          background: '#fff',
          border: '1px solid #eee',
          borderRadius: '4px',
          padding: '48px 32px',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFE4EC 0%, #FFF5F7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '24px',
            fontWeight: 400,
            color: accentColor,
            marginBottom: '12px',
          }}>
            Message Sent!
          </h3>
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '14px',
            color: '#666',
          }}>
            Thank you for reaching out. I'll get back to you shortly!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '40px 24px',
    }}>
      <div style={{
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: '4px',
        padding: '32px',
      }}>
        {/* Title */}
        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '28px',
          fontWeight: 400,
          color: accentColor,
          textAlign: 'center',
          marginBottom: '16px',
        }}>
          Contact {profile.displayName}
        </h2>

        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '13px',
          color: '#666',
          textAlign: 'center',
          lineHeight: 1.6,
          marginBottom: '8px',
        }}>
          Get in touch with {profile.displayName} for editorial, commercial, and creative modeling opportunities.
        </p>

        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '13px',
          color: '#666',
          textAlign: 'center',
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          Please leave your name, e-mail, and a brief message about what service you are inquiring about, and I will get back to you shortly!
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name Row */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '13px',
              color: '#333',
              marginBottom: '6px',
            }}>
              Name <span style={{ color: '#999' }}>(required)</span>
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '2px',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '2px',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '13px',
              color: '#333',
              marginBottom: '6px',
            }}>
              Email <span style={{ color: '#999' }}>(required)</span>
            </label>
            <input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '2px',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Message */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '13px',
              color: '#333',
              marginBottom: '6px',
            }}>
              Message <span style={{ color: '#999' }}>(required)</span>
            </label>
            <textarea
              placeholder="Your Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={5}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '2px',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Error Message */}
          {status === 'error' && (
            <p style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '13px',
              color: '#e74c3c',
              marginBottom: '16px',
              textAlign: 'center',
            }}>
              Something went wrong. Please try again.
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'sending'}
            style={{
              background: accentColor,
              color: '#fff',
              border: 'none',
              padding: '14px 32px',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: status === 'sending' ? 'wait' : 'pointer',
              opacity: status === 'sending' ? 0.7 : 1,
              borderRadius: '2px',
              transition: 'all 0.2s ease',
            }}
          >
            {status === 'sending' ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

