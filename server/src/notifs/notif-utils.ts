import { randomBytes } from 'crypto';

export async function generateCIDForNotif() {
  return randomBytes(5).toString('hex');
}

export enum NotificationChannel {
  Text = 'text',
  Email = 'email',
  Push = 'push',
}
