import { getData } from './dataStore';
import { containsDuplicates, checkToken } from './helperFunctions';
import { Error, IDmMessages, IMessages } from './interface';

export function dmCreateV1 (token: string, uIds: number[]) {
  if (containsDuplicates(uIds) === true) {
    return { error: 'error' };
  }
  const data = getData();
  // test for a valid token
  checkToken(token);
  if (checkToken(token) === false) {
    return { error: 'error' };
  }

  // create an array with everybodies userIds
  const arrayUserId: number[] = [];

  Object.values(data.users).forEach(element => {
    const toPush = element.userId;
    arrayUserId.push(toPush);
  });

  // check if uIds is a subset of arrayUserId
  const allFounded = uIds.every(ai => arrayUserId.includes(ai));
  if (allFounded === false) {
    return { error: 'error' };
  }
  // find owner
  const user = data.users.find(u => u.token.includes(token) === true);

  // create an array of alphanumerically sorted handles of all users
  const handleArray: string[] = [];
  Object.values(data.users).forEach(element => {
    const toPush = element.handle;
    handleArray.push(toPush);
  });
  handleArray.sort();

  // getting dmId
  let identifier = 1;
  if (data.usedTokenNums.length !== 0) {
    identifier += data.usedTokenNums[data.usedTokenNums.length - 1];
  }

  data.DMs.push({
    dmId: identifier,
    dmOwner: user.userId,
    name: handleArray,
    messages: [],
  });
  return { identifier };
}

export function dmLeave (token: string, dmId: number) : object | Error {
  if (checkToken(token) === false) {
    return { error: 'error' };
  }

  const data = getData();
  const user = data.users.find(u => u.token.includes(token));
  const dm = data.DMs.find(d => d.dmId === dmId);

  if (!dm) {
    return { error: 'error' };
  } else if (!dm.name.includes(user.handle)) {
    return { error: 'error' };
  }

  for (const name of dm.name) {
    if (user.handle === name) {
      const index = dm.name.indexOf(name);
      dm.name.splice(index, 1);
    }
  }

  return {};
}

export function dmMessages (token: string, dmId: number, start: number): IDmMessages | Error {
  if (checkToken(token) === false) {
    return { error: 'error' };
  }

  const data = getData();
  const dm = data.DMs.find(d => d.dmId === dmId);
  const user = data.users.find(u => u.token.includes(token));
  const end = start + 50;
  let messagesRestructured: IMessages[];

  if (!dm) {
    return { error: 'error' };
  }
  const messagesCopy = dm.messages;

  if (start > messagesCopy.length) {
    return { error: 'error' };
  }
  if (!(dm.name.includes(user.handle))) {
    return { error: 'error' };
  }

  for (const msg of dm.messages) {
    let i = 0;
    messagesRestructured.push({
      messageId: i,
      uId: user.userId,
      message: msg,
      timeSent: Math.floor((new Date()).getTime() / 1000),
    });
    i++;
  }

  messagesRestructured.reverse();
  return {
    messages: messagesRestructured,
    start: start,
    end: end,
  };
}
