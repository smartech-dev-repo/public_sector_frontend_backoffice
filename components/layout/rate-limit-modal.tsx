import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, ModalContent } from './modal';
import { Button } from '../ui/button';

export function RateLimitModal() {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleRateLimit = () => setIsOpen(true);
    window.addEventListener('api:rate-limit', handleRateLimit);
    return () => window.removeEventListener('api:rate-limit', handleRateLimit);
  }, []);

  return (
    <Modal open={isOpen} onOpenChange={() => {}}>
      <ModalContent className="sm:max-w-[425px] outline-none" hideClose>
        <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
          <AlertTriangle className="size-12 text-destructive" />
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Too Many Requests
          </h2>
          <p className="text-sm text-muted-foreground">
            You are sending requests too quickly. Please wait a moment and try again.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Refresh Page
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
