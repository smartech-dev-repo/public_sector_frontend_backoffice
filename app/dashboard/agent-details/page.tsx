"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import Pagination from '@/app/components/ui/Pagination';
import DatePicker from '@/app/components/ui/DatePicker';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';

export default function AgentDetailsPage() {
  const [showFilter, setShowFilter] = useState(false);
  const [filterParams, setFilterParams] = useState({
    search: '',
    dateRange: ''
  });

  const clearFilters = () => {
    setFilterParams({ search: '', dateRange: '' });
  };

  const loansData = [
    { id: 1, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026' },
    { id: 2, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026' },
    { id: 3, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026' },
    { id: 4, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026' },
    { id: 5, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026' },
    { id: 6, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026' },
    { id: 7, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026' },
    { id: 8, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026' },
  ];

  const filteredLoans = useMemo(() => {
    let result = loansData;
    
    if (filterParams.search) {
      const lower = filterParams.search.toLowerCase();
      result = result.filter(loan => 
        loan.name.toLowerCase().includes(lower) || 
        loan.ippis.includes(lower) ||
        loan.sector.toLowerCase().includes(lower)
      );
    }
    
    if (filterParams.dateRange) {
      const dates = filterParams.dateRange.split(' to ');
      if (dates.length > 0) {
        const start = new Date(dates[0]).getTime();
        const end = dates.length === 2 ? new Date(dates[1]).getTime() : start;
        result = result.filter(loan => {
          const itemDate = new Date(loan.date).getTime();
          return itemDate >= start && itemDate <= end;
        });
      }
    }
    
    return result;
  }, [filterParams, loansData]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const paginatedLoans = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredLoans.slice(start, end);
  }, [filteredLoans, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <div className="text-sm">
        <Link href="/dashboard/agent-management" className="text-slate-400 hover:text-slate-600 transition-colors">Agent management</Link>
        <span className="text-slate-400 mx-2">/</span>
        <span className="text-slate-900 font-medium">Agent details</span>
      </div>

      {/* Agent Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-2">
        <div>
          <p className="text-[12px] text-slate-400 mb-1">Name</p>
          <p className="text-[16px] font-semibold text-slate-900">Chukwuemeka Ibe</p>
        </div>
        <div>
          <p className="text-[12px] text-slate-400 mb-1">Phone</p>
          <p className="text-[16px] font-semibold text-slate-900">08031234821</p>
        </div>
        <div>
          <p className="text-[12px] text-slate-400 mb-1">Bvn</p>
          <p className="text-[16px] font-semibold text-slate-900">123456784821</p>
        </div>
        <div>
          <p className="text-[12px] text-slate-400 mb-1">Nin</p>
          <p className="text-[16px] font-semibold text-slate-900">1234567890</p>
        </div>
        <div>
          <p className="text-[12px] text-slate-400 mb-1">Gender</p>
          <p className="text-[16px] font-semibold text-slate-900">Male</p>
        </div>
        <div>
          <p className="text-[12px] text-slate-400 mb-1">Nationality</p>
          <p className="text-[16px] font-semibold text-slate-900">Nigerian</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-[12px] text-slate-400 mb-1">Address</p>
          <p className="text-[16px] font-semibold text-slate-900">14 Adeniran Ogunsanya St, Surulere, Lagos</p>
          
          {/* Assignee Tag */}
          <div className="mt-4 inline-flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">
              WA
            </div>
            <div className="flex flex-col pr-4">
              <span className="text-[13px] font-medium text-slate-900 leading-tight">Fawwaz Ali-Balogun</span>
              <span className="text-[10px] text-slate-500">f.bakare@moneyfield.ng &nbsp;&bull;&nbsp; 07012345678</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
          <h3 className="text-[13px] text-slate-500 font-medium mb-2">Agents pending full approval</h3>
          <div className="text-3xl font-bold text-emerald-600 mb-1">31</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
          <h3 className="text-[13px] text-slate-500 font-medium mb-2">Customers onboarded</h3>
          <div className="text-3xl font-bold text-emerald-600 mb-1">31</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
          <h3 className="text-[13px] text-slate-500 font-medium mb-2">Active agents</h3>
          <div className="text-3xl font-bold text-emerald-600 mb-1">31</div>
        </div>
      </div>

      {/* Table Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 relative">
        <span className="text-sm text-slate-400 mr-2">Showing {filteredLoans.length} of {loansData.length}</span>
        
        {/* Filter Button */}
        <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="8" x2="20" y2="8"></line><circle cx="9" cy="8" r="2"></circle><line x1="4" y1="16" x2="20" y2="16"></line><circle cx="15" cy="16" r="2"></circle></svg>
          Filter
        </button>

        {/* Filter Dropdown */}
        {showFilter && (
          <div className="absolute top-10 right-40 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Filter Loans</h3>
            
            <div className="space-y-3 mb-4">
              <input 
                value={filterParams.search}
                onChange={(e) => setFilterParams({ ...filterParams, search: e.target.value })}
                type="text" 
                placeholder="Search by name or IPPIS..." 
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
          Export as .xlsx
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#E9F4EE]">
                  <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">IPPIS NO.</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Agent</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Sector</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Loan Amt</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No loans match your filter criteria.</td>
                </tr>
              )}
              {paginatedLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900">{loan.name}</td>
                  <td className="px-6 py-4 text-slate-600">{loan.ippis}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{loan.agent}</td>
                  <td className="px-6 py-4 text-slate-600">{loan.sector}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{loan.loanAmt}</td>
                  <td className="px-6 py-4 text-slate-600">{loan.date}</td>
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
        totalItems={filteredLoans.length} 
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
}
