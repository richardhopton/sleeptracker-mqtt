import { IDeviceData } from '@ha/IDeviceData';
import { Dictionary } from '@utils/Dictionary';

export interface IDeviceCache {
  cache: Dictionary<Object>;
  deviceData: IDeviceData;
}

export interface IController<TCommand> extends IDeviceCache {
  writeCommand: (command: TCommand, duration?: number, frequency?: number) => Promise<void>;
  writeCommands: (commands: TCommand[], duration?: number, frequency?: number) => Promise<void>;
  cancelCommands: () => Promise<void>;
}
