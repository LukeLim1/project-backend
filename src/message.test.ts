import { createBasicDm, dmSend, newReg, requestSendDm, sendDMMessage, clear, /* sendMessage, */ shareMessage, messageSendV2, getRequest } from './helperFunctions';
import { createBasicChannel } from './channels.test';
import { Response } from 'sync-request';
import request from 'sync-request';
import { url, port } from './config.json';

// import { Response } from 'sync-request';

const OK = 200;
const error400 = 400;
const error403 = 403;

test('placeholder', () => {
  expect(1).toBe(1);
});

describe('messageShareV1', () => {
  let user1: Response, user1Body: { token: string; authUserId: number; },
    chan1: Response, chan1Body: { channelId: number; }, dm1: Response,
    dm1Body: { dmId: number; },
    dmMessage1: Response,
    dmMessage1Body: { messageId: number; };

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
    const res = shareMessage(user1Body.token, dmMessage1Body.messageId, 'new message ahahah', -1, dm1Body.dmId);
    const resBody = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(resBody).toMatchObject({ sharedMessageId: expect.any(Number) });
  });
  test('message length exceeds 1000 chars 400 error', () => {
    // new message in dm that is concatenation of first dm and new dm
    const messageToGive = '1'.repeat(1001);
    expect(shareMessage(user1Body.token, dmMessage1Body.messageId, messageToGive, -1, dm1Body.dmId)).toHaveProperty('statusCode', 400);
  });
  test('channel id and dmid are invalid 400 error', () => {
    expect(shareMessage(user1Body.token, dmMessage1Body.messageId, 'any message', -1, dm1Body.dmId + 999)).toHaveProperty('statusCode', 400);
    expect(shareMessage(user1Body.token, dmMessage1Body.messageId, 'any message', chan1Body.channelId + 999, -1)).toHaveProperty('statusCode', 400);
  });
  test('neither channelid nor dmid are -1 400 error', () => {
    expect(shareMessage(user1Body.token, dmMessage1Body.messageId, 'any message', chan1Body.channelId, dm1Body.dmId)).toHaveProperty('statusCode', 400);
  });
  // test('authorised user not apart of channel or dm 403 error', () => {
  //     expect(shareMessage(dmMessage1Body.messageId + 99, 'any message', -1, dm1Body.identifier)).toHaveProperty('statusCode', 400)
  // });
});

function messageEditV2(token: string, messageId: number, message: string) {
  return getRequest(
    'PUT',
    '/message/edit/v2',
    {
      messageId, message
    },
    { token }
  );
}

function messageRemoveV2(token: string, messageId: number) {
  return getRequest(
    'DELETE',
    '/message/remove/v2',
    {
      messageId
    },
    { token }
  );
}

describe('test for messageSendV2', () => {
  let token: string,
    token2: string,
    channelId: number;
  beforeEach(() => {
    clear();
    const regist1 = newReg(
      'gabriella.gook@gmail.com',
      'G1gook897',
      'Gabriella',
      'Gook'
    );
    const registerRes1 = JSON.parse(String(regist1.getBody()));
    const regist2 = newReg(
      'bob.destiny@gmail.com',
      'Why1456url',
      'Bob',
      'Destiny'
    );
    const registerRes2 = JSON.parse(String(regist2.getBody()));
    token = registerRes1.token;
    token2 = registerRes2.token;
    const channelRes = createBasicChannel(token, 'star', true);
    channelId = JSON.parse(String(channelRes.getBody())).channelId;
  });
  describe('error case', () => {
    test('channelId does not refer to a valid channel', () => {
      const message = '123';
      expect(messageSendV2(token, channelId + 999, message).statusCode).toStrictEqual(400);
    });

    test('length of message is less than 1 ', () => {
      const message = '';

      expect(messageSendV2(token, channelId, message).statusCode).toStrictEqual(400);
    });

    test('length of message is over 1000 characters', () => {
      let message = '123';
      for (let i = 0; i < 1001; i++) {
        message += '1';
      }

      expect(messageSendV2(token, channelId, message).statusCode).toStrictEqual(400);
    });

    test('channelId is valid and the authorised user is not a member of the channel', () => {
      const message = '123';

      expect(messageSendV2(token2, channelId, message).statusCode).toStrictEqual(403);
    });
  });

  describe('No errors', () => {
    test('message is sent successfully', () => {
      const message = '123';
      expect(messageSendV2(token, channelId, message)).toStrictEqual({ messageId: expect.any(Number) });
    });
  });
});

