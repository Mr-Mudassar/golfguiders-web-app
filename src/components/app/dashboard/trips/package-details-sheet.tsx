'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Button,
  Icon,
  Skeleton,
} from '@/components/ui';
import { SingleMarkerMap } from '@/components/maps';
import type {
  PackageType,
  GetCompanyPackageType,
  GetCompanyPackageVariablesType,
} from '@/app/[locale]/(app)/dashboard/trips/_interface';
import { GetCompanyPackage } from '@/app/[locale]/(app)/dashboard/trips/_query';
import { useLazyQuery } from '@apollo/client/react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { useCarouselButtons } from '@/lib';
import { BrandPageSheet } from './brand-page-sheet';
import { X } from 'lucide-react';

interface PackageDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: PackageType | null;
  onBookNow: (fullPackage?: PackageType) => void;
}

const CarouselImage = ({ src, alt }: { src: string; alt: string }) => {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <div className="relative h-64 md:h-80 w-full bg-muted">
      {!loaded && <Skeleton className="absolute inset-0" />}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        sizes="(max-width: 768px) 100vw, 50vw"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

export const PackageDetailsSheet: React.FC<PackageDetailsSheetProps> = ({
  open,
  onOpenChange,
  package: pkg,
  onBookNow,
}) => {
  const [fullPackage, setFullPackage] = React.useState<PackageType | null>(pkg);
  const [loadingDetails, setLoadingDetails] = React.useState(false);
  const [brandPageOpen, setBrandPageOpen] = React.useState(false);

  const [fetchPackageDetails, { data: packageData, loading: isLoadingDetails }] = useLazyQuery<
    GetCompanyPackageType,
    GetCompanyPackageVariablesType
  >(GetCompanyPackage, {
    fetchPolicy: 'network-only',
  });

  React.useEffect(() => {
    if (open && pkg) {
      setFullPackage(pkg);
      setLoadingDetails(true);
      fetchPackageDetails({
        variables: {
          company_id: pkg.company_id,
          created: pkg.created,
        },
      });
    } else {
      setFullPackage(null);
      setLoadingDetails(false);
    }
  }, [open, pkg, fetchPackageDetails]);

  React.useEffect(() => {
    if (packageData?.getCompanyPackage) {
      setFullPackage(packageData.getCompanyPackage);
    }
  }, [packageData]);

  React.useEffect(() => {
    setLoadingDetails(isLoadingDetails);
  }, [isLoadingDetails]);

  const displayPackage = fullPackage || pkg;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    slidesToScroll: 1,
  });
  const carousel = useCarouselButtons(emblaApi);

  if (!open) return null;
  if (!displayPackage) return null;

  const coverPhotos = displayPackage.cover_photo || [];
  const services = displayPackage.services
    ? displayPackage.services.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-2xl p-0">
        {loadingDetails ? (
          <div className="p-6 space-y-6">
            <Skeleton className="h-64 md:h-80 w-full" />
            <div className="space-y-3">
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-20 flex-1 rounded-lg" />
              <Skeleton className="h-20 flex-1 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : (
          <>
            {/* Close button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors shadow-sm"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Hero image carousel */}
            <div className="relative">
              {coverPhotos.length > 0 ? (
                <div className="relative">
                  <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex">
                      {coverPhotos.map((photo, index) => (
                        <div key={index} className="flex-[0_0_100%] min-w-0">
                          <CarouselImage
                            src={photo}
                            alt={`${displayPackage.title} - Image ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  {coverPhotos.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm h-8 w-8"
                        onClick={carousel.onPrevButtonClick}
                        disabled={carousel.prevBtnDisabled}
                      >
                        <Icon name="chevron-left" size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm h-8 w-8"
                        onClick={carousel.onNextButtonClick}
                        disabled={carousel.nextBtnDisabled}
                      >
                        <Icon name="chevron-right" size={16} />
                      </Button>
                      {/* Slide indicator dots */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {coverPhotos.map((_, index) => (
                          <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all ${index === carousel.selectedIndex
                                ? 'w-4 bg-white'
                                : 'w-1.5 bg-white/50'
                              }`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

                  {/* Price overlay */}
                  {displayPackage.package_price > 0 && (
                    <div className="absolute top-4 left-4 bg-primary text-primary-foreground font-bold text-lg px-4 py-1.5 rounded-full shadow-lg z-[1]">
                      ${displayPackage.package_price.toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 md:h-80 w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Icon name="map" size={64} className="text-primary/30" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Title & header */}
              <SheetHeader className="p-0">
                <SheetTitle className="text-2xl">{displayPackage.title}</SheetTitle>
                {displayPackage.duration && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                    <Icon name="clock" size={14} />
                    <span>{displayPackage.duration}</span>
                  </div>
                )}
              </SheetHeader>

              {/* Description */}
              {displayPackage.description && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Description
                  </h3>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                    {displayPackage.description}
                  </p>
                </div>
              )}

              {/* Route */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Route
                </h3>
                <div className="flex items-stretch gap-3">
                  <div className="flex-1 rounded-xl border p-3 bg-muted/20">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase">
                        Departure
                      </span>
                    </div>
                    <p className="text-sm font-medium">
                      {displayPackage.departure_city}
                      {displayPackage.departure_state && `, ${displayPackage.departure_state}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{displayPackage.departure_country}</p>
                  </div>

                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                      <Icon name="chevron-right" size={16} className="text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex-1 rounded-xl border p-3 bg-muted/20">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary/50" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase">
                        Arrival
                      </span>
                    </div>
                    <p className="text-sm font-medium">
                      {displayPackage.arrival_city}
                      {displayPackage.arrival_state && `, ${displayPackage.arrival_state}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{displayPackage.arrival_country}</p>
                  </div>
                </div>
              </div>

              {/* Services */}
              {services.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Services Included
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {services.map((service, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full"
                      >
                        <Icon name="shield-check" size={12} />
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Map */}
              {displayPackage.lat && displayPackage.long && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Location
                  </h3>
                  <div className="h-52 w-full rounded-xl overflow-hidden border">
                    <SingleMarkerMap
                      latitude={displayPackage.lat}
                      longitude={displayPackage.long}
                      className="h-full w-full"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t space-y-2">
                <Button onClick={() => onBookNow(displayPackage ?? undefined)} className="w-full" size="lg">
                  <Icon name="calendar" size={16} className="mr-2" />
                  Book Now
                  {displayPackage.package_price > 0 && (
                    <span className="ml-2 opacity-80">
                      &mdash; ${displayPackage.package_price.toLocaleString()}
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => setBrandPageOpen(true)}
                >
                  <Icon name="building" size={16} className="mr-2" />
                  View Brand Page
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>

      {displayPackage && (
        <BrandPageSheet
          open={brandPageOpen}
          onOpenChange={setBrandPageOpen}
          companyUserId={displayPackage.company_user_id}
          companyCreated={displayPackage.company_created}
        />
      )}
    </Sheet>
  );
};
