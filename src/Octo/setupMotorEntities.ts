import { Cover } from '@ha/Cover';
import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { BLEController } from 'BLE/BLEController';
import { buildEntityConfig } from 'Common/buildEntityConfig';
import { Command } from './octo';

interface MotorState {
  direction: string;
  head: boolean;
  legs: boolean;
  canceled: boolean;
}

export const setupMotorEntities = (
  mqtt: IMQTTConnection,
  { cache, deviceData, writeCommand, cancelCommands }: BLEController<number[] | Command>
) => {
  if (!cache.motorState)
    cache.motorState = {
      direction: 'STOP',
      head: false,
      legs: false,
      canceled: false,
    };

  const sendMotorControlCommand = async () => {
    const motorState = cache.motorState as MotorState;
    motorState.canceled = true;
    await cancelCommands();
    motorState.canceled = false;

    const { head, legs, direction } = motorState;
    const motor = (head ? 0x2 : 0x0) + (legs ? 0x4 : 0x0);
    if (direction !== 'STOP' && motor !== 0x0) {
      const complexCommand = {
        command: [0x2, direction == 'OPEN' ? 0x70 : 0x71],
        data: [motor],
      };
      await writeCommand(complexCommand, 5_000, 200);
      if (motorState.canceled) return;
      motorState.direction = 'STOP';
    }
    motorState.head = false;
    motorState.legs = false;
    await writeCommand([0x2, 0x73]);
  };

  if (!cache.headMotor) {
    cache.headMotor = new Cover(
      mqtt,
      deviceData,
      buildEntityConfig('MotorHead', { icon: 'mdi:head' }),
      async (command) => {
        const motorState = cache.motorState as MotorState;
        const { head, legs, direction } = motorState;
        const moveMotors = command !== 'STOP';
        if (direction === command && head === moveMotors) return;

        motorState.head = !moveMotors;
        if (legs) {
          if (!moveMotors) command = direction;
          else if (direction != command) motorState.legs = false;
        }
        motorState.direction = command;

        await sendMotorControlCommand();
      }
    ).setOnline();
  }

  if (!cache.legsMotor) {
    cache.legsMotor = new Cover(
      mqtt,
      deviceData,
      buildEntityConfig('MotorLegs', { icon: 'mdi:foot-print' }),
      async (command) => {
        const motorState = cache.motorState as MotorState;
        const { head, legs, direction } = motorState;
        const moveMotors = command !== 'STOP';
        if (direction === command && legs === moveMotors) return;

        motorState.legs = !moveMotors;
        if (head) {
          if (!moveMotors) command = direction;
          else if (direction != command) motorState.head = false;
        }
        motorState.direction = command;

        await sendMotorControlCommand();
      }
    ).setOnline();
  }
};
