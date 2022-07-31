import { getData, setData } from './dataStore';
import { userTemplate } from './interface';
import { checkToken } from './helperFunctions';

import HTTPError from 'http-errors';

export interface messageTemplate {
  channelId: number;
  messageId: number;
  message: string;
  token: string;
}
export interface messageArray {
time: number;
messageId: number;
messages: string;
token: string;
}

/**
 * Send a message from the authorised user to the channel specified by channelId.
 * @param {*} token
 * @param {*} channelId
 * @param {*} message
 * @returns {} unless it is error case, in which case it will return { error: 'error' }
 */
/**
 * Send a message from the authorised user to the channel specified by channelId.
 * @param {*} token
 * @param {*} channelId
 * @param {*} message
 * @returns {} unless it is error case, in which case it will return { error: 'error' }
 */
export function messageSendV1 (token: string, channelId: number, message: string) {
  const data = getData();
  const user: userTemplate = data.users.find(u => u.token.includes(token) === true);
  const channel = data.channels.find(channel => channel.channelId === channelId);

  // Checking if the token passed in is valid
  if (checkToken(token) === false) {
    return { error: 'error' };
  }

  // Checking for invalid cases
  // Case 1: Not a valid user as indicated by invalid uID
  if (!user) {
    return { error: 'error' };
  }
  // Case 2: Not a valid channel as indicated by invalid channelID
  if (!channel) {
    return { error: 'error' };
  }

  if (channel === undefined) {
    return { error: 'error' };
  }

  // Case 3 : length of message is less than 1 or over 1000 characters
  if (!message || message.length < 1 || message.length > 1000) {
    return { error: 'error' };
  }

  // Case 4: The authorised user is not a member of the valid channel
  // if (!channel.allMembers.includes(user.userId)) {
  //   return { error: 'error' };
  // }

  const arrayUserId: number[] = [];
  Object.values(data.channels).forEach(element => {
    let toPush;
    for (const i in element.allMembers) { toPush = element.allMembers[i].userId; }
    arrayUserId.push(toPush);
  });

  if (!arrayUserId.includes(user.userId)) {
    return { error: 'error' };
  }

  let randomNumber = Math.floor(Math.random() * 1000);
  if (data.usedNums.length !== 0) {
    randomNumber += data.usedNums[data.usedNums.length - 1];
  }
  data.usedNums.push(randomNumber);

  data.messages.push({
    channelId: channelId,
    messageId: randomNumber,
    message: `${message}`,
    token: String(token),
  });
  user.numMessagesSent++;
  setData(data);
  return { messageId: randomNumber };
}
/**
 * Given a message, update its text with new
text. If the new message is an empty
string, the message is deleted.
 * @param {*} token
 * @param {*} messageId
 * @param {*} message
 * @returns {messages, start, end} unless it is error case, in which case it will return { error: 'error' }
 */
export function messageEditV1 (token: string, messageId: number, message: string) {
  const data = getData();
  const user: userTemplate = data.users.find(u => u.token.includes(token) === true);
  const messageObj = data.messages.find(message => message.messageId === messageId);
  const channelOwner = data.channels.find(channel => channel.ownerMembers === user.userId);

  if (checkToken(token) === false) {
    return { error: 'error' };
  }

  // Checking for invalid case
  // Case 1: Invalid messageId or token
  if (!messageObj || !user) {
    return { error: 'error' };
  }

  if (message.length > 1000) {
    return { error: 'error' };
  }

  // Case 2: Message was not sent by the user making this request
  if (messageObj.token !== token) {
    return { error: 'error' };
  }

  // Case 3: The authorised owner is not an owner of the channel
  if (!channelOwner) {
    return { error: 'error' };
  }

  if (channelOwner === undefined) {
    return { error: 'error' };
  }

  messageObj.message = message;
  const index = data.messages.findIndex(message => message.messageId === messageId);
  if (index !== -1) {
    data.messages.splice(index - 1, 1);
  } else {
    return { error: 'error' };
  }

  if (message) {
    data.messages.push(messageObj);
  }

  setData(data);
  return {};
}

export function messageRemoveV1 (token: string, messageId: number) {
  const data = getData();
  const user: userTemplate = data.users.find(u => u.token.includes(token) === true);
  const messageObj = data.messages.find(message => message.messageId === messageId);
  const channelOwner = data.channels.find(channel => channel.ownerMembers === user.userId);

  if (checkToken(token) === false) {
    return { error: 'error' };
  }

  // Checking for invalid case
  // Case 1: Invalid messageId or token
  if (!messageObj || !user) {
    return { error: 'error' };
  }

  // Case 2: Message was not sent by the user making this request
  if (messageObj.token !== token) {
    return { error: 'error' };
  }

  // Case 3: The authorised owner is not an owner of the channel
  if (!channelOwner) {
    return { error: 'error' };
  }

  if (channelOwner === undefined) {
    return { error: 'error' };
  }

  const index = data.messages.findIndex(message => message.messageId === messageId);
  if (index !== -1) {
    data.messages.splice(index - 1, 1);
  } else {
    return { error: 'error' };
  }

  setData(data);
  return {};
}

export function messagesShareV1(ogMessageId: number, message: string, channelId: number, dmId: number) {
  const data = getData();
  // case 1 400 error: length of message is > 1000
  if (message.length > 1000) {
    throw HTTPError(400, 'Error, message must not exceed 1000 chars');
  }
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
  const messageArray: messageArray = oldMessage.messages.find((mess: { messageId: any; }) => mess.messageId === ogMessageId);
  console.log(messageArray);
  if (messageArray === undefined) {
    throw HTTPError(400, 'Error, ogMessageId doesnt refer to a valid message');
  }

  // Error cases 403 ERROR
  // case 1 : channelId and dmId args are valid (one is -1 other is valid)
  //          but the authorised user is not apart of channel or dm they are messaging

  const concatNew = messageArray.messages + ' ' + message;
  // index message id by +1
  const sharedMessageId = oldMessage.messages[oldMessage.messages.length - 1].messageId + 1;

  // old message is the array to push to
  oldMessage.messages.push({
    messageId: sharedMessageId,
    text: concatNew
  });

  // console.log(data.channels[0].messages)
  return { sharedMessageId: sharedMessageId };
}
