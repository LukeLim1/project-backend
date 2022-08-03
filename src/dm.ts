import { getData, setData } from './dataStore';
import { containsDuplicates, checkToken } from './helperFunctions';
import { Error, IDmMessages, userTemplate, IUser, messageTemplate } from './interface';
import HTTPError from 'http-errors';

export function dmCreateV1 (token: string, uIds: number[]) {
  if (containsDuplicates(uIds) === true) {
    return { error: 'error' };
  }
  const data = getData();
  // test for a valid token
  if (checkToken(token) === false) {
    return { error: 'error' };
  }

  // create an array with everybodies userIds
  const arrayUserId: number[] = [];

  Object.values(data.users).forEach(element => {
    const toPush = element.uId;
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
      if (i === element.uId) {
        const toPush = element.handle;
        handleArray.push(toPush);
      }
    }
  });

  const memberArray: IUser[] = [];
  Object.values(data.users).forEach(element => {
    for (const i of uIds) {
      if (i === element.uId) {
        const toPush1 = {
          uId: element.uId,
          email: element.emailAddress,
          nameFirst: element.firstName,
          nameLast: element.lastname,
          handleStr: element.handle
        };
        memberArray.push(toPush1);
      }
    }
  });

  handleArray.sort();

  const name = handleArray.join(', ');

  // getting dmId
  let identifier = 1;
  if (data.usedTokenNums.length !== 0) {
    identifier += data.usedTokenNums[data.usedTokenNums.length - 1];
  }

  const owner = {
    uId: user.uId,
    email: user.emailAddress,
    nameFirst: user.firstName,
    nameLast: user.lastname,
    handleStr: user.handle
  };

  for (const uId of uIds) {
    const u = data.users.find(u => u.uId === uId);
    u.numDmsJoined++;
  }
  data.numDms++;

  data.DMs.push({
    dmId: identifier,
    dmOwner: owner,
    name: name,
    messages: [],
    members: memberArray,
  });
  setData(data);
  return { dmId: identifier };
}

// dmLeave
// Removes authorised user from the DM that is given by dmId

// Parameters: token: string - token of a user that is being removed
//             dmId: number - ID of a DM

// Return type: object {}
//              throws 403 error when token is invalid
//              throws 400 error when dmId does not refer to a valid DM (when DM is not found)
//              throws 403 error when dmId is valid but the authorised user is not a member of DM shown by dmId

export function dmLeave (token: string, dmId: number) : object | Error {
  if (checkToken(token) === false) {
    throw HTTPError(403, "invalid token");
  }

  const data = getData();
  const user = data.users.find(u => u.token.includes(token));
  const dm = data.DMs.find(d => d.dmId === dmId);

  if (!dm) {
    throw HTTPError(400, "dmId doesn't refer to valid DM");
  }

  let isMember = false;

  for (const member of dm.members) {
    if (user.uId === member.uId) {
      isMember = true;
      const index = dm.members.indexOf(member);
      dm.members.splice(index, 1);
    }
  }

  if (!isMember) throw HTTPError(403, "authorised user is not a member of DM");

  user.numDmsJoined--;

  setData(data);
  return {};
}

// dmMessages
// Fetches up to 50 messages sent in DM of dmId. The user can choose which message to start fetching from.

// Parameters: token: string - token of a user to check if this user is authorised
//             dmId: number - ID of a DM
//             start: number - index to show where to start fetching

// Return type: { messages, start, end }. Messages are array of { messageId, uId, message, timeSent }. End is a number (start + 50) by default
//              and -1 if there are no more messages to load.
//              throws 403 error when token is invalid
//              throws 400 error when dmId does not refer to a valid DM (when DM is not found)
//              throws 400 error when start is greater than total number of messages in that DM
//              throws 403 error when dmId is valid but the authorised user is not a member of DM shown by dmId

export function dmMessages (token: string, dmId: number, start: number): IDmMessages | Error {
  if (checkToken(token) === false) {
    throw HTTPError(403, "invalid token");
  }

  const data = getData();
  const dm = data.DMs.find(d => d.dmId === dmId);

  if (!dm) {
    throw HTTPError(400, "dmId doesn't refer to valid DM");
  }

  const user = data.users.find(u => u.token.includes(token));
  const length = (dm.messages.length - start >= 50) ? start + 50 : dm.messages.length;
  const messagesRestructured: messageTemplate[] = [];
  const messagesCopy = dm.messages;

  if (start > messagesCopy.length) {
    throw HTTPError(400, "start is greater than total messages in DM");
  }

  let isMember = false;
  for (const member of dm.members) {
    if (member.uId === user.uId) {
      isMember = true;
    }
  }

  if (!isMember) throw HTTPError(403, "authorised user is not member of DM");

  for (let i = start; i < length; i++) {
    messagesRestructured.push(dm.messages[i]);
  }

  const end = (messagesRestructured.length >= 50) ? start + 50 : -1;

  messagesRestructured.reverse();
  return {
    messages: messagesRestructured,
    start: start,
    end: end,
  };
}

export function senddm(token: string, dmId: number, message: string) {
  // Check if token is valid
  if (!checkToken(token)) {
    throw HTTPError(403, 'user not found');
  }

  // Case 0: if length of message is less than 1 or greater than 1000
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is error');
  }
  const data = getData();

  // Case 1: dmId does not refer to a valid DM
  const dm = data.DMs.find(d => d.dmId === dmId);
  if (!dm) {
    throw HTTPError(400, 'dm not exit');
  }

  // case 2: check user
  const user = data.users.find(u => u.token.includes(token));
  if (!user) {
    throw HTTPError(403, 'user not found');
  }

  // case 3: check member of dm
  let isMember = false;
  for (const member of dm.members) {
    if (member.uId === user.uId) {
      isMember = true;
      break;
    }
  }

  if (!isMember) {
    throw HTTPError(403, 'user is not member');
  }

  let random: number = Math.floor(Math.random() * 10000);
  if (data.usedNums.length !== 0) {
    random = random + data.usedNums[data.usedNums.length - 1];
  }

  data.usedNums.push(random);

  const timeSent: number = Date.now();

  dm.messages.push({
    messageId: random,
    uId: user.uId,
    message: message,
    timeSent: timeSent,
    reacts: [],
    isPinned: false
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
  const userId = user.uId;

  // array to store all the return objects with dmId and name
  const myDMs = [];
  for (const dm of data.DMs) {
    for (const member of dm.members) {
      if (member.uId === userId) {
        myDMs.push({
          dmId: dm.dmId,
          name: dm.name,
        });
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

  const ownerId = user.uId;

  const dms = data.DMs;
  const dm = dms.find(d => d.dmId === dmId);
  if (!dm) {
    return { error: 'error dm not exit' };
  }

  if (dm.dmOwner.uId !== ownerId) {
    return { error: 'error you are not the dm owner' };
  }

  for (const member of dm.members) {
    for (const user of data.users) {
      if (member.handleStr === user.handle) {
        user.numDmsJoined--;
      }
    }
  }

  const index = dms.indexOf(dm);
  dms.splice(index, 1);

  data.numDms--;
  data.numMsgs -= dm.messages.length;
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
  const user = data.users.find(dm => dm.token.includes(token));
  let isMember = false;
  for (const member of dm.members) {
    if (member.uId === user.uId) {
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
