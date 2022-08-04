import request from 'sync-request';
import { url, port } from './config.json';
import { createBasicAccount, createBasicAccount2, clear, createBasicDm, newReg, requestDmLeave, requestDmMessages, requestDmDetails, requestSendDm } from './helperFunctions';

const OK = 200;
const error400 = 400;
const error403 = 403;

/*
function dmMessages (token: string, dmId: number, start: number) {
  return requestHelper('GET', 'dm/messages/v1', { token, dmId, start });
}

function messageSenddm (token: string, dmId: number, message: string) {
  return requestHelper('POST', 'message/senddm/v1', { token, dmId, message });
}
*/

describe('HTTP tests for dm/create/v1', () => {
  beforeEach(() => {
    clear();
  });

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
  beforeEach(() => {
    clear();
  });

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

    expect(res.statusCode).toBe(OK);
    expect(resAfterDmLeave.statusCode).toBe(403);
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
    const newUser = JSON.parse(String(createBasicAccount().getBody()));
    const newUser2 = JSON.parse(String(createBasicAccount2().getBody()));
    const basicD = createBasicDm(newUser.token, [newUser.authUserId]);
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
  });

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
  });

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
  });

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

describe('test for dm list/details/senddm/remove', () => {
  let userA: any, userB: any, userC: any;
  let userBMemberOfDMId: number;
  let userBToken: string;
  beforeAll(() => {
    clear();

    // register user A
    const basicA = newReg('zachary-chan1@gmail.com', 'z5312386', 'zachary1', 'chan1');
    userA = JSON.parse(String(basicA.getBody()));

    // register user B
    const basicB = newReg('zachary-chan2@gmail.com', 'z5312386', 'zachary2', 'chan2');
    userB = JSON.parse(String(basicB.getBody()));
    userBToken = userB.token;

    // register user c
    const basicC = newReg('zachary-chan3@gmail.com', 'z5312386', 'zachary3', 'chan');
    userC = JSON.parse(String(basicC.getBody()));

    // create dm
    const dm = createBasicDm(userA.token, [userA.authUserId, userB.authUserId]);
    userBMemberOfDMId = JSON.parse(String(dm.getBody())).dmId;
  });

  test('list dm test success', () => {
    const res = request(
      'GET',
      `${url}:${port}/dm/list/v2`,
      {
        headers: { token: userBToken },
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(bodyObj).toMatchObject({ dms: expect.any(Object) });
  });

  test('list dm test fail 403, error token', () => {
    const res = request(
      'GET',
      `${url}:${port}/dm/list/v2`,
      {
        headers: {
          token: '-1'
        }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(error403);
    expect(bodyObj).toMatchObject({ error: { message: 'user not found' } });
  });

  test('details dm test success', () => {
    const res = request(
      'GET',
      `${url}:${port}/dm/details/v2`,
      {
        headers: { token: userBToken },
        qs: { dmId: userBMemberOfDMId }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ name: expect.any(String), members: expect.any(Object) });
  });

  test('details dm test fail 403,dmId is valid and the authorised user is not a member of the DM'
    , () => {
      const res = request(
        'GET',
        `${url}:${port}/dm/details/v2`,
        {
          headers: { token: userC.token },
          qs: { dmId: userBMemberOfDMId }
        }
      );
      const bodyObj = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(error403);
      expect(bodyObj).toMatchObject({ error: { message: 'user is not member of the dm' } });
    });

  test('details dm test fail 400 ,dmId does not refer to a valid DM', () => {
    const res = request(
      'GET',
      `${url}:${port}/dm/details/v2`,
      {
        headers: { token: userBToken },
        qs: { dmId: -1 }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(error400);
    expect(bodyObj).toMatchObject({ error: { message: 'dm not exit' } });
  });

  test('message senddm test success', () => {
    const param = JSON.stringify({
      dmId: userBMemberOfDMId,
      message: 'hello everyone,this is ' + userBMemberOfDMId + 'dm,can you hear me.'
    });

    const res = request(
      'POST',
      `${url}:${port}/message/senddm/v2`,
      {
        body: param,
        headers: {
          'Content-type': 'application/json',
          token: userBToken
        },
      }
    );

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ messageId: expect.any(Number) });
  });

  test('message senddm test fail 400,dmId does not refer to a valid DM', () => {
    const param = JSON.stringify({
      dmId: -1,
      message: 'hello everyone,this is ' + userBMemberOfDMId + 'dm,can you hear me.'
    });

    const res = request(
      'POST',
      `${url}:${port}/message/senddm/v2`,
      {
        body: param,
        headers: {
          'Content-type': 'application/json',
          token: userBToken
        },
      }
    );

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(error400);
    expect(bodyObj).toMatchObject({ error: { message: 'dm not exit' } });
  });

  test('message senddm test fail 400,length of message is less than 1 or over 1000 characters', () => {
    const param = JSON.stringify({
      dmId: userBMemberOfDMId,
      message: ''
    });

    const res = request(
      'POST',
      `${url}:${port}/message/senddm/v2`,
      {
        body: param,
        headers: {
          'Content-type': 'application/json',
          token: userBToken
        },
      }
    );

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(error400);
    expect(bodyObj).toMatchObject({ error: { message: 'length of message is error' } });
  });

  test('message senddm test fail 403,dmId is valid and the authorised user is not a member of the DM'
    , () => {
      const param = JSON.stringify({
        dmId: userBMemberOfDMId,
        message: 'hello everyone,this is ' + userBMemberOfDMId + 'dm,can you hear me.'
      });

      const res = request(
        'POST',
        `${url}:${port}/message/senddm/v2`,
        {
          body: param,
          headers: {
            'Content-type': 'application/json',
            token: userC.token
          },
        }
      );

      const bodyObj = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(error403);
      expect(bodyObj).toMatchObject({ error: { message: 'user is not member' } });
    });

  test('dm remove test fail 400,dmId does not refer to a valid DM', () => {
    const token = userBToken;
    const dmId = -1;

    const res = request(
      'DELETE',
      `${url}:${port}/dm/remove/v2`,
      {
        qs: { dmId: dmId },
        headers: { token: token },
      }
    );

    expect(res.statusCode).toBe(error400);
  });

  test('dm remove test fail 403,dmId is valid and the authorised user is not the original DM creator', () => {
    const token = userC.token;
    const dmId = userBMemberOfDMId;

    const res = request(
      'DELETE',
      `${url}:${port}/dm/remove/v2`,
      {
        qs: { dmId: dmId },
        headers: { token: token },
      }
    );

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(error403);
    expect(bodyObj).toMatchObject({ error: { message: 'you are not the dm owner' } });
  });

  test('dm remove test fail 403,dmId is valid and the authorised user is no longer in the DM', () => {
    const token = userC.token;
    const dmId = userBMemberOfDMId;

    const res = request(
      'DELETE',
      `${url}:${port}/dm/remove/v2`,
      {
        qs: { dmId: dmId },
        headers: { token: token },
      }
    );

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(error403);
    expect(bodyObj).toMatchObject({ error: { message: 'you are not the dm owner' } });
  });

  test('dm remove test success', () => {
    const token = userA.token;
    const dmId = userBMemberOfDMId;

    const res = request(
      'DELETE',
      `${url}:${port}/dm/remove/v2`,
      {
        qs: { dmId: dmId },
        headers: { token: token },
      }
    );

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({});
  });
});
