"use client";

import { useState, useMemo } from 'react';
import { Eye } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import Pagination from '@/app/components/ui/Pagination';
import DatePicker from '@/app/components/ui/DatePicker';

export default function AgentManagementPage() {
  const [showFilter, setShowFilter] = useState(false);
  const [filterParams, setFilterParams] = useState({
    search: '',
    dateRange: ''
  });

  const clearFilters = () => {
    setFilterParams({ search: '', dateRange: '' });
  };

  const agentsData = [
    { id: 1, name: 'Adaeze Nwosu', nin: '23598720984', address: '9 Chime Ave, .......... Layout, Enugu', date: '16 Aug 2026', linkedTo: 'Tunde Bakare' },
    { id: 2, name: 'Adaeze Nwosu', nin: '23598720984', address: '9 Chime Ave, .......... Layout, Enugu', date: '16 Aug 2026', linkedTo: 'Tunde Bakare' },
    { id: 3, name: 'Adaeze Nwosu', nin: '23598720984', address: '9 Chime Ave, .......... Layout, Enugu', date: '16 Aug 2026', linkedTo: 'Tunde Bakare' },
    { id: 4, name: 'Adaeze Nwosu', nin: '23598720984', address: '9 Chime Ave, .......... Layout, Enugu', date: '16 Aug 2026', linkedTo: 'Tunde Bakare' },
    { id: 5, name: 'Adaeze Nwosu', nin: '23598720984', address: '9 Chime Ave, .......... Layout, Enugu', date: '16 Aug 2026', linkedTo: 'Tunde Bakare' },
    { id: 6, name: 'Adaeze Nwosu', nin: '23598720984', address: '9 Chime Ave, .......... Layout, Enugu', date: '16 Aug 2026', linkedTo: 'Tunde Bakare' },
    { id: 7, name: 'Adaeze Nwosu', nin: '23598720984', address: '9 Chime Ave, .......... Layout, Enugu', date: '16 Aug 2026', linkedTo: 'Tunde Bakare' },
    { id: 8, name: 'Adaeze Nwosu', nin: '23598720984', address: '9 Chime Ave, .......... Layout, Enugu', date: '16 Aug 2026', linkedTo: 'Tunde Bakare' },
  ];

  const filteredAgents = useMemo(() => {
    let result = agentsData;
    
    if (filterParams.search) {
      const lower = filterParams.search.toLowerCase();
      result = result.filter(agent => 
        agent.name.toLowerCase().includes(lower) || 
        agent.nin.includes(lower) ||
        agent.linkedTo.toLowerCase().includes(lower)
      );
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
  }, [filterParams, agentsData]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const paginatedAgents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredAgents.slice(start, end);
  }, [filteredAgents, currentPage, itemsPerPage]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  const openModal = (agent: any) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-end gap-3 relative">
        <span className="text-sm text-slate-400 mr-2">Showing {filteredAgents.length} of {agentsData.length} agents</span>
        
        {/* Filter Button */}
        <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          Filter
        </button>

        {/* Filter Dropdown */}
        {showFilter && (
          <div className="absolute top-10 right-40 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Filter Agents</h3>
            
            <div className="space-y-3 mb-4">
              <input 
                value={filterParams.search}
                onChange={(e) => setFilterParams({ ...filterParams, search: e.target.value })}
                type="text" 
                placeholder="Search by name, NIN or linked agent..." 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" 
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

        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
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
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Linked To</th>
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAgents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No agents match your filter criteria.</td>
                </tr>
              )}
              {paginatedAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900">{agent.name}</td>
                  <td className="px-6 py-4 text-slate-600">{agent.nin}</td>
                  <td className="px-6 py-4 text-slate-600">{agent.address}</td>
                  <td className="px-6 py-4 text-slate-600">{agent.date}</td>
                  <td className="px-6 py-4 text-slate-900 font-medium">{agent.linkedTo}</td>
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

      {/* Agent Details Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agent Details">
        {selectedAgent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Name</span>
                <span className="text-sm text-slate-900 font-medium">{selectedAgent.name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">NIN</span>
                <span className="text-sm text-slate-900">{selectedAgent.nin}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Address</span>
                <span className="text-sm text-slate-900">{selectedAgent.address}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Date Onboarded</span>
                <span className="text-sm text-slate-900">{selectedAgent.date}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Linked To</span>
                <span className="text-sm text-slate-900">{selectedAgent.linkedTo}</span>
              </div>
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors rounded-lg text-sm font-medium">Close</button>
        </div>
      </Modal>
    </div>
  );
}
