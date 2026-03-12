// interfaces

export type IDevices = {
  imei: string;
  userId: string;
  deviceName: string;
  status: string;
  assignedAt: string;
  updatedAt: string;
  lat: number;
  lng: number;
  battery: number;
};

export type DeviceHistory = {
  gpsTime: string;
  lat: number;
  lng: number;
  status: string;
  posType: string;
  speed: string;
  battery: string;
  direction: string;
  imei: string;
  deviceName: string;
};

export type DeviceLocation = {
  imei: string;
  deviceName: string;
  lat: number;
  lng: number;
  status: string;
  posType: string;
  hbTime: string;
  gpsTime: string;
  speed: string;
  battery: string;
  accStatus: string;
  gpsSignal: string;
  account: string;
  state: string;
  stateTime: string;
  iccid: string;
  mac: string;
  chargeStatus: string;
  shutdown: boolean;
  confidence: string;
};

// response types

export interface myDevicesListResponse {
  myDevices: IDevices[];
}

export interface myDevicesListVariable {
  userId: string;
  page: number;
}

export interface deviceHistoryVars {
  deviceId: string;
  fromDate: string;
  toDate: string;
  page: number;
}

export interface DeviceHistoryRes {
  getDeviceHistory: DeviceHistory[];
}

export interface DeviceDetailRes {
  getDeviceLocation: DeviceLocation;
}
export interface DeviceDetailVar {
  deviceId: string;
}

// Mutations

type Res = {
  message: string;
  userId: string;
  imei: string;
};

export interface LinkDeviceMutation {
  linkDevice: Res;
}

export interface UpdateNameMutation {
  updateDeviceName: Res;
}

export interface DetachDeviceVar {
  userId: string;
  deviceId: string;
}

export interface DetachDeviceRes {
  detachDevice: { message: string };
}

export interface TransferDeviceVar {
  deviceId: string;
  userId: string;
  friendId: string;
}
export interface TransferDeviceRes {
  transferDevice: { message: string };
}

export interface MutateDeviceVariables {
  userId: string;
  deviceId: string;
  name: string;
}
