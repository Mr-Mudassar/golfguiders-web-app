'use client';

import dynamic from 'next/dynamic';
import { Toaster } from '@/components/ui';

const FloatingFeedback = dynamic(
  () =>
    import('@/components/layout/floating-feedback').then((mod) => ({
      default: mod.FloatingFeedback,
    })),
  { ssr: false }
);

export function RootLayoutClient() {
  return (
    <>
      <Toaster />
      <FloatingFeedback />
    </>
  );
}