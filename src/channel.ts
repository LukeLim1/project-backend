import { getData, setData } from './dataStore';
import { IChannelDetails, userTemplate } from './interface';
import { checkToken } from './helperFunctions';
import { Error } from './interface';
import { userProfileV1 } from './users';
import HTTPError from 'http-errors';

/**
 * Invite a user with ID uId to join a channel with ID channelId
 * @param {*} authUserId
 * @param {*} channelId
 * @param {*} uId
 * @returns {} unless it is error case, in which case it will return { error: 'error' }
 */
// export function channelInviteV1 (authUserId: number, channelId: number, uId: number) {
//  const data = getData();
//  // let channel, user;
//  const user: userTemplate = data.users.find(user => user.userId === uId);
//  const channel = data.channels.find(channel => channel.channelId === channelId);
//
//  // Checking for invalid cases
//  // Case 1: Not a valid user as indicated by invalid uID
//  if (!user) {
//    return { error: 'error' };
//  }
//  // Case 2: Not a valid channel as indicated by invalid channelID
//  if (!channel) {
//    return { error: 'error' };
//  }
//  // Case 3: Inviting a user who is already a channel member
//  if (channel.allMembers.includes(uId)) {
//    return { error: 'error' };
//  }
//  // Case 4: The authorised user is not a member of the valid channel
//  if (!channel.allMembers.includes(authUserId)) {
//    return { error: 'error' };
//  }
//
//  // Otherwise, the invited member is added to the channel immediately
//  channel.allMembers.push(uId);
//  return {};
// }
/// **
// * Given a channel with ID channelId that the authorised user is a member of, return up to 50 messages between index "start" and "start + 50"(as end).
// * Message with index 0 is the most recent message in the channel.
// * @param {*} authUserId
// * @param {*} channelId
// * @param {*} start
// * @returns {messages, start, end} unless it is error case, in which case it will return { error: 'error' }
// */
// export function channelMessagesV1 (authUserId: number, channelId: number, start: number) {
//  const data = getData();
//  const channel = data.channels.find(channel => channel.channelId === channelId);
//  // Setting a new index "end" to be the value of "start + 50"
//  // and a new array to store the restructured messages
//  let end = start + 50;
//  let messagesRestructured;
//
//  // Checking for invalid case
//  // Case 1: Invalid channelId
//  if (!channel) {
//    return { error: 'error' };
//  }
//  const messagesCopy = channel.messages;
//
//  // Case 2: Start is greater than the total number of messages in the channel
//  if (start > messagesCopy.length) {
//    return { error: 'error' };
//  }
//  // Case 3: The authorised user is not a member of the valid channel
//  if (!(channel.allMembers.includes(authUserId))) {
//    return { error: 'error' };
//  }
//
//  // Otherwise, it should be a "normal" case
//  // If the end index belongs to the most recent message
//  // returns -1 in "end"
//  if (end >= messagesCopy.length - 1) {
//    end = -1;
//    messagesRestructured = messagesCopy.slice(0, messagesCopy.length - start); // We want the older messages
//  } else {
//    messagesRestructured = messagesCopy.slice(messagesCopy.length - end - 1, messagesCopy.length - start); // We want the older messages
//  }
//
//  // Now flip the messages back so index 0 would be the most recent message when we retrive the selected messages
//  messagesRestructured.reverse();
//  return { messages: messagesRestructured, start, end };
// }
//
// channelDetailsV1
// Given 2 parameters, authUserId and channelId, where the user with authUserId should be a member of the channel with channelId,
// prints out the details of the channel.

// Parameters: authUserId: integer - This is the Id of a user which is initially generated by authRegisterV1 function
//             channelId: integer - Id of a channel that this function is trying to print detail of, and it's created by channelCreateV1

// Return type: { name, isPublic, ownerMembers, allMembers }
//              { error: 'error' } when any of the following:
//                  channelId is not referring to a channel existing in datastore
//                  channelId is valid, but the authorised user is not a member of the channel (i.e. authUserId not in ownerMembers nor allMembers)

