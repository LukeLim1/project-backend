import { getData } from './dataStore';
import HTTPError from 'http-errors';
import { getAuthUser } from './helperFunctions';
import { messageTemplate } from './interface';

/**
 *
 * @param token: string -- token of a user to check if this user is authorised
 * @param channelId: : number -- the unique id of a channel
 * @param length: number of seconds that the standup period lasts
 * @returns {timeFInish} if no error
 *          Or the following error codes for error cases:
 *          400
 *          1. channelId does not refer to a valid channel
 *          2. length is a negative integer
 *          3. an active standup is currently running in the channel
 *          403
 *          1. channelId is valid and the authorised user is not a member of the channel
 *
 */
export function standupStartV1(token: string, channelId: number, length: number) {
  const user = getAuthUser(token);
  const data = getData();
  const channel = data.channels.find(channel => channel.channelId === channelId);

  if (!channel) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  if (length < 0) {
    throw HTTPError(400, 'length is a negative integer');
  }

  if (channel.standup === undefined) {
    channel.standup = {
      active: false,
      start: null,
      timeFinish: null,
      message: []
    };
  }

  if (channel.standup.active) {
    throw HTTPError(400, 'an active standup is currently running in the channel');
  }

  if (!channel.allMembers.find(x => x.uId === user.uId)) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  const standup = channel.standup;
  standup.active = true;
  standup.start = Math.floor(new Date().getTime() / 1000);
  standup.timeFinish = Math.floor(new Date().getTime() / 1000) + length;
  const timeFinish = standup.timeFinish;

  // ticker
  setTimeout(() => {
    let randomNumber = Math.floor(Math.random() * 1000);
    if (data.usedNums.length !== 0) {
      randomNumber += data.usedNums[data.usedNums.length - 1];
    }
    data.usedNums.push(randomNumber);
    const message = standup.message.join('\n');
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
  }, length * 1000);

  return { timeFinish };
}

/**
 *
 * @param token: string -- token of a user to check if this user is authorised
 * @param channelId: : number -- the unique id of a channel
 * @returns {isActive, timeFInish} if no error
 *          Or the following error codes for error cases:
 *          400
 *          1. channelId does not refer to a valid channel
 *          403
 *          1. channelId is valid and the authorised user is not a member of the channel
 *
 */
export function standupActiveV1(token:string, channelId:number) {
  const user = getAuthUser(token);
  const data = getData();
  const channel = data.channels.find(channel => channel.channelId === channelId);

  if (!channel) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }
  if (!channel.allMembers.find(x => x.uId === user.uId)) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  let isActive = false;
  let timeFinish = null;
  if (channel.standup && channel.standup.active) {
    isActive = true;
    timeFinish = channel.standup.timeFinish;
  }
  return { isActive, timeFinish };
}

/**
 *
 * @param token: string -- token of a user to check if this user is authorised
 * @param channelId: number -- the unique id of a channel
 * @param message : string
 * @returns {} if no error
 *          Or the following error codes for error cases:
 *          400
 *          1. channelId does not refer to a valid channel
 *          2. length of message is over 1000 characters
 *          3. an active standup is not currently running in the channel
 *          403
 *          1. channelId is valid and the authorised user is not a member of the channel
 *
 */
export function standupSendV1(token: string, channelId: number, message: string) {
  const user = getAuthUser(token);
  const data = getData();
  const channel = data.channels.find(channel => channel.channelId === channelId);

  if (!channel) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'length of message is over 1000 characters');
  }

  if (!channel.allMembers.find(x => x.uId === user.uId)) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  if (!channel.standup || !channel.standup.active) {
    throw HTTPError(400, 'an active standup is not currently running in the channel');
  }

  channel.standup.message.push(`${user.handle}: ${message}`);
  return {};
}
