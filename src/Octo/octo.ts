import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { buildDictionary } from '@utils/buildDictionary';
import { Deferred } from '@utils/deferred';
import { logError, logInfo } from '@utils/logger';
import { BLEController } from 'BLE/BLEController';
import { setupDeviceInfoSensor } from 'BLE/setupDeviceInfoSensor';
import { buildMQTTDeviceData } from 'Common/buildMQTTDeviceData';
import { IESPConnection } from 'ESPHome/IESPConnection';
import { calculateChecksum } from './calculateChecksum';
import { extractFeatureValuePairFromData } from './extractFeaturesFromData';
import { extractPacketFromMessage } from './extractPacketFromMessage';
import { getDevices } from './options';
import { setupLightSwitch } from './setupLightSwitch';
import { setupMotorEntities } from './setupMotorEntities';

export type Command = {
  command: number[];
  data?: number[];
};

const buildComplexCommand = ({ command, data }: Command) => {
  const dataLen = data?.length || 0;

  const bytes = [
    0x40,
    ...command,
    dataLen >> 8,
    dataLen,
    0x0, // checksum byte
    ...(data || []),
    0x40,
  ].map((byte) => byte & 0xff);
  bytes[5] = calculateChecksum(bytes);
  return bytes;
};

export const octo = async (mqtt: IMQTTConnection, esphome: IESPConnection) => {
  const devices = getDevices();
  if (!devices.length) return logInfo('[Octo] No devices configured');

  const devicesMap = buildDictionary(devices, (device) => ({ key: device.name, value: device }));
  const deviceNames = Object.keys(devicesMap);
  if (deviceNames.length !== devices.length) return logError('[Octo] Duplicate name detected in configuration');
  const bleDevices = await esphome.getBLEDevices(deviceNames);
  for (const bleDevice of bleDevices) {
    const { name, mac, address, connect, disconnect, getServices, getDeviceInfo } = bleDevice;
    const { pin, ...device } = devicesMap[mac] || devicesMap[name];
    const deviceData = buildMQTTDeviceData({ ...device, address }, 'Octo');
    await connect();

    const services = await getServices();
    const service = services.find((s) => s.uuid === '0000ffe0-0000-1000-8000-00805f9b34fb');
    if (!service) {
      logInfo('[Octo] Could not find expected services for device:', name);
      await disconnect();
      continue;
    }

    const characteristic = service.characteristicsList.find((c) => c.uuid === '0000ffe1-0000-1000-8000-00805f9b34fb');
    if (!characteristic) {
      logInfo('[Octo] Could not find expected characteristic for device:', name);
      await disconnect();
      continue;
    }

    const controller = new BLEController(
      deviceData,
      bleDevice,
      characteristic.handle,
      (command: number[] | Command) => buildComplexCommand(Array.isArray(command) ? { command: command } : command),
      {
        feedback: characteristic.handle,
      }
    );

    const featureState = { hasLight: false, lightState: false, hasPin: false, pinLock: false };
    const allFeaturesReturned = new Deferred<void>();

    const loadFeatures = (message: Uint8Array) => {
      const packet = extractPacketFromMessage(message);
      if (!packet) return;
      const { command, data } = packet;
      if (command[0] == 0x21 && command[1] == 0x71) {
        // features
        const featureValue = extractFeatureValuePairFromData(data);
        if (featureValue == null) return;

        const { feature, value } = featureValue;
        switch (feature) {
          case 0x3:
            featureState.hasPin = value[0] == 0x1;
            featureState.pinLock = value[1] !== 0x1;
            return;
          case 0x102:
            featureState.hasLight = true;
            featureState.lightState = value[0] == 0x1;
            return;
          case 0xffffff:
            return allFeaturesReturned.resolve();
        }
      }
    };
    controller.on('feedback', loadFeatures);

    logInfo('[Octo] Requesting features for device:', name);
    await controller.writeCommand([0x20, 0x71]); // request bed features
    await allFeaturesReturned;
    controller.off('feedback', loadFeatures);

    if (featureState.hasPin && featureState.pinLock) {
      if (pin?.length !== 4) {
        logError('[Octo] 4 Digit Numeric Pin Required But Not Provided');
        await disconnect();
        continue;
      }
      await controller.writeCommand({ command: [0x20, 0x42], data: pin.split('').map((c) => parseInt(c)) });
    }

    logInfo('[Octo] Setting up entities for device:', name);
    const deviceInfo = await getDeviceInfo();
    if (deviceInfo) setupDeviceInfoSensor(mqtt, controller, deviceInfo);

    if (featureState.hasLight) {
      setupLightSwitch(mqtt, controller, featureState.lightState);
    }
    setupMotorEntities(mqtt, controller);
  }
};
