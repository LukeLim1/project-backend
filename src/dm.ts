
import { getData, setData } from './dataStore';
import { containsDuplicates, checkToken, convertUserTemplateToIUser } from './helperFunctions';
import { Error, IDmMessages, IMessages, IUser, userTemplate } from './interface';

// export function dmCreateV1 (token: string, uIds: number[]) {
//   if (containsDuplicates(uIds) === true) {
//     return { error: 'error' };
//   }
//   const data = getData();
//   // test for a valid token
//   checkToken(token);
//   if (checkToken(token) === false) {
//     return { error: 'error' };
//   }
//   // check uIds length
//   if (uIds === null || uIds.length < 1) {
//     return { error: 'error,uIds is null' };
//   }
//   // create an array with everybodies userIds
//   const arrayUserId: number[] = [];

//   Object.values(data.users).forEach(element => {
//     const toPush = element.userId;
//     arrayUserId.push(toPush);
//   });

//   // check if uIds is a subset of arrayUserId
//   const allFounded = uIds.every(ai => arrayUserId.includes(ai));
//   if (allFounded === false) {
//     return { error: 'error' };
//   }
//   // find owner
//   const user = data.users.find(u => u.token.includes(token) === true);

//   // create an array of alphanumerically sorted handles of all users
//   const handleArray: string[] = [];
//   Object.values(data.users).forEach(element => {
//     const toPush = element.handle;
//     handleArray.push(toPush);
//   });
//   handleArray.sort();

//   const sortedString = handleArray.join(', ')

//   // getting dmId
//   let identifier = 1;
//   if (data.usedTokenNums.length !== 0) {
//     identifier += data.usedTokenNums[data.usedTokenNums.length - 1];
//   }

//   data.DMs.push({
//     dmId: identifier,
//     dmOwner: user.userId,
//     name: sortedString,
//     members: members,
//     messages: [],
//   });
//   return { dmId: identifier };
// }
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
    return { error: 'error, uIds is null' };
  }

  // check uIds unique
  if (containsDuplicates(uIds) === true) {
    return { error: 'error, duplicate uId in uIds' };
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
    return { error: 'error, uid is not valid' };
  }

  // generate name sorted handles of all users
  handleArray.sort();
  const name: string = handleArray.join(',');

  // getting dmId
  let identifier = 1;
  if (data.usedNums.length !== 0) {
    identifier += data.usedNums[data.usedNums.length - 1];
  }
  // const dmId = identifier;

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
      dm.members.splice(index, -1);
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
      message: msg.message,
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

/// ///////////////////////////////////////////////////////
// above is lukes below is ruis
/// /////////////////////////////////////////////////////

// export function dmMessages(token: string, dmId: number, start: number): IDmMessages | Error {
//   // Check if token is valid
//   if (!checkToken(token)) {
//     return { error: 'error' };
//   }

//   const data = getData();

//   // Case 1: dmId does not refer to a valid DM
//   const dm = data.DMs.find(d => d.dmId === dmId);
//   if (!dm) {
//     return { error: 'error' };
//   }

//   // case 2: check user
//   const user = data.users.find(u => u.token.includes(token));
//   if (!user) {
//     return { error: 'error' };
//   }

//   // case 3: check member of dm
//   let isMember = false;
//   for (const member of dm.members) {
//     if (member.uId === user.userId) {
//       isMember = true;
//       break;
//     }
//   }

//   if (!isMember) {
//     return { error: 'error' };
//   }

//   const theStart: number = start;
//   let theEnd: number = start + 50;

//   const messageArr = dm.messages;

//   // case4 check start
//   if (start > messageArr.length) {
//     return { error: 'error' };
//   }

//   // case5 sort message
//   for (let i = 0; i < messageArr.length; i++) {
//     let flag = false;
//     for (let j = 0; j < messageArr.length - i - 1; j++) {
//       if (messageArr[j].timeSent < messageArr[j + 1].timeSent) {
//         // compare exchange
//         const temp: IMessages = messageArr[j + 1];
//         messageArr[j + 1] = messageArr[j];
//         messageArr[j] = temp;

//         flag = true;
//       }
//     }

//     // when is sort break
//     if (!flag) {
//       break;
//     }
//   }

//   theEnd = theEnd > messageArr.length ? messageArr.length : theEnd;
//   const theMessages = messageArr.slice(theStart, theEnd);

