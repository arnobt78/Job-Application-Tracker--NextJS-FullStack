'use client';

import { Briefcase } from 'lucide-react';
import { AddJobDialog } from '@/components/dialogs/add-job-dialog';
import { PageSectionHeader } from '@/components/ui/page-section-header';
import { DASHBOARD_COPY } from '@/lib/ui/dashboard-copy';

/** Dashboard page title row + New Application CTA */
export function DashboardPageHeader() {
  const copy = DASHBOARD_COPY.pageHeader;

  return (
    <div className="mb-6">
      <PageSectionHeader
        icon={Briefcase}
        title={copy.title}
        subtitle={copy.subtitle}
        headingLevel="h1"
        trailing={<AddJobDialog />}
      />
    </div>
  );
}
