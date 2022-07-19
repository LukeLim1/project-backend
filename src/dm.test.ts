import request, { HttpVerb } from 'sync-request';
import { url, port } from './config.json';
import { assert } from 'console';
import { createBasicAccount, createBasicAccount2, clear } from './auth.test';

const OK = 200;

function requestHelper(method: HttpVerb, path: string, payload: object) {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    json = payload;
  }
  const res = request(method, `${url}:${port}/` + path, { qs, json });
  assert(res.statusCode === OK);
  return JSON.parse(res.getBody() as string);
}

function authRegister (email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', 'auth/register/v2', { email, password, nameFirst, nameLast });
}

function dmCreate (token: string, uIds: number[]) {
  return requestHelper('POST', 'dm/create/v1', { token, uIds });
}

function dmLeave (token: string, dmId: number) {
  return requestHelper('POST', 'dm/leave/v1', { token, dmId });
}

/*
function dmMessages (token: string, dmId: number, start: number) {
  return requestHelper('GET', 'dm/messages/v1', { token, dmId, start });
}

function messageSenddm (token: string, dmId: number, message: string) {
  return requestHelper('POST', 'message/senddm/v1', { token, dmId, message });
}
*/

export function createBasicDm(token: string, uIds: number[]) {
  const res = request(
    'POST',
    `${url}:${port}/dm/create/v1`,
    {
      body: JSON.stringify({
        token: token,
        uIds: uIds,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  return res;
}

beforeEach(() => {
  clear();
});

describe('HTTP tests using Jest', () => {
  test('Testing successful dmLeave', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token[0], [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const res = request(
      'POST',
      `${url}:${port}/dm/leave/v1`,
      {
        body: JSON.stringify({
          token: newUser.token[0],
          channelId: newDm.dmId,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({});
  });

  test('dmLeave: dmId does not refer to valid DM', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token[0], [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const res = request(
      'POST',
      `${url}:${port}/dm/leave/v1`,
      {
        body: JSON.stringify({
          token: newUser.token[0],
          channelId: newDm.dmId + 5,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: 'error' });
  });

  test('dmLeave: dmId valid, but user is not a member of DM', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token[0], [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const res = request(
      'POST',
      `${url}:${port}/dm/leave/v1`,
      {
        body: JSON.stringify({
          token: newUser.token[0].concat('abc'),
          channelId: newDm.dmId,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: 'error' });
  });

  test('Testing successful dmMessages', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token[0], [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));
    request(
      'POST',
      `${url}:${port}/message/senddm/v1`,
      {
        body: JSON.stringify({
          token: newUser.token[0],
          dmId: newDm.dmId,
          message: 'Hi',
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );

    const res = request(
      'GET',
      `${url}:${port}/dm/messages/v1`,
      {
        qs: {
          token: newUser.token[0],
          dmId: newDm.dmId,
          start: 0,
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({
      messages: [{
        messageId: expect.any(Number),
        uId: expect.any(Number),
        message: 'Hi',
        timeSent: expect.any(Number),
      }],
      start: 0,
      end: -1,
    });
  });

  test('dmMessages: dmId does not refer to valid DM', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token[0], [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const res = request(
      'GET',
      `${url}:${port}/dm/messages/v1`,
      {
        qs: {
          token: newUser.token[0],
          dmId: newDm.dmId + 5,
          start: 0,
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: 'error' });
  });

  test('dmMessages: start greater than total messages in channel', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token[0], [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const res = request(
      'GET',
      `${url}:${port}/dm/messages/v1`,
      {
        qs: {
          token: newUser.token[0],
          dmId: newDm.dmId,
          start: 50,
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: 'error' });
  });

  test('dmMessages: dmId valid, authorised user is not a member of DM', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token[0], [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    const res = request(
      'GET',
      `${url}:${port}/dm/messages/v1`,
      {
        qs: {
          token: newUser2.token[0],
          dmId: newDm.dmId,
          start: 0,
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: 'error' });
  });
});
