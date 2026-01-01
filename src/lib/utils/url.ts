/**
 * URL utilities for handling environment-specific redirects and subdomain routing
 */

/**
 * Get the base site URL based on environment
 * Uses NEXT_PUBLIC_SITE_URL in production, falls back to localhost for development
 */
export function getSiteUrl(): string {
  // Server-side: use environment variable
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }
  
  // Client-side: use window.location.origin for current domain
  // This handles subdomains correctly
  return window.location.origin;
}

/**
 * Get the main domain (without subdomain) for auth redirects
 * e.g., "poseandpoise.studio" from "username.poseandpoise.studio"
 */
export function getMainDomain(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  try {
    const url = new URL(siteUrl);
    return url.host; // e.g., "poseandpoise.studio" or "localhost:3000"
  } catch {
    return 'localhost:3000';
  }
}

/**
 * Get the auth callback URL for the main domain
 * Auth callbacks should always go to the main domain, not subdomains
 */
export function getAuthCallbackUrl(path: string = '/auth/callback'): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${baseUrl}${path}`;
}

/**
 * Build a subdomain URL for a user's portfolio
 * In production: https://username.poseandpoise.studio
 * In development: http://localhost:3000/preview/username (or just dashboard)
 */
export function getSubdomainUrl(username: string, path: string = ''): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  if (isProduction && username) {
    // Production: use subdomain
    const url = new URL(baseUrl);
    return `${url.protocol}//${username}.${url.host}${path}`;
  }
  
  // Development: use path-based routing
  return `${baseUrl}${path}`;
}

/**
 * Check if we're on a subdomain (not the main domain)
 */
export function isSubdomain(hostname: string): boolean {
  const mainDomain = getMainDomain();
  
  // localhost doesn't have subdomains in our setup
  if (hostname.includes('localhost')) {
    return false;
  }
  
  // Check if hostname has more parts than the main domain
  const hostParts = hostname.split('.');
  const mainParts = mainDomain.split('.');
  
  return hostParts.length > mainParts.length;
}

/**
 * Extract username from subdomain
 * e.g., "johndoe" from "johndoe.poseandpoise.studio"
 */
export function getUsernameFromSubdomain(hostname: string): string | null {
  if (!isSubdomain(hostname)) {
    return null;
  }
  
  const mainDomain = getMainDomain();
  const mainParts = mainDomain.split('.');
  const hostParts = hostname.split('.');
  
  // Username is the first part(s) before the main domain
  const subdomainParts = hostParts.slice(0, hostParts.length - mainParts.length);
  return subdomainParts.join('.') || null;
}

