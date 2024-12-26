import Strings from 'Strings/en';
import { Dictionary } from './Dictionary';
let strings: Dictionary<string> = {};

export const loadStrings = async (language = 'en') => {
  const imported = await import(`../Strings/${language}`);
  strings = imported.default ? imported.default : imported;
};

export type StringsKey = keyof typeof Strings;

export const getString = (key: StringsKey) => strings[key] || key;