//   theEnd = theMessages.length < 1 ? -1 : theEnd;

//   const result: IDmMessages = {
//     messages: theMessages,
//     start: theStart,
//     end: theEnd,
//   };

//   return result;
// }

// export function senddm (token: string, dmId: number, message: string): messageId | Error {
//   // Check if token is valid
//   checkToken(token);
//   if (checkToken(token) === false) {
//     return { error: 'error' };
//   }

//   const data = getData();

//   // Case 1: if length of message is less than 1 or greater than 1000
//   if (message.length < 1 || message.length > 1000) {
//     return { error: 'error' };
//   }
//   // Case 2 : dmId does not refer to a valid DM
//   const id = data.DMs.find(i => i.dmId === dmId);
//   if (!id) {
//     return { error: 'error' };
//   }

//   let random: number = Math.floor(Math.random() * 10000);
//   if (data.usedNums.length !== 0) {
//     random = random + data.usedNums[data.usedNums.length - 1];
//   }

//   data.usedNums.push(random);

//   const timeSent: number = Date.now();

//   for (const i in data.DMs) {
//     data.DMs[i].messages.push({
//       uId: user.userId,
//       messages: message,
//       time: timeSent,
//       messageId: random,
//     });
//   }

//   setData(data);
//   return { messageId: random };
// }

export function dmList (token: string) {
  // Check if token is valid
  checkToken(token);
  if (checkToken(token) === false) {
    return { error: 'error' };
  }

  const data = getData();

  // array to store all the return objects with dmId and name
  const array = [];

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
export function senddm(token: string, dmId: number, message: string) {
  // Check if token is valid
  if (!checkToken(token)) {
    return { error: 'error bad token' };
  }

  // Case 0: if length of message is less than 1 or greater than 1000
  if (message.length < 1 || message.length > 1000) {
    return { error: 'error length incorret' };
  }
  const data = getData();

  // Case 1: dmId does not refer to a valid DM
  const dm = data.DMs.find(d => d.dmId === dmId);
  if (!dm) {
    return { error: 'error not a valid dmId' };
  }

  // case 2: check user
  const user = data.users.find(u => u.token.includes(token));
  if (!user) {
    return { error: 'error user not found' };
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
    return { error: 'error not a member' };
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

// export function dmRemove (token: string, dmId: number): Empty | Error {
//   // Check if token is valid
//   checkToken(token);
//   if (checkToken(token) === false) {
//     return { error: 'error' };
//   }

//   const data = getData();
//   const id = data.DMs.find(i => i.dmId === dmId);

//   // Case 1: dmId does not refer to a valid DM
//   if (!id) {
//     return { error: 'error' };
//   }

//   // Case 2: authorised user is not the original DM creator
//   if (!data.users.find(u => u.token.includes(token) === true)) {
//     return { error: 'error' };
//   }
//   // check if this is owner
//   if (data.users.find(dm => dm.token.includes(token) === true)) {
//     data.DMs = [];
//   }

//   setData(data);
//   return {};
// }
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

// export function dmDetails (token: string, dmId: number): userData | Error {
// // Check if token is valid
//   checkToken(token);
//   if (checkToken(token) === false) {
//     return { error: 'error' };
//   }

//   const data = getData();

//   const id = data.DMs.find(i => i.dmId === dmId);
//   // Case 1: dmId does not refer to a valid DM
//   if (!id) {
//     return { error: 'error' };
//   }

//   // Case 2: authorised user is not a member of the DM
//   if (!data.users.find(dm => dm.token.includes(token) === true)) {
//     return { error: 'error' };
//   }

//   const dataArray: members[] = [];
//   for (const i in id.name) {
//     const handle: string = id.name[i];
//     const user = data.users.find(user => user.handle === handle);
//     if (!user) {
//       return { error: 'error' };
//     }
//     const uId: number = user.userId;
//     const email: string = user.emailAddress;
//     const nameFirst: string = user.firstName;
//     const nameLast: string = user.lastname;

//     dataArray.push({
//       uId: uId,
//       email: email,
//       nameFirst: nameFirst,
//       nameLast: nameLast,
//       handleStr: handle,
//     });
//   }

//   setData(data);
//   return {
//     name: id.name.join(', '),
//     members: dataArray,
//   };
// }
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
