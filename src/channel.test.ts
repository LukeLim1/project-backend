<<<<<<< HEAD
import {channelDetailsV1, channelJoinV1, channelMessagesV1, channelInviteV1} from './channel.js';
import { channelsCreateV1 } from './channels.js';
import {authRegisterV1} from './auth.js';
import {clearV1} from './other.js';

test('Testing successful channelDetailsV1 and channelJoinV1', () => {
    clearV1();
    const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
    const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');
    const channel1 = channelsCreateV1(owner.authUserId, 'channel#1', true);
    expect(channelJoinV1(user1.authUserId, channel1.channelId)).toMatchObject({});

    expect(channelDetailsV1(owner.authUserId, channel1.channelId)).toMatchObject(
    {
        name: 'channel#1', 
        isPublic: true,
        ownerMembers: [
            {
                uId: owner.authUserId,
                email: 'owner@email.com',
                nameFirst: 'Ada',
                nameLast: 'Bob',
                handleStr: 'adabob',
            },
        ], 
        allMembers: [
            {
                uId: owner.authUserId,
                email: 'owner@email.com',
                nameFirst: 'Ada',
                nameLast: 'Bob',
                handleStr: 'adabob',
            },
            {
                uId: user1.authUserId,
                email: 'user1@email.com',
                nameFirst: 'Ocean',
                nameLast: 'Hall',
                handleStr: 'oceanhall',
            }
        ]
    });
});

// Error cases

test('channelId does not refer to valid channel', () => {
    clearV1();
    const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
    const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');
    const channel1 = channelsCreateV1(owner.authUserId, 'channel#1', true);
    expect(channelJoinV1(user1.authUserId, channel1.channelId + 5)).toMatchObject({ error: 'error' });

    // Same test for channelDetailsV1
    expect(channelDetailsV1(owner.authUserId, channel1.channelId + 5)).toMatchObject({ error: 'error' });
});

test('authorised user is already a member', () => {
    clearV1();
    const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
    const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');
    const channel1 = channelsCreateV1(owner.authUserId, 'channel#1', true);
    channelJoinV1(user1.authUserId, channel1.channelId);
    expect(channelJoinV1(user1.authUserId, channel1.channelId)).toMatchObject({ error: 'error' });
});

test('channelId refers to private channel and the user is not channel member nor global owner', () => {
    clearV1();
    const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
    const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');
    const channel1 = channelsCreateV1(owner.authUserId, 'channel#1', false);
    expect(channelJoinV1(user1.authUserId, channel1.channelId)).toMatchObject({ error: 'error' });
});

test('channelId valid, but the user is not a member', () => {
    clearV1();
    const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
    const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');
    const channel1 = channelsCreateV1(owner.authUserId, 'channel#1', false);
    expect(channelDetailsV1(user1.authUserId, channel1.channelId)).toMatchObject({ error: 'error' });
});

// Tests for channelInviteV1
describe('channelInviteV1', () => {
    let channelID, uID, authUserID;
    beforeEach ( () => {
        clearV1();
        uID = authRegisterV1('uniquepeterrabbit@gmail.com', 'qgi6dt', 'Peter', 'Rabbit').authUserId;
        authUserID = authRegisterV1('uniqueBobLovel@gmail.com', 'qgi6dt', 'Bob', 'Lovel').authUserId;
        channelID = channelsCreateV1(authUserID, 'animal_kingdom', true).channelId;
    });

    describe('Error cases', () => {
        
        test('Invalid user', () => {   
            expect(channelInviteV1(authUserID, channelID, uID + 1)).toEqual({ error: 'error' });
        });

        test('Invalid channel', () => {   
            expect(channelInviteV1(authUserID, channelID + 1, uID)).toEqual({ error: 'error' });
        });

        test('User is already a member of this channel', () => {   
            expect(channelInviteV1(authUserID, channelID, authUserID)).toEqual({ error: 'error' });
        });

        test('User is already authorised but membership of this channel is still not granted', () => {   
            expect(channelInviteV1(uID, channelID, uID)).toEqual({ error: 'error' });
        });

    });

    describe('No errors: expected ideal cases', () => {
        
        test('Invitation successful!', () => {
            channelInviteV1(authUserID, channelID, uID);   
            expect(channelInviteV1(authUserID, channelID, uID)).toMatchObject({});
        });
    });
});

// Tests for channelMessageV1
describe('channelMessagesV1', () => {
    let channelID, uID, authUserID, start, message;
    beforeEach ( () => {
        clearV1();
        uID = authRegisterV1('uniquepeterrabbit@gmail.com', 'qgi6dt', 'Peter', 'Rabbit').authUserId;
        authUserID = authRegisterV1('uniqueBobLovel@gmail.com', 'qgi6dt', 'Bob', 'Lovel').authUserId;
        channelID = channelsCreateV1(authUserID, 'animal_kingdom', true).channelId;
    });

    describe('Error cases', () => {
        
        test('Invalid channel', () => {   
            start = 0;
            expect(channelMessagesV1(authUserID, channelID + 1, start)).toEqual({ error: 'error' });
        });

        test('start is greater than the total no. of messages in the channel', () => {   
            start = 100;
            expect(channelMessagesV1(authUserID, channelID, start)).toEqual({ error: 'error' });
        });

        test('User is already authorised but membership of this channel is still not granted', () => { 
            start = 0;  
            expect(channelMessagesV1(uID, channelID, start)).toEqual({ error: 'error' });
        });
    });

    describe('No errors: expected ideal cases', () => {
        
        test('Messages retrieval successful!', () => {
            const start = 0;
            let resultActual = channelMessagesV1(authUserID, channelID, start);
            expect(resultActual).toMatchObject({ 
                messages: [],
                start: 0,
                end: -1
            });
        });
    });
});
=======
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
    const basicC = createBasicChannel(newUser.token, 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));
    const res = request(
      'GET',
      `${url}:${port}/channel/details/v2`,
      {
        qs: {
          token: newUser.token,
          channelId: newChannel.channelId,
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
    });
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

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  test('channelDetails: channelId valid, but user is not a member', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token, 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));
    const res = request(
      'GET',
      `${url}:${port}/channel/details/v2`,
      {
        qs: {
          token: newUser.token.concat('abc'),
          channelId: newChannel.channelId,
        },
      }
    );

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  test('Testing successful channelJoin', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token, 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    const res = request(
      'POST',
      `${url}:${port}/channel/join/v2`,
      {
        body: JSON.stringify({
          token: newUser2.token,
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
    const basicC = createBasicChannel(newUser.token, 'channel1', true);
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
    const basicC = createBasicChannel(newUser.token, 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    request(
      'POST',
      `${url}:${port}/channel/join/v2`,
      {
        body: JSON.stringify({
          token: newUser2.token,
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
          token: newUser2.token,
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
    const basicC = createBasicChannel(newUser.token, 'channel1', false);
    const newChannel = JSON.parse(String(basicC.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    const res = joinChannel(newUser2.token, newChannel.channelId);

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
>>>>>>> 23ab0a9897f3394234ea3b3f3f24bd62f287f0e9
