import { Button } from '@ha/Button';
import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { buildEntityConfig } from 'Common/buildEntityConfig';
import { Features } from 'Richmat/types/Features';
import { Commands } from './types/Commands';
import { Controller } from './types/Controller';

export const setupUnderBedLightButton = (mqtt: IMQTTConnection, controller: Controller) => {
  const { entities, deviceData, hasFeature, writeData } = controller;
  const cache = entities as { underBedLightsToggle?: Button };

  if (hasFeature(Features.UnderBedLightsToggle)) {
    let { underBedLightsToggle } = cache;

    if (!underBedLightsToggle) {
      underBedLightsToggle = cache.underBedLightsToggle = new Button(
        mqtt,
        deviceData,
        buildEntityConfig('UnderBedLightsToggle'),
        () => writeData(Commands.UnderBedLightsToggle)
      );
    }
    underBedLightsToggle.setOnline();
  }
};
