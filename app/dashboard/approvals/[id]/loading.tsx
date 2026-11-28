import { DetailSkeleton } from '@/app/components/ui/Skeleton';

// Shown instantly while this record page loads after navigation.
export default function RecordLoading() {
 return <DetailSkeleton label="Loading record" />;
}
