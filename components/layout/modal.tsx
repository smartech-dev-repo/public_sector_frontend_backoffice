import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

import {
  Dialog as Modal,
  DialogClose as ModalClose,
  DialogContent,
  DialogDescription as ModalDescription,
  DialogFooter as ModalFooter,
  DialogHeader as ModalHeader,
  DialogOverlay as ModalOverlay,
  DialogPortal as ModalPortal,
  DialogTitle as ModalTitle,
  DialogTrigger as ModalTrigger,
} from './dialog';

const modalContentVariants = cva('', {
  variants: {
    size: {
      sm: 'max-w-sm',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'h-[92dvh] max-w-[min(96vw,90rem)]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type ModalContentProps = React.ComponentPropsWithoutRef<typeof DialogContent> &
  VariantProps<typeof modalContentVariants>;

const ModalContent = React.forwardRef<React.ElementRef<typeof DialogContent>, ModalContentProps>(
  ({ className, size, ...props }, ref) => (
    <DialogContent ref={ref} className={cn(modalContentVariants({ size }), className)} {...props} />
  ),
);
ModalContent.displayName = 'ModalContent';

export {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  ModalTrigger,
};
