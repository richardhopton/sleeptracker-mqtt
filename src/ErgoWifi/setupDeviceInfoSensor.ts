import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { Controller } from './Controller';
import { DeviceInfoSensor } from './entities/DeviceInfoSensor';

export const setupDeviceInfoSensor = (mqtt: IMQTTConnection, { deviceData, device, cache }: Controller) => {
  if (cache.deviceInfo) return;

  cache.deviceInfo = new DeviceInfoSensor(mqtt, deviceData).setState(device).setOnline();
};
