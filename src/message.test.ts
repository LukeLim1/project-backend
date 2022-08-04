// import { createBasicAccount, createBasicDm, dmSend, newReg, requestSendDm, sendMessage, shareMessage } from './helperFunctions';
// import { createBasicChannel } from './channels.test';
// import { Response } from 'sync-request';

test('placeholder', () => {
  expect(1).toBe(1);
});

/*
const OK = 200;
describe('messageShareV1', () => {
  let user1: Response, user1Body: { token: string; authUserId: number; },
    chan1: Response, chan1Body: { channelId: number; }, dm1: Response,
    dm1Body: {
    dmId: number
},
    dmMessage1: Response, dmMessage1Body: { messageId: number; };
  beforeEach(() => {
    // new reg
    user1 = newReg('zach@gmail.com', '123456', 'zach', 'chan');
    user1Body = JSON.parse(String(user1.getBody()));
    expect(user1Body).toMatchObject({ token: expect.any(String), authUserId: expect.any(Number) });

    // new channel
    chan1 = createBasicChannel(user1Body.token, 'Channel 1', true);
    chan1Body = JSON.parse(String(chan1.getBody()));
    expect(chan1Body).toMatchObject({ channelId: expect.any(Number) });

    // new dm
    dm1 = createBasicDm(user1Body.token, [user1Body.authUserId]);
    dm1Body = JSON.parse(String(dm1.getBody()));
    expect(dm1Body).toMatchObject({ dmId: expect.any(Number) });

    // send message to channel
    // send1 = sendMessage(user1Body.token, chan1Body.channelId, 'chan1 message');
    // send1Body = JSON.parse(String(send1.getBody()));
    // expect(send1Body).toMatchObject({ messageId: expect.any(Number) });
    // expect(send1.statusCode).toBe(OK);

    // send message to dm
    dmMessage1 = requestSendDm(user1Body.token, dm1Body.dmId, 'DM 1 message 1 ahaha');
    dmMessage1Body = JSON.parse(String(dmMessage1.getBody()));
    expect(dmMessage1Body).toMatchObject({ messageId: expect.any(Number) });
  });
  test('Testing successful messageShare 200 status code', () => {
    dmSend(user1Body.token, dm1Body.dmId, 'DM 1 message 2 beheheh');
    // new message in dm that is concatenation of first dm and new dm
    const res = shareMessage(dmMessage1Body.messageId, 'new message ahahah', -1, dm1Body.dmId);
    const resBody = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(resBody).toMatchObject({ sharedMessageId: expect.any(Number) });
  });
  test('message length exceeds 1000 chars 400 error', () => {
    // new message in dm that is concatenation of first dm and new dm
    const messageToGive = '1'.repeat(1001);
    expect(shareMessage(dmMessage1Body.messageId, messageToGive, -1, dm1Body.dmId)).toHaveProperty('statusCode', 400);
  });
  test('channel id and dmid are invalid 400 error', () => {
    expect(shareMessage(dmMessage1Body.messageId, 'any message', -1, dm1Body.dmId + 999)).toHaveProperty('statusCode', 400);
    expect(shareMessage(dmMessage1Body.messageId, 'any message', chan1Body.channelId + 999, -1)).toHaveProperty('statusCode', 400);
  });
  test('neither channelid nor dmid are -1 400 error', () => {
    expect(shareMessage(dmMessage1Body.messageId, 'any message', chan1Body.channelId, dm1Body.dmId)).toHaveProperty('statusCode', 400);
  });
  // test('authorised user not apart of channel or dm 403 error', () => {
  //     expect(shareMessage(dmMessage1Body.messageId + 99, 'any message', -1, dm1Body.identifier)).toHaveProperty('statusCode', 400)
  // });
});

import request from 'sync-request';
import { clearV1 } from './other';

beforeEach(() => {
  clearV1();
});

// Tests for messageSendV1
// describe('Test send message successfully', () => {
//   test('If it returns {messageId:} successfully, otherwise {error:"error"}', () => {
//     const res = request(
//       'POST',
//       'http://localhost:3200/auth/register/v2',
//       {
//         json: {
//           email: 'rabbit' + Math.floor(Math.random() * 99999) + '@gmail.com',
//           password: 'qgi6dt',
//           nameFirst: 'Peter',
//           nameLast: 'Rabbit'
//         },
//       }
//     );
//     const bodyObj = JSON.parse(String(res.getBody()));
//     const uID = bodyObj.authUserId;
//     const res2 = request(
//       'POST',
//       'http://localhost:3200/channels/create/v2',
//       {
//         json: {
//           token: String(uID),
//           name: 'channel154',
//           isPublic: true
//         },
//       }
//     );
//     const bodyObj2 = JSON.parse(String(res2.getBody()));
//     const channelID = bodyObj2.channelId;

//     const res3 = request(
//       'POST',
//       'http://localhost:3200/message/send',
//       {
//         json: {
//           token: String(uID),
//           channelId: channelID,
//           message: 'hello,node' + Math.floor(Math.random() * 10000)
//         },
//       }
//     );
//     const bodyObj3 = JSON.parse(String(res3.getBody()));
//     // console.log(bodyObj3);
//     const messageId11 = bodyObj3.messageId;
//     // console.log(messageId11);
//     expect(messageId11 > 0).toBeTruthy();
//   });
// });

// Tests for messageSendV1
describe('channelId does not refer to a valid channel,return {error:"error"}', () => {
  test('If it returns {messageId:} successfully, otherwise {error:"error"}', () => {
    const newUser = JSON.parse(String(createBasicAccount().getBody()));
    const basicC = createBasicChannel(newUser.token, 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));
    const res = sendMessage(newUser.token, newChannel.channelId + 100, 'Hi');
    const bodyObj = JSON.parse(String(res.getBody()));

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: 'error' });
  });
});

// Tests for messageSendV1
describe('length of message is less than 1 or over 1000 characters ,return {error:"error"}', () => {
  test('If it returns {messageId:} successfully, otherwise {error:"error"}', () => {
    const res = request(
      'POST',
      'http://localhost:3200/auth/register/v2',
      {
        json: {
          email: 'peterrabbit' + Math.floor(Math.random() * 99999) + '@gmail.com',
          password: 'qgi6dt',
          nameFirst: 'Peter',
          nameLast: 'Rabbit'
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    // const uID = bodyObj.authUserId;
    const bodyToken = bodyObj.token;

    const res2 = request(
      'POST',
      'http://localhost:3200/channels/create/v2',
      {
        json: {
          token: String(bodyToken),
          name: 'channel154',
          isPublic: true
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID2 = bodyObj2.channelId;

    const res44 = request(
      'POST',
      'http://localhost:3200/message/send',
      {
        json: {
          token: String(bodyToken),
          channelId: channelID2,
          message: '',
        },
      }
    );
    // console.log("======="+res44.getBody);
    const bodyObj44 = JSON.parse(String(res44.getBody()));
    // console.log("======="+bodyObj44);
    expect(bodyObj44).toMatchObject({ error: 'error' });
  });
});

// Tests for messageSendV1
describe('channelId is valid and the authorised user is not a member of the channel,return {error:"error"}', () => {
  test('If it returns {messageId:} successfully, otherwise {error:"error"}', () => {
    const res = request(
      'POST',
      'http://localhost:3200/auth/register/v2',
      {
        json: {
          email: 'uniquepeterrabbit2@gmail.com',
          password: 'qgi6dt',
          nameFirst: 'Peter',
          nameLast: 'Rabbit'
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    // const uID = bodyObj.authUserId;
    const bodyToken = bodyObj.token;

    const res2 = request(
      'POST',
      'http://localhost:3200/channels/create/v2',
      {
        json: {
          token: String(bodyToken),
          name: 'channel001',
          isPublic: true
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID2 = bodyObj2.channelId;

    const res6 = request(
      'POST',
      'http://localhost:3200/message/send',
      {
        json: {
          token: 99,
          channelId: channelID2,
          message: 'world,hello'
        },
      }
    );
    const bodyObj6 = JSON.parse(String(res6.getBody()));
    expect(bodyObj6).toMatchObject({ error: 'error' });
  });
});

// Tests for messageEditV1
describe('Test edit message successfully', () => {
  test('If it returns {} successfully, otherwise {error:"error"}', () => {
    const res = request(
      'POST',
      'http://localhost:3200/auth/register/v2',
      {
        json: {
          email: 'uniquepeterrabbit3@gmail.com',
          password: 'qgi6dt',
          nameFirst: 'Peter',
          nameLast: 'Rabbit'
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    // const uID = bodyObj.authUserId;
    const bodyToken = bodyObj.token;

    const res2 = request(
      'POST',
      'http://localhost:3200/channels/create/v2',
      {
        json: {
          token: String(bodyToken),
          name: 'channel002',
          isPublic: true
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID2 = bodyObj2.channelId;

    const res3 = request(
      'POST',
      'http://localhost:3200/message/send',
      {
        json: {
          token: String(bodyToken),
          channelId: channelID2,
          message: 'hello,world'
        },
      }
    );
    const bodyObj3 = JSON.parse(String(res3.getBody()));
    const messageId3 = bodyObj3.messageId;

    const res4 = request(
      'PUT',
      'http://localhost:3200/message/edit',
      {
        json: {
          token: String(bodyToken),
          messageId: messageId3,
          message: 'hello,nodejs'
        },
      }
    );
    const bodyObj4 = JSON.parse(String(res4.getBody()));
    expect(bodyObj4).toMatchObject({});
  });
});

// Tests for messageEditV1
describe('length of message is less than 1 or over 1000 characters,return {error:"error"}', () => {
  test('If it returns {} successfully, otherwise {error:"error"}', () => {
    const res = request(
      'POST',
      'http://localhost:3200/auth/register/v2',
      {
        json: {
          email: 'uniquepeter' + Math.floor(Math.random() * 22222) + '@gmail.com',
          password: 'qgi6dt',
          nameFirst: 'Peter',
          nameLast: 'Rabbit'
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    // const uID = bodyObj.authUserId;
    const bodyToken = bodyObj.token;

    const res2 = request(
      'POST',
      'http://localhost:3200/channels/create/v2',
      {
        json: {
          token: String(bodyToken),
          name: 'channel',
          isPublic: true
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID2 = bodyObj2.channelId;

    const res3 = request(
      'POST',
      'http://localhost:3200/message/send',
      {
        json: {
          token: String(bodyToken),
          channelId: channelID2,
          message: 'hello,world'
        },
      }
    );
    const bodyObj3 = JSON.parse(String(res3.getBody()));
    const messageId3 = bodyObj3.messageId;

    const res44 = request(
      'PUT',
      'http://localhost:3200/message/edit',
      {
        json: {
          token: String(bodyToken),
          messageId: messageId3,
          message: '',
        },
      }
    );
    const bodyObj44 = JSON.parse(String(res44.getBody()));
    expect(bodyObj44).toMatchObject({ error: 'error' });
  });
});

// Tests for messageEditV1
describe('messageId does not refer to a valid message within a channel/DM that the authorised user has joined,return {error:"error"}', () => {
  test('If it returns {} successfully, otherwise {error:"error"}', () => {
    const res = request(
      'POST',
      'http://localhost:3200/auth/register/v2',
      {
        json: {
          email: 'uniquepeterrabbit333@gmail.com',
          password: 'qgi6dt',
          nameFirst: 'Peter',
          nameLast: 'Rabbit'
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    // const uID = bodyObj.authUserId;
    const bodyToken = bodyObj.token;

    const res2 = request(
      'POST',
      'http://localhost:3200/channels/create/v2',
      {
        json: {
          token: String(bodyToken),
          name: 'channel002',
          isPublic: true
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID = bodyObj2.channelId;

    const res3 = request(
      'POST',
      'http://localhost:3200/message/send',
      {
        json: {
          token: String(bodyToken),
          channelId: channelID,
          message: 'hello,world'
        },
      }
    );
    const bodyObj3 = JSON.parse(String(res3.getBody()));
    const messageId3 = bodyObj3.messageId;

    const res5 = request(
      'PUT',
      'http://localhost:3200/message/edit',
      {
        json: {
          token: String(bodyToken),
          messageId: messageId3 + 99999,
          message: 'hello,nodejs'
        },
      }
    );
    const bodyObj5 = JSON.parse(String(res5.getBody()));
    expect(bodyObj5).toMatchObject({ error: 'error' });
  });
});
*/
