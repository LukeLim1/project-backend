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

function clear () {
  return requestHelper('DELETE', 'clear/v1', {});
}

beforeEach(() => {
  clear();
});

describe('HTTP tests using Jest', () => {
  test('dmLeave: dmId does not refer to valid DM', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newDm = dmCreate(newUser.token, [newUser.authUserId]);
    const res = dmLeave(newUser.token, newDm + 5);

    expect(res).toMatchObject({ error: 'error' });
  });

  test('dmLeave: dmId valid, but user is not a member of DM', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newDm = dmCreate(newUser.token, [newUser.authUserId]);
    const newUser2 = authRegister('oceanhall@email.com', '234567', 'Ocean', 'Hall');
    const res = dmLeave(newUser2.token, newDm);

    expect(res).toMatchObject({ error: 'error' });
  });

  /*
  test('dmMessages: dmId does not refer to valid DM', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newDm = dmCreate(newUser.token, [newUser.authUserId]);
    messageSenddm(newUser.token, newDm, 'Hi');
    const res = dmMessages(newUser.token, newDm + 5, 0);

    expect(res).toMatchObject({ error: 'error' });
  });

  test('dmMessages: start greater than total messages in channel', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newDm = dmCreate(newUser.token, [newUser.authUserId]);
    messageSenddm(newUser.token, newDm, 'Hi');
    const res = dmMessages(newUser.token, newDm, 10);

    expect(res).toMatchObject({ error: 'error' });
  });

  test('dmMessages: dmId valid, authorised user is not a member of DM', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newUser2 = authRegister('oceanhall@email.com', '234567', 'Ocean', 'Hall');
    const newDm = dmCreate(newUser.token, [newUser.authUserId]);
    messageSenddm(newUser.token, newDm, 'Hi');
    const res = dmMessages(newUser2.token, newDm, 0);

    expect(res).toMatchObject({ error: 'error' });
  });
  */
});
