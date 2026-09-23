import { runnerHtml, runnerPolicy } from "@/lib/runner";
export function GET() {
  return new Response(runnerHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": runnerPolicy + "; frame-ancestors 'self'",
      "X-Frame-Options": "SAMEORIGIN",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
