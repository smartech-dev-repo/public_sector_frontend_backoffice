"use client";

import { useState, useMemo, useRef } from 'react';
import Select from '@/app/components/ui/Select';
import DatePicker from '@/app/components/ui/DatePicker';
import { useToast } from '@/app/composables/useToast';

export default function BroadsheetPage() {
  const { addToast } = useToast();

  const [showFilter, setShowFilter] = useState(false);
  const [filterParams, setFilterParams] = useState({
    search: '',
    status: '',
    dateRange: ''
  });

  const clearFilters = () => {
    setFilterParams({ search: '', status: '', dateRange: '' });
  };

  const ippisFileInput = useRef<HTMLInputElement>(null);
  const repaymentFileInput = useRef<HTMLInputElement>(null);

  const ippisData = [
    { id: 1, month: 'July 2026', status: 'Validated', user: 'Darmian Moses', date: '2nd of July, 2026' },
    { id: 2, month: 'June 2026', status: 'Validated', user: 'Darmian Moses', date: '2nd of June, 2026' },
    { id: 3, month: 'May 2026', status: 'Validated', user: 'Adaeze Nwosu', date: '1st of May, 2026' },
    { id: 4, month: 'April 2026', status: 'Validated', user: 'Darmian Moses', date: '4th of April, 2026' },
    { id: 5, month: 'March 2026', status: 'Validated', user: 'Darmian Moses', date: '2nd of March, 2026' }
  ];

  const repaymentData = [
    { id: 1, month: 'July 2026', status: 'Validated', user: 'Darmian Moses', date: '2nd of July, 2026' },
    { id: 2, month: 'June 2026', status: 'Validated', user: 'Adaeze Nwosu', date: '3rd of June, 2026' },
    { id: 3, month: 'May 2026', status: 'Validated', user: 'Darmian Moses', date: '2nd of May, 2026' },
    { id: 4, month: 'April 2026', status: 'Validated', user: 'Darmian Moses', date: '2nd of April, 2026' },
    { id: 5, month: 'March 2026', status: 'Validated', user: 'Adaeze Nwosu', date: '5th of March, 2026' }
  ];

  const parseMockDate = (dateStr: string) => {
    const cleaned = dateStr.replace(/(st|nd|rd|th)\s+of\s+/, ' ').replace(',', '');
    return new Date(cleaned).getTime();
  };

  const filterData = (dataArray: any[]) => {
    let result = dataArray;
    
    if (filterParams.search) {
      const lower = filterParams.search.toLowerCase();
      result = result.filter(item => 
        item.month.toLowerCase().includes(lower) || 
        item.user.toLowerCase().includes(lower)
      );
    }
    
    if (filterParams.status) {
      result = result.filter(item => item.status === filterParams.status);
    }
    
    if (filterParams.dateRange) {
      const dates = filterParams.dateRange.split(' to ');
      if (dates.length > 0) {
        const start = new Date(dates[0]).getTime();
        const end = dates.length === 2 ? new Date(dates[1]).getTime() : start;
        result = result.filter(item => {
          const itemDate = parseMockDate(item.date);
          return itemDate >= start && itemDate <= end;
        });
      }
    }
    
    return result;
  };

  const filteredIppis = useMemo(() => {
    return filterData(ippisData);
  }, [filterParams]);

  const filteredRepayment = useMemo(() => {
    return filterData(repaymentData);
  }, [filterParams]);

  const triggerIppisUpload = () => {
    ippisFileInput.current?.click();
  };

  const triggerRepaymentUpload = () => {
    repaymentFileInput.current?.click();
  };

  const handleIppisUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      addToast(`File selected: ${file.name}\nReady for backend upload processing.`, 'success');
      event.target.value = '';
    }
  };

  const handleRepaymentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      addToast(`File selected: ${file.name}\nReady for backend upload processing.`, 'success');
      event.target.value = '';
    }
  };

  const handleDownload = (item: any, type: string) => {
    const content = `Mock ${type} Data for ${item.month}\nGenerated on ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type.toLowerCase()}_${item.month.replace(' ', '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    addToast('Exporting all data to Excel...', 'success');
    const content = `Mock Complete Export\nGenerated on ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `full_export.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-end gap-3 relative">
        <span className="text-sm text-slate-400 mr-2">Showing {filteredIppis.length + filteredRepayment.length} uploads</span>
        
        {/* Filter Button */}
        <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          Filter
        </button>

        {/* Filter Dropdown */}
        {showFilter && (
          <div className="absolute top-10 right-32 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Filter Uploads</h3>
            
            <div className="space-y-3 mb-4">
              <input 
                value={filterParams.search}
                onChange={(e) => setFilterParams({ ...filterParams, search: e.target.value })}
                type="text" 
                placeholder="Search by month or user..." 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" 
              />
              
              <Select 
                value={filterParams.status}
                onChange={(val) => setFilterParams({ ...filterParams, status: val as any })}
                placeholder="All Statuses"
                options={[{label: 'All Statuses', value: ''}, {label: 'Validated', value: 'Validated'}, {label: 'Pending', value: 'Pending'}]} 
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

      {/* Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* IPPIS Broadsheet Column */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-slate-900">IPPIS Broadsheet</h2>
          
          {/* Upload Box */}
          <div onClick={triggerIppisUpload} className="border border-dashed border-emerald-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-emerald-50/30 hover:bg-emerald-50/50 transition-colors cursor-pointer relative overflow-hidden group">
            <input type="file" ref={ippisFileInput} className="hidden" onChange={handleIppisUpload} accept=".csv, .xlsx" />
            <svg className="w-6 h-6 text-slate-400 mb-3 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            <p className="text-sm text-slate-400">Drag and drop or <span className="text-emerald-600 font-medium">choose file</span> to upload</p>
            <p className="text-xs text-slate-400 mt-1">.xlsx or .csv</p>
          </div>

          {/* List */}
          <div className="space-y-4">
            {filteredIppis.length === 0 && (
              <div className="text-center py-4 text-sm text-slate-500">
                No IPPIS uploads found.
              </div>
            )}
            {filteredIppis.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 hover:bg-slate-50/30 -mx-2 px-2 rounded-lg transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-slate-800">{item.month}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium border border-emerald-100/50">{item.status}</span>
                  </div>
                  <p className="text-[12px] text-slate-400">{item.user} &bull; {item.date}</p>
                </div>
                <button onClick={() => handleDownload(item, 'IPPIS')} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-xs font-medium transition-colors shadow-sm">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Repayment Schedule Column */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-slate-900">Repayment Schedule</h2>
          
          {/* Upload Box */}
          <div onClick={triggerRepaymentUpload} className="border border-dashed border-emerald-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-emerald-50/30 hover:bg-emerald-50/50 transition-colors cursor-pointer relative overflow-hidden group">
            <input type="file" ref={repaymentFileInput} className="hidden" onChange={handleRepaymentUpload} accept=".csv, .xlsx" />
            <svg className="w-6 h-6 text-slate-400 mb-3 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            <p className="text-sm text-slate-400">Drag and drop or <span className="text-emerald-600 font-medium">choose file</span> to upload</p>
            <p className="text-xs text-slate-400 mt-1">.xlsx or .csv</p>
          </div>

          {/* List */}
          <div className="space-y-4">
            {filteredRepayment.length === 0 && (
              <div className="text-center py-4 text-sm text-slate-500">
                No repayment schedules found.
              </div>
            )}
            {filteredRepayment.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 hover:bg-slate-50/30 -mx-2 px-2 rounded-lg transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-slate-800">{item.month}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium border border-emerald-100/50">{item.status}</span>
                  </div>
                  <p className="text-[12px] text-slate-400">{item.user} &bull; {item.date}</p>
                </div>
                <button onClick={() => handleDownload(item, 'Repayment')} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-xs font-medium transition-colors shadow-sm">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
