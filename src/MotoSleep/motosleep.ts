import { Cover } from '@ha/Cover';
import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { arrayEquals } from '@utils/arrayEquals';
import { buildDictionary } from '@utils/buildDictionary';
import { logError, logInfo } from '@utils/logger';
import { BLEController } from 'BLE/BLEController';
import { setupDeviceInfoSensor } from 'BLE/setupDeviceInfoSensor';
import { buildCommandButton } from 'Common/buildCommandButton';
import { buildEntityConfig } from 'Common/buildEntityConfig';
import { buildMQTTDeviceData } from 'Common/buildMQTTDeviceData';
import { IESPConnection } from 'ESPHome/IESPConnection';
import { buildCommands } from './CommandBuilder';
import { getDevices } from './options';

interface MotorState {
  command?: number[];
  canceled?: boolean;
}

export const motosleep = async (mqtt: IMQTTConnection, esphome: IESPConnection) => {
  const devices = getDevices();
  if (!devices.length) return logInfo('[MotoSleep] No devices configured');

  const devicesMap = buildDictionary(devices, (device) => ({ key: device.name, value: device }));
  const deviceNames = Object.keys(devicesMap);
  if (deviceNames.length !== devices.length) return logError('[MotoSleep] Duplicate name detected in configuration');
  const bleDevices = await esphome.getBLEDevices(deviceNames);
  for (const bleDevice of bleDevices) {
    const { name, mac, address, connect, disconnect, getServices } = bleDevice;
    const device = devicesMap[mac] || devicesMap[name];
    const deviceData = buildMQTTDeviceData({ ...device, address }, 'MotoSleep');
    await connect();
    const services = await getServices();
    if (!device.stayConnected) await disconnect();

    const service = services.find((s) => s.uuid === '0000ffe0-0000-1000-8000-00805f9b34fb');
    if (!service) {
      logInfo('[MotoSleep] Could not find expected services for device:', name);
      await disconnect();
      continue;
    }

    const characteristic = service.characteristicsList.find((c) => c.uuid === '0000ffe1-0000-1000-8000-00805f9b34fb');
    if (!characteristic) {
      logInfo('[MotoSleep] Could not find expected characteristic for device:', name);
      await disconnect();
      continue;
    }

    const controller = new BLEController(
      deviceData,
      bleDevice,
      characteristic.handle,
      (bytes: number[]) => bytes,
      {},
      device.stayConnected
    );
    logInfo('[MotoSleep] Setting up entities for device:', name);
    const commands = buildCommands(name);
    for (const { name, command, category } of commands.filter((c) => c.type == 'simple')) {
      buildCommandButton('MotoSleep', mqtt, controller, name, command, category);
    }

    const { cache, writeCommand, cancelCommands } = controller;
    if (!cache.motorState) cache.motorState = {};

    const sendMotorControlCommand = async (command: number[]) => {
      const motorState = cache.motorState as MotorState;
      motorState.canceled = true;
      await cancelCommands();
      motorState.canceled = false;

      if (!arrayEquals(command, [])) {
        await writeCommand(command, 5_000, 200);
        if (motorState.canceled) return;
        cache.motorState = {};
      }
    };
    for (const {
      name,
      commands: { up, down },
    } of commands.filter((c) => c.type == 'complex')) {
      const commandToCommand = (command: string) => {
        switch (command) {
          case 'OPEN':
            return up;
          case 'CLOSE':
            return down;
          default:
            return [];
        }
      };
      new Cover(mqtt, deviceData, buildEntityConfig(name), async (command) => {
        const motorState = cache.motorState as MotorState;
        const originalCommand = motorState.command || [];
        const newCommand = (motorState.command = commandToCommand(command));
        if (!arrayEquals(originalCommand, newCommand)) await sendMotorControlCommand(newCommand);
      }).setOnline();
    }

    const deviceInfo = await bleDevice.getDeviceInfo();
    if (deviceInfo) setupDeviceInfoSensor(mqtt, controller, deviceInfo);
  }
};
