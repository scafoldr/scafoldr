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
      const { pathname, search } = request.nextUrl;
      const route = `${pathname}${search}`;

      return NextResponse.redirect(
        new URL(`/auth?redirect=${encodeURIComponent(route)}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/app/:path*', '/auth/:path*', '/api/:path*']
};
