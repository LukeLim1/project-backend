import request from 'sync-request';
import { url, port } from './config.json';
import { createBasicAccount, createBasicAccount2, clear, changeName, changeEmail, newReg, changeHandle } from './helperFunctions';

export { userProfileV1, setNameV1, setEmailV1, setHandleV1, usersAll } from './users';

const OK = 200;

beforeEach(() => {
  clear();
});

function getallUsers() {
  const res = request(
    'GET',
    `${url}:${port}/users/all/v1`,
    {
      qs: {
        token: '1',
      },
    }
  );
  return res;
}

describe('HTTP tests using Jest', () => {
  test('Test successful usersAll', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    const res = getallUsers();

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({
      users: [{
        uId: newUser.authUserId,
        email: 'zachary-chan@gmail.com',
        nameFirst: 'Zachary',
        nameLast: 'Chan',
        handleStr: 'zacharychan',
      },
      {
        uId: newUser2.authUserId,
        email: 'zachary-chan2@gmail.com',
        nameFirst: 'Zachary2',
        nameLast: 'Chan2',
        handleStr: 'zachary2chan2',
      }]
    });
  });
});

// zachs tests for setname, setemail and sethandle
describe('update name', () => {
  test('Changing name', () => {
    // owner
    const basic = createBasicAccount();
    const newUser = JSON.parse(String(basic.getBody()));
    // user2
    createBasicAccount2();
    // calling the setname route
    const res = changeName(newUser.token[0], 'tiktok', 'onTheClock');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({});
    const res2 = getallUsers();

    const userBody = JSON.parse(String(res2.getBody()));
    expect(res2.statusCode).toBe(OK);
    expect(userBody).toStrictEqual({
      users: [{
        uId: 1,
        email: 'zachary-chan@gmail.com',
        nameFirst: 'tiktok',
        nameLast: 'onTheClock',
        handleStr: 'zacharychan',
      },
      {
        uId: 2,
        email: 'zachary-chan2@gmail.com',
        nameFirst: 'Zachary2',
        nameLast: 'Chan2',
        handleStr: 'zachary2chan2',
      }]
    });
  });

  test('Either nameFirst or nameLast is not between 1-50 chars', () => {
    const basic = createBasicAccount();
    const newUser = JSON.parse(String(basic.getBody()));
    // user2
    createBasicAccount2();
    // calling the setname route with bad nameFirst
    const res = changeName(newUser.token[0], '', 'zachary');

    const bodyObj = JSON.parse(String(res.getBody()));

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
    // calling the setname route with bad nameLast
    const res2 = changeName(newUser.token[0], 'zachary', '');
    const bodyObj2 = JSON.parse(String(res.getBody()));
    expect(res2.statusCode).toBe(OK);
    expect(bodyObj2).toMatchObject({ error: expect.any(String) });
  });
});

describe('SetEmail http route tests', () => {
  test('Changing email valid', () => {
    // owner
    const basic = createBasicAccount();
    const newUser = JSON.parse(String(basic.getBody()));
    // user1
    createBasicAccount2();
    const res = changeEmail(newUser.token[0], 'newemail@gmail.com');
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({});
    const res2 = getallUsers();

    const userBody = JSON.parse(String(res2.getBody()));
    expect(res2.statusCode).toBe(OK);
    expect(userBody).toStrictEqual({
      users: [{
        uId: 1,
        email: 'newemail@gmail.com',
        nameFirst: 'Zachary',
        nameLast: 'Chan',
        handleStr: 'zacharychan',
      },
      {
        uId: 2,
        email: 'zachary-chan2@gmail.com',
        nameFirst: 'Zachary2',
        nameLast: 'Chan2',
        handleStr: 'zachary2chan2',
      }]
    });
  });
  test('Invalid Email', () => {
    // owner
    const basic = createBasicAccount();
    const newUser = JSON.parse(String(basic.getBody()));
    // user1
    createBasicAccount2();
    const res = changeEmail(newUser.token[0], 'newemail');
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });
  test('email already being used', () => {
    // owner
    const basic = newReg('zachary@gmail.com', 'password', 'zach', 'chan');
    const newUser = JSON.parse(String(basic.getBody()));
    // user1
    newReg('zachary1234@gmail.com', 'password', 'aaazach', 'aaachan');
    const res = changeEmail(newUser.token[0], 'zachary1234@gmail.com');
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });
});

describe('setHandle http route tests', () => {
  test('Changing handle', () => {
    clear();
    const basic = newReg('zachary@gmail.com', 'password', 'Zachary', 'Chan');
    const newUser = JSON.parse(String(basic.getBody()));
    // user1
    newReg('zachary1234@gmail.com', 'password', 'aaazach', 'aaachan');
    const res = changeHandle(newUser.token[0], 'newhandle');
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({});
    const res2 = getallUsers();

    const userBody = JSON.parse(String(res2.getBody()));
    expect(res2.statusCode).toBe(OK);
    expect(userBody).toStrictEqual({
      users: [{
        uId: 1,
        email: 'zachary@gmail.com',
        nameFirst: 'Zachary',
        nameLast: 'Chan',
        handleStr: 'zacharychan',
      },
      {
        uId: 2,
        email: 'zachary1234@gmail.com',
        nameFirst: 'aaazach',
        nameLast: 'aaachan',
        handleStr: 'newhandle',
      }]
    });
  });
});
