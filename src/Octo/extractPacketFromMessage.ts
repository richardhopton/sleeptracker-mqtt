import { calculateChecksum } from './calculateChecksum';

export const extractPacketFromMessage = (message: Uint8Array) => {
  const arr = Array.from(message);
  if (arr.length == 0) return null;
  if (arr.splice(0, 1)[0] != 0x40) return null;
  if (arr.pop() != 0x40) return null;

  const command = arr.splice(0, 2);
  if (command.length < 2) return null;

  const dataLenBytes = arr.splice(0, 2);
  if (dataLenBytes.length < 2) return null;
  const dataLen = (dataLenBytes[0] << 8) + dataLenBytes[1];

  const checksumBytes = arr.splice(0, 1);
  if (checksumBytes.length < 1) return null;
  const checksum = checksumBytes[0];

  if (dataLen != arr.length) return null;
  const data = arr.splice(0, dataLen);

  if (checksum != calculateChecksum([0x80, ...command, ...dataLenBytes, ...data])) return null;

  return { command, data };
};
