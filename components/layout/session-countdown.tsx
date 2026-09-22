import { useEffect, useState } from 'react';
import { getAccessToken, getRefreshToken, setStoredTokens } from '@/api/auth-storage';
import { decodeJwtPayloadRecord } from '@/api/jwt-access';
import { apiClient } from '@/api/client';
import { getAdminRefreshPath } from '@/api/env';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/layout/modal';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/sonner';
import { useCamco } from '@/pages/camco/state/CamcoProvider';

// Show warning 60 seconds before expiration
const WARNING_THRESHOLD_SECONDS = 60;

export function SessionCountdown() {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const { logout } = useCamco();

  useEffect(() => {
    const checkSession = () => {
      const token = getAccessToken();
      if (!token) {
        setTimeLeft(null);
        setShowWarning(false);
        return;
      }
      
      const payload = decodeJwtPayloadRecord(token);
      if (!payload || typeof payload.exp !== 'number') {
        return;
      }
      
      const now = Math.floor(Date.now() / 1000);
      const remaining = payload.exp - now;
      
      if (remaining <= 0) {
        setTimeLeft(0);
        setShowWarning(false); // Global auth interceptor will handle expiration / logout
      } else if (remaining <= WARNING_THRESHOLD_SECONDS) {
        setTimeLeft(remaining);
        setShowWarning(true);
      } else {
        setTimeLeft(remaining);
        setShowWarning(false);
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRenew = async () => {
    try {
      setRenewing(true);
      const refreshToken = getRefreshToken();
      const { data } = await apiClient.post(getAdminRefreshPath(), { refreshToken });
      
      const newToken = data?.data?.accessToken || data?.data?.access_token || data?.data?.token || 
                       data?.accessToken || data?.access_token || data?.token;
      const newRefreshToken = data?.data?.refreshToken || data?.data?.refresh_token ||
                              data?.refreshToken || data?.refresh_token || refreshToken;
      
      if (newToken) {
        setStoredTokens({ accessToken: newToken, refreshToken: newRefreshToken });
        toast.success("Session renewed successfully.");
        setShowWarning(false);
        setTimeLeft(null); // Will be re-calculated next tick
      } else {
        throw new Error("No token returned");
      }
    } catch (e) {
      toast.error("Failed to renew session. Please log in again.");
      logout();
    } finally {
      setRenewing(false);
    }
  };

  return (
    <Modal open={showWarning} onOpenChange={() => {}}>
      <ModalContent hideClose className="sm:max-w-[450px] rounded-3xl p-6">
        <ModalHeader className="relative pb-2 pt-2">
          <div className="absolute right-0 top-0 flex items-center gap-1.5">
             <div className="size-2 rounded-full bg-gray-200"></div>
             <div className="size-2 rounded-full bg-gray-200"></div>
             <div className="size-2 rounded-full bg-red-500"></div>
          </div>
          <ModalTitle className="text-foreground text-xl font-semibold">Session Expiring Soon</ModalTitle>
        </ModalHeader>
        <div className="py-2">
          <p className="text-[14px] text-muted-foreground mb-4">
            Your session will expire in {Math.max(1, Math.ceil((timeLeft || 0) / 60))} minutes due to inactivity. Would you like to continue?
          </p>
        </div>
        <ModalFooter className="flex flex-row justify-center sm:justify-center gap-4 pt-2">
          <Button variant="outline" onClick={logout} disabled={renewing} className="rounded-full px-4 md:px-8 h-10 border-border hover:bg-muted/50 text-foreground">
            Log Out
          </Button>
          <Button onClick={handleRenew} disabled={renewing} className="rounded-full px-4 md:px-8 h-10 bg-[#156336] hover:bg-[#114d2a] text-white">
            {renewing ? "..." : "Stay Logged In"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
