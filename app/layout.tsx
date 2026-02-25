import type { Metadata } from "next";
import "./globals.css";
import { PersonJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Sanisetty Manvith | Developer | IIIT Kottayam",
  description:
    "Sanisetty Manvith — full-stack developer, designer & Computer Science student at Indian Institute of Information Technology Kottayam (IIIT Kottayam). Explore projects, skills and more.",
  metadataBase: new URL("https://www.manvith.tech"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Sanisetty Manvith | Developer | IIIT Kottayam",
    description:
      "Portfolio of Sanisetty Manvith — full-stack developer and CS student at IIIT Kottayam.",
    url: "https://www.manvith.tech",
    siteName: "Sanisetty Manvith — Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanisetty Manvith | Developer | IIIT Kottayam",
    description:
      "Portfolio of Sanisetty Manvith — full-stack developer and CS student at IIIT Kottayam.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <PersonJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
