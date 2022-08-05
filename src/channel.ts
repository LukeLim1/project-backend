import { getData, setData } from './dataStore';
import { IChannelDetails, userTemplate } from './interface';
import { checkToken, getAuthUser } from './helperFunctions';
import { Error } from './interface';
import HTTPError from 'http-errors';

// channelDetails
// prints out the details of the channel if the authorised user with token is member

// Parameters: token: string - token of a user to check if this user is authorised
//             channelId: number - Id of a channel that this function is trying to print detail of

// Return type: { name, isPublic, ownerMembers, allMembers }
//              throws 403 error when token is invalid
//              throws 400 error when channelId does not refer to a valid channel (when channel is not found)
//              throws 403 error when channelId is valid but the authorised user is not a member of channel shown by channelId

export function channelDetails(token: string, channelId: number): IChannelDetails | Error {
  if (checkToken(token) === false) {
    throw HTTPError(403, 'invalid token');
  }

  const data = getData();
  const channel = data.channels.find(channel => channel.channelId === channelId);
  // error case
  if (!channel) {
    throw HTTPError(400, "channelId doesn't refer to valid channel");
  }
  const user = data.users.find(u => u.token.includes(token));
  // check if user with token belongs to channel with channelId
  let isMember = false;
  for (const member of channel.allMembers) {
    if (user.uId === member.uId) {
      isMember = true;
    }
  }
  if (!isMember) throw HTTPError(403, 'authorised user is not a member of the channel');

  const owner = channel.ownerMembers[0];

  const ownerArr = [{
    uId: owner.uId,
    email: owner.email,
    nameFirst: owner.nameFirst,
    nameLast: owner.nameLast,
    handleStr: owner.handleStr,
  }];
  const userArr = [];

  for (const member of channel.allMembers) {
    const u = data.users.find(u => u.uId === member.uId);
    const userObj = {
      uId: u.uId,
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

// channelJoin
// joins the authorised user to the channel

// Parameters: token: string - token of a user to check if this user is authorised
//             channelId: number - Id of a channel

// Return type: object {}
//              throws 403 error when token is invalid
//              throws 400 error when channelId does not refer to a valid channel (when channel is not found)
//              throws 400 error when the authorised user is already a member
//              throws 403 error when channelId refers to private channel and authorised user is not channel member nor global owner

export function channelJoin(token: string, channelId: number): object | Error {
  if (checkToken(token) === false) {
    throw HTTPError(403, 'invalid token');
  }

  const data = getData();
  const channel = data.channels.find(channel => channel.channelId === channelId);

  if (!channel) {
    throw HTTPError(400, "channelId doesn't refer to valid channel");
  }
  const user = data.users.find(u => u.token.includes(token));

  let isMember = false;
  for (const member of channel.allMembers) {
    if (user.uId === member.uId) {
      isMember = true;
    }
  }
  if (isMember) throw HTTPError(400, 'authorised user is already a member of the channel');

  if (channel.isPublic === false && user.globalPermissionId !== 1) {
    throw HTTPError(403, 'authorised user is not channel member & global owner');
  }

  channel.allMembers.push({
    uId: user.uId,
    email: user.emailAddress,
    nameFirst: user.firstName,
    nameLast: user.lastname,
    handleStr: user.handle,
  });

  user.numChannelsJoined++;
  setData(data);
  return {};
}
/**
 * Given a channel ID check if authorised user is a member
 * and remove them from the channel if they are.
 * Their messages should be unaffected
 * If the only owner leaves the channel will remain
 * @param channelId refers to a channel
 * @returns empty object or an error
 *          Errors 400 when
 *                         channelId does not refer to a valid channel
 *                         authorised user is the starter of an active standup
 *          Errors 403 when
 *                         channelId is valid and the authorised user is not a member of the channel
 *
 */
export function channelLeaveV1(token: string, channelId: number): object {
  const data = getData();
  const channel = data.channels.find(channel => channel.channelId === channelId);
  // const getUser = data.users.find(u => u.token.includes(token));
  const authUser: userTemplate = getAuthUser(token);

  if (!channel) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  let isMember = false;
  for (const member of channel.allMembers) {
    if (authUser.uId === member.uId) {
      isMember = true;
    }
  }
  if (!isMember) throw HTTPError(403, 'authorised user is not a member of the channel');

  const index = channel.allMembers.findIndex(ob => ob.uId === authUser.uId);

  channel.allMembers.splice(index, 1);
  if (channel.ownerMembers.findIndex(ob => ob.uId === authUser.uId) !== -1) {
    const indexOwner = channel.ownerMembers.findIndex(ob => ob.uId === authUser.uId);
    channel.ownerMembers.splice(indexOwner, 1);
  }

  authUser.numChannelsJoined--;
  setData(data);

  return {};
}

/**
 * Invites a user with ID uId to join a channel with ID channelId. 
 * Once invited, the user is added to the channel immediately. 
 * In both public and private channels, all members are able to invite users.
 * 
 * @param token: string -- token of a user to check if this user is authorised
 * @param channelId:  number -- the Id number of a channel 
 * @param uId: number -- id of user to be invited 
 * @returns {} if no error
 *          Or the following error codes for error cases:
 *          400
 *          1. channelId does not refer to a valid channel
 *          2. uId does not refer to a valid user
 *          2. uId refers to a user who is already a member of the channel
 *          403
 *          1. channelId is valid and the authorised user is not a member of the channel
 */
export function channelInviteV3(token: string, channelId: number, uId: number) {
  const data = getData();
  // Checking if the token passed in is valid
  const authUser: userTemplate = getAuthUser(token);
  const user: userTemplate = data.users.find(user => user.uId === uId);
  const channel = data.channels.find(channel => channel.channelId === channelId);

  // Checking for invalid cases
  // Case 1: Not a valid channel as indicated by invalid channelID
  if (!channel) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }
  // Case 2: Not a valid user as indicated by invalid uID
  if (!user) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }
  // Case 3: Inviting a user who is already a channel member
  if (channel.allMembers.find(x => x.uId === uId)) {
    throw HTTPError(400, 'uId refers to a user who is already a member of the channel');
  }

  // Case 4: channelId is valid and the authorised user is not a member of the channel
  if (!channel.allMembers.find(x => x.uId === authUser.uId)) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  // Otherwise, the invited member is added to the channel immediately
  channel.allMembers.push({
    uId: user.uId,
    email: user.emailAddress,
    nameFirst: user.firstName,
    nameLast: user.lastname,
    handleStr: user.handle
  });
  user.numChannelsJoined++;
  user.notifications.push({
    channelId: channel.channelId,
    dmId: -1,
    notificationMessage: `${authUser.handle} added you to ${channel.name}`
  });
  return {};
}

/**
 * Given a channel with ID channelId that the authorised user is a member of, 
 * return up to 50 messages between index "start" and "start + 50".
 * Message with index 0 is the most recent message in the channel. 
 * 
 * @param token: string -- token of a user to check if this user is authorised
 * @param channelId: number -- the Id number of a channel 
 * @param start: number 
 * @returns a new index "end" which is the value of "start + 50", or 
 *          -1 in "end" to indicate there are no more messages to load after this return 
 *          if the least recent messages has been returned.
 * 
 *          Or the following error codes for error cases:
 *          400
 *          1. channelId does not refer to a valid channel
 *          2. start is greater than the total number of messages in the channel
 *          403
 *          1. channelId is valid and the authorised user is not a member of the channel
 */
export function channelMessagesV3(token: string, channelId: number, start: number) {
  const user: userTemplate = getAuthUser(token);
  const data = getData();
  const channel = data.channels.find(channel => channel.channelId === channelId);
  // Setting a new index "end" to be the value of "start + 50"
  // and a new array to store the restructured messages
  let end = start + 50;
  let messagesRestructured;

  // Checking for invalid case
  // Case 1: Invalid channelId
  if (!channel) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }
  const messagesCopy = channel.messages;

  // Case 2: Start is greater than the total number of messages in the channel
  if (start > messagesCopy.length) {
    throw HTTPError(400, 'start is greater than the total number of messages in the channel');
  }

  // Case 3: ChannelId valid (already checked in case 1 previously) but the user is not a member of the valid channel
  if (!channel.allMembers.find(x => x.uId === user.uId)) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  // Otherwise, it should be a "normal" case
  // If the end index belongs to the most recent message
  // returns -1 in "end"
  if (end >= messagesCopy.length - 1) {
    end = -1;
    messagesRestructured = messagesCopy.slice(0, messagesCopy.length - start); // We want the older messages
  } else {
    messagesRestructured = messagesCopy.slice(
      messagesCopy.length - end - 1,
      messagesCopy.length - start
    ); // We want the older messages
  }

  // Now flip the messages back so index 0 would be the most recent message when we retrive the selected messages
  messagesRestructured.reverse();
  return { messages: messagesRestructured, start, end };
}

