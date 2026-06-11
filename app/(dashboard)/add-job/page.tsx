import CreateJobForm from '@/components/CreateJobForm';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Add Job',
  description:
    'Add a new job application to your Jobify tracker with position, company, location, status, and employment type.',
  path: '/add-job',
  noIndex: true,
});

function AddJobPage() {
  return <CreateJobForm />;
}

export default AddJobPage;
