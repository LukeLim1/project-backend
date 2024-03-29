import { getData, setData } from './dataStore';
import { userTemplate, IUser, messageTemplate, dataTemplate, IReact, dmTemplate, channelTemplate } from './interface';
import { checkToken, getAuthUser } from './helperFunctions';

import HTTPError from 'http-errors';

export interface messageArray {
  time: number;
  messageId: number;
  messages: string;
  token: string;
}

/**
 * Send a message from the authorised user to the channel specified by channelId.
 * @param {*} token: string -- token of a user to check if this user is authorised
 * @param {*} channelId:  number -- the Id number of a channel
 * @param {*} message: string
 * @returns {} if no error
 *          Or the following error codes for error cases:
 *          400
 *          1. channelId does not refer to a valid channel
 *          2. length of message is less than 1 or over 1000 characters
 *          403
 *          1. channelId is valid and the authorised user is not a member of the channel
 */
export function messageSendV2(token: string, channelId: number, message: string) {
  const data = getData();
  const user: userTemplate = getAuthUser(token);
  const channel = data.channels.find(channel => channel.channelId === channelId);

  // Checking for invalid cases
  // Case 2: Not a valid channel as indicated by invalid channelID
  if (!channel) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  // Case 3 : length of message is less than 1 or over 1000 characters
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  }

  // Case 4: The authorised user is not a member of the valid channel
  if (!channel.allMembers.find(x => x.uId === user.uId)) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  let randomNumber = Math.floor(Math.random() * 1000);
  if (data.usedNums.length !== 0) {
    randomNumber += data.usedNums[data.usedNums.length - 1];
  }
  data.usedNums.push(randomNumber);

  const messageRes: messageTemplate = {
    uId: user.uId,
    timeSent: Math.floor(new Date().getTime() / 1000),
    reacts: [],
    isPinned: false,
    messageId: randomNumber,
    message: `${message}`
  };

  data.messages.push(messageRes);
  channel.messages.push(messageRes);
  data.numMsgs++;
  user.numMessagesSent++;
  setData(data);
  return { messageId: randomNumber };
}

/**
 * Given a message, update its text with new text.
 * If the new message is an empty string, the message is deleted.
 * @param {*} token: string -- token of a user to check if this user is authorised
 * @param {*} messageId: number -- the unique id of a message
 * @param {*} message: string
 * @returns {} if no error
 *          Or the following error codes for error cases:
 *          400
 *          1. length of message is over 1000 characters
 *          2. messageId does not refer to a valid message within a channel/DM that the authorised user has joined
 *          403
 *          1. If the authorised user does not have owner permissions, and the message was not sent by them
 */
