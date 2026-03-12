import React from 'react';
import { ProTicketType } from '../../_interface';
import { Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface TicketCardProps {
  ticket: ProTicketType;
  className?: string;
}

const TOUR_COLORS: Record<string, { bg: string; text: string; badge: string }> =
  {
    pga: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      badge: 'bg-blue-600',
    },
    lpga: {
      bg: 'bg-rose-50',
      text: 'text-rose-500',
      badge: 'bg-rose-500',
    },
    livgolf: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      badge: 'bg-orange-600',
    },
    pgachampions: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      badge: 'bg-emerald-600',
    },
  };

const TicketCard: React.FC<TicketCardProps> = ({ ticket, className = '' }) => {
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };

    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDate.toLocaleDateString('en-US', options).replace(',', '')}-${endDate.getDate()}`;
    }
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  };

  const handleTicketClick = () => {
    window.open(ticket?.ticket_url, '_blank', 'noopener,noreferrer');
  };

  const colors = TOUR_COLORS[ticket?.tour] || {
    bg: 'bg-muted/30',
    text: 'text-primary',
    badge: 'bg-primary',
  };

  return (
    <div
      className={cn(
        'group rounded-xl border border-border/50 overflow-hidden hover:border-border hover:shadow-md transition-all duration-200 bg-card',
        className
      )}
    >
      {/* Tour color accent bar */}
      <div className={cn('h-1', colors.badge)} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div
            className={cn(
              'shrink-0 size-11 rounded-lg flex items-center justify-center overflow-hidden',
              colors.bg
            )}
          >
            {ticket?.tournament_logo ? (
              <Image
                src={ticket.tournament_logo}
                alt=""
                width={44}
                height={44}
                className="size-9 object-contain"
              />
            ) : (
              <span
                className={cn('text-[10px] font-bold uppercase', colors.text)}
              >
                {ticket?.tour}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3
                title={ticket?.tournament_name}
                className="font-semibold text-sm leading-tight line-clamp-2"
              >
                {ticket?.tournament_name}
              </h3>
              <span
                className={cn(
                  'shrink-0 text-[10px] font-bold text-white px-1.5 py-0.5 rounded uppercase',
                  colors.badge
                )}
              >
                {ticket?.tour}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3" />
              <span>
                {formatDateRange(ticket?.start_date, ticket?.end_date)}
              </span>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
          <button
            type="button"
            onClick={handleTicketClick}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ExternalLink className="size-3" />
            Official partner
          </button>
          <Button
            onClick={handleTicketClick}
            size="sm"
            className="h-7 text-xs rounded-lg px-3"
          >
            Get Tickets
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
