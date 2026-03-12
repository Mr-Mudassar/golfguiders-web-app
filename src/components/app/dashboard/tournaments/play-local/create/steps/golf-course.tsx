import type {
  GolfCoursesByDistanceType,
  GolfCoursesByDistanceVariablesType,
} from '@/components/app/common/create-post-dialog/_interface';
import { GolfCoursesByDistance } from '@/components/app/common/create-post-dialog/_query';
import {
  FormItem,
  FormLabel,
  Icon,
  Input,
  ScrollArea,
  Skeleton,
} from '@/components/ui';
import { MaxCoursesDistance } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useLazyQuery } from '@apollo/client/react';
import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useDebounceValue } from 'usehooks-ts';
import type { TournamentFormValues } from '../';
import { useAppSelector } from '@/lib';
import { Modal } from '../dialog';

export default function GolfFormStep() {
  const [open, setOpen] = useState(false);
  const { watch, setValue } = useFormContext<TournamentFormValues>();
  const courseName = watch('coursename');
  const [courseId, setCourseId] = useState(watch('id_course'));
  // const players = watch('players');

  useEffect(() => {
    if (courseId !== watch('id_course')) {
      // Reset player tees when course changes (new tees will be auto-assigned)
      const currentPlayers = watch('players') || [];
      if (currentPlayers.length > 0) {
        setValue('players', currentPlayers.map((p) => ({ ...p, tee: '', tee_color: '', tee_order: '' })));
      }
      // Reset team tee_marker/tee_color so they get auto-assigned from new course
      const currentTeams = watch('teams') || [];
      if (currentTeams.length > 0) {
        setValue('teams', currentTeams.map((t) => ({ ...t, tee_marker: [], tee_color: [] })));
      }
      // Clear score permissions since they may reference invalid tee configs
      setValue('scorePermissions', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue, courseName, courseId, watch]);

  return (
    <>
      <div className="space-y-6">
        <FormItem>
          <FormLabel>Golf Course</FormLabel>
          <div
            className={`flex flex-wrap items-center justify-between w-full cursor-pointer border p-2 rounded-lg active:shadow-inner shadow-sm gap-2 ${courseName ? 'text-foreground' : 'text-gray-400'}`}
            onClick={() => setOpen(true)}
          >
            <div className="flex items-center gap-2 text-sm!">
              <Icon name="location" />{' '}
              {!!courseName ? courseName : 'No golf course selected'}
            </div>
            {courseName && (
              <Icon name="check" size={18} className="text-primary mr-2!" />
            )}
          </div>
        </FormItem>

        {/* <FormItem>
          <FormLabel>Tee Markers</FormLabel>
          <div
            className={`flex flex-wrap items-center justify-between w-full border p-2 rounded-lg active:shadow-inner shadow-sm gap-2 ${teeMarkers ? 'text-foreground' : 'text-gray-400'} ${!courseName ? 'bg-gray-200 cursor-auto' : 'cursor-pointer bg-transparent'}`}
            onClick={() => setOpenTee(true)}
          >
            {teeMarkers ? (
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-2">
                  <span
                    className="size-4 border rounded-full"
                    style={{ backgroundColor: teeMarkers }}
                  />
                  <span>{gender}</span>
                </div>
                <Icon name="check" className="text-primary size-6" />
              </div>
            ) : (
              <div
                title={
                  courseName
                    ? 'Select tee marker'
                    : 'Select a golf course to view tee markers'
                }
              >
                No Tee marker
              </div>
            )}
          </div>
        </FormItem> */}
      </div>

      <GolfCourseStep
        open={open}
        setId={setCourseId}
        setOpen={() => setOpen(false)}
      />
      {/* <TeeMarkerDialog
        open={openTee && courseName !== ''}
        setOpen={() => setOpenTee(false)}
        courseId={watch('id_course')}
      /> */}
    </>
  );
}

const GolfCourseStep = ({
  open,
  setOpen,
  setId,
}: {
  open: boolean;
  setOpen: () => void;
  setId: (id: string) => void;
}) => {
  const form = useFormContext<TournamentFormValues>();
  const [search, setSearch] = useDebounceValue('', 500);
  const { user } = useAppSelector((s) => s?.auth);
  const [golfCoursesQuery, golfCoursesState] = useLazyQuery<
    GolfCoursesByDistanceType,
    GolfCoursesByDistanceVariablesType
  >(GolfCoursesByDistance, { fetchPolicy: 'network-only' });

  React.useEffect(() => {
    if (open && user?.latitude != null && user?.longitude != null) {
      golfCoursesQuery({
        variables: {
          distance: MaxCoursesDistance,
          latitude: user.latitude,
          longitude: user.longitude,
          courseName: search || undefined,
        },
      });
    }
  }, [user?.latitude, user?.longitude, open, search, golfCoursesQuery]);

  const courses = golfCoursesState.data?.getGolfCoursesByDistance ?? [];

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      title="Select a golf course"
      description="Tap a course to select it"
    >
      <Input
        icon="search"
        wrapperClassName="w-full"
        placeholder={'Search by name'}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ScrollArea className="h-80">
        {golfCoursesState.loading ? (
          <div className="flex flex-col gap-1">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="w-full h-10" />
            ))}
          </div>
        ) : golfCoursesState.error || !courses ? (
          <div className="h-44 w-full flex items-center justify-center">
            <p className="text-muted-foreground">{'No golf courses found.'}</p>
          </div>
        ) : (
          courses.map((course) => {
            const active = form.watch('id_course')?.split(',')[0] === course.id;
            return (
              <button
                className={cn(
                  'w-full text-left py-2 px-3 bg-muted/20 font-normal mb-1 rounded-md text-normal transition-colors flex flex-col gap-0.5',
                  active ? 'bg-muted font-semibold' : 'hover:bg-muted/80'
                )}
                key={course.id}
                onClick={() => {
                  form.setValue('id_course', course?.id_course ?? '');
                  form.setValue('coursename', course?.coursename ?? '');
                  setId(course?.id as string);
                  setOpen();
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
    </Modal>
  );
};

// export function TeeMarkerDialog({
//   open,
//   setOpen,
//   courseId,
//   onSelect,
//   onCancel,
// }: {
//   open: boolean;
//   setOpen: () => void;
//   courseId: string;
//   onSelect: (val: string) => void;
//   onCancel: () => void;
// }) {
//   const { setValue, watch } = useFormContext<TournamentFormValues>();
//   const selected = watch('tee_marker');

//   const { teeDetails } = useFetchGolfCourseCoordinates(courseId);

//   const mens = teeDetails?.filter((t) => t.gender === 'men');
//   const women = teeDetails?.filter((t) => t.gender === 'wmn');

//   return (
//     <Modal
//       open={open}
//       setOpen={setOpen}
//       title="Select Tee Marker"
//       description="Choose a tee marker for the tournament."
//       footer={
//         <div className="space-x-4">
//           <Button variant="outline" onClick={onCancel}>
//             Cancel
//           </Button>
//           <Button onClick={setOpen}>Select</Button>
//         </div>
//       }
//     >
//       <Tabs defaultValue="men" className="w-full">
//         <TabsList className="grid grid-cols-2">
//           <TabsTrigger value="men">Men</TabsTrigger>
//           <TabsTrigger value="women">Women</TabsTrigger>
//         </TabsList>

//         <TabsContent className="min-h-40 py-4 space-y-3" value="men">
//           <RadioGroup value={selected} onValueChange={onSelect}>
//             {mens?.map((tee) => {
//               const text = isColorDark(tee?.teecolorvalue)
//                 ? 'text-white'
//                 : 'text-primary';
//               return (
//                 <div
//                   key={tee.id_courseteetype}
//                   className="flex items-center space-x-2"
//                 >
//                   <RadioGroupItem
//                     value={tee.teecolorname}
//                     id={tee.id_courseteetype}
//                     className="invisible"
//                   />
//                   <Label
//                     className="flex items-center gap-2"
//                     htmlFor={tee.id_courseteetype}
//                   >
//                     <div
//                       className="size-4 border rounded-full"
//                       style={{ backgroundColor: `#${tee?.teecolorvalue}` }}
//                     >
//                       {tee?.teecolorname === selected ? (
//                         <Icon name="check" className={text} />
//                       ) : (
//                         ''
//                       )}
//                     </div>
//                     {tee.teename} ({tee.ydstotal} yds)
//                   </Label>
//                 </div>
//               );
//             })}
//           </RadioGroup>
//         </TabsContent>

//         <TabsContent className="min-h-40 py-4 space-y-3" value="women">
//           <RadioGroup value={selected} onValueChange={onSelect}>
//             {women.length > 0 ? (
//               women?.map((tee) => {
//                 const text = isColorDark(tee?.teecolorvalue)
//                   ? 'text-white'
//                   : 'text-primary';
//                 return (
//                   <div
//                     key={tee.id_courseteetype}
//                     className="flex items-center space-x-2"
//                   >
//                     <RadioGroupItem
//                       value={tee.id_courseteetype}
//                       className="invisible"
//                       id={tee.id_courseteetype}
//                       onClick={() => setValue('gender_team', "Women's")}
//                     />
//                     <Label
//                       className="flex items-center gap-2"
//                       htmlFor={tee.id_courseteetype}
//                     >
//                       <div
//                         className="size-4 border rounded-full"
//                         style={{ backgroundColor: `#${tee?.teecolorvalue}` }}
//                       >
//                         {tee?.teecolorname === selected ? (
//                           <Icon name="check" className={text} />
//                         ) : (
//                           ''
//                         )}
//                       </div>
//                       {tee.teename} ({tee.ydstotal} yds)
//                     </Label>
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="flex text-center text-muted-foreground">
//                 No Tee Markers available
//               </div>
//             )}
//           </RadioGroup>
//         </TabsContent>
//       </Tabs>
//     </Modal>
//   );
// }
