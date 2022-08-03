import request from 'sync-request';
import config from './config.json';
import { newReg, clear, createBasicAccount, resetPassword, requestAuthLogout } from './helperFunctions';

const OK = 200;
const port = config.port;
const url = config.url;

describe('authRegisterV2', () => {
  test('Ensuring a unique number is returned', () => {
    clear();

    const res = newReg('zachary-chan@gmail.com', 'z5312386', 'Zach', 'Chan');
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({
      authUserId: expect.any(Number),
      token: [expect.any(String)]
    });
  });
  test('Length of either nameFirst or nameLast not between 1-50 chars', () => {
    clear();
    const res = newReg('zachary-chan@gmail.com', 'z5312386', '', '');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  test('invalid email', () => {
    clear();
    const res = newReg('57', 'z5312386', 'zachary', 'chan');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });
  test('email already used', () => {
    clear();
    const res = newReg('zachary-chan@gmail.com', 'z5312386', 'zachary', 'chan');
    const res2 = newReg('zachary-chan@gmail.com', 'z5312386', 'zachary', 'chan');

    const bodyObj = JSON.parse(String(res2.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(res2.statusCode).toBe(OK);

    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });
  test('password length < 6', () => {
    clear();

    const res = newReg('zachary-chan@gmail.com', 'z5', 'Zach', 'Chan');
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  describe('authLoginV2', () => {
    test('Ensuring a unique number is returned login', () => {
      clear();
      newReg('zachary-chan@gmail.com', 'z5312386', 'Zach', 'Chan');
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

      const bodyObj = JSON.parse(String(res.getBody()));
      expect(res.statusCode).toBe(OK);
      expect(bodyObj).toMatchObject({
        token: [expect.any(String), expect.any(String)]
      });
    });

    test('Returns error when email is invalid', () => {
      clear();
      newReg('zachary-chan@gmail.com', 'z5312386', 'Zach', 'Chan');
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

  test('incorrect password', () => {
    clear();
    newReg('zachary-chan@gmail.com', 'z5312386', 'Zach', 'Chan');
    const res = request(
      'POST',
    `${url}:${port}/auth/login/v2`,
    {
      body: JSON.stringify({
        email: 'zachary-chan@gmail.com',
        password: 'z531',
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

  describe('authLogout', () => {
    test('Testing successful authLogout', () => {
      clear();
      const basicA = createBasicAccount();
      const newUser = JSON.parse(String(basicA.getBody()));

      const res = requestAuthLogout(newUser.token);

      const bodyObj = JSON.parse(String(res.getBody()));
      expect(res.statusCode).toBe(OK);
      expect(bodyObj).toMatchObject({});
    });
  });
});

describe('request password reset', () => {
  test('Testing successful password email sent', () => {
    clear();
    const basicA = newReg('zachary@gmail.com', 'zac123456', 'zach', 'chan');
    const newUser = JSON.parse(String(basicA.getBody()));

    const res = request(
      'POST',
    `${url}:${port}/auth/passwordreset/request/v1`,
    {
      body: JSON.stringify({
        email: 'zachary@gmail.com'
      }),
      headers: {
        'Content-type': 'application/json',
        token: newUser.token[0],
      },
    }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({});
  });
});

describe('request password reset', () => {
  let newUser, newUserBody, passReq, passReqObject;
  beforeEach(() => {
    clear();
    newUser = newReg('zachary@gmail.com', 'zac123456', 'zach', 'chan');
    newUserBody = JSON.parse(String(newUser.getBody()));

    passReq = request(
      'POST',
    `${url}:${port}/auth/passwordreset/request/v1`,
    {
      body: JSON.stringify({
        email: 'zachary@gmail.com'
      }),
      headers: {
        'Content-type': 'application/json',
        token: newUserBody.token[0],
      },
    }
    );

    passReqObject = JSON.parse(String(passReq.getBody()));
    expect(passReq.statusCode).toBe(OK);
    expect(passReqObject).toMatchObject({});
  });

  test('resetCode is not a valid reset code', () => {
    expect(resetPassword('dd31', 'newPassword')).toHaveProperty('statusCode', 400);
  });
  test('password is less than 6 chars', () => {
    expect(resetPassword('dd31t', '')).toHaveProperty('statusCode', 400);
  });
});
