import {
  GetHoleCountByCourseType,
  GetHoleCountByCourseVariablesType,
  GolfCourseDetails,
  GolfCourseDetailsVariables,
} from '@/components/app/common/create-post-dialog/_interface';
import {
  COURSE_GPS_DETAILS,
  CourseHoles,
} from '@/components/app/common/create-post-dialog/_query';
import { useLazyQuery, useQuery } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CourseScoreCard, CourseTeeDetails } from '../definitions';

type RawCoordinate = Record<string, unknown>;
type ConvertedCoordinate = Record<string, number | string>;
type TeeDetail = CourseTeeDetails;
type Scorecard = CourseScoreCard;

export const useFetchGolfCourseCoordinates = (
  id_course: string,
  isGPS: boolean = false
) => {
  const [coordinatesData, setCoordinatesData] = useState<
    ConvertedCoordinate[] | null
  >(null);
  const [teeDetails, setTeeDetails] = useState<TeeDetail[] | []>([]);
  const [scorecardDetails, setScorecardDetails] = useState<Scorecard>();
  const [loading, setLoading] = useState<boolean>(true);

  const [getGolfCourseGpsDetails] = useLazyQuery<
    GolfCourseDetails,
    GolfCourseDetailsVariables
  >(COURSE_GPS_DETAILS);

  const { data } = useQuery<GetHoleCountByCourseType, GetHoleCountByCourseVariablesType>(
    CourseHoles,
    { variables: { id_course } }
  );

  const getData = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await getGolfCourseGpsDetails({ variables: { id_course } });

      const rawCoords =
        res?.data?.getGolfCourseCoordinates?.golfCourseCoordinates ?? [];

      const convertedData: ConvertedCoordinate[] = rawCoords.map((obj) => {
        if (!obj || typeof obj !== 'object') return {} as ConvertedCoordinate;

        return Object.entries(obj as RawCoordinate).reduce<ConvertedCoordinate>(
          (acc, [key, value]) => {
            if (key === 'id_course') {
              acc[key] =
                value === null || value === undefined ? '' : String(value);
            } else {
              const num = Number(value as unknown as string | number);
              acc[key] = Number.isNaN(num) ? String(value ?? '') : num;
            }
            return acc;
          },
          {}
        );
      });

      if (convertedData.length === 0 && isGPS) {
        toast.error('Coordinates Not Available');
        setLoading(false);
        return;
      }

      const tee = (res?.data?.getGolfCourseCoordinates?.golfCourseTeeDetails ??
        []) as TeeDetail[];
      const scoreCard = (res?.data?.getGolfCourseCoordinates
        ?.golfCourseScorecard ?? null) as Scorecard;

      if (
        convertedData.length === 0 &&
        Array.isArray(tee) &&
        tee.length === 0 &&
        scoreCard == null &&
        isGPS
      ) {
        toast.error('Coordinates Not Available');
        setLoading(false);
        return;
      }

      setCoordinatesData(convertedData);
      setTeeDetails(Array.isArray(tee) ? tee : []);
      setScorecardDetails(scoreCard);
    } catch {
      // swallow or log error as before
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id_course) {
      void getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_course]);

  return {
    coordinatesData,
    teeDetails,
    courseHoles: data?.getHoleCountByCourse,
    scorecardDetails,
    loading,
  };
};
