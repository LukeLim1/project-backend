import { getData, setData } from './dataStore';
import { checkToken } from './helperFunctions'

// Given a name create a channel that can either be public or private
// User who created a channel is automatically a memeber of the channel and the owner

// Parameters : authUserId: integer - used to identify which account will be used to create channel
//              name: string - names the channels
//              isPublic: boolean - indicates whether a channel is public or private

// Return type : { channelId },
//               {error: 'error'} when
//               - name.length is not between 1 and 20 chars

interface channelsObject {
  channelId: number,
  name: string,
}

function channelsCreateV1 (authUserId: number, name: string, isPublic: boolean) {
  const data = getData();
  let randomNumber = Math.floor(Math.random() * 1000);
  if (data.usedNums.length !== 0) {
    randomNumber += data.usedNums[data.usedNums.length - 1];
  }
  data.usedNums.push(randomNumber);

  // error case
  if (name.length < 1 || name.length > 20) {
    return { error: 'error' };
  }

  data.channels.push({
    name: `${name}`,
    isPublic: isPublic,
    ownerMembers: [authUserId],
    allMembers: [authUserId],
    channelId: randomNumber,
    messages: [],
  });
  setData(data);
  return { channelId: randomNumber };
}

// Given an authorised user id and create an array of all channels including channels ids and names
// that the authorised user is a member of

// Parameters : authUserId: integer - used to identify which account will be used to create relative channels

// Return type : { channelId },

function channelsListV1 (token: string) { //authUserId: number) {

  const data = getData();

  let trigger = 0;

  for (const user of data.users) {
    if (user.token.includes(token)) {
      trigger = 1;
    } 
  }

  if (trigger = 0) {
    return {error: 'error'};
  }

  if (data.channels.length === 0) {
    return { channels: [] };
  }

  const objectArray: channelsObject[] = [];

  for (const channel of data.channels) {
    if (channel.allMembers.includes(token)) {
      const channelsObject: channelsObject = {
        channelId: channel.channelId,
        name: channel.name,
      };

      objectArray.push(channelsObject);
    }
  }

  setData(data);
  return { channels: objectArray };
}

// Given an authorised user id and create an array of all channels including channels ids and names
// that includs private channels

// Parameters : authUserId: integer - used to identify which account will be used

// Return type : { channelId },

function channelsListallV1 (token: string){

  const data = getData();

  let trigger = 0;

  for (const user in data.users) {
    if (user.token.includes(token)) {
      trigger = 1;
    } 
  }

  if (trigger = 0) {
    return {error: 'error'};
  }


  if (data.channels.length === 0) {
    return { channels: [] };
  }

  const objectArray: channelsObject[] = [];

  for (const element of data.channels) {
    const channelsObject = {
      channelId: element.channelId,
      name: element.name,
    };

    objectArray.push(channelsObject);
  }

  setData(data);
  return { channels: objectArray };
}

export { 
  channelsListV1, 
  channelsListallV1, 
  channelsCreateV1,
};
