import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { IDeviceCache } from 'Common/IController';
import { BLEDeviceInfo } from 'ESPHome/types/BLEDeviceInfo';
import { DeviceInfoSensor } from './DeviceInfoSensor';

export const setupDeviceInfoSensor = (
  mqtt: IMQTTConnection,
  { deviceData, cache }: IDeviceCache,
  deviceInfo: BLEDeviceInfo
) => {
  if (cache.deviceInfo) return;

  cache.deviceInfo = new DeviceInfoSensor(mqtt, deviceData).setState(deviceInfo);
};
