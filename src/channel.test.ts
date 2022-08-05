// import request from 'sync-request';
import { newReg, createBasicAccount, createBasicAccount2, leaveChannel, requestJoinChannel, clear, requestChannelDetails, createBasicChannel, getRequest, messageSendV2 } from './helperFunctions';
// import { join } from 'path';

const OK = 200;
// const Error400 = 400;
// const Error403 = 403;

beforeEach(() => {
  clear();
});

describe('HTTP tests using Jest', () => {
  test('Testing successful single channel details', () => {
    const newUser = JSON.parse(String(createBasicAccount().getBody()));
    const basicC = createBasicChannel(newUser.token, 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));

    const res = requestChannelDetails(newUser.token, newChannel.channelId);

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

  test('Testing successful multiple channel details', () => {
    const newUser = JSON.parse(String(createBasicAccount().getBody()));
    const newUser2 = JSON.parse(String(createBasicAccount2().getBody()));
    const basicC = createBasicChannel(newUser.token, 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));

    requestJoinChannel(newUser2.token, newChannel.channelId);
    const res = requestChannelDetails(newUser.token, newChannel.channelId);

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
      },
      {
        uId: newUser2.authUserId,
        email: 'zachary-chan2@gmail.com',
        nameFirst: 'Zachary2',
        nameLast: 'Chan2',
        handleStr: 'zachary2chan2',
      }],
    });
  });

  test('channelDetails: channelId does not refer to valid channel', () => {
    const newUser = JSON.parse(String(createBasicAccount().getBody()));
    const basicC = createBasicChannel(newUser.token, 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));
    const res = requestChannelDetails(newUser.token, newChannel.channelId + 5);

    expect(res.statusCode).toBe(400);
  });

  test('channelDetails: channelId valid, but user is not a member', () => {
    const newUser = JSON.parse(String(createBasicAccount().getBody()));
    const newUser2 = JSON.parse(String(createBasicAccount2().getBody()));
    const basicC = createBasicChannel(newUser.token, 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));
    const res = requestChannelDetails(newUser2.token, newChannel.channelId);

    expect(res.statusCode).toBe(403);
  });

  test('channelJoin: channelId does not refer to a valid channel', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token, 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    const res = requestJoinChannel(newUser2.token, newChannel.channelId + 5);
    expect(res.statusCode).toBe(400);
  });

  test('channelJoin: authorised owner is already a member', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token, 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));

    const res = requestJoinChannel(newUser.token, newChannel.channelId);
    expect(res.statusCode).toBe(400);
  });

  test('channelJoin: authorised user is already a member', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token, 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    const res1 = requestJoinChannel(newUser2.token, newChannel.channelId);
    const res2 = requestJoinChannel(newUser2.token, newChannel.channelId);

    expect(res1.statusCode).toBe(OK);
    expect(res2.statusCode).toBe(400);
  });

  test('channelJoin: channelId refers to private channel and authorised user is not channel member and not global owner', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token, 'channel1', false);
    const newChannel = JSON.parse(String(basicC.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    const res = requestJoinChannel(newUser2.token, newChannel.channelId);

    expect(res.statusCode).toBe(403);
  });
});

function channelInviteV3(token: string, channelId: number, uId: number) {
  return getRequest(
    'POST',
    '/channel/invite/v3',
    {
      channelId,
      uId,
    },
    { token }
  );
}

function channelMessagesV3(token: string, channelId: number, start: number) {
  return getRequest(
    'GET',
    '/channel/messages/v3',
    {
      channelId,
      start,
    },
    { token }
  );
}

function channelAddownerV2(token: string, channelId: number, uId: number) {
  return getRequest(
    'POST',
    '/channel/addowner/v2',
    {
      channelId, uId
    },
    { token }
  );
}

function channelRemoveownerV2(token: string, channelId: number, uId: number) {
  return getRequest(
    'POST',
    '/channel/removeowner/v2',
    {
      channelId, uId
    },
    { token }
  );
}

