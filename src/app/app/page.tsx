import RecruiterInterview from '@/components/RecruiterInterview';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AppHome() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 font-sans">
        <RecruiterInterview />
      </main>
    </ProtectedRoute>
  );
}
