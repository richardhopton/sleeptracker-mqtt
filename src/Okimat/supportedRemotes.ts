import { Dictionary } from '@utils/Dictionary';
import { Remote } from './Remote';

export const supportedRemotes: Dictionary<Remote> = {
  '80608': {
    name: 'RFS ELLIPSE',
    commands: {
      Flat: 0x100000aa,
      BackDown: 0x2,
      BackUp: 0x1,
      LegsDown: 0x8,
      LegsUp: 0x4,
      UBL: 0x20000,
    },
  },
  '94238': {
    name: 'RF FLASHLINE',
    commands: {
      Flat: 0x10000000,
      BackDown: 0x2,
      BackUp: 0x1,
      LegsDown: 0x8,
      LegsUp: 0x4,
      Memory1: 0x1000,
      Memory2: 0x2000,
      MemorySave: {
        data: 0x10000,
        frequency: 200,
        duration: 5000,
      },
      UBL: {
        data: 0x20000,
        frequency: 100,
        duration: 5000,
      },
    },
  },
  '88875': {
    name: 'RF LITELINE',
    commands: {
      Flat: 0x100000aa,
      BackDown: 0x2,
      BackUp: 0x1,
      LegsDown: 0x8,
      LegsUp: 0x4,
      UBL: 0x20000,
    },
  },
  '82417': {
    name: 'RF TOPLINE',
    commands: {
      Flat: 0x000000AA,
      BackDown: 0x2,
      BackUp: 0x1,
      LegsDown: 0x8,
      LegsUp: 0x4,
      UBL: 0x20000,
    },
  },
};
