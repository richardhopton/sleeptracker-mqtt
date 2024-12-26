export const calculateChecksum = (bytes: number[]): number =>
  ((bytes.reduce((checksum, byte) => (checksum + (byte & 0xff)) & 0xff, 0x0) ^ 0xff) + 1) & 0xff;
