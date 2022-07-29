import { getData, setData } from './dataStore';
import { containsDuplicates, checkToken } from './helperFunctions';
import { Error, IDmMessages, IMessages, Empty } from './interface';

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
  const dmId = identifier;

  data.DMs.push({
    dmId: dmId,
    dmOwner: user.userId,
    name: [...handleArray],
    messages: [],
  });
  return { dmId };
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

  for (const member of dm.members) {
    if (user.userId === member.uId) {
      const index = dm.members.indexOf(member);
      dm.members.splice(index, 1);
    }
  }

  setData(data);
  return {};
}

export function dmMessages (token: string, dmId: number, start: number): IDmMessages | Error {
  if (checkToken(token) === false) {
    return { error: 'error' };
  }

  const data = getData();
  const dm = data.DMs.find(d => d.dmId === dmId);

  if (!dm) {
    return { error: 'error' };
  }

  const user = data.users.find(u => u.token.includes(token));
  const length = (dm.messages.length - start >= 50) ? start + 50 : dm.messages.length;
  const messagesRestructured: IMessages[] = [];
  const messagesCopy = dm.messages;

  if (start > messagesCopy.length) {
    return { error: 'error' };
  }
  if (!(dm.name.includes(user.handle))) {
    return { error: 'error' };
  }

  for (let i = start; i < length; i++) {
    const d = dm.messages[i];
    messagesRestructured.push({
      messageId: d.messageId,
      uId: user.userId,
      message: d.messages,
      timeSent: d.time,
    });
  }

  const end = (messagesRestructured.length >= 50) ? start + 50 : -1;

  messagesRestructured.reverse();
  return {
    messages: messagesRestructured,
    start: start,
    end: end,
  };
}

interface members {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
}

interface userData {
  name: string,
  members: members[],
}

interface messageId {
  messageId: number,
}

interface dms {
  dmId: number,
  name: string[],
}

export function senddm (token: string, dmId: number, message: string): messageId | Error {
  // Check if token is valid
  checkToken(token);
  if (checkToken(token) === false) {
    return { error: 'error' };
  }

  const data = getData();

  // Case 1: if length of message is less than 1 or greater than 1000
  if (message.length < 1 || message.length > 1000) {
    return { error: 'error' };
  }
  // Case 2 : dmId does not refer to a valid DM
  const id = data.DMs.find(i => i.dmId === dmId);
  if (!id) {
    return { error: 'error' };
  }

  let random: number = Math.floor(Math.random() * 10000);
  if (data.usedNums.length !== 0) {
    random = random + data.usedNums[data.usedNums.length - 1];
  }

  data.usedNums.push(random);

  const timeSent: number = Date.now();

  for (const i in data.DMs) {
    data.DMs[i].messages.push({
      token: token,
      messages: message,
      time: timeSent,
      messageId: random,
    });
  }

  setData(data);
  return { messageId: random };
}

export function dmList (token: string) {
  // Check if token is valid
  checkToken(token);
  if (checkToken(token) === false) {
    return { error: 'error' };
  }

  const data = getData();

  // array to store all the return objects with dmId and name
  const array: dms[] = [];

  for (const i in data.users) {
    if (data.users.find(u => u.token.includes(token) === true)) {
      const dmObject = {
        dmId: data.DMs[i].dmId,
        name: data.DMs[i].name,
      };
      array.push(dmObject);
    }
  }
  // dms: Array of objects, where each object contains types { dmId, name }
  setData(data);
  return { dms: array };
}

export function dmRemove (token: string, dmId: number): Empty | Error {
  // Check if token is valid
  checkToken(token);
  if (checkToken(token) === false) {
    return { error: 'error' };
  }

  const data = getData();
  const id = data.DMs.find(i => i.dmId === dmId);

  // Case 1: dmId does not refer to a valid DM
  if (!id) {
    return { error: 'error' };
  }

  // Case 2: authorised user is not the original DM creator
  if (!data.users.find(u => u.token.includes(token) === true)) {
    return { error: 'error' };
  }
  // check if this is owner
  if (data.users.find(dm => dm.token.includes(token) === true)) {
    data.DMs = [];
  }

  setData(data);
  return {};
}

export function dmDetails (token: string, dmId: number): userData | Error {
// Check if token is valid
  checkToken(token);
  if (checkToken(token) === false) {
    return { error: 'error' };
  }

  const data = getData();

  const id = data.DMs.find(i => i.dmId === dmId);
  // Case 1: dmId does not refer to a valid DM
  if (!id) {
    return { error: 'error' };
  }

  // Case 2: authorised user is not a member of the DM
  if (!data.users.find(dm => dm.token.includes(token) === true)) {
    return { error: 'error' };
  }

  const dataArray: members[] = [];
  for (const i in id.name) {
    const handle: string = id.name[i];
    const user = data.users.find(user => user.handle === handle);
    if (!user) {
      return { error: 'error' };
    }
    const uId: number = user.userId;
    const email: string = user.emailAddress;
    const nameFirst: string = user.firstName;
    const nameLast: string = user.lastname;

    dataArray.push({
      uId: uId,
      email: email,
      nameFirst: nameFirst,
      nameLast: nameLast,
      handleStr: handle,
    });
  }

  setData(data);
  return {
    name: id.name.join(', '),
    members: dataArray,
  };
}
