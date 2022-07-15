import request, { HttpVerb } from 'sync-request';
import { url, port } from './config.json';
import { assert } from 'console';

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

function clear () {
  return requestHelper('DELETE', 'clear/v1', {});
}

beforeEach(() => {
  clear();
});

describe('HTTP tests using Jest', () => {
  test('channelDetails: channelId does not refer to valid channel', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newChannel = channelsCreate(newUser.token, 'channel1', true);
    const res = channelDetails(newUser.token, newChannel + 5);

    expect(res).toMatchObject({ error: 'error' });
  });

  test('channelDetails: channelId valid, but user is not a member', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newChannel = channelsCreate(newUser.token, 'channel1', true);
    const res = channelDetails(newUser.token.concat('abcd'), newChannel);

    expect(res).toMatchObject({ error: 'error' });
  });

  test('channelJoin: channelId does not refer to a valid channel', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newChannel = channelsCreate(newUser.token, 'channel1', true);
    const newUser2 = authRegister('oceanhall@email.com', '234567', 'Ocean', 'Hall');
    const res = channelJoin(newUser2.token, newChannel + 5);

    expect(res).toMatchObject({ error: 'error' });
  });

  test('channelJoin: authorised user is already a member', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newChannel = channelsCreate(newUser.token, 'channel1', true);
    const newUser2 = authRegister('oceanhall@email.com', '234567', 'Ocean', 'Hall');
    channelJoin(newUser2.token, newChannel);
    const res = channelJoin(newUser2.token, newChannel);

    expect(res).toMatchObject({ error: 'error' });
  });

  test('channelJoin: channelId refers to private channel and authorised user is not channel member and not global owner', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newChannel = channelsCreate(newUser.token, 'channel1', false);
    const newUser2 = authRegister('oceanhall@email.com', '234567', 'Ocean', 'Hall');
    const res = channelJoin(newUser2.token, newChannel);

    expect(res).toMatchObject({ error: 'error' });
  });
});
