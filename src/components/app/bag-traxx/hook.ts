import { useQuery } from '@apollo/client/react';
import type {
  DeviceDetailRes,
  DeviceDetailVar,
  DeviceHistory,
  DeviceHistoryRes,
  deviceHistoryVars,
  DeviceLocation,
  IDevices,
  myDevicesListResponse,
  myDevicesListVariable,
} from './_interface';
import { GetDeviceDetail, GetDeviceHistory, getDeviceList } from './_query';
import { useAppSelector } from '@/lib';

export const useBagTracking = ({
  page = 1,
  dId,
  date,
}: {
  page?: number;
  dId?: string;
  date?: { start: string; end: string };
}) => {
  const u = useAppSelector((s) => s.auth?.user);

  const deviceList = useQuery<myDevicesListResponse, myDevicesListVariable>(
    getDeviceList,
    {
      variables: {
        userId: u?.userid as string,
        page,
      },
      fetchPolicy: 'network-only',
    }
  );

  const deviceDetail = useQuery<DeviceDetailRes, DeviceDetailVar>(
    GetDeviceDetail,
    {
      variables: {
        deviceId: dId as string,
      },
      fetchPolicy: 'network-only',
      skip: !dId,
    }
  );

  const deviceHistory = useQuery<DeviceHistoryRes, deviceHistoryVars>(
    GetDeviceHistory,
    {
      variables: {
        deviceId: dId as string,
        page,
        fromDate: date?.start as string,
        toDate: date?.end as string,
      },
      skip: !date?.start,
    }
  );

  const fetchAddress = async (
    latitude: number,
    longitude: number
  ): Promise<string> => {
    if (!latitude || !longitude) return 'No Address';
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'BagTraxx/1.0',
          },
        }
      );
      const data = await response.json();
      console.log('---', data.display_name);

      if (data && data.display_name) {
        return data.display_name;
      } else {
        return 'Address not available';
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Address not available';
    }
  };

  return {
    list: {
      data: deviceList?.data?.myDevices as IDevices[],
      load: deviceList?.loading,
      fetch: deviceList?.refetch,
    },
    detail: {
      data: deviceDetail?.data?.getDeviceLocation as DeviceLocation,
      load: deviceDetail?.loading,
      fetch: deviceDetail?.refetch,
    },
    history: {
      data: deviceHistory?.data?.getDeviceHistory as DeviceHistory[],
      load: deviceHistory?.loading,
      fetch: deviceHistory?.refetch,
    },
    fetchAddress,
  };
};
