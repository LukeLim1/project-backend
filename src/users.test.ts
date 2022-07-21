import request from 'sync-request';
import { url, port } from './config.json';
import { createBasicAccount, createBasicAccount2, clear } from './auth.test';

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
describe('update: name, email and handle', () => {
  test('Changing name', () => {
    clear();
    // owner
    createBasicAccount();
    // user1
    createBasicAccount2();
    const res = request(
      'PUT',
      `${url}:${port}/user/profile/setname/v1`,
      {
        body: JSON.stringify({
          token: '1',
          nameFirst: 'tiktok',
          nameLast: 'onTheClock'
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
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

  test('Changing email', () => {
    clear();
    // owner
    createBasicAccount();
    // user1
    createBasicAccount2();
    const res = request(
      'PUT',
      `${url}:${port}/user/profile/setemail/v1`,
      {
        body: JSON.stringify({
          token: '1',
          email: 'newemail@gmail.com',
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
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

  test('Changing handle', () => {
    clear();
    // owner
    createBasicAccount();
    // user1
    createBasicAccount2();
    const res = request(
      'PUT',
        `${url}:${port}/user/profile/sethandle/v1`,
        {
          body: JSON.stringify({
            token: '2',
            handle: 'newhandle',
          }),
          headers: {
            'Content-type': 'application/json',
          },
        }
    );
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
        nameFirst: 'Zachary',
        nameLast: 'Chan',
        handleStr: 'zacharychan',
      },
      {
        uId: 2,
        email: 'zachary-chan2@gmail.com',
        nameFirst: 'Zachary2',
        nameLast: 'Chan2',
        handleStr: 'newhandle',
      }]
    });
  });
});
