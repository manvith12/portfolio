import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// 1. In-memory rate limiter (per-IP, sliding window)
//    Limits requests to image/asset paths to prevent bandwidth abuse.
//    In production on Vercel this runs at the edge; the Map resets on cold
//    starts, which is fine — persistent abuse is handled by Vercel's own DDoS
//    protection layer.
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 60_0; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // max 100 asset requests / IP / minute

interface RateEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateEntry>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}

// Periodically prune stale entries to avoid unbounded memory growth
if (typeof globalThis !== "undefined") {
  const PRUNE_INTERVAL = 5 * 60_000; // every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(ip);
    }
  }, PRUNE_INTERVAL);
}

// ---------------------------------------------------------------------------
// 2. Allowed referrers for hotlink protection
//    Empty / missing referer is allowed (direct browser navigation, bookmarks,
//    privacy extensions that strip Referer).
// ---------------------------------------------------------------------------

const ALLOWED_HOSTS = [
  "localhost",
  "127.0.0.1",
  // Add your production domain(s) here:
  "manvith.me",
  "www.manvith.me",
  "portfolio-manvith12.vercel.app",
];

function isHotlink(req: NextRequest): boolean {
  const referer = req.headers.get("referer");
  if (!referer) return false; // allow direct access / privacy browsers

  try {
    const refHost = new URL(referer).hostname;
    return !ALLOWED_HOSTS.some(
      (h) => refHost === h || refHost.endsWith(`.${h}`)
    );
  } catch {
    return true; // malformed referer → block
  }
}

// ---------------------------------------------------------------------------
// Middleware handler
// ---------------------------------------------------------------------------

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect asset / image paths
  const isAssetPath =
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/_next/image") ||
    pathname.startsWith("/fonts/");

  if (!isAssetPath) return NextResponse.next();

  // --- Rate limiting ---
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": "60",
        "Content-Type": "text/plain",
      },
    });
  }

  // --- Hotlink protection ---
  if (isHotlink(req)) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.next();
}

// Only run middleware on asset routes (keeps page navigation untouched)
export const config = {
  matcher: ["/assets/:path*", "/_next/image/:path*", "/fonts/:path*"],
};
