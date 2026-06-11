/**
 * SearchForm Component (SearchContainer)
 *
 * Provides search and filter functionality for the jobs list.
 * Uses URL search parameters to maintain search state, allowing:
 * - Bookmarkable search URLs
 * - Browser back/forward navigation
 * - Shareable filtered views
 *
 * Key Features:
 * - Search by job position or company name
 * - Filter by job status (all, pending, interview, declined)
 * - URL-based state (no local state needed)
 */
'use client';
import { Input } from './ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from './ui/button';
import { GlassCard } from '@/components/ui/glass-card';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { JobStatus } from '@/utils/types';

function SearchContainer() {
  /**
   * Next.js Navigation Hooks
   *
   * useSearchParams: Read current URL query parameters
   * useRouter: Programmatic navigation
   * usePathname: Get current route path
   */
  const searchParams = useSearchParams();
  // Get current search values from URL, with defaults
  const search = searchParams.get('search') || '';
  const jobStatus = searchParams.get('jobStatus') || 'all';
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Form Submit Handler
   *
   * When user submits the search form:
   * 1. Prevent default form submission (page reload)
   * 2. Extract form values
   * 3. Build new URL with search parameters
   * 4. Navigate to new URL (triggers page re-render with new filters)
   *
   * This approach uses URL state instead of React state, which means:
   * - Search persists on page refresh
   * - URLs are shareable/bookmarkable
   * - Browser back/forward works correctly
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page reload
    let params = new URLSearchParams(); // Create new URLSearchParams object

    // Extract form data from the submitted form
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;
    const jobStatus = formData.get('jobStatus') as string;
    
    // Set search parameters (replaces existing params)
    params.set('search', search);
    params.set('jobStatus', jobStatus);

    // Navigate to same path with new query parameters
    // This triggers a client-side navigation (no full page reload)
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <GlassCard variant="sky" className="mb-16">
      <form
        className="grid sm:grid-cols-2 md:grid-cols-3 gap-4"
        onSubmit={handleSubmit}
      >
      <Input
        type='text'
        placeholder='Search Jobs'
        name='search'
        defaultValue={search}
      />
      <Select defaultValue={jobStatus} name='jobStatus'>
        <SelectTrigger className="glass-input">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {['all', ...Object.values(JobStatus)].map((jobStatus) => {
            return (
              <SelectItem key={jobStatus} value={jobStatus}>
                {jobStatus}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <Button type='submit'>Search</Button>
    </form>
    </GlassCard>
  );
}
export default SearchContainer;
