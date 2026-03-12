'use client';

import React, { useState } from 'react';
import { TrackingLayout } from '@/components/app/bag-traxx';
import { BagTraxxLanding } from '@/components/app/bag-traxx/landing';
import { Container } from '@/components/layout';

const DashboardPage = () => {
  const [showDashboard, setShowDashboard] = useState(false);

  if (!showDashboard) {
    return <BagTraxxLanding onStartTracking={() => setShowDashboard(true)} />;
  }

  return (
    <Container className="py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bag Traxx Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your golf equipment in real-time.</p>
        </div>
        <button 
          onClick={() => setShowDashboard(false)}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Back to Overview
        </button>
      </div>
      <TrackingLayout />
    </Container>
  );
};

export default DashboardPage;
