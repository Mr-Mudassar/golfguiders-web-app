'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info } from 'lucide-react';

type BaseProps = {
  readonly className?: string;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  isLoading?: boolean;
  variant?: 'default' | 'destructive';
  type?: 'button' | 'submit';
  onConfirm: () => void;
};

type ConfirmationModalWithTrigger = BaseProps & {
  trigger: React.ReactNode;
  open?: never;
  onOpenChange?: never;
};

type ConfirmationModalWithoutTrigger = BaseProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: never;
};

type ConfirmationModalProps =
  | ConfirmationModalWithTrigger
  | ConfirmationModalWithoutTrigger;

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  className,
  title,
  description,
  confirmText,
  cancelText,
  isLoading = false,
  variant = 'destructive',
  type = 'button',
  onConfirm,
  open,
  onOpenChange,
  trigger,
}) => {
  const isDestructive = variant === 'destructive';

  const IconComponent = isDestructive ? AlertTriangle : Info;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={cn('max-w-sm p-0 overflow-hidden', className)}>
        <div className="flex flex-col items-center text-center px-6 pt-8 pb-0">
          <DialogHeader className="space-y-1.5">
            <div className="flex gap-4 items-center mb-4">
              <div
                className={cn(
                  'h-12 w-12 rounded-full flex items-center justify-center',
                  isDestructive
                    ? 'bg-destructive/10'
                    : 'bg-primary/10'
                )}
              >
                <IconComponent
                  className={cn(
                    'h-6 w-6',
                    isDestructive ? 'text-destructive' : 'text-primary'
                  )}
                />
              </div>
              <DialogTitle className="text-base font-semibold">
                {title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-[13px] leading-relaxed text-muted-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="px-6 pb-6 pt-0 gap-3 sm:gap-3 flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={() => {
              onConfirm();
              onOpenChange?.(false);
            }}
            loading={isLoading}
            disabled={isLoading}
            type={type}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
};

export { ConfirmationModal };
