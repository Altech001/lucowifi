
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('luco-admin-auth');
  const { pathname } = request.nextUrl;

  // If user is trying to access /login page but is already logged in, redirect to admin
  if (cookie && pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  
  // If accessing a protected admin path without a cookie, redirect to login
  if (pathname.startsWith('/admin') && !cookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