export function messageEditV2(token: string, messageId: number, message: string) {
  const data = getData();
  const user: userTemplate = getAuthUser(token);

  // Checking for invalid case
  // Case 1: length of message is over 1000 characters
  if (message.length > 1000) {
    throw HTTPError(400, 'length of message is over 1000 characters');
  }

  // Case 2: messageId does not refer to a valid message within a channel/DM that the authorised user has joined
  let findChannel;
  let existMessage;
  for (const channel of data.channels) {
    existMessage = channel.messages.find(message => message.messageId === messageId);
    if (existMessage) {
      findChannel = channel;
    }
  }

  let findDm;
  for (const dm of data.DMs) {
    existMessage = dm.messages.find(message => message.messageId === messageId);
    if (existMessage) {
      findDm = dm;
    }
  }

  if (!(findChannel || findDm)) {
    throw HTTPError(400, 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined');
  }

  // Case 3: The authorised owner does not have owner permissions(i.e.not owner of channel or globalPermission Id != 1)
  //         and the message was not sent by them
  if (findChannel) {
    if (!(findChannel.ownerMembers.find(x => x.uId === user.uId) || user.globalPermissionId === 1) &&
      existMessage.uId !== user.uId) {
      throw HTTPError(403, 'If the authorised user does not have owner permissions, and the message was not sent by them');
    }
  }

  if (findDm) {
    if (findDm.dmOwner.uId !== user.uId) {
      throw HTTPError(403, 'If the authorised user does not have owner permissions, and the message was not sent by them');
    }
  }

  if (message !== '') {
    existMessage.message = message;
  } else {
    if (findChannel) {
      findChannel.messages = findChannel.messages.filter(x => x.messageId !== messageId);
      data.numMsgs--;
      user.numMessagesSent--;
    }
    if (findDm) {
      findDm.messages = findDm.messages.filter(x => x.messageId !== messageId);
    }
  }

  return {};
}

/**
 * Given a messageId for a message, this message is removed from the channel/DM
 *
 * @param token: string -- token of a user to check if this user is authorised
 * @param messageId: number -- the unique id of a message
 * @returns {} if no error
 *          Or the following error codes for error cases:
 *          400
 *          1. messageId does not refer to a valid message within a channel/DM that the authorised user has joined
 *          403
 *          1. If the authorised user does not have owner permissions, and the message was not sent by them
 */
export function messageRemoveV2(token: string, messageId: number) {
  messageEditV2(token, messageId, '');
  return {};
}

/**
 *
 * @param token: string -- token of a user to check if this user is authorised
 * @param channelId: number -- the unique id of a channel
 * @param message: string
 * @param timeSent: number -- the time of the message when it is sent
 * @returns { messageID } if no error
*          Or the following error codes for error cases:
 *          400
 *          1. channelId does not refer to a valid channel
 *          2. length of message is over 1000 characters
 *          3. timeSent is a time in the past
 *          403
 *          1. channelId is valid and the authorised user is not a member of the channel they are trying to post to
 */
export function messageSendlaterV1(token: string, channelId: number, message: string, timeSent: number) {
  const data = getData();
  const user: userTemplate = getAuthUser(token);
  const channel = data.channels.find(channel => channel.channelId === channelId);

  // Checking for invalid cases
  // Case 1: Not a valid channel as indicated by invalid channelID
  if (!channel) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  // Case 2 : length of message is less than 1 or over 1000 characters
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  }

  const timeNow = Math.floor(new Date().getTime() / 1000);
  // Case 3: timesent is a time in the past
  if (timeSent < timeNow) {
    throw HTTPError(400, 'timeSent is a time in the past');
  }
  // Case 4: authorised user is not a member in this valid channel
  if (!channel.allMembers.find(x => x.uId === user.uId)) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  let randomNumber = Math.floor(Math.random() * 1000);
  if (data.usedNums.length !== 0) {
    randomNumber += data.usedNums[data.usedNums.length - 1];
  }
  data.usedNums.push(randomNumber);
  const messageRes: messageTemplate = {
    uId: user.uId,
    timeSent: timeSent,
    reacts: [],
    isPinned: false,
    messageId: randomNumber,
    message: ''
  };
  data.numMsgs++;
  user.numMessagesSent++;

  data.messages.push(messageRes);
  channel.messages.push(messageRes);

  setTimeout(() => {
    messageRes.message = message;
  }, (timeSent - timeNow) * 1000);

  return { messageId: randomNumber };
}

/**
 *
 * @param token: string -- token of a user to check if this user is authorised
 * @param channelId: number -- the unique id of a channel
 * @param message: string
 * @param timeSent: number -- the time of the message when it is sent
 * @returns { messageID } if no error
*          Or the following error codes for error cases:
 *          400
 *          1. dmlId does not refer to a valid DM
 *          2. length of message is over 1000 characters
 *          3. timeSent is a time in the past
 *          403
 *          1. dmId is valid and the authorised user is not a member of the DM they are trying to post to
 */
