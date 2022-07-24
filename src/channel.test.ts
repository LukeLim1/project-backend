import request from 'sync-request';
import { url, port } from './config.json';
import { createBasicChannel } from './channels.test';
import { newReg, createBasicAccount, createBasicAccount2, leaveChannel, joinChannel, clear } from './helperFunctions';
// import { join } from 'path';

const OK = 200;
// const Error400 = 400;
// const Error403 = 403;

beforeEach(() => {
  clear();
});

describe('HTTP tests using Jest', () => {
  // test('Testing successful channel details', () => {
  //   const basicA = createBasicAccount();
  //   const newUser = JSON.parse(String(basicA.getBody()));
  //   const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
  //   const newChannel = JSON.parse(String(basicC.getBody()));
  //   const res = request(
  //     'GET',
  //     `${url}:${port}/channel/details/v2`,
  //     {
  //       qs: {
  //         token: '1',
  //         channelId: 1,
  //       },
  //     }
  //   );
  //   console.log(res);
  //   expect(res.statusCode).toBe(OK);
  //   //expect(res).toMatchObject({ error: 'error' });
  // });

  test('channelDetails: channelId does not refer to valid channel', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));
    const res = request(
      'GET',
      `${url}:${port}/channel/details/v2`,
      {
        qs: {
          token: newUser.token[0],
          channelId: newChannel.channelId + 5,
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  test('channelDetails: channelId valid, but user is not a member', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));
    const res = request(
      'GET',
      `${url}:${port}/channel/details/v2`,
      {
        qs: {
          token: newUser.token[0].concat('abc'),
          channelId: newChannel.channelId,
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  test('Testing successful channelJoin', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    const res = request(
      'POST',
      `${url}:${port}/channel/join/v2`,
      {
        body: JSON.stringify({
          token: newUser2.token[0],
          channelId: newChannel.channelId,
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

  test('channelJoin: channelId does not refer to a valid channel', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    const res = request(
      'POST',
      `${url}:${port}/channel/join/v2`,
      {
        body: JSON.stringify({
          token: newUser2.token[0],
          channelId: newChannel.channelId + 5,
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

  test('channelJoin: authorised user is already a member', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    request(
      'POST',
      `${url}:${port}/channel/join/v2`,
      {
        body: JSON.stringify({
          token: newUser2.token[0],
          channelId: newChannel.channelId,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );

    const res = request(
      'POST',
      `${url}:${port}/channel/join/v2`,
      {
        body: JSON.stringify({
          token: newUser2.token[0],
          channelId: newChannel.channelId,
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

  test('channelJoin: channelId refers to private channel and authorised user is not channel member and not global owner', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token[0], 'channel1', false);
    const newChannel = JSON.parse(String(basicC.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    const res = joinChannel(newUser2.token[0], newChannel.channelId);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  // tests for channel/leave
  describe('channelLeaveV1 tests', () => {
    test('Channel successfully left', () => {
      // account 1
      const basicA = newReg('zachary-chan@gmail.com', 'z5312386', 'Zach', 'Chan');
      const newUser = JSON.parse(String(basicA.getBody()));
      //  account 2
      const res2 = newReg('hello@gmail.com', 'z5312386', 'Taylor', 'Swift');

      expect(res2.statusCode).toBe(OK);

      const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
      const newChannel = JSON.parse(String(basicC.getBody()));

      // join a channel
      const res4 = joinChannel(newUser.token[0], newChannel.channelId);

      const bodyObj1 = JSON.parse(String(res4.getBody()));
      expect(res4.statusCode).toBe(OK);
      expect(bodyObj1).toMatchObject({});

      // channel leave test
      const res5 = leaveChannel(newUser.token[0], newChannel.channelId);

      const bodyObj2 = JSON.parse(String(res5.getBody()));
      expect(res5.statusCode).toBe(OK);
      expect(bodyObj2).toMatchObject({});
    });

    test('Channel leave failed', () => {
      // account 1
      const basicA = newReg('zachary-chan@gmail.com', 'z5312386', 'Zach', 'Chan');
      const newUser = JSON.parse(String(basicA.getBody()));
      //  account 2
      const res2 = newReg('hello@gmail.com', 'z5312386', 'Taylor', 'Swift');
      // account 3 not apart of the channel
      const new1 = newReg('test@gmail.com', 'fail1234', 'failure', 'ofATest');
      const failUser = JSON.parse(String(new1.getBody()));

      expect(res2.statusCode).toBe(OK);

      const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
      const newChannel = JSON.parse(String(basicC.getBody()));

      // join a channel
      const res4 = joinChannel(newUser.token[0], newChannel.channelId);

      const bodyObj1 = JSON.parse(String(res4.getBody()));
      expect(res4.statusCode).toBe(OK);
      expect(bodyObj1).toMatchObject({});

      // channel leave  'CHANNELID DOES NOT REFER TO A VALID CHANNEL'
      const res5 = leaveChannel(newUser.token[0], newChannel.channelId + 99999);
      const bodyObj2 = JSON.parse(String(res5.getBody()));

      // TO IMPLEMENT
      // expect(res5.statusCode).toBe(Error400);
      expect(bodyObj2).toMatchObject({ error: expect.any(String) });

      // channel leave 'AUTHORISED USER NOT A MEMBER OF A VALID CHANNEL
      // account not part of channel
      // channel leave
      const res6 = leaveChannel(failUser.token[0], newChannel.channelId);
      const bodyObj3 = JSON.parse(String(res6.getBody()));
      expect(bodyObj3).toMatchObject({ error: expect.any(String) });
    });
  });
});

// Tests for channelInviteV2
describe('Test channel/invite/v2,successfully', () => {
  test('If it returns {} successfully, otherwise {error:"error"}', () => {
    const res = request(
      'POST',
      `${url}:${port}/auth/register/v2`,
      {
        body: JSON.stringify({
          email: 'uniquepeterrabbit5@gmail.com',
          password: 'qgi6dt',
          nameFirst: 'Peter',
          nameLast: 'Rabbit'
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    const uID = bodyObj.authUserId;
    const res2 = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: String(uID),
          name: 'channel005',
          isPublic: true
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID = bodyObj2.channelId;

    const res3 = request(
      'POST',
      `${url}:${port}/channel/invite/v2`,
      {
        body: JSON.stringify({
          token: String(uID),
          channelId: channelID,
          uId: uID
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj3 = JSON.parse(String(res3.getBody()));
    expect(bodyObj3).toMatchObject({});
  });
});

// Tests for channelInviteV2
describe('channelId does not refer to a valid channel, return {error:"error"} ', () => {
  test('If it returns {} successfully, otherwise {error:"error"}', () => {
    const res = request(
      'POST',
      `${url}:${port}/auth/register/v2`,
      {
        body: JSON.stringify({
          email: 'uniquepeterrabbit52@gmail.com',
          password: 'qgi6dt',
          nameFirst: 'Peter',
          nameLast: 'Rabbit'
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    const uID = bodyObj.authUserId;
    const res2 = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: String(uID),
          name: 'channel005',
          isPublic: true
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID = bodyObj2.channelId;

    const res4 = request(
      'POST',
      `${url}:${port}/channel/invite/v2`,
      {
        body: JSON.stringify({
          token: String(uID),
          channelId: channelID + 100,
          uId: uID
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj4 = JSON.parse(String(res4.getBody()));
    expect(bodyObj4).toMatchObject({ error: 'error' });
  });
});

// Tests for channelInviteV2
describe('uId does not refer to a valid user, return {error:"error"} ', () => {
  test('If it returns {} successfully, otherwise {error:"error"}', () => {
    const res = request(
      'POST',
      `${url}:${port}/auth/register/v2`,
      {
        body: JSON.stringify({
          email: 'uniquepeterrabbit53@gmail.com',
          password: 'qgi6dt',
          nameFirst: 'Peter',
          nameLast: 'Rabbit'
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    const uID = bodyObj.authUserId;
    const res2 = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: String(uID),
          name: 'channel005',
          isPublic: true
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID = bodyObj2.channelId;

    const res5 = request(
      'POST',
      `${url}:${port}/channel/invite/v2`,
      {
        body: JSON.stringify({
          token: String(uID),
          channelId: channelID,
          uId: uID + 100
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj5 = JSON.parse(String(res5.getBody()));
    expect(bodyObj5).toMatchObject({ error: 'error' });
  });
});

// Tests for channelInviteV2
describe('uId refers to a user who is already a member of the channel, return {error:"error"} ', () => {
  test('If it returns {} successfully, otherwise {error:"error"}', () => {
    const res = request(
      'POST',
      `${url}:${port}/auth/register/v2`,
      {
        body: JSON.stringify({
          email: 'uniquepeterrabbit55@gmail.com',
          password: 'qgi6dt',
          nameFirst: 'Peter',
          nameLast: 'Rabbit'
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    const uID = bodyObj.authUserId;
    const res2 = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: String(uID),
          name: 'channel005',
          isPublic: true
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID = bodyObj2.channelId;

    const res7 = request(
      'POST',
      `${url}:${port}/channel/invite/v2`,
      {
        body: JSON.stringify({
          token: String(uID),
          channelId: channelID,
          uId: uID
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj7 = JSON.parse(String(res7.getBody()));
    expect(bodyObj7).toMatchObject({ error: 'error' });
  });
});

// Tests for channelInviteV2
describe('channelId is valid and the authorised user is not a member of the channel, return {error:"error"} ', () => {
  test('If it returns {} successfully, otherwise {error:"error"}', () => {
    const res = request(
      'POST',
      `${url}:${port}/auth/register/v2`,
      {
        body: JSON.stringify({
          email: 'uniquepeterrabbit56@gmail.com',
          password: 'qgi6dt',
          nameFirst: 'Peter',
          nameLast: 'Rabbit'
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    const uID = bodyObj.authUserId;
    const res2 = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: String(uID),
          name: 'channel005',
          isPublic: true
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID = bodyObj2.channelId;
    const res7 = request(
      'POST',
      `${url}:${port}/channel/invite/v2`,
      {
        body: JSON.stringify({
          token: String(uID),
          channelId: channelID,
          uId: uID + 99
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj7 = JSON.parse(String(res7.getBody()));
    expect(bodyObj7).toMatchObject({ error: 'error' });
  });
});

// Tests for channelMessageV2
describe('Test channel/messages/v2', () => {
  test('If it returns {message:,start:,end:} successfully, otherwise {error:"error"}', () => {
    const email = 'uniquepeter6' + Math.floor(Math.random() * 4444) + '@gmail.com';
    const password = 'qgi6dt';
    const res222 = request(
      'POST',
      `${url}:${port}/auth/login/v2`,
      {
        body: JSON.stringify({
          email: email,
          password: password
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj222 = JSON.parse(String(res222.getBody()));
    const token222 = bodyObj222.token;

    const res2 = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: token222,
          name: 'channel006' + Math.floor(Math.random() * 88888),
          isPublic: true
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID = bodyObj2.channelId;

    const res22 = request(
      'GET',
      'http://localhost:3200/channel/messages/v2',
      {
        qs: {
          token: token222,
          channelId: channelID,
          start: 0
        },
      }
    );
    const bodyObj22 = JSON.parse(String(res22.getBody()));
    expect(bodyObj22).toEqual({ error: 'error' });
  });
});

// Tests for channelMessageV2
describe('channelId does not refer to a valid channel', () => {
  test('If it returns {message:,start:,end:} successfully, otherwise {error:"error"}', () => {
    const res = request(
      'POST',
      `${url}:${port}/auth/register/v2`,
      {
        body: JSON.stringify({
          email: 'uniquepeterrabbit62@gmail.com',
          password: 'qgi6dt',
          nameFirst: 'Peter',
          nameLast: 'Rabbit'
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    const uID = bodyObj.authUserId;
    const res2 = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: String(uID),
          name: 'channel006',
          isPublic: true
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID = bodyObj2.channelId;

    const res3 = request(
      'GET',
      'http://localhost:3200/channel/messages/v2',
      {
        qs: {
          token: String(uID),
          channelId: channelID + 10,
          start: 0
        },
      }
    );
    const bodyObj3 = JSON.parse(String(res3.getBody()));
    expect(bodyObj3).toEqual({ error: 'error' });
  });
});

// Tests for channelMessageV2
describe('start is greater than the total number of messages in the channel,return {error:"error"}', () => {
  test('If it returns {message:,start:,end:} successfully, otherwise {error:"error"}', () => {
    const res = request(
      'POST',
      `${url}:${port}/auth/register/v2`,
      {
        body: JSON.stringify({
          email: 'uniquepeterrabbit62@gmail.com',
          password: 'qgi6dt',
          nameFirst: 'Peter',
          nameLast: 'Rabbit'
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    const uID = bodyObj.authUserId;
    const res2 = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: String(uID),
          name: 'channel006',
          isPublic: true
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID = bodyObj2.channelId;

    const res22 = request(
      'GET',
      'http://localhost:3200/channel/messages/v2',
      {
        qs: {
          token: String(uID),
          channelId: channelID,
          start: 9999999
        },
      }
    );
    const bodyObj22 = JSON.parse(String(res22.getBody()));
    expect(bodyObj22).toEqual({ error: 'error' });
  });
});

// Tests for channelMessageV2
describe('channelId is valid and the authorised user is not a member of the channel,return {error:"error"}', () => {
  test('If it returns {message:,start:,end:} successfully, otherwise {error:"error"}', () => {
    const res = request(
      'POST',
      `${url}:${port}/auth/register/v2`,
      {
        body: JSON.stringify({
          email: 'uniquepeterrabbit62@gmail.com',
          password: 'qgi6dt',
          nameFirst: 'Peter',
          nameLast: 'Rabbit'
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    const uID = bodyObj.authUserId;
    const res2 = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: String(uID),
          name: 'channel006',
          isPublic: true
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID = bodyObj2.channelId;

    const res22 = request(
      'GET',
      'http://localhost:3200/channel/messages/v2',
      {
        qs: {
          token: String(uID + 999),
          channelId: channelID,
          start: 0
        },
      }
    );
    const bodyObj22 = JSON.parse(String(res22.getBody()));
    expect(bodyObj22).toEqual({ error: 'error' });
  });
});

// Tests for channelAddownerV1
describe('Test channel/addowner/v1 successfully', () => {
  test('If it returns {} successfully, otherwise {error:"error"}', () => {
    const res = request(
      'POST',
      `${url}:${port}/auth/register/v2`,
      {
        body: JSON.stringify({
          email: 'uniquepeterrabbit' + Math.floor(Math.random() * 444) + '@gmail.com',
          password: 'qgi6dt',
          nameFirst: 'Peter',
          nameLast: 'Rabbit'
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    const uID = bodyObj.authUserId;
    const res2 = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: String(uID),
          name: 'channel007' + Math.floor(Math.random() * 88888),
          isPublic: true
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID = bodyObj2.channelId;

    const res3 = request(
      'POST',
      `${url}:${port}/channel/addowner/v1`,
      {
        body: JSON.stringify({
          token: String(uID),
          channelId: channelID,
          uId: uID
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj3 = JSON.parse(String(res3.getBody()));
    expect(bodyObj3).toEqual({ });
  });
});

// Tests for channelAddownerV1
describe('channelId does not refer to a valid channel,return {error:"error"}', () => {
  test('If it returns {} successfully, otherwise {error:"error"}', () => {
    const res = request(
      'POST',
      `${url}:${port}/auth/register/v2`,
      {
        body: JSON.stringify({
          email: 'uniquepeterrabbit72@gmail.com',
          password: 'qgi6dt',
          nameFirst: 'Peter',
          nameLast: 'Rabbit'
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    const uID = bodyObj.authUserId;
    const res2 = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: String(uID),
          name: 'channel007',
          isPublic: true
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID = bodyObj2.channelId;

    const res4 = request(
      'POST',
      `${url}:${port}/channel/addowner/v1`,
      {
        body: JSON.stringify({
          token: String(uID),
          channelId: channelID + 999,
          uId: uID
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj4 = JSON.parse(String(res4.getBody()));
    expect(bodyObj4).toEqual({ error: 'error' });
  });
});

// Tests for channelAddownerV1
describe('uId does not refer to a valid user,return {error:"error"}', () => {
  test('If it returns {} successfully, otherwise {error:"error"}', () => {
    const res = request(
      'POST',
      `${url}:${port}/auth/register/v2`,
      {
        body: JSON.stringify({
          email: 'uniquepeterrabbit73@gmail.com',
          password: 'qgi6dt',
          nameFirst: 'Peter',
          nameLast: 'Rabbit'
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    const uID = bodyObj.authUserId;
    const res2 = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: String(uID),
          name: 'channel007',
          isPublic: true
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID = bodyObj2.channelId;

    const res4 = request(
      'POST',
      `${url}:${port}/channel/addowner/v1`,
      {
        body: JSON.stringify({
          token: String(uID),
          channelId: channelID,
          uId: uID + Math.floor(Math.random() * 88888)
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj4 = JSON.parse(String(res4.getBody()));
    expect(bodyObj4).toEqual({ error: 'error' });
  });
});

// Tests for channelAddownerV1
describe('channelId is valid and the authorised user is not a member of the channel,return {error:"error"}', () => {
  test('If it returns {} successfully, otherwise {error:"error"}', () => {
    const res = request(
      'POST',
      `${url}:${port}/auth/register/v2`,
      {
        body: JSON.stringify({
          email: 'uniquepeterrabbit75@gmail.com',
          password: 'qgi6dt',
          nameFirst: 'Peter',
          nameLast: 'Rabbit'
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    const uID = bodyObj.authUserId;

    const uID11 = bodyObj.authUserId;

    const res2 = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: String(uID),
          name: 'channel007',
          isPublic: true
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID = bodyObj2.channelId;

    const res4 = request(
      'POST',
      `${url}:${port}/channel/addowner/v1`,
      {
        body: JSON.stringify({
          token: String(uID11),
          channelId: channelID,
          uId: uID11 + Math.floor(Math.random() * 88888)
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj4 = JSON.parse(String(res4.getBody()));
    expect(bodyObj4).toEqual({ error: 'error' });
  });
});

// Tests for channelRemoveownerV1
describe('uId does not refer to a valid user,return {error:"error"}', () => {
  test('If it returns {} successfully, otherwise {error:"error"}', () => {
    const res = request(
      'POST',
      `${url}:${port}/auth/register/v2`,
      {
        body: JSON.stringify({
          email: 'uniquepeterrabbit82@gmail.com',
          password: 'qgi6dt',
          nameFirst: 'Peter',
          nameLast: 'Rabbit'
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    const uID = bodyObj.authUserId;
    const res2 = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: String(uID),
          name: 'channel008',
          isPublic: true
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID = bodyObj2.channelId;

    const res4 = request(
      'POST',
      `${url}:${port}/channel/removeowner/v1`,
      {
        body: JSON.stringify({
          token: String(uID),
          channelId: channelID,
          uId: uID + 666
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj4 = JSON.parse(String(res4.getBody()));
    expect(bodyObj4).toEqual({ error: 'error' });
  });
});

// Tests for channelRemoveownerV1
describe('channelId does not refer to a valid channel,return {error:"error"}', () => {
  test('If it returns {} successfully, otherwise {error:"error"}', () => {
    const res = request(
      'POST',
      `${url}:${port}/auth/register/v2`,
      {
        body: JSON.stringify({
          email: 'uniquepeterrabbit83@gmail.com',
          password: 'qgi6dt',
          nameFirst: 'Peter',
          nameLast: 'Rabbit'
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    const uID = bodyObj.authUserId;
    const res2 = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: String(uID),
          name: 'channel008',
          isPublic: true
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    const channelID = bodyObj2.channelId;

    const res5 = request(
      'POST',
      `${url}:${port}/channel/removeowner/v1`,
      {
        body: JSON.stringify({
          token: String(uID),
          channelId: channelID + Math.floor(Math.random() * 1000),
          uId: uID
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj5 = JSON.parse(String(res5.getBody()));
    expect(bodyObj5).toEqual({ error: 'error' });
  });
});
