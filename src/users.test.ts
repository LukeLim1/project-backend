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

function usersAll (token: string) {
  return requestHelper('GET', 'users/all/v1', { token });
}

beforeEach(() => {
  clear();
});

describe('HTTP tests using Jest', () => {
  test('Test successful usersAll', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    const res = request(
      'GET',
      `${url}:${port}/users/all/v1`,
      {
        qs: {
          token: newUser.token[0],
        },
      }
    );

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
