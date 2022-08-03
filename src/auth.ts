import { getData, setData } from './dataStore';
import validator from 'validator';
import { checkToken } from './helperFunctions';
import HTTPError from 'http-errors';
import { Error, userTemplate } from './interface';
import createHttpError from 'http-errors';
// import HTTPError from 'http-errors';
// import crypto from 'crypto';

function getHashOf(plaintext: string) {
  const crypto = require('crypto');

  // Defining key
  const secret = 'Hi';
  // Calling createHash method
  const hash = crypto.createHash('sha256', secret)
    // updating data
    .update('How are you?')
    // Encoding to be used
    .digest('hex');
  return hash;
}
// Given user information from parameters, create a new account for them (as an object inside an array)
// and return a new unique 'authUserId'
// Generate a handle as past of the object that will be the concatenation of nameFirst and nameLast
// The concatenation must be cut off at 20 chars if it exceeds this length
// If handle already exists append the handle with the smallest number (from 0) to create a new handle
// Appending this incremental number can exceed the 20 char limit

// Parameters: email: string - used to create the account, email can only be used once
//             password: string - along with email, will be used to log in for the next function
//             nameFirst: string - used to create userHandle
//             nameLast: string - used to create userHandle

// Return type: { authUserId },
//              {error: 'error'} when any of the following:
//              - email is invalid
//              - email already been used to register
//              - password.length < 6
//              - nameFirst.length not between 1 - 50
//              - nameLast.length not between 1 - 50

function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
  const data = getData();
  // error cases //

  // case 1 : invalid email
  if (!(validator.isEmail(email))) {
    return { error: 'error' };
  }
  // case 2 : email used already
  const arrayOfEmails: string[] = [];
  Object.values(data.users).forEach(element => {
    const toPush = element.emailAddress;
    arrayOfEmails.push(toPush);
  });
  for (const i in arrayOfEmails) {
    if (arrayOfEmails[i] === email) {
      return { error: 'error' };
    }
  }
  // case 3 : password less than 6 chars
  if (password.length < 6) {
    return { error: 'error' };
    // case 4 : length of nameFirst not between 1 - 50 inclusive
  } else if (nameFirst.length <= 1 || nameFirst.length >= 50) {
    return { error: 'error' };
    // case 5 : length of nameLast not between 1 - 50 inclusive
  } else if (nameLast.length <= 1 || nameLast.length >= 50) {
    return { error: 'error' };
  }
  // End of error cases

  // No input errors//

  // case 1 : standard concatentation of nameFirst and nameLast
  let userHandle = (nameFirst + nameLast).toLowerCase();
  // case 2 : concatenation is longer than 20 characters
  if (userHandle.length >= 20) {
    const sliced = userHandle.slice(0, 20);
    userHandle = sliced;
  }
  // case 3 : concatenation has someone with the same handle
  const arrayOfHandles: string[] = [];
  const arrayToCount: string[] = [];
  // moving all handles in the list into arrayOfHandles
  // moving duplicate handles (and removing numbers) into arrayToCount
  Object.values(data.users).forEach(element => {
    const toPush = element.handle.replace(/[^a-z]/gi, '');
    arrayOfHandles.push(toPush);
  });
  for (const i in arrayOfHandles) {
    if (arrayOfHandles[i] === userHandle) {
      arrayToCount.push(arrayOfHandles[i]);
    }
  }
  if (arrayToCount.length > 1) userHandle += arrayToCount.length - 1;
  if (arrayToCount.length === 1) userHandle += 0;

  // ensuring id's that will never repeat
  let randomNumber = 1;
  if (data.usedNums.length !== 0) {
    randomNumber += data.usedNums[data.usedNums.length - 1];
  }
  let token = 1;
  if (data.usedTokenNums.length !== 0) {
    token += data.usedTokenNums[data.usedTokenNums.length - 1];
  }
  const tokenStr = token.toString();
  const tokenHashed = getHashOf(tokenStr);
  data.usedNums.push(randomNumber);
  data.usedTokenNums.push(token);
  data.users.push({
    emailAddress: email,
    uId: randomNumber,
    password: password,
    firstName: nameFirst,
    lastname: nameLast,
    handle: `${userHandle}`,
    globalPermissionId: 2,
    token: [tokenHashed],
    numChannelsJoined: 0,
    numDmsJoined: 0,
    numMessagesSent: 0,
  });
  setData(data);
  return {
    token: tokenHashed,
    authUserId: randomNumber
  };
}

// Give as users email and password, return their authUserId if they have been used to
// register/create an account

// Parameters: email: string - used to identify a user
//             password: string - used to login to a verified users account

