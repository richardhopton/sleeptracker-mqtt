import { IDeviceData } from '@ha/IDeviceData';
import { intToBytes } from '@utils/intToBytes';
import { BLEController } from 'BLE/BLEController';
import { IBLEDevice } from 'ESPHome/types/IBLEDevice';

const buildCommand = (command: number) => {
  const data = [0xe5, 0xfe, 0x16, ...intToBytes(command).reverse()];
  const checksum = data.reduce((acc, cur) => (acc + cur) & 255);
  data.push(checksum);
  return data;
};

export const controllerBuilder = async (deviceData: IDeviceData, bleDevice: IBLEDevice) => {
  const { getCharacteristic } = bleDevice;

  const writeCharacteristic = await getCharacteristic(
    '0000ffe5-0000-1000-8000-00805f9b34fb',
    '0000ffe9-0000-1000-8000-00805f9b34fb'
  );
  if (!writeCharacteristic) return undefined;

  const notifyCharacteristic = await getCharacteristic(
    '0000ffe0-0000-1000-8000-00805f9b34fb',
    '0000ffe4-0000-1000-8000-00805f9b34fb',
    false
  );
  const notifyHandles = notifyCharacteristic && { notify: notifyCharacteristic.handle };

  return new BLEController(deviceData, bleDevice, writeCharacteristic.handle, buildCommand, notifyHandles);
};
