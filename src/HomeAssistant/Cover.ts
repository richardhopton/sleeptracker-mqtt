import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { IDeviceData } from './IDeviceData';
import { Entity, EntityConfig } from './base/Entity';

export class Cover extends Entity {
  private commandTopic: string;

  constructor(
    mqtt: IMQTTConnection,
    deviceData: IDeviceData,
    entityConfig: EntityConfig,
    onCommand: (command: string) => void
  ) {
    super(mqtt, deviceData, entityConfig, 'cover');
    this.commandTopic = `${this.baseTopic}/command`;
    mqtt.subscribe(this.commandTopic);
    mqtt.on(this.commandTopic, (message) => {
      onCommand(message);
    });
  }

  discoveryState() {
    return {
      ...super.discoveryState(),
      command_topic: this.commandTopic,
    };
  }
}
