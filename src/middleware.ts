import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Portfolio domain configuration
const PORTFOLIO_DOMAIN = process.env.NEXT_PUBLIC_PORTFOLIO_DOMAIN || 'poseandpoise.studio';
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'poseandpoise.studio';

// Reserved subdomains that should not be treated as usernames
const RESERVED_SUBDOMAINS = ['www', 'api', 'app', 'dashboard', 'admin', 'mail', 'ftp', 'staging', 'dev'];

/**
 * Extracts username from subdomain
 * e.g., "janemodel.poseandpoise.studio" -> "janemodel"
 */
function extractUsernameFromHost(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0];
  
  // Handle localhost development
  if (host.endsWith('.localhost')) {
    const parts = host.split('.');
    if (parts.length === 2 && parts[0] && !RESERVED_SUBDOMAINS.includes(parts[0].toLowerCase())) {
      return parts[0].toLowerCase();
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

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  
  // Extract username from subdomain
  const username = extractUsernameFromHost(hostname);
  
  // If this is a portfolio subdomain request
  if (username) {
    // Rewrite to the [username] dynamic route
    // This allows username.poseandpoise.studio to serve the same content as poseandpoise.studio/username
    const url = request.nextUrl.clone();
    url.pathname = `/${username}${pathname === '/' ? '' : pathname}`;
    
    // Use rewrite instead of redirect to keep the subdomain URL in the browser
    const response = NextResponse.rewrite(url);
    
    // Add header to indicate this is a subdomain request (useful for analytics/logging)
    response.headers.set('x-portfolio-username', username);
    
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