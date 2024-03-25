import { getRootOptions } from '@utils/options';

export type RemoteStyle = 'L' | 'M' | 'H';

export interface Credentials {
  email: string;
  password: string;
}

export interface ErgoWifiUser extends Credentials {
  remoteStyle: RemoteStyle;
}

interface OptionsJson {
  ergoMotionCredentials: ErgoWifiUser[];
  ergoWifiCredentials: ErgoWifiUser[];
}

const options: OptionsJson = getRootOptions();

export const getUsers = () => {
  const credentials = options.ergoWifiCredentials || options.ergoMotionCredentials;
  if (Array.isArray(credentials)) {
    return credentials;
  }
  return [];
};
