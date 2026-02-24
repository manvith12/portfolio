import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "S. Manvith — Portfolio",
  description:
    "Web developer, designer & quantum enthusiast. Portfolio of S. Manvith.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload first 3 frames to eliminate initial flash */}
        <link rel="preload" href="/assets/folder/folder.svg" as="image" />
        <link rel="preload" href="/assets/folder/folder2.png" as="image" />
        <link rel="preload" href="/assets/folder/folder3.png" as="image" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