export function channelDetailsV1 (authUserId: number, channelId: number) {
  const data = getData();
  const channel = data.channels.find(channel => channel.channelId === channelId);

  if (!channel) {
    return { error: 'error' };
  }

  const owner = data.users.find(o => o.userId === channel.ownerMembers[0]);
  const ownerArr = [{
    uId: owner.userId,
    email: owner.emailAddress,
    nameFirst: owner.firstName,
    nameLast: owner.lastname,
    handleStr: owner.handle,
  }];
  const userArr = [];

  // check if user with authUserId belongs to channel with channelId
  if (!channel.allMembers.includes(authUserId)) {
    return { error: 'error' };
  }

  for (const member of channel.allMembers) {
    const user = data.users.find(u => u.userId === member);
    const userObj = {
      uId: user.userId,
      email: user.emailAddress,
      nameFirst: user.firstName,
      nameLast: user.lastname,
      handleStr: user.handle,
    };
    userArr.push(userObj);
  }

  return {
    name: channel.name,
    isPublic: channel.isPublic,
    ownerMembers: ownerArr,
    allMembers: userArr,
  };
}

export function channelDetails (token: string, channelId: number) : IChannelDetails | Error {
  if (checkToken(token) === false) {
    throw HTTPError(403, "invalid token");
  }

  const data = getData();
  const user = data.users.find(u => u.token.includes(token));
  const channel = data.channels.find(channel => channel.channelId === channelId);

  if (!channel) {
    throw HTTPError(400, "channelId doesn't refer to valid channel");
  }

  const owner = data.users.find(o => o.userId === channel.ownerMembers[0]);

  const ownerArr = [{
    uId: owner.userId,
    email: owner.emailAddress,
    nameFirst: owner.firstName,
    nameLast: owner.lastname,
    handleStr: owner.handle,
  }];
  const userArr = [];

  // check if user with token belongs to channel with channelId
  if (!channel.allMembers.includes(user.userId)) {
    return { error: 'error' };
  }

  for (const member of channel.allMembers) {
    const u = data.users.find(u => u.userId === member);
    const userObj = {
      uId: u.userId,
      email: u.emailAddress,
      nameFirst: u.firstName,
      nameLast: u.lastname,
      handleStr: u.handle,
    };
    userArr.push(userObj);
  }

  return {
    name: channel.name,
    isPublic: channel.isPublic,
    ownerMembers: ownerArr,
    allMembers: userArr,
  };
}

// channelJoinV1
// Given 2 parameters, authUserId and channelId, joins a user with authUserId to the channel with channelId (in allMembers array)

// Parameters: authUserId: integer - Id of a user who wants to join channel, which is initially generated by authRegisterV1 function
//             channelId: integer - Id of a channel, and it's created by channelCreateV1

// Return type: none
//              { error: 'error' } when any of the following:
//                  channelId is not referring to a channel existing in datastore
//                  authorized user is already a member of the channel (i.e. authUserId is already existing in channel.
//                                                                      In our case it's in allMembers array)
//                  channelId refers to a private channel, and the authrized user is not a channel member and not a global owner

export function channelJoin (token: string, channelId: number) : object | Error {
  if (checkToken(token) === false) {
    throw HTTPError(403, "invalid token");
  }

  const data = getData();
  const channel = data.channels.find(channel => channel.channelId === channelId);
  const user = data.users.find(u => u.token.includes(token));

  if (!channel) {
    throw HTTPError(400, "channelId doesn't refer to valid channel");
  }

  if (channel.isPublic === false) {
    throw HTTPError(403, "authorised user is not channel member & global owner");
  } else if (channel.allMembers.includes(user.userId)) {
    throw HTTPError(400, "authorised user is already a member");
  }

  channel.allMembers.push(user.userId);
  setData(data);
  return {};
}

export function channelLeaveV1 (token: string, channelId: number): object {
  const data = getData();
  const channel = data.channels.find(channel => channel.channelId === channelId);
  const getUser = data.users.find(u => u.token.includes(token));

  if (channel === undefined) {
    return { error: 'error' };
  }

  if (!channel.allMembers.includes(getUser.userId)) {
    return { error: 'error' };
  }

  const indexAll = channel.allMembers.indexOf(getUser.userId);
  channel.allMembers.splice(indexAll, 1);
  if (channel.ownerMembers.includes(getUser.userId)) {
    const indexOwner = channel.ownerMembers.indexOf(getUser.userId);
    channel.allMembers.splice(indexOwner, 1);
  }

  return {};
}

