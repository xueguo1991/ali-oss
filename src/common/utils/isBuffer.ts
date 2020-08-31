import { Buffer } from 'buffer';

export function isBuffer(obj: any) {
  return Buffer.isBuffer(obj);
}
