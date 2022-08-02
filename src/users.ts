import { getData, setData } from './dataStore';
import { IUser } from './interface';
import validator from 'validator';
import { checkToken } from './helperFunctions';
import { Error } from './interface';
import HTTPError from 'http-errors';
import fs from 'fs';
import request from 'sync-request';

// userProfileV1
// There are 2 parameters, authUserId and uId. userProfileV1 prints the details of a user with uId if found in datastore.
// Parameters: authUserId: integer - This is the Id of a user trying to view the details of the user with uId
//             uId: integer - Id of a user who is being viewed from the user with authUserId.

// Return type: { user } or {uId, email, nameFirst, nameLast, handleStr}
//              { error: 'error' } when any of the following:
//                  a user with uId is not found

function userProfileV1(token: string, uId: number): IUser | Error {
  if (checkToken(token) === false) {
    return { error: 'error' };
  }
  const data = getData();
  const user = data.users.find(u => u.userId === uId);
  if (!user) {
    return { error: 'error' };
  } else {
    return {
      uId: uId,
      email: user.emailAddress,
      nameFirst: user.firstName,
      nameLast: user.lastname,
      handleStr: user.handle,
    };
  }
}

function setNameV1(token: string, nameFirst: string, nameLast: string): object {
  const data = getData();
  const user = data.users.find(u => u.token.includes(token) === true);
  // Error Cases
  if (nameFirst.length <= 1 || nameFirst.length >= 50) {
    return { error: 'error' };
  }
  if (nameLast.length <= 1 || nameLast.length >= 50) {
    return { error: 'error' };
  }
  if (!user) {
    return { error: 'error' };
  } else {
  // main code
    user.firstName = nameFirst;
    user.lastname = nameLast;
    setData(data);
  }
  return {};
}
function setEmailV1(token: string, email: string): object {
  const data = getData();
  const user = data.users.find(u => u.token.includes(token) === true);
  // error cases
  if (!(validator.isEmail(email))) {
    return { error: 'error' };
  }

  if (!user) {
    return { error: 'error' };
  } else {
  // email used already
    const arrayOfEmails: string[] = [];
    Object.values(data.users).forEach(element => {
      const toPush = element.emailAddress;
      arrayOfEmails.push(toPush);
    });
    for (const i in arrayOfEmails) {
      if (arrayOfEmails[i] === email) {
        return { error: 'error email in use' };
      }
    }
    // main code
    user.emailAddress = email;
    setData(data);
  }
  return {};
}
function setHandleV1(token: string, handleStr: string): object {
  // error cases
  if (handleStr.length <= 3 || handleStr.length >= 20) {
    return { error: 'error' };
  }
  const Exp = /^[0-9a-z]+$/;
  if (!handleStr.match(Exp)) {
    return { error: 'error' };
  }
  const data = getData();
  const user = data.users.find(u => u.token.includes(token) === true);

  if (!user) {
    return { error: 'error' };
  } else {
    user.handle = handleStr;
    setData(data);
  }
  return {};
}

function usersAll (token: string) {
  if (checkToken(token) === false) {
    throw HTTPError(403, "invalid token");
  }

  const users = [];
  const data = getData();
  for (const user of data.users) {
    if (user.firstName === 'Removed' && user.lastname === 'user') {
      continue;
    }
    const obj = {
      uId: user.userId,
      email: user.emailAddress,
      nameFirst: user.firstName,
      nameLast: user.lastname,
      handleStr: user.handle,
    };
    users.push(obj);
  }

  return { users };
}

function uploadPhoto (imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  const res = request(
    'GET', imgUrl
  );

  if (res.statusCode !== 200) {
    throw HTTPError(400, "status code is not 200");
  }

  if (!res) {
    throw HTTPError(400, "res is not defined");
  }
  
  // check if any coordinates are not within dimensions of the image
  if (1) {
    
  }
  
  if (xEnd <= xStart) {
    throw HTTPError(400, "xEnd is greater than xStart");
  }
  
  if (yEnd <= yStart) {
    throw HTTPError(400, "yEnd is greater than yStart");
  }
  
  if (!imgUrl.endsWith('jpg')) {
    throw HTTPError(400, "image uploaded is not JPG");
  }
  
  // do something related to image size?
  const bodyObj = res.getBody();
  fs.writeFileSync('test.jpg', bodyObj, { flag: 'w' });

  return {};
}

function userStats (token: string) {
  const data = getData();
  const user = data.users.find(u => u.token.includes(token));
  const time = Math.floor((new Date()).getTime() / 1000);

  // let numChannelMsg = 0;
  // for (const channel of data.channels) {
  //   numChannelMsg += channel.messages.length;
  // }

  // let numDmMsg = 0;
  // for (const dm of data.DMs) {
  //   numDmMsg += dm.messages.length;
  // }

  // const numMessagesExist = numChannelMsg + numDmMsg;


  let involvementRate = (user.numChannelsJoined + user.numDmsJoined + user.numMessagesSent)
        / (data.numChannels + data.numDms + data.numMsgs);
  if (data.numChannels + data.numDms + data.numMsgs === 0) involvementRate = 0;
  else if (involvementRate > 1) involvementRate = 1;

  return {
    channelsJoined: [{
      numChannelsJoined: user.numChannelsJoined,
      timeStamp: time,
    }],
    dmsJoined: [{
      numDmsJoined: user.numDmsJoined,
      timeStamp: time,
    }],
    messagesSent: [{
      numMessagesSent: user.numMessagesSent,
      timeStamp: time,
    }],
    involvementRate: involvementRate,
  }
}

function usersStats () {
  const data = getData();
  const numChannelsExist = data.numChannels;
  const numDmsExist = data.numDms;
  const numMessagesExist = data.numMsgs;
  const time = Math.floor((new Date()).getTime() / 1000);

  const usersJoined = new Set();
  for (const channel of data.channels) {
    for (const member of channel.allMembers) {
      usersJoined.add(member);
    }
  }

  for (const dm of data.DMs) {
    for (const member of dm.members) {
      usersJoined.add(member);
    }
  }
  const numUsersJoined = usersJoined.size;
  let utilizationRate = numUsersJoined / (data.users.length);
  if (data.users.length === 0) utilizationRate = 0;
  else if (utilizationRate > 1) utilizationRate = 1;

  return {
    channelsExist: [{
      numChannelsExist: numChannelsExist,
      timeStamp: time,
    }],
    dmsExist: [{
      numDmsExist: numDmsExist,
      timeStamp: time,
    }],
    messagesExist: [{
      numMessagesExist: numMessagesExist,
      timeStamp: time,
    }],
    utilizationRate: utilizationRate,
  }
}

export { userProfileV1, setNameV1, setEmailV1, setHandleV1, usersAll, uploadPhoto, userStats, usersStats };
