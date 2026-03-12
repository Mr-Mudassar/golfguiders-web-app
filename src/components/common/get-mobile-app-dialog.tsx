import React from 'react';
import Image from 'next/image';

import { Link } from '@/i18n/routing';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui';
import { cn } from '@/lib/utils';
import { DialogDescription } from '@radix-ui/react-dialog';

type GetMobileAppDialogBase = {
  className?: string;
};

type GetMobileAppDialogWithTrigger = GetMobileAppDialogBase & {
  trigger: React.ReactNode;
  open?: never;
  onOpenChange?: never;
};

type GetMobileAppDialogWithoutTrigger = GetMobileAppDialogBase & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: never;
};

type GetMobileAppDialogProps =
  | GetMobileAppDialogWithTrigger
  | GetMobileAppDialogWithoutTrigger;

const GetMobileAppDialog: React.FC<GetMobileAppDialogProps> = ({
  open,
  onOpenChange,
  className,
  trigger,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={cn('max-w-md', className)}>
        <DialogHeader>
          <DialogTitle>Get the Mobile App</DialogTitle>
          <DialogDescription>
            Download GolfGuiders Mobile App to get the best of the experience.
          </DialogDescription>
        </DialogHeader>
        <div className="pb-2">
          <div className="flex flex-col md:flex-row md:justify-center items-center gap-2 mt-2">
            <Link href="#" className="relative h-12 w-40">
              <Image
                src="/images/download-buttons/apple.png"
                alt="Download on Apple Store"
                className="object-contain"
                fill
                sizes="160px"
              />
            </Link>
            <Link href="#" className="relative h-12 w-40">
              <Image
                src="/images/download-buttons/playstore.png"
                alt="Download on Google Play Store"
                className="object-contain"
                fill
                sizes="160px"
              />
            </Link>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { GetMobileAppDialog };
