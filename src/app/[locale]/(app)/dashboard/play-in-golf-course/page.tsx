'use client';

import { useEffect, useRef } from 'react';

const WIDGET_SRC = 'https://widget.golfguiders.com/golfguiders.js';

const PlayInGolfCoursePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clean up any previous Google Maps API so the widget can re-initialize
    document.querySelectorAll('script[src*="maps.googleapis.com"]').forEach((s) => s.remove());
    if ((window as any).google?.maps) {
      delete (window as any).google.maps;
    }

    // Remove any previously loaded widget script
    document.querySelectorAll(`script[src="${WIDGET_SRC}"]`).forEach((s) => s.remove());

    // Clear previous widget content
    if (containerRef.current) containerRef.current.innerHTML = '';

    // Set config every time the page mounts
    (window as any).GolfGuiders = {
      _config: {
        apiKey: process.env.NEXT_PUBLIC_WIDGET_API_KEY,
        showSearch: true,
      },
    };

    const script = document.createElement('script');
    script.src = WIDGET_SRC;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
      document.querySelectorAll('script[src*="maps.googleapis.com"]').forEach((s) => s.remove());
      if ((window as any).google?.maps) {
        delete (window as any).google.maps;
      }
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 top-16 z-[999] w-screen h-[calc(100vh-4rem)]">
      <div
        ref={containerRef}
        className="gg-maps h-full w-full"
      />
    </div>
  );
};

export default PlayInGolfCoursePage;
