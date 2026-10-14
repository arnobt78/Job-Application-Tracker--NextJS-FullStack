import { RouteFallbackProvider } from '@/components/providers/route-fallback-provider';
import { EditJobDialogPageFallback } from '@/components/pages/edit-job-dialog-page';

/** Instant navigation shell — edit dialog opens with its form skeleton until the job payload streams in */
export default function JobEditLoading() {
  return (
    <RouteFallbackProvider>
      <EditJobDialogPageFallback />
    </RouteFallbackProvider>
  );
}
