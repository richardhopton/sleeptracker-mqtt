import { Button } from '@ha/Button';
import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { StringsKey, getString } from '@utils/getString';
import { logError } from '@utils/logger';
import { IController } from 'Common/IController';
import { buildEntityConfig } from 'Common/buildEntityConfig';
import { Commands } from './Commands';

interface PresetButtonEntities {
  presetMemory1?: Button;
  programMemory1?: Button;

  presetMemory2?: Button;
  programMemory2?: Button;

  presetMemory3?: Button;
  programMemory3?: Button;

  presetMemory4?: Button;
  programMemory4?: Button;
}

export const setupPresetButtons = (
  mqtt: IMQTTConnection,
  { cache, deviceData, writeCommand }: IController<number[]>
) => {
  const buildCachedButton = (
    key: keyof PresetButtonEntities,
    name: StringsKey,
    command: number[],
    { category, repeat }: { category?: string; repeat?: true } = {}
  ) => {
    if (cache[key]) return;

    cache[key] = new Button(mqtt, deviceData, buildEntityConfig(name, category), async () => {
      try {
        await writeCommand(command, repeat && 30_000, repeat && 300);
      } catch (e) {
        logError(`[Linak] Failed to write '${getString(name)}'`, e);
      }
    }).setOnline();
  };

  buildCachedButton('presetMemory1', 'PresetMemory1', Commands.PresetMemory1, { repeat: true });
  buildCachedButton('presetMemory2', 'PresetMemory2', Commands.PresetMemory2, { repeat: true });
  buildCachedButton('presetMemory3', 'PresetMemory3', Commands.PresetMemory3, { repeat: true });
  buildCachedButton('presetMemory4', 'PresetMemory4', Commands.PresetMemory4, { repeat: true });

  buildCachedButton('programMemory1', 'ProgramMemory1', Commands.ProgramMemory1, { category: 'config' });
  buildCachedButton('programMemory2', 'ProgramMemory2', Commands.ProgramMemory2, { category: 'config' });
  buildCachedButton('programMemory3', 'ProgramMemory3', Commands.ProgramMemory3, { category: 'config' });
  buildCachedButton('programMemory4', 'ProgramMemory4', Commands.ProgramMemory4, { category: 'config' });
};
