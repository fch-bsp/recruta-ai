import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recruta.AI",
  description: "Plataforma inteligente de recrutamento com IA",
};

import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Navbar />
            <div className="min-h-[calc(100vh-8rem)]">
              {children}
            </div>
            <footer className="py-4 text-center text-xs text-neutral-400 dark:text-neutral-600 border-t border-neutral-100 dark:border-neutral-800">
              2026 © All rights reserved. Fernando Horas
            </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
