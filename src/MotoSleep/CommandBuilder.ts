import { StringsKey } from '@utils/getString';

type CommandOptions = {
  category?: string;
};

export type SimpleCommand = {
  name: StringsKey;
  command: number[];
  type: 'simple';
  category?: string;
};
export type ComplexCommand = {
  name: StringsKey;
  commands: { up: number[]; down: number[] };
  type: 'complex';
};
type Command = SimpleCommand | ComplexCommand;

export const buildCommands = (name: string) => {
  const buildSimpleCommand = (
    name: StringsKey,
    commandCode: string,
    { category }: CommandOptions = {}
  ): SimpleCommand => ({
    name,
    command: [0x24, commandCode.charCodeAt(0)],
    type: 'simple',
    category,
  });
  const buildComplexCommand = (name: StringsKey, upCommandCode: string, downCommandCode: string): ComplexCommand => ({
    name,
    commands: { up: [0x24, upCommandCode.charCodeAt(0)], down: [0x24, downCommandCode.charCodeAt(0)] },
    type: 'complex',
  });
  const [remoteType, motorNumber] = name.substring(8, 10).split('');
  const commands: Command[] = [buildComplexCommand('MotorHead', 'K', 'L'), buildSimpleCommand('PresetHome', 'O')];
  if (!(motorNumber === '1' || (remoteType === '5' && motorNumber !== '5'))) {
    commands.push(buildComplexCommand('MotorFeet', 'M', 'N'));
  }
  if (
    (['1', '2', '4', '5', '6', '7'].includes(remoteType) && motorNumber === '5') ||
    ['B', 'C', '7', '8', '0'].includes(remoteType) ||
    (['3', '4'].includes(remoteType) && ['1', '2', '3', '4'].includes(motorNumber)) ||
    (remoteType === '9' && ['5', '6', '7', '8'].includes(motorNumber))
  ) {
    commands.push(
      buildSimpleCommand('PresetMemory1', 'U'),
      buildSimpleCommand('ProgramMemory1', 'Z', { category: 'config' }),
      buildSimpleCommand('PresetMemory2', 'V'),
      buildSimpleCommand('ProgramMemory2', 'a', { category: 'config' })
    );

    if (!['7', '8', '9', '0'].includes(remoteType)) {
      commands.push(
        buildSimpleCommand('PresetAntiSnore', 'R'),
        buildSimpleCommand('ProgramAntiSnore', 'W', { category: 'config' }),
        buildSimpleCommand('PresetTV', 'S'),
        buildSimpleCommand('ProgramTV', 'X', { category: 'config' }),
        buildSimpleCommand('PresetZeroG', 'T'),
        buildSimpleCommand('ProgramZeroG', 'Y', { category: 'config' })
      );
    }
  }
  if (['8', '9'].includes(remoteType) && ['2', '5', '6', '7', '8'].includes(motorNumber)) {
    commands.push(
      buildSimpleCommand('PresetAntiSnore', 'R'),
      buildSimpleCommand('PresetTV', 'S'),
      buildSimpleCommand('PresetZeroG', 'T')
    );
  }
  if (
    (['3', '4', '8'].includes(remoteType) && ['3', '5'].includes(motorNumber)) ||
    ['A', 'B'].includes(remoteType) ||
    (remoteType === '7' && motorNumber !== '5') ||
    (remoteType === '9' && ['5', '6', '7', '8'].includes(motorNumber))
  ) {
    commands.push(
      buildSimpleCommand('MassageHeadStep', 'C'),
      buildSimpleCommand('MassageFootStep', 'B'),
      buildSimpleCommand('Stop', 'D')
    );
  }
  if ((remoteType === '4' && ['3', '5'].includes(motorNumber)) || remoteType === '0') {
    commands.push(buildSimpleCommand('MassageHeadOff', 'J'), buildSimpleCommand('MassageFootOff', 'I'));
  }

  if (
    !(['5', '6'].includes(remoteType) && motorNumber !== '5') &&
    !(remoteType === '9' && !['5', '6', '7', '8'].includes(motorNumber)) &&
    remoteType !== '0'
  ) {
    commands.push(buildSimpleCommand('UnderBedLightsToggle', 'A'));
  }

  if (
    (['3', '4'].includes(remoteType) && ['3', '4'].includes(motorNumber)) ||
    (['5', '7'].includes(remoteType) && motorNumber === '5') ||
    (remoteType === '9' && motorNumber === '7')
  ) {
    commands.push(buildComplexCommand('MotorNeck', 'P', 'Q'));
  }
  if (
    (['1', '2', '3', '4', '6', '8'].includes(remoteType) && motorNumber === '5') ||
    ['A', 'B', 'C'].includes(remoteType)
  ) {
    commands.push(buildComplexCommand('MotorLumbar', 'P', 'Q'));
  }
  if (
    (['3', '4'].includes(remoteType) && motorNumber === '4') ||
    (remoteType === '7' && motorNumber === '5') ||
    (remoteType === '9' && ['7', '8'].includes(motorNumber))
  ) {
    commands.push(buildComplexCommand('MotorLumbar', 'p', 'q'));
  }
  if (remoteType === '5' && motorNumber === '5') {
    commands.push(buildComplexCommand('MotorTilt', 'p', 'q'));
  }
  if (remoteType === '0' || (remoteType === '9' && motorNumber === '5')) {
    commands.push(buildComplexCommand('MotorTilt', 'P', 'Q'));
  }
  if (remoteType === '0') {
    commands.push(
      buildComplexCommand('MotorAll', 'p', 'q'),
      buildSimpleCommand('MassageHeadUp', 'G'),
      buildSimpleCommand('MassageHeadDown', 'H'),
      buildSimpleCommand('MassageFootUp', 'E'),
      buildSimpleCommand('MassageFootDown', 'F')
    );
  }

  return commands;
};
