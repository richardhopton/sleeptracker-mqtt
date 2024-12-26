import { Switch } from '@ha/Switch';
import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { StringsKey, getString } from '@utils/getString';
import { logError } from '@utils/logger';
import { buildEntityConfig } from './buildEntityConfig';
import { IController } from './IController';

export const buildRepeatingCommandSwitch = <TCommand>(
  context: string,
  mqtt: IMQTTConnection,
  { cache, deviceData, writeCommand, cancelCommands }: IController<TCommand>,
  name: StringsKey,
  command: TCommand,
  category?: string,
  duration?: number,
  frequency?: number
) => {
  if (cache[name]) return;

  const entity = (cache[name] = new Switch(mqtt, deviceData, buildEntityConfig(name, category), async (state) => {
    if (!state) return cancelCommands();
    try {
      await writeCommand(command, duration, frequency);
      entity.setState(false);
    } catch (e) {
      logError(`[${context}] Failed to write '${getString(name)}'`, e);
    }
  }).setOnline());
};
