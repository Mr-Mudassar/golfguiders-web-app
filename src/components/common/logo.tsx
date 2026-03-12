import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

import darkLogo from '../../../public/brand/logo-dark.png';

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={cn('relative h-8 w-full aspect-[4.68]', className)}>
      <Image
        src={darkLogo.src || '/images/placeholder.svg'}
        alt="GolfGuiders"
        className="object-contain"
        fill
        priority
        sizes="100"
      />
    </div>
  );
};

export { Logo };
