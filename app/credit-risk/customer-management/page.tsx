"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import Pagination from '@/app/components/ui/Pagination';
import Select from '@/app/components/ui/Select';
import DatePicker from '@/app/components/ui/DatePicker';
import AuthInput from '@/app/components/Auth/Input';
import { createPortal } from 'react-dom';

export default function CustomerManagementPage() {
  const [showFilter, setShowFilter] = useState(false);
  const [filterParams, setFilterParams] = useState({
    search: '',
    status: '',
    dateRange: ''
  });

  const clearFilters = () => {
    setFilterParams({ search: '', status: '', dateRange: '' });
  };

  const customersData = [
    { id: 1, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026', status: 'Payment made' },
    { id: 2, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026', status: 'Awaiting payment' },
    { id: 3, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026', status: 'Awaiting payment' },
    { id: 4, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026', status: 'Payment made' },
  ];

  const filteredCustomers = useMemo(() => {
    let result = customersData;
    
    if (filterParams.search) {
      const lower = filterParams.search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(lower) || 
        c.ippis.includes(lower) ||
        c.agent.toLowerCase().includes(lower)
      );
    }
    
    if (filterParams.status) {
      result = result.filter(c => c.status === filterParams.status);
    }
    
    if (filterParams.dateRange) {
      const dates = filterParams.dateRange.split(' to ');
      if (dates.length > 0) {
        const start = new Date(dates[0]).getTime();
        const end = dates.length === 2 ? new Date(dates[1]).getTime() : start;
        result = result.filter(c => {
          const itemDate = new Date(c.date).getTime();
          return itemDate >= start && itemDate <= end;
        });
      }
    }
    
    return result;
  }, [filterParams, customersData]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredCustomers.slice(start, end);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const openModal = () => {
    setIsModalOpen(true);
    setCurrentStep(1);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      closeModal();
    }
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      closeModal(); // Final finish action
    }
  };

  const getProceedText = () => {
    if (currentStep === 1) return 'Look up Customer';
    if (currentStep === 6) return 'Complete Verification';
    return 'Proceed';
  };

  return (
    <div className="space-y-6 relative h-full">
      {/* Actions */}
      <div className="flex items-center justify-end gap-3 relative">
        <span className="text-sm text-slate-400 mr-2">Showing {filteredCustomers.length} of {customersData.length} Customers</span>
        
        {/* Filter Button */}
        <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          Filter
        </button>

        {/* Filter Dropdown */}
        {showFilter && (
          <div className="absolute top-10 right-40 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Filter Customers</h3>
            
            <div className="space-y-3 mb-4">
              <input 
                value={filterParams.search}
                onChange={(e) => setFilterParams({ ...filterParams, search: e.target.value })}
                type="text" 
                placeholder="Search name or IPPIS..." 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" 
              />
              
              <Select 
                value={filterParams.status}
                onChange={(val) => setFilterParams({ ...filterParams, status: val as any })}
                placeholder="All Statuses"
                options={[{label: 'All Statuses', value: ''}, {label: 'Payment made', value: 'Payment made'}, {label: 'Awaiting payment', value: 'Awaiting payment'}]} 
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
        <button onClick={openModal} className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm ml-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Onboard Customer
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
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">IPPIS NO.</th>
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Agent</th>
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Sector</th>
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Loan Amt</th>
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Date</th>
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Action</th>
                <th className="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">No customers match your filter criteria.</td>
                </tr>
              )}
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900">{customer.name}</td>
                  <td className="px-6 py-4 text-slate-600">{customer.ippis}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{customer.agent}</td>
                  <td className="px-6 py-4 text-slate-600">{customer.sector}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{customer.loanAmt}</td>
                  <td className="px-6 py-4 text-slate-600">{customer.date}</td>
                  <td className="px-6 py-4">
                    {customer.status === 'Payment made' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border border-emerald-200 text-[#1B7855] bg-emerald-50">
                        Payment made
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border border-yellow-200 text-yellow-700 bg-yellow-50">
                        Awaiting payment
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href="/credit-risk/customer-details" className="font-medium text-slate-400 hover:text-emerald-600 transition-colors inline-block" title="View Details">
                      <Eye className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      <Pagination 
        totalItems={filteredCustomers.length} 
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Onboarding Modal */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal}></div>
        
        <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="p-8 overflow-y-auto">
            
            <div className="mb-6">
              <span className="inline-block px-2 py-0.5 rounded border border-emerald-200 text-emerald-600 text-[10px] font-bold tracking-wider mb-2">Step {currentStep} of 6</span>
              
              {/* Step 1 Title */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Start a new application</h2>
                  <p className="text-[13px] text-slate-500 mt-1">First we verify your job. IPPIS confirms your name, employment and salary straight from the government payroll.</p>
                </div>
              )}
              
              {/* Step 2 Title */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Review with the customer</h2>
                  <p className="text-[13px] text-slate-500 mt-1">Auto-filled from IPPIS (READ ONLY)</p>
                </div>
              )}

              {/* Step 3 Title */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Verify customer identity</h2>
                  <p className="text-[13px] text-slate-500 mt-1">Customer BVN and NIN generate all your personal details date of birth, gender, address, next of kin and more.</p>
                </div>
              )}

              {/* Step 4 Title */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Review with the customer</h2>
                  <p className="text-[13px] text-slate-500 mt-1">Auto-filled from IPPS (READ ONLY)</p>
                </div>
              )}

              {/* Step 5 Title */}
              {currentStep === 5 && (
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Upload customer documents</h2>
                  <p className="text-[13px] text-slate-500 mt-1">Upload your documents so we run an automatic legibility check on your file.</p>
                </div>
              )}

              {/* Step 6 Title */}
              {currentStep === 6 && (
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Passport facial cross-check</h2>
                  <p className="text-[13px] text-slate-500 mt-1">The customer's passport photo (in uniform) is matched 1:1 against their BVN/NIN biometric image.</p>
                </div>
              )}
            </div>

            {/* Step 1 Content */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <AuthInput label="CUSTOMER IPPIS NUMBER" value="23598720984" onChange={()=>{}} />
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <p className="text-[13px] text-amber-700">The customer must supply all information directly. No agent substitutions are permitted.</p>
                </div>
              </div>
            )}

            {/* Step 2 Content */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <AuthInput label="Full Name" value="Wisaz Dube" disabled onChange={()=>{}} />
                <AuthInput label="Employer" value="Nigerian Police Force" disabled onChange={()=>{}} />
                <div className="grid grid-cols-2 gap-4">
                  <AuthInput label="Command ID" value="NPF-LAG-04" disabled onChange={()=>{}} />
                  <AuthInput label="Length of service" value="9 yrs 4 mo" disabled onChange={()=>{}} />
                </div>
              </div>
            )}

            {/* Step 3 Content */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <AuthInput label="BVN" value="23598720984" onChange={()=>{}} />
                <AuthInput label="NIN" value="23598720984" onChange={()=>{}} />
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <p className="text-[13px] text-[#1B7855]">Validated against NIBSS (BVN) and NIMC (NIN). Your name from both must match your IPPIS record.</p>
                </div>
              </div>
            )}

            {/* Step 4 Content */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <AuthInput label="Full Name" value="Wisaz Dube" disabled onChange={()=>{}} />
                <div className="grid grid-cols-2 gap-4">
                  <AuthInput label="Bvn" value="********4821" disabled onChange={()=>{}} />
                  <AuthInput label="Nin" value="*****7730" disabled onChange={()=>{}} />
                  <AuthInput label="Date of birth" value="14/03/1992" disabled onChange={()=>{}} />
                  <AuthInput label="Gender" value="Male" disabled onChange={()=>{}} />
                  <AuthInput label="Marital Status" value="Married" disabled onChange={()=>{}} />
                  <AuthInput label="Phone" value="0803****821" disabled onChange={()=>{}} />
                  <AuthInput label="State of origin" value="Anambra" disabled onChange={()=>{}} />
                  <AuthInput label="Nationality" value="Nigerian" disabled onChange={()=>{}} />
                </div>
                <AuthInput label="Home address" value="14 Bourdillon Rd, Ikoyi, Lagos" disabled onChange={()=>{}} />
                
                <p className="text-[12px] text-slate-500 pt-2 font-medium">Employment and income (READ ONLY)</p>
                <AuthInput label="Employer" value="Nigerian Police Force" disabled onChange={()=>{}} />
                <div className="grid grid-cols-2 gap-4">
                  <AuthInput label="Command ID" value="NPF-LAG-04" disabled onChange={()=>{}} />
                  <AuthInput label="Length of service" value="9 yrs 4 mo" disabled onChange={()=>{}} />
                </div>
              </div>
            )}

            {/* Step 5 Content */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <p className="text-[12px] text-slate-500 font-medium -mb-2">NIN slip</p>
                <div className="border border-emerald-200 rounded-xl p-3 flex items-center justify-between bg-white shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 leading-tight">Adaeze Nwosu NIN.pdf</p>
                      <p className="text-[10px] text-slate-400">1.2MB &bull; 4 seconds left</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <button className="text-slate-400 hover:text-slate-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                    <span className="text-[10px] font-bold text-emerald-600">73%</span>
                  </div>
                </div>
                {/* Progress bar mock */}
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden -mt-2">
                  <div className="h-full bg-emerald-500 w-[73%]"></div>
                </div>

                <p className="text-[12px] text-slate-500 font-medium mt-4 -mb-2">Work identity card</p>
                <div className="border border-emerald-200 rounded-xl p-3 flex items-center justify-between bg-white shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 leading-tight">Adaeze Nwosu ID.pdf</p>
                      <p className="text-[10px] text-slate-400">1.1MB</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <button className="text-slate-400 hover:text-slate-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                    <span className="text-[10px] font-bold text-emerald-600">100%</span>
                  </div>
                </div>
                {/* Progress bar mock */}
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden -mt-2">
                  <div className="h-full bg-emerald-500 w-full"></div>
                </div>

                <p className="text-[12px] text-slate-500 font-medium mt-4 -mb-2">Passport photo in uniform</p>
                <div className="border border-dashed border-emerald-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                  <svg className="w-6 h-6 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  <p className="text-xs text-slate-400">Drag and drop or <span className="text-emerald-600 font-medium">choose file</span> to upload</p>
                  <p className="text-[10px] text-slate-400 mt-1">.png, .jpg or .pdf</p>
                </div>

                <p className="text-[12px] text-slate-500 font-medium mt-4 -mb-2">Signature</p>
                <div className="border border-dashed border-emerald-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                  <svg className="w-6 h-6 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  <p className="text-xs text-slate-400">Drag and drop or <span className="text-emerald-600 font-medium">choose file</span> to upload</p>
                  <p className="text-[10px] text-slate-400 mt-1">.png, .jpg or .pdf</p>
                </div>
              </div>
            )}

            {/* Step 6 Content */}
            {currentStep === 6 && (
              <div className="flex flex-col items-center py-8">
                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Passport (Uniform)</span>
                  </div>
                  
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">BVN / NIN Photo</span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-4 pt-6 border-t border-slate-100 mt-6">
              <button onClick={prevStep} className="px-6 py-3 rounded-xl border border-emerald-500 text-emerald-600 font-medium hover:bg-emerald-50 transition-colors w-32 shrink-0">
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>
              <button onClick={nextStep} className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors">
                {getProceedText()}
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
