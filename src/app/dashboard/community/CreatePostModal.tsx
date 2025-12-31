'use client';

import { useState } from 'react';
import { createPost } from './actions';
import type { PostType, CreatePostInput } from '@/types/community';
import { SAFETY_ALERT_TAGS, SUCCESS_STORY_TAGS } from '@/types/community';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPostType?: PostType;
  isPaidSubscriber: boolean;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  defaultPostType = 'safety_alert',
  isPaidSubscriber,
}: CreatePostModalProps) {
  const [postType, setPostType] = useState<PostType>(defaultPostType);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [photographerName, setPhotographerName] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const availableTags = postType === 'safety_alert' ? SAFETY_ALERT_TAGS : SUCCESS_STORY_TAGS;

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setLocation('');
    setPhotographerName('');
    setRating(0);
    setSelectedTags([]);
    setIsAnonymous(false);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      setIsSubmitting(false);
      return;
    }
    if (!content.trim()) {
      setError('Please share your experience');
      setIsSubmitting(false);
      return;
    }
    if (postType === 'success_story' && rating === 0) {
      setError('Please provide a rating for your experience');
      setIsSubmitting(false);
      return;
    }

    const input: CreatePostInput = {
      post_type: postType,
      title: title.trim(),
      content: content.trim(),
      location: location.trim() || undefined,
      photographer_name: photographerName.trim() || undefined,
      rating: rating > 0 ? rating : undefined,
      tags: selectedTags,
      is_anonymous: isAnonymous,
    };

    const result = await createPost(input);

    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } else {
      setError(result.error || 'Failed to create post');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={overlayStyles}>
      <div style={modalStyles}>
        {/* Header */}
        <div style={headerStyles}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            Share Your Experience
          </h2>
          <button onClick={handleClose} style={closeButtonStyles} aria-label="Close">
            ×
          </button>
        </div>

        {/* Upgrade prompt for free users */}
        {!isPaidSubscriber && (
          <div style={upgradePromptStyles}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
              Upgrade to Share
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>
              Community posting is available for Pro and Agency subscribers. 
              Upgrade your plan to share safety alerts and success stories with fellow models.
            </p>
            <a
              href="/pricing"
              style={{
                display: 'inline-block',
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: '#1a1a1a',
                color: '#fff',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              View Plans
            </a>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div style={successStyles}>
            <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>✓</span>
            Your post has been submitted for review. It will be visible once approved.
          </div>
        )}

        {/* Form */}
        {isPaidSubscriber && !success && (
          <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
            {/* Post Type Toggle */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyles}>What would you like to share?</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setPostType('safety_alert');
                    setSelectedTags([]);
                  }}
                  style={{
                    ...typeButtonStyles,
                    background: postType === 'safety_alert' ? '#fef2f2' : '#f5f5f5',
                    borderColor: postType === 'safety_alert' ? '#ef4444' : '#e5e5e5',
                    color: postType === 'safety_alert' ? '#dc2626' : '#666',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                  Safety Alert
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPostType('success_story');
                    setSelectedTags([]);
                  }}
                  style={{
                    ...typeButtonStyles,
                    background: postType === 'success_story' ? '#f0fdf4' : '#f5f5f5',
                    borderColor: postType === 'success_story' ? '#22c55e' : '#e5e5e5',
                    color: postType === 'success_story' ? '#16a34a' : '#666',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>⭐</span>
                  Success Story
                </button>
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyles}>
                Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  postType === 'safety_alert'
                    ? 'e.g., Red flags at XYZ Studio shoot'
                    : 'e.g., Amazing editorial shoot with ABC Photography'
                }
                style={inputStyles}
                maxLength={200}
              />
            </div>

            {/* Photographer/Studio Name */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyles}>
                Photographer / Studio Name
                <span style={{ fontWeight: 400, color: '#999', marginLeft: '0.5rem' }}>
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={photographerName}
                onChange={(e) => setPhotographerName(e.target.value)}
                placeholder="Name of photographer or studio"
                style={inputStyles}
                maxLength={100}
              />
            </div>

            {/* Location */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyles}>
                Location
                <span style={{ fontWeight: 400, color: '#999', marginLeft: '0.5rem' }}>
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State or Region"
                style={inputStyles}
                maxLength={100}
              />
            </div>

            {/* Rating (for success stories) */}
            {postType === 'success_story' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyles}>
                  Rating <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.75rem',
                        padding: '0.25rem',
                        color: star <= rating ? '#fbbf24' : '#d1d5db',
                        transition: 'transform 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      ★
                    </button>
                  ))}
                  <span style={{ marginLeft: '0.5rem', color: '#666', alignSelf: 'center' }}>
                    {rating > 0 ? `${rating}/5` : 'Select rating'}
                  </span>
                </div>
              </div>
            )}

            {/* Content */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyles}>
                Your Experience <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  postType === 'safety_alert'
                    ? 'Share what happened and any warning signs other models should know about...'
                    : 'Tell us about your positive experience and what made it great...'
                }
                style={{
                  ...inputStyles,
                  minHeight: '150px',
                  resize: 'vertical',
                }}
                maxLength={5000}
              />
              <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                {content.length}/5000 characters
              </div>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyles}>
                Tags
                <span style={{ fontWeight: 400, color: '#999', marginLeft: '0.5rem' }}>
                  (select relevant tags)
                </span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.8125rem',
                      borderRadius: '100px',
                      border: '1px solid',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      background: selectedTags.includes(tag)
                        ? postType === 'safety_alert'
                          ? '#fef2f2'
                          : '#f0fdf4'
                        : '#fff',
                      borderColor: selectedTags.includes(tag)
                        ? postType === 'safety_alert'
                          ? '#ef4444'
                          : '#22c55e'
                        : '#e5e5e5',
                      color: selectedTags.includes(tag)
                        ? postType === 'safety_alert'
                          ? '#dc2626'
                          : '#16a34a'
                        : '#666',
                    }}
                  >
                    {selectedTags.includes(tag) && '✓ '}
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Anonymous posting */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  style={{ width: '1.125rem', height: '1.125rem', accentColor: '#1a1a1a' }}
                />
                <span>
                  <span style={{ fontWeight: 500 }}>Post anonymously</span>
                  <span style={{ display: 'block', fontSize: '0.8125rem', color: '#666', marginTop: '0.125rem' }}>
                    Your name won&apos;t be displayed on this post
                  </span>
                </span>
              </label>
            </div>

            {/* Error message */}
            {error && (
              <div style={errorStyles}>
                {error}
              </div>
            )}

            {/* Submit button */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '6px',
                  border: '1px solid #e5e5e5',
                  background: '#fff',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '0.625rem 1.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: isSubmitting ? '#999' : '#1a1a1a',
                  color: '#fff',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>

            {/* Moderation notice */}
            <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '1rem', textAlign: 'center' }}>
              All posts are reviewed before being published to ensure community safety.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// Styles
const overlayStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1rem',
};

const modalStyles: React.CSSProperties = {
  background: '#fff',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '600px',
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

const headerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1.25rem 1.5rem',
  borderBottom: '1px solid #eee',
};

const closeButtonStyles: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  fontSize: '1.75rem',
  cursor: 'pointer',
  color: '#999',
  lineHeight: 1,
  padding: '0.25rem',
};

const labelStyles: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 500,
  marginBottom: '0.5rem',
  color: '#1a1a1a',
};

const inputStyles: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  fontSize: '0.9375rem',
  border: '1px solid #e5e5e5',
  borderRadius: '8px',
  outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'inherit',
};

const typeButtonStyles: React.CSSProperties = {
  flex: 1,
  padding: '1rem',
  borderRadius: '8px',
  border: '2px solid',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'all 0.15s',
};

const errorStyles: React.CSSProperties = {
  padding: '0.75rem 1rem',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  color: '#dc2626',
  fontSize: '0.875rem',
  marginBottom: '1rem',
};

const successStyles: React.CSSProperties = {
  padding: '2rem',
  textAlign: 'center',
  color: '#16a34a',
  fontSize: '1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const upgradePromptStyles: React.CSSProperties = {
  padding: '2rem',
  textAlign: 'center',
  background: '#fef3c7',
  margin: '1rem',
  borderRadius: '8px',
  color: '#92400e',
};

