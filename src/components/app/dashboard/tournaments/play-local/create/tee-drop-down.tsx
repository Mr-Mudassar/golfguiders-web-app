import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import type { CourseTeeDetails, TournamentGender } from '@/lib/definitions';
import { useEffect, useState } from 'react';
import type { ITeeMark } from '../_interface';

export const TeeDropDown = ({
  teeMarker: tm,
  data,
  handleTeeSelect,
  handleTeeCancel,
  size = 'default',
}: {
  teeMarker: ITeeMark;
  handleTeeCancel?: () => void;
  handleTeeSelect: (v: ITeeMark) => void;
  data: CourseTeeDetails[];
  size?: 'default' | 'lg' | 'sm' | 'icon';
}) => {
  const [teeGen, setTeeGen] = useState<TournamentGender>('MALE');
  const [tMarker, setTMark] = useState<ITeeMark>(tm);

  // Sync internal state when the prop changes (e.g. global default marker applied)
  useEffect(() => {
    setTMark(tm);
  }, [tm?.name, tm?.value, tm?.gen, tm?.order]);

  const genData =
    teeGen === 'MALE'
      ? data?.filter((f) => f.gender === 'men')
      : teeGen === 'FEMALE'
        ? data?.filter((f) => f.gender === 'wmn')
        : data;

  const color = data?.find(
    (f) => f?.display_order === tMarker?.order
  )?.teecolorvalue;

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={size} className='h-10 min-w-40'>
            {!!tMarker?.name ? (
              <>
                <div
                  className="size-4 border mr-1 rounded-full"
                  style={{ backgroundColor: `#${color}` }}
                />
                {tMarker?.name}
              </>
            ) : (
              'Select Tee Marker'
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="min-w-40">
          <div className="grid grid-cols-2 items-center divide-x mb-2">
            <Avatar className="p-0 flex items-center mx-auto rounded-none justify-center">
              <AvatarImage
                height={40}
                width={30}
                className="object-contain"
                src={`/images/genders/${teeGen}.png`}
                alt={teeGen + 'sign'}
              />
              <AvatarFallback className="bg-transparent">
                {teeGen == 'MALE' && (
                  <span
                    className="p-3 text-3xl cursor-pointer font-bold text-blue-400"
                    onClick={() => setTeeGen('FEMALE')}
                  >
                    &#9794;
                  </span>
                )}
                {teeGen == 'FEMALE' && (
                  <span
                    className="p-3 text-3xl cursor-pointer font-bold text-pink-400"
                    onClick={() => setTeeGen('OTHER')}
                  >
                    &#9792;
                  </span>
                )}
                {teeGen == 'OTHER' && (
                  <span
                    className="p-3 text-4xl cursor-pointer font-bold text-purple-400"
                    onClick={() => setTeeGen('MALE')}
                  >
                    &#9893;
                  </span>
                )}
              </AvatarFallback>
            </Avatar>
            <div className="grid text-xs">
              <p
                onClick={() => setTeeGen('MALE')}
                className={`p-1 cursor-pointer ${teeGen === 'MALE'
                  ? 'bg-secondary text-primary font-semibold'
                  : 'bg-muted text-muted-foreground'
                  }`}
              >
                Men
              </p>
              <p
                onClick={() => setTeeGen('FEMALE')}
                className={`p-1 cursor-pointer ${teeGen === 'FEMALE'
                  ? 'bg-secondary text-primary font-semibold'
                  : 'bg-muted text-muted-foreground'
                  }`}
              >
                Women
              </p>
              <p
                onClick={() => setTeeGen('OTHER')}
                className={`p-1 cursor-pointer ${teeGen === 'OTHER'
                  ? 'bg-secondary text-primary font-semibold'
                  : 'bg-muted text-muted-foreground'
                  }`}
              >
                Other
              </p>
            </div>
          </div>

          {genData && genData.length > 0 ? (
            genData.map((tee) => (
              <DropdownMenuItem
                key={tee?.display_order}
                onClick={() => {
                  handleTeeSelect({
                    name: tee?.teecolorname,
                    value: tee?.teecolorvalue,
                    gen: teeGen,
                    order: tee?.display_order,
                  });

                  setTMark({
                    name: tee?.teecolorname,
                    value: tee?.teecolorvalue,
                    gen: teeGen,
                    order: tee?.display_order,
                  });
                }}
              >
                <div
                  className="size-4 border rounded-full mr-1"
                  style={{ backgroundColor: `#${tee?.teecolorvalue}` }}
                />
                {tee?.teename} ({tee?.ydstotal} yds)
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No Tee Markers</DropdownMenuItem>
          )}

        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
