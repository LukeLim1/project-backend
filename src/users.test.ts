import { clearV1 } from './other';
import { authRegisterV1 } from './auth';
import { userProfileV1, setNameV1, setEmailV1, setHandleV1 } from './users';

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

function usersAll (token: string) {
  return requestHelper('GET', 'users/all/v1', { token });
}

function clear () {
    return requestHelper('DELETE', 'clear/v1', {});
}

beforeEach(() => {
    clear();
});

test('Test successful userProfileV1', () => {
  clearV1();
  const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
  const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');
  const result = userProfileV1(owner.authUserId.toString(), user1.authUserId);

  expect(result).toMatchObject({
    uId: user1.authUserId,
    email: 'user1@email.com',
    nameFirst: 'Ocean',
    nameLast: 'Hall',
    handleStr: 'oceanhall',
  });
});

describe('authRegisterV1', () => {
  let uId: number, authUserId: number;
  beforeEach(() => {
    clearV1();
    uId = authRegisterV1('yoloemail@gmail.com', 'drtfg1', 'Heron', 'Yolo').authUserId;
    authUserId = authRegisterV1('benmail2@gmail.com', 'drtfg1', 'Ben', 'Floyd').authUserId;
  });

  describe('Error cases', () => {
    test('invalid user', () => {
      expect(userProfileV1(authUserId.toString(), uId + 100)).toMatchObject({ error: 'error' });
    });
  });

  describe('No errors', () => {
    test('profile success', () => {
      const returnUser = {
        uId: uId,
        email: 'yoloemail@gmail.com',
        nameFirst: 'Heron',
        nameLast: 'Yolo',
        handleStr: 'heronyolo',
      };
      expect(userProfileV1(authUserId.toString(), uId)).toMatchObject(returnUser);
    });
  });
});

// zachs tests for setname, setemail and sethandle
describe('update: name, email and handle', () => {
  test('Changing name', () => {
    clearV1();
    const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
    const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');

    const nameChange = setNameV1(owner.token[0], 'Name', 'Change');

    const array = [user1, nameChange];
    array.slice(1);

    const updatedNames = userProfileV1(owner.authUserId.toString(), owner.authUserId);

    expect(updatedNames).toMatchObject({
      uId: owner.authUserId,
      email: 'owner@email.com',
      nameFirst: 'Name',
      nameLast: 'Change',
      handleStr: 'adabob',
      token: [expect.any(String)],
    });
  });
  test('Changing email', () => {
    clearV1();
    const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
    const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');

    const emailChange = setEmailV1(owner.token[0], 'newEmail@gmail.com');
    const updatedEmail = userProfileV1(owner.authUserId.toString(), owner.authUserId);

    const array = [user1, emailChange];
    array.slice(1);

    expect(updatedEmail).toMatchObject({
      uId: owner.authUserId,
      email: 'newEmail@gmail.com',
      nameFirst: 'Ada',
      nameLast: 'Bob',
      handleStr: 'adabob',
      token: [expect.any(String)],
    });
  });
  test('Changing handle', () => {
    clearV1();
    const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
    const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');

    const handleChange = setHandleV1(owner.token, 'newhandlehahaha');
    const updatedHandle = userProfileV1(owner.authUserId.toString(), owner.authUserId);

    const array = [user1, handleChange];
    array.slice(1);

    expect(updatedHandle).toMatchObject({
      uId: owner.authUserId,
      email: 'owner@email.com',
      nameFirst: 'Ada',
      nameLast: 'Bob',
      handleStr: 'newhandlehahaha',
      token: [expect.any(String)],
    });
  });
});

describe('HTTP tests using Jest', () => {
  test('Test successful usersAll', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newUser2 = authRegister('oceanhall@email.com', '234567', 'Ocean', 'Hall');
    const res = usersAll(newUser.token);

    expect(res.statusCode).toBe(OK);
    expect(res).toStrictEqual({
        users: [{
            uId: newUser.authUserId,
            email: 'adabob@email.com',
            nameFirst: 'Ada',
            nameLast: 'Bob',
            handleStr: 'adabob',
        },
        {
            uId: newUser2.authUserId,
            email: 'oceanhall@email.com',
            nameFirst: 'Ocean',
            nameLast: 'Hall',
            handleStr: 'oceanhall',
        }]
    });
  });
});