/**
 * 
 * @param token: string -- token of a user to check if this user is authorised
 * @param channelId:  number -- the Id number of a channel 
 * @param uId: number -- id of user to be invited 
 * @returns {} if no error
 *          Or the following error codes for error cases:
 *          400
 *          1. channelId does not refer to a valid channel
 *          2. uId does not refer to a valid user
 *          3. uId refers to a user who is not a member of the channel
 *          4. uId refers to a user who is already an owner of the channel
 *          403
 *          1. channelId is valid and the authorised user does not have owner permissions in the channel
 */
export function channelAddownerV2(token: string, channelId: number, uId: number) {
  const data = getData();
  const authUser = getAuthUser(token);
  const channel = data.channels.find(channel => channel.channelId === channelId);
  const user = data.users.find((u) => u.uId === uId);

  // Check if channelId is valid
  if (!channel) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  // Check if uId refers to a valid user
  if (!user) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }

  // Check if uId refers to a user who is not a member of the channel
  if (!channel.allMembers.find(x => x.uId === user.uId)) {
    throw HTTPError(400, 'uId refers to a user who is not a member of the channel');
  }

  // Check if uId belongs to a user who is already an owner
  if (channel.ownerMembers.find(x => x.uId === user.uId)) {
    throw HTTPError(403, 'uId refers to a user who is already an owner of the channel');
  }

  // channelId is valid and the authorised user does not have owner permissions in the channel
  if (!channel.ownerMembers.find(x => x.uId === authUser.uId)) {
    throw HTTPError(403, 'channelId is valid and the authorised user does not have owner permissions in the channel');
  }

  // Otherwise add the user to the ownerMembers
  channel.ownerMembers.push({
    uId: user.uId,
    email: user.emailAddress,
    nameFirst: user.firstName,
    nameLast: user.lastname,
    handleStr: user.handle
  });
  setData(data);
  return {};
}

