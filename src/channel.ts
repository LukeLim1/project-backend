import { getData, setData } from './dataStore';
import { IChannelDetails, userTemplate } from './interface';
import { checkToken } from './helperFunctions';
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
    throw HTTPError(403, "invalid token");
  }

  const data = getData();
  const user = data.users.find(u => u.token.includes(token));
  const channel = data.channels.find(channel => channel.channelId === channelId);

  if (!channel) {
    throw HTTPError(400, "channelId doesn't refer to valid channel");
  }
  // check if user with token belongs to channel with channelId
  let isMember = false;
  for (const member of channel.allMembers) {
    if (user.uId === member.uId) {
      isMember = true;
    }
  }
  if (!isMember) throw HTTPError(403, "authorised user is not a member of the channel");

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
    throw HTTPError(403, "invalid token");
  }

  const data = getData();
  const channel = data.channels.find(channel => channel.channelId === channelId);
  const user = data.users.find(u => u.token.includes(token));

  if (!channel) {
    throw HTTPError(400, "channelId doesn't refer to valid channel");
  }
  
  let isMember = false;
  for (const member of channel.allMembers) {
    if (user.uId === member.uId) {
      isMember = true;
    }
  }
  if (isMember) throw HTTPError(400, "authorised user is already a member of the channel");

  if (channel.isPublic === false && user.globalPermissionId !== 1) {
    throw HTTPError(403, "authorised user is not channel member & global owner");
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

export function channelLeaveV1(token: string, channelId: number): object {
  // const data = getData();
  // const channel = data.channels.find(channel => channel.channelId === channelId);
  // const getUser = data.users.find(u => u.token.includes(token));

  // if (channel === undefined) {
  //   return { error: 'error' };
  // }

  // if (!channel.allMembers.includes(getUser.userId)) {
  //   return { error: 'error' };
  // }

  // const indexAll = channel.allMembers.indexOf(getUser.userId);
  // channel.allMembers.splice(indexAll, 1);
  // if (channel.ownerMembers.includes(getUser.userId)) {
  //   const indexOwner = channel.ownerMembers.indexOf(getUser.userId);
  //   channel.allMembers.splice(indexOwner, 1);
  // }

  // getUser.numChannelsJoined--;
  // setData(data);

  return {};
}

export function channelInviteV2(token: string, channelId: number, uId: number) {
  // const data = getData();
  // const user: userTemplate = data.users.find(user => user.userId === uId);
  // const channel = data.channels.find(channel => channel.channelId === channelId);

  // // Checking if the token passed in is valid
  // if (checkToken(token) === false) {
  //   return { error: 'error' };
  // }

  // if (channel === undefined) {
  //   return { error: 'error' };
  // }

  // // Checking for invalid cases
  // // Case 1: Not a valid user as indicated by invalid uID
  // if (!user) {
  //   return { error: 'error' };
  // }
  // // Case 2: Not a valid channel as indicated by invalid channelID
  // if (!channel) {
  //   return { error: 'error' };
  // }
  // // Case 3: Inviting a user who is already a channel member
  // // if (channel.allMembers.includes(uId)) {
  // //   return { error: 'error' };
  // // }
  // const arrayUserId: number[] = [];
  // Object.values(data.channels).forEach(element => {
  //   let toPush;
  //   for (const i in element.allMembers) { toPush = element.allMembers[i].userId; }
  //   arrayUserId.push(toPush);
  // });

  // if (arrayUserId.includes(user.userId)) {
  //   return { error: 'error' };
  // }

  // // Case 4: The user doesn't have a valid token
  // // if (!user.token.includes(token)) {
  // //  return { error: 'error' };
  // // }

  // // Otherwise, the invited member is added to the channel immediately
  // channel.allMembers.push(uId);
  // user.numChannelsJoined++;
  return {};
}

export function channelMessagesV2 (token: string, channelId: number, start: number) {
  // if (checkToken(token) === false) {
  //   throw HTTPError(403, "invalid token");
  // }

  // const data = getData();
  // const user: userTemplate = data.users.find(u => u.token.includes(token) === true);
  // const channel = data.channels.find(channel => channel.channelId === channelId);
  // // Setting a new index "end" to be the value of "start + 50"
  // // and a new array to store the restructured messages
  // let end = start + 50;
  // let messagesRestructured;

  // // Checking if the token passed in is valid
  // if (checkToken(token) === false) {
  //   return { error: 'error' };
  // }

  // if (channel === undefined) {
  //   return { error: 'error' };
  // }

  // if (!user) {
  //   return { error: 'error' };
  // }

  // // Checking for invalid case
  // // Case 1: Invalid channelId
  // if (!channel) {
  //   return { error: 'error' };
  // }
  // const messagesCopy = channel.messages;

  // // Case 2: Start is greater than the total number of messages in the channel
  // if (start > messagesCopy.length) {
  //   return { error: 'error' };
  // }

  // // Case 3: ChannelId valid (already checked in case 1 previously) but the user is not a member of the valid channel
  // if (!channel.allMembers.includes(user.userId)) {
  //   return { error: 'error' };
  // }

  // // Otherwise, it should be a "normal" case
  // // If the end index belongs to the most recent message
  // // returns -1 in "end"
  // if (end >= messagesCopy.length - 1) {
  //   end = -1;
  //   messagesRestructured = messagesCopy.slice(0, messagesCopy.length - start); // We want the older messages
  // } else {
  //   messagesRestructured = messagesCopy.slice(messagesCopy.length - end - 1, messagesCopy.length - start); // We want the older messages
  // }

  // // Now flip the messages back so index 0 would be the most recent message when we retrive the selected messages
  // messagesRestructured.reverse();
  // return { messages: messagesRestructured, start, end };
}

export function channelAddownerV1(token: string, channelId: number, uId: number) {
  // const data = getData();
  // const channel = data.channels.find(channel => channel.channelId === channelId);
  // const getUser = data.users.find(u => u.userId === uId);
  // // const user = userProfileV1(token, uId);

  // // Checking if the token passed in is valid
  // if (checkToken(token) === false) {
  //   return { error: 'error' };
  // }
  // if (channel === undefined) {
  //   return { error: 'error' };
  // }
  // // Check if uId refers to a valid user
  // if (!getUser) {
  //   return { error: 'error' };
  // }

  // // Check if channelId is valid
  // if (!channel) {
  //   return { error: 'error' };
  // }

  // // Check if uId refers to a user who is not a member of the channel
  // if (!channel.allMembers.includes(uId)) {
  //   return { error: 'error' };
  // }

  // // Check if uId belongs to a user who is already an owner
  // if (channel.ownerMembers.includes(uId)) {
  //   return { error: 'error' };
  // }

  // // Otherwise add the user to the ownerMembers
  // channel.ownerMembers.push(uId);
  // setData(data);
  return {};
}

export function channelRemoveownerV1(token: string, channelId: number, uId: number): object {
  // const data = getData();
  // const channel = data.channels.find(channel => channel.channelId === channelId);
  // console.log(channel);
  // const getUser = data.users.find(u => u.userId === uId);

  // // Checking if the token passed in is valid
  // if (checkToken(token) === false) {
  //   return { error: 'error' };
  // }
  // if (channel === undefined) {
  //   return { error: 'error' };
  // }

  // // Check if uId refers to a valid user
  // if (!getUser) {
  //   return { error: 'error' };
  // }

  // // Check if channelId is valid
  // if (!channel) {
  //   return { error: 'error' };
  // }
  // if (channel === undefined) {
  //   return { error: 'error' };
  // }

  // // Check if uId refers to a user who is not a member of the channel
  // // if (!channel.allMembers.includes(uId)) {
  // //   return { error: 'error' };
  // // }
  // // const arrayUserId = []
  // // Object.values(data.channels).forEach(element => {
  // //   let toPush;
  // //   for (const i in element.allMembers)
  // //     toPush = element.allMembers[i].userId;
  // //   arrayUserId.push(toPush);
  // // });
  // // console.log(arrayUserId)
  // // console.log(uId)
  // // if (!arrayUserId.includes(uId)) {
  // //   return { error: 'error not a member' };
  // // }

  // // Check if uId refers to a user who is not an owner of the channel
  // if (channel.ownerMembers[0].userId !== uId) {
  //   return { error: 'error not an owner' };
  // }

  // // Check if the channel only has 1 owner
  // if (channel.ownerMembers.length === 1) {
  //   return { error: 'error only 1 owner' };
  // }

  // // Otherwise, kick the user out of the ownerMembers
  // const indexOwner = channel.ownerMembers.indexOf(uId);
  // channel.ownerMembers.splice(indexOwner, 1);
  return {};
}
