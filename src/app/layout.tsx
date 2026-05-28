import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Omni",
  description: "Omnipresence project workspace — files, strategies, approvals, and a Hermes assistant.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
