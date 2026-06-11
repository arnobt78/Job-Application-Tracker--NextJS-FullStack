/** Hero carousel slides — one at a time with per-slide glow color */
export type HeroCarouselSlide = {
  src: string;
  alt: string;
  /** RGBA glow behind image */
  glow: string;
};

export const HERO_CAROUSEL_SLIDES: readonly HeroCarouselSlide[] = [
  {
    src: "/main.svg",
    alt: "Jobify career journey illustration",
    glow: "rgba(59,130,246,0.5)",
  },
  {
    src: "/job-1.svg",
    alt: "job track illustration",
    glow: "rgba(14,165,233,0.45)",
  },
  {
    src: "/job-2.svg",
    alt: "Career planning illustration",
    glow: "rgba(16,185,129,0.45)",
  },
  {
    src: "/job-3.svg",
    alt: "Interview preparation illustration",
    glow: "rgba(139,92,246,0.45)",
  },
  {
    src: "/job-4.svg",
    alt: "Job application tracking illustration",
    glow: "rgba(245,158,11,0.4)",
  },
] as const;

export const HERO_CAROUSEL_INTERVAL_MS = 4500;

/** Shared hero CTA height — keeps Get Started and Try Demo aligned */
export const HERO_CTA_CLASS =
  "cta-shine-button inline-flex h-11 min-h-11 items-center gap-2 rounded-full px-8 text-sm font-medium";
