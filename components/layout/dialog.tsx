import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, Maximize2, Minimize2, Minus } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const LocalDialogContext = React.createContext<{
  isMinimized: boolean;
  setIsMinimized: React.Dispatch<React.SetStateAction<boolean>>;
}>({ isMinimized: false, setIsMinimized: () => {} });

const Dialog: React.FC<React.ComponentProps<typeof DialogPrimitive.Root>> = (props) => {
  const [isMinimized, setIsMinimized] = React.useState(false);
  return (
    <LocalDialogContext.Provider value={{ isMinimized, setIsMinimized }}>
      <DialogPrimitive.Root modal={!isMinimized} {...props} />
    </LocalDialogContext.Provider>
  );
};
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// ---- Minimized Modals Manager ----
interface MinimizedModal {
  id: string;
  title: string;
  restore: () => void;
}

const MinimizedModalsContext = React.createContext<{
  minimized: MinimizedModal[];
  addMinimized: (modal: MinimizedModal) => void;
  removeMinimized: (id: string) => void;
}>({
  minimized: [],
  addMinimized: () => {},
  removeMinimized: () => {},
});

export function MinimizedModalsProvider({ children }: { children: React.ReactNode }) {
  const [minimized, setMinimized] = React.useState<MinimizedModal[]>([]);

  const addMinimized = React.useCallback((modal: MinimizedModal) => {
    setMinimized((prev) => {
      // Replace if same id
      const filtered = prev.filter((m) => m.id !== modal.id);
      return [...filtered, modal];
    });
  }, []);

  const removeMinimized = React.useCallback((id: string) => {
    setMinimized((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <MinimizedModalsContext.Provider value={{ minimized, addMinimized, removeMinimized }}>
      {children}
      <MinimizedModalsTaskbar />
    </MinimizedModalsContext.Provider>
  );
}

function MinimizedModalsTaskbar() {
  const { minimized } = React.useContext(MinimizedModalsContext);

  if (minimized.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] flex items-end gap-1 p-2 pointer-events-none">
      <style>{`
        @keyframes slideUpFromBottom {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        .minimized-modal-tab {
          animation: slideUpFromBottom 0.2s ease-out;
        }
      `}</style>
      <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
        {minimized.map((m) => (
          <button
            key={m.id}
            onClick={m.restore}
            className="minimized-modal-tab group flex items-center gap-2 rounded-t-lg rounded-b-none border border-b-0 bg-background/95 backdrop-blur-sm px-3 py-2 hover:bg-accent transition-all text-sm font-medium max-w-[200px] truncate"
          >
            <div className="size-2 rounded-full bg-primary/70 group-hover:bg-primary animate-pulse" />
            <span className="truncate">{m.title || 'Modal'}</span>
            <Maximize2 className="size-3 opacity-50 group-hover:opacity-100 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

function useMinimizedModals() {
  return React.useContext(MinimizedModalsContext);
}

// ---- Drag Hook ----
// Minimum pixels the pointer must move before drag begins (prevents click-drift)
const DRAG_THRESHOLD = 3;

function useDraggable(enabled: boolean) {
  // Keep a ref to the dragged element so we can clear its inline styles on reset
  const draggedElRef = React.useRef<HTMLElement | null>(null);

  /** Clear all inline drag styles — resets modal back to its CSS-defined centered position */
  const reset = React.useCallback(() => {
    const el = draggedElRef.current;
    if (el) {
      el.style.position = '';
      el.style.left = '';
      el.style.top = '';
      el.style.transform = '';
      el.style.margin = '';
    }
  }, []);

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      const target = e.target as HTMLElement;
      
      // ONLY allow dragging if initiated from the dialog header
      if (!target.closest('[data-dialog-header]')) return;

      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea') ||
        target.closest('[data-no-drag]') ||
        target.closest('[role="option"]') ||
        target.closest('[role="menuitem"]')
      ) return;

      // Don't drag if the click originated from outside the modal's actual DOM tree (e.g., from a Select/Dropdown Portal)
      if (!e.currentTarget.contains(target)) return;

      const contentEl = (e.currentTarget as HTMLElement).closest('[data-draggable-modal]') as HTMLElement | null;
      if (!contentEl) return;

      // Store ref to the element so reset() can find it later
      draggedElRef.current = contentEl;

      // Don't drag when maximized
      if (contentEl.classList.contains('!w-screen')) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const rect = contentEl.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      let hasDragStarted = false;

      // Capture pointer on the currentTarget (the element with the handler)
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();

      const onPointerMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        // Don't reposition until pointer has moved beyond threshold
        if (!hasDragStarted) {
          if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
          hasDragStarted = true;
        }

        const newX = ev.clientX - offsetX;
        const newY = ev.clientY - offsetY;

        const maxX = window.innerWidth - 100;
        const maxY = window.innerHeight - 50;

        contentEl.style.position = 'fixed';
        contentEl.style.left = `${Math.max(-100, Math.min(newX, maxX))}px`;
        contentEl.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
        contentEl.style.transform = 'none';
        contentEl.style.margin = '0';
      };

      const onPointerUp = (ev: PointerEvent) => {
        try {
          (e.currentTarget as HTMLElement)?.releasePointerCapture(ev.pointerId);
        } catch { /* may already be released */ }
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
      };

      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    },
    [enabled],
  );

  return { onPointerDown, reset, draggedElRef };
}


const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { hideClose?: boolean, overlayClassName?: string }
>(({ className, children, hideClose, overlayClassName, onOpenAutoFocus, ...props }, ref) => {
  const [isMaximized, setIsMaximized] = React.useState(false);
  const { isMinimized, setIsMinimized } = React.useContext(LocalDialogContext);
  const modalId = React.useId();
  const { addMinimized, removeMinimized } = useMinimizedModals();
  const { onPointerDown, reset, draggedElRef } = useDraggable(!isMaximized);

  // Extract title for minimized bar
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [modalTitle, setModalTitle] = React.useState('');

  React.useEffect(() => {
    if (contentRef.current) {
      const titleEl = contentRef.current.querySelector('[data-dialog-title], h2');
      if (titleEl) {
        setModalTitle(titleEl.textContent || 'Modal');
      }
    }
  });

  const handleMinimize = React.useCallback(() => {
    setIsMinimized(true);
    addMinimized({
      id: modalId,
      title: modalTitle || 'Modal',
      restore: () => {
        setIsMinimized(false);
        removeMinimized(modalId);
      },
    });
  }, [modalId, modalTitle, addMinimized, removeMinimized, setIsMinimized]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      removeMinimized(modalId);
    };
  }, [modalId, removeMinimized]);

  // Reset drag position when maximized (reset() now properly clears inline styles)
  React.useEffect(() => {
    if (isMaximized) reset();
  }, [isMaximized, reset]);

  return (
    <DialogPortal>
      <DialogOverlay className={cn(overlayClassName, isMinimized && 'opacity-0 pointer-events-none')} />
      <DialogPrimitive.Content
        ref={(node) => {
          // Merge refs
          (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          // Also wire the drag ref so reset() works before first drag
          draggedElRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        data-draggable-modal
        onPointerDown={onPointerDown}
        // Reset drag position to center every time the modal opens (article pattern)
        onOpenAutoFocus={(e) => {
          reset();
          onOpenAutoFocus?.(e);
        }}
        className={cn(
          'fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg max-h-[90dvh] overflow-y-auto overflow-x-hidden',
          className,
          '!overflow-y-auto overflow-x-hidden',
          isMaximized && '!w-screen !h-[100dvh] !max-w-none !max-h-none !rounded-none !border-none !overflow-y-auto',
          isMinimized && 'opacity-0 pointer-events-none scale-75 !duration-150',
        )}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isMinimized) e.preventDefault();
        }}
        {...props}
      >
        {children}
        {!hideClose && (
          <div className="absolute end-4 top-4 flex items-center gap-1.5">
            {/* Minimize button */}
            <button
              type="button"
              onClick={handleMinimize}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none hover:bg-accent p-0.5"
              title="Minimize"
            >
              <Minus className="size-4" />
              <span className="sr-only">Minimize</span>
            </button>
            {/* Maximize toggle */}
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none hover:bg-accent p-0.5"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              <span className="sr-only">Toggle maximize</span>
            </button>
            {/* Close button */}
            <DialogPrimitive.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:bg-accent p-0.5">
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      data-dialog-header
      className={cn('flex flex-col gap-1.5 text-center sm:text-start select-none cursor-grab active:cursor-grabbing', className)}
      {...props}
    />
  );
};
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    data-dialog-title
    ref={ref}
    className={cn('text-lg leading-none font-semibold tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
