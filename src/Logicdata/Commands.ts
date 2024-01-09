export enum MassageZone {
  Head,
  Lumbar,
  Leg,
}
export enum MassagePreset {
  Ripple,
  Wave,
  Waves,
  Pulse,
}
const buildPresetMemoryCommand = (position: number) => [
  0x33,
  0x05,
  0x32,
  0x03,
  0x94,
  0x5c,
  position,
  0x00,
  position ^ 200 ^ 0,
];
const buildProgramMemoryCommand = (position: number) => [
  0x33,
  0x05,
  0x32,
  0x03,
  0x94,
  0x5b,
  position,
  0x00,
  position ^ 207 ^ 0,
];
export const Commands = {
  Flat: [0x33, 0x05, 0x32, 0x0a, 0x94, 0x5c, 0x04, 0x00, 0xcc],
  HeadUp: [0x33, 0x05, 0x32, 0x18, 0x94, 0x53, 0x00, 0x05, 0xc2],
  HeadDown: [0x33, 0x05, 0x32, 0x18, 0x94, 0x54, 0x00, 0x05, 0xc5],
  LegUp: [0x33, 0x05, 0x32, 0x18, 0x94, 0x51, 0x01, 0x00, 0xc4],
  LegDown: [0x33, 0x05, 0x32, 0x18, 0x94, 0x52, 0x01, 0x00, 0xc7],
  PresetMemory1: buildPresetMemoryCommand(0),
  PresetMemory2: buildPresetMemoryCommand(1),
  PresetMemory3: buildPresetMemoryCommand(2),
  PresetMemory4: buildPresetMemoryCommand(3),
  ProgramMemory1: buildProgramMemoryCommand(0),
  ProgramMemory2: buildProgramMemoryCommand(1),
  ProgramMemory3: buildProgramMemoryCommand(2),
  ProgramMemory4: buildProgramMemoryCommand(3),
  MassageStop: [0x33, 0x05, 0x32, 0x0a, 0x94, 0x86, 0x00, 0x00, 0x12],
  MassagePreset: (preset: MassagePreset) => [
    0x33,
    0x05,
    0x32,
    0x03,
    0x94,
    0x8d,
    preset,
    0x78,
    preset + (preset % 2 == 0 ? 0x61 : 0x5f),
  ],
  MassageLevelManual: (zone: MassageZone, level: number) => [
    0x33,
    0x05,
    0x32,
    0x03,
    0x94,
    0x85,
    zone,
    level * 24,
    zone ^ 17 ^ (level * 24),
  ],
  MassageLevelPreset: (zone: MassageZone, level: number) => [
    0x33,
    0x05,
    0x32,
    0x03,
    0x94,
    0x8e,
    zone,
    level * 24,
    zone ^ 26 ^ (level * 24),
  ],
};
