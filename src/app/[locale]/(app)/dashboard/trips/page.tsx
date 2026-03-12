'use client';

import React from 'react';
import { Container } from '@/components/layout';
import { Card, CardContent, Skeleton } from '@/components/ui';
import { useLazyQuery } from '@apollo/client/react';
import { GetPackagesByGeo } from './_query';
import type {
  GetPackagesByGeoType,
  GetPackagesByGeoVariablesType,
  PackageType,
} from './_interface';
import { PackageCard } from '@/components/app/dashboard/trips/package-card';
import { PackageDetailsSheet } from '@/components/app/dashboard/trips/package-details-sheet';
import { BookingFormModal } from '@/components/app/dashboard/trips/booking-form-modal';
import { TripCardSkeleton } from '@/components/app/dashboard/trips/trip-card-skeleton';
import { useCurrentPosition } from '@/lib';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Button, Icon, Input } from '@/components/ui';

const PAGE_SIZE = 12;

const TripsPage = () => {
  const { fetchCurrentLatLng } = useCurrentPosition();
  const [selectedPackage, setSelectedPackage] = React.useState<PackageType | null>(null);
  const [detailsSheetOpen, setDetailsSheetOpen] = React.useState(false);
  const [bookingModalOpen, setBookingModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const [fetchPackages] = useLazyQuery<
    GetPackagesByGeoType,
    GetPackagesByGeoVariablesType
  >(GetPackagesByGeo, {
    fetchPolicy: 'network-only',
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['trips', 'packages'],
    queryFn: async ({ pageParam = [] }) => {
      const position = await fetchCurrentLatLng();
      if (!position) {
        throw new Error('Unable to get your location');
      }

      const { data: result } = await fetchPackages({
        variables: {
          latitude: position.lat,
          longitude: position.lng,
          size: PAGE_SIZE,
          searchAfter: pageParam.length > 0 ? pageParam : undefined,
        },
      });

      return {
        packages: result?.getPackagesByGeo.packages || [],
        nextSearchAfter: result?.getPackagesByGeo.nextSearchAfter || [],
        total: result?.getPackagesByGeo.total || 0,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextSearchAfter.length > 0
        ? lastPage.nextSearchAfter
        : undefined;
    },
    initialPageParam: [] as string[],
  });

  const packages = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.packages) || [];
  }, [data]);

  const totalCount = data?.pages[0]?.total || 0;

  const filteredPackages = React.useMemo(() => {
    if (!searchQuery.trim()) return packages;
    const query = searchQuery.toLowerCase();
    return packages.filter(
      (pkg) =>
        pkg.title?.toLowerCase().includes(query) ||
        pkg.description?.toLowerCase().includes(query) ||
        pkg.departure_city?.toLowerCase().includes(query) ||
        pkg.arrival_city?.toLowerCase().includes(query) ||
        pkg.departure_country?.toLowerCase().includes(query) ||
        pkg.arrival_country?.toLowerCase().includes(query) ||
        pkg.services?.toLowerCase().includes(query)
    );
  }, [packages, searchQuery]);

  const handleViewDetails = (pkg: PackageType) => {
    setSelectedPackage(pkg);
    setDetailsSheetOpen(true);
  };

  const handleBookNow = (fullPackage?: PackageType) => {
    if (fullPackage) {
      setSelectedPackage(fullPackage);
    }
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    setBookingModalOpen(false);
    setDetailsSheetOpen(false);
    setSelectedPackage(null);
    refetch();
  };

  return (
    <Container className="py-6">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Plane" size={18} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Trips</h1>
            {!isLoading && totalCount > 0 && (
              <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                {totalCount}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Discover amazing travel packages near you
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by city, title..."
            icon="search"
            iconSize={16}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TripCardSkeleton count={6} />
        </div>
      ) : filteredPackages.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Icon name={searchQuery ? 'search' : 'map'} size={32} className="text-muted-foreground/50" />
            </div>
            <p className="text-lg font-semibold mb-1">
              {searchQuery ? 'No matching trips' : 'No trips found'}
            </p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? `No packages match "${searchQuery}". Try a different search term.`
                : "We couldn\u2019t find any travel packages near your location. Try again later or check your location settings."}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredPackages.length} of {packages.length} {packages.length === 1 ? 'package' : 'packages'}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={`${pkg.package_id}-${pkg.created}`}
                package={pkg}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {isFetchingNextPage && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <TripCardSkeleton count={3} />
            </div>
          )}

          {hasNextPage && !searchQuery && !isFetchingNextPage && (
            <div className="mt-8 flex justify-center">
              <Button onClick={() => fetchNextPage()} variant="outline">
                Load More
              </Button>
            </div>
          )}
        </>
      )}

      <PackageDetailsSheet
        open={detailsSheetOpen}
        onOpenChange={setDetailsSheetOpen}
        package={selectedPackage}
        onBookNow={handleBookNow}
      />

      <BookingFormModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        package={selectedPackage}
        onSuccess={handleBookingSuccess}
      />
    </Container>
  );
};

export default TripsPage;
