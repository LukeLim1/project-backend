import request from 'sync-request';
import { url, port } from './config.json';
import { createBasicAccount, createBasicAccount2, clear, createBasicAccount3 } from './auth.test';

const OK = 200;

describe('test for dm ', () => {
  let userA: any, userB: any, userC: any;
  let userBMemberOfDMId: number;
  let userBToken: string;
  beforeAll(() => {
    console.log('clear data before all test');
    clear();

    console.log('create owner of dm ');
    // register user A
    const basicA = createBasicAccount();
    userA = JSON.parse(String(basicA.getBody()));

    console.log('create member 1 of dm ');
    // register user B
    const basicB = createBasicAccount2();
    userB = JSON.parse(String(basicB.getBody()));
    userBToken = userB.token[0];

    console.log('create member 2 of dm ');
    // register user c
    const basicC = createBasicAccount3();
    userC = JSON.parse(String(basicC.getBody()));
  });

  test('create dm test success', () => {
    console.log('start do create dm success');

    // create dm
    const token = userA.token[0];
    const uIds: number[] = [userB.authUserId, userC.authUserId];

    const param = JSON.stringify({
      token: token,
      uIds: uIds,
    });
    console.log('request param:%s', param);
    const res = request(
      'POST',
      `${url}:${port}/dm/create/v1`,
      {
        body: param,
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    console.log('response body :%s', bodyObj);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ dmId: expect.any(Number) });

    userBMemberOfDMId = bodyObj.dmId;
  });

  test('create dm test fail', () => {
    console.log('start create dm test fail');

    // create dm
    const token = userA.token[0];
    const uIds: number[] = [userB.authUserId, userC.authUserId, 0];

    const param = JSON.stringify({
      token: token,
      uIds: uIds,
    });
    console.log('request param:%s', param);
    const res = request(
      'POST',
      `${url}:${port}/dm/create/v1`,
      {
        body: param,
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    console.log('response body :%s', bodyObj);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  test('list dm test success', () => {
    console.log('start list dm test success');

    const token = userBToken;

    console.log('request param:{token:%s}', token);
    const res = request(
      'GET',
      `${url}:${port}/dm/list/v1`,
      {
        qs: { token: token }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    console.log('response body :%s', bodyObj);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ dms: expect.any(Object) });
  });

  test('details dm test success', () => {
    console.log('start details dm test success');
    const token = userBToken;
    const dmId = userBMemberOfDMId;

    console.log('request param,{token:%s,dmId:%s}', token, dmId);
    const res = request(
      'GET',
      `${url}:${port}/dm/details/v1`,
      {
        qs: { token: token, dmId: dmId }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    console.log('response body :%s', bodyObj);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ name: expect.any(String), members: expect.any(Object) });
  });

  test('details dm test fail', () => {
    console.log('start details dm test fail');
    const token = userBToken;
    const dmId = -1;

    console.log('request param,{token:%s,dmId:%s}', token, dmId);
    const res = request(
      'GET',
      `${url}:${port}/dm/details/v1`,
      {
        qs: { token: token, dmId: dmId }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    console.log('response body :%s', bodyObj);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  test('leave dm test success', () => {
    console.log('start leave dm test success');
    const token = userC.token[0];
    const param = JSON.stringify({
      token: token,
      dmId: userBMemberOfDMId
    });

    console.log('request param,%s', param);
    const res = request(
      'POST',
      `${url}:${port}/dm/leave/v1`,
      {
        body: param,
        headers: {
          'Content-type': 'application/json',
        },
      }
    );

    const bodyObj = JSON.parse(res.body as string);
    console.log('response body :%s', bodyObj);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({});
  });

  test('leave dm test fail', () => {
    console.log('start leave dm test fail');
    const token = userBToken;
    const param = JSON.stringify({
      token: token,
      dmId: -1
    });

    console.log('request param,%s', param);
    const res = request(
      'POST',
      `${url}:${port}/dm/leave/v1`,
      {
        body: param,
        headers: {
          'Content-type': 'application/json',
        },
      }
    );

    const bodyObj = JSON.parse(res.body as string);
    console.log('response body :%s', bodyObj);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  test('message senddm test success', () => {
    console.log('start message senddm  test success');
    const param = JSON.stringify({
      token: userBToken,
      dmId: userBMemberOfDMId,
      message: 'hello everyone,this is ' + userBMemberOfDMId + 'dm,can you hear me.'
    });

    console.log('request param,%s', param);

    const res = request(
      'POST',
      `${url}:${port}/message/senddm/v1`,
      {
        body: param,
        headers: {
          'Content-type': 'application/json',
        },
      }
    );

    const bodyObj = JSON.parse(res.body as string);
    console.log('response body :%s', bodyObj);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ messageId: expect.any(Number) });
  });

  test('message senddm test fail', () => {
    console.log('start message senddm  test fail');
    const param = JSON.stringify({
      token: userBToken,
      dmId: -1,
      message: 'hello everyone,this is ' + userBMemberOfDMId + 'dm,can you hear me.'
    });

    console.log('request param,%s', param);

    const res = request(
      'POST',
      `${url}:${port}/message/senddm/v1`,
      {
        body: param,
        headers: {
          'Content-type': 'application/json',
        },
      }
    );

    const bodyObj = JSON.parse(res.body as string);
    console.log('response body :%s', bodyObj);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  test('dm messages test success', () => {
    console.log('start dm messages  test success');
    const token = userBToken;
    const dmId = userBMemberOfDMId;
    const start = 0;
    console.log('request param,{token:%s,dmId:%s,start:%s}', token, dmId, start);

    const res = request(
      'GET',
      `${url}:${port}/dm/messages/v1`,
      {
        qs: { token: token, dmId: dmId, start: start }
      }
    );

    const bodyObj = JSON.parse(res.body as string);
    console.log('response body :%s', bodyObj);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ messages: expect.any(Object), start: expect.any(Number), end: expect.any(Number) });
  });

  test('dm messages test fail', () => {
    console.log('start dm messages  test fail');
    const token = userBToken;
    const dmId = -1;
    const start = 999999;
    console.log('request param,{token:%s,dmId:%s,start:%s}', token, dmId, start);

    const res = request(
      'GET',
      `${url}:${port}/dm/messages/v1`,
      {
        qs: { token: token, dmId: dmId, start: start }
      }
    );

    const bodyObj = JSON.parse(res.body as string);
    console.log('response body :%s', bodyObj);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  test('dm remove test fail', () => {
    console.log('start dm remove  test fail');
    const token = userBToken;
    const dmId = -1;
    console.log('request param,{token:%s,dmId:%s}', token, dmId);

    const res = request(
      'DELETE',
      `${url}:${port}/dm/remove/v1`,
      {
        qs: { token: token, dmId: dmId }
      }
    );

    const bodyObj = JSON.parse(res.body as string);
    console.log('response body :%s', bodyObj);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });
  test('dm remove test success', () => {
    console.log('start dm remove  test success');
    const token = userA.token[0];
    const dmId = userBMemberOfDMId;
    console.log('request param,{token:%s,dmId:%s}', token, dmId);

    const res = request(
      'DELETE',
      `${url}:${port}/dm/remove/v1`,
      {
        qs: { token: token, dmId: dmId }
      }
    );

    const bodyObj = JSON.parse(res.body as string);
    console.log('response body :%s', bodyObj);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({});
  });
});

/**
 * test for /dm/create/v1
 * @param token  the ticket of the user
 * @param uIds  member of dm
 */
export function createBasicDm(token: string, uIds: number[]) {
  const res = request(
    'POST',
    `${url}:${port}/dm/create/v1`,
    {
      body: JSON.stringify({
        token: token,
        uIds: uIds,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  return res;
}
