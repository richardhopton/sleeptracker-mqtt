import { getRootOptions } from '@utils/options';

export interface OctoDevice {
  friendlyName: string;
  name: string;
  pin?: string;
}

interface OptionsJson {
  octoDevices: OctoDevice[];
}

const options: OptionsJson = getRootOptions();

export const getDevices = () => {
  const devices = options.octoDevices;
  if (Array.isArray(devices)) {
    return devices;
  }
  return [];
};
