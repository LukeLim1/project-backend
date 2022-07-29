import request from 'sync-request';
import { url, port } from './config.json';
import { createBasicAccount, createBasicAccount2, clear, createBasicDm, newReg } from './helperFunctions';
const OK = 200;

/*
function dmMessages (token: string, dmId: number, start: number) {
  return requestHelper('GET', 'dm/messages/v1', { token, dmId, start });
}

function messageSenddm (token: string, dmId: number, message: string) {
  return requestHelper('POST', 'message/senddm/v1', { token, dmId, message });
}
*/

beforeEach(() => {
  clear();
});
describe('HTTP tests for dm/create/v1', () => {
  test('valid creation of dm', () => {
    const create1 = newReg('zachary@gmail.com', '123455gf', 'zachary', 'chan');
    const newUser = JSON.parse(String(create1.getBody()));
    // call the dm function
    const res = createBasicDm(newUser.token[0], [newUser.authUserId]);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ dmId: expect.any(Number) });
  });

  test('uid doesnt refer to a valid user', () => {
    const create1 = newReg('zachary@gmail.com', '123455gf', 'zachary', 'chan');
    const newUser = JSON.parse(String(create1.getBody()));
    // call the dm function
    const res = createBasicDm(newUser.token[0], [9999]);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });
  test('uid duplicates in arguement', () => {
    const create1 = newReg('zachary@gmail.com', '123455gf', 'zachary', 'chan');
    const newUser = JSON.parse(String(create1.getBody()));
    // call the dm function
    const res = createBasicDm(newUser.token[0], [newUser.authUserId, newUser.authUserId]);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });
});

describe('HTTP tests using Jest', () => {
  test('Testing successful dmLeave', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token[0], [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const res = request(
      'POST',
      `${url}:${port}/dm/leave/v1`,
      {
        body: JSON.stringify({
          token: newUser.token[0],
          channelId: newDm.dmId,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({});
  });

  test('dmLeave: dmId does not refer to valid DM', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token[0], [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const res = request(
      'POST',
      `${url}:${port}/dm/leave/v1`,
      {
        body: JSON.stringify({
          token: newUser.token[0],
          channelId: newDm.dmId + 5,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: 'error' });
  });

  test('dmLeave: dmId valid, but user is not a member of DM', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token[0], [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const res = request(
      'POST',
      `${url}:${port}/dm/leave/v1`,
      {
        body: JSON.stringify({
          token: newUser.token[0].concat('abc'),
          channelId: newDm.dmId,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: 'error' });
  });

  test('Testing successful dmMessages', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token, [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));
    request(
      'POST',
      `${url}:${port}/message/senddm/v1`,
      {
        body: JSON.stringify({
          token: newUser.token,
          dmId: newDm.dmId,
          message: 'Hi',
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );

    const res = request(
      'GET',
      `${url}:${port}/dm/messages/v1`,
      {
        qs: {
          token: newUser.token,
          dmId: newDm.dmId,
          start: 0,
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({
      messages: [{
        messageId: expect.any(Number),
        uId: expect.any(Number),
        message: 'Hi',
        timeSent: expect.any(Number),
      }],
      start: 0,
      end: -1,
    });
  });

  test('dmMessages: dmId does not refer to valid DM', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token, [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const res = request(
      'GET',
      `${url}:${port}/dm/messages/v1`,
      {
        qs: {
          token: newUser.token,
          dmId: newDm.dmId + 5,
          start: 0,
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: 'error' });
  });

  test('dmMessages: start greater than total messages in channel', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token, [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const res = request(
      'GET',
      `${url}:${port}/dm/messages/v1`,
      {
        qs: {
          token: newUser.token,
          dmId: newDm.dmId,
          start: 50,
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: 'error' });
  });

  test('dmMessages: dmId valid, authorised user is not a member of DM', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token, [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    const res = request(
      'GET',
      `${url}:${port}/dm/messages/v1`,
      {
        qs: {
          token: newUser2.token,
          dmId: newDm.dmId,
          start: 0,
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: 'error' });
  });
});

describe('test for dm ', () => {
  let userA: any, userB: any;
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

    // console.log('create member 2 of dm ');
    // // register user c
    // const basicC = createBasicAccount3();
    // userC = JSON.parse(String(basicC.getBody()));
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
