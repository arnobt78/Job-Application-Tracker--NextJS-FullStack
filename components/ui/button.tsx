import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { RippleButton } from '@/components/ui/ripple-button';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 backdrop-blur-sm',
  {
    variants: {
      variant: {
        default:
          'border border-primary/30 bg-gradient-to-r from-primary/70 via-primary/50 to-primary/30 text-white/90 shadow-[0_15px_35px_rgba(59,130,246,0.45)] hover:from-primary/80 hover:via-primary/60 hover:to-primary/40 [&_svg]:text-white/90',
        destructive:
          'border border-rose-400/30 bg-gradient-to-r from-rose-500/70 via-rose-500/50 to-rose-500/30 text-white/90 shadow-[0_15px_35px_rgba(225,29,72,0.45)] hover:from-rose-500/80 hover:via-rose-600/60 hover:to-rose-500/40 [&_svg]:text-white/90',
        outline:
          'border border-white/10 bg-background/50 text-foreground/90 hover:bg-accent/50 hover:border-white/20 [&_svg]:text-foreground/90',
        secondary:
          'bg-gradient-to-r from-secondary/70 via-secondary/50 to-secondary/30 text-white/80 border border-secondary/30 [&_svg]:text-white/80',
        ghost:
          'text-foreground/90 hover:bg-accent/50 hover:text-accent-foreground [&_svg]:text-foreground/90',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      );
    }

    return (
      <RippleButton
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
