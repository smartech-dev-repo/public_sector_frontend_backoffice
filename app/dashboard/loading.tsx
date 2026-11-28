import { Skeleton, TableSkeleton } from '@/app/components/ui/Skeleton';

// Shown instantly while a dashboard page loads after navigation: most pages are a filter bar
// over a table. Record pages ([id]) have their own loading.tsx shaped like a profile.
export default function DashboardLoading() {
 return (
  <div className="w-full space-y-4">
   <div className="flex flex-col sm:flex-row gap-3">
    <Skeleton className="h-10 w-full sm:w-72 rounded-lg" />
    <Skeleton className="h-10 w-full sm:w-40 rounded-lg" />
    <Skeleton className="h-10 w-full sm:w-28 rounded-lg sm:ml-auto" />
   </div>
   <TableSkeleton rows={8} label="Loading page" />
  </div>
 );
}
