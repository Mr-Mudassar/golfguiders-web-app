import React from 'react';

import { Container } from '@/components/layout';
import { vendorAdreementPoints } from './vendor-points';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

function Vender_agreement() {
  return (
    <Container className="pb-12">
      <div className="max-w-5xl mx-auto shadow-md rounded-lg overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="mb-6">
              <Link
                href="/onboarding"
                className="flex items-center hover:text-primary"
              >
              <ChevronLeft /> Back
            </Link>
            <h1 className="text-3xl font-bold text-center">VENDOR AGREEMENT</h1>
          </div>
          <p className="leading-relaxed">
            This Vendor Agreement (the &apos;Agreement&apos;) is a legally
            binding contract between you (&apos;Vendor&apos;) and GolfGuiders,
            Inc., a Washington corporation with its principal place of business
            at 1801 130th Ave NE, Suite 100 (&apos;GolfGuiders&apos;). By
            checking the box to accept this Agreement, you acknowledge that you
            have read, understood, and agree to be bound by the terms outlined
            below.
          </p>
          {vendorAdreementPoints.map((point, index) => (
            <div key={index} className="space-y-2">
              {point.title && (
                <h2 className="text-xl font-semibold">
                  {index + 1}. {point.title}
                </h2>
              )}
              {point.content && (
                <div className="leading-relaxed space-y-4">
                  {point.content.split('\n').map(
                    (paragraph, pIndex) =>
                      paragraph.trim() && (
                        <p key={pIndex} className="whitespace-pre-line">
                          {paragraph.trim()}
                        </p>
                      )
                  )}
                </div>
              )}
              {point.bullets && (
                <ul className="list-disc list-inside space-y-1 pl-4">
                  {point.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex}>{bullet}</li>
                  ))}
                </ul>
              )}
              {point.note && <p className="font-semibold">{point.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}

export { Vender_agreement };
