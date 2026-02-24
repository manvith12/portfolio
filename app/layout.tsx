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
      <body className="antialiased">{children}</body>
    </html>
  );
}
