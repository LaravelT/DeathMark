import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LegacyBridge for Employees",
  description: "A privacy-first lifetime family-readiness benefit for employees.",
  other: { "codex-preview": "development" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
