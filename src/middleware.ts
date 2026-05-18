export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/approval/:path*",
    "/calendar/:path*",
    "/trends/:path*",
    "/reports/:path*",
    "/brand-bible/:path*",
    "/shopify/:path*",
    // /login, /privacy-policy, /terms, /tiktok-demo are intentionally excluded (public)
  ],
};
