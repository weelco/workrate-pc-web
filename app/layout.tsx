import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workrate — Employee Lifecycle",
  description: "People & Culture: onboarding, mutations, and offboarding on one lifecycle timeline.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
