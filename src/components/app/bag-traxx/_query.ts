import { gql } from '@apollo/client';

export const getDeviceList = gql`
  query getDevices($userId: String!, $page: Float!) {
    myDevices(userId: $userId, page: $page) {
      imei
      userId
      deviceName
      status
      assignedAt
      updatedAt
      lat
      lng
      battery
    }
  }
`;

export const GetDeviceDetail = gql`
  query getLocation($deviceId: String!) {
    getDeviceLocation(imei: $deviceId) {
      imei
      deviceName
      lat
      lng
      status
      hbTime
      gpsTime
      speed
      battery
      accStatus
      gpsSignal
      account
      state
      stateTime
      iccid
      chargeStatus
      shutdown
      confidence
      mac
    }
  }
`;

// 780901807251387
export const GetDeviceHistory = gql`
  query getHistory(
    $deviceId: String!
    $fromDate: String!
    $toDate: String!
    $page: Float!
  ) {
    getDeviceHistory(
      imei: $deviceId
      fromDate: $fromDate
      toDate: $toDate
      page: $page
    ) {
      lat
      lng
      status
      gpsTime
      speed
      battery
      direction
      posType
      deviceName
    }
  }
`;
