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
        subtitle="Browse open roles from hiring companies — filter, review details and track in one click"
        headingLevel="h1"
      />
    </div>
  );
}
