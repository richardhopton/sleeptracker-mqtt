import { IBLEDevice } from 'ESPHome/types/IBLEDevice';

export const isSupported = (device: IBLEDevice) =>
  device.serviceUuidsList.includes('1b1d9641-b942-4da8-89cc-98e6a58fbd93');
