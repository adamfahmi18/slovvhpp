import { NextRequest, NextResponse } from "next/server";
import { verifySessionEdge, SESSION_COOKIE_NAME } from "@/lib/auth-edge";

const PUBLIC_PATHS = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionEdge(token);

  // Signed in and hitting /login -> send to dashboard.
  if (isPublicPath && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Not signed in and hitting a protected route -> send to login.
  if (!isPublicPath && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - all /api/ routes (they guard themselves via requireApiSession and
     *   should return JSON 401s, not an HTML redirect to /login)
     * - static files, images, favicon
     */
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
