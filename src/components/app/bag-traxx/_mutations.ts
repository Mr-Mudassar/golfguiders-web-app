// 1. LinkDevice /
// 2. MyDevices /
// 3. DetachDevice /
// 4. UpdateDeviceName /
// 5. GetDeviceHistory /
// 6. TransferDevice
// 7. getDeviceLocation /

import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import type {
  DetachDeviceRes,
  DetachDeviceVar,
  LinkDeviceMutation,
  MutateDeviceVariables,
  TransferDeviceRes,
  TransferDeviceVar,
  UpdateNameMutation,
} from './_interface';

export const LinkDevice = gql`
  mutation LinkDevice($userId: String!, $deviceId: String!, $name: String!) {
    linkDevice(userId: $userId, imei: $deviceId, deviceName: $name) {
      message
      user_id
      imei
    }
  }
`;

export const UpdateDeviceName = gql`
  mutation updateDevice($userId: String!, $deviceId: String!, $name: String!) {
    updateDeviceName(user_id: $userId, imei: $deviceId, deviceName: $name) {
      imei
      status
      assignedAt
      updatedAt
      lat
      lng
      battery
    }
  }
`;

export const DetachDevice = gql`
  mutation DetachDevice($userId: String!, $deviceId: String!) {
    detachDevice(userId: $userId, imei: $deviceId) {
      message
      user_id
      imei
    }
  }
`;

export const TransferDevice = gql`
  mutation transferDevice(
    $deviceId: String!
    $userId: String!
    $friendId: String!
  ) {
    transferDevice(imei: $deviceId, fromUserId: $userId, toUserId: $friendId) {
      message
      to_user
    }
  }
`;

export const useDeviceMutations = () => {
  const [linkDevice, { loading: createLoad, error: createError }] = useMutation<
    LinkDeviceMutation,
    MutateDeviceVariables
  >(LinkDevice);

  const [updateName, { loading: editLoad, error: editError }] = useMutation<
    UpdateNameMutation,
    MutateDeviceVariables
  >(UpdateDeviceName);

  const [unLink, { loading: detachLoad, error: detachErr }] = useMutation<
    DetachDeviceRes,
    DetachDeviceVar
  >(DetachDevice);

  const [transfer, { loading, error }] = useMutation<
    TransferDeviceRes,
    TransferDeviceVar
  >(TransferDevice);

  return {
    linkDevice,
    unLink,
    updateName,
    transfer,
    status: {
      create: { load: createLoad, err: createError },
      edit: { load: editLoad, err: editError },
      del: { load: detachLoad, err: detachErr },
      send: { load: loading, err: error },
    },
  };
};
