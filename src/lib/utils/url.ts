// src/lib/utils/url.ts

/**
 * Robust Dynamic Base URL Resolver for Zero-Downtime Deployments (Local, Vercel Preview, and Production)
 *
 * Priority order:
 * 1. Explicit Custom Domain: process.env.NEXT_PUBLIC_SITE_URL (e.g. https://smartkids.edu.kh)
 * 2. Vercel Production URL: process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
 * 3. Vercel Preview / Deployment URL: process.env.NEXT_PUBLIC_VERCEL_URL
 * 4. Client-side browser execution (window.location.origin)
 * 5. Local development fallback (http://localhost:3000)
 */
export function getBaseUrl(): string {
  // 1. Explicit Custom Domain
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const url = process.env.NEXT_PUBLIC_SITE_URL.trim();
    return url.startsWith('http') ? url.replace(/\/+$/, '') : `https://${url.replace(/\/+$/, '')}`;
  }

  // 2. Vercel Production Environment Variable
  if (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) {
    const url = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL.trim();
    return url.startsWith('http') ? url.replace(/\/+$/, '') : `https://${url.replace(/\/+$/, '')}`;
  }

  // 3. Vercel Preview / Deployment URL
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    const url = process.env.NEXT_PUBLIC_VERCEL_URL.trim();
    return url.startsWith('http') ? url.replace(/\/+$/, '') : `https://${url.replace(/\/+$/, '')}`;
  }

  // 4. Client-side browser execution
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  // 5. Local development fallback
  return 'http://localhost:3000';
}

/**
 * Helper to construct canonical OAuth callback URLs
 */
export function getOAuthCallbackUrl(nextPath: string = '/teacher/dashboard'): string {
  const base = getBaseUrl();
  const cleanNext = nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
  return `${base}/auth/callback?next=${encodeURIComponent(cleanNext)}`;
}