describe('test for messageEditV2', () => {
  let token: string,
    token2: string,
    channelId: number,
    messageId:number;
  beforeEach(() => {
    clear();
    const regist1 = newReg(
      'gabriella.gook@gmail.com',
      'G1gook897',
      'Gabriella',
      'Gook'
    );
    const registerRes1 = JSON.parse(String(regist1.getBody()));
    const regist2 = newReg(
      'bob.destiny@gmail.com',
      'Why1456url',
      'Bob',
      'Destiny'
    );
    const registerRes2 = JSON.parse(String(regist2.getBody()));
    token = registerRes1.token;
    token2 = registerRes2.token;
    const channelRes = createBasicChannel(token, 'star', true);
    channelId = JSON.parse(String(channelRes.getBody())).channelId;
    messageId = messageSendV2(token, channelId, '123123').messageId;
  });
  describe('error case', () => {
    test('length of message is over 1000 characters', () => {
      let message = '123';
      for (let i = 0; i < 1001; i++) {
        message += '1';
      }
      expect(messageEditV2(token, messageId, message).statusCode).toStrictEqual(400);
    });

    test('messageId does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
      const message = '1234';

      expect(messageEditV2(token, messageId + 999, message).statusCode).toStrictEqual(400);
    });

    test('If the authorised user does not have owner permissions, and the message was not sent by them', () => {
      const message = '123';

      expect(messageEditV2(token2, messageId, message).statusCode).toStrictEqual(403);
    });
  });

  describe('No errors', () => {
    test('edit message successfully', () => {
      const message = '123';
      expect(messageEditV2(token, messageId, message)).toStrictEqual({});
    });
  });
});

describe('test for messageRemoveV2', () => {
  let token: string,
    token2: string,
    channelId: number,
    messageId: number;
  beforeEach(() => {
    clear();
    const regist1 = newReg(
      'gabriella.gook@gmail.com',
      'G1gook897',
      'Gabriella',
      'Gook'
    );
    const registerRes1 = JSON.parse(String(regist1.getBody()));
    const regist2 = newReg(
      'bob.destiny@gmail.com',
      'Why1456url',
      'Bob',
      'Destiny'
    );
    const registerRes2 = JSON.parse(String(regist2.getBody()));
    token = registerRes1.token;
    token2 = registerRes2.token;
    const channelRes = createBasicChannel(token, 'star', true);
    channelId = JSON.parse(String(channelRes.getBody())).channelId;
    messageId = messageSendV2(token, channelId, '123123').messageId;
  });
  describe('error case', () => {
    test('messageId does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
      expect(messageRemoveV2(token, messageId + 999).statusCode).toStrictEqual(400);
    });

    test('If the authorised user does not have owner permissions, and the message was not sent by them', () => {
      expect(messageRemoveV2(token2, messageId).statusCode).toStrictEqual(403);
    });
  });

  describe('No errors', () => {
    test('message removal successful', () => {
      expect(messageRemoveV2(token, messageId)).toStrictEqual({});
    });
  });
});

