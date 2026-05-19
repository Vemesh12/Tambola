import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tambola Online",
  description: "Play real-time Tambola with friends from any mobile browser."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
