/**
 * Portfolio URL Utilities
 * 
 * Generates URLs for the subdomain pattern: username.poseandpoise.studio
 * In local development, uses path-based URLs: localhost:3000/username
 */

// Base domain for portfolio subdomains
const PORTFOLIO_DOMAIN = process.env.NEXT_PUBLIC_PORTFOLIO_DOMAIN || 'poseandpoise.studio';

// Check if we're in local development
const isLocalDev = typeof window !== 'undefined' 
  ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  : process.env.NODE_ENV === 'development';

/**
 * Generates the full portfolio URL for a given username
 * Format: https://username.poseandpoise.studio (production)
 * Format: /username (local development)
 */
export function getPortfolioUrl(username: string): string {
  if (!username) return '';
  const cleanUsername = username.toLowerCase().trim();
  
  // In local development, use path-based URL
  if (isLocalDev) {
    return `/${cleanUsername}`;
  }
  
  return `https://${cleanUsername}.${PORTFOLIO_DOMAIN}`;
}

/**
 * Generates the display-friendly portfolio URL (without protocol)
 * Format: username.poseandpoise.studio (production)
 * Format: localhost:3000/username (local development)
 */
export function getPortfolioDisplayUrl(username: string): string {
  if (!username) return '';
  const cleanUsername = username.toLowerCase().trim();
  
  // In local development, show path-based URL
  if (isLocalDev && typeof window !== 'undefined') {
    return `${window.location.host}/${cleanUsername}`;
  }
  
  return `${cleanUsername}.${PORTFOLIO_DOMAIN}`;
}

/**
 * Generates the portfolio URL placeholder for forms
 * Format: yourname.poseandpoise.studio
 */
export function getPortfolioPlaceholder(): string {
  return `yourname.${PORTFOLIO_DOMAIN}`;
}

/**
 * Gets just the domain part for display
 * Format: .poseandpoise.studio
 */
export function getPortfolioDomainSuffix(): string {
  return `.${PORTFOLIO_DOMAIN}`;
}

/**
 * Extracts username from a subdomain URL
 */
export function extractUsernameFromSubdomain(hostname: string): string | null {
  const parts = hostname.split('.');
  
  // Expected format: username.poseandpoise.studio (3 parts)
  // or username.localhost (2 parts for local dev)
  if (parts.length >= 2) {
    const potentialUsername = parts[0];
    
    // Exclude reserved subdomains
    const reserved = ['www', 'api', 'app', 'dashboard', 'admin', 'mail', 'ftp'];
    if (reserved.includes(potentialUsername.toLowerCase())) {
      return null;
    }
    
    return potentialUsername;
  }
  
  return null;
}

/**
 * Checks if a hostname is a portfolio subdomain
 */
export function isPortfolioSubdomain(hostname: string): boolean {
  // Remove port if present
  const host = hostname.split(':')[0];
  
  // Check if it matches the pattern: username.poseandpoise.studio
  // or username.localhost for local development
  const domainParts = PORTFOLIO_DOMAIN.split('.');
  const hostParts = host.split('.');
  
  // For production: username.poseandpoise.studio = 3 parts
  // For local: username.localhost = 2 parts
  if (hostParts.length <= domainParts.length) {
    return false;
  }
  
  // Check if the domain suffix matches
  const hostSuffix = hostParts.slice(1).join('.');
  return hostSuffix === PORTFOLIO_DOMAIN || host.endsWith('.localhost');
}

/**
 * Checks if we're in local development mode
 * Useful for components that need to adjust behavior (e.g., open links differently)
 */
export function isLocalDevelopment(): boolean {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }
  return process.env.NODE_ENV === 'development';
}

