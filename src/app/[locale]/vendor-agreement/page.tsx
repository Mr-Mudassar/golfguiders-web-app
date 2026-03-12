import React from 'react';
import dynamic from 'next/dynamic';

import { Logo } from '@/components/common';
import Link from 'next/link';

const VenderAgreement = dynamic(() =>
  import('@/components/app').then((mod) => mod.Vender_agreement)
);

function Page() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex min-h-full justify-center py-12 lg:px-8">
        <Link href="/onboarding">
          <Logo className="h-14" />
        </Link>
      </div>
      <VenderAgreement />
    </div>
  );
}

export default Page;
