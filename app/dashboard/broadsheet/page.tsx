"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import Select from '@/app/components/ui/Select';
import CustomDateRangePicker from '@/app/components/ui/CustomDateRangePicker';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useIppis } from '@/app/composables/modules/useIppis';

export default function BroadsheetPage() {
  const { addToast } = useToast();
  const { fetchBatches, batches, loading, uploadBroadsheet, uploadRepaymentSchedule, downloadFile } = useIppis();

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
  const filterContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const mapBatchToData = (batch: any) => {
    const d = new Date(batch.createdAt);
    const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
    const dateFormatter = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Parse period (e.g. '2024-11') into a readable month if available
    let monthLabel = monthFormatter.format(d);
    if (batch.period) {
      const [year, monthStr] = batch.period.split('-');
      if (year && monthStr) {
        const pDate = new Date(parseInt(year), parseInt(monthStr) - 1);
        monthLabel = monthFormatter.format(pDate);
      }
    }

    return {
      id: batch.id,
      month: monthLabel,
      status: batch.status === 'COMPLETED' ? 'Validated' : (batch.status || 'Pending'),
      user: batch.uploadedBy?.name || batch.adminId || 'System',
      date: dateFormatter.format(d),
      rawDate: d.getTime(),
      fileKey: batch.storageKey || batch.fileKey,
      documentType: batch.documentType
    };
  };

  const ippisData = useMemo(() => {
    return batches
      .filter((b: any) => b.documentType?.toLowerCase() === 'ippis_broadsheet')
      .map(mapBatchToData)
      .sort((a, b) => b.rawDate - a.rawDate);
  }, [batches]);

  const repaymentData = useMemo(() => {
    return batches
      .filter((b: any) => b.documentType?.toLowerCase() === 'repayment_schedule')
      .map(mapBatchToData)
      .sort((a, b) => b.rawDate - a.rawDate);
  }, [batches]);

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
      result = result.filter(item => {
        if (filterParams.status === 'Validated') return item.status === 'Validated';
        if (filterParams.status === 'Pending') return item.status !== 'Validated';
        return true;
      });
    }
    
    if (filterParams.dateRange) {
      const dates = filterParams.dateRange.split(' to ');
      if (dates.length > 0) {
        const start = new Date(dates[0]).getTime();
        const end = dates.length === 2 ? new Date(dates[1]).getTime() : start;
        result = result.filter(item => {
          return item.rawDate >= start && item.rawDate <= end;
        });
      }
    }
    
    return result;
  };

  const filteredIppis = useMemo(() => {
    return filterData(ippisData);
  }, [ippisData, filterParams]);

  const filteredRepayment = useMemo(() => {
    return filterData(repaymentData);
  }, [repaymentData, filterParams]);

  const triggerIppisUpload = () => {
    ippisFileInput.current?.click();
  };

  const triggerRepaymentUpload = () => {
    repaymentFileInput.current?.click();
  };

  const handleIppisUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        await uploadBroadsheet(formData);
        addToast(`Successfully uploaded ${file.name}`, 'success');
        fetchBatches();
      } catch (err: any) {
        addToast(err.message || 'Failed to upload IPPIS broadsheet', 'error');
      }
      event.target.value = '';
    }
  };

  const handleRepaymentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        await uploadRepaymentSchedule(formData);
        addToast(`Successfully uploaded ${file.name}`, 'success');
        fetchBatches();
      } catch (err: any) {
        addToast(err.message || 'Failed to upload Repayment schedule', 'error');
      }
      event.target.value = '';
    }
  };

  const handleDownload = async (item: any, type: string) => {
    if (!item.fileKey) {
      addToast('No file available for download', 'error');
      return;
    }
    try {
      const blob = await downloadFile(item.fileKey);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type.toLowerCase()}_${item.month.replace(' ', '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      addToast(err.message || 'Failed to download file', 'error');
    }
  };

  const handleExportExcel = () => {
    addToast('Exporting all data to Excel...', 'success');
    // Implement full export if API provides one
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 relative">
        <span className="text-xs sm:text-sm text-slate-400 mr-auto sm:mr-2">Showing {filteredIppis.length + filteredRepayment.length} uploads</span>
        
        {/* Filter Container */}
        <div ref={filterContainerRef} className="relative">
          {/* Filter Button */}
          <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="8" x2="20" y2="8"></line><circle cx="9" cy="8" r="2"></circle><line x1="4" y1="16" x2="20" y2="16"></line><circle cx="15" cy="16" r="2"></circle></svg>
            Filter
          </button>

          {/* Filter Dropdown */}
          {showFilter && (
            <div className="absolute top-12 right-0 w-[calc(100vw-2rem)] sm:w-80 max-w-[320px] bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
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
                
                <CustomDateRangePicker 
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
        </div>

        {/* Export Button */}
        <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m16 16-4-4-4 4"></path></svg> Export as Excel (.xlsx)</button>
      </div>

      {loading && batches.length === 0 ? (
        <div className="flex justify-center py-20"><PulseLoader /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
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
              {filteredIppis.length === 0 && <EmptyState title="No IPPIS uploads found." />}
              {filteredIppis.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 border-b border-slate-50 pb-4 last:border-0 hover:bg-slate-50/30 -mx-2 px-2 rounded-lg transition-colors">
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
              {filteredRepayment.length === 0 && <EmptyState title="No repayment schedules found." />}
              {filteredRepayment.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 border-b border-slate-50 pb-4 last:border-0 hover:bg-slate-50/30 -mx-2 px-2 rounded-lg transition-colors">
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
      )}
    </div>
  );
}
