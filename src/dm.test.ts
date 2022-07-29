import request from 'sync-request';
import { url, port } from './config.json';
import { createBasicAccount, createBasicAccount2, clear, createBasicDm, newReg } from './helperFunctions';
// import { createBasicChannel } from './channels.test';

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

  // test('Testing successful dmMessages', () => {

  //   const user1 = newReg('zach@gmail.com', '123456', 'zach', 'chan');
  //   const user1Body = JSON.parse(String(user1.getBody()));
  //   expect(user1Body).toMatchObject({ token: expect.any(String), authUserId: expect.any(Number) });

  //   // new channel
  //   const chan1 = createBasicChannel(user1Body.token[0], 'Channel 1', true);
  //   const chan1Body = JSON.parse(String(chan1.getBody()));
  //   expect(chan1Body).toMatchObject({ channelId: expect.any(Number) });

  //   // new dm
  //   const dm1 = createBasicDm(user1Body.token[0], [user1Body.authUserId]);
  //   const dm1Body = JSON.parse(String(dm1.getBody()));
  //   console.log(dm1Body)
  //   expect(dm1Body).toMatchObject({ dmId: expect.any(Number) });

  //   // send message to channel
  //   const send1 = sendMessage(user1Body.token[0], chan1Body.channelId, 'chan1 message');
  //   const send1Body = JSON.parse(String(send1.getBody()));
  //   expect(send1Body).toMatchObject({ messageId: expect.any(Number) });
  //   expect(send1.statusCode).toBe(OK);
  //   console.log(user1Body)
  //   // send message to dm
  //   const dmMessage1 = dmSend(user1Body.token[0], dm1Body.dmId, 'DM 1 message 1 ahaha');
  //   const dmMessage1Body = JSON.parse(String(dmMessage1.getBody()));

  //   const res = request(
  //         'GET',
  //         `${url}:${port}/dm/messages/v1`,
  //         {
  //           qs: {
  //             token: user1Body.token[0],
  //             dmId: dm1Body.dmId,
  //             start: 0,
  //           },
  //         }
  //       );
  //       const bodyObj = JSON.parse(String(res.getBody()));
  //       expect(res.statusCode).toBe(OK);
  //       expect(bodyObj).toMatchObject({
  //             messages: [{
  //               messageId: expect.any(Number),
  //               uId: expect.any(Number),
  //               message: 'Hi',
  //               timeSent: expect.any(Number),
  //             }],
  //             start: 0,
  //             end: -1,
  //           });
  // })

  // console.log(dmMessage1Body)
  //     expect(dmMessage1Body).toMatchObject({ dmId: expect.any(Number) });
  /// /////////////////////////////////////////////////////////////////////////////////////////////////////////
  // above is zachs attempt below is lukes old test
  /// ////////////////////////////////////////////////////////////////////////////////////////////////////////
  //   const basicA = createBasicAccount();
  //   const newUser = JSON.parse(String(basicA.getBody()));
  //   const basicD = createBasicDm(newUser.token[0], [newUser.authUserId]);
  //   const newDm = JSON.parse(String(basicD.getBody()));
  //   request(
  //     'POST',
  //     `${url}:${port}/message/senddm/v1`,
  //     {
  //       body: JSON.stringify({
  //         token: newUser.token[0],
  //         dmId: newDm.dmId,
  //         message: 'Hi',
  //       }),
  //       headers: {
  //         'Content-type': 'application/json',
  //       },
  //     }
  //   );

  //   const res = request(
  //     'GET',
  //     `${url}:${port}/dm/messages/v1`,
  //     {
  //       qs: {
  //         token: newUser.token[0],
  //         dmId: newDm.dmId,
  //         start: 0,
  //       },
  //     }
  //   );

  //   const bodyObj = JSON.parse(String(res.getBody()));
  //   expect(res.statusCode).toBe(OK);
  //   expect(bodyObj).toMatchObject({
  //     messages: [{
  //       messageId: expect.any(Number),
  //       uId: expect.any(Number),
  //       message: 'Hi',
  //       timeSent: expect.any(Number),
  //     }],
  //     start: 0,
  //     end: -1,
  //   });
  // });

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
