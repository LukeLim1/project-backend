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

function usersAll (token: string) {
  return requestHelper('GET', 'users/all/v1', { token });
}

function clear () {
  return requestHelper('DELETE', 'clear/v1', {});
}

beforeEach(() => {
  clear();
});

describe('HTTP tests using Jest', () => {
  test('Test successful usersAll', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newUser2 = authRegister('oceanhall@email.com', '234567', 'Ocean', 'Hall');
    const res = usersAll(newUser.token);

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
