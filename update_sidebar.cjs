const fs = require('fs');

let layout = fs.readFileSync('app/dashboard/layout.tsx', 'utf8');

layout = layout.replace(
  /import \{ (.*?) \} from 'lucide-react';/,
  "import { Monitor, Moon, Sun, Folder, UserPlus, Users, User, LineChart, UserCog, ClipboardList, Scale, ShieldCheck, Settings } from 'lucide-react';"
);

const navStart = layout.indexOf('<nav className="space-y-2">') + '<nav className="space-y-2">'.length;
const navEnd = layout.indexOf('</nav>');

const newNavContent = `
            <Link href="/dashboard/broadsheet"
              className={\`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group \${
                pathname.startsWith('/dashboard/broadsheet') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }\`}
              title={isSidebarMinimized ? 'Broadsheet and Repayment' : ''}
            >
              <Folder className="w-5 h-5 shrink-0 transition-colors" />
              {!isSidebarMinimized && <span className="whitespace-nowrap">Broadsheet and Repayment</span>}
            </Link>
            
            <Link href="/dashboard/agent-recruitment"
              className={\`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group \${
                pathname.startsWith('/dashboard/agent-recruitment') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
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

            <Link href="/dashboard/clients"
              className={\`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group \${
                pathname.startsWith('/dashboard/client') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
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

            <Link href="/dashboard/team"
              className={\`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group \${
                pathname.startsWith('/dashboard/team') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }\`}
              title={isSidebarMinimized ? 'Role management' : ''}
            >
              <UserCog className="w-5 h-5 shrink-0 transition-colors" />
              {!isSidebarMinimized && <span className="whitespace-nowrap">Role management</span>}
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

            <Link href="/dashboard/loan-terms"
              className={\`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group \${
                pathname.startsWith('/dashboard/loan-terms') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }\`}
              title={isSidebarMinimized ? 'Loan Configurations' : ''}
            >
              <Settings className="w-5 h-5 shrink-0 transition-colors" />
              {!isSidebarMinimized && <span className="whitespace-nowrap">Loan Configurations</span>}
            </Link>
`;

layout = layout.substring(0, navStart) + newNavContent + layout.substring(navEnd);

fs.writeFileSync('app/dashboard/layout.tsx', layout);
