"use client";

import RecruitmentApplicationsTab from './components/RecruitmentApplicationsTab';

export default function AgentRecruitmentPage() {
  return (
    <main className="w-full">
      <h1 className="sr-only">Agent Recruitment</h1>
      <div className="mb-4">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage candidate recruitment applications, verify onboarding credentials, and review submissions.
        </p>
      </div>

      {/* ================= RECRUITMENT APPLICATIONS CONTENT ================= */}
      <RecruitmentApplicationsTab />
    </main>
  );
}
