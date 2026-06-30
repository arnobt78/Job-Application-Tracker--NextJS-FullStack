import { Briefcase } from 'lucide-react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { useForm, Control } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { CustomFormField, CustomFormSelect, CustomFormFilterDropdown } from '@/components/FormComponents';
import { JOB_FORM_STATUS_OPTIONS } from '@/lib/jobs/filter-config';
import { getJobStatusOptionIcon } from '@/components/ui/glass-filter-dropdown';

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

  it('renders label icon when labelIcon is provided', () => {
    const { container } = render(
      <WithForm>
        {(control) => (
          <CustomFormField
            name="position"
            control={control}
            labelIcon={Briefcase}
            labelText="Position"
          />
        )}
      </WithForm>
    );
    expect(container.querySelector('label svg')).not.toBeNull();
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

describe('CustomFormFilterDropdown', () => {
  it('renders capitalized trigger label from FilterOption', () => {
    const { getByRole } = render(
      <WithForm>
        {(control) => (
          <CustomFormFilterDropdown
            name="status"
            control={control}
            options={JOB_FORM_STATUS_OPTIONS}
            getOptionIcon={getJobStatusOptionIcon}
            labelText="Job Status"
          />
        )}
      </WithForm>
    );
    expect(getByRole('button', { name: /Pending/i })).toBeTruthy();
  });
});
