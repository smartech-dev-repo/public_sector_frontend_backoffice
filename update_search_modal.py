import re

path = '/Users/marquis/public-sector/admin/app/components/ui/SearchModal.tsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Add Lucide imports
if 'lucide-react' not in content:
    content = content.replace(
        "import { useRouter } from 'next/navigation';",
        "import { useRouter } from 'next/navigation';\nimport { User, Folder, Settings, UserPlus, Users, UserCog, ClipboardList, Scale, ShieldCheck, LineChart } from 'lucide-react';"
    )

# 2. Replace the Quick Links block
quick_links_jsx = """
            <div className="space-y-6">
              <div>
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Quick Navigation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {[
                    { name: 'Customer Management', href: '/dashboard/clients', description: 'View and manage all customer profiles.', icon: User },
                    { name: 'Broadsheet & Repayment', href: '/dashboard/broadsheet', description: 'Monitor loan broadsheets and repayments.', icon: Folder },
                    { name: 'Loan Configurations', href: '/dashboard/loan-terms', description: 'Configure loan terms and conditions.', icon: Settings },
                    { name: 'Agent Recruitment', href: '/dashboard/invites', description: 'Manage new agent recruitment and invites.', icon: UserPlus },
                    { name: 'Agent Management', href: '/dashboard/agent-management', description: 'Monitor and manage existing agents.', icon: Users },
                    { name: 'Role Management', href: '/dashboard/team', description: 'Configure system roles and permissions.', icon: UserCog },
                    { name: 'Maker/Checker Queue', href: '/dashboard/maker-checker', description: 'Review and approve pending actions.', icon: ClipboardList },
                    { name: 'Finance Reconciliation', href: '/dashboard/reconciliation', description: 'Reconcile financial records and transactions.', icon: Scale },
                    { name: 'Audit Trail Log', href: '/dashboard/audit-logs', description: 'Review system activity and audit logs.', icon: ShieldCheck },
                    { name: 'Reports', href: '/dashboard/reports', description: 'Generate and view system reports.', icon: LineChart }
                  ].map((route) => (
                    <button 
                      key={route.name}
                      onClick={() => { router.push(route.href); onClose(); }}
                      className="w-full flex items-center gap-4 p-3 hover:bg-slate-100/80 rounded-xl group transition-all text-left border border-transparent hover:border-slate-200"
                    >
                      <div className="p-2.5 bg-slate-100 rounded-lg group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-slate-200 transition-all text-slate-500 group-hover:text-[#018752] shrink-0">
                        <route.icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-800 group-hover:text-[#018752] text-sm font-semibold mb-0.5 transition-colors">{route.name}</div>
                        <div className="text-xs text-slate-500 truncate">{route.description}</div>
                      </div>
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-[#018752] shrink-0 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
"""

# Find the block from `{!searchQuery ? (` to `) : (`
content = re.sub(
    r'\{\/\* Empty State / Quick Links \*\/\}.*?\{\!searchQuery \? \([\s\S]*?\)\s*:\s*\(',
    f'{{/* Empty State / Quick Links */}}\n          {!searchQuery ? ({quick_links_jsx}) : (',
    content,
    flags=re.DOTALL
)

with open(path, 'w') as f:
    f.write(content)

print("Done")
