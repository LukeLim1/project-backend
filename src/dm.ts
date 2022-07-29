import { getData, setData } from './dataStore';
import { containsDuplicates, checkToken } from './helperFunctions';
import { dmTemplate, Error, IMessages, userTemplate } from './interface';

export function dmCreateV1(token: string, uIds: number[]) {
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

  const handleArray: string[] = [];

  Object.values(data.users).forEach(element => {
    for (const i of uIds) {
      if (i === element.userId) {
        const toPush = element.handle;
        handleArray.push(toPush);
      }
    }
  });

  // create an array of alphanumerically sorted handles of all users
  // const handleArray: string[] = [];
  // Object.values(data.users).forEach(element => {
  //   const toPush = element.handle;
  //   handleArray.push(toPush);
  // });
  handleArray.sort();

  const name = handleArray.join(', ');

  // getting dmId
  let identifier = 1;
  if (data.usedTokenNums.length !== 0) {
    identifier += data.usedTokenNums[data.usedTokenNums.length - 1];
  }

  data.DMs.push({
    dmId: identifier,
    dmOwner: user.userId,
    name: name,
    messages: [],
    members: uIds
  });
  return { dmId: identifier };
}

export function dmLeave(token: string, dmId: number): object | Error {
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
    if (user.userId === member) {
      const index = dm.members.indexOf(member);
      dm.members.splice(index, 1);
    }
  }

  return {};
}

export function dmMessages(token: string, dmId: number, start: number) {
  if (checkToken(token) === false) {
    return { error: 'error' };
  }

  const data = getData();
  const dm = data.DMs.find(d => d.dmId === dmId);
  console.log(dm);
  const user = data.users.find(u => u.token.includes(token));
  // const end = start + 50;
  const messagesRestructured: IMessages[] = [];

  if (!dm) {
    return { error: 'error' };
  }
  const messagesCopy = dm.messages;

  if (start > messagesCopy.length) {
    return { error: 'error' };
  }
  // if (!(dm.name.includes(user.handle))) {
  //   return { error: 'error user not found' };
  // }

  let isMember = false;
  for (const member of dm.members) {
    if (member === user.userId) {
      isMember = true;
    }
  }
  if (!isMember) return { error: 'error' };

  for (const msg of dm.messages) {
    let i = 0;
    console.log(messagesRestructured);
    messagesRestructured.push({
      messageId: i,
      uId: user.userId,
      message: msg.messages,
      timeSent: Math.floor((new Date()).getTime() / 1000),
    });
    i++;
  }
  const end = (messagesRestructured.length >= 50) ? start + 50 : -1;
  messagesRestructured.reverse();

  return {
    messages: messagesRestructured,
    start: start,
    end: end,
  };
}

// interface members {
//   uId: number,
//   email: string,
//   nameFirst: string,
//   nameLast: string,
//   handleStr: string,
// }

// interface userData {
//   name: string,
//   members: members[],
// }

// interface messageId {
//   messageId: number,
// }

// interface dms {
//   dmId: number,
//   name: string[],
// }

/**
 * send message to dm
 * @param token the ticket of the user
 * @param dmId id of dm
 * @param message message body
 * @returns messageId
 */
export function senddm(token: string, dmId: number, message: string) {
  // Check if token is valid
  if (!checkToken(token)) {
    return { error: 'error' };
  }

  // Case 0: if length of message is less than 1 or greater than 1000
  if (message.length < 1 || message.length > 1000) {
    return { error: 'error' };
  }
  const data = getData();

  // Case 1: dmId does not refer to a valid DM
  const dm = data.DMs.find(d => d.dmId === dmId);
  if (!dm) {
    return { error: 'error' };
  }

  // case 2: check user
  const user = data.users.find(u => u.token.includes(token));
  if (!user) {
    return { error: 'error' };
  }

  // case 3: check member of dm
  let isMember = false;
  for (const member of dm.members) {
    if (member.uId === user.userId) {
      isMember = true;
      break;
    }
  }

  if (!isMember) {
    return { error: 'error' };
  }

  let random: number = Math.floor(Math.random() * 10000);
  if (data.usedNums.length !== 0) {
    random = random + data.usedNums[data.usedNums.length - 1];
  }

  data.usedNums.push(random);

  const timeSent: number = Date.now();

  dm.messages.push({
    messageId: random,
    uId: user.userId,
    message: message,
    timeSent: timeSent
  });

  setData(data);
  return { messageId: random };
}

/**
 * select list dms that the user is a member of
 * @param token the ticket of the user
 * @returns list dm
 */
export function dmList(token: string) {
  // Check if token is valid
  if (!checkToken(token)) {
    return { error: 'error token' };
  }
  const data = getData();
  // get current user
  const user = data.users.find(u => u.token.includes(token) === true) as userTemplate;
  const userId = user.userId;

  // array to store all the return objects with dmId and name
  const myDMs: dmTemplate[] = [];
  for (const dm of data.DMs) {
    for (const member of dm.members) {
      if (member.uId === userId) {
        myDMs.push(dm);
        break;
      }
    }
  }

  return { dms: myDMs };
}

/**
 * delete dm for owner
 * @param token  the ticket of the user
 * @param dmId dm id
 * @returns
 */
export function dmRemove(token: string, dmId: number): object | Error {
  // Check if token is valid
  if (!checkToken(token)) {
    return { error: 'error token' };
  }

  const data = getData();
  const user = data.users.find(u => u.token.includes(token));
  if (!user) {
    return { error: 'error user not exit' };
  }

  const ownerId = user.userId;

  const dms = data.DMs;
  const dm = dms.find(d => d.dmId === dmId);
  if (!dm) {
    return { error: 'error dm not exit' };
  }

  if (dm.dmOwner.uId !== ownerId) {
    return { error: 'error you are not the dm owner' };
  }

  const index = dms.indexOf(dm);
  dms.splice(index, 1);

  setData(data);
  return {};
}

/**
 * get detail of the dm by id
 * @param token the ticket of the user
 * @param dmId id of dm
 * @returns dm detail
 */
export function dmDetails(token: string, dmId: number): object | Error {
  // Check if token is valid
  if (!checkToken(token)) {
    return { error: 'error token' };
  }

  const data = getData();

  // Case 1: dmId does not refer to a valid DM
  const dm = data.DMs.find(d => d.dmId === dmId);
  if (!dm) {
    return { error: 'error dm not exit' };
  }

  // Case 2: check user is not a member of the DM
  const user = data.users.find(dm => dm.token.includes(token)) as userTemplate;
  let isMember = false;
  for (const member of dm.members) {
    if (member.uId === user.userId) {
      isMember = true;
      break;
    }
  }

  if (!isMember) {
    return { error: 'error is not member of the dm' };
  }

  const result = {
    name: dm.name,
    members: dm.members
  };

  return result;
}
