'use client';

import React from 'react';
import { Button, Icon } from '@/components/ui';
import {
  Wifi,
  MapPin,
  Radio,
  Globe,
  ArrowRight,
  Play,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

interface LandingProps {
  onStartTracking: () => void;
}

export const BagTraxxLanding = ({ onStartTracking }: LandingProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-glow opacity-50 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 container mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
            <MapPin className="size-6 text-primary" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-tighter">BAG TRAXX</span>
            <span className="text-[10px] text-muted-foreground tracking-widest uppercase">Locate • Track • Protect</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Features</a>
          <a href="#" className="hover:text-foreground transition-colors">How it Works</a>
          <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Icon name="settings" className="size-5" />
          </Button>
          <Button
            onClick={onStartTracking}
            className="btn-primary-gradient rounded-full px-6 flex items-center gap-2"
          >
            Open Dashboard
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-12">
          <div className="size-2 bg-primary rounded-full animate-pulse" />
          Powered by GolfGuiders
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
          Know Where Your Bag Is <br />
          <span className="text-primary-gradient">Always.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-12 leading-relaxed">
          Track every bag. Monitor every movement. Get instant alerts.<br />
          Finally, the peace of mind your golf equipment deserves.
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          <FeatureBadge icon={<Radio className="size-4" />} label="Beacon" />
          <FeatureBadge icon={<MapPin className="size-4" />} label="GPS" />
          <FeatureBadge icon={<Wifi className="size-4" />} label="WiFi" />
          <FeatureBadge icon={<Globe className="size-4" />} label="LBS" />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={onStartTracking}
            size="lg"
            className="btn-primary-gradient h-14 px-10 rounded-xl text-lg flex items-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          >
            Start Tracking Now
            <ArrowRight className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-10 rounded-xl text-lg flex items-center gap-3 border-white/10 hover:bg-white/5"
          >
            <Play className="size-5 fill-current" />
            Watch Demo
          </Button>
        </div>

        <div className="mt-20 flex flex-col items-center gap-2 text-muted-foreground">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
            <div className="size-1.5 bg-primary rounded-full" />
            Live Tracking
          </div>
          <span className="text-xs uppercase tracking-[0.2em]">Scroll to Explore</span>
          <ChevronDown className="size-5 animate-bounce mt-2" />
        </div>
      </main>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-32 bg-white/[0.02] border-y border-white/[0.05]">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          {/* User Card */}
          <div className="flex items-center gap-4 p-6 bg-white/[0.05] rounded-2xl border border-white/[0.1] mb-16 text-left">
            <div className="size-16 bg-primary rounded-full flex items-center justify-center text-2xl font-bold text-black">
              MT
            </div>
            <div>
              <h4 className="font-bold text-lg">Michael Thompson</h4>
              <p className="text-muted-foreground text-sm">PGA Member, California</p>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
            Ready to Protect Your <span className="text-primary-gradient">Golf Equipment?</span>
          </h2>

          <p className="max-w-xl text-lg text-muted-foreground mb-12">
            Whether you&apos;re an individual golfer or managing a fleet for your club,
            we have the right solution for you.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              onClick={onStartTracking}
              className="btn-primary-gradient h-12 px-8 rounded-lg flex items-center gap-2"
            >
              Shop Trackers
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline" className="h-12 px-8 rounded-lg border-white/10 hover:bg-white/5">
              Contact Sales
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <BenefitItem label="Bulk discounts available" />
            <BenefitItem label="Enterprise solutions" />
            <BenefitItem label="24/7 Support" />
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="relative z-10 container mx-auto px-6 py-20 flex flex-col md:flex-row items-center justify-between border-t border-white/[0.05]">
        <div className="flex items-center gap-2 mb-8 md:mb-0">
          <MapPin className="size-5 text-primary" />
          <span className="font-bold tracking-tighter">BAG TRAXX</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-20">
          <div>
            <h5 className="font-bold mb-4">Product</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-4">Company</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-4">Legal</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureBadge = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all cursor-default">
    <span className="text-primary">{icon}</span>
    {label}
  </div>
);

const BenefitItem = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2">
    <CheckCircle2 className="size-4 text-primary" />
    {label}
  </div>
);
