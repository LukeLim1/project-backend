import { getData, setData } from './dataStore';
import { userTemplate } from './interface';
import { checkToken } from './helperFunctions';

export interface messageTemplate {
    channelId: number;
    messageId: number;
    message: string;
    token: string;
}

/**
 * Send a message from the authorised user to the channel specified by channelId.
 * @param {*} token
 * @param {*} channelId
 * @param {*} message
 * @returns {} unless it is error case, in which case it will return { error: 'error' }
 */
export function messageSendV1 (token: string, channelId: number, message: string) {
  const data = getData();
  // let channel, user;
  const user: userTemplate = data.users.find(u => u.token.includes(token) === true);
  const channel = data.channels.find(channel => channel.channelId === channelId);

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

  // Case 3 : length of message is less than 1 or over 1000 characters
  if (!message || message.length < 1 || message.length > 1000) {
    return { error: 'error' };
  }

  // Case 4: The authorised user is not a member of the valid channel
  if (!channel.allMembers.includes(String(token))) {
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

  if (messageObj.token !== token) {
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

  if (checkToken(token) === false) {
    return { error: 'error' };
  }

  // Checking for invalid case
  // Case 1: Invalid messageId or token
  if (!messageObj || !user) {
    return { error: 'error' };
  }

  if (messageObj.token !== token) {
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
