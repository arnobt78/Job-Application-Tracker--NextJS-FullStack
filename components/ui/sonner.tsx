'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

/** Global Sonner toaster — bottom-left, theme-aware */
export function Toaster() {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as 'light' | 'dark' | 'system'}
      position="bottom-left"
      closeButton
      richColors
      toastOptions={{
        classNames: {
          toast:
            'group toast border border-border/60 bg-background/95 backdrop-blur-md shadow-lg',
          title: 'text-sm font-semibold',
          description: 'text-sm text-muted-foreground',
        },
      }}
    />
  );
}
