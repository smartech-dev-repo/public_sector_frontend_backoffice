import * as React from 'react';
import * as xlsx from 'xlsx';
import { Download, GripVertical, Search, ArrowUpToLine } from 'lucide-react';
import type { DateRange } from '@/components/ui/custom-calendar';

import { Button } from '@/components/ui/button';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/layout/modal';
// Mock DateRangePicker
const DateRangePicker = (props: any) => <div {...props} />;
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
// Mock export utils
const extractSchema = (data: any[]) => Object.keys(data[0] || {});
const flattenObject = (obj: any) => obj;
const formatFieldLabel = (key: string) => key;
const formatExportValue = (key: string, val: any, format: string) => val;

export type ExportColumn = { header: string; key: string };

export type TableExportButtonProps<TData> = {
  data: TData[];
  filename?: string;
  dateField?: keyof TData;
  className?: string;
  columns?: ExportColumn[];
};


const ALIAS_MAP: Record<string, string[]> = {
  'gl ref': ['glTransactionId', 'reference', 'ref'],
  'date': ['valueDate', 'createdAt', 'updatedAt', 'startDate', 'maturityDate', 'date'],
  'time': ['valueDate', 'createdAt', 'updatedAt', 'startDate', 'maturityDate', 'date'],
  'amount': ['principal', 'payout', 'debit', 'credit', 'balance', 'fee', 'penalty', 'amount'],
  'type': ['eventType', 'transactionType', 'type'],
  'status': ['status', 'state'],
  'description': ['narration', 'notes', 'memo', 'description'],
  'financials': ['principalAmount', 'expectedTotalPayout', 'rate', 'amount'],
  'timeline': ['startDate', 'maturityDate', 'tenor'],
  'progress': ['percentageComplete', 'daysElapsed', 'daysRemaining'],
  'investor': ['user.profile.firstName', 'user.profile.lastName', 'user.email', 'client'],
  'name': ['firstName', 'lastName', 'bankName', 'accountName'],
  'id': ['id', 'bookingId', 'transactionId', 'reference'],
};

// Simple fuzzy matching helper
function getSimilarKeys(search: string, allAvailable: string[]): string[] {
  const s = search.toLowerCase();
  const suggestions = new Set<string>();
  
  // 1. Check aliases
  Object.entries(ALIAS_MAP).forEach(([alias, keys]) => {
    if (alias.includes(s) || s.includes(alias)) {
      keys.forEach(k => {
        const found = allAvailable.find(av => av.toLowerCase().includes(k.toLowerCase()));
        if (found) suggestions.add(found);
      });
    }
  });

  // 2. Fallback fuzzy check (e.g. if they typed "amt", suggest "amount")
  if (s.length >= 3) {
    const commonAbbreviations: Record<string, string> = {
      'amt': 'amount',
      'desc': 'description',
      'tx': 'transaction',
      'ref': 'reference',
      'bal': 'balance'
    };
    const expanded = commonAbbreviations[s] || s;
    allAvailable.forEach(k => {
      if (k.toLowerCase().includes(expanded)) {
        suggestions.add(k);
      }
    });
  }

  return Array.from(suggestions);
}

