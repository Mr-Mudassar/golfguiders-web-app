'use client';

import React from 'react';

export function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden select-none">
      {/* Static mesh gradient — no animations, no blur layers, minimal GPU cost */}
      <div
        className="absolute inset-0 bg-background transition-colors duration-500"
        style={{
          backgroundImage: `
              radial-gradient(at 0% 0%, hsl(var(--primary) / 0.03) 0px, transparent 50%),
              radial-gradient(at 100% 0%, hsl(var(--primary) / 0.04) 0px, transparent 50%),
              radial-gradient(at 100% 100%, hsl(var(--primary) / 0.03) 0px, transparent 50%),
              radial-gradient(at 0% 100%, hsl(var(--primary) / 0.04) 0px, transparent 50%)
            `,
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-[0.03]" />
    </div>
  );
}
