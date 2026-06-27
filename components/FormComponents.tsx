import type { Control, FieldValues, Path } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from './ui/input';

type CustomFormFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  /** Override the auto-capitalised name as label text */
  labelText?: string;
  /** Input placeholder */
  placeholder?: string;
  /** Renders a red asterisk (*) after the label when true */
  required?: boolean;
};

export function CustomFormField<T extends FieldValues>({
  name,
  control,
  labelText,
  placeholder,
  required = false,
}: CustomFormFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="capitalize">
            {labelText ?? name}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} value={field.value ?? ''} />
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
  /** Renders a red asterisk (*) after the label when true */
  required?: boolean;
};

export function CustomFormSelect<T extends FieldValues>({
  name,
  control,
  items,
  labelText,
  required = false,
}: CustomFormSelectProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="capitalize">
            {labelText || name}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="glass-input">
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
export default CustomFormSelect;
