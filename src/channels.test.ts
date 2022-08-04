import { newReg, createBasicAccount, clear } from './helperFunctions';
import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

export function createBasicChannel(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
        `${url}:${port}/channels/create/v2`,
        {
          body: JSON.stringify({
            name: name,
            isPublic: isPublic,
          }),
          headers: {
            'Content-type': 'application/json',
            token: token
          },
        }
  );
  return res;
}

beforeEach(() => {
  clear();
});

describe('ChannelsCreateV1 returns correct data information', () => {
  test('Channel is created', () => {
    const user = createBasicAccount();
    const userBody = JSON.parse(String(user.getBody()));
    // console.log(userBody)
    // const user = authRegisterV1('test@gmail.com', 'hello', 'kesha', 'freeman');
    const res = createBasicChannel(userBody.token, 'Snickers', true);
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({
      channelId: expect.any(Number),
    });
  });

  test('Error', () => {
    const user = createBasicAccount();
    const userBody = JSON.parse(String(user.getBody()));
    const res = createBasicChannel(userBody.token, '', true);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });
});

describe('test for channel for list/listall', () => {
  let userA: any;
  let userAToken: string;

  test('channels list test success', () => {
    // register user A
    const basicA = newReg('zachary-chan@gmail.com', 'z5312386', 'Zach', 'Chan');
    userA = JSON.parse(String(basicA.getBody()));
    userAToken = userA.token;

    // create public channel
    const nameA = 'rick-public-channel';
    createBasicChannel(userA.token, nameA, true);
    // publicChannelId = JSON.parse(String(channel.getBody())).channelId;

    // create public channel
    const nameB = 'rick-private-channel';
    createBasicChannel(userA.token, nameB, false);
    // privateChannelId = JSON.parse(String(channel2.getBody())).channelId;
    const res = request(
      'GET',
      `${url}:${port}/channels/list/v3`,
      {
        headers: { token: userAToken }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ channels: expect.any(Object) });
  });

  test('channels listall test success', () => {
    // register user A
    const basicA = newReg('zachary-chan@gmail.com', 'z5312386', 'Zach', 'Chan');
    userA = JSON.parse(String(basicA.getBody()));
    userAToken = userA.token;

    // create public channel
    const nameA = 'rick-public-channel';
    createBasicChannel(userA.token, nameA, true);
    // publicChannelId = JSON.parse(String(channel.getBody())).channelId;

    // create public channel
    const nameB = 'rick-private-channel';
    createBasicChannel(userA.token, nameB, false);
    // privateChannelId = JSON.parse(String(channel2.getBody())).channelId;

    const res = request(
      'GET',
      `${url}:${port}/channels/listall/v3`,
      {
        headers: { token: userAToken }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ channels: expect.any(Object) });
  });
});
