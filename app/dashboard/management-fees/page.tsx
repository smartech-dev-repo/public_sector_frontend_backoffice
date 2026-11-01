import { redirect } from 'next/navigation';

export default function ManagementFeesPage() {
 redirect('/dashboard/configuration?tab=fees');
}
