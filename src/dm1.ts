import { getData, setData } from './dataStore';
import { containsDuplicates, checkToken, convertUserTemplateToIUser } from './helperFunctions';
import { Error, IDmMessages, IMessages, IUser, userTemplate } from './interface';

/**
 * create dm
 * @param token  the ticket of the user
 * @param uIds  member of dm
 * @returns
 */
export function dmCreateV1(token: string, uIds: number[]) {
  // test for a valid token
  if (!checkToken(token)) {
    return { error: 'error token' };
  }
  // check uIds length
  if (uIds === null || uIds.length < 1) {
    return { error: 'error,uIds is null' };
  }

  // check uIds unique
  if (containsDuplicates(uIds) === true) {
    return { error: 'error,duplicate uId in uIds' };
  }

  // check if uIds is a subset of arrayUserId
  const data = getData();
  const users = data.users;

  // array of user id
  const userIdArray: number[] = [];

  // array of alphanumerically
  const handleArray: string[] = [];

  // array of members
  const members: IUser[] = [];

  // find owner
  const user = users.find(u => u.token.includes(token) === true) as userTemplate;
  const owner = convertUserTemplateToIUser(user);

  // delete owner id
  const index = uIds.indexOf(user.userId);
  if (index !== -1) {
    uIds.splice(index, 1);
  }

  Object.values(users).forEach(element => {
    const userId = element.userId;
    userIdArray.push(userId);

    if (uIds.includes(userId)) {
      const toPush = element.handle;
      handleArray.push(toPush);

      const iUser = convertUserTemplateToIUser(element);
      members.push(iUser);
    }
  });

  const allFounded = uIds.every(ai => userIdArray.includes(ai));
  if (allFounded === false) {
    return { error: 'error,uid is not valid' };
  }

  // generate name sorted handles of all users
  handleArray.sort();
  const name: string = handleArray.join(',');

  // getting dmId
  let identifier = 1;
  if (data.usedNums.length !== 0) {
    identifier += data.usedNums[data.usedNums.length - 1];
  }

  data.usedNums.push(identifier);
  data.DMs.push({
    dmId: identifier,
    dmOwner: owner,
    name: name,
    members: members,
    messages: [],
  });

  return { dmId: identifier };
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
  const myDMs = [];
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

/**
 * leave dm by dmId
 * @param token the ticket of the user
 * @param dmId id of dm
 * @returns leave result
 */
export function dmLeave(token: string, dmId: number): object | Error {
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

  const members = dm.members;

  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    if (member.uId === user.userId) {
      isMember = true;
      members.splice(i, 1);
      break;
    }
  }

  if (!isMember) {
    return { error: 'error is not member of the dm' };
  }

  setData(data);
  return {};
}

/**
 * get message by dm id and token
 * @param token the ticket of the user
 * @param dmId id of dm
 * @param start index
 * @returns messages
 */
export function dmMessages(token: string, dmId: number, start: number): IDmMessages | Error {
  // Check if token is valid
  if (!checkToken(token)) {
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

  const theStart: number = start;
  let theEnd: number = start + 50;

  const messageArr = dm.messages;

  // case4 check start
  if (start > messageArr.length) {
    return { error: 'error' };
  }

  // case5 sort message
  for (let i = 0; i < messageArr.length; i++) {
    let flag = false;
    for (let j = 0; j < messageArr.length - i - 1; j++) {
      if (messageArr[j].timeSent < messageArr[j + 1].timeSent) {
        // compare exchange
        const temp: IMessages = messageArr[j + 1];
        messageArr[j + 1] = messageArr[j];
        messageArr[j] = temp;

        flag = true;
      }
    }

    // when is sort break
    if (!flag) {
      break;
    }
  }

  theEnd = theEnd > messageArr.length ? messageArr.length : theEnd;
  const theMessages = messageArr.slice(theStart, theEnd);

  theEnd = theMessages.length < 1 ? -1 : theEnd;

  const result: IDmMessages = {
    messages: theMessages,
    start: theStart,
    end: theEnd,
  };

  return result;
}

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
