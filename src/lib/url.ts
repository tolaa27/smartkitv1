// src/lib/url.ts

/**
 * Robust Dynamic Base URL Resolver for Zero-Downtime Next.js Deployments
 * Works identically across:
 * - Client-side browser execution (window.location.origin)
 * - Server-side rendering (SSR), Server Components & Server Actions
 * - Vercel Preview & Production environments
 * - Local development (http://localhost:3000)
 */

/**
 * Resolves the root origin URL with no trailing slash.
 *
 * Precedence:
 * 1. Client-side browser: window.location.origin
 * 2. Server-side: process.env.NEXT_PUBLIC_SITE_URL (custom domain)
 * 3. Server-side: process.env.NEXT_PUBLIC_VERCEL_URL / process.env.VERCEL_URL (with https://)
 * 4. Server-side fallback: http://localhost:3000
 */
export function getBaseUrl(): string {
  // 1. Client-side runtime: always use the current window origin
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  // 2. Server-side runtime: prioritize explicit custom production domain
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL.trim();
    return siteUrl.startsWith('http://') || siteUrl.startsWith('https://')
      ? siteUrl.replace(/\/+$/, '')
      : `https://${siteUrl.replace(/\/+$/, '')}`;
  }

  // 3. Server-side runtime: Vercel system deployment URLs (Production & Preview branches)
  const vercelUrl =
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    process.env.VERCEL_URL;

  if (vercelUrl) {
    const trimmed = vercelUrl.trim();
    return trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed.replace(/\/+$/, '')
      : `https://${trimmed.replace(/\/+$/, '')}`;
  }

  // 4. Local development server fallback
  return 'http://localhost:3000';
}

/**
 * Resolves any relative or root path to a clean absolute URL.
 *
 * @param path - Relative path (e.g. '/student/dashboard' or 'api/tts') or full URL
 * @returns Fully qualified absolute URL (e.g. 'https://smartkids.vercel.app/student/dashboard')
 */
export function getAbsoluteUrl(path: string = ''): string {
  if (!path) return getBaseUrl();
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const base = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Constructs the canonical OAuth redirect URL for Supabase Auth providers (Google OAuth).
 *
 * @param path - OAuth callback endpoint (defaults to '/auth/callback')
 * @param next - Destination route after successful authentication (defaults to '/teacher/dashboard')
 * @returns Fully qualified OAuth callback URL (e.g. 'https://smartkids.vercel.app/auth/callback?next=%2Fteacher%2Fdashboard')
 */
export function getOAuthCallbackUrl(
  pathOrNext: string = '/auth/callback',
  optionalNext?: string
): string {
  let path = '/auth/callback';
  let next = '/teacher/dashboard';

  if (optionalNext !== undefined) {
    path = pathOrNext;
    next = optionalNext;
  } else if (pathOrNext) {
    if (pathOrNext.startsWith('/auth')) {
      path = pathOrNext;
    } else {
      next = pathOrNext;
    }
  }

  const callbackUrl = getAbsoluteUrl(path);
  const cleanNext = next.startsWith('/') ? next : `/${next}`;
  return `${callbackUrl}?next=${encodeURIComponent(cleanNext)}`;
}
