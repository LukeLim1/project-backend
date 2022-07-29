<<<<<<< HEAD
import { getData, setData} from './dataStore.js';

=======
import { getData, setData } from './dataStore';
import { checkToken } from './helperFunctions';
>>>>>>> 23ab0a9897f3394234ea3b3f3f24bd62f287f0e9

// Given a name create a channel that can either be public or private
// User who created a channel is automatically a memeber of the channel and the owner

// Parameters : authUserId: integer - used to identify which account will be used to create channel
//              name: string - names the channels
//              isPublic: boolean - indicates whether a channel is public or private

// Return type : { channelId },
//               {error: 'error'} when
//               - name.length is not between 1 and 20 chars

<<<<<<< HEAD
function channelsCreateV1 ( authUserId, name, isPublic ) {
    const data = getData();
    let randomNumber = Math.floor(Math.random() * 1000);
    if (data.usedNums.length !== 0) {
        randomNumber += data.usedNums[data.usedNums.length - 1];
    }
    data.usedNums.push(randomNumber);

    // error case
    if (name.length < 1 || name.length > 20) {
        return {error: 'error'};
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
    return {channelId: randomNumber};
}


=======
function channelsCreateV1 (token: string, name: string, isPublic: boolean) {
  // checkToken(token);
  // if (checkToken(token) === false) {
  //   return { error: 'error bad token' };
  // }

  const data = getData();
  let randomNumber = 1;
  if (data.usedChannelNums.length !== 0) {
    randomNumber += data.usedChannelNums[data.usedChannelNums.length - 1];
  }
  data.usedChannelNums.push(randomNumber);

  // error case
  if (name.length < 1 || name.length > 20) {
    return { error: 'error' };
  }
  const user = data.users.find(u => u.token.includes(token) === true);

  data.channels.push({
    name: `${name}`,
    isPublic: isPublic,
    ownerMembers: [user.userId],
    allMembers: [user.userId],
    channelId: randomNumber,
    messages: [],
  });
  setData(data);
  return { channelId: randomNumber };
}

>>>>>>> 23ab0a9897f3394234ea3b3f3f24bd62f287f0e9
// Given an authorised user id and create an array of all channels including channels ids and names
// that the authorised user is a member of

// Parameters : authUserId: integer - used to identify which account will be used to create relative channels

// Return type : { channelId },

<<<<<<< HEAD


function channelsListV1 (authUserId) {
    
    const data = getData();

    const obj_arr = [];

    for (const channel of data.channels) {
        if (channel.allMembers.includes(authUserId)) {
            const channels_obj = {
                channelId: channel.channelId,
                name: channel.name,
            }
        
            obj_arr.push(channels_obj);
        
        }

    }

    return obj_arr;

}


// Given an authorised user id and create an array of all channels including channels ids and names
// that includs private channels

// Parameters : authUserId: integer - used to identify which account will be used 

// Return type : { channelId },


function channelsListallV1 (authUserId) {

    const data = getData();

    const obj_arr = [];

    for (const element of data.channels) {

        const channels_obj = {
            channelId: element.channelId,
            name: element.name,
        }
        
        obj_arr.push(channels_obj);
    
    }


    return obj_arr;

}



export { channelsListV1, channelsListallV1, channelsCreateV1 };
=======
function channelsListV1 (token: string) {
  checkToken(token);
  // if (checkToken(token) === false) {
  //   return { error: 'error bad token' };
  // }

  const data = getData();

  if (data.channels.length === 0) {
    return { channels: [] };
  }

  const objectArray = [];
  const user = data.users.find(u => u.token.includes(token) === true);
  for (const channel of data.channels) {
    if (channel.allMembers.includes(user.userId)) {
      const channelsObject = {
        channelId: channel.channelId,
        name: channel.name,
      };

      objectArray.push(channelsObject);
    }
  }

  return { channels: objectArray };
}

// Given an authorised user id and create an array of all channels including channels ids and names
// that includs private channels

// Parameters : authUserId: integer - used to identify which account will be used

// Return type : { channelId },

function channelsListallV1 (token: string) {
  // checkToken(token);
  // if (checkToken(token) === false) {
  //   return { error: 'error' };
  // }
  const data = getData();

  if (data.channels.length === 0) {
    return { channels: [] };
  }

  const objectArray = [];

  for (const element of data.channels) {
    const channelsObject = {
      channelId: element.channelId,
      name: element.name,
    };

    objectArray.push(channelsObject);
  }

  return { channels: objectArray };
}

export { channelsListV1, channelsListallV1, channelsCreateV1 };
>>>>>>> 23ab0a9897f3394234ea3b3f3f24bd62f287f0e9
