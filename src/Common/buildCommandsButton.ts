import { Button } from '@ha/Button';
import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { StringsKey, getString } from '@utils/getString';
import { logError } from '@utils/logger';
import { IController } from './IController';
import { buildEntityConfig } from './buildEntityConfig';

export const buildCommandsButton = <TCommand>(
  context: string,
  mqtt: IMQTTConnection,
  { cache, deviceData, writeCommands }: IController<TCommand>,
  name: StringsKey,
  commands: TCommand[],
  category?: string,
  duration?: number,
  frequency?: number
) => {
  if (cache[name]) return;

  cache[name] = new Button(mqtt, deviceData, buildEntityConfig(name, category), async () => {
    try {
      await writeCommands(commands, duration, frequency);
    } catch (e) {
      logError(`[${context}] Failed to write '${getString(name)}'`, e);
    }
  }).setOnline();
};
