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
    throw HTTPError(403, 'invalid token');
  }
  const data = getData();
  const user = data.users.find(u => u.uId === uId);
  if (!user) {
    throw HTTPError(400, 'uId does not refer to a valid user');
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
  // Error Cases
  if (nameFirst.length <= 1 || nameFirst.length >= 50) {
    throw HTTPError(400, 'Error, length of nameFirst must be between 1 - 50');
  }
  if (nameLast.length <= 1 || nameLast.length >= 50) {
    throw HTTPError(400, 'Error, length of nameLast must be between 1 - 50');
  }
  const data = getData();
  const user = data.users.find(u => u.token.includes(token) === true);
  if (!user) {
    throw HTTPError(400, 'Error, User not found');
  } else {
  // main code
    user.firstName = nameFirst;
    user.lastname = nameLast;
    setData(data);
  }
  return {};
}
function setEmailV1(token: string, email: string): object {
  // error cases
  if (!(validator.isEmail(email))) {
    throw HTTPError(400, 'Error, email is invalid');
  }
  const data = getData();
  const user = data.users.find(u => u.token.includes(token) === true);

  if (!user) {
    throw HTTPError(400, 'Error, User not found');
  } else {
  // email used already
    const arrayOfEmails: string[] = [];
    Object.values(data.users).forEach(element => {
      const toPush = element.emailAddress;
      arrayOfEmails.push(toPush);
    });
    for (const i in arrayOfEmails) {
      if (arrayOfEmails[i] === email) {
        throw HTTPError(400, 'Error, Email already in use');
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
    throw HTTPError(400, 'Error, handleStr must be between 3 - 20 chars');
  }
  const Exp = /^[0-9a-z]+$/;
  if (!handleStr.match(Exp)) {
    throw HTTPError(400, 'Error, handleStr contains non-alphanumeric chars');
  }
  const data = getData();
  // email used already
  const arrayofHandles: string[] = [];
  Object.values(data.users).forEach(element => {
    const toPush = element.handle;
    arrayofHandles.push(toPush);
  });
  for (const i in arrayofHandles) {
    if (arrayofHandles[i] === handleStr) {
      throw HTTPError(400, 'Error, handle already in use');
    }
  }
  const user = data.users.find(u => u.token.includes(token) === true);

  if (!user) {
    throw HTTPError(400, 'Error, User not found');
  } else {
    user.handle = handleStr;
    setData(data);
  }
  return {};
}

// usersAll
// prints details of all users except the ones removed

// Parameters: token: string - token of a user to check if this user is authorised

// Return type: object {}
//              throws 403 error when token is invalid

function usersAll (token: string) {
  if (checkToken(token) === false) {
    throw HTTPError(403, 'invalid token');
  }

  const users = [];
  const data = getData();
  for (const user of data.users) {
    if (user.firstName === 'Removed' && user.lastname === 'user') {
      continue;
    } else {
      const obj = {
        uId: user.uId,
        email: user.emailAddress,
        nameFirst: user.firstName,
        nameLast: user.lastname,
        handleStr: user.handle,
      };
      users.push(obj);
    }
  }

  return { users };
}

// uploadPhoto
// fetches URL from the internet and loads it into jpg file

// Parameters: imgUrl: string - URL of image to be loaded
//             xStart: number - beginning point of x-coordinate for image size
//             yStart: number - beginning point of y-coordinate for image size
//             xEnd: number - ending point of x-coordinate for image size
//             yEnd: number - ending point of y-coordinate for image size

// Return type: object {}
//              throws 400 error when imgUrl returns statusCode other than 200 or some other errors occur when retrieving the image
//              throws 400 error when any of the coordinate points are not within the dimensions of image at URL
//              throws 400 error when xEnd <= xStart or yEnd <= yStart
//              throws 400 error when image uploaded is not jpg

function uploadPhoto (imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  const res = request(
    'GET', imgUrl
  );

  if (res.statusCode !== 200) {
    throw HTTPError(400, 'status code is not 200');
  }

  if (!res) {
    throw HTTPError(400, 'res is not defined');
  }

  // check if any coordinates are not within dimensions of the image

  if (xEnd <= xStart) {
    throw HTTPError(400, 'xEnd is greater than xStart');
  }

  if (yEnd <= yStart) {
    throw HTTPError(400, 'yEnd is greater than yStart');
  }

  if (!imgUrl.endsWith('jpg')) {
    throw HTTPError(400, 'image uploaded is not JPG');
  }

  // do something related to image size?
  const bodyObj = res.getBody();
  fs.writeFileSync('test.jpg', bodyObj, { flag: 'w' });

  return {};
}

// user/stats/v1 & users/stats/v1
// displays statistics of user / workspace

// Parameters: token: string - token of a user to check if this user is authorised

// Return type: userStats: {
//                channelsJoined: [{numChannelsJoined, timeStamp}],
//                dmsJoined: [{numDmsJoined, timeStamp}],
//                messagesSent: [{numMessagesSent, timeStamp}],
//                involvementRate
//              }
// Return type: workspaceStats: {
//                channelsExist: [{numChannelsExist, timeStamp}],
//                dmsExist: [{numDmsExist, timeStamp}],
//                messagesExist: [{numMessagesExist, timeStamp}],
//                utilizationRate
//              }
//              throws 403 error when token is invalid

function userStats (token: string) {
  if (checkToken(token) === false) {
    throw HTTPError(403, 'invalid token');
  }

  const data = getData();
  const user = data.users.find(u => u.token.includes(token));
  const time = Math.floor((new Date()).getTime() / 1000);

  let involvementRate = (user.numChannelsJoined + user.numDmsJoined + user.numMessagesSent) /
        (data.numChannels + data.numDms + data.numMsgs);
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
  };
}

function usersStats () {
  const data = getData();
  const numChannelsExist = data.numChannels;
  const numDmsExist = data.numDms;
  const numMessagesExist = data.numMsgs;
  const time = Math.floor((new Date()).getTime() / 1000);

  const usersJoined: number[] = [];
  for (const channel of data.channels) {
    for (const member of channel.allMembers) {
      if (!usersJoined.includes(member.uId)) {
        usersJoined.push(member.uId);
      }
    }
  }

  for (const dm of data.DMs) {
    for (const member of dm.members) {
      if (!usersJoined.includes(member.uId)) {
        usersJoined.push(member.uId);
      }
    }
  }

  const numUsersJoined = usersJoined.length;
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
  };
}

export { userProfileV1, setNameV1, setEmailV1, setHandleV1, usersAll, uploadPhoto, userStats, usersStats };
