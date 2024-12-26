import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { IController } from 'Common/IController';
import { buildCommandButton } from 'Common/buildCommandButton';
import { buildCommandSwitch } from 'Common/buildCommandSwitch';
import { Commands } from './Commands';

export const setupLightEntities = (mqtt: IMQTTConnection, controller: IController<number[]>) => {
  buildCommandButton('Linak', mqtt, controller, 'UnderBedLightsToggle', Commands.UnderBedLightsToggle);
  buildCommandSwitch(
    'Linak',
    mqtt,
    controller,
    'UnderBedLights',
    Commands.UnderBedLightsOn,
    Commands.UnderBedLightsOff
  );
};
