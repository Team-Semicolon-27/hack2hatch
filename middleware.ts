import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/verify");

    const session = req.nextauth?.token;

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
      authorized: ({ token }) => !!token, // Only allow authenticated users
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"], // jo route protect krna ho idhar add krlena
};
