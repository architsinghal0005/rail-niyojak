import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RailNiyojak | Indian Railways",
  description: "AI-Powered Automatic Block Planning",
  manifest: "/manifest.json"
};

import { I18nProvider } from "@/lib/i18n";
import { AppStateProvider } from "@/lib/store";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <AppStateProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </AppStateProvider>
      </body>
    </html>
  );
}
