"use client";

import { useState, useMemo } from 'react';
import { Eye } from 'lucide-react';
import Pagination from '@/app/components/ui/Pagination';
import Select from '@/app/components/ui/Select';
import DatePicker from '@/app/components/ui/DatePicker';
import AuthInput from '@/app/components/Auth/Input';
import { createPortal } from 'react-dom';

export default function RoleManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterParams, setFilterParams] = useState({
    search: '',
    department: '',
    dateRange: ''
  });

  const clearFilters = () => {
    setFilterParams({ search: '', department: '', dateRange: '' });
  };

  const rolesData = [
    { id: 1, name: 'Adaeze Nwosu', department: 'Credit and Risk', email: 'a.nwosu@moneyfieldmfb.com', date: '16 Aug 2026', role: 'Credit Risk' },
    { id: 2, name: 'Adaeze Nwosu', department: 'Public Sector', email: 'a.nwosu@moneyfieldmfb.com', date: '16 Aug 2026', role: 'Back Office' },
    { id: 3, name: 'Adaeze Nwosu', department: 'Credit and Risk', email: 'a.nwosu@moneyfieldmfb.com', date: '16 Aug 2026', role: 'Credit Risk' },
    { id: 4, name: 'Adaeze Nwosu', department: 'Credit and Risk', email: 'a.nwosu@moneyfieldmfb.com', date: '16 Aug 2026', role: 'Credit Risk' },
    { id: 5, name: 'Adaeze Nwosu', department: 'Credit and Risk', email: 'a.nwosu@moneyfieldmfb.com', date: '16 Aug 2026', role: 'Credit Risk' },
    { id: 6, name: 'Adaeze Nwosu', department: 'Credit and Risk', email: 'a.nwosu@moneyfieldmfb.com', date: '16 Aug 2026', role: 'Credit Risk' },
    { id: 7, name: 'Adaeze Nwosu', department: 'Credit and Risk', email: 'a.nwosu@moneyfieldmfb.com', date: '16 Aug 2026', role: 'Credit Risk' },
    { id: 8, name: 'Adaeze Nwosu', department: 'Credit and Risk', email: 'a.nwosu@moneyfieldmfb.com', date: '16 Aug 2026', role: 'Credit Risk' },
  ];

  const filteredRoles = useMemo(() => {
    let result = rolesData;
    
    if (filterParams.search) {
      const lower = filterParams.search.toLowerCase();
      result = result.filter(r => 
        r.name.toLowerCase().includes(lower) || 
        r.role.toLowerCase().includes(lower) ||
        r.email.toLowerCase().includes(lower)
      );
    }
    
    if (filterParams.department) {
      result = result.filter(r => r.department === filterParams.department);
    }
    
    if (filterParams.dateRange) {
      const dates = filterParams.dateRange.split(' to ');
      if (dates.length > 0) {
        const start = new Date(dates[0]).getTime();
        const end = dates.length === 2 ? new Date(dates[1]).getTime() : start;
        result = result.filter(r => {
          const itemDate = new Date(r.date).getTime();
          return itemDate >= start && itemDate <= end;
        });
      }
    }
    
    return result;
  }, [filterParams, rolesData]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredRoles.slice(start, end);
  }, [filteredRoles, currentPage, itemsPerPage]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 relative h-full">
      {/* Actions */}
      <div className="flex items-center justify-end gap-3 relative">
        <span className="text-sm text-slate-400 mr-2">Showing {filteredRoles.length} of {rolesData.length}</span>
        
        {/* Filter Button */}
        <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          Filter
        </button>

        {/* Filter Dropdown */}
        {showFilter && (
          <div className="absolute top-10 right-40 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Filter Roles</h3>
            
            <div className="space-y-3 mb-4">
              <input 
                value={filterParams.search}
                onChange={(e) => setFilterParams({ ...filterParams, search: e.target.value })}
                type="text" 
                placeholder="Search name or role..." 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" 
              />
              
              <Select 
                value={filterParams.department}
                onChange={(val) => setFilterParams({ ...filterParams, department: val as any })}
                placeholder="All Departments"
                options={[{label: 'All Departments', value: ''}, {label: 'Credit and Risk', value: 'Credit and Risk'}, {label: 'Public Sector', value: 'Public Sector'}]} 
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

        <button onClick={openModal} className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm ml-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Invite Member
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#EAF5F0]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Name</th>
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Department</th>
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Email</th>
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Date</th>
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Role</th>
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRoles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No roles match your filter criteria.</td>
                </tr>
              )}
              {paginatedRoles.map((role) => (
                <tr key={role.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900">{role.name}</td>
                  <td className="px-6 py-4 text-slate-600">{role.department}</td>
                  <td className="px-6 py-4 text-slate-600">{role.email}</td>
                  <td className="px-6 py-4 text-slate-600">{role.date}</td>
                  <td className="px-6 py-4 text-slate-900 font-medium">{role.role}</td>
                  <td className="px-6 py-4">
                    <button className="font-medium text-slate-400 hover:text-emerald-600 transition-colors" title="View Details">
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
        totalItems={filteredRoles.length} 
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Invite Modal */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal}></div>
        
        <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-[440px] flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Invite Member</h2>
            
            <div className="space-y-4">
              <AuthInput label="Email" value="w.uzoor@moneyfieldmfb.com" onChange={()=>{}} />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-slate-500 ml-1">Role</label>
                <div className="relative">
                  <select defaultValue="" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm appearance-none cursor-pointer">
                    <option value="" disabled>select</option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                  {/* Custom chevron */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Actions */}
            <div className="flex gap-4 pt-6 mt-2">
              <button onClick={closeModal} className="px-6 py-3 rounded-xl border border-emerald-500 text-emerald-600 font-medium hover:bg-emerald-50 transition-colors shrink-0">
                Cancel
              </button>
              <button onClick={closeModal} className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors">
                Proceed
              </button>
            </div>
          </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
