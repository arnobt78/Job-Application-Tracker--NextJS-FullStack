'use client';

import * as React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GlassDropdownContent,
  GlassDropdownRadioItem,
} from '@/components/ui/glass-dropdown-menu';

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const current = theme ?? 'system';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun
            className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          />
          <Moon
            className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <GlassDropdownContent align="end">
        <DropdownMenuRadioGroup value={current} onValueChange={setTheme}>
          <GlassDropdownRadioItem
            value="light"
            label="Light"
            icon={<Sun className="h-4 w-4" />}
          />
          <GlassDropdownRadioItem
            value="dark"
            label="Dark"
            icon={<Moon className="h-4 w-4" />}
          />
          <GlassDropdownRadioItem
            value="system"
            label="System"
            icon={<Monitor className="h-4 w-4" />}
          />
        </DropdownMenuRadioGroup>
      </GlassDropdownContent>
    </DropdownMenu>
  );
}