export function TableExportButton<TData>({
  data,
  filename = 'export',
  dateField,
  className,
  columns,
}: TableExportButtonProps<TData>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [exportTitle, setExportTitle] = React.useState(filename);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const [allKeys, setAllKeys] = React.useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set());
  const [orderedKeys, setOrderedKeys] = React.useState<string[]>([]);

  // Open modal -> extract schema
  const handleOpen = () => {
    const keys = extractSchema(data);
    
    if (columns && columns.length > 0) {
      // If columns are provided, add them to keys if not present, though they should be.
      // Prioritize column keys in orderedKeys
      const colKeys = columns.map(c => c.key);
      const otherKeys = keys.filter((k: string) => !colKeys.includes(k));
      
      setAllKeys([...colKeys, ...otherKeys]);
      setSelectedKeys(new Set(colKeys));
      setOrderedKeys([...colKeys, ...otherKeys]);
    } else {
      setAllKeys(keys);
      setSelectedKeys(new Set(keys));
      setOrderedKeys(keys);
    }
    
    setExportTitle(filename);
    setDateRange(undefined);
    setSearchQuery('');
    setIsOpen(true);
  };

  const getLabelForKey = (key: string) => {
    if (columns) {
      const col = columns.find(c => c.key === key);
      if (col) return col.header;
    }
    return formatFieldLabel(key);
  };

  const toggleKey = (key: string) => {
    const next = new Set(selectedKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setSelectedKeys(next);
  };

  // Drag and drop handlers
  const [draggedKey, setDraggedKey] = React.useState<string | null>(null);

  const onDragStart = (e: React.DragEvent, key: string) => {
    setDraggedKey(key);
    e.dataTransfer.effectAllowed = 'move';
    // Small timeout to allow drag image to render before adding dragging class
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const onDragEnd = (e: React.DragEvent) => {
    setDraggedKey(null);
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
  };

  const onDragOver = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!draggedKey || draggedKey === targetKey) return;

    const draggedIdx = orderedKeys.indexOf(draggedKey);
    const targetIdx = orderedKeys.indexOf(targetKey);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const newKeys = [...orderedKeys];
    const draggedItem = newKeys[draggedIdx];
    
    newKeys.splice(draggedIdx, 1);
    newKeys.splice(targetIdx, 0, draggedItem);
    
    setOrderedKeys(newKeys);
  };

  const handleMoveToTop = (key: string) => {
    const idx = orderedKeys.indexOf(key);
    if (idx <= 0) return;
    const newKeys = [...orderedKeys];
    newKeys.splice(idx, 1);
    newKeys.unshift(key);
    setOrderedKeys(newKeys);
  };

  const filteredKeys = orderedKeys.filter(key => 
    getLabelForKey(key).toLowerCase().includes(searchQuery.toLowerCase()) || 
    key.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const similarKeys = searchQuery.length > 0 && filteredKeys.length === 0 
    ? getSimilarKeys(searchQuery, orderedKeys).filter(k => !filteredKeys.includes(k))
    : [];

  const handleExport = (format: 'csv' | 'xlsx') => {
    let exportData = data;
    
    if (dateField && dateRange?.from) {
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      const fromTime = from.getTime();
      
      const to = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
      to.setHours(23, 59, 59, 999);
      const toTime = to.getTime();
      
      exportData = exportData.filter(item => {
        const itemDateVal = item[dateField as keyof typeof item];
        if (!itemDateVal) return true;
        const time = new Date(itemDateVal as string | number | Date).getTime();
        return time >= fromTime && time <= toTime;
      });
    }

    // Prepare flat mapped data
    const finalData = exportData.map(item => {
      const flat = flattenObject(item);
      const row: Record<string, any> = {};
      
      orderedKeys.forEach(key => {
        if (selectedKeys.has(key)) {
          let val = flat[key];
          if (val === undefined && item[key as keyof typeof item] !== undefined) {
             val = item[key as keyof typeof item];
          }
          row[getLabelForKey(key)] = formatExportValue(key, val, format);
        }
      });
      return row;
    });

    const ws = xlsx.utils.json_to_sheet(finalData, { cellDates: true, dateNF: 'dd/mm/yyyy' });

    // Apply financial formatting (money) to number cells
    const amountKeywords = ['amount', 'balance', 'principal', 'payout', 'debit', 'credit', 'price', 'fee', 'penalty', 'proceeds', 'value', 'interest'];
    const rateKeywords = ['rate', 'percentage', 'yield', 'margin'];
    
    const amountCols = new Set<number>();
    const rateCols = new Set<number>();
    const range = xlsx.utils.decode_range(ws['!ref'] || 'A1:A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = xlsx.utils.encode_cell({ r: 0, c: C });
      const headerCell = ws[address];
      if (headerCell && typeof headerCell.v === 'string') {
        const header = headerCell.v.toLowerCase();
        if (amountKeywords.some(kw => header.includes(kw))) {
          amountCols.add(C);
        } else if (rateKeywords.some(kw => header.includes(kw))) {
          rateCols.add(C);
        }
      }
    }

    Object.keys(ws).forEach(key => {
      if (key.startsWith('!')) return;
      const cell = ws[key];
      const decoded = xlsx.utils.decode_cell(key);
      if (cell.t === 'n') {
        if (amountCols.has(decoded.c)) {
          cell.z = '#,##0.00';
        } else if (rateCols.has(decoded.c)) {
          // Assuming rates are 16.5 rather than 0.165 as they are usually displayed
          // If they were 0.165, format would be '0.00%', since they are 16.5, we just add the symbol via format
          cell.z = '0.00"%"';
        }
      }
    });

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Export");
    
    const finalName = exportTitle.trim() || 'export';
    xlsx.writeFile(wb, `${finalName}.${format}`);
    setIsOpen(false);
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className={cn("h-8 gap-2 whitespace-nowrap", className)}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          handleOpen();
        }}
      >
        <Download className="size-3.5" /> Export
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen}>
        <ModalContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
          <ModalHeader>
            <ModalTitle>Advanced Export</ModalTitle>
            <ModalDescription>
              Configure the fields, order, and filters for your export.
            </ModalDescription>
          </ModalHeader>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Export Title</Label>
                <Input 
                  value={exportTitle} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExportTitle(e.target.value)}
                  autoFocus
                  onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
                  placeholder="e.g. Transactions_Report" 
                />
              </div>
              
              {dateField && (
                <div className="space-y-1">
                  <Label>Filter by Date Range (Optional)</Label>
                  <DateRangePicker 
                    value={dateRange} 
                    onChange={(d: any) => setDateRange(d)} 
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select & Arrange Fields</Label>
                <div className="text-xs space-x-2">
                  <button type="button" onClick={() => setSelectedKeys(new Set(allKeys))} className="text-primary hover:underline">Select All</button>
                  <span className="text-muted-foreground">|</span>
                  <button type="button" onClick={() => setSelectedKeys(new Set())} className="text-primary hover:underline">Clear All</button>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search fields..."
                  className="pl-9 bg-background h-9"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                />
              </div>

              <p className="text-[10px] text-muted-foreground mb-2">Drag fields to rearrange, or use the button to move them to the top.</p>
              
              <div className="border rounded-md divide-y bg-muted/10 max-h-[300px] overflow-y-auto">
                {orderedKeys.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No data available to extract fields.
                  </div>
                )}
                {filteredKeys.length === 0 && orderedKeys.length > 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No exact fields match your search.
                  </div>
                )}
                
                {similarKeys.length > 0 && (
                  <div className="px-3 py-2 bg-muted/30 border-b">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suggested Fields</span>
                  </div>
                )}
                {similarKeys.map((key) => (
                  <div 
                    key={`suggested-${key}`}
                    className="flex items-center gap-3 p-2 bg-background hover:bg-muted/50 transition-colors"
                  >
                    <div className="size-4 shrink-0" />
                    <Checkbox 
                      id={`export-col-${key}`}
                      checked={selectedKeys.has(key)}
                      onCheckedChange={() => toggleKey(key)}
                    />
                    <label 
                      htmlFor={`export-col-${key}`} 
                      className="text-sm font-medium leading-none cursor-pointer flex-1 break-all py-1"
                    >
                      {getLabelForKey(key)}
                      <span className="text-[10px] text-muted-foreground block font-normal mt-0.5 font-mono">{key}</span>
                    </label>
                  </div>
                ))}
                {filteredKeys.map((key) => (
                  <div 
                    key={key} 
                    draggable
                    onDragStart={(e) => onDragStart(e, key)}
                    onDragEnd={onDragEnd}
                    onDragOver={(e) => onDragOver(e, key)}
                    className="flex items-center gap-3 p-2 bg-background hover:bg-muted/50 cursor-move transition-colors group"
                  >
                    <GripVertical className="size-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                    <Checkbox 
                      id={`export-col-${key}`}
                      checked={selectedKeys.has(key)}
                      onCheckedChange={() => toggleKey(key)}
                    />
                    <label 
                      htmlFor={`export-col-${key}`} 
                      className="text-sm font-medium leading-none cursor-pointer flex-1 break-all py-1"
                    >
                      {getLabelForKey(key)}
                      <span className="text-[10px] text-muted-foreground block font-normal mt-0.5 font-mono">{key}</span>
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleMoveToTop(key);
                      }}
                      title="Move to top"
                    >
                      <ArrowUpToLine className="size-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ModalFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => handleExport('csv')}
                disabled={selectedKeys.size === 0}
              >
                CSV
              </Button>
              <Button 
                onClick={() => handleExport('xlsx')}
                disabled={selectedKeys.size === 0}
              >
                Excel
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
