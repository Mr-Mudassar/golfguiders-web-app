'use client';

import React from 'react';
import { Card, CardContent, Button, Icon, Skeleton } from '@/components/ui';
import type { PackageType } from '@/app/[locale]/(app)/dashboard/trips/_interface';
import Image from 'next/image';

interface PackageCardProps {
  package: PackageType;
  onViewDetails: (pkg: PackageType) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  onViewDetails,
}) => {
  const coverPhoto = pkg.cover_photo?.[0];
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const hasPrice = pkg.package_price > 0;

  return (
    <Card
      className="overflow-hidden cursor-pointer group hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/15 transition-all duration-500 ease-out flex flex-col"
      onClick={() => onViewDetails(pkg)}
    >
      {/* Image area */}
      <div className="relative h-52 w-full overflow-hidden">
        {coverPhoto ? (
          <>
            {!imageLoaded && (
              <Skeleton className="absolute inset-0 z-10" />
            )}
            <Image
              src={coverPhoto}
              alt={pkg.title}
              fill
              className={`object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/15 via-primary/5 to-transparent flex items-center justify-center">
            <Icon name="map" size={48} className="text-primary/20" />
          </div>
        )}

        {/* Multi-layer gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Price / Contact badge */}
        <div className="absolute top-3 right-3 z-[1]">
          {hasPrice ? (
            <div className="bg-primary text-primary-foreground text-sm font-bold px-3.5 py-1.5 rounded-full shadow-lg shadow-primary/30">
              ${pkg.package_price.toLocaleString()}
            </div>
          ) : (
            <div className="bg-background/85 backdrop-blur-md text-foreground text-[11px] font-medium px-2.5 py-1 rounded-full shadow-lg border border-border/50">
              Contact for price
            </div>
          )}
        </div>

        {/* Duration chip */}
        {pkg.duration && (
          <div className="absolute bottom-3 left-3 bg-black/45 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 z-[1]">
            <Icon name="clock" size={11} />
            {pkg.duration}
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3 flex flex-col flex-1">
        {/* Title */}
        <div>
          <h3 className="text-[15px] font-semibold line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {pkg.title}
          </h3>
          {pkg.description && (
            <p className="text-[13px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
              {pkg.description}
            </p>
          )}
        </div>

        {/* Route indicator */}
        <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex flex-col items-center gap-px">
            <div className="w-[7px] h-[7px] rounded-full bg-primary ring-2 ring-primary/20" />
            <div className="w-px h-3.5 bg-gradient-to-b from-primary/60 to-primary/20" />
            <div className="w-[7px] h-[7px] rounded-full bg-primary/40 ring-2 ring-primary/10" />
          </div>
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <span className="text-foreground font-medium truncate text-xs leading-tight">
              {pkg.departure_city}{pkg.departure_country ? `, ${pkg.departure_country}` : ''}
            </span>
            <span className="text-muted-foreground truncate text-xs leading-tight">
              {pkg.arrival_city}{pkg.arrival_country ? `, ${pkg.arrival_country}` : ''}
            </span>
          </div>
          <Icon name="chevron-right" size={14} className="text-muted-foreground/40 shrink-0" />
        </div>

        {/* Services */}
        {pkg.services && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon name="shield-check" size={12} className="text-primary/50 shrink-0" />
            <span className="line-clamp-1">{pkg.services}</span>
          </div>
        )}

        {/* CTA Button */}
        <Button
          variant="outline"
          className="w-full mt-auto border-primary/20 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(pkg);
          }}
        >
          <span className="flex items-center gap-1.5">
            View Details
            <Icon
              name="chevron-right"
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </span>
        </Button>
      </CardContent>
    </Card>
  );
};
