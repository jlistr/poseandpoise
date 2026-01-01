'use client';

import { useCallback, useRef, useEffect } from 'react';

type EventType = 'view' | 'click' | 'expand';

interface TrackEventOptions {
  /** Deduplicate views in the same session */
  dedupeViews?: boolean;
}

/**
 * Hook for tracking photo analytics events.
 * 
 * Provides methods to track:
 * - `view`: When a photo scrolls into the viewport
 * - `click`: When a user clicks/taps on a photo
 * - `expand`: When a photo opens in a lightbox/modal
 * 
 * Features:
 * - Session-based deduplication for views
 * - Non-blocking (won't affect UX if tracking fails)
 * - Intersection Observer integration for automatic view tracking
 * 
 * @example
 * ```tsx
 * const { trackEvent, createViewObserver } = usePhotoAnalytics();
 * 
 * // Track a click
 * const handleClick = () => {
 *   trackEvent(photo.id, 'click');
 *   openLightbox(photo);
 * };
 * 
 * // Auto-track views with Intersection Observer
 * useEffect(() => {
 *   const observer = createViewObserver(photo.id);
 *   if (photoRef.current) observer.observe(photoRef.current);
 *   return () => observer.disconnect();
 * }, [photo.id]);
 * ```
 */
export function usePhotoAnalytics(options: TrackEventOptions = {}) {
  const { dedupeViews = true } = options;
  
  // Track which photos have been viewed this session (for deduplication)
  const trackedViews = useRef<Set<string>>(new Set());
  
  // Track pending requests to avoid duplicate rapid-fire calls
  const pendingRequests = useRef<Set<string>>(new Set());

  /**
   * Track an analytics event for a photo
   */
  const trackEvent = useCallback(async (
    photoId: string, 
    eventType: EventType
  ): Promise<boolean> => {
    // Dedupe views in same session
    if (dedupeViews && eventType === 'view') {
      if (trackedViews.current.has(photoId)) {
        return false;
      }
      trackedViews.current.add(photoId);
    }

    // Prevent duplicate rapid-fire requests
    const requestKey = `${photoId}-${eventType}`;
    if (pendingRequests.current.has(requestKey)) {
      return false;
    }
    pendingRequests.current.add(requestKey);

    try {
      const response = await fetch('/api/analytics/photo-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, eventType }),
      });

      const data = await response.json();
      return data.tracked === true;
    } catch (error) {
      // Silent fail - analytics shouldn't break UX
      console.debug('Analytics tracking failed:', error);
      return false;
    } finally {
      pendingRequests.current.delete(requestKey);
    }
  }, [dedupeViews]);

  /**
   * Create an Intersection Observer that tracks views automatically
   * when elements scroll into the viewport.
   * 
   * @param photoId - The photo ID to track
   * @param threshold - Visibility threshold (0-1), default 0.5 (50% visible)
   */
  const createViewObserver = useCallback((
    photoId: string,
    threshold: number = 0.5
  ): IntersectionObserver => {
    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackEvent(photoId, 'view');
          }
        });
      },
      { threshold }
    );
  }, [trackEvent]);

  /**
   * Track a click event
   */
  const trackClick = useCallback((photoId: string) => {
    return trackEvent(photoId, 'click');
  }, [trackEvent]);

  /**
   * Track an expand event (lightbox open)
   */
  const trackExpand = useCallback((photoId: string) => {
    return trackEvent(photoId, 'expand');
  }, [trackEvent]);

  /**
   * Reset tracked views (useful for testing or page navigation)
   */
  const resetTrackedViews = useCallback(() => {
    trackedViews.current.clear();
  }, []);

  return {
    trackEvent,
    trackClick,
    trackExpand,
    createViewObserver,
    resetTrackedViews,
  };
}

/**
 * Component wrapper for tracking photo views automatically.
 * Uses Intersection Observer to track when photo enters viewport.
 */
export function usePhotoViewTracking(
  photoId: string | undefined,
  elementRef: React.RefObject<HTMLElement | null>,
  options: { threshold?: number; enabled?: boolean } = {}
) {
  const { threshold = 0.5, enabled = true } = options;
  const { createViewObserver } = usePhotoAnalytics();

  useEffect(() => {
    if (!enabled || !photoId || !elementRef.current) {
      return;
    }

    const observer = createViewObserver(photoId, threshold);
    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [photoId, elementRef, threshold, enabled, createViewObserver]);
}

