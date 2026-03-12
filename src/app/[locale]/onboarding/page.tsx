'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const OpenStoreForm = dynamic(() =>
  import('@/components/app').then((mod) => mod.OpenStoreForm)
);

export default function Page() {
  return (
    <div className=" bg-transparent md:px-1 py-1 ">
      <h1 className="text-center text-2xl font-bold mb-4 md:text-3xl">
        Join the GolfGuiders Community – Sell More, Grow Faster!
      </h1>
      <div className="rounded-2xl overflow-hidden bg-background/90 w-full sm:max-w-2xl mx-auto border-2 border-border/50 shadow-2xl shadow-black/70">
        <div className="bg-gradient-to-br from-primary/20 to-transparent to-40% backdrop-blur-lg py-8 px-4">
          <div className="max-w-2xl md:max-w-full mx-auto">
            <OpenStoreForm />
          </div>
        </div>
      </div>
    </div>
  );
}
