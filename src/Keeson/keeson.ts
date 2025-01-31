import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { buildDictionary } from '@utils/buildDictionary';
import { logError, logInfo, logWarn } from '@utils/logger';
import { setupDeviceInfoSensor } from 'BLE/setupDeviceInfoSensor';
import { buildMQTTDeviceData } from 'Common/buildMQTTDeviceData';
import { IESPConnection } from 'ESPHome/IESPConnection';
import { getDevices } from './options';
import { setupMassageButtons } from './setupMassageButtons';
import { setupPresetButtons } from './setupPresetButtons';
import { setupMotorEntities } from './setupMotorEntities';
import { isSupported as isKSBTSupported } from './KSBT/isSupported';
import { controllerBuilder as ksbtControllerBuilder } from './KSBT/controllerBuilder';

const checks = [isKSBTSupported];
const controllerBuilders = [ksbtControllerBuilder];

export const keeson = async (mqtt: IMQTTConnection, esphome: IESPConnection): Promise<void> => {
  const devices = getDevices();
  if (!devices.length) return logInfo('[Keeson] No devices configured');

  const devicesMap = buildDictionary(devices, (device) => ({ key: device.name, value: device }));
  const deviceNames = Object.keys(devicesMap);

  if (deviceNames.length !== devices.length) return logError('[Keeson] Duplicate name detected in configuration');

  const bleDevices = await esphome.getBLEDevices(deviceNames);
  for (const bleDevice of bleDevices) {
    const { name, mac, address, connect, disconnect, getDeviceInfo } = bleDevice;
    const device = devicesMap[mac] || devicesMap[name];

    if (!device) {
      logInfo(`[Keeson] Device not found in configuration for MAC: ${mac} or Name: ${name}`);
      continue;
    }
    const controllerBuilder = checks
      .map((check, index) => (check(bleDevice) ? controllerBuilders[index] : undefined))
      .filter((check) => check)[0];
    if (controllerBuilder === undefined) {
      const { manufacturerDataList, serviceUuidsList } = bleDevice;
      logWarn(
        '[Keeson] Device not supported, please contact me on Discord',
        name,
        JSON.stringify({ name, address, manufacturerDataList, serviceUuidsList })
      );
      continue;
    }

    const deviceData = buildMQTTDeviceData({ ...device, address }, 'Keeson');
    await connect();

    const controller = await controllerBuilder(deviceData, bleDevice);
    if (!controller) {
      await disconnect();
      continue;
    }

    logInfo('[Keeson] Setting up entities for device:', name);
    setupPresetButtons(mqtt, controller);
    setupMassageButtons(mqtt, controller);
    setupMotorEntities(mqtt, controller);

    const deviceInfo = await getDeviceInfo();
    if (deviceInfo) setupDeviceInfoSensor(mqtt, controller, deviceInfo);
  }
};