/*
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

describe('test for message for search/react/unreact/pin/unpin', () => {
  let userA: any, userB: any;
  let userBMemberOfDMId: number, messageId: number;
  let userBToken: string;
  beforeEach(() => {
    clear();
    // register user A
    const basicA = newReg('zach@gmail.com', '123456', 'zach', 'chan');
    userA = JSON.parse(String(basicA.getBody()));

    // register user B
    const basicB = newReg('111zach@gmail.com', '123456', '1zach', '1chan');
    userB = JSON.parse(String(basicB.getBody()));
    userBToken = userB.token;

    // create dm
    const dm = createBasicDm(userA.token, [userA.authUserId, userB.authUserId]);
    userBMemberOfDMId = JSON.parse(String(dm.getBody())).dmId;

    // send dm message
    const message = sendDMMessage(userBToken, userBMemberOfDMId, 'hello everyone,i am tony.');
    messageId = JSON.parse(String(message.getBody())).messageId;
  });

  test('message search success', () => {
    const res = request(
      'GET',
      `${url}:${port}/search/v1`,
      {
        headers: { token: userBToken },
        qs: { queryStr: 'hello' }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ messages: expect.any(Object) });
  });

  test('message search fail 400, length of queryStr is less than 1 or over 1000 characters', () => {
    const res = request(
      'GET',
      `${url}:${port}/search/v1`,
      {
        headers: { token: userBToken },
        qs: { queryStr: '' }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(error400);
    expect(bodyObj).toMatchObject({ error: { message: 'queryStr length is error' } });
  });

  test('message react success', () => {
    const param = {
      messageId: messageId,
      reactId: 1,
    };

    const res = request(
      'POST',
      `${url}:${port}/message/react/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userBToken
        },
      });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({});
  });

  test('message react fail 400, messageId is not a valid message within a channel or DM that the authorised user has joined', () => {
    const param = {
      messageId: -1,
      reactId: 1,
    };

    const res = request(
      'POST',
      `${url}:${port}/message/react/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userBToken
        },
      });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(error400);
    expect(bodyObj).toMatchObject({ error: { message: 'message not found' } });
  });

  test('message react fail 400,reactId is not a valid react ID', () => {
    const param = {
      messageId: messageId,
      reactId: 2,
    };

    const res = request(
      'POST',
      `${url}:${port}/message/react/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userBToken
        },
      });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(error400);
    expect(bodyObj).toMatchObject({ error: { message: 'reactId is not a valid react ID' } });
  });

  test('message react fail 400,the message already contains a react with ID reactId from the authorised user', () => {
    const param = {
      messageId: messageId,
      reactId: 1,
    };

    request(
      'POST',
      `${url}:${port}/message/react/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userBToken
        },
      });

    const res = request(
      'POST',
      `${url}:${port}/message/react/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userBToken
        },
      });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(error400);
    expect(bodyObj).toMatchObject({ error: { message: 'message had react by the user' } });
  });

  test('message unreact success', () => {
    const param = {
      messageId: messageId,
      reactId: 1,
    };

    request(
      'POST',
      `${url}:${port}/message/react/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userBToken
        },
      });

    const res = request(
      'POST',
      `${url}:${port}/message/unreact/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userBToken
        },
      });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({});
  });

  test('message unreact fail 400,messageId is not a valid message within a channel or DM that the authorised user has joined', () => {
    const param = {
      messageId: -1,
      reactId: 1,
    };

    const res = request(
      'POST',
      `${url}:${port}/message/unreact/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userBToken
        },
      });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(error400);
    expect(bodyObj).toMatchObject({ error: { message: 'message not found' } });
  });

  test('message unreact fail 400,reactId is not a valid react ID', () => {
    const param = {
      messageId: messageId,
      reactId: 2,
    };

    const res = request(
      'POST',
      `${url}:${port}/message/unreact/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userBToken
        },
      });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(error400);
    expect(bodyObj).toMatchObject({ error: { message: 'reactId is not a valid react ID' } });
  });

  test('message unreact fail 400,the message does not contain a react with ID reactId from the authorised user', () => {
    const param = {
      messageId: messageId,
      reactId: 1,
    };

    const res = request(
      'POST',
      `${url}:${port}/message/unreact/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userBToken
        },
      });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(error400);
    expect(bodyObj).toMatchObject({ error: { message: 'message had no react by the user' } });
  });

  // test for message/pin/v1
  test('message pin success', () => {
    const param = {
      messageId: messageId
    };

    const res = request(
      'POST',
      `${url}:${port}/message/pin/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userA.token
        },
      });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({});
  });

  test('message pin fail 400,messageId is not a valid message within a channel or DM that the authorised user has joined', () => {
    const param = {
      messageId: -1,
    };

    const res = request(
      'POST',
      `${url}:${port}/message/pin/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userA.token
        },
      });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(error400);
    expect(bodyObj).toMatchObject({ error: { message: 'message not found' } });
  });

  test('message pin fail 400, the message is already pinned', () => {
    const param = {
      messageId: messageId
    };

    request(
      'POST',
      `${url}:${port}/message/pin/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userA.token
        },
      });

    const res = request(
      'POST',
      `${url}:${port}/message/pin/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userA.token
        },
      });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(error400);
    expect(bodyObj).toMatchObject({ error: { message: 'message had pinned' } });
  });

  test('message pin fail 403, messageId refers to a valid message in a joined channel/DM and the authorised user does not have owner permissions in the channel/DM', () => {
    const param = {
      messageId: messageId
    };

    request(
      'POST',
      `${url}:${port}/message/pin/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userA.token
        },
      });

    const res = request(
      'POST',
      `${url}:${port}/message/pin/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userBToken
        },
      });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(error403);
    expect(bodyObj).toMatchObject({ error: { message: 'user had no owner permissions' } });
  });

  // test for message/unpin/v1
  test('message unpin success', () => {
    const param = {
      messageId: messageId
    };

    request(
      'POST',
      `${url}:${port}/message/pin/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userA.token
        },
      });

    const res = request(
      'POST',
      `${url}:${port}/message/unpin/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userA.token
        },
      });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({});
  });

  test('message unpin fail 400,messageId is not a valid message within a channel or DM that the authorised user has joined', () => {
    const param = {
      messageId: -1,
    };

    const res = request(
      'POST',
      `${url}:${port}/message/unpin/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userA.token
        },
      });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(error400);
    expect(bodyObj).toMatchObject({ error: { message: 'message not found' } });
  });

  test('message unpin fail 400, the message is not already pinned', () => {
    const param = {
      messageId: messageId
    };

    const res = request(
      'POST',
      `${url}:${port}/message/unpin/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userA.token
        },
      });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(error400);
    expect(bodyObj).toMatchObject({ error: { message: 'message had not pinned' } });
  });

  test('message unpin fail 403, messageId refers to a valid message in a joined channel/DM and the authorised user does not have owner permissions in the channel/DM', () => {
    const param = {
      messageId: messageId
    };

    request(
      'POST',
      `${url}:${port}/message/pin/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userA.token
        },
      });
    const res = request(
      'POST',
      `${url}:${port}/message/unpin/v1`,
      {
        body: JSON.stringify(param),
        headers: {
          'Content-type': 'application/json',
          token: userBToken
        },
      });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(error403);
    expect(bodyObj).toMatchObject({ error: { message: 'user had no owner permissions' } });
  });
});
