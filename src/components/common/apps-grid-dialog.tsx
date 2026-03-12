import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '../ui';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Logo } from './logo';
import { X } from 'lucide-react';

type AppsGridDialogBase = {
  readonly className?: string;
};

type AppsGridDialogWithTrigger = AppsGridDialogBase & {
  trigger: React.ReactNode;
  open?: never;
  onOpenChange?: never;
};

type AppsGridDialogWithoutTrigger = AppsGridDialogBase & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: never;
};

type AppsGridDialogProps =
  | AppsGridDialogWithTrigger
  | AppsGridDialogWithoutTrigger;

const AppsGridDialog: React.FC<AppsGridDialogProps> = ({
  className,
  open,
  onOpenChange,
  trigger,
}) => {
  const t = useTranslations('noInternetPage');

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          'max-w-md p-0 overflow-hidden border-0 shadow-2xl rounded-2xl gap-0',
          className
        )}
        hideCloseButton
      >
        {/* Hero header */}
        <div className="relative bg-linear-to-br from-primary via-primary to-primary/80 px-8 pt-10 pb-8 text-white overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />

          {/* Close button */}
          <DialogClose className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-10">
            <X className="w-4 h-4 text-white" />
          </DialogClose>

          {/* Logo */}
          <div className="flex justify-center mb-5">
            <div className="bg-white rounded-2xl px-4 py-2 shadow-lg">
              <Logo />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center leading-snug tracking-tight">
            The World of Golf
            <br />
            Now at Your Fingertips
          </h2>
          <p className="text-white/70 text-sm text-center mt-2">
            Connect. Play. Shop. GolfGuiders is here.
          </p>
        </div>

        {/* Services grid */}
        <div className="px-6 pt-6 pb-2 bg-background">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 text-center">
            Our Platforms
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Link
              href="https://store.golfguiders.com"
              className="group flex flex-col items-center p-4 rounded-2xl border border-border/60 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300">
                <Image
                  src="https://golfguiders.com/icons/my-orders.png"
                  alt="Golf store"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <span className="text-sm font-semibold text-foreground">Golf Store</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">Shop &amp; Gear</span>
            </Link>

            <Link
              href="https://store.golfguiders.com/en/account"
              className="group flex flex-col items-center p-4 rounded-2xl border border-border/60 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300">
                <Image
                  src="https://golfguiders.com/icons/golf-store.png"
                  alt="Customer Panel"
                  width={36}
                  height={36}
                  className="object-contain rounded-lg"
                />
              </div>
              <span className="text-sm font-semibold text-foreground">Customer Panel</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">Manage Account</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                Download the App
              </span>
            </div>
          </div>

          {/* Download buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pb-6">
            <Link
              target="_blank"
              href="https://apps.apple.com/us/app/golfguiders/id6741823893"
              className="flex-1 flex items-center gap-3 px-4 py-3 bg-black text-white rounded-xl hover:bg-zinc-800 active:scale-95 transition-all duration-200 shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white shrink-0">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="text-left leading-tight">
                <div className="text-[10px] text-white/70">{t('download.apple.text')}</div>
                <div className="text-sm font-semibold">{t('download.apple.label')}</div>
              </div>
            </Link>

            <Link
              href="https://play.google.com/store/apps/details?id=com.golf_mobile_app&hl=en"
              target="_blank"
              className="flex-1 flex items-center gap-3 px-4 py-3 bg-black text-white rounded-xl hover:bg-zinc-800 active:scale-95 transition-all duration-200 shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white shrink-0">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              <div className="text-left leading-tight">
                <div className="text-[10px] text-white/70">{t('download.play.text')}</div>
                <div className="text-sm font-semibold">{t('download.play.label')}</div>
              </div>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { AppsGridDialog };
