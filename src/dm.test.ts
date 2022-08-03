import request from 'sync-request';
import { url, port } from './config.json';
import { createBasicAccount, createBasicAccount2, clear, createBasicDm, newReg, requestDmLeave, requestDmMessages, requestDmDetails, requestSendDm } from './helperFunctions';

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
    const res = createBasicDm(newUser.token, [newUser.authUserId]);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ dmId: expect.any(Number) });
  });

  test('uid doesnt refer to a valid user', () => {
    const create1 = newReg('zachary@gmail.com', '123455gf', 'zachary', 'chan');
    const newUser = JSON.parse(String(create1.getBody()));
    // call the dm function
    const res = createBasicDm(newUser.token, [9999]);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });
  test('uid duplicates in arguement', () => {
    const create1 = newReg('zachary@gmail.com', '123455gf', 'zachary', 'chan');
    const newUser = JSON.parse(String(create1.getBody()));
    // call the dm function
    const res = createBasicDm(newUser.token, [newUser.authUserId, newUser.authUserId]);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });
});

describe('HTTP tests using Jest', () => {
  test('Testing successful dmLeave', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token, [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const resBeforeDmLeave = requestDmDetails(newUser.token, newDm.dmId);
    const res = requestDmLeave(newUser.token, newDm.dmId);
    const resAfterDmLeave = requestDmDetails(newUser.token, newDm.dmId);

    const bodyObj = JSON.parse(String(res.getBody()));
    const bodyObj2 = JSON.parse(String(resBeforeDmLeave.getBody()));
    const bodyObj3 = JSON.parse(String(resAfterDmLeave.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({});
    expect(bodyObj2).toMatchObject({
      name: 'zacharychan',
      members: [
        {
          uId: 1,
          email: 'zachary-chan@gmail.com',
          nameFirst: 'Zachary',
          nameLast: 'Chan',
          handleStr: 'zacharychan'
        }
      ]
    });
    expect(bodyObj3).toMatchObject({ error: 'error is not member of the dm' });
  });

  test('dmLeave: dmId does not refer to valid DM', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token, [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const res = requestDmLeave(newUser.token, newDm.dmId + 5);

    expect(res.statusCode).toBe(400);
  });

  test('dmLeave: dmId valid, but user is not a member of DM', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicA2 = createBasicAccount();
    const newUser2 = JSON.parse(String(basicA2.getBody()));
    const basicD = createBasicDm(newUser.token[0], [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const res = requestDmLeave(newUser2.token, newDm.dmId);

    expect(res.statusCode).toBe(403);
  });

  test('Testing successful single dmMessages', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token, [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));
    requestSendDm(newUser.token, newDm.dmId, 'Hi');

    const res = requestDmMessages(newUser.token, newDm.dmId, 0);

    const bodyObj = JSON.parse(res.body as string);
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

  test('dmMessages: under 50 messages', () => {
    const newUser = JSON.parse(String(createBasicAccount().getBody()));
    const newUser2 = JSON.parse(String(createBasicAccount2().getBody()));
    const basicD = createBasicDm(newUser.token, [newUser.authUserId, newUser2.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));
    for (let i = 0; i < 12; i++) {
      requestSendDm(newUser.token, newDm.dmId, 'Hi');
      requestSendDm(newUser2.token, newDm.dmId, 'Hey there');
    }
    
    const res = requestDmMessages(newUser.token, newDm.dmId, 3);
    expect(res.statusCode).toBe(OK);
    const bodyObj = JSON.parse(res.body as string);
    expect(bodyObj.messages.length).toBe(21);
    expect(bodyObj.end).toBe(-1);
    expect(bodyObj.messages[9]).toMatchObject({
      messageId: expect.any(Number),
      uId: expect.any(Number),
      message: 'Hi',
      timeSent: expect.any(Number),
    });
  })

  test('dmMessages: over 50 messages', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token, [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));
    for (let i = 0; i < 60; i++) {
      requestSendDm(newUser.token, newDm.dmId, 'Hi');
    }
    const res = requestDmMessages(newUser.token, newDm.dmId, 5);
    expect(res.statusCode).toBe(OK);
    const bodyObj = JSON.parse(res.body as string);
    expect(bodyObj.messages.length).toBe(50);
    expect(bodyObj.end).toBe(55);
    expect(bodyObj.messages[42]).toMatchObject({
      messageId: expect.any(Number),
      uId: expect.any(Number),
      message: 'Hi',
      timeSent: expect.any(Number),
    });
  })

  test('dmMessages: fetching multiple times', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token, [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));
    for (let i = 0; i < 130; i++) {
      requestSendDm(newUser.token, newDm.dmId, 'Hi');
    }

    const res = requestDmMessages(newUser.token, newDm.dmId, 5);
    const res2 = requestDmMessages(newUser.token, newDm.dmId, 55);

    expect(res.statusCode).toBe(OK);
    expect(res2.statusCode).toBe(OK);

    const bodyObj = JSON.parse(res.body as string);
    const bodyObj2 = JSON.parse(res2.body as string);

    expect(bodyObj.messages.length).toBe(50);
    expect(bodyObj.end).toBe(55);
    expect(bodyObj2.messages.length).toBe(50);
    expect(bodyObj2.end).toBe(105);

    expect(bodyObj2.messages[42]).toMatchObject({
      messageId: expect.any(Number),
      uId: expect.any(Number),
      message: 'Hi',
      timeSent: expect.any(Number),
    });
  })

  test('dmMessages: dmId does not refer to valid DM', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token, [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const res = requestDmMessages(newUser.token, newDm.dmId + 5, 0);
    expect(res.statusCode).toBe(400);
  });

  test('dmMessages: start greater than total messages in channel', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token, [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const res = requestDmMessages(newUser.token, newDm.dmId, 50);
    expect(res.statusCode).toBe(400);
  });

  test('dmMessages: dmId valid, authorised user is not a member of DM', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token, [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    const res = requestDmMessages(newUser2.token, newDm.dmId, 0);
    expect(res.statusCode).toBe(403);
  });
});

