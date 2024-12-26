import { StringsKey, getString } from '@utils/getString';

export const buildEntityConfig = (
  key: StringsKey,
  additionalConfig?: string | { category?: string; icon?: string }
) => {
  if (typeof additionalConfig === 'string') additionalConfig = { category: additionalConfig };
  return {
    description: getString(key),
    ...(additionalConfig || {}),
  };
};
