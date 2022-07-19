import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

export function clear() {
  const res = request(
    'DELETE',
    `${url}:${port}/clear/v1`
  );
  const array = [res];
  array.slice(0);
}
export function createBasicAccount() {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v2`,
    {
      body: JSON.stringify({
        email: 'zachary-chan@gmail.com',
        password: 'z5312386',
        nameFirst: 'Zachary',
        nameLast: 'Chan'
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  return res;
}

describe('authRegisterV2', () => {
  test('Ensuring a unique number is returned', () => {
    clear();

    const res = createBasicAccount();
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({
      authUserId: expect.any(Number),
      token: expect.any(String)
    });
  });
  test('Error case', () => {
    clear();
    const res = request(
      'POST',
      `${url}:${port}/auth/register/v2`,
      {
        body: JSON.stringify({
          email: 'zachary-chan@gmail.com',
          password: 'z5312386',
          nameFirst: '',
          nameLast: ''
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });
});

describe('authLoginV2', () => {
  test('Ensuring a unique number is returned login', () => {
    clear();
    createBasicAccount();
    const res = request(
      'POST',
      `${url}:${port}/auth/login/v2`,
      {
        body: JSON.stringify({
          email: 'zachary-chan@gmail.com',
          password: 'z5312386',
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const expectedNum = [1, 2];
    const expectedStr = expectedNum.map(num => {
      return String(num);
    });
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({
      token: expectedStr
    });
  });

  test('Returns error when email is invalid', () => {
    clear();
    createBasicAccount();
    const res = request(
      'POST',
      `${url}:${port}/auth/login/v2`,
      {
        body: JSON.stringify({
          email: 'broken@gmail.com',
          password: 'z5312386',
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });
});