export function messageSendlaterdmV1(token: string, dmId: number, message: string, timeSent: number) {
  const data = getData();
  const user: userTemplate = getAuthUser(token);

  // Check error cases
  // Case 1: dmId does not refer to a valid DM
  const dm = data.DMs.find(d => d.dmId === dmId);
  if (!dm) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  }

  // Case 2: length of message is less than 1 or over 1000 characters
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  }

  const timeNow = Math.floor(new Date().getTime() / 1000);

  // Case 3: timeSent is a time in the past
  if (timeSent < timeNow) {
    throw HTTPError(400, 'timeSent is a time in the past');
  }

  // Case 4: check member of dm
  let isMember = false;
  for (const member of dm.members) {
    if (member.uId === user.uId) {
      isMember = true;
      break;
    }
  }
  if (!isMember) {
    throw HTTPError(403, 'dmId is valid and the authorised user is not a member of the DM they are trying to post to');
  }

  let random: number = Math.floor(Math.random() * 10000);
  if (data.usedNums.length !== 0) {
    random = random + data.usedNums[data.usedNums.length - 1];
  }

  data.usedNums.push(random);

  const messageRes: messageTemplate = {
    messageId: random,
    uId: user.uId,
    message: '',
    timeSent: timeSent,
    reacts: [],
    isPinned: false
  };

  dm.messages.push(messageRes);

  setTimeout(() => {
    messageRes.message = message;
  }, (timeSent - timeNow) * 1000);

  user.numMessagesSent++;
  data.numMsgs++;
  setData(data);
  return { messageId: random };
}

/**
 * find the message that has messageId, ogMessageId (in either channel or dm)
 * and concat it with new message (message)
 * a -1 in either the channelId dmId arg indicates to search for ogMessageId in the other message location
 * The new message has no link to the ogMessage and thus is unaffected to changes
 * to the ogMessage
 *
 * @param {*} ogMessageId
 * @param {*} message
 * @param {*} channelId
 * @param {*} dmId
 * @returns {sharedMessageId}
 * 400 error when:
 *                both channelId and dmId are invalid
 *                neither channelId or dmId are -1
 *                ogMessageId doesnt refer to a valid message within channel/DM of auth user
 *                length of message is more than 1000 chars
 * 403 error when:
 *               channelId and dmid are valid but authorised user isnt apart of the channel/dm of intention
 */
export function messagesShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  if (message.length > 1000) {
    throw HTTPError(400, 'Error, message must not exceed 1000 chars');
  }
  const data = getData();
  const user = data.users.find(u => u.token.includes(token) === true);
  // case 1 400 error: length of message is > 1000
  let oldMessage;
  // dm route
  if (channelId === -1) {
    oldMessage = data.DMs.find(dms => dms.dmId === dmId);
  }
  // channelRoute
  if (dmId === -1) {
    oldMessage = data.channels.find(channels => channels.channelId === channelId);
  }

  // Error cases 400 ERROR
  // case 2 : neither channelId nor dmId are -1
  if (channelId !== -1 && dmId !== -1) {
    throw HTTPError(400, 'Error, both channelId and dmId cannot be -1');
  }
  // case 3 : channelId and dmId are invalid
  if (oldMessage === undefined) {
    throw HTTPError(400, 'Error, channelId or dmId are invalid');
  }
  // case 4 : ogMessageId does not refer to a valid message
  //          with channel/dm an authorised user is in
  // find the specific message by id
  const messageArray: any = oldMessage.messages.find((mess: { messageId: any; }) => mess.messageId === ogMessageId);
  if (messageArray === undefined) {
    throw HTTPError(400, 'Error, ogMessageId doesnt refer to a valid message');
  }

  // Error cases 403 ERROR
  // case 1 : channelId and dmId args are valid (one is -1 other is valid)
  //          but the authorised user is not apart of channel or dm they are messaging

  const concatNew = messageArray.message + ' ' + message;

  // index message id by +1
  const sharedMessageId = oldMessage.messages[oldMessage.messages.length - 1].messageId + 1;

  // old message is the array to push to
  oldMessage.messages.push({
    messageId: sharedMessageId,
    uId: user.uId,
    message: concatNew,
    timeSent: Date.now(),
    reacts: [],
    isPinned: false
  });
  data.numMsgs++;

  // console.log(data.channels[0].messages)
  return { sharedMessageId: sharedMessageId };
}

