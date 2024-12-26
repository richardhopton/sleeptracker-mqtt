import { Button } from '@ha/Button';
import { NumberSlider } from '@ha/NumberSlider';
import { Select } from '@ha/Select';
import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { getString } from '@utils/getString';
import { buildEntityConfig } from 'Common/buildEntityConfig';
import { Commands, MassageZone } from './Commands';
import { Controller } from './Controller';

interface MassageEntities {
  massageStop?: Button;
  massageHead?: NumberSlider;
  massageLumbar?: NumberSlider;
  massageLeg?: NumberSlider;
  massagePreset?: Select;
}

export const setupMassageEntities = (mqtt: IMQTTConnection, { cache: cache, deviceData, writeCommand }: Controller) => {
  const resetState = async () => {
    let { massagePreset, massageHead, massageLumbar, massageLeg } = cache as MassageEntities;
    massagePreset?.setIndex(0);
    massageHead?.setState(0);
    massageLumbar?.setState(0);
    massageLeg?.setState(0);
    await writeCommand(Commands.MassageStop);
  };

  if (!cache.massageStop)
    cache.massageStop = new Button(mqtt, deviceData, buildEntityConfig('MassageStop'), resetState).setOnline();

  if (!cache.massagePreset) {
    const massagePresets = [
      getString('Off'),
      getString('Ripple'),
      getString('Wave'),
      getString('Waves'),
      getString('Pulse'),
    ];
    cache.massagePreset = new Select(
      mqtt,
      deviceData,
      {
        options: massagePresets,
        ...buildEntityConfig('MassageMode'),
      },
      async (state) => {
        const presetId = massagePresets.indexOf(state);
        if (presetId <= 0) return resetState();
        await writeCommand(Commands.MassagePreset(presetId - 1));
        let { massagePreset, massageHead, massageLumbar, massageLeg } = cache as MassageEntities;
        if ((massagePreset?.getIndex() || 0) === 0) {
          massageHead?.setState(5);
          massageLumbar?.setState(5);
          massageLeg?.setState(5);
        }
      }
    ).setOnline();
  }

  const getLevelCommand = (zone: MassageZone, level: number) => {
    const { massagePreset } = cache as MassageEntities;

    const commandBuilder = !(massagePreset?.getIndex() || 0)
      ? Commands.MassageLevelManual
      : Commands.MassageLevelPreset;
    return commandBuilder(zone, level);
  };

  const resetWhenLevelsAreZero = async ({ head, lumbar, leg }: { head?: number; lumbar?: number; leg?: number }) => {
    let { massageHead, massageLumbar, massageLeg } = cache as MassageEntities;
    if (head === undefined) head = massageHead?.getState();
    if (lumbar === undefined) lumbar = massageLumbar?.getState();
    if (leg === undefined) leg = massageLeg?.getState();
    if (head === 0 && lumbar === 0 && leg === 0) {
      await resetState();
    }
  };

  if (!cache.massageHead) {
    cache.massageHead = new NumberSlider(
      mqtt,
      deviceData,
      { min: 0, max: 10, ...buildEntityConfig('MassageHead') },
      async (level) => {
        await writeCommand(getLevelCommand(MassageZone.Head, level));
        await resetWhenLevelsAreZero({ head: level });
      }
    ).setOnline();
  }

  if (!cache.massageLumbar) {
    cache.massageLumbar = new NumberSlider(
      mqtt,
      deviceData,
      { min: 0, max: 10, ...buildEntityConfig('MassageLumbar') },
      async (level) => {
        await writeCommand(getLevelCommand(MassageZone.Lumbar, level));
        await resetWhenLevelsAreZero({ lumbar: level });
      }
    ).setOnline();
  }

  if (!cache.massageLeg) {
    cache.massageLeg = new NumberSlider(
      mqtt,
      deviceData,
      { min: 0, max: 10, ...buildEntityConfig('MassageLeg') },
      async (level) => {
        await writeCommand(getLevelCommand(MassageZone.Leg, level));
        await resetWhenLevelsAreZero({ leg: level });
      }
    ).setOnline();
  }
};
