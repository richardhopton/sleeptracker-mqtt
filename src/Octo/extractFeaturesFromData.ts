export const extractFeatureValuePairFromData = (data: number[]) => {
  const arr = Array.from(data);
  if (arr.length == 0) return null;

  const feature = arr.splice(0, 3).reduce((val, byte) => (val << 8) + byte, 0);
  arr.splice(0, 1)[0]; // flag?
  const skipLength = arr.splice(0, 1)[0];
  arr.splice(0, skipLength + 1); // ??
  const value = arr;
  return { feature, value };
};
