import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { Dictionary } from '@utils/Dictionary';
import { buildDictionary } from '@utils/buildDictionary';
import { intToBytes } from '@utils/intToBytes';
import { logError, logInfo } from '@utils/logger';
import { BLEController } from 'BLE/BLEController';
import { setupDeviceInfoSensor } from 'BLE/setupDeviceInfoSensor';
import { buildMQTTDeviceData } from 'Common/buildMQTTDeviceData';
import { IESPConnection } from 'ESPHome/IESPConnection';
import { getDevices } from './options';
import { setupLightEntities } from './setupLightEntities';
import { setupPresetButtons } from './setupPresetButtons';
import { supportedRemotes } from './supportedRemotes';

const buildCommand = (command: number) => [0x4, 0x2, ...intToBytes(command)];

export const okimat = async (mqtt: IMQTTConnection, esphome: IESPConnection) => {
  const devices = getDevices();
  if (!devices.length) return logInfo('[Okimat] No devices configured');

  const devicesMap = buildDictionary(devices, (device) => ({ key: device.name, value: device }));
  const deviceNames = Object.keys(devicesMap);
  if (deviceNames.length !== devices.length) return logError('[Okimat] Duplicate name detected in configuration');
  const bleDevices = await esphome.getBLEDevices(deviceNames);
  for (const bleDevice of bleDevices) {
    const { name, mac, address, connect, disconnect, getServices, getDeviceInfo } = bleDevice;
    const { remoteCode, ...device } = devicesMap[mac] || devicesMap[name];
    const remote = supportedRemotes[remoteCode];
    if (!remote) {
      logError(`[Okimat] Unsupported remote code '${remoteCode}' for device:`, name);
      continue;
    }
    const deviceData = buildMQTTDeviceData({ ...device, address }, 'Okimat');
    await connect();
    const services = await getServices();

    const service = services.find((s) => s.uuid === '62741523-52f9-8864-b1ab-3b3a8d65950b');
    if (!service) {
      logInfo('[Okimat] Could not find expected services for device:', name);
      await disconnect();
      continue;
    }

    const writeCharacteristic = service.characteristicsList.find(
      (c) => c.uuid === '62741525-52f9-8864-b1ab-3b3a8d65950b'
    );
    if (!writeCharacteristic) {
      logInfo('[Okimat] Could not find expected characteristic for device:', name);
      await disconnect();
      continue;
    }

    const notifyHandles: Dictionary<number> = {};
    const feedbackCharacteristic = service.characteristicsList.find(
      (c) => c.uuid === '62741625-52f9-8864-b1ab-3b3a8d65950b'
    );
    if (feedbackCharacteristic) notifyHandles['feedback'] = feedbackCharacteristic.handle;

    const controller = new BLEController(
      deviceData,
      bleDevice,
      writeCharacteristic.handle,
      buildCommand,
      notifyHandles
    );
    logInfo('[Okimat] Setting up entities for device:', name);
    const deviceInfo = await getDeviceInfo();
    if (deviceInfo) setupDeviceInfoSensor(mqtt, controller, deviceInfo);
    const { modelNumber } = deviceInfo || {};
    if (modelNumber) logInfo('[Okimat] Model number:', modelNumber);
    setupLightEntities(mqtt, controller, remote);
    setupPresetButtons(mqtt, controller, remote);
  }
};
