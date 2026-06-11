import { Skeleton } from '@/components/ui/skeleton';
import { UI_DIMENSIONS } from '@/lib/ui/dimensions';

/** Route loader — mirrors EditJobForm GlassCard layout */
function EditJobLoading() {
  return (
    <div className={`w-full max-w-2xl ${UI_DIMENSIONS.formCard.minHeightClass}`}>
      <Skeleton className="h-full w-full rounded-[28px]" />
    </div>
  );
}

export default EditJobLoading;
