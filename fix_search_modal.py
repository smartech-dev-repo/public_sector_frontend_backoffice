import re

path = '/Users/marquis/public-sector/admin/app/components/ui/SearchModal.tsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Import useRouter
content = content.replace(
    "import { createPortal } from 'react-dom';",
    "import { createPortal } from 'react-dom';\nimport { useRouter } from 'next/navigation';"
)

# 2. Add router to component
content = content.replace(
    "const inputRef = useRef<HTMLInputElement>(null);",
    "const inputRef = useRef<HTMLInputElement>(null);\n  const router = useRouter();"
)

# 3. Replace the Empty State with Quick Links
quick_links_jsx = """
            <div className="space-y-6">
              <div>
                <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3 px-2">Quick Navigation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { name: 'Customer Management', href: '/dashboard/clients' },
                    { name: 'Broadsheet & Repayment', href: '/dashboard/broadsheet' },
                    { name: 'Loan Configurations', href: '/dashboard/loan-terms' },
                    { name: 'Agent Recruitment', href: '/dashboard/invites' },
                    { name: 'Agent Management', href: '/dashboard/agent-management' },
                    { name: 'Role Management', href: '/dashboard/team' },
                    { name: 'Maker/Checker Queue', href: '/dashboard/maker-checker' },
                    { name: 'Finance Reconciliation', href: '/dashboard/reconciliation' },
                    { name: 'Audit Trail Log', href: '/dashboard/audit-logs' },
                    { name: 'Reports', href: '/dashboard/reports' }
                  ].map((route) => (
                    <button 
                      key={route.name}
                      onClick={() => { router.push(route.href); onClose(); }}
                      className="w-full flex items-center justify-between px-3 py-3 hover:bg-emerald-50 rounded-xl group transition-colors text-left border border-transparent hover:border-emerald-100"
                    >
                      <div className="text-slate-700 group-hover:text-emerald-700 text-sm font-medium">{route.name}</div>
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
"""

content = re.sub(
    r'\{\/\* Empty State \*\/\}.*?\(\s*<div className="text-center py-12">.*?</div>\s*\)',
    f'{{/* Quick Links State */}}\n          {!searchQuery ? ({quick_links_jsx})',
    content,
    flags=re.DOTALL
)

with open(path, 'w') as f:
    f.write(content)

print("Done")
