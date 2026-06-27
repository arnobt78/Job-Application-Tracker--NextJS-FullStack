/**
 * DiscoverPageHeader — static h1 page header for /discover.
 * Server-safe (no hooks). Analogous to DashboardPageHeader.
 */

import { Compass } from 'lucide-react';
import { PageSectionHeader } from '@/components/ui/page-section-header';

export function DiscoverPageHeader() {
  return (
    <div className="mb-6">
      <PageSectionHeader
        icon={Compass}
        title="Discover Jobs"
        subtitle="Search 1.8M+ live postings across Greenhouse, Lever, Ashby, Workday and more"
        headingLevel="h1"
      />
    </div>
  );
}
