import { Cover } from '@ha/Cover';
import { IMQTTConnection } from '@mqtt/IMQTTConnection';
import { buildEntityConfig } from 'Common/buildEntityConfig';
import { Commands } from 'Common/Commands';
import { IController } from 'Common/IController';
import { Cancelable } from 'Common/Cancelable';
import { ICache } from 'Common/ICache';

interface MotorState {
  head?: boolean;
  feet?: boolean;
  pillow?: boolean;
  lumbar?: boolean;
}

interface Cache {
  motorState?: MotorState & Cancelable;
}

const move = (motorState: MotorState) => {
  let command = 0;
  const { head, feet, pillow, lumbar } = motorState;
  if (head !== undefined) command += head ? Commands.MotorHeadUp : Commands.MotorHeadDown;
  if (feet !== undefined) command += feet ? Commands.MotorFeetUp : Commands.MotorFeetDown;
  if (pillow !== undefined) command += pillow ? Commands.MotorTiltUp : Commands.MotorTiltDown;
  if (lumbar !== undefined) command += lumbar ? Commands.MotorLumbarUp : Commands.MotorLumbarDown;
  return command ? command : undefined;
};

export const setupMotorEntities = (
  mqtt: IMQTTConnection,
  { cache, deviceData, writeCommand, cancelCommands }: IController<number> & ICache<Cache>
) => {
  if (!cache.motorState) cache.motorState = {};

  const buildCoverCommand = (motor: keyof MotorState) => async (command: string) => {
    const motorState = cache.motorState!;
    const originalCommand = move(motorState);
    motorState[motor] = command === 'OPEN' ? true : command === 'CLOSE' ? false : undefined;
    const newCommand = move(motorState);
    if (newCommand === originalCommand) return;

    motorState.canceled = true;
    await cancelCommands();
    motorState.canceled = false;

    if (!newCommand) return;

    await writeCommand(newCommand, 25, 200);
    if (motorState.canceled) return;
    cache.motorState = {};
  };

  if (!cache.headMotor) {
    cache.headMotor = new Cover(
      mqtt,
      deviceData,
      buildEntityConfig('MotorHead', { icon: 'mdi:head' }),
      buildCoverCommand('head')
    ).setOnline();
  }

  if (!cache.feetMotor) {
    cache.feetMotor = new Cover(
      mqtt,
      deviceData,
      buildEntityConfig('MotorFeet', { icon: 'mdi:foot-print' }),
      buildCoverCommand('feet')
    ).setOnline();
  }

  if (!cache.pillowMotor) {
    cache.pillowMotor = new Cover(
      mqtt,
      deviceData,
      buildEntityConfig('MotorPillow', { icon: 'mdi:pillow' }),
      buildCoverCommand('pillow')
    ).setOnline();
  }

  if (!cache.lumbarMotor) {
    cache.lumbarMotor = new Cover(
      mqtt,
      deviceData,
      buildEntityConfig('MotorLumbar', { icon: 'mdi:lumbar' }),
      buildCoverCommand('lumbar')
    ).setOnline();
  }
};
