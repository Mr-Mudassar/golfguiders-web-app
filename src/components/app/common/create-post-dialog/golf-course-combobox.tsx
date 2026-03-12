'use client';

import {
  Icon,
  Badge,
  Button,
  Command,
  Popover,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui';
import type {
  GolfCoursesByDistanceType,
  GolfCoursesByDistanceVariablesType,
} from './_interface';
import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import type { PostInputType } from '.';
import { useAppSelector } from '@/lib';
import { useDebounceValue } from 'usehooks-ts';
import { useFormContext } from 'react-hook-form';
import { GolfCoursesByDistance } from './_query';
import { useLazyQuery } from '@apollo/client/react';
import { MaxCoursesDistance } from '@/lib/constants';

interface GolfCourse {
  id: string;
  id_course: string;
  coursename: string;
  address1?: string;
  latitude: string;
  longitude: string;
}

export function GolfCourseCombobox() {
  const form = useFormContext<PostInputType>();
  const user = useAppSelector((state) => state.auth.user);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch] = useDebounceValue(search, 500);

  const [latitude, longitude] = form.watch(['latitude', 'longitude']);
  const selectedCourseJson = form.watch('golfcourse_json');

  // Parse selected course from form value
  const selectedCourse = React.useMemo(() => {
    if (!selectedCourseJson) return null;
    const parts = selectedCourseJson.split(',');
    if (parts.length < 4) return null;
    return {
      id_course: parts[0],
      coursename: parts[1],
      latitude: parts[2],
      longitude: parts[3],
    };
  }, [selectedCourseJson]);

  // Use form values or fallback to user's location
  const lat = latitude || user?.latitude;
  const lng = longitude || user?.longitude;

  const [golfCoursesQuery, { data, loading }] = useLazyQuery<
    GolfCoursesByDistanceType,
    GolfCoursesByDistanceVariablesType
  >(GolfCoursesByDistance, {
    fetchPolicy: 'network-only',
  });

  // Fetch golf courses when popover opens or debounced search changes
  React.useEffect(() => {
    if (open && lat && lng) {
      golfCoursesQuery({
        variables: {
          distance: MaxCoursesDistance,
          latitude: lat,
          longitude: lng,
          courseName: debouncedSearch || undefined,
        },
      });
    }
  }, [open, lat, lng, debouncedSearch, golfCoursesQuery]);

  const courses = React.useMemo(() => {
    return data?.getGolfCoursesByDistance ?? [];
  }, [data]);

  const filteredCourses = React.useMemo(() => {
    if (!search) return courses;
    return courses.filter((c) =>
      c.coursename?.toLowerCase().includes(search.toLowerCase())
    );
  }, [courses, search]);

  const handleSelectCourse = (course: GolfCourse) => {
    const courseValue = [
      course.id_course,
      course.coursename,
      course.latitude,
      course.longitude,
    ].join(',');

    // Toggle selection - if same course is clicked, deselect it
    if (selectedCourse?.id_course === course.id_course) {
      form.setValue('golfcourse_json', undefined);
      form.setValue('location', undefined);
    } else {
      form.setValue('golfcourse_json', courseValue);
      form.setValue('location', course.id_course);
    }
  };

  const handleRemoveCourse = (e: React.MouseEvent) => {
    e.stopPropagation();
    form.setValue('golfcourse_json', undefined);
    form.setValue('location', undefined);
  };

  return (
    <div className={cn('flex flex-col gap-2')}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'h-9 justify-between',
              selectedCourse && 'border-primary/50'
            )}
          >
            <div className="flex items-center gap-1.5">
              <Icon name="location" size={16} />
              <span className="text-xs font-medium">Golf Course</span>
            </div>
            <Icon
              name="chevron-down"
              size={14}
              className={cn(
                'opacity-50 transition-transform',
                open && 'rotate-180'
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[320px] p-0"
          align="start"
          sideOffset={4}
          style={{ zIndex: 10002 }}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search golf courses..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList
              onWheel={(e) => {
                const el = e.currentTarget;
                if (el.scrollHeight > el.clientHeight) {
                  e.stopPropagation();
                  el.scrollTop += e.deltaY;
                }
              }}
            >
              {!lat || !lng ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Location not available
                </div>
              ) : loading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : filteredCourses.length === 0 ? (
                <CommandEmpty>No golf courses found</CommandEmpty>
              ) : (
                <>
                  {/* Selected Course Section */}
                  {selectedCourse && (
                    <div className="border-b">
                      <div className="px-2 py-1.5">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Selected
                        </p>
                      </div>
                      <div className="px-2 pb-2">
                        <Badge
                          variant="secondary"
                          className="pl-2 pr-1 py-1 h-auto gap-1.5 w-full justify-between"
                        >
                          <div className="flex-1 overflow-hidden">
                            <span className="text-xs font-medium block truncate">
                              {selectedCourse.coursename}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveCourse}
                            className="ml-0.5 rounded-full hover:bg-muted p-0.5 transition-colors shrink-0"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      </div>
                    </div>
                  )}

                  <CommandGroup>
                    {filteredCourses.map((course) => {
                      const isSelected = selectedCourse?.id_course === course.id_course;
                      return (
                        <CommandItem
                          key={course.id}
                          value={course.id}
                          onSelect={() => handleSelectCourse(course as GolfCourse)}
                          className="cursor-pointer"
                        >
                          <div
                            className={cn(
                              'mr-2 flex h-4 w-4 items-center justify-center rounded-full border-2',
                              isSelected
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground/50'
                            )}
                          >
                            {isSelected && (
                              <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                            )}
                          </div>

                          <div className="flex-1 overflow-hidden">
                            <div className="text-sm truncate">
                              {course.coursename}
                            </div>
                            {course.address1 && (
                              <p className="text-xs text-muted-foreground truncate">
                                {course.address1}
                              </p>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
