import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "./providers";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://jobify-app.vercel.app"
  ),
  title: "Jobify | Modern Next.js Job Tracking App",
  description:
    "Jobify Tracking App is a full-featured, modern job application tracker for job seekers. Built with Next.js 14+, TypeScript, Clerk authentication, Prisma ORM, React Query, shadcn/ui, and Tailwind CSS, it empowers users to efficiently organize, track, and analyze their job search journey. Enjoy a beautiful dashboard, secure authentication, analytics, theming, and a modular, extensible codebase.",
  keywords: [
    "Next.js",
    "TypeScript",
    "Job Tracker",
    "Job Application",
    "Job Search",
    "Clerk",
    "Prisma",
    "React Query",
    "shadcn/ui",
    "Tailwind CSS",
    "React Hook Form",
    "zod",
    "Dashboard",
    "Theming",
    "Recharts",
    "Authentication",
    "Full Stack",
    "Career",
    "Analytics",
    "CRUD",
    "Dark Mode",
    "Responsive UI",
    "Open Source",
    "Learning Project",
  ],
  authors: [{ name: "Arnob Mahmud", url: "https://github.com/arnobt78" }],
  creator: "Arnob Mahmud",
  openGraph: {
    title: "Jobify | Modern Next.js Job Tracking App",
    description:
      "A beautiful, full-stack job application tracker for job seekers. Organize, track, and analyze your job search with Next.js, TypeScript, Clerk, Prisma, React Query, and Tailwind CSS.",
    url: "https://github.com/arnobt78/Job-Tracking-App--NextJS",
    siteName: "Jobify Tracking App",
    images: [
      {
        url: "/main.svg",
        width: 800,
        height: 600,
        alt: "Jobify Dashboard Screenshot",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jobify | Modern Next.js Job Tracking App",
    description:
      "A beautiful, full-stack job application tracker for job seekers. Organize, track, and analyze your job search with Next.js, TypeScript, Clerk, Prisma, React Query, and Tailwind CSS.",
    creator: "@arnob_t78",
    images: ["/main.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
