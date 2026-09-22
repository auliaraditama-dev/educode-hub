import type { Metadata } from "next";
const configured = process.env.NEXT_PUBLIC_SITE_URL;
export const siteUrl = configured
  ? new URL(configured).origin
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";
export function metadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: path,
      siteName: "EduCode Hub",
      title,
      description,
    },
    twitter: { card: "summary", title, description },
  };
}
