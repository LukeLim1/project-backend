import { getData, setData } from './dataStore';
import { checkToken } from './helperFunctions';
import HTTPError from 'http-errors';

// import { IUser } from './interface';

// Given a name create a channel that can either be public or private
// User who created a channel is automatically a memeber of the channel and the owner

// Parameters : authUserId: integer - used to identify which account will be used to create channel
//              name: string - names the channels
//              isPublic: boolean - indicates whether a channel is public or private

// Return type : { channelId },
//               {error: 'error'} when
//               - name.length is not between 1 and 20 chars

function channelsCreateV1(token: string, name: string, isPublic: boolean) {
  checkToken(token);
  if (checkToken(token) === false) {
    throw HTTPError(400, 'Error, bad token');
  }
  // error case
  if (name.length < 1 || name.length > 20) {
    throw HTTPError(400, 'Error, length must be between 1 - 20 chars');
  }

  const data = getData();
  let randomNumber = 1;
  if (data.usedChannelNums.length !== 0) {
    randomNumber += data.usedChannelNums[data.usedChannelNums.length - 1];
  }
  data.usedChannelNums.push(randomNumber);

  const user = data.users.find(u => u.token.includes(token) === true);

  const userPush = {
    uId: user.uId,
    email: user.emailAddress,
    nameFirst: user.firstName,
    nameLast: user.lastname,
    handleStr: user.handle
  };

  user.numChannelsJoined++;
  data.numChannels++;

  data.channels.push({
    name: `${name}`,
    isPublic: isPublic,
    ownerMembers: [userPush],
    allMembers: [userPush],
    channelId: randomNumber,
    messages: [],
    standup: undefined
  });
  setData(data);
  return { channelId: randomNumber };
}

/**
 * list for channel
 * @param token ticket of current user
 * @returns channel list
 * 403 error when token is not valid
 */
export function channelsListV1(token: string) {
  // check token
  if (checkToken(token) === false) {
    throw HTTPError(403, 'user not found');
  }

  const data = getData();
  // check channels length
  if (data.channels.length === 0) {
    return { channels: [] };
  }

  // find is member of and public
  const objectArray = [];
  const user = data.users.find(u => u.token.includes(token) === true);
  for (const channel of data.channels) {
    // check public
    if (!channel.isPublic) {
      continue;
    }
    // check member
    for (const member of channel.allMembers) {
      if (member.uId === user.uId) {
        const channelsObject = {
          channelId: channel.channelId,
          name: channel.name,
          ownerMembers: channel.ownerMembers,
          allMembers: channel.allMembers
        };
        objectArray.push(channelsObject);
        break;
      }
    }
  }
  return { channels: objectArray };
}

/**
 * list for all user
 * @param token ticket of current user
 * @returns including private channels
 * 403 error when token is not valid
 */
export function channelsListallV1(token: string) {
  // check token
  if (checkToken(token) === false) {
    throw HTTPError(403, 'user not found');
  }
  const data = getData();

  // check channels length
  if (data.channels.length === 0) {
    return { channels: [] };
  }

  const objectArray = [];
  const user = data.users.find(u => u.token.includes(token) === true);

  for (const channel of data.channels) {
    // check member
    for (const member of channel.allMembers) {
      if (member.uId === user.uId) {
        const channelsObject = {
          channelId: channel.channelId,
          name: channel.name,
          ownerMembers: channel.ownerMembers,
          allMembers: channel.allMembers
        };
        objectArray.push(channelsObject);
        break;
      }
    }
  }

  return { channels: objectArray };
}

export { channelsCreateV1 };
