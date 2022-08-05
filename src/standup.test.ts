import { clear, createBasicChannel, getRequest, newReg } from './helperFunctions';

function standupStartV1(token: string, channelId: number, length: number) {
  return getRequest(
    'POST',
    '/standup/start/v1',
    {
      channelId, length
    },
    { token }
  );
}

function standupActiveV1(token:string, channelId:number) {
  return getRequest(
    'GET',
    '/standup/active/v1',
    {
      channelId
    },
    { token }
  );
}

function standupSendV1(token: string, channelId:number, message:string) {
  return getRequest(
    'POST',
    '/standup/send/v1',
    {
      channelId, message
    },
    { token }
  );
}

describe('test for standupStartV1', () => {
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
      expect(standupStartV1(token, channelId + 1, 1).statusCode).toStrictEqual(400);
    });

    test('length is a negative integer', () => {
      expect(standupStartV1(token, channelId, -1).statusCode).toStrictEqual(400);
    });

    test('an active standup is currently running in the channel', () => {
      standupStartV1(token, channelId, 5);
      expect(standupStartV1(token, channelId, 1).statusCode).toStrictEqual(400);
    });

    test('channelId is valid and the authorised user is not a member of the channel', () => {
      expect(standupStartV1(token2, channelId, 1).statusCode).toStrictEqual(403);
    });
  });

  describe('No errors', () => {
    test('send message success', () => {
      expect(standupStartV1(token, channelId, 2)).toStrictEqual({ timeFinish: expect.any(Number) });
    });
  });
});

describe('test for standupActiveV1', () => {
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
      expect(standupActiveV1(token, channelId + 1).statusCode).toStrictEqual(400);
    });

    test('channelId is valid and the authorised user is not a member of the channel', () => {
      expect(standupActiveV1(token2, channelId).statusCode).toStrictEqual(403);
    });
  });

  describe('No errors', () => {
    test('send message success', () => {
      expect(standupActiveV1(token, channelId)).toStrictEqual({ isActive: false, timeFinish: null });
      standupStartV1(token, channelId, 5);
      expect(standupActiveV1(token, channelId)).toStrictEqual({ isActive: true, timeFinish: expect.any(Number) });
    });
  });
});

describe('test for standupSendV1', () => {
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
      expect(standupSendV1(token, channelId + 1, '123123').statusCode).toStrictEqual(400);
    });

    test('length of message is over 1000 characters', () => {
      let message = '';
      for (let i = 0; i < 10012; i++) {
        message += '1';
      }
      expect(standupSendV1(token, channelId, message).statusCode).toStrictEqual(400);
    });

    test('an active standup is not currently running in the channel', () => {
      expect(standupSendV1(token, channelId, '123123').statusCode).toStrictEqual(400);
    });

    test('channelId is valid and the authorised user is not a member of the channel', () => {
      expect(standupSendV1(token2, channelId, '123123').statusCode).toStrictEqual(403);
    });
  });

  describe('No errors', () => {
    test('send message success', () => {
      standupStartV1(token, channelId, 5);
      expect(standupSendV1(token, channelId, '123123')).toStrictEqual({ });
    });
  });
});
