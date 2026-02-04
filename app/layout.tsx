/**
 * Root Layout Component
 *
 * This is the root layout for the entire Next.js application.
 * It wraps all pages and provides:
 * - Global metadata (SEO, Open Graph, Twitter cards)
 * - Clerk authentication provider
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
import { ClerkProvider } from "@clerk/nextjs";
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
export const metadata: Metadata = {
  // Base URL for resolving relative URLs in metadata
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://jobify-tracker.vercel.app"
  ),

  // Primary title and description for SEO
  title: {
    default:
      "Jobify | Modern Job Application Tracker - Organize Your Job Search",
    template: "%s | Jobify - Job Application Tracker",
  },
  description:
    "Jobify is a full-featured, modern job application tracking app for job seekers. Built with Next.js 14+, TypeScript, Clerk authentication, Prisma ORM, React Query, and PostgreSQL. Track your job applications, analyze your progress with charts and statistics, export your data, and manage your job search journey efficiently with a beautiful, responsive dashboard. Free, open-source, and production-ready.",

  // Comprehensive keywords for SEO
  keywords: [
    // Core functionality
    "job tracker",
    "job application tracker",
    "job search tracker",
    "job application management",
    "career tracker",
    "job hunt organizer",
    // Technology stack
    "Next.js",
    "Next.js 14",
    "TypeScript",
    "React",
    "PostgreSQL",
    "Prisma ORM",
    "Clerk authentication",
    "React Query",
    "TanStack Query",
    "shadcn/ui",
    "Tailwind CSS",
    "React Hook Form",
    "Zod validation",
    "Recharts",
    // Features
    "job dashboard",
    "job analytics",
    "job statistics",
    "job search analytics",
    "job application export",
    "CSV export",
    "Excel export",
    "job search management",
    "career management",
    // UI/UX
    "dark mode",
    "responsive design",
    "mobile-friendly",
    "modern UI",
    "beautiful dashboard",
    // Developer
    "full stack",
    "full-stack application",
    "open source",
    "learning project",
    "portfolio project",
    "TypeScript project",
    "Next.js tutorial",
    // Industry
    "job seeker",
    "career development",
    "job hunting",
    "application tracking",
    "interview tracking",
  ],

  // Author information
  authors: [
    {
      name: "Arnob Mahmud",
      url: "https://arnob-mahmud.vercel.app/",
    },
  ],
  creator: "Arnob Mahmud",

  // Application metadata
  applicationName: "Jobify",

  // Robots and indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Icons and favicons - favicon.ico for tab, logo.svg for Apple devices
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: [{ url: "/logo.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.ico",
  },

  // Open Graph metadata (Facebook, LinkedIn, etc.)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jobify-tracker.vercel.app",
    siteName: "Jobify - Job Application Tracker",
    title: "Jobify | Modern Job Application Tracker - Organize Your Job Search",
    description:
      "Track your job applications, analyze your progress with charts and statistics, and manage your job search journey efficiently. Built with Next.js 14+, TypeScript, Clerk, Prisma, React Query, and PostgreSQL. Free, open-source, and production-ready.",
    images: [
      {
        url: "/main.svg",
        width: 1200,
        height: 630,
        alt: "Jobify - Modern Job Application Tracking Dashboard",
        type: "image/svg+xml",
      },
      {
        url: "/logo.svg",
        width: 800,
        height: 600,
        alt: "Jobify Logo",
        type: "image/svg+xml",
      },
    ],
  },

  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "Jobify | Modern Job Application Tracker",
    description:
      "Track your job applications, analyze your progress, and manage your job search journey efficiently. Built with Next.js 14+, TypeScript, Clerk, Prisma, React Query, and PostgreSQL.",
    creator: "@arnob_t78",
    site: "@arnob_t78",
    images: [
      {
        url: "/main.svg",
        width: 1200,
        height: 630,
        alt: "Jobify - Modern Job Application Tracking Dashboard",
      },
    ],
  },

  // Additional metadata
  alternates: {
    canonical: "https://jobify-tracker.vercel.app",
  },
};

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
    /**
     * ClerkProvider - Authentication Context
     *
     * Wraps the entire app to provide Clerk authentication functionality.
     * Makes auth() and other Clerk hooks available in all components.
     * Must be a Server Component (no 'use client' directive).
     */
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
      <html lang="en" suppressHydrationWarning>
        {/* 
          suppressHydrationWarning: Prevents React hydration warnings
          This is needed when using theme providers that modify the <html> element
          (e.g., adding "dark" class). The warning occurs because server and client
          may have different initial HTML due to theme detection.
        */}
        <body className={inter.className} suppressHydrationWarning>
          {/* 
            Providers Component
            - ThemeProvider: Dark/light mode
            - QueryClientProvider: React Query
            - Toaster: Toast notifications
          */}
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