describe('test for channelInviteV3', () => {
  let token: string,
    authUserId: number,
    uId: number,
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
    authUserId = registerRes1.authUserId;
    uId = registerRes2.authUserId;
    const channelRes = createBasicChannel(token, 'star', true);
    channelId = JSON.parse(String(channelRes.getBody())).channelId;
  });
  describe('error case', () => {
    test('channel id invalid', () => {
      expect(channelInviteV3(token, channelId + 1, uId).statusCode).toStrictEqual(400);
    });

    test('uId is already a member', () => {
      expect(channelInviteV3(token, channelId, authUserId).statusCode).toStrictEqual(400);
    });

    test('uId error', () => {
      expect(channelInviteV3(token, channelId, uId + 1).statusCode).toStrictEqual(400);
    });

    test('uId not a member', () => {
      expect(channelInviteV3(token2, channelId, uId).statusCode).toStrictEqual(403);
    });
  });

  describe('No errors', () => {
    test('Invite successfully', () => {
      expect(channelInviteV3(token, channelId, uId)).toStrictEqual({});
    });
  });
});

describe('channelMessagesV3', () => {
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
    messageSendV2(token, channelId, '123123');
  });
  describe('error case', () => {
    test('channelId does not refer to a valid channel', () => {
      expect(channelMessagesV3(token, channelId + 999, 0).statusCode).toStrictEqual(400);
    });

    test('start is greater than the total number of messages in the channel', () => {
      expect(channelMessagesV3(token, channelId, 100).statusCode).toStrictEqual(400);
    });

    test('channelId is valid and the authorised user is not a member of the channel', () => {
      expect(channelMessagesV3(token2, channelId, 0).statusCode).toStrictEqual(403);
    });
  });
  describe('No errors', () => {
    test('send message success', () => {
      expect(channelMessagesV3(token, channelId, 0)).toStrictEqual({
        end: -1,
        messages: [
          {
            isPinned: false,
            message: '123123',
            messageId: expect.any(Number),
            reacts: [],
            timeSent: expect.any(Number),
            uId: 1,
          },
        ],
        start: 0,
      });
    });
  });
});

describe('channelAddownerV2', () => {
  let token: string,
    uId: number,
    token2: string,
    channelId: number,
    authUserId:number;
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
    authUserId = registerRes2.authUserId;
    uId = registerRes2.authUserId;
    const channelRes = createBasicChannel(token, 'star', true);
    channelId = JSON.parse(String(channelRes.getBody())).channelId;
  });
  describe('error case', () => {
    test('channelId does not refer to a valid channel', () => {
      expect(channelAddownerV2(token, channelId + 999, uId).statusCode).toStrictEqual(400);
    });

    test('uId does not refer to a valid user', () => {
      expect(channelAddownerV2(token, channelId, uId + 123).statusCode).toStrictEqual(400);
    });

    test('uId refers to a user who is not a member of the channel', () => {
      expect(channelAddownerV2(token, channelId, uId).statusCode).toStrictEqual(400);
    });

    test('uId refers to a user who is already an owner of the channel', () => {
      expect(channelAddownerV2(token, channelId, authUserId).statusCode).toStrictEqual(400);
    });

    test('channelId is valid and the authorised user does not have owner permissions in the channel', () => {
      channelInviteV3(token, channelId, uId);
      expect(channelAddownerV2(token2, channelId, uId).statusCode).toStrictEqual(403);
    });
  });
  describe('No errors', () => {
    test('send message success', () => {
      channelInviteV3(token, channelId, uId);
      expect(channelAddownerV2(token, channelId, uId)).toStrictEqual({});
    });
  });
});

