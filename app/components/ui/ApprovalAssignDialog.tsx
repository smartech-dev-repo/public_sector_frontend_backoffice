"use client";

import { useEffect, useState } from 'react';
import Modal from '@/app/components/ui/Modal';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import { approvals_api } from '@/app/api_factory/modules/approvals';
import { APPROVAL_SENT_EVENT } from '@/app/api_factory/axios.config';
import { announceNotificationsChanged } from '@/app/composables/modules/useNotificationSummary';
import { useToast } from '@/app/composables/useToast';

const ANY_APPROVER = 'any';

/** Opens after any action is sent for approval, so its maker can choose who decides it. */
export default function ApprovalAssignDialog() {
 const { addToast } = useToast();
 const [approvalId, setApprovalId] = useState<string | null>(null);
 const [people, setPeople] = useState<any[]>([]);
 const [assignee, setAssignee] = useState(ANY_APPROVER);

 useEffect(() => {
  const open = async (event: Event) => {
   const id = (event as CustomEvent<string>).detail;
   const res: any = await approvals_api.listAssignees(id);
   if (res?.type === 'ERROR') return;
   setPeople(res.data || []);
   setAssignee(ANY_APPROVER);
   setApprovalId(id);
  };
  window.addEventListener(APPROVAL_SENT_EVENT, open);
  return () => window.removeEventListener(APPROVAL_SENT_EVENT, open);
 }, []);

 const close = () => setApprovalId(null);

 const save = async () => {
  if (approvalId && assignee !== ANY_APPROVER) {
   const res: any = await approvals_api.assign(approvalId, assignee);
   if (res?.type !== 'ERROR') addToast('Request assigned', 'success');
   announceNotificationsChanged();
  }
  close();
 };

 if (people.length === 0) {
  return (
   <Modal isOpen={!!approvalId} onClose={close} onConfirm={close} title="No one can approve this yet" confirmText="OK" cancelText={null} layer="z-confirm">
    <p className="text-sm">Your request is saved, but no other admin has the approval permission for it. Give another admin&apos;s role that permission so they can decide it.</p>
   </Modal>
  );
 }

 return (
  <Modal isOpen={!!approvalId} onClose={close} onConfirm={save} title="Who should approve this?" confirmText="Save" cancelText="Skip" layer="z-confirm">
   <p className="text-sm mb-3">Choose one admin, who becomes the only person able to decide it. Or leave it open to any approver.</p>
   <Select value={assignee} onValueChange={setAssignee}>
    <SelectTrigger aria-label="Approver" className="w-full"><SelectValue placeholder="Any approver" /></SelectTrigger>
    <SelectContent>
     <SelectItem value={ANY_APPROVER}>Any approver</SelectItem>
     {people.map((admin) => <SelectItem key={admin.id} value={admin.id}>{admin.fullName}</SelectItem>)}
    </SelectContent>
   </Select>
  </Modal>
 );
}
