import { dmCreateV1 } from './dm';
import { authRegisterV1 } from './auth';
import { clearV1 } from './other';

import request, { HttpVerb } from 'sync-request';
import { url, port } from './config.json';

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

function dmMessages (token: string, dmId: number, start: number) {
  return requestHelper('GET', 'dm/messages/v1', { token, dmId, start });
}

function messageSenddm (token: string, dmId: number, message: string) {
  return requestHelper('POST', 'message/senddm/v1', { token, dmId, message });
}

describe('Dm return values', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Valid creation of a DM', () => {
    const regTest1 = authRegisterV1('c@gmail.com', 'password', 'Cc', 'Cc');
    const regTest2 = authRegisterV1('ch@gmail.com', 'password', 'zz', 'zz');
    const regTest5 = authRegisterV1('chris@gmail.com', 'password', 'aa', 'aa');
    const regTest6 = authRegisterV1('harry@gmail.com', 'potter', 'tt', 'tt');
    const regTaken = authRegisterV1('christopher@gmail.com', 'password', 'bb', 'bb');
    // remove lint errors
    const lintArray = [regTaken];
    lintArray.slice(0);

    const array = [regTest1.authUserId, regTest2.authUserId, regTest5.authUserId, regTest6.authUserId];

    expect(dmCreateV1(regTest5.token, array)).toMatchObject({ identifier: expect.any(Number) });
  });
  test('invalid creation of a dm', () => {
    const regTest1 = authRegisterV1('c@gmail.com', 'password', 'Cc', 'Cc');
    const regTest2 = authRegisterV1('ch@gmail.com', 'password', 'zz', 'zz');
    const regTest5 = authRegisterV1('chris@gmail.com', 'password', 'aa', 'aa');
    const regTest6 = authRegisterV1('harry@gmail.com', 'potter', 'tt', 'tt');
    const regTaken = authRegisterV1('christopher@gmail.com', 'password', 'bb', 'bb');
    // remove lint errors
    const lintArray = [regTest6, regTaken];
    lintArray.slice(0);

    // uIds array isnt a subset of all registered users
    const array1 = [regTest1.authUserId, regTest2.authUserId, regTest5.authUserId, 2999990];
    expect(dmCreateV1(regTest5.token, array1)).toMatchObject({ error: 'error' });
    // duplicates in uIds array
    const array2 = [regTest1.authUserId, regTest5.authUserId, regTest5.authUserId];
    expect(dmCreateV1(regTest5.token, array2)).toMatchObject({ error: 'error' });
    // valid token
    expect(dmCreateV1('helllllooooooo', array2)).toMatchObject({ error: 'error' });
  });
});

describe('HTTP tests using Jest', () => {
  test('Test successful dmLeave', () => {
    clearV1();
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newDm = dmCreate(newUser.token, [newUser.authUserId]);
    const res = dmLeave(newUser.token, newDm);

    expect(res.statusCode).toBe(OK);
    expect(res).toStrictEqual({});
    expect(newDm.name.length).toEqual(0);
  });

  test('dmLeave: dmId does not refer to valid DM', () => {
    clearV1();
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newDm = dmCreate(newUser.token, newUser.authUserId);
    const res = dmLeave(newUser.token, newDm + 5);

    expect(res.statusCode).toBe(OK);
    expect(res).toMatchObject({ error: 'error' });
  });

  test('dmLeave: dmId valid, but user is not a member of DM', () => {
    clearV1();
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newDm = dmCreate(newUser.token, newUser.authUserId);
    const newUser2 = authRegister('oceanhall@email.com', '234567', 'Ocean', 'Hall');
    const res = dmLeave(newUser2.token, newDm);

    expect(res.statusCode).toBe(OK);
    expect(res).toMatchObject({ error: 'error' });
  });

  test('Test successful dmMessages', () => {
    clearV1();
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newDm = dmCreate(newUser.token, newUser.authUserId);
    const newMessage = messageSenddm(newUser.token, newDm, 'Hi');
    const newMessage2 = messageSenddm(newUser.token, newDm, 'There');
    const res = dmMessages(newUser.token, newDm, 0);

    expect(res.statusCode).toBe(OK);
    expect(res).toMatchObject({
      messages: [
        {
          messageId: newMessage,
          uId: newUser.authUserId,
          message: 'Hi',
          timeSent: expect.any(Number),
        },
        {
          messageId: newMessage2,
          uId: newUser.authUserId,
          message: 'There',
          timeSent: expect.any(Number),
        }
      ],
      start: 0,
      end: -1,
    });
  });

  test('dmMessages: dmId does not refer to valid DM', () => {
    clearV1();
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newDm = dmCreate(newUser.token, newUser.authUserId);
    messageSenddm(newUser.token, newDm, 'Hi');
    const res = dmMessages(newUser.token, newDm + 5, 0);

    expect(res.statusCode).toBe(OK);
    expect(res).toMatchObject({ error: 'error' });
  });

  test('dmMessages: start greater than total messages in channel', () => {
    clearV1();
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newDm = dmCreate(newUser.token, newUser.authUserId);
    messageSenddm(newUser.token, newDm, 'Hi');
    const res = dmMessages(newUser.token, newDm, 10);

    expect(res.statusCode).toBe(OK);
    expect(res).toMatchObject({ error: 'error' });
  });

  test('dmMessages: dmId valid, authorised user is not a member of DM', () => {
    clearV1();
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newUser2 = authRegister('oceanhall@email.com', '234567', 'Ocean', 'Hall');
    const newDm = dmCreate(newUser.token, newUser.authUserId);
    messageSenddm(newUser.token, newDm, 'Hi');
    const res = dmMessages(newUser2.token, newDm, 0);

    expect(res.statusCode).toBe(OK);
    expect(res).toMatchObject({ error: 'error' });
  });
});