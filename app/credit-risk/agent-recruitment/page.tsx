"use client";

import { useState, useMemo } from 'react';
import { Eye } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import Pagination from '@/app/components/ui/Pagination';
import Select from '@/app/components/ui/Select';
import DatePicker from '@/app/components/ui/DatePicker';
import { useToast } from '@/app/composables/useToast';
import { createPortal } from 'react-dom';

export default function AgentRecruitmentPage() {
  const [showFilter, setShowFilter] = useState(false);
  const [filterParams, setFilterParams] = useState({
    search: '',
    status: '',
    dateRange: ''
  });

  const clearFilters = () => {
    setFilterParams({ search: '', status: '', dateRange: '' });
  };

  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const { addToast } = useToast();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [pendingAction, setPendingAction] = useState('');

  const [agentsData, setAgentsData] = useState([
    { id: 1, name: 'Adaeze Nwosu', nin: '23598720984', address: '9 Chime Ave, New Haven Layout, Enugu', date: '16 Aug 2026', status: 'Recommend', phone: '08031234821', bvn: '123456784821', gender: 'Female' },
    { id: 2, name: 'Chukwuemeka Ibe', nin: '12345678901', address: '14 Adeniran Ogunsanya St, Surulere, Lagos', date: '30 Jul 2026', status: 'Recommend', phone: '08123456789', bvn: '987654321012', gender: 'Male' },
    { id: 3, name: 'Fatima Bello', nin: '87654321098', address: '22 Gwarinpa Estate, Abuja', date: '12 Aug 2026', status: 'Recommend', phone: '07087654321', bvn: '345678901234', gender: 'Female' },
    { id: 4, name: 'Oluwaseun Adeyemi', nin: '34567890123', address: '5 Allen Avenue, Ikeja, Lagos', date: '05 Aug 2026', status: 'Recommend', phone: '09012345678', bvn: '567890123456', gender: 'Male' },
    { id: 5, name: 'Ngozi Okoro', nin: '56789012345', address: '18 Wetheral Road, Owerri, Imo', date: '22 Jul 2026', status: 'Recommend', phone: '08098765432', bvn: '789012345678', gender: 'Female' },
    { id: 6, name: 'Ibrahim Musa', nin: '90123456789', address: '10 Ahmadu Bello Way, Kaduna', date: '18 Aug 2026', status: 'Recommend', phone: '08134567890', bvn: '901234567890', gender: 'Male' },
    { id: 7, name: 'Aisha Suleiman', nin: '23456789012', address: '7 Zoo Road, Kano', date: '01 Aug 2026', status: 'Recommend', phone: '07023456789', bvn: '123450987654', gender: 'Female' },
    { id: 8, name: 'Tunde Bakare', nin: '67890123456', address: '3 Ring Road, Ibadan, Oyo', date: '15 Jul 2026', status: 'Recommend', phone: '08045678901', bvn: '345671234567', gender: 'Male' },
  ]);

  const filteredAgents = useMemo(() => {
    let result = agentsData;
    
    if (filterParams.search) {
      const lower = filterParams.search.toLowerCase();
      result = result.filter(agent => 
        agent.name.toLowerCase().includes(lower) || 
        agent.nin.includes(lower)
      );
    }
    
    if (filterParams.status) {
      result = result.filter(agent => agent.status === filterParams.status);
    }
    
    if (filterParams.dateRange) {
      const dates = filterParams.dateRange.split(' to ');
      if (dates.length > 0) {
        const start = new Date(dates[0]).getTime();
        const end = dates.length === 2 ? new Date(dates[1]).getTime() : start;
        result = result.filter(agent => {
          const itemDate = new Date(agent.date).getTime();
          return itemDate >= start && itemDate <= end;
        });
      }
    }
    
    return result;
  }, [agentsData, filterParams]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const paginatedAgents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredAgents.slice(start, end);
  }, [filteredAgents, currentPage, itemsPerPage]);

  const openModal = (agent: any) => {
    setSelectedAgent(agent);
  };

  const closeModal = () => {
    setSelectedAgent(null);
  };

  const handleExportExcel = () => {
    addToast('Exporting agents to Excel...', 'success');
    const content = `Mock Agent Export\nGenerated on ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agents_export.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDocDownload = (docName: string) => {
    if (!selectedAgent) return;
    addToast(`Downloading ${docName} for ${selectedAgent.name}`, 'success');
    const content = `Mock Document: ${docName}\nFor: ${selectedAgent.name}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docName}_${selectedAgent.name.replace(' ', '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleRecommend = () => {
    setConfirmTitle('Recommend Application');
    setConfirmMessage('Are you sure you want to recommend this application to Internal Control?');
    setPendingAction('Recommend');
    setShowConfirmModal(true);
  };

  const handleReject = () => {
    setConfirmTitle('Reject Application');
    setConfirmMessage('Are you sure you want to reject this application? This action cannot be undone.');
    setPendingAction('Reject');
    setShowConfirmModal(true);
  };

  const executeAction = () => {
    if (pendingAction === 'Recommend') {
      addToast(`Agent ${selectedAgent.name} has been recommended!`, 'success');
      const index = agentsData.findIndex(a => a.id === selectedAgent.id);
      if(index !== -1) {
        const newData = [...agentsData];
        newData[index].status = 'Approved';
        setAgentsData(newData);
      }
    } else if (pendingAction === 'Reject') {
      addToast(`Agent ${selectedAgent.name} has been rejected.`, 'warning');
      const index = agentsData.findIndex(a => a.id === selectedAgent.id);
      if(index !== -1) {
        const newData = [...agentsData];
        newData[index].status = 'Rejected';
        setAgentsData(newData);
      }
    }
    setShowConfirmModal(false);
    closeModal();
  };

  return (
    <div className="space-y-6 relative h-full">
      {/* Actions */}
      <div className="flex items-center justify-end gap-3 relative">
        <span className="text-sm text-slate-400 mr-2">Showing {filteredAgents.length} of {agentsData.length}</span>
        
        {/* Filter Button */}
        <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          Filter
        </button>

        {/* Filter Dropdown */}
        {showFilter && (
          <div className="absolute top-10 right-36 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Filter Agents</h3>
            
            <div className="space-y-3 mb-4">
              <input 
                value={filterParams.search}
                onChange={(e) => setFilterParams({ ...filterParams, search: e.target.value })}
                type="text" 
                placeholder="Search by name or NIN..." 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" 
              />
              
              <Select 
                value={filterParams.status}
                onChange={(val) => setFilterParams({ ...filterParams, status: val as any })}
                placeholder="All Statuses"
                options={[{label: 'All Statuses', value: ''}, {label: 'Recommend', value: 'Recommend'}, {label: 'Approved', value: 'Approved'}, {label: 'Rejected', value: 'Rejected'}]} 
              />
              
              <DatePicker 
                value={filterParams.dateRange}
                onChange={(val) => setFilterParams({ ...filterParams, dateRange: val as any })}
                placeholder="Select date range"
              />
            </div>
            
            <div className="flex gap-2">
              <button onClick={clearFilters} className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors">Clear</button>
              <button onClick={() => setShowFilter(false)} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Apply Filter</button>
            </div>
          </div>
        )}

        {/* Export Button */}
        <button onClick={handleExportExcel} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Export as Excel (.xlsx)
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
          <h3 className="text-[13px] text-slate-500 font-medium mb-2">Agents pending full approval</h3>
          <div className="text-3xl font-bold text-emerald-600 mb-1">31</div>
          <p className="text-[11px] text-slate-400">needs PS Lead + IC</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
          <h3 className="text-[13px] text-slate-500 font-medium mb-2">Customers onboarded</h3>
          <div className="text-3xl font-bold text-emerald-600 mb-1">31</div>
          <p className="text-[11px] text-slate-400">this month</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
          <h3 className="text-[13px] text-slate-500 font-medium mb-2">Active agents</h3>
          <div className="text-3xl font-bold text-emerald-600 mb-1">31</div>
          <p className="text-[11px] text-slate-400">in Public Sector network</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#EAF5F0]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Name</th>
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">NIN</th>
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Address</th>
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Date</th>
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Status</th>
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAgents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No agents match your filter criteria.</td>
                </tr>
              )}
              {paginatedAgents.map((agent: any) => (
                <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900">{agent.name}</td>
                  <td className="px-6 py-4 text-slate-600">{agent.nin}</td>
                  <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">{agent.address}</td>
                  <td className="px-6 py-4 text-slate-600">{agent.date}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border border-emerald-200 text-emerald-600 bg-white">
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => openModal(agent)} className="font-medium text-slate-400 hover:text-emerald-600 transition-colors" title="View Details">
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      <Pagination 
        totalItems={filteredAgents.length} 
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Modal */}
      {selectedAgent && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal}></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">{selectedAgent.name}</h2>
                  <p className="text-[13px] text-slate-500 mt-1">{selectedAgent.date}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[11px] text-slate-400 mb-1">Name</p>
                  <p className="text-[15px] font-semibold text-slate-900">{selectedAgent.name}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[11px] text-slate-400 mb-1">Phone</p>
                  <p className="text-[15px] font-semibold text-slate-900">{selectedAgent.phone}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[11px] text-slate-400 mb-1">Bvn</p>
                  <p className="text-[15px] font-semibold text-slate-900">{selectedAgent.bvn}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[11px] text-slate-400 mb-1">Nin</p>
                  <p className="text-[15px] font-semibold text-slate-900">{selectedAgent.nin}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[11px] text-slate-400 mb-1">Gender</p>
                  <p className="text-[15px] font-semibold text-slate-900">{selectedAgent.gender}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[11px] text-slate-400 mb-1">Nationality</p>
                  <p className="text-[15px] font-semibold text-slate-900">Nigerian</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 col-span-2">
                  <p className="text-[11px] text-slate-400 mb-1">Address</p>
                  <p className="text-[15px] font-semibold text-slate-900">{selectedAgent.address}</p>
                </div>
              </div>

              {/* Documents */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 relative group overflow-hidden">
                  <div className="w-full h-40 bg-slate-200 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
                    {/* Fake document image */}
                    <div className="w-[80%] h-[90%] bg-white shadow-sm border border-slate-300 p-2 text-[4px] text-slate-300 leading-tight">
                      <div className="font-bold text-slate-800 text-[6px] mb-2 text-center uppercase tracking-widest">{selectedAgent.name}</div>
                      <div className="w-full h-[1px] bg-slate-200 mb-2"></div>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => handleDocDownload('Resume')} className="bg-white/90 backdrop-blur border border-slate-200 rounded-lg px-4 py-2 text-xs font-medium text-slate-700 flex items-center gap-2 shadow-sm hover:bg-slate-50">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Download
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Resume.pdf</h4>
                  <p className="text-[11px] text-slate-400">3MB &bull; 1 Page</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 relative group overflow-hidden">
                  <div className="w-full h-40 bg-slate-200 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
                    {/* Fake document image */}
                    <div className="w-[80%] h-[90%] bg-white shadow-sm border border-slate-300 p-2 text-[4px] text-slate-300 leading-tight">
                      <div className="font-bold text-slate-800 text-[6px] mb-2 text-center uppercase tracking-widest">{selectedAgent.name}</div>
                      <div className="w-full h-[1px] bg-slate-200 mb-2"></div>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => handleDocDownload('ID_Card')} className="bg-white/90 backdrop-blur border border-slate-200 rounded-lg px-4 py-2 text-xs font-medium text-slate-700 flex items-center gap-2 shadow-sm hover:bg-slate-50">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Download
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">ID_Card.pdf</h4>
                  <p className="text-[11px] text-slate-400">1.2MB &bull; 1 Page</p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button onClick={handleReject} className="px-6 py-3 rounded-xl border border-emerald-500 text-emerald-600 font-medium hover:bg-emerald-50 transition-colors w-32 shrink-0">
                  Reject
                </button>
                <button onClick={handleRecommend} className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors">
                  Recommend
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title={confirmTitle} onConfirm={executeAction}>
        <p className="text-sm">{confirmMessage}</p>
      </Modal>
    </div>
  );
}
