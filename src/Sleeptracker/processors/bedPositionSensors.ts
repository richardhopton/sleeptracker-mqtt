import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { buildEntityName } from '@utils/buildEntityName';
import { BedPositionSensor } from '../entities/BedPositionSensor';
import { Bed } from '../types/Bed';
import { Controller } from '../types/Controller';
import { Snapshot } from '../types/Snapshot';

interface BedPositionEntities {
  headPosition?: BedPositionSensor;
  footPosition?: BedPositionSensor;
}

export const processBedPositionSensors = async (
  mqtt: IMQTTConnection,
  { deviceData, data: { headAngleTicksPerDegree, footAngleTicksPerDegree } }: Bed,
  { sideName, entities }: Controller,
  snapshot: Snapshot
) => {
  const cache = entities as BedPositionEntities;

  if (!cache.headPosition) {
    cache.headPosition = new BedPositionSensor(mqtt, deviceData, buildEntityName('Head Angle', sideName));
  }
  cache.headPosition.setBedPosition(snapshot.head.motor, headAngleTicksPerDegree);

  if (!cache.footPosition) {
    cache.footPosition = new BedPositionSensor(mqtt, deviceData, buildEntityName('Foot Angle', sideName));
  }
  cache.footPosition.setBedPosition(snapshot.foot.motor, footAngleTicksPerDegree);
};
