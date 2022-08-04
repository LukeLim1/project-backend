import { getData } from './dataStore';
import { notifications } from './interface';

export function notificationGetV1(token: string) {
  const notification: notifications[] = [];

  const data = getData();
  const user = data.users.find(u => u.token.includes(token) === true);

  for (const i of user.notifications) {
    notification.push(i);
  }
  const reverse = notification.reverse();
  return reverse;
}
