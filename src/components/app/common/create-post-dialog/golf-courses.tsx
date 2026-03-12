'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useLazyQuery } from '@apollo/client/react';

import {
  Icon,
  Button,
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
  ScrollArea,
  Skeleton,
  DialogDescription,
  Input,
} from '@/components/ui';
import { MaxCoursesDistance } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/lib';

import type { PostInputType } from '.';
import type {
  GolfCoursesByDistanceType,
  GolfCoursesByDistanceVariablesType,
} from './_interface';
import { GolfCoursesByDistance } from './_query';
import { useDebounceValue } from 'usehooks-ts';
import { useTranslations } from 'next-intl';

const GolfCourses = () => {
  const t = useTranslations('homePage.createPost.gc');
  const form = useFormContext<PostInputType>();
  const user = useAppSelector((state) => state.auth.user);
  const [search, setSearch] = useDebounceValue('', 500);
  const [isOpen, setIsOpen] = React.useState(false);
  const [latitude, longitude] = form.watch(['latitude', 'longitude']);

  // Use form values or fallback to user's location
  const lat = latitude || user?.latitude;
  const lng = longitude || user?.longitude;

  const [golfCoursesQuery, golfCoursesState] = useLazyQuery<
    GolfCoursesByDistanceType,
    GolfCoursesByDistanceVariablesType
  >(GolfCoursesByDistance, {
    fetchPolicy: 'network-only',
  });

  // Fetch golf courses when dialog opens and when search/location changes
  React.useEffect(() => {
    if (isOpen && lat && lng) {
      golfCoursesQuery({
        variables: {
          distance: MaxCoursesDistance,
          latitude: lat,
          longitude: lng,
          courseName: search || undefined,
        },

      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, lat, lng, search]);

  // const courses = golfCoursesState.data?.getGolfCoursesByDistance ?? [];
  const courses = React.useMemo(() => {
    if (!golfCoursesState.data?.getGolfCoursesByDistance) return [];
    if (!search) return golfCoursesState.data.getGolfCoursesByDistance;

    return golfCoursesState.data.getGolfCoursesByDistance.filter((c) =>
      c.coursename?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, golfCoursesState.data]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          isErrored={!!form.formState.errors.golfcourse_json}
          tooltip={t('label')}
          className="shadow-sm"
        >
          <Icon
            size={24}
            name="location"
            color={form.watch('golfcourse_json') ? 'hsl(var(--primary))' : 'currentColor'}
          />
        </Button>
      </DialogTrigger>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{'Select a golf course'}</DialogTitle>
          <DialogDescription>
            {
              'Select a golf course to share your post with golfers and invite buddies to play there'
            }
          </DialogDescription>
          {form.formState.errors.golfcourse_json && (
            <p className="text-red-500 text-xs">
              {form.formState.errors.golfcourse_json.message}
            </p>
          )}
        </DialogHeader>
        <Input
          icon="search"
          wrapperClassName="w-full"
          placeholder={'Search by name'}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ScrollArea className="h-80">
          {!lat || !lng ? (
            <div className="h-44 w-full flex items-center justify-center">
              <p className="text-muted-foreground">
                {'Location not available. Please enable location services.'}
              </p>
            </div>
          ) : golfCoursesState.loading ? (
            <div className="flex flex-col gap-1">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="w-full h-10" />
              ))}
            </div>
          ) : golfCoursesState.error ? (
            <div className="h-44 w-full flex items-center justify-center">
              <p className="text-muted-foreground">
                {golfCoursesState.error.message ||
                  'Error loading golf courses.'}
              </p>
            </div>
          ) : !courses || courses.length === 0 ? (
            <div className="h-44 w-full flex items-center justify-center">
              <p className="text-muted-foreground">
                {'No golf courses found.'}
              </p>
            </div>
          ) : (
            courses.map((course) => {
              const active =
                form.watch('golfcourse_json')?.split(',')[0] === course.id;
              return (
                <button
                  className={cn(
                    'w-full text-left py-2 px-3 bg-muted/20 font-normal mb-1 rounded-md text-normal transition-colors flex flex-col gap-0.5',
                    active ? 'bg-muted font-semibold' : 'hover:bg-muted/80'
                  )}
                  key={course.id}
                  onClick={() => {
                    form.setValue(
                      'golfcourse_json',
                      active
                        ? undefined
                        : [
                          course.id,
                          course.coursename,
                          course.latitude,
                          course.longitude,
                        ].join(',')
                    );
                  }}
                >
                  {course.coursename}
                  <span className="text-muted-foreground text-xs">
                    {course.address1}
                  </span>
                </button>
              );
            })
          )}
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">{'Cancel'}</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button">{'Select'}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { GolfCourses };
