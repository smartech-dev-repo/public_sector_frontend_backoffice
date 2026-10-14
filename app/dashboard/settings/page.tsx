"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/composables/modules/useAuth';
import { useSessions } from '@/app/composables/modules/useSessions';
import { useToast } from '@/app/composables/useToast';
import { useConfirm } from '@/app/composables/useConfirm';
import PulseLoader from '@/app/components/ui/PulseLoader';
import { ShieldCheck, KeyRound, MonitorSmartphone, X, Check, QrCode } from 'lucide-react';

export default function SettingsPage() {
 const [activeTab, setActiveTab] = useState('security');
 
 const { loading: authLoading, profile, qrCode, getProfile, changePassword, setup2fa, confirm2fa, disable2fa } = useAuth();
 const { loading: sessionsLoading, sessions, fetchSessions, deleteSession } = useSessions();
 const { addToast } = useToast();
 const { confirm } = useConfirm();

 // Form States
 const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
 const [tokenForm, setTokenForm] = useState('');
 
 // UI States
 const [isSettingUp2fa, setIsSettingUp2fa] = useState(false);

 useEffect(() => {
  getProfile();
  fetchSessions();
 }, [getProfile, fetchSessions]);

 const handlePasswordChange = async (e: React.FormEvent) => {
  e.preventDefault();
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
   return addToast('New passwords do not match', 'error');
  }
  try {
   await changePassword({ 
    oldPassword: pwdForm.oldPassword, 
    newPassword: pwdForm.newPassword 
   });
   addToast('Password updated successfully', 'success');
   setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
  } catch (err: any) {
   addToast(err?.response?.data?.message || 'Failed to update password', 'error');
  }
 };

 const handleSetup2FA = async () => {
  try {
   await setup2fa();
   setIsSettingUp2fa(true);
  } catch (err: any) {
   addToast(err?.response?.data?.message || 'Failed to initiate 2FA setup', 'error');
  }
 };

 const handleConfirm2FA = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
   await confirm2fa({ token: tokenForm });
   addToast('2FA has been successfully enabled!', 'success');
   setIsSettingUp2fa(false);
   setTokenForm('');
   getProfile(); // Refresh profile to get updated 2FA status
  } catch (err: any) {
   addToast(err?.response?.data?.message || 'Invalid token', 'error');
  }
 };

 const handleDisable2FA = async (e: React.FormEvent) => {
  e.preventDefault();
  const confirmed = await confirm({ message: 'Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.' });
  if (!confirmed) return;
  
  try {
   await disable2fa({ token: tokenForm });
   addToast('2FA has been disabled.', 'success');
   setTokenForm('');
   getProfile();
  } catch (err: any) {
   addToast(err?.response?.data?.message || 'Failed to disable 2FA', 'error');
  }
 };

 const handleRevokeSession = async (id: string) => {
  const confirmed = await confirm({ message: 'Are you sure you want to revoke this session? The user will be logged out immediately.' });
  if (!confirmed) return;
  try {
   await deleteSession(id);
   addToast('Session revoked successfully', 'success');
   fetchSessions();
  } catch (err: any) {
   addToast(err?.response?.data?.message || 'Failed to revoke session', 'error');
  }
 };

 return (
  <div className="w-full max-w-5xl mx-auto space-y-6">
   
   <div className="flex gap-4 border-b border-border mb-6">
    <button 
     onClick={() => setActiveTab('security')} 
     className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'security' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
    >
     <div className="flex items-center gap-2"><KeyRound className="w-4 h-4" /> Password & 2FA</div>
    </button>
    <button 
     onClick={() => setActiveTab('sessions')} 
     className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sessions' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
    >
     <div className="flex items-center gap-2"><MonitorSmartphone className="w-4 h-4" /> Active Sessions</div>
    </button>
   </div>

   {activeTab === 'security' && (
    <div className="grid md:grid-cols-2 gap-6">
     {/* Change Password */}
     <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-1">Change Password</h3>
      <p className="text-sm text-muted-foreground mb-6">Update your account password. Ensure it is at least 8 characters long.</p>
      
      <form onSubmit={handlePasswordChange} className="space-y-4">
       <div>
        <label className="block text-sm font-medium text-foreground/90 mb-1.5">Current Password</label>
        <input 
         type="password" 
         required
         value={pwdForm.oldPassword}
         onChange={(e) => setPwdForm({ ...pwdForm, oldPassword: e.target.value })}
         className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
        />
       </div>
       <div>
        <label className="block text-sm font-medium text-foreground/90 mb-1.5">New Password</label>
        <input 
         type="password" 
         required
         value={pwdForm.newPassword}
         onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
         className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
        />
       </div>
       <div>
        <label className="block text-sm font-medium text-foreground/90 mb-1.5">Confirm New Password</label>
        <input 
         type="password" 
         required
         value={pwdForm.confirmPassword}
         onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
         className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
        />
       </div>
       <div className="pt-2">
        <button 
         type="submit" 
         disabled={authLoading}
         className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
         {authLoading ? 'Updating...' : 'Update Password'}
        </button>
       </div>
      </form>
     </div>

     {/* Two-Factor Authentication */}
     <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-1">
       <h3 className="text-lg font-semibold text-foreground">Two-Factor Auth (2FA)</h3>
       {profile?.is2faEnabled ? (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
         <Check className="w-3.5 h-3.5" /> Enabled
        </span>
       ) : (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
         <X className="w-3.5 h-3.5" /> Disabled
        </span>
       )}
      </div>
      <p className="text-sm text-muted-foreground mb-6">Add an extra layer of security to your account by enabling two-factor authentication.</p>

      {authLoading && !isSettingUp2fa ? (
       <div className="py-8 flex justify-center"><PulseLoader /></div>
      ) : profile?.is2faEnabled ? (
       <div className="space-y-4">
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
         <p className="text-sm text-emerald-800">Your account is currently protected by 2FA. To disable it, enter a 2FA code generated by your authenticator app below.</p>
        </div>
        <form onSubmit={handleDisable2FA} className="space-y-3">
         <div>
          <label className="block text-sm font-medium text-foreground/90 mb-1.5">Authenticator Code</label>
          <input 
           type="text" 
           required
           placeholder="e.g. 123456"
           maxLength={6}
           value={tokenForm}
           onChange={(e) => setTokenForm(e.target.value.replace(/\D/g, ''))}
           className="w-full px-4 py-2 border border-border rounded-lg text-sm font-mono tracking-widest focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all" 
          />
         </div>
         <button 
          type="submit" 
          className="w-full px-6 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium rounded-lg transition-colors border border-rose-200"
         >
          Disable 2FA
         </button>
        </form>
       </div>
      ) : isSettingUp2fa ? (
       <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="p-4 bg-muted/50 rounded-xl flex flex-col items-center text-center space-y-3">
         <div className="p-3 bg-white rounded-lg shadow-sm">
          {qrCode ? (
           <img src={qrCode} alt="2FA QR Code" className="w-40 h-40" />
          ) : (
           <div className="w-40 h-40 flex items-center justify-center bg-slate-100 text-slate-400">
            <QrCode className="w-12 h-12" />
           </div>
          )}
         </div>
         <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Scan with Authenticator</p>
          <p className="text-xs text-muted-foreground">Open Google Authenticator or Authy and scan the QR code above.</p>
         </div>
        </div>
        
        <form onSubmit={handleConfirm2FA} className="space-y-3 pt-2">
         <div>
          <label className="block text-sm font-medium text-foreground/90 mb-1.5">Verify 6-Digit Code</label>
          <input 
           type="text" 
           required
           placeholder="e.g. 123456"
           maxLength={6}
           value={tokenForm}
           onChange={(e) => setTokenForm(e.target.value.replace(/\D/g, ''))}
           className="w-full px-4 py-2 border border-emerald-200 rounded-lg text-sm font-mono tracking-widest focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
          />
         </div>
         <div className="flex gap-3">
          <button 
           type="button" 
           onClick={() => setIsSettingUp2fa(false)}
           className="w-full px-4 py-2.5 bg-card hover:bg-muted border border-border text-foreground font-medium rounded-lg transition-colors"
          >
           Cancel
          </button>
          <button 
           type="submit" 
           className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
          >
           Verify & Enable
          </button>
         </div>
        </form>
       </div>
      ) : (
       <div className="flex flex-col items-center justify-center py-8 px-4 bg-muted/30 border border-border/50 rounded-xl text-center space-y-4">
        <div className="p-4 bg-emerald-100/50 rounded-full text-emerald-600">
         <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-1">
         <h4 className="text-sm font-semibold text-foreground">2FA is Not Configured</h4>
         <p className="text-xs text-muted-foreground">Your account is vulnerable without two-factor authentication.</p>
        </div>
        <button 
         onClick={handleSetup2FA}
         className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
         Setup 2FA Now
        </button>
       </div>
      )}
     </div>
    </div>
   )}

   {activeTab === 'sessions' && (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
     <div className="p-6 border-b border-border">
      <h3 className="text-lg font-semibold text-foreground">Active Sessions</h3>
      <p className="text-sm text-muted-foreground mt-1">Review the devices that are currently logged into your account. Revoke any unrecognized sessions.</p>
     </div>
     
     <div className="p-0 overflow-x-auto">
      {sessionsLoading ? (
       <div className="p-12 flex justify-center"><PulseLoader /></div>
      ) : (
       <table className="w-full text-sm text-left">
        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
         <tr>
          <th className="px-6 py-3 font-medium">Device & IP</th>
          <th className="px-6 py-3 font-medium">Location</th>
          <th className="px-6 py-3 font-medium">Last Active</th>
          <th className="px-6 py-3 text-right font-medium">Action</th>
         </tr>
        </thead>
        <tbody className="divide-y divide-border">
         {sessions?.length === 0 ? (
          <tr>
           <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
            No active sessions found.
           </td>
          </tr>
         ) : (
          sessions?.map((session: any) => (
           <tr key={session.id} className="hover:bg-muted/30 transition-colors">
            <td className="px-6 py-4">
             <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
               <MonitorSmartphone className="w-5 h-5" />
              </div>
              <div>
               <div className="font-medium text-foreground">{session.device || session.userAgent || 'Unknown Device'}</div>
               <div className="text-xs text-muted-foreground mt-0.5">{session.ipAddress || 'Unknown IP'}</div>
              </div>
             </div>
            </td>
            <td className="px-6 py-4 text-muted-foreground">
             {session.location || 'Unknown Location'}
            </td>
            <td className="px-6 py-4">
             <div className="text-foreground">{new Date(session.lastActive || session.createdAt).toLocaleDateString()}</div>
             <div className="text-xs text-muted-foreground mt-0.5">{new Date(session.lastActive || session.createdAt).toLocaleTimeString()}</div>
            </td>
            <td className="px-6 py-4 text-right">
             {session.isCurrent ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">Current Session</span>
             ) : (
              <button 
               onClick={() => handleRevokeSession(session.id)}
               className="px-4 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
              >
               Revoke
              </button>
             )}
            </td>
           </tr>
          ))
         )}
        </tbody>
       </table>
      )}
     </div>
    </div>
   )}

  </div>
 );
}