/**
 * pin the message
 * @param token ticket of current user
 * @param messageId message id
 * @returns result
 * 400 error when:
 * 1. messageId is not a valid message within a channel or DM that the authorised user has joined
 * 2. the message is already pinned
 * 403 error when:
 * messageId refers to a valid message in a joined channel/DM and the authorised user does not have owner permissions in the channel/DM
 */
export function messagePin(token: string, messageId: number) {
  // Check if token is valid
  if (!checkToken(token)) {
    throw HTTPError(403, 'user not found');
  }
  const data = getData();
  const user: userTemplate = data.users.find(u => u.token.includes(token) === true);
  // Case 1: Not a valid user as indicated by invalid uID
  if (!user) {
    throw HTTPError(403, 'user not found');
  }
  if (user.globalPermissionId !== 1) {
    throw HTTPError(403, 'user had no owner permissions');
  }
  const msgs: messageTemplate[] = getAllMessage(data, user.uId);
  if (!msgs) {
    throw HTTPError(400, 'not is member of channel/dm');
  }

  const message: messageTemplate = msgs.find(msg => msg.messageId === messageId);
  if (!message) {
    throw HTTPError(400, 'message not found');
  }
  if (message.isPinned) {
    throw HTTPError(400, 'message had pinned');
  }

  message.isPinned = true;
  setData(data);
  return {};
}

/**
 * unPin the message
 * @param token ticket of current user
 * @param messageId message id
 * @returns result
 * 400 error when:
 * 1. messageId is not a valid message within a channel or DM that the authorised user has joined
 * 2. the message is not already pinned
 * 403 error when:
 * messageId refers to a valid message in a joined channel/DM and the authorised user does not have owner permissions in the channel/DM
 */
export function messageUnPin(token: string, messageId: number) {
  // Check if token is valid
  if (!checkToken(token)) {
    throw HTTPError(403, 'user not found');
  }
  const data = getData();
  const user: userTemplate = data.users.find(u => u.token.includes(token) === true);
  // Case 1: Not a valid user as indicated by invalid uID
  if (!user) {
    throw HTTPError(403, 'user not found');
  }
  if (user.globalPermissionId !== 1) {
    throw HTTPError(403, 'user had no owner permissions');
  }
  const msgs: messageTemplate[] = getAllMessage(data, user.uId);
  if (!msgs) {
    throw HTTPError(400, 'not is member of channel/dm');
  }

  const message: messageTemplate = msgs.find(msg => msg.messageId === messageId);

  if (!message) {
    throw HTTPError(400, 'message not found');
  }
  if (!message.isPinned) {
    throw HTTPError(400, 'message had not pinned');
  }

  message.isPinned = false;
  setData(data);
  return {};
}

/**
 * rect message
 * @param token ticket of user
 * @param messageId message id
 * @param reactId react id currently, the only valid react ID the frontend has is 1
 * @returns result
 * 400 Error when:
 * 1. messageId is not a valid message within a channel or DM that the authorised user has joined
 * 2. reactId is not a valid react ID - currently, the only valid react ID the frontend has is 1
 * 3. the message already contains a react with ID reactId from the authorised user
 */
