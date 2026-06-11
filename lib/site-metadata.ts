import type { Metadata } from "next";

/** Production demo URL — hardcoded for consistent SEO */
export const SITE_URL = "https://jobify-tracker.vercel.app";

export const SITE_NAME = "Jobify";

export const AUTHOR = {
  name: "Arnob Mahmud",
  url: "https://www.arnobmahmud.com/",
  email: "contact@arnobmahmud.com",
} as const;

export const DEFAULT_TITLE =
  "Jobify — Job Tracking Application | Next.js, TypeScript, Clerk, Prisma, React Query, PostgreSQL FullStack";

export const TITLE_TEMPLATE = "%s | Jobify — Job Application Tracker";

export const DEFAULT_DESCRIPTION =
  "Jobify is a full-featured, production-ready job application tracking app for job seekers. Built with Next.js 16, TypeScript, Clerk authentication, Prisma ORM, React Query, and PostgreSQL. Track applications, analyze progress with charts and statistics, export data as CSV or Excel, and manage your job search with a beautiful, responsive dashboard.";

export const SEO_KEYWORDS = [
  "Jobify",
  "job tracker",
  "job application tracker",
  "job search tracker",
  "job application management",
  "career tracker",
  "job hunt organizer",
  "Next.js",
  "Next.js 16",
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
  "job dashboard",
  "job analytics",
  "job statistics",
  "CSV export",
  "Excel export",
  "dark mode",
  "responsive design",
  "full stack",
  "open source",
  "Arnob Mahmud",
  "job seeker",
  "interview tracking",
];

export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: DEFAULT_TITLE,
    template: TITLE_TEMPLATE,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: SEO_KEYWORDS,

  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  creator: AUTHOR.name,
  publisher: AUTHOR.name,

  applicationName: SITE_NAME,
  category: "productivity",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

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

  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    apple: [{ url: "/logo.svg", type: "image/svg+xml" }],
    shortcut: "/logo.svg",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Jobify — Job Application Tracker",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/main.svg",
        width: 1200,
        height: 630,
        alt: "Jobify — Modern Job Application Tracking Dashboard",
        type: "image/svg+xml",
      },
      {
        url: "/logo.svg",
        width: 164,
        height: 50,
        alt: "Jobify Logo",
        type: "image/svg+xml",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Jobify — Job Tracking Application",
    description:
      "Track job applications, analyze your progress, and export your job search data. Built with Next.js, TypeScript, Clerk, Prisma, and PostgreSQL.",
    creator: "@arnob_t78",
    site: "@arnob_t78",
    images: [
      {
        url: "/main.svg",
        alt: "Jobify — Job Application Tracking Dashboard",
      },
    ],
  },

  alternates: {
    canonical: SITE_URL,
  },

  other: {
    author: AUTHOR.name,
    contact: AUTHOR.email,
    "designer": AUTHOR.name,
  },
};

/** Page-level metadata helper — merges with root defaults via Next.js metadata cascade */
export function createPageMetadata({
  title,
  description,
  path = "",
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const url = path ? `${SITE_URL}${path}` : SITE_URL;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
    },
    twitter: {
      title,
      description,
    },
    ...(noIndex && {
      robots: { index: false, follow: false },
    }),
  };
}
