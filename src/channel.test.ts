import { channelDetailsV1, channelJoinV1, channelMessagesV1, channelInviteV1, channelLeaveV1 } from './channel';
import { channelsCreateV1 } from './channels';
import { authRegisterV1 } from './auth';
import { clearV1 } from './other';

import request from 'sync-request';
import { url, port } from './config.json';

const OK = 200;

function getBodyObj (url: string, qs: object) {
  const res = request(
    'GET',
    `${url}`,
    {
      qs: qs,
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  return bodyObj;
};


function postBodyObj (url: string, body: object) {
  const res = request(
    'POST',
    `${url}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  return bodyObj;
};

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
    clearV1();
    const res = request(
      'GET',
      `${url}:${port}/channel/details/v2`,
      {
        qs: {
          name: expect.any(String),
          isPublic: expect.any(Boolean),
          ownerMembers: expect.any(Array),
          allMembers: expect.any(Array),
        }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({
      name: expect.any(String),
      isPublic: expect.any(Boolean),
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });
  });

  test('channelDetails: channelId does not refer to valid channel', () => {
    clearV1();
    const res = request(
      'GET',
      `${url}:${port}/channel/details/v2`,
      {
        qs: {
          name: expect.any(String),
          isPublic: expect.any(Boolean),
          ownerMembers: expect.any(Array),
          allMembers: expect.any(Array),
        }
      }
    );
    
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: 'error' });
  });

  test('channelDetails: channelId valid, but user is not a member', () => {
    clearV1();
    const res = request(
      'GET',
      `${url}:${port}/channel/details/v2`,
      {
        qs: {
          name: expect.any(String),
          isPublic: expect.any(Boolean),
          ownerMembers: expect.any(Array),
          allMembers: expect.any(Array),
        }
      }
    );
    
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: 'error' });
  });

  test('Test successful channelJoin', () => {
    clearV1();
    const res = request(
      'POST',
      `${url}:${port}/channel/join/v2`,
      {
        body: JSON.stringify({
          token: expect.any(String),
          channelId: expect.any(Number),
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    console.log(bodyObj);
  });

  test('channelJoin: channelId does not refer to a valid channel', () => {
    clearV1();
    const res = request(
      'POST',
      `${url}:${port}/channel/join/v2`,
      {
        body: JSON.stringify({
          token: expect.any(String),
          channelId: expect.any(Number),
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: 'error' });
  });

  test('channelJoin: authorised user is already a member', () => {
    clearV1();
    const res = request(
      'POST',
      `${url}:${port}/channel/join/v2`,
      {
        body: JSON.stringify({
          token: expect.any(String),
          channelId: expect.any(Number),
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: 'error' });
  });

  test('channelJoin: channelId refers to private channel and authorised user is not channel member and not global owner', () => {
    clearV1();
    const res = request(
      'POST',
      `${url}:${port}/channel/join/v2`,
      {
        body: JSON.stringify({
          token: expect.any(String),
          channelId: expect.any(Number),
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: 'error' });
  });
});
