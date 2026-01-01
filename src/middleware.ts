import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Portfolio domain configuration
const PORTFOLIO_DOMAIN = process.env.NEXT_PUBLIC_PORTFOLIO_DOMAIN || 'poseandpoise.studio';
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://poseandpoise.studio';

// Reserved subdomains that should not be treated as usernames
const RESERVED_SUBDOMAINS = ['www', 'api', 'app', 'dashboard', 'admin', 'mail', 'ftp', 'staging', 'dev'];

// Paths that should redirect to main domain (authenticated routes)
const MAIN_DOMAIN_PATHS = [
  '/dashboard',
  '/settings',
  '/onboarding',
  '/login',
  '/signup',
  '/auth',
  '/pricing',
  '/api',
];

/**
 * Extracts username from subdomain
 * e.g., "janemodel.poseandpoise.studio" -> "janemodel"
 */
function extractUsernameFromHost(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0];
  
  // Handle localhost development - subdomains like username.localhost:3000
  if (host === 'localhost' || host.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
    return null; // No subdomain support for plain localhost or IP
  }
  
  // Handle *.localhost for local subdomain testing (e.g., username.localhost)
  if (host.endsWith('.localhost')) {
    const parts = host.split('.');
    if (parts.length >= 2) {
      const subdomain = parts[0].toLowerCase();
      if (subdomain && !RESERVED_SUBDOMAINS.includes(subdomain)) {
        return subdomain;
      }
    }
    return null;
  }
  
  // Handle production subdomain
  const domainParts = PORTFOLIO_DOMAIN.split('.');
  const hostParts = host.split('.');
  
  // Check if hostname has more parts than the base domain (indicating a subdomain)
  if (hostParts.length > domainParts.length) {
    const subdomain = hostParts[0].toLowerCase();
    
    // Verify the rest matches our domain
    const hostSuffix = hostParts.slice(1).join('.');
    if (hostSuffix === PORTFOLIO_DOMAIN && !RESERVED_SUBDOMAINS.includes(subdomain)) {
      return subdomain;
    }
  }
  
  return null;
}

/**
 * Check if a path should be handled by the main domain
 */
function shouldRedirectToMainDomain(pathname: string): boolean {
  return MAIN_DOMAIN_PATHS.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  
  // Extract username from subdomain
  const username = extractUsernameFromHost(hostname);
  
  // If this is a portfolio subdomain request
  if (username) {
    // If trying to access authenticated routes on subdomain, redirect to main domain
    if (shouldRedirectToMainDomain(pathname)) {
      const mainUrl = new URL(pathname, MAIN_DOMAIN);
      mainUrl.search = request.nextUrl.search;
      return NextResponse.redirect(mainUrl);
    }
    
    // For portfolio pages, rewrite to the [username] dynamic route
    // This allows username.poseandpoise.studio to serve the same content as poseandpoise.studio/username
    const url = request.nextUrl.clone();
    
    // Handle root path - rewrite to /[username]
    // Handle other paths - rewrite to /[username]/path
    if (pathname === '/') {
      url.pathname = `/${username}`;
    } else {
      // Check if this is a valid portfolio sub-route (about, services, contact, etc.)
      // For now, we'll just serve the main portfolio for any path
      url.pathname = `/${username}`;
    }
    
    // Use rewrite instead of redirect to keep the subdomain URL in the browser
    const response = NextResponse.rewrite(url);
    
    // Add header to indicate this is a subdomain request (useful for analytics/logging)
    response.headers.set('x-portfolio-username', username);
    
    // Still need to handle session for subdomain requests
    return response;
  }
  
  // For main domain requests, continue with normal session handling
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};