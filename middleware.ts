import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {

    const { pathname } = req.nextUrl;

    // Check if the route is an authentication page
    const isAuthPage = 
      pathname.startsWith("/login") || 
      pathname.startsWith("/auth/signup/entrepreneur") || 
      pathname.startsWith("/auth/signup/mentor") ||
      pathname.startsWith("/welcome") ||
      pathname.startsWith("/verify");


    const session = req.nextauth?.token;

    if (session && isAuthPage) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (!session && !isAuthPage) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (session && !session.isVerified && pathname !== "/verify") {
      return NextResponse.redirect(new URL("/verify", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Allow only authenticated users
    },
  }
);

export const config = {
  matcher: "/:path*", // Apply middleware to ALL routes for debugging
};