export function messagesReact(token: string, messageId: number, reactId: number) {
  // Check if token is valid
  if (!checkToken(token)) {
    throw HTTPError(403, 'user not found');
  }
  if (reactId !== 1) {
    throw HTTPError(400, 'reactId is not a valid react ID');
  }
  const data = getData();
  const user: userTemplate = data.users.find(u => u.token.includes(token) === true);
  // check user as indicated by invalid uID
  if (!user) {
    throw HTTPError(403, 'user not found');
  }

  const msgs: messageTemplate[] = getAllMessage(data, user.uId);
  if (!msgs) {
    throw HTTPError(400, 'not is member of channel/dm');
  }
  const message: messageTemplate = msgs.find(msg => msg.messageId === messageId);

  // check message
  if (!message) {
    throw HTTPError(400, 'message not found');
  }

  // check message react
  const reacts = message.reacts;
  for (const item of reacts) {
    if (item.uIds.includes(user.uId)) {
      throw HTTPError(400, 'message had react by the user');
    }
  }

  // check member
  const isMember = checkIsMember(data, message, user.uId);
  if (!isMember) {
    throw HTTPError(400, 'not is member of channel/dm');
  }

  // create react
  if (reacts.length > 0) {
    const react = message.reacts.find(react => react.reactId === reactId);
    react.uIds.push(user.uId);
  } else {
    const react = {
      reactId: reactId,
      uIds: [user.uId],
      isThisUserReacted: false
    };
    message.reacts.push(react);
  }

  // send notifications
  // "{User’s handle} reacted to your message in {channel/DM name}"
  const map: Map<string, object> = getDMOrChannelNameByMessageId(data, messageId);

  const name = map.get('name');
  const channelId = map.get('channelId');
  const dmId = map.get('dmId');
  const noticeMsg = user.handle + ' reacted to your message in ' + name;

  for (const theUser of data.users) {
    if (theUser.uId === message.uId) {
      theUser.notifications.push({
        channelId: Number(channelId),
        dmId: Number(dmId),
        notificationMessage: noticeMsg,
      });
      break;
    }
  }

  return {};
}

/**
 * unReact message
 * @param token ticket of user
 * @param messageId message id
 * @param reactId react id currently, the only valid react ID the frontend has is 1
 * @returns result
 * 400 error when:
 * 1. messageId is not a valid message within a channel or DM that the authorised user has joined
 * 2. reactId is not a valid react ID
 * 3. the message does not contain a react with ID reactId from the authorised user
 */
export function messagesUnReact(token: string, messageId: number, reactId: number) {
  // Check if token is valid
  if (!checkToken(token)) {
    throw HTTPError(403, 'user not found');
  }

  const data = getData();
  const user: userTemplate = data.users.find(u => u.token.includes(token) === true);
  // check user as indicated by invalid uID
  if (!user) {
    throw HTTPError(403, 'user not found');
  }
  if (reactId !== 1) {
    throw HTTPError(400, 'reactId is not a valid react ID');
  }
  const msgs: messageTemplate[] = getAllMessage(data, user.uId);
  if (!msgs) {
    throw HTTPError(400, 'not is member of channel/dm');
  }
  const message: messageTemplate = msgs.find(msg => msg.messageId === messageId);

  // check message
  if (!message) {
    throw HTTPError(400, 'message not found');
  }
  const reacts = message.reacts;
  // check valid react
  let theReact: IReact;
  for (let i = 0; i < reacts.length; i++) {
    const item = reacts[i];
    if (item.reactId === reactId) {
      theReact = item;
      reacts.splice(i, 1);
    }
  }
  if (!theReact) {
    throw HTTPError(400, 'message had no react by the user');
  }

  // check react uIds
  if (!theReact.uIds.includes(user.uId)) {
    throw HTTPError(400, 'message had no react by the user');
  }

  // check member
  const isMember = checkIsMember(data, message, user.uId);
  if (!isMember) {
    throw HTTPError(400, 'not is member of channel/dm');
  }

  const uIds = theReact.uIds;
  for (let i = 0; i < theReact.uIds.length; i++) {
    const uId = theReact.uIds[i];
    if (uId === user.uId) {
      uIds.splice(i, 1);
    }
  }

  // update react
  if (uIds.length > 0) {
    theReact.uIds = uIds;
    message.reacts.push(theReact);
  }
  return {};
}

/**
 * message search
 * @param token ticket of user
 * @param queryStr query str
 * @returns {messages}
 * 400 Error when length of queryStr is less than 1 or over 1000 characters
 */
