import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/sign-in',
    '/sign-up',
    '/',
    '/verify/:path*',
    '/clubs/:path*', 
    '/events/:path*', 
    '/resources/:path*',
    '/user/:path*',
    '/issues/:path*',
  ],
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  console.log("Session Data:", token);
  console.log("Current Path:", url.pathname);

  const isAuthPage =
    url.pathname.startsWith("/auth/signup/") ||
    url.pathname.startsWith("/login/") ||
    url.pathname === "/verify"; // Removed "/welcome" from auth pages

  // Redirect authenticated users away from auth pages (including /welcome)
  if (token && (isAuthPage || url.pathname === "/welcome")) {
    console.log("Redirecting authenticated user from auth page -> /");
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect unauthenticated users to /sign-in
  if (!token && !isAuthPage) {
    console.log("Redirecting unauthenticated user -> /sign-in");
    return NextResponse.redirect(new URL('/welcome', request.url));
  }

  // Redirect unverified users to /verify
  if (token && token.isVerified === false && url.pathname !== "/verify") {
    console.log("Redirecting unverified user -> /verify");
    return NextResponse.redirect(new URL('/verify', request.url));
  }

  return NextResponse.next();
}
