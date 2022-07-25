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
  test('Testing successful channel details', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));
    const res = request(
      'GET',
      `${url}:${port}/channel/details/v2`,
      {
        qs: {
          token: '1',
          channelId: 1,
        },
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({
      name: 'channel1',
      isPublic: true,
      ownerMembers: [{
        uId: newUser.authUserId,
        email: 'zachary-chan@gmail.com',
        nameFirst: 'Zachary',
        nameLast: 'Chan',
        handleStr: 'zacharychan',
      }],
      allMembers: [{
        uId: newUser.authUserId,
        email: 'zachary-chan@gmail.com',
        nameFirst: 'Zachary',
        nameLast: 'Chan',
        handleStr: 'zacharychan',
      }],
    })
  });

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
