import { Select } from '@ha/Select';
import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { getString } from '@utils/getString';
import { IController } from 'Common/IController';
import { IEventSource } from 'Common/IEventSource';
import { Commands } from './Commands';

export const setupMassageEntities = (
  mqtt: IMQTTConnection,
  { deviceData, cache, writeCommand, on }: IController<number[]> & IEventSource
) => {
  if (!cache.massageHead) {
    const options = [getString('Off'), getString('Low'), getString('Medium'), getString('High')];
    const select = (cache.massageHead = new Select(
      mqtt,
      deviceData,
      {
        options,
        description: getString('MassageHead'),
      },
      async (state) => {
        const index = options.indexOf(state);
        await writeCommand(Commands.MassageHeadStrength(index));
        return state;
      }
    ).setOnline());
    on('read', (data: Uint8Array) => {
      const head = data[2] - 0x40;
      if ((head & 0x80) === 0x0) {
        select.setState(options[0]);
      } else {
        const strength = head - 0x80;
        select.setState(options[strength + 1]);
      }
    });
  }

  if (!cache.massageFoot) {
    const options = [getString('Off'), getString('Low'), getString('Medium'), getString('High')];
    const select = (cache.massageFoot = new Select(
      mqtt,
      deviceData,
      {
        options,
        description: getString('MassageFoot'),
      },
      async (state) => {
        const index = options.indexOf(state);
        await writeCommand(Commands.MassageFootStrength(index));
        return state;
      }
    ).setOnline());
    on('read', (data: Uint8Array) => {
      const foot = data[3] - 0x40;
      if ((foot & 0x80) === 0x0) {
        select.setState(options[0]);
      } else {
        const strength = foot - 0x80;
        select.setState(options[strength + 1]);
      }
    });
  }

  if (!cache.massageWave) {
    const options = [getString('Off'), '1', '2', '3'];
    const select = (cache.massageWave = new Select(
      mqtt,
      deviceData,
      {
        options,
        description: getString('MassageWave'),
      },
      async (state) => {
        const index = options.indexOf(state);
        if (index == 0) {
          await writeCommand(Commands.MassageWaveOff);
        } else {
          const currentState = select.getState();
          if (options.indexOf(currentState || options[0])) await writeCommand(Commands.MassageWaveOn);
          await writeCommand(Commands.MassageWaveLevel(index));
        }
        return state;
      }
    ).setOnline());
    on('read', (data: Uint8Array) => {
      const wave = data[0];
      if ((wave & 0x2) === 0x2) {
        select.setState(options[0]);
      } else {
        const level = wave / 0x10;
        select.setState(options[level + 1]);
      }
    });
  }
};
