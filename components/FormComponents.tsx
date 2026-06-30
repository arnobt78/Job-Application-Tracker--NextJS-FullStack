import type { Control, FieldValues, Path } from 'react-hook-form';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GlassDropdownContent,
  GlassDropdownRadioItem,
  GlassDropdownTrigger,
} from '@/components/ui/glass-dropdown-menu';
import { GlassFilterDropdown } from '@/components/ui/glass-filter-dropdown';
import type { FilterOption } from '@/lib/jobs/filter-config';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

const FIELD_GLOW =
  'shadow-[0_12px_40px_rgba(2,132,199,0.15)]';

type CustomFormFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  labelText?: string;
  placeholder?: string;
  required?: boolean;
  labelIcon?: LucideIcon;
  /** Tailwind color class for label icon — e.g. text-sky-400 */
  labelIconClassName?: string;
};

export function CustomFormField<T extends FieldValues>({
  name,
  control,
  labelText,
  placeholder,
  required = false,
  labelIcon: LabelIcon,
  labelIconClassName = 'text-sky-400',
}: CustomFormFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-1.5">
            {LabelIcon ? (
              <LabelIcon
                className={cn('h-3.5 w-3.5 shrink-0', labelIconClassName)}
                aria-hidden
              />
            ) : null}
            <span className="capitalize">{labelText ?? name}</span>
            {required ? (
              <span className="text-destructive ml-0.5">*</span>
            ) : null}
          </FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              className={FIELD_GLOW}
              {...field}
              value={field.value ?? ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type CustomFormSelectProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  items: string[];
  labelText?: string;
  required?: boolean;
  labelIcon?: LucideIcon;
  labelIconClassName?: string;
};

/** Glass dropdown select — modal=false, same pattern as dashboard filter row */
export function CustomFormSelect<T extends FieldValues>({
  name,
  control,
  items,
  labelText,
  required = false,
  labelIcon: LabelIcon,
  labelIconClassName = 'text-sky-400',
}: CustomFormSelectProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedLabel =
          items.find((item) => item === field.value) ??
          labelText ??
          String(name);

        return (
          <FormItem>
            <FormLabel className="flex items-center gap-1.5">
              {LabelIcon ? (
                <LabelIcon
                  className={cn('h-3.5 w-3.5 shrink-0', labelIconClassName)}
                  aria-hidden
                />
              ) : null}
              <span className="capitalize">{labelText || name}</span>
              {required ? (
                <span className="text-destructive ml-0.5">*</span>
              ) : null}
            </FormLabel>
            <FormControl>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <GlassDropdownTrigger className={FIELD_GLOW}>
                    <span className="truncate capitalize">{selectedLabel}</span>
                  </GlassDropdownTrigger>
                </DropdownMenuTrigger>
                <GlassDropdownContent
                  align="start"
                  collisionPadding={8}
                  sideOffset={8}
                  className="w-[var(--radix-dropdown-menu-trigger-width)]"
                >
                  <DropdownMenuRadioGroup
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  >
                    {items.map((item) => (
                      <GlassDropdownRadioItem
                        key={item}
                        value={item}
                        label={item}
                      />
                    ))}
                  </DropdownMenuRadioGroup>
                </GlassDropdownContent>
              </DropdownMenu>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

export default CustomFormSelect;

type CustomFormFilterDropdownProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  options: FilterOption[];
  getOptionIcon: (value: string) => ReactNode;
  labelText?: string;
  required?: boolean;
  labelIcon?: LucideIcon;
  labelIconClassName?: string;
};

/** Dashboard-style filter dropdown wired to react-hook-form */
export function CustomFormFilterDropdown<T extends FieldValues>({
  name,
  control,
  options,
  getOptionIcon,
  labelText,
  required = false,
  labelIcon: LabelIcon,
  labelIconClassName = 'text-sky-400',
}: CustomFormFilterDropdownProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const triggerLabel =
          options.find((option) => option.value === field.value)?.label ?? '';

        return (
          <FormItem>
            <FormLabel className="flex items-center gap-1.5">
              {LabelIcon ? (
                <LabelIcon
                  className={cn('h-3.5 w-3.5 shrink-0', labelIconClassName)}
                  aria-hidden
                />
              ) : null}
              <span>{labelText ?? name}</span>
              {required ? (
                <span className="text-destructive ml-0.5">*</span>
              ) : null}
            </FormLabel>
            <FormControl>
              <GlassFilterDropdown
                value={field.value ?? ''}
                options={options}
                onChange={field.onChange}
                triggerIcon={getOptionIcon(field.value ?? '')}
                triggerLabel={triggerLabel}
                getOptionIcon={getOptionIcon}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