export function channelInviteV2 (token: string, channelId: number, uId: number) {
  const data = getData();
  // let channel, user;
  const user: userTemplate = data.users.find(user => user.userId === uId);
  const channel = data.channels.find(channel => channel.channelId === channelId);

  // Checking for invalid cases
  // Case 1: Not a valid user as indicated by invalid uID
  if (!user) {
    return { error: 'error' };
  }
  // Case 2: Not a valid channel as indicated by invalid channelID
  if (!channel) {
    return { error: 'error' };
  }
  // Case 3: Inviting a user who is already a channel member
  if (channel.allMembers.includes(uId)) {
    return { error: 'error' };
  }

  // Case 4: The user doesn't have a valid token
  if (!user.token.includes(token)) {
    return { error: 'error' };
  }

  // Otherwise, the invited member is added to the channel immediately
  channel.allMembers.push(uId);
  return {};
}

export function channelMessagesV2 (token: string, channelId: number, start: number) {
  if (checkToken(token) === false) {
    throw HTTPError(403, "invalid token");
  }

  const data = getData();
  const user: userTemplate = data.users.find(u => u.token.includes(token) === true);
  const channel = data.channels.find(channel => channel.channelId === channelId);
  // Setting a new index "end" to be the value of "start + 50"
  // and a new array to store the restructured messages
  let end = start + 50;
  let messagesRestructured;

  if (!user) {
    return { error: 'error' };
  }

  // Checking for invalid case
  // Case 1: Invalid channelId
  if (!channel) {
    return { error: 'error' };
  }
  const messagesCopy = channel.messages;

  // Case 2: Start is greater than the total number of messages in the channel
  if (start > messagesCopy.length) {
    return { error: 'error' };
  }


  // Otherwise, it should be a "normal" case
  // If the end index belongs to the most recent message
  // returns -1 in "end"
  if (end >= messagesCopy.length - 1) {
    end = -1;
    messagesRestructured = messagesCopy.slice(0, messagesCopy.length - start); // We want the older messages
  } else {
    messagesRestructured = messagesCopy.slice(messagesCopy.length - end - 1, messagesCopy.length - start); // We want the older messages
  }

  // Now flip the messages back so index 0 would be the most recent message when we retrive the selected messages
  messagesRestructured.reverse();
  return { messages: messagesRestructured, start, end };
}

export function channelAddownerV1 (token: string, channelId: number, authUserId: number) {
  const data = getData();
  const channel = data.channels.find(channel => channel.channelId === channelId);
  const getUser = data.users.find(u => u.userId === authUserId);
  const user = userProfileV1(token, authUserId);

  if (!getUser || !user) {
    return { error: 'error' };
  }

  if (!channel) {
    return { error: 'error' };
  }

  if (channel.isPublic === false) {
    return { error: 'error' };
  } else if (channel.allMembers.includes(authUserId)) {
    return { error: 'error' };
  }

  channel.allMembers.push(authUserId);
  setData(data);
  return {};
}

export function channelRemoveownerV1 (token: string, channelId: number, uId: number): object {
  const data = getData();
  const channel = data.channels.find(channel => channel.channelId === channelId);
  const getUser = data.users.find(u => u.userId === uId);
  const user = userProfileV1(token, uId);

  if (!getUser || !user) {
    return { error: 'error' };
  }

  if (channel === undefined) {
    return { error: 'error' };
  }

  if (!channel.allMembers.includes(uId)) {
    return { error: 'error' };
  }

  const indexAll = channel.allMembers.indexOf(uId);
  channel.allMembers.splice(indexAll, 1);
  if (channel.ownerMembers.includes(uId)) {
    const indexOwner = channel.ownerMembers.indexOf(uId);
    channel.allMembers.splice(indexOwner, 1);
  }

  return {};
}
