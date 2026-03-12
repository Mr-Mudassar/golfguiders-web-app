'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';

import { ProTournamentDetails } from './details';
import { ProPlayersList } from './players';
import { usePathname, useRouter } from '@/i18n/routing';
import { ProLeaderboard } from './leaderboard';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';
import { ArrowLeft } from 'lucide-react';

interface ProTournamentsProps {
  readonly className?: string;
}

const ProTournaments: React.FC<ProTournamentsProps> = ({ className }) => {
  const p: { leagueId: string } = useParams();
  const en = useLocale();

  const path = usePathname();
  const route = useRouter();
  const param = useSearchParams();
  const initialTab = param.get("tab") || "detail";

  const handleTChange = (value: string) => {
    const params = new URLSearchParams(param.toString());
    params.set("tab", value);
    route.replace(`${path}?${params.toString()}`);
  };

  if (!p?.leagueId) {
    return (
      <Card className={className}>
        <CardContent className="h-[90vh] flex justify-center items-center">
          <p className="text-muted-foreground">
            Something went wrong, Try Again later.
          </p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className={cn('m-6', className)}>
      <Tabs defaultValue={initialTab} onValueChange={handleTChange}>
        <CardHeader className="flex-row space-y-0 justify-between items-center">
          <TabsList className="bg-transparent justify-start">
            <TabsTrigger
              className="data-[state=active]:shadow-none rounded-none"
              value="detail"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:shadow-none rounded-none"
              value="leaderboard"
            >
              Leaderboard
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:shadow-none rounded-none"
              value="players"
            >
              Players
            </TabsTrigger>
          </TabsList>

          <Button
            asChild
            size="default"
            variant="outline"
            className="border-border/50 hover:bg-muted/50 font-semibold"
          >
            <Link
              href={`/${en}/dashboard/tournaments/pro`}
              className="flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to List</span>
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="pb-2">
          <TabsContent className="m-0" value="detail">
            <ProTournamentDetails className="col-span-2" />
          </TabsContent>
          <TabsContent className="m-0" value="leaderboard">
            <ProLeaderboard className="col-span-2" />
          </TabsContent>
          <TabsContent className="m-0" value="players">
            <ProPlayersList className="col-span-2" />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};

export { ProTournaments };
