import { randomBytes } from 'crypto';

export async function generateCIDForNotif() {
  return randomBytes(5).toString('hex');
}
