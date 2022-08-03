import { createBasicAccount, clear } from './helperFunctions';
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

describe('ChannelsCreateV1 returns correct data information', () => {
  test('Channel is created', () => {
    clear();
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
    clear();
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
  beforeAll(() => {
    clear();
    // register user A
    const basicA = createBasicAccount();
    userA = JSON.parse(String(basicA.getBody()));
    userAToken = userA.token[0];

    // create public channel
    createBasicChannel(userA.token[0], userA.name + '-public-channel', true);
    // publicChannelId = JSON.parse(String(channel.getBody())).channelId;

    // create public channel
    createBasicChannel(userA.token[0], userA.name + '-private-channel', false);
    // privateChannelId = JSON.parse(String(channel2.getBody())).channelId;
  });

  test('channels list test success', () => {
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