/**
 * 
 * @param token: string -- token of a user to check if this user is authorised
 * @param channelId:  number -- the Id number of a channel 
 * @param uId: number -- id of user to be invited 
 * @returns {} if no error
 *          Or the following error codes for error cases:
 *          400
 *          1. channelId does not refer to a valid channel
 *          2. uId does not refer to a valid user
 *          3. uId refers to a user who is not an owner of the channel
 *          4. uId refers to a user who is currently the only owner of the channel
 *          403
 *          1. channelId is valid and the authorised user does not have owner permissions in the channel
 */
export function channelRemoveownerV2(token: string, channelId: number, uId: number): object {
  const data = getData();
  const authUser = getAuthUser(token);
  const channel = data.channels.find(channel => channel.channelId === channelId);
  const user = data.users.find(u => u.uId === uId);

  // Check if channelId is valid
  if (!channel) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  // Check if uId refers to a valid user
  if (!user) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }

  // Check if uId refers to a user who is not an owner of the channel
  if (!channel.ownerMembers.find(x => x.uId === user.uId)) {
    throw HTTPError(400, 'uId refers to a user who is not an owner of the channel');
  }

  // Check if the channel only has 1 owner
  if (channel.ownerMembers.length === 1) {
    throw HTTPError(400, 'uId refers to a user who is currently the only owner of the channel');
  }

  // channelId is valid and the authorised user does not have owner permissions in the channel
  if (!channel.ownerMembers.find(x => x.uId === authUser.uId)) {
    throw HTTPError(403, 'uId refers to a user who is currently the only owner of the channel');
  }

  // Otherwise, kick the user out of the ownerMembers
  channel.ownerMembers = channel.ownerMembers.filter(x => x.uId !== uId);
  return {};
}
