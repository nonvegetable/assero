import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Only protect the auth pages that you really want to be public
  const isPublicPath = path === '/login' || path === '/signup' || path === '/';
  
  // Get the token from cookies (if any)
  const token = request.cookies.get('session')?.value;
  
  // Remove dashboard from middleware protection so client side can handle auth
  if (!isPublicPath && path !== '/dashboard' && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/create-asset',
    '/view-asset',
    '/transfer-asset'
    // Note: removed '/dashboard' from the matcher
  ]
};