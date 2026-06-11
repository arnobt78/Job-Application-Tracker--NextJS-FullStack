import { SafeImage } from '@/components/ui/safe-image';
import { UI_DIMENSIONS } from '@/lib/ui/dimensions';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type SiteLogoProps = {
  className?: string;
  priority?: boolean;
  linked?: boolean;
};

/** Smaller consistent logo site-wide (120×37) */
export function SiteLogo({
  className,
  priority = false,
  linked = true,
}: SiteLogoProps) {
  const image = (
    <SafeImage
      src="/logo.svg"
      alt="Jobify logo"
      width={UI_DIMENSIONS.logo.width}
      height={UI_DIMENSIONS.logo.height}
      className={className}
      priority={priority}
    />
  );

  if (linked) {
    return (
      <Link href="/" className={cn('inline-block', className)}>
        {image}
      </Link>
    );
  }

  return image;
}
