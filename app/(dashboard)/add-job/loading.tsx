import { Skeleton } from '@/components/ui/skeleton';
import { UI_DIMENSIONS } from '@/lib/ui/dimensions';

/** Route loader — mirrors CreateJobForm GlassCard layout */
function AddJobLoading() {
  return (
    <div className={`w-full ${UI_DIMENSIONS.formCard.minHeightClass}`}>
      <Skeleton className="h-full w-full rounded-[28px]" />
    </div>
  );
}

export default AddJobLoading;
