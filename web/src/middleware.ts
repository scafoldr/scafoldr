import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth')?.value;

  if (pathname.startsWith('/app')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/app/:path*', '/auth/:path*', '/api/:path*']
};
