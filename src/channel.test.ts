import { channelDetailsV1, channelJoinV1, channelMessagesV1, channelInviteV1, channelLeaveV1 } from './channel';
import { channelsCreateV1 } from './channels';
import { authRegisterV1 } from './auth';
import { clearV1 } from './other';

import request, { HttpVerb } from 'sync-request';
import { url, port } from './config.json';
import { assert } from 'console';

const OK = 200;

function requestHelper(method: HttpVerb, path: string, payload: object) {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    json = payload;
  }
  const res = request(method, `${url}:${port}/` + path, { qs, json });
  assert(res.statusCode === OK);
  return JSON.parse(res.getBody() as string);
}

function authRegister (email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', 'auth/register/v2', { email, password, nameFirst, nameLast });
}

function channelsCreate (token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', 'channels/create/v2', { token, name, isPublic });
}

function channelDetails (token: string, channelId: number) {
  return requestHelper('GET', 'channel/details/v2', { token, channelId });
}

function channelJoin (token: string, channelId: number) {
  return requestHelper('POST', 'channel/join/v2', { token, channelId });
}

function clear () {
  return requestHelper('DELETE', 'clear/v1', {});
}

beforeEach(() => {
  clear();
});

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
  let channelID: number, uID: number, authUserID: number;
  beforeEach(() => {
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
  let channelID: number, uID: number, authUserID: number, start: number;
  beforeEach(() => {
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
      const resultActual = channelMessagesV1(authUserID, channelID, start);
      expect(resultActual).toMatchObject({
        messages: [],
        start: 0,
        end: -1
      });
    });
  });
});

// tests for channel/leave
describe('channelLeaveV1 tests', () => {
  test('Channel successfully left', () => {
    const owner = authRegisterV1('owner@gmail.com', 'qgi6dt', 'Spongebob', 'Square');
    const user1 = authRegisterV1('user1@gmail.com', 'qgi6dt', 'Patrick', 'Star');
    const channel1 = channelsCreateV1(owner.authUserId, 'channel#1', true);

    expect(channelJoinV1(user1.authUserId, channel1.channelId)).toMatchObject({});

    expect(channelLeaveV1(user1.authUserId, channel1.channelId)).toMatchObject({});

    expect(channelDetailsV1(owner.authUserId, channel1.channelId)).toMatchObject(
      {
        name: 'channel#1',
        isPublic: true,
        ownerMembers: [
          {
            uId: owner.authUserId,
            email: 'owner@gmail.com',
            nameFirst: 'Spongebob',
            nameLast: 'Square',
            handleStr: 'spongebobsquare',
          },
        ],
        allMembers: [
          {
            uId: owner.authUserId,
            email: 'owner@gmail.com',
            nameFirst: 'Spongebob',
            nameLast: 'Square',
            handleStr: 'spongebobsquare',
          },
        ]
      });
    // testing trying to leave from a channel user1 isnt apart of
    expect(channelLeaveV1(user1.authUserId, channel1.channelId)).toMatchObject({ error: 'error' });
    expect(channelLeaveV1(user1.authUserId, -999999)).toMatchObject({ error: 'error' });
  });
});

describe('HTTP tests using Jest', () => {
  test('Test successful channelDetails', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newChannel = channelsCreate(newUser.token, 'channel1', true);
    const res = channelDetails(newUser.token, newChannel.channelId);

    expect(res).toStrictEqual({
      name: 'channel1',
      isPublic: true,
      ownerMembers: [
        {
          uId: newUser.authUserId,
          email: 'adabob@email.com',
          nameFirst: 'Ada',
          nameLast: 'Bob',
          handleStr: 'adabob',
        },
      ],
      allMembers: [
        {
          uId: newUser.authUserId,
          email: 'adabob@email.com',
          nameFirst: 'Ada',
          nameLast: 'Bob',
          handleStr: 'adabob',
        }
      ]
    })
  });

  test('channelDetails: channelId does not refer to valid channel', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newChannel = channelsCreate(newUser.token, 'channel1', true);
    const res = channelDetails(newUser.token, newChannel + 5);

    expect(res).toMatchObject({ error: 'error' });
  });

  test('channelDetails: channelId valid, but user is not a member', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newChannel = channelsCreate(newUser.token, 'channel1', true);
    const res = channelDetails(newUser.token.concat('abcd'), newChannel);

    expect(res).toMatchObject({ error: 'error' });
  });

  test('Test successful channelJoin', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newChannel = channelsCreate(newUser.token, 'channel1', true);
    const newUser2 = authRegister('oceanhall@email.com', '234567', 'Ocean', 'Hall');
    const res = channelJoin(newUser2.token, newChannel);
    const channelDetail = channelDetails(newUser2.token, newChannel);

    expect(channelDetail.allMembers.length).toEqual(2);
  });

  test('channelJoin: channelId does not refer to a valid channel', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newChannel = channelsCreate(newUser.token, 'channel1', true);
    const newUser2 = authRegister('oceanhall@email.com', '234567', 'Ocean', 'Hall');
    const res = channelJoin(newUser2.token, newChannel + 5);

    expect(res).toMatchObject({ error: 'error' });
  });

  test('channelJoin: authorised user is already a member', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newChannel = channelsCreate(newUser.token, 'channel1', true);
    const newUser2 = authRegister('oceanhall@email.com', '234567', 'Ocean', 'Hall');
    channelJoin(newUser2.token, newChannel);
    const res = channelJoin(newUser2.token, newChannel);

    expect(res).toMatchObject({ error: 'error' });
  });

  test('channelJoin: channelId refers to private channel and authorised user is not channel member and not global owner', () => {
    const newUser = authRegister('adabob@email.com', '123456', 'Ada', 'Bob');
    const newChannel = channelsCreate(newUser.token, 'channel1', false);
    const newUser2 = authRegister('oceanhall@email.com', '234567', 'Ocean', 'Hall');
    const res = channelJoin(newUser2.token, newChannel);

    expect(res).toMatchObject({ error: 'error' });
  });
});
