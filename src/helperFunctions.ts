import { getData, setData } from './dataStore';
import request, { HttpVerb } from 'sync-request';
import config from './config.json';
import { IUser, userTemplate } from './interface';
import fs from 'fs';

import HTTPError from 'http-errors';

const port = config.port;
const url = config.url;

export function saveData() {
  const data = getData();

  const filename = 'data.json';

  fs.writeFileSync(filename, JSON.stringify(data), { flag: 'w' });
}

export function loadData() {
  const filename = 'data.json';
  if (!fs.existsSync(filename)) {
    return;
  }

  const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  setData(data);
}

// checks for duplicates in arrays
export function containsDuplicates(array: number[]): boolean {
  return array.length !== new Set(array).size;
}

// test for a valid token
export function checkToken(token: string): boolean | undefined {
  const data = getData();
  const tokenArray: string[] = [];
  Object.values(data.users).forEach(element => {
    tokenArray.push(...element.token);
  });

  for (const i of tokenArray) {
    if (token === i) {
      return true;
    }
  }
  return false;
}

// create new account
export function newReg(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v3`,
    {
      body: JSON.stringify({
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  return res;
}
// create the most basic account (no args)
export function createBasicAccount() {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v3`,
    {
      body: JSON.stringify({
        email: 'zachary-chan@gmail.com',
        password: 'z5312386',
        nameFirst: 'Zachary',
        nameLast: 'Chan'
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  return res;
}
// create the most basic account variation (no args)
export function createBasicAccount2() {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v3`,
    {
      body: JSON.stringify({
        email: 'zachary-chan2@gmail.com',
        password: 'z5312387',
        nameFirst: 'Zachary2',
        nameLast: 'Chan2'
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  return res;
}

export function createBasicAccount3() {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v3`,
    {
      body: JSON.stringify({
        email: 'zachary-chan3@gmail.com',
        password: 'z5312387',
        nameFirst: 'Zachary3',
        nameLast: 'Chan3'
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  return res;
}

// log out
export function requestAuthLogout(token: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/logout/v2`,
    {
      headers: {
        token: token,
        'Content-type': 'application/json',
      },
    }
  );
  return res;
}

// change name
export function changeName(token: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
    `${url}:${port}/user/profile/setname/v2`,
    {
      body: JSON.stringify({
        nameFirst: nameFirst,
        nameLast: nameLast
      }),
      headers: {
        'Content-type': 'application/json',
        token: token,
      },
    }
  );
  return res;
}
// change email
export function changeEmail(token: string, email: string) {
  const res = request(
    'PUT',
    `${url}:${port}/user/profile/setemail/v2`,
    {
      body: JSON.stringify({
        email: email,
      }),
      headers: {
        'Content-type': 'application/json',
        token: token,
      },
    }
  );
  return res;
}
// change handle
export function changeHandle(token: string, handle: string) {
  const res = request(
    'PUT',
    `${url}:${port}/user/profile/sethandle/v2`,
    {
      body: JSON.stringify({
        handleStr: handle,
      }),
      headers: {
        'Content-type': 'application/json',
        token: token,
      },
    }
  );
  return res;
}
// create a dm
export function createBasicDm(token: string, uIds: number[]) {
  const res = request(
    'POST',
    `${url}:${port}/dm/create/v2`,
    {
      body: JSON.stringify({
        uIds: uIds,
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      },
    }
  );
  return res;
}

// leave a channel user is in
export function leaveChannel(token: string, channelId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/leave/v2`,
    {
      body: JSON.stringify({
        channelId: channelId
      }),
      headers: {
        'Content-type': 'application/json',
        token: token,
      },
    }
  );
  return res;
}

// channel details
export function requestChannelDetails (token: string, channelId: number) {
  const res = request(
    'GET',
    `${url}:${port}/channel/details/v3`,
    {
      qs: {
        channelId: channelId,
      },
      headers: {
        token: token,
      }
    }
  );

  return res;
}

// join a channel
export function requestJoinChannel(token: string, channelId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/join/v3`,
    {
      body: JSON.stringify({
        channelId: channelId,
      }),
      headers: {
        token: token,
        'Content-type': 'application/json',
      },
    }
  );
  return res;
}

export function requestDmDetails(token: string, dmId: number) {
  const res = request(
    'GET',
    `${url}:${port}/dm/details/v2`,
    {
      qs: {
        dmId: dmId,
      },
      headers: {
        token: token,
      },
    }
  );
  return res;
}

export function requestDmLeave(token: string, dmId: number) {
  const res = request(
    'POST',
    `${url}:${port}/dm/leave/v2`,
    {
      body: JSON.stringify({
        dmId: dmId,
      }),
      headers: {
        token: token,
        'Content-type': 'application/json',
      },
    }
  );
  return res;
}

export function requestDmMessages(token: string, dmId: number, start: number) {
  const res = request(
    'GET',
    `${url}:${port}/dm/messages/v2`,
    {
      qs: {
        dmId: dmId,
        start: start,
      },
      headers: {
        token: token,
      },
    }
  );
  return res;
}

export function requestSendDm(token: string, dmId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}/message/senddm/v2`,
    {
      body: JSON.stringify({
        dmId: dmId,
        message: message,
      }),
      headers: {
        token: token,
        'Content-type': 'application/json',
      },
    }
  );
  return res;
}

// user profile
export function requestUserProfile (token: string, uId: number) {
  const res = request(
    'GET',
    `${url}:${port}/user/profile/v3`,
    {
      qs: {
        uId: uId,
      },
      headers: {
        token: token,
      }
    }
  );
  return res;
}

export function requestUsersAll (token: string) {
  const res = request(
    'GET',
    `${url}:${port}/users/all/v2`,
    {
      headers: {
        token: token,
      }
    }
  );

  return res;
}

// upload a photo
export function requestUploadPhoto(imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  return request(
    'POST',
    `${url}:${port}/user/profile/uploadphoto/v1`,
    {
      body: JSON.stringify({
        imgUrl: imgUrl,
        xStart: xStart,
        yStart: yStart,
        xEnd: xEnd,
        yEnd: yEnd,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
}

// Fetches required statistics about this user's use of UNSW Treats
export function requestUserStats (token: string) {
  const res = request(
    'GET',
    `${url}:${port}/user/stats/v1`,
    {
      headers: {
        token: token,
      }
    }
  );

  return res;
}

// Fetches required statistics about the workspace's use of UNSW Treats
export function requestUsersStats () {
  const res = request(
    'GET',
    `${url}:${port}/users/stats/v1`
  );

  return res;
}

export function requestUserRemove (token: string, uId: number) {
  const res = request(
    'DELETE',
    `${url}:${port}/admin/user/remove/v1`,
    {
      qs: {
        uId: uId,
      },
      headers: {
        token: token,
      },
    }
  );
  return res;
}

export function requestUserPermissionChange(token: string, uId: number, permissionId: number) {
  const res = request(
    'POST',
    `${url}:${port}/admin/userpermission/change/v1`,
    {
      body: JSON.stringify({
        uId: uId,
        permissionId: permissionId,
      }),
      headers: {
        token: token,
        'Content-type': 'application/json',
      },
    }
  );
  return res;
}

export function sendMessage(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}/message/send/v2`,
    {
      body: JSON.stringify({
        channelId: channelId,
        message: message
      }),
      headers: {
        token: token,
        'Content-type': 'application/json',
      },
    }
  );
  return res;
}

export function dmSend(token: string, dmId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}/message/senddm/v1`,
    {
      body: JSON.stringify({
        token: token,
        dmId: dmId,
        message: message
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  return res;
}

export function shareMessage(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  const res = request(
    'POST',
    `${url}:${port}/message/share/v1`,
    {
      body: JSON.stringify({
        ogMessageId: ogMessageId,
        message: message,
        channelId: channelId,
        dmId: dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      },
    }
  );
  return res;
}

export function resetPassword(resetCode: string, newPassword: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/passwordreset/v1`,
    {
      body: JSON.stringify({
        resetCode: resetCode,
        newPassword: newPassword
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  return res;
}

export function findResetCode(userId: number) {
  const data = getData();

  const user = data.users.find(u => u.uId === userId);
  // console.log(user);
  const resetObject = data.passwordRequest.find(u => u.email === user.emailAddress);
  // console.log(resetObject);
  return resetObject.passReq;
}

// clear everything
export function clear() {
  const res = request(
    'DELETE',
    `${url}:${port}/clear/v1`
  );
  const array = [res];
  array.slice(0);
}

export function convertUserTemplateToIUser(temp: userTemplate): IUser {
  const res: IUser = {
    uId: temp.uId,
    email: temp.emailAddress,
    nameFirst: temp.firstName,
    nameLast: temp.lastname,
    handleStr: temp.handle,
  };
  return res;
}

export function sendDMMessage(token: string, dmId: number, message: string) {
  const param = JSON.stringify({
    dmId: dmId,
    message: message
  });

  const res = request(
    'POST',
    `${url}:${port}/message/senddm/v2`,
    {
      body: param,
      headers: {
        'Content-type': 'application/json',
        token: token
      },
    }
  );
  return res;
}

export function getRequest(method: HttpVerb, path: string, payload: object, token?: object) {
  let qs = {};
  let json = {};
  let headers = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    json = payload;
  }
  if (token != null) {
    headers = token;
  }
  const res = request(method, `${url}:${port}` + path, { qs, json, headers });
  if (res.statusCode !== 200) {
    return res;
  }
  return JSON.parse(res.getBody() as string);
}

export function createBasicChannel(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
        `${url}:${port}/channels/create/v3`,
        {
          body: JSON.stringify({
            name: name,
            isPublic: isPublic,
          }),
          headers: {
            'Content-type': 'application/json',
            token: token
          },
        }
  );
  return res;
}

export function getAuthUser(token: string) {
  const data = getData();
  const user: userTemplate = data.users.find(user => user.token.includes(token));
  if (!user) {
    throw HTTPError(403, 'can not find user token');
  }
  return user;
}

export function messageSendV2(token: string, channelId: number, message: string) {
  return getRequest(
    'POST',
    '/message/send/v2',
    {
      channelId, message,
    },
    { token }
  );
}
