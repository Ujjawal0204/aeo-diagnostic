import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEO Diagnostic — How does AI see your brand?",
  description: "When shoppers ask AI for product recommendations, does your brand get mentioned? Find out across three different AI engines.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
