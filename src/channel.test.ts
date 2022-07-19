import request, { HttpVerb } from 'sync-request';
import { url, port } from './config.json';
import { assert } from 'console';
import { createBasicAccount, createBasicAccount2, clear } from './auth.test';
import { createBasicChannel } from './channels.test';

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

function channelsCreate (token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', 'channels/create/v2', { token, name, isPublic });
}

function channelDetails (token: string, channelId: number) {
  return requestHelper('GET', 'channel/details/v2', { token, channelId });
}

function channelJoin (token: string, channelId: number) {
  return requestHelper('POST', 'channel/join/v2', { token, channelId });
}

beforeEach(() => {
  clear();
});

describe('HTTP tests using Jest', () => {
  /*
  test('Testing successful channel details', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));
    const res = request(
      'GET',
      `${url}:${port}/channel/details/v2`,
      {
        qs: {
          token: '1',
          channelId: 1,
        },
      }
    );
    console.log(res);
    expect(res.statusCode).toBe(OK);
    //expect(res).toMatchObject({ error: 'error' });
  });
  */

  test('channelDetails: channelId does not refer to valid channel', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));
    const res = request(
      'GET',
      `${url}:${port}/channel/details/v2`,
      {
        qs: {
          token: newUser.token[0],
          channelId: newChannel.channelId + 5,
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  test('channelDetails: channelId valid, but user is not a member', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));
    const res = request(
      'GET',
      `${url}:${port}/channel/details/v2`,
      {
        qs: {
          token: newUser.token[0].concat('abc'),
          channelId: newChannel.channelId,
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  test('Testing successful channelJoin', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    const res = request(
      'POST',
      `${url}:${port}/channel/join/v2`,
      {
        body: JSON.stringify({
          token: newUser2.token[0],
          channelId: newChannel.channelId,
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

  test('channelJoin: channelId does not refer to a valid channel', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    const res = request(
      'POST',
      `${url}:${port}/channel/join/v2`,
      {
        body: JSON.stringify({
          token: newUser2.token[0],
          channelId: newChannel.channelId + 5,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  test('channelJoin: authorised user is already a member', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    request(
      'POST',
      `${url}:${port}/channel/join/v2`,
      {
        body: JSON.stringify({
          token: newUser2.token[0],
          channelId: newChannel.channelId,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );

    const res = request(
      'POST',
      `${url}:${port}/channel/join/v2`,
      {
        body: JSON.stringify({
          token: newUser2.token[0],
          channelId: newChannel.channelId,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  test('channelJoin: channelId refers to private channel and authorised user is not channel member and not global owner', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token[0], 'channel1', false);
    const newChannel = JSON.parse(String(basicC.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    const res = request(
      'POST',
      `${url}:${port}/channel/join/v2`,
      {
        body: JSON.stringify({
          token: newUser2.token[0],
          channelId: newChannel.channelId,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });
});
