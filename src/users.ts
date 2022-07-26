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
  console.log(data);
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

function userStats () {

}

function usersStats () {

}

export { userProfileV1, setNameV1, setEmailV1, setHandleV1, usersAll, uploadPhoto };
