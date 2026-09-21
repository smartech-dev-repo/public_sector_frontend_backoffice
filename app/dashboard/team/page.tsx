"use client";

import { useEffect, useState, useMemo } from 'react';
import PulseLoader from '@/app/components/ui/PulseLoader';
import Pagination from '@/app/components/ui/Pagination';
import Modal from '@/app/components/ui/Modal';
import Input from '@/app/components/ui/Input';
import TableDropdown from '@/app/components/ui/TableDropdown';
import { useMockData } from '@/app/composables/modules/useMockData';
import { useToast } from '@/app/composables/useToast';
import { createPortal } from 'react-dom';

export default function TeamPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const { teamMembers } = useMockData();
  const { addToast } = useToast();

  const [teamMembersList, setTeamMembersList] = useState(teamMembers);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const paginatedTeam = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return teamMembersList.slice(start, end);
  }, [currentPage, itemsPerPage, teamMembersList]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [pendingMember, setPendingMember] = useState<any>(null);
  const [newTargetValue, setNewTargetValue] = useState(0);

  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [memberToRevoke, setMemberToRevoke] = useState<any>(null);

  const confirmRevokeAccess = (member: any) => {
    setMemberToRevoke(member);
    setShowRevokeModal(true);
  };

  const executeRevokeAccess = () => {
    if (memberToRevoke) {
      setTeamMembersList(prev => prev.map(m => m.id === memberToRevoke.id ? { ...m, status: 'Inactive' } : m));
      addToast(`${memberToRevoke.name}'s access has been successfully revoked.`, 'warning');
    }
    setShowRevokeModal(false);
  };

  const editTarget = (member: any) => {
    setPendingMember(member);
    setNewTargetValue(member.target);
    setShowTargetModal(true);
  };

  const saveTarget = () => {
    if (pendingMember && !isNaN(newTargetValue) && newTargetValue > 0) {
      setTeamMembersList(prev => prev.map(m => m.id === pendingMember.id ? { ...m, target: parseInt(newTargetValue as any, 10) } : m));
      addToast(`Target for ${pendingMember.name} updated successfully.`, 'success');
    } else {
      addToast('Invalid target value.', 'error');
    }
    setShowTargetModal(false);
    setPendingMember(null);
  };

  const createOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Officer created! Secure welcome email has been sent.', 'success');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="py-20">
          <PulseLoader />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-5 rounded-lg transition-all flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              Create Officer
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th scope="col" className="px-6 py-4 tracking-wider">Name / ID</th>
                    <th scope="col" className="px-6 py-4 tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-4 tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 tracking-wider">Performance (Target)</th>
                    <th scope="col" className="px-6 py-4 tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTeam.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No members found.</td>
                    </tr>
                  )}
                  {paginatedTeam.map(member => (
                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-slate-800">{member.name}</div>
                        <div className="text-xs font-mono text-slate-500">{member.id}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{member.role}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap ${member.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-slate-100 rounded-full h-2 max-w-[120px]">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(member.achieved / member.target) * 100}%` }}></div>
                          </div>
                          <span className="text-xs text-slate-600">{member.achieved} / {member.target}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end">
                          <TableDropdown>
                            <button onClick={() => editTarget(member)} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                              Set Target
                            </button>
                            <button onClick={() => confirmRevokeAccess(member)} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
                              Revoke Access
                            </button>
                          </TableDropdown>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination 
            totalItems={teamMembersList.length} 
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />

          {/* Create Officer Modal */}
          {showAddModal && typeof document !== 'undefined' && createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-xl text-slate-800 mb-2">Create New Officer</h3>
                <p className="text-sm text-slate-500 mb-6">A secure welcome email and time-limited access link will be sent.</p>
                
                <form onSubmit={createOfficer} className="space-y-4">
                  <Input label="Full Name" placeholder="e.g. John Doe" required />
                  <Input label="Email Address" type="email" placeholder="e.g. john@bank.com" required />
                  <Input label="Initial Target (Monthly)" type="number" defaultValue={50} required />
                  
                  <div className="flex gap-3 mt-8">
                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors">
                      Send Invite
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}

          {/* Edit Target Modal */}
          <Modal isOpen={showTargetModal} onClose={() => setShowTargetModal(false)} title="Set New Target" onConfirm={saveTarget}>
            <div className="space-y-4">
              <p className="text-sm">Set a new monthly target for <strong>{pendingMember?.name}</strong>.</p>
              <Input label="New Target" type="number" value={newTargetValue} onChange={setNewTargetValue as any} />
            </div>
          </Modal>

          {/* Revoke Access Confirmation Modal */}
          <Modal isOpen={showRevokeModal} onClose={() => setShowRevokeModal(false)} title="Confirm Revocation" onConfirm={executeRevokeAccess}>
            <p className="text-sm">Are you sure you want to revoke platform access for <strong>{memberToRevoke?.name}</strong>? They will be immediately disconnected.</p>
          </Modal>
        </div>
      )}
    </div>
  );
}
