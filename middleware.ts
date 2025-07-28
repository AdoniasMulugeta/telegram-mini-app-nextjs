import { NextRequest, NextResponse } from "next/server";
import {
  validateInitData,
  parseUserFromInitData,
} from "@/lib/services/telegram-service";

// This middleware validates Telegram initData if the Authorization header starts with "tma ".
// If valid, it attaches the user object to the request by cloning the request and adding a custom header.
export async function middleware(request: NextRequest) {
  // Only run for /api routes
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("tma ")) {
    const initData = authHeader.slice(4).trim();
    const isValid = await validateInitData(initData);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid initData" }, { status: 401 });
    }

    // Parse user and attach to request via custom header
    const user = await parseUserFromInitData(initData);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Attach user as a JSON string in a custom header
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(
      "x-telegram-user",
      encodeURIComponent(JSON.stringify(user))
    );

    // Clone the request with the new header and continue
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    return response;
  }

  // If no tma header, or valid, continue
  return NextResponse.next();
}

// Specify the matcher to apply this middleware to all API routes
export const config = {
  matcher: "/api/:path*",
};
