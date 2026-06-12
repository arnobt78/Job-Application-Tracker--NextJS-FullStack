import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { useForm, Control } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { CustomFormField, CustomFormSelect } from '@/components/FormComponents';

/** Minimal form context wrapper — react-hook-form requires FormProvider (Form component) */
function WithForm({ children }: { children: (ctrl: Control<any>) => React.ReactNode }) {
  const form = useForm<any>({ defaultValues: { position: '', status: 'pending' } });
  return <Form {...form}><form>{children(form.control)}</form></Form>;
}

describe('CustomFormField required prop', () => {
  it('renders no asterisk when required is omitted', () => {
    const { container } = render(
      <WithForm>
        {(control) => <CustomFormField name="position" control={control} />}
      </WithForm>
    );
    expect(container.querySelector('.text-destructive')).toBeNull();
  });

  it('renders destructive asterisk when required is true', () => {
    const { container } = render(
      <WithForm>
        {(control) => <CustomFormField name="position" control={control} required />}
      </WithForm>
    );
    expect(container.querySelector('.text-destructive')).not.toBeNull();
    expect(container.querySelector('.text-destructive')?.textContent).toBe('*');
  });
});

describe('CustomFormSelect required prop', () => {
  it('renders no asterisk when required is omitted', () => {
    const { container } = render(
      <WithForm>
        {(control) => (
          <CustomFormSelect
            name="status"
            control={control}
            items={['pending', 'interview']}
            labelText="job status"
          />
        )}
      </WithForm>
    );
    expect(container.querySelector('.text-destructive')).toBeNull();
  });

  it('renders destructive asterisk when required is true', () => {
    const { container } = render(
      <WithForm>
        {(control) => (
          <CustomFormSelect
            name="status"
            control={control}
            items={['pending', 'interview']}
            labelText="job status"
            required
          />
        )}
      </WithForm>
    );
    expect(container.querySelector('.text-destructive')).not.toBeNull();
    expect(container.querySelector('.text-destructive')?.textContent).toBe('*');
  });
});
