"use client";

import RecruitmentApplicationsTab from './components/RecruitmentApplicationsTab';

export default function AgentRecruitmentPage() {
  return (
    <main className="w-full">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Agent Recruitment</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage candidate recruitment applications, verify onboarding credentials, and review submissions.
          </p>
        </div>
      </div>

      {/* ================= RECRUITMENT APPLICATIONS CONTENT ================= */}
      <RecruitmentApplicationsTab />
    </main>
  );
}
