export const arrayEquals = (arr1: number[], arr2: number[]) =>
  arr1.length === arr2.length && arr1.every((v, i) => v === arr2[i]);
