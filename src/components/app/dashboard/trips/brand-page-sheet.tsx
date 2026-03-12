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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import type {
  PackageType,
  CompanyType,
  GetSingleCompanyByUserType,
  GetSingleCompanyByUserVariablesType,
  GetCompanyPackagesType,
  GetCompanyPackagesVariablesType,
} from '@/app/[locale]/(app)/dashboard/trips/_interface';
import {
  GetSingleCompanyByUser,
  GetCompanyPackages,
} from '@/app/[locale]/(app)/dashboard/trips/_query';
import { useLazyQuery } from '@apollo/client/react';
import Image from 'next/image';
import { ConsultationFormModal } from './consultation-form-modal';
import { X } from 'lucide-react';

interface BrandPageSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyUserId: string;
  companyCreated: string;
}

const LoadableImage = ({
  src,
  alt,
  fill,
  className,
  sizes,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
}) => {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <>
      {!loaded && <Skeleton className="absolute inset-0" />}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
      />
    </>
  );
};

export const BrandPageSheet: React.FC<BrandPageSheetProps> = ({
  open,
  onOpenChange,
  companyUserId,
  companyCreated,
}) => {
  const [company, setCompany] = React.useState<CompanyType | null>(null);
  const [packages, setPackages] = React.useState<PackageType[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [consultModalOpen, setConsultModalOpen] = React.useState(false);

  const [fetchCompany, { loading: companyLoading }] = useLazyQuery<
    GetSingleCompanyByUserType,
    GetSingleCompanyByUserVariablesType
  >(GetSingleCompanyByUser, {
    fetchPolicy: 'network-only',
  });

  const [fetchPackages, { loading: packagesLoading }] = useLazyQuery<
    GetCompanyPackagesType,
    GetCompanyPackagesVariablesType
  >(GetCompanyPackages, {
    fetchPolicy: 'network-only',
  });

  React.useEffect(() => {
    if (open && companyUserId && companyCreated) {
      setPage(1);
      setPackages([]);
      setHasMore(true);
      setCompany(null);
      fetchCompany({
        variables: {
          user_id: companyUserId,
          created: new Date(Number(companyCreated)).toISOString(),
        },
      }).then(({ data }) => {
        if (data?.getsingleCompanyByUser) {
          setCompany(data.getsingleCompanyByUser);
          fetchPackages({
            variables: {
              company_id: data.getsingleCompanyByUser.company_id,
              page: 1,
            },
          }).then(({ data: pkgData }) => {
            if (pkgData?.getCompanyPackages) {
              setPackages(pkgData.getCompanyPackages);
              setHasMore(pkgData.getCompanyPackages.length > 0);
            }
          });
        }
      });
    }
  }, [open, companyUserId, companyCreated, fetchCompany, fetchPackages]);

  const handleLoadMore = () => {
    if (!company || packagesLoading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPackages({
      variables: {
        company_id: company.company_id,
        page: nextPage,
      },
    }).then(({ data }) => {
      if (data?.getCompanyPackages) {
        setPackages((prev) => [...prev, ...data.getCompanyPackages]);
        setHasMore(data.getCompanyPackages.length > 0);
      }
    });
  };

  if (!open) return null;

  const isLoading = companyLoading && !company;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto w-full sm:w-[60vw] sm:max-w-none p-0">
          {isLoading ? (
            <div className="space-y-0">
              <Skeleton className="h-48 md:h-56 w-full" />
              <div className="p-6 space-y-6">
                <div className="flex items-end gap-4 -mt-12">
                  <Skeleton className="h-20 w-20 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2 pt-6">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-12 rounded-lg" />
                </div>
              </div>
            </div>
          ) : company ? (
            <div>
              {/* Hero: Cover + overlapping profilefafdsf */}
              <div className="relative">
                {company.cover_photo ? (
                  <div className="relative h-48 md:h-56 w-full bg-muted">
                    <LoadableImage
                      src={company.cover_photo}
                      alt={company.name}
                      fill
                      className="object-cover"
                      sizes="60vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                ) : (
                  <div className="h-48 md:h-56 w-full bg-gradient-to-br from-primary/10 to-primary/5" />
                )}

                {/* Profile photo */}
                <div className="absolute -bottom-10 left-6">
                  {company.photo_profile ? (
                    <div className="relative h-20 w-20 rounded-full overflow-hidden border-4 border-background shadow-lg bg-muted">
                      <LoadableImage
                        src={company.photo_profile}
                        alt={company.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-full border-4 border-background shadow-lg bg-muted flex items-center justify-center">
                      <Icon name="building" size={32} className="text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Consultation button */}
                <div className="absolute top-4 left-4">
                  <Button
                    size="sm"
                    onClick={() => setConsultModalOpen(true)}
                    disabled={!company}
                    className="shadow-md"
                  >
                    <Icon name="message" size={14} className="mr-1.5" />
                    Consultation
                  </Button>
                </div>

                {/* Close button */}
                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors shadow-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content area */}
              <div className="pt-14 px-6 pb-6 space-y-6">
                {/* Header info */}
                <SheetHeader className="p-0">
                  <SheetTitle className="text-2xl">{company.name}</SheetTitle>
                  {company.slogan && (
                    <p className="text-sm text-muted-foreground italic">
                      {company.slogan}
                    </p>
                  )}
                </SheetHeader>

                {/* Description */}
                {company.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      About
                    </h3>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                      {company.description}
                    </p>
                  </div>
                )}

                {/* Video */}
                {company.video_url && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {company.video_title || 'Video'}
                    </h3>
                    <div className="rounded-xl overflow-hidden border">
                      <video
                        src={company.video_url}
                        poster={company.video_thumbnail || undefined}
                        controls
                        className="w-full max-h-80 object-contain bg-black"
                      />
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {company.email && (
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/20 border">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon name="mail" size={14} className="text-primary" />
                        </div>
                        <span className="text-sm truncate">{company.email}</span>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/20 border">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon name="message" size={14} className="text-primary" />
                        </div>
                        <span className="text-sm">
                          {company.mobile_country_code ? `+${company.mobile_country_code} ` : ''}
                          {company.phone}
                        </span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/20 border">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon name="globe" size={14} className="text-primary" />
                        </div>
                        <a
                          href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate"
                        >
                          {company.website}
                        </a>
                      </div>
                    )}
                    {company.company_address && (
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/20 border">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon name="map-pin" size={14} className="text-primary" />
                        </div>
                        <span className="text-sm truncate">
                          {company.company_address}
                          {company.company_city && `, ${company.company_city}`}
                          {company.company_state && `, ${company.company_state}`}
                        </span>
                      </div>
                    )}
                    {company.company_country && (
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/20 border">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon name="flag" size={14} className="text-primary" />
                        </div>
                        <span className="text-sm">{company.company_country}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Packages */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Packages
                  </h3>
                  {packagesLoading && packages.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                          <Skeleton className="h-36 w-full" />
                          <CardHeader className="py-3">
                            <Skeleton className="h-5 w-3/4" />
                          </CardHeader>
                          <CardContent className="pt-0 pb-3">
                            <Skeleton className="h-4 w-full" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : packages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground rounded-xl border border-dashed">
                      <Icon name="map" size={40} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No packages available</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {packages.map((pkg) => (
                          <PackageItem key={`${pkg.package_id}-${pkg.created}`} pkg={pkg} />
                        ))}
                      </div>

                      {hasMore && packages.length > 0 && (
                        <div className="mt-4 flex justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLoadMore}
                            loading={packagesLoading}
                          >
                            Load More Packages
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-12 text-center text-muted-foreground p-6">
              <Icon name="building" size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Unable to load brand information</p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConsultationFormModal
        open={consultModalOpen}
        onOpenChange={setConsultModalOpen}
        company={company}
      />
    </>
  );
};

const PackageItem = ({ pkg }: { pkg: PackageType }) => {
  const [imgLoaded, setImgLoaded] = React.useState(false);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-36 w-full bg-muted">
        {pkg.cover_photo?.[0] ? (
          <>
            {!imgLoaded && <Skeleton className="absolute inset-0" />}
            <Image
              src={pkg.cover_photo[0]}
              alt={pkg.title}
              fill
              className={`object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              sizes="(max-width: 768px) 100vw, 30vw"
              onLoad={() => setImgLoaded(true)}
            />
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <Icon name="map" size={32} className="text-primary/30" />
          </div>
        )}
        {pkg.package_price > 0 && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full shadow z-[1]">
            ${pkg.package_price.toLocaleString()}
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      </div>

      <CardHeader className="py-3">
        <CardTitle className="text-base line-clamp-1">
          {pkg.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 pb-3 space-y-1.5">
        {pkg.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {pkg.description}
          </p>
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon name="map-pin" size={12} className="shrink-0" />
          <span className="truncate">
            {pkg.departure_city}
          </span>
          <Icon name="chevron-right" size={10} className="shrink-0" />
          <span className="truncate">
            {pkg.arrival_city}
          </span>
        </div>
        {pkg.duration && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon name="clock" size={12} className="shrink-0" />
            <span>{pkg.duration}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
