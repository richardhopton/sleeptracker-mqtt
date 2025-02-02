import { logError, logInfo } from '@utils/logger';
import { getDevices } from './options';
import { IESPConnection } from 'ESPHome/IESPConnection';
import { buildDictionary } from '@utils/buildDictionary';
import { Deferred } from '@utils/deferred';
import { IBLEDevice } from 'ESPHome/types/IBLEDevice';

const characteristicPropertyValues = {
  BROADCAST: 0x01,
  READ: 0x02,
  WRITE_NO_RESPONSE: 0x04,
  WRITE: 0x08,
  NOTIFY: 0x10,
  INDICATE: 0x20,
  AUTHENTICATED: 0x40,
  EXTENDED: 0x80,
};
const buildPropertiesList = (properties: number) => {
  const propertiesList: (number | string)[] = [];

  for (const [name, value] of Object.entries(characteristicPropertyValues)) {
    if ((properties & value) === value) {
      properties -= value;
      propertiesList.push(name);
      if (properties === 0) break;
    }
  }
  return [properties, ...propertiesList.sort()];
};

export const scanner = async (esphome: IESPConnection) => {
  const devices = getDevices();
  const devicesMap = buildDictionary(devices, (device) => ({ key: device.name.toLowerCase(), value: device }));
  const deviceNames = Object.keys(devicesMap);
  if (deviceNames.length !== devices.length) return logError('[Scanner] Duplicate name detected in configuration');

  const complete = new Deferred<void>();
  const logDevice = async ({ name, mac, advertisement }: IBLEDevice) => {
    logInfo(`[Scanner] Found device: ${name} (${mac}):\n${JSON.stringify(advertisement)}`);
  };

  const handleMatchingDevice = async (bleDevice: IBLEDevice) => {
    const { name, mac } = bleDevice;

    let index = deviceNames.indexOf(mac);
    if (index === -1) index = deviceNames.indexOf(name.toLowerCase());
    if (index === -1) return;

    logDevice(bleDevice);
    deviceNames.splice(index, 1);
    const { connect, disconnect, pair, getDeviceInfo, getServices } = bleDevice;
    logInfo(`[Scanner] Connecting`);
    await connect();
    const device = devicesMap[mac] || devicesMap[name.toLowerCase()];
    if (device.pair) {
      logInfo('[Scanner] Pairing');
      await pair();
    }

    logInfo('[Scanner] Querying GATT services');
    const services = await getServices();

    logInfo('[Scanner] Extracting device info');
    const deviceInfo = await getDeviceInfo();

    const serviceList = await Promise.all(
      services.map(async (service) => {
        const characteristicList = await Promise.all(
          service.characteristicsList.map(async (characteristic) => {
            const { properties, handle } = characteristic;
            const propertyList = buildPropertiesList(properties);
            let data;
            if ((properties & 2) === 2) {
              try {
                const value = await bleDevice.readCharacteristic(handle);
                const buffer = Buffer.from(value);
                data = {
                  base64: buffer.toString('base64'),
                  ascii: buffer.toString(),
                  raw: Array.from(value),
                };
              } catch {
                data = 'Read Error';
                console.error(`Couldn't read characteristic 0x${handle.toString(16)}`);
              }
            }
            return { ...characteristic, properties: propertyList, ...(data ? { data } : {}) };
          })
        );
        return {
          ...service,
          characteristicsList: characteristicList.sort(({ uuid: uuidA }, { uuid: uuidB }) =>
            uuidA.localeCompare(uuidB)
          ),
        };
      })
    );
    const { address, addressType, rssi, manufacturerDataList, serviceUuidsList, serviceDataList } =
      bleDevice.advertisement;
    const deviceData = {
      name,
      mac,
      address,
      addressType,
      rssi,
      manufacturerDataList,
      serviceDataList,
      serviceUuidsList,
      ...(deviceInfo ? { deviceInfo } : {}),
      serviceList: serviceList.sort(({ uuid: uuidA }, { uuid: uuidB }) => uuidA.localeCompare(uuidB)),
    };

    logInfo(`[Scanner] Output:\n${JSON.stringify(deviceData, null, 2)}`);

    await disconnect();

    if (deviceNames.length) return;
    complete.resolve();
  };

  const worker = devices.length ? handleMatchingDevice : logDevice;
  if (!devices.length) logInfo('[Scanner] No devices configured, logging all named devices');
  await esphome.discoverBLEDevices(worker, complete, (name) => name?.replace(/\0/g, ''));
  esphome.disconnect();
  logInfo('[Scanner] Done');
  return;
};
