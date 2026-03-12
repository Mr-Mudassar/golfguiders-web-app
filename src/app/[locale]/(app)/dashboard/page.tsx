'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import { Container } from '@/components/layout';
import { Skeleton } from '@/components/ui';

const InviteFriends = dynamic(
  () => import('@/components/common').then((mod) => mod.InviteFriends),
  { ssr: false }
);
const SavedPostsCard = dynamic(
  () => import('@/components/common').then((mod) => mod.SavedPostsCard),
  { ssr: false }
);

function PeopleYouMayKnowFallback() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="p-6 pb-2 space-y-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="px-6 pb-6 flex flex-col gap-2 min-h-[320px]">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-2 py-0.5">
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PeopleYouMayKnow = dynamic(
  () => import('@/components/app').then((mod) => mod.PeopleYouMayKnow),
  { ssr: false, loading: () => <PeopleYouMayKnowFallback /> }
);

function PostsFeedFallback() {
  return (
    <section className="min-h-[900px] w-full">
      <Skeleton className="h-12 w-full rounded-xl mb-6" />
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col rounded-lg border border-border/40 bg-card/50 p-4 gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="w-full h-[280px] rounded-lg" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const PostsFeed = dynamic(
  () => import('@/components/app').then((mod) => mod.PostsFeed),
  { ssr: false, loading: () => <PostsFeedFallback /> }
);
const CreatePost = dynamic(
  () => import('@/components/app').then((mod) => mod.CreatePost),
  { ssr: false }
);

function StoriesFallback() {
  return (
    <section className="col-span-1 lg:col-span-6 w-full h-[280px] md:h-[320px] overflow-hidden rounded-2xl">
      <div className="flex h-full gap-3">
        <Skeleton className="shrink-0 basis-1/3 lg:basis-[160px] h-full rounded-2xl" />
        <Skeleton className="shrink-0 basis-1/3 lg:basis-[160px] h-full rounded-2xl" />
        <Skeleton className="shrink-0 basis-1/3 lg:basis-[160px] h-full rounded-2xl" />
        <Skeleton className="shrink-0 basis-1/3 lg:basis-[160px] h-full rounded-2xl" />
      </div>
    </section>
  );
}

const Stories = dynamic(
  () => import('@/components/app').then((mod) => mod.Stories),
  { ssr: false, loading: () => <StoriesFallback /> }
);

function ProfileCardFallback() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm text-card-foreground overflow-hidden min-h-[300px] animate-in fade-in duration-300">
      <div className="relative h-32">
        <Skeleton className="w-full h-full rounded-none" />
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-50">
          <Skeleton className="h-20 w-20 rounded-full border-2 border-background" />
        </div>
      </div>
      <div className="pt-8 px-6 pb-4 text-center">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-full mt-2 max-w-[240px] mx-auto" />
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

const ProfileCard = dynamic(
  () => import('@/components/app').then((mod) => mod.ProfileCard),
  { ssr: false, loading: () => <ProfileCardFallback /> }
);

const DashboardPage = () => {
  return (
    <Container className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        {/* Left Sidebar - Profile & Invite */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 sticky top-[88px] h-fit">
          <ProfileCard />
          <SavedPostsCard />
          <InviteFriends />
        </div>

        {/* Center Content - Stories, Create Post, Feed */}
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-6">
          <Stories />
          <CreatePost />

          <PostsFeed />
        </div>

        {/* Right Sidebar - People You May Know */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 sticky top-[88px] h-fit">
          <PeopleYouMayKnow limitTo={9} sm />
        </div>
      </div>
    </Container>
  );
};

export default DashboardPage;
