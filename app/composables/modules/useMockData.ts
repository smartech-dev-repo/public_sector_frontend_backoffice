export const useMockData = () => {
 const adminProfile = {
 name: 'Sarah Admin',
 role: 'Internal Control Manager',
 email: 'sarah.control@example.com'
 };

 const agentApplications = [
 {
 id: 'APP-1001',
 name: 'Emmanuel Doe',
 status: 'Pending Review',
 dateSubmitted: '2026-08-25',
 bvn: '12345678901',
 nin: '09876543210',
 phone: '+2348000000001',
 documents: [
 { name: 'Curriculum Vitae', type: 'PDF', status: 'Uploaded' },
 { name: 'Passport Photograph', type: 'JPG', status: 'Uploaded' }
 ]
 },
 {
 id: 'APP-1002',
 name: 'Aisha Bello',
 status: 'Approved',
 dateSubmitted: '2026-08-20',
 bvn: '11223344556',
 nin: '99887766554',
 phone: '+2348000000002',
 documents: [
 { name: 'Curriculum Vitae', type: 'PDF', status: 'Verified' },
 { name: 'Passport Photograph', type: 'JPG', status: 'Verified' }
 ]
 },
 {
 id: 'APP-1003',
 name: 'Chidi Okafor',
 status: 'Pending Review',
 dateSubmitted: '2026-08-26',
 bvn: '55667788990',
 nin: '33445566778',
 phone: '+2348000000003',
 documents: [
 { name: 'Curriculum Vitae', type: 'PDF', status: 'Uploaded' },
 { name: 'Passport Photograph', type: 'JPG', status: 'Missing' }
 ]
 }
 ];

 const teamMembers = [
 {
 id: 'OFF-2001',
 name: 'James Ogbonna',
 role: 'Public Sector Officer',
 status: 'Active',
 target: 50,
 achieved: 32,
 lastActive: '2026-08-27T09:15:00Z'
 },
 {
 id: 'AGT-3042',
 name: 'Mercy Johnson',
 role: 'Certified Agent',
 status: 'Active',
 target: 100,
 achieved: 89,
 lastActive: '2026-08-27T10:30:00Z'
 },
 {
 id: 'OFF-2002',
 name: 'David Adeleke',
 role: 'Public Sector Officer',
 status: 'Inactive',
 target: 40,
 achieved: 0,
 lastActive: '2026-08-01T14:20:00Z'
 }
 ];

 const analyticsStats = {
 totalLoansOriginated: 1245,
 totalVolume: 620500000,
 averageTurnaround: '4.2 hrs',
 activeAgents: 142
 };

 const reconciliationRecords = [
 { id: 'REC-001', loanId: 'L-8930', customer: 'Emmanuel Doe', amount: 500000, portalStatus: 'Approved', cbaStatus: 'Disbursed', matchStatus: 'Matched', date: '2026-09-14' },
 { id: 'REC-002', loanId: 'L-8931', customer: 'Aisha Bello', amount: 1200000, portalStatus: 'Approved', cbaStatus: 'Pending', matchStatus: 'Unmatched', date: '2026-09-14' },
 { id: 'REC-003', loanId: 'L-8932', customer: 'Chidi Okafor', amount: 750000, portalStatus: 'Approved', cbaStatus: 'Reversed', matchStatus: 'Reversed', date: '2026-09-14' }
 ];

 const exceptions = [
 { id: 'EXC-101', type: 'AML Hit', reference: 'APP-1004', severity: 'High', status: 'Open', assignedTo: 'Risk & Compliance', date: '2026-09-14T08:30:00Z' },
 { id: 'EXC-102', type: 'Duplicate Identity', reference: 'CUS-5092', severity: 'High', status: 'Open', assignedTo: 'Internal Control', date: '2026-09-14T09:15:00Z' },
 { id: 'EXC-103', type: 'KYC Failure', reference: 'APP-1005', severity: 'Medium', status: 'Resolved', assignedTo: 'Operations', date: '2026-09-13T14:20:00Z' }
 ];

 const auditLogs = [
 { id: 'LOG-9901', timestamp: '2026-09-14T10:05:22Z', actor: 'Sarah Admin (Internal Control)', action: 'Agent Suspended', target: 'AGT-3042', reason: 'Customer complaint investigation' },
 { id: 'LOG-9902', timestamp: '2026-09-14T09:42:10Z', actor: 'System (Rules Engine)', action: 'Loan Auto-Approved', target: 'L-8930', reason: 'Within N2m threshold' },
 { id: 'LOG-9903', timestamp: '2026-09-13T16:15:00Z', actor: 'James Ogbonna (Team Lead)', action: 'Maker Review Complete', target: 'APP-1001', reason: 'Recommended for activation' }
 ];

 return {
 adminProfile,
 agentApplications,
 teamMembers,
 analyticsStats,
 reconciliationRecords,
 exceptions,
 auditLogs
 };
};
