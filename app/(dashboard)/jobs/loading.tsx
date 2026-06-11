import { Skeleton } from '@/components/ui/skeleton';
import { UI_DIMENSIONS } from '@/lib/ui/dimensions';

/** Route loader — mirrors JobsList isPending skeleton (no layout flash) */
function JobsLoading() {
  const { heightClass, roundedClass } = UI_DIMENSIONS.jobCard;
  const { heightClass: titleH, widthClass: titleW } = UI_DIMENSIONS.jobsListTitle;

  return (
    <div className="space-y-4">
      <Skeleton className={`${titleH} ${titleW}`} />
      <div className="grid w-full gap-8 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className={`${heightClass} w-full ${roundedClass}`} />
        ))}
      </div>
    </div>
  );
}

export default JobsLoading;
