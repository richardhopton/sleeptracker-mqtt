import { readFileSync } from 'fs';

export type Type =
  | 'sleeptracker'
  | 'ergomotion'
  | 'ergowifi'
  | 'richmat'
  | 'linak'
  | 'solace'
  | 'motosleep'
  | 'reverie'
  | 'leggettplatt'
  | 'logicdata'
  | 'okimat'
  | 'keeson'
  | 'octo';

interface OptionsJson {
  type: Type;
}

const fileContents = readFileSync('../data/options.json');
const options: OptionsJson = JSON.parse(fileContents.toString());
export const getRootOptions = (): any => options;

export const getType = () => options.type;
