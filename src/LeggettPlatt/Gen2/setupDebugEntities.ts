import { Button } from '@ha/Button';
import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { IController } from 'Common/IController';
import { Commands } from './Commands';

interface DebugEntities {
  refreshState?: Button;
}

export const setupDebugEntities = (
  mqtt: IMQTTConnection,
  { cache, deviceData, writeCommand }: IController<number[]>
) => {
  void writeCommand(Commands.GetState);

  let { refreshState } = cache as DebugEntities;
  if (refreshState) return;

  cache.refreshState = new Button(mqtt, deviceData, { description: 'Refresh State' }, async () => {
    await writeCommand(Commands.GetState);
  }).setOnline();
};
