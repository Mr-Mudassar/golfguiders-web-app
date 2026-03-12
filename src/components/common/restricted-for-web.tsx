import React from 'react';
import { Logo } from './logo';
import Link from 'next/link';
import Image from 'next/image';

const RestrictedForWeb = () => {
  return (
    <div className="flex items-center justify-center h-[80vh] w-full flex-col text-center px-8">
      <Logo />
      <h1 className="max-w-96 text-xl sm:text-2xl font-medium mt-4">
        Download GolfGuiders Mobile App to access this feature.
      </h1>
      <p className="text-muted-foreground mt-2">
        You can also access it on Desktop site.
      </p>

      <div className="flex flex-col items-center gap-2 mt-6">
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
  );
};

export { RestrictedForWeb };
