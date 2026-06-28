/**
 * Root Layout Component
 *
 * This is the root layout for the entire Next.js application.
 * It wraps all pages and provides:
 * - Global metadata (SEO, Open Graph, Twitter cards)
 * - NextAuth SessionProvider (via Providers component)
 * - Global providers (React Query, Theme, Toast)
 * - Global styles and fonts
 *
 * Key Concepts:
 * - Layouts in Next.js are shared UI that persist across page navigations
 * - Root layout is required and wraps all pages
 * - Metadata is used for SEO and social media sharing
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import { siteMetadata } from "@/lib/site-metadata";
import Providers from "./providers";

/**
 * Google Fonts - Inter
 *
 * Next.js automatically optimizes font loading:
 * - Downloads font at build time
 * - Self-hosts font files (no external requests)
 * - Prevents layout shift (font swap strategy)
 * - Only loads font weights/subsets that are used
 *
 * subsets: ["latin"] - Only load Latin characters (smaller file size)
 */
const inter = Inter({ subsets: ["latin"] });

/**
 * SEO Metadata Configuration
 *
 * This metadata object is used by Next.js for:
 * - HTML <head> tags (title, description, etc.)
 * - Open Graph tags (Facebook, LinkedIn sharing)
 * - Twitter Card tags (Twitter sharing)
 * - Search engine optimization (SEO)
 * - Favicon and app icons
 * - Robots and indexing directives
 *
 * metadataBase: Base URL for resolving relative URLs in metadata
 * - Uses environment variable if available, otherwise falls back to production URL
 * - Required for Open Graph images and other absolute URLs
 */
export const metadata: Metadata = siteMetadata;

/**
 * Root Layout Component
 *
 * This component wraps all pages in the application.
 * It provides the HTML structure and global providers.
 *
 * @param children - All page components and nested layouts
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      {/*
        suppressHydrationWarning: Prevents React hydration warnings
        This is needed when using theme providers that modify the <html> element
        (e.g., adding "dark" class). The warning occurs because server and client
        may have different initial HTML due to theme detection.
      */}
      <body className={inter.className} suppressHydrationWarning>
        <JsonLd />
        {/*
          Providers Component
          - SessionProvider: NextAuth session context
          - ThemeProvider: Dark/light mode
          - QueryClientProvider: React Query
          - Toaster: Toast notifications
        */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
