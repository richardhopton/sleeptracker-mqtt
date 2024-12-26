import { NumberSlider } from '@ha/NumberSlider';
import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { IController } from 'Common/IController';
import { IEventSource } from 'Common/IEventSource';
import { buildEntityConfig } from 'Common/buildEntityConfig';
import { Commands } from './Commands';

export const setupMassageEntities = (
  mqtt: IMQTTConnection,
  { cache, deviceData, writeCommand, on }: IController<number[]> & IEventSource
) => {
  if (!cache.massageHead) {
    const slider = (cache.massageHead = new NumberSlider(
      mqtt,
      deviceData,
      { min: 0, max: 10, ...buildEntityConfig('MassageHead') },
      async (state) => await writeCommand(Commands.MassageHead(state))
    ).setOnline());
    on('notify', (bytes) => {
      if (bytes.length === 9) slider.setState(bytes[4]);
    });
  }

  if (!cache.massageFoot) {
    const slider = (cache.massageFoot = new NumberSlider(
      mqtt,
      deviceData,
      { min: 0, max: 10, ...buildEntityConfig('MassageFoot') },
      async (state) => await writeCommand(Commands.MassageFoot(state))
    ).setOnline());
    on('notify', (bytes) => {
      if (bytes.length === 9) slider.setState(bytes[5]);
    });
  }

  if (!cache.massageWave) {
    cache.massageWave = new NumberSlider(
      mqtt,
      deviceData,
      { min: 1, max: 4, ...buildEntityConfig('MassageWave') },
      async (state) => await writeCommand(Commands.MassageWave(state))
    ).setOnline();
  }
};
