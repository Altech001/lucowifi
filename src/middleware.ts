
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('luco-admin-auth');
  const { pathname } = request.nextUrl;

  // Allow requests to the login page to proceed
  if (pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  // If on an admin path and no auth cookie, redirect to login
  if (pathname.startsWith('/admin') && !cookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
