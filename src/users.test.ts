import { clearV1 } from './other';
import { authRegisterV1 } from './auth';
import { userProfileV1, setNameV1, setEmailV1, setHandleV1 } from './users';

import request from 'sync-request';
import { url, port } from './config.json';

const OK = 200;

test('Test successful userProfileV1', () => {
  clearV1();
  const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
  const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');
  const result = userProfileV1(owner.authUserId, user1.authUserId);

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
      expect(userProfileV1(authUserId, uId + 100)).toMatchObject({ error: 'error' });
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
      expect(userProfileV1(authUserId, uId)).toMatchObject(returnUser);
    });
  });
});

// zachs tests for setname, setemail and sethandle
describe('update: name, email and handle', () => {
  test('Changing name', () => {
    clearV1();
    const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
    const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');

    const nameChange = setNameV1(owner.token, 'Name', 'Change');

    const array = [user1, nameChange];
    array.slice(1);

    const updatedNames = userProfileV1(owner.authUserId, owner.authUserId);

    expect(updatedNames).toMatchObject({
      uId: owner.authUserId,
      email: 'owner@email.com',
      nameFirst: 'Name',
      nameLast: 'Change',
      handleStr: 'adabob',
      token: [expect.any(Number)],
    });
  });
  test('Changing email', () => {
    clearV1();
    const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
    const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');

    const emailChange = setEmailV1(owner.token, 'newEmail@gmail.com');
    const updatedEmail = userProfileV1(owner.authUserId, owner.authUserId);

    const array = [user1, emailChange];
    array.slice(1);

    expect(updatedEmail).toMatchObject({
      uId: owner.authUserId,
      email: 'newEmail@gmail.com',
      nameFirst: 'Ada',
      nameLast: 'Bob',
      handleStr: 'adabob',
      token: [expect.any(Number)],
    });
  });
  test('Changing handle', () => {
    clearV1();
    const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
    const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');

    const handleChange = setHandleV1(owner.token, 'newhandlehahaha');
    const updatedHandle = userProfileV1(owner.authUserId, owner.authUserId);

    const array = [user1, handleChange];
    array.slice(1);

    expect(updatedHandle).toMatchObject({
      uId: owner.authUserId,
      email: 'owner@email.com',
      nameFirst: 'Ada',
      nameLast: 'Bob',
      handleStr: 'newhandlehahaha',
      token: [expect.any(Number)],
    });
  });
});

describe('HTTP tests using Jest', () => {
    test('Test successful usersAll', () => {
        clearV1();
        const res = request(
            'GET',
            `${url}:${port}/users/all/v1`,
            {
                qs: {
                    token: expect.any(String),
                }
            }
        );
        
        const bodyObj = JSON.parse(res.body as string);
        expect(res.statusCode).toBe(OK);
        expect(bodyObj).toEqual(expect.any(String));
    });
});