describe('test for dm ', () => {
  let userA: any, userB: any;
  let userBMemberOfDMId: number;
  let userBToken: string;
  beforeAll(() => {
    clear();

    // register user A
    const basicA = createBasicAccount();
    userA = JSON.parse(String(basicA.getBody()));

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
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token, [newUser.authUserId]);
    JSON.parse(String(basicD.getBody()));

    const res = request(
      'GET',
      `${url}:${port}/dm/list/v1`,
      {
        qs: { token: newUser.token }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ dms: expect.any(Object) });
  });

  test('details dm test success', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));
    const basicD = createBasicDm(newUser.token, [newUser.authUserId, newUser2.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const res = request(
      'GET',
      `${url}:${port}/dm/details/v1`,
      {
        qs: { token: newUser.token, dmId: newDm.dmId }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    console.log(bodyObj);
    expect(bodyObj).toMatchObject({ name: expect.any(String), members: expect.any(Object) });
  });

  test('details dm test fail', () => {
    const token = userBToken;
    const dmId = -1;

    const res = request(
      'GET',
      `${url}:${port}/dm/details/v1`,
      {
        qs: { token: token, dmId: dmId }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  test('message senddm test success', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicD = createBasicDm(newUser.token, [newUser.authUserId]);
    const newDm = JSON.parse(String(basicD.getBody()));

    const param = JSON.stringify({
      token: newUser.token,
      dmId: newDm.dmId,
      message: 'hello everyone,this is ' + userBMemberOfDMId + 'dm,can you hear me.'
    });

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
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ messageId: expect.any(Number) });
  });

  test('message senddm test fail', () => {
    const param = JSON.stringify({
      token: userBToken,
      dmId: -1,
      message: 'hello everyone,this is ' + userBMemberOfDMId + 'dm,can you hear me.'
    });

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
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  test('dm remove test fail', () => {
    const token = userBToken;
    const dmId = -1;

    const res = request(
      'DELETE',
      `${url}:${port}/dm/remove/v1`,
      {
        qs: { token: token, dmId: dmId }
      }
    );

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });
  test('dm remove test success', () => {
    const token = userA.token[0];
    const dmId = userBMemberOfDMId;

    const res = request(
      'DELETE',
      `${url}:${port}/dm/remove/v1`,
      {
        qs: { token: token, dmId: dmId }
      }
    );

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({});
  });
});
