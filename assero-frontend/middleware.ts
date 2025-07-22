import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // Only treat login, signup and homepage as public
  const isPublicPath = path === '/login' || path === '/signup' || path === '/';
  // Check cookie only for those paths
  const token = request.cookies.get('session')?.value;
  console.log('[Middleware]', { path, isPublicPath, hasToken: !!token });

  if (!isPublicPath && !token) {
    console.log('[Middleware] No token found on protected route; redirecting to /login');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  console.log('[Middleware] Allowing access to', path);
  return NextResponse.next();
}

export const config = {
  // Only protect public pages; client-side protected routes (like /dashboard, /view-asset, etc.) are not checked here.
  matcher: [
    '/',
    '/login',
    '/signup'
  ]
};