const fs = require('fs');

const path = 'app/dashboard/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add ChevronDown to lucide-react import
content = content.replace(/import { Monitor, Moon, Sun, Folder, UserPlus, Users, User, LineChart, UserCog, ClipboardList, Scale, ShieldCheck, Settings, Banknote } from 'lucide-react';/, 
"import { Monitor, Moon, Sun, Folder, UserPlus, Users, User, LineChart, UserCog, ClipboardList, Scale, ShieldCheck, Settings, Banknote, ChevronDown } from 'lucide-react';");

// Add state for open groups
const stateToAdd = `
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    loans: true,
    agents: true,
    system: false
  });

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };
`;

content = content.replace(/const \[isSidebarMinimized, setIsSidebarMinimized\] = useState\(false\);/, `${stateToAdd}\n  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);`);

// Replace the nav section
const navSection = `
          <nav className="space-y-1">
            {/* LOANS GROUP */}
            <div className="space-y-1">
              <button
                onClick={() => !isSidebarMinimized && toggleGroup('loans')}
                className={\`w-full flex items-center justify-between px-4 py-2 text-sm font-semibold text-slate-500 uppercase tracking-wider hover:bg-slate-50 rounded-lg transition-colors \${isSidebarMinimized ? 'justify-center' : ''}\`}
                title={isSidebarMinimized ? 'Loans' : ''}
              >
                <span className={\`flex items-center gap-3 \${isSidebarMinimized ? 'hidden' : ''}\`}>Loans</span>
                {!isSidebarMinimized && (
                  <ChevronDown className={\`w-4 h-4 transition-transform \${openGroups.loans ? 'rotate-180' : ''}\`} />
                )}
                {isSidebarMinimized && <Banknote className="w-5 h-5 shrink-0 transition-colors" />}
              </button>
              
              <div className={\`space-y-1 \${!isSidebarMinimized && !openGroups.loans ? 'hidden' : ''}\`}>
                <Link href="/dashboard/broadsheet"
                  className={\`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group \${
                    pathname.startsWith('/dashboard/broadsheet') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }\`}
                  title={isSidebarMinimized ? 'Broadsheet and Repayment' : ''}
                >
                  <Folder className="w-5 h-5 shrink-0 transition-colors" />
                  {!isSidebarMinimized && <span className="whitespace-nowrap">Broadsheet & Repayment</span>}
                </Link>
                <Link href="/dashboard/client-loans"
                  className={\`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group \${
                    pathname.startsWith('/dashboard/client-loans') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }\`}
                  title={isSidebarMinimized ? 'Client Loans' : ''}
                >
                  <Banknote className="w-5 h-5 shrink-0 transition-colors" />
                  {!isSidebarMinimized && <span className="whitespace-nowrap">Client Loans</span>}
                </Link>
                <Link href="/dashboard/loan-terms"
                  className={\`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group \${
                    pathname.startsWith('/dashboard/loan-terms') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }\`}
                  title={isSidebarMinimized ? 'Loan Configurations' : ''}
                >
                  <Settings className="w-5 h-5 shrink-0 transition-colors" />
                  {!isSidebarMinimized && <span className="whitespace-nowrap">Loan Configurations</span>}
                </Link>
              </div>
            </div>

            {/* AGENTS GROUP */}
            <div className="space-y-1 mt-4">
              <button
                onClick={() => !isSidebarMinimized && toggleGroup('agents')}
                className={\`w-full flex items-center justify-between px-4 py-2 text-sm font-semibold text-slate-500 uppercase tracking-wider hover:bg-slate-50 rounded-lg transition-colors \${isSidebarMinimized ? 'justify-center' : ''}\`}
                title={isSidebarMinimized ? 'Agents' : ''}
              >
                <span className={\`flex items-center gap-3 \${isSidebarMinimized ? 'hidden' : ''}\`}>Agents</span>
                {!isSidebarMinimized && (
                  <ChevronDown className={\`w-4 h-4 transition-transform \${openGroups.agents ? 'rotate-180' : ''}\`} />
                )}
                {isSidebarMinimized && <Users className="w-5 h-5 shrink-0 transition-colors" />}
              </button>
              
              <div className={\`space-y-1 \${!isSidebarMinimized && !openGroups.agents ? 'hidden' : ''}\`}>
                <Link href="/dashboard/invites"
                  className={\`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group \${
                    pathname.startsWith('/dashboard/invites') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }\`}
                  title={isSidebarMinimized ? 'Agent Recruitment' : ''}
                >
                  <UserPlus className="w-5 h-5 shrink-0 transition-colors" />
                  {!isSidebarMinimized && <span className="whitespace-nowrap">Agent Recruitment</span>}
                </Link>
                <Link href="/dashboard/agent-management"
                  className={\`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group \${
                    pathname.startsWith('/dashboard/agent-management') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }\`}
                  title={isSidebarMinimized ? 'Agent Management' : ''}
                >
                  <Users className="w-5 h-5 shrink-0 transition-colors" />
                  {!isSidebarMinimized && <span className="whitespace-nowrap">Agent Management</span>}
                </Link>
              </div>
            </div>

            {/* STANDALONE */}
            <div className="pt-4 pb-2">
              <Link href="/dashboard/clients"
                className={\`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group \${
                  pathname.startsWith('/dashboard/clients') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }\`}
                title={isSidebarMinimized ? 'Customer Management' : ''}
              >
                <User className="w-5 h-5 shrink-0 transition-colors" />
                {!isSidebarMinimized && <span className="whitespace-nowrap">Customer Management</span>}
              </Link>
              <Link href="/dashboard/reports"
                className={\`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group \${
                  pathname.startsWith('/dashboard/reports') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }\`}
                title={isSidebarMinimized ? 'Report' : ''}
              >
                <LineChart className="w-5 h-5 shrink-0 transition-colors" />
                {!isSidebarMinimized && <span className="whitespace-nowrap">Report</span>}
              </Link>
            </div>

            {/* SYSTEM & ADMIN GROUP */}
            <div className="space-y-1">
              <button
                onClick={() => !isSidebarMinimized && toggleGroup('system')}
                className={\`w-full flex items-center justify-between px-4 py-2 text-sm font-semibold text-slate-500 uppercase tracking-wider hover:bg-slate-50 rounded-lg transition-colors \${isSidebarMinimized ? 'justify-center' : ''}\`}
                title={isSidebarMinimized ? 'System & Admin' : ''}
              >
                <span className={\`flex items-center gap-3 \${isSidebarMinimized ? 'hidden' : ''}\`}>System & Admin</span>
                {!isSidebarMinimized && (
                  <ChevronDown className={\`w-4 h-4 transition-transform \${openGroups.system ? 'rotate-180' : ''}\`} />
                )}
                {isSidebarMinimized && <ShieldCheck className="w-5 h-5 shrink-0 transition-colors" />}
              </button>
              
              <div className={\`space-y-1 \${!isSidebarMinimized && !openGroups.system ? 'hidden' : ''}\`}>
                <Link href="/dashboard/team"
                  className={\`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group \${
                    pathname.startsWith('/dashboard/team') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }\`}
                  title={isSidebarMinimized ? 'Role management' : ''}
                >
                  <UserCog className="w-5 h-5 shrink-0 transition-colors" />
                  {!isSidebarMinimized && <span className="whitespace-nowrap">Role Management</span>}
                </Link>
                <Link href="/dashboard/maker-checker"
                  className={\`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group \${
                    pathname.startsWith('/dashboard/maker-checker') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }\`}
                  title={isSidebarMinimized ? 'Maker/Checker Queue' : ''}
                >
                  <ClipboardList className="w-5 h-5 shrink-0 transition-colors" />
                  {!isSidebarMinimized && <span className="whitespace-nowrap">Maker/Checker Queue</span>}
                </Link>
                <Link href="/dashboard/reconciliation"
                  className={\`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group \${
                    pathname.startsWith('/dashboard/reconciliation') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }\`}
                  title={isSidebarMinimized ? 'Finance Reconciliation' : ''}
                >
                  <Scale className="w-5 h-5 shrink-0 transition-colors" />
                  {!isSidebarMinimized && <span className="whitespace-nowrap">Finance Reconciliation</span>}
                </Link>
                <Link href="/dashboard/audit-logs"
                  className={\`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group \${
                    pathname.startsWith('/dashboard/audit-logs') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }\`}
                  title={isSidebarMinimized ? 'Audit Trail Log' : ''}
                >
                  <ShieldCheck className="w-5 h-5 shrink-0 transition-colors" />
                  {!isSidebarMinimized && <span className="whitespace-nowrap">Audit Trail Log</span>}
                </Link>
              </div>
            </div>
          </nav>`;

content = content.replace(/<nav className="space-y-2">[\s\S]*?<\/nav>/, navSection);

fs.writeFileSync(path, content, 'utf8');
console.log('Layout updated.');