describe('channelLeaveV1 tests', () => {
  test('Channel successfully left', () => {
    // account 1
    const basicA = newReg('zachary-chan@gmail.com', 'z5312386', 'Zach', 'Chan');
    const newUser = JSON.parse(String(basicA.getBody()));
    //  account 2
    const res2 = newReg('hello@gmail.com', 'z5312386', 'Taylor', 'Swift');
    const res2Body = JSON.parse(String(res2.getBody()));

    expect(res2.statusCode).toBe(OK);

    const basicC = createBasicChannel(newUser.token, 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));

    // join a channel
    const res4 = requestJoinChannel(res2Body.token, newChannel.channelId);

    const bodyObj1 = JSON.parse(String(res4.getBody()));
    expect(res4.statusCode).toBe(OK);
    expect(bodyObj1).toMatchObject({});
    // channel leave test
    const res5 = leaveChannel(newUser.token, newChannel.channelId);

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
    const res2Body = JSON.parse(String(res2.getBody()));
    // account 3 not apart of the channel
    const new1 = newReg('test@gmail.com', 'fail1234', 'failure', 'ofATest');
    const failUser = JSON.parse(String(new1.getBody()));

    expect(res2.statusCode).toBe(OK);

    const basicC = createBasicChannel(newUser.token, 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));

    // join a channel
    const res4 = requestJoinChannel(res2Body.token, newChannel.channelId);

    const bodyObj1 = JSON.parse(String(res4.getBody()));
    expect(res4.statusCode).toBe(OK);
    expect(bodyObj1).toMatchObject({});

    // channel leave  'CHANNELID DOES NOT REFER TO A VALID CHANNEL'
    const res5 = leaveChannel(newUser.token, newChannel.channelId + 99999);
    expect(res5).toHaveProperty('statusCode', 400);

    // channel leave 'AUTHORISED USER NOT A MEMBER OF A VALID CHANNEL
    // account not part of channel
    // channel leave
    const res6 = leaveChannel(failUser.token[0], newChannel.channelId);
    expect(res6).toHaveProperty('statusCode', 403);
  });
});

describe('channelRemoveownerV2', () => {
  let token: string,
    uId: number,
    token3:string,
    channelId: number,
    authUserId:number;
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
    const regist3 = newReg(
      'oldsoul0912@gmail.com',
      'hithisbob14',
      'Doctor',
      'Who'
    );
    const registerRes3 = JSON.parse(String(regist3.getBody()));
    const registerRes2 = JSON.parse(String(regist2.getBody()));
    token = registerRes1.token;
    token3 = registerRes3.token;
    authUserId = registerRes2.authUserId;
    uId = registerRes2.authUserId;
    const channelRes = createBasicChannel(token, 'star', true);
    channelId = JSON.parse(String(channelRes.getBody())).channelId;
  });
  describe('error case', () => {
    test('channelId does not refer to a valid channel', () => {
      expect(channelRemoveownerV2(token, channelId + 999, uId).statusCode).toStrictEqual(400);
    });

    test('uId does not refer to a valid user', () => {
      expect(channelRemoveownerV2(token, channelId, uId + 123).statusCode).toStrictEqual(400);
    });

    test('uId refers to a user who is not an owner of the channel', () => {
      expect(channelRemoveownerV2(token, channelId, uId).statusCode).toStrictEqual(400);
    });

    test('uId refers to a user who is currently the only owner of the channel', () => {
      expect(channelRemoveownerV2(token, channelId, authUserId).statusCode).toStrictEqual(400);
    });

    test('channelId is valid and the authorised user does not have owner permissions in the channel', () => {
      channelInviteV3(token, channelId, uId);
      channelAddownerV2(token, channelId, uId);
      expect(channelRemoveownerV2(token3, channelId, uId).statusCode).toStrictEqual(403);
    });
  });
  describe('No errors', () => {
    test('send message success', () => {
      channelInviteV3(token, channelId, uId);
      channelAddownerV2(token, channelId, uId);
      expect(channelRemoveownerV2(token, channelId, uId)).toStrictEqual({});
    });
  });
});