// Return type: { authUserId },
//              {error: 'error'} when any of the following:
//              - email doesnt belong to a user
//              - password is incorrect for the corresponding email

function authLoginV1(email: string, password: string) {
  const data = getData();

  // put every email into an array to check against
  const arrayOfEmails: string[] = [];
  Object.values(data.users).forEach(element => {
    const toPush = element.emailAddress;
    arrayOfEmails.push(toPush);
  });
  // put every password into an array to check against
  const arrayOfPasswords: string[] = [];
  Object.values(data.users).forEach(element => {
    const toPush = element.password;
    arrayOfPasswords.push(toPush);
  });
  if (arrayOfEmails.indexOf(email) === -1) {
    return { error: 'error' };
  } else {
    if (arrayOfPasswords.indexOf(password) === -1) {
      return { error: 'error' };
    }
  }

  // setting new token
  const user = data.users.find(u => u.password === password);
  // main code
  let token = 1;
  if (data.usedTokenNums.length !== 0) {
    token += data.usedTokenNums[data.usedTokenNums.length - 1];
  }
  const tokenStr = token.toString();
  const tokenHashed = getHashOf(tokenStr);
  user.token.push(tokenHashed);
  setData(data);
  return { token: data.users[arrayOfEmails.indexOf(email)].token, authUserId: data.users[arrayOfEmails.indexOf(email)].uId };
}

// authLogout
// Removes token that is given in the parameter from the corresponding user

// Parameters: token: string - token of a user that is to be logged out

// Return type: object {}
//              throws 403 error when token is invalid

function authLogout(token: string): object | Error {
  if (checkToken(token) === false) {
    throw HTTPError(403, "invalid token");
  }

  const data = getData();
  const user = data.users.find(u => u.token.includes(token));

  const index = user.token.indexOf(token);
  user.token.splice(index, 1);
  setData(data);

  return {};
}

function makeid(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}
/**
 * Given an email send a secret reset password code to users email,
 * that when used for auth/password/reset shows user trying to reset the password is
 * who got the email.
 * No errors are displayed when invalid email or user not found as it presents
 * a security risk.
 * A user is logged out of all sessions (tokens invalidated) when requesting reset
 * @param {*} token
 * @param {*} email
 * @returns {}
 */
export function authPasswordResetRequest(token: string, email: string) {
  const data = getData();
  const user: userTemplate = data.users.find(u => u.token.includes(token) === true);

  if (!user) return { error: 'user not found' };
  if (!data.users.find(u => u.emailAddress === email)) {
    return { error: 'email not found' };
  }

  const rand = makeid(6);

  data.passwordRequest.push(
    {
      email: email,
      passReq: rand
    });

  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'be9ec5b31bc99d',
      pass: '9910b7b64cee1c'
    }
  });

  const mailOptions = {
    from: 'crunchieDevelopment@gmail.com',
    to: email,
    subject: 'Code to reset password is found below',
    text: rand
  };
  let worked = 0;
  transporter.sendMail(mailOptions, function (error: any, info: any) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      worked = 1;
    }
  });

  // log user out of all current sessions
  if (worked === 1) {
    user.token = [];
  }

  return {};
}

/**
 * Given a reset code for a user, change that users password to the
 * newPassword provided in the arguement
 * A reset code is invalidated once used
 * Once
 * @param {*} resetCode
 * @param {*} newPassword
 * @returns {} 400 error when resetCode is invalid or password entered is less than 6 chars long
 */
export function authPasswordReset (resetCode: any, newPassword: string) {
  // error case 1 : 400 error new password arguement.length < 6
  if (newPassword.length < 6) {
    throw createHttpError(400, 'new password must be 6 characters or longer');
  }
  const data = getData();
  // error case 2 : 400 error resetCode is not a valid activated resetCode
  if (!data.passwordRequest.some(u => u.passReq === resetCode)) {
    throw createHttpError(400, 'resetCode is not a valid reset code');
  }
  const findEmail = data.passwordRequest.find(u => u.passReq === resetCode);
  // console.log(findEmail)
  const user = data.users.find(u => u.emailAddress === findEmail.email);
  // console.log('printing user below')
  // console.log(user)
  // console.log('printing data.passwordRequest array below')
  // console.log(data.passwordRequest)

  // error case 3 : when the user was unable to be found
  if (!user) {
    throw createHttpError(400, 'user was not found');
  }

  // console.log('printing userCheck below')
  // console.log(userCheck)

  // main code
  user.password = newPassword;
  setData(data);

  data.passwordRequest = [];

  return {};
}

export { authLoginV1, authRegisterV1, authLogout };
