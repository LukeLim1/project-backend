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

function authLogout (token: string) {
  return requestHelper('POST', 'auth/logout/v1', { token });
}

function clear () {
  return requestHelper('DELETE', 'clear/v1', {});
}

beforeEach(() => {
  clear();
});

describe('HTTP tests using Jest', () => {
  test('Test successful authLogout', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const res = authLogout(newUser.token);

    expect(newUser.token.length).toEqual(1);
    expect(res).toStrictEqual({});
  });
});