export function messagesSearch(token: string, queryStr: string) {
  // Check if token is valid
  if (!checkToken(token)) {
    throw HTTPError(403, 'user not found');
  }
  // check query str length
  if (queryStr === undefined || queryStr.length < 1 || queryStr.length > 1000) {
    throw HTTPError(400, 'queryStr length is error');
  }

  const data = getData();
  const user: userTemplate = data.users.find(u => u.token.includes(token) === true);
  // check user as indicated by invalid uID
  if (!user) {
    throw HTTPError(403, 'user not found');
  }

  let isMember = false;
  for (const dm of data.DMs) {
    isMember = checkIsMemberOfDm(dm, user.uId);
    if (isMember) {
      break;
    }
  }

  if (!isMember) {
    for (const channel of data.channels) {
      isMember = checkIsMemberOfChannel(channel, user.uId);
      if (isMember) {
        break;
      }
    }
  }
  if (!isMember) {
    throw HTTPError(403, 'user are not of channel/dm member');
  }

  const allMessages = getAllMessage(data, user.uId);
  const myMessage: messageTemplate[] = [];
  for (const msg of allMessages) {
    if (msg.message.indexOf(queryStr) > -1) {
      myMessage.push(msg);
    }
  }

  return { messages: myMessage };
}

/**
 * check user is not member of channel/dm
 * @param data data
 * @param message message
 * @param uId current user id
 * @returns boolean
 */
export function checkIsMember(data: dataTemplate, message: messageTemplate, userId: number): boolean {
  let isMember = false;

  for (const channel of data.channels) {
    isMember = checkIsMemberOfChannel(channel, userId);
    if (isMember) {
      break;
    }
  }

  if (isMember) {
    return true;
  }

  for (const dm of data.DMs) {
    isMember = checkIsMemberOfDm(dm, userId);
    if (isMember) {
      break;
    }
  }

  return isMember;
}

export function getAllMessage(data: dataTemplate, userId: number): messageTemplate[] {
  const dms = data.DMs;
  const channels = data.channels;
  let msgs: messageTemplate[] = [];

  for (const dm of dms) {
    if (checkIsMemberOfDm(dm, userId)) {
      msgs = msgs.concat(dm.messages);
    }
  }

  for (const channel of channels) {
    if (checkIsMemberOfChannel(channel, userId)) {
      msgs = msgs.concat(channel.messages);
    }
  }

  return msgs;
}

/**
 * get name of dm or channel by message id
 * @param data data
 * @param msgId message id
 * @returns name,dmID,channelId
 */
export function getDMOrChannelNameByMessageId(data: dataTemplate, msgId: number): Map<string, object> {
  const dms = data.DMs;
  const channels = data.channels;
  let name = '';
  let dmId = -1;
  let channelId = -1;
  for (const dm of dms) {
    for (const msg of dm.messages) {
      if (msg.messageId === msgId) {
        name = dm.name;
        dmId = dm.dmId;
        break;
      }
    }
    if (name !== '') {
      break;
    }
  }

  if (name === '') {
    for (const channel of channels) {
      for (const msg of channel.messages) {
        if (msg.messageId === msgId) {
          name = channel.name;
          channelId = channel.channelId;
          break;
        }
      }
      if (name !== '') {
        break;
      }
    }
  }

  const map = new Map();
  map.set('name', name);
  map.set('dmId', dmId);
  map.set('channelId', channelId);

  return map;
}

export function checkIsMemberOfChannel(channel: channelTemplate, userId: number): boolean {
  let isMember = false;
  const members: IUser[] = channel.allMembers;
  for (const member of members) {
    if (member.uId === userId) {
      isMember = true;
      break;
    }
  }
  return isMember;
}

export function checkIsMemberOfDm(dm: dmTemplate, userId: number): boolean {
  let isMember = false;
  const members: IUser[] = dm.members;
  for (const member of members) {
    if (member.uId === userId) {
      isMember = true;
      break;
    }
  }

  return isMember;
}
