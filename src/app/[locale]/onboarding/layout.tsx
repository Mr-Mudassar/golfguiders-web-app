// import type { Metadata } from 'next';
import { Logo } from '@/components/common';
import Image from 'next/image';

interface OnboardLayoutProps {
  children: React.ReactNode;
}

const OnboardLayout: React.FC<OnboardLayoutProps> = ({ children }) => {
  return (
    <main className="bg-background min-h-screen  md:px-8 pb-10 relative">
      <div className="relative z-20">
        <div className="flex min-h-full justify-center py-12 lg:px-8">
          <Logo className="h-14" />
        </div>
        <div className="sm:rounded-2xl overflow-hidden bg-background/90 w-full sm:max-w-3xl mx-auto border-2 border-border/50 shadow-2xl shadow-black/70">
          <div className="bg-gradient-to-br from-primary/20 to-transparent to-40% backdrop-blur-lg py-8 px-4">
            <div className="max-w-3xl md:max-w-full mx-auto">{children}</div>
          </div>
        </div>
      </div>

      <Image
        src="/images/bg-auth2.jpg"
        fill
        alt=""
        className="z-10 object-cover"
        sizes="100vw"
        priority
      />
    </main>
  );
};

export default OnboardLayout;
