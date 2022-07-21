import { channelsListV1 } from './channels';
import { createBasicAccount, clear } from './auth.test';
import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;
beforeEach(() => {
  clear();
});

export function createBasicChannel(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    `${url}:${port}/channels/create/v2`,
    {
      body: JSON.stringify({
        token: token,
        name: name,
        isPublic: isPublic,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  return res;
}

describe('ChannelsCreateV1 returns correct data information', () => {
  test('Channel is created', () => {
    createBasicAccount();
    // const user = authRegisterV1('test@gmail.com', 'hello', 'kesha', 'freeman');
    const res = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: '1',
          name: 'Snickers',
          isPublic: true,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({
      channelId: expect.any(Number),
    });
  });
  test('Error', () => {
    createBasicAccount();
    // const user = authRegisterV1('test@gmail.com', 'hello', 'kesha', 'freeman');
    const res = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: '1',
          name: '',
          isPublic: true,
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
});

describe('Functionality tests of channelsListV1', () => {
  test('test if it lists all authorised users that is part of', () => {
    clear();
    createBasicAccount();
    // const user = authRegisterV1('test@gmail.com', 'hello', 'kesha', 'freeman');
    // create channel
    const res = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: '1',
          name: 'Snickers',
          isPublic: true,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const array = [res];
    array.slice(0);
    // call channelslistV1
    const res2 = request(
      'GET',
            `${url}:${port}/channels/list/v2`,
            {
              qs: {
                token: '1',
              }
            });
    const bodyObj = JSON.parse(res2.body as string);
    expect(res2.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ channels: [{ channelId: expect.any(Number), name: 'Snickers' }] });
  });

  test('Error if no channels', () => {
    clear();
    const res2 = request(
      'GET',
            `${url}:${port}/channels/list/v2`,
            {
              qs: {
                token: '1',
              }
            });
    const bodyObj = JSON.parse(res2.body as string);
    expect(res2.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ channels: [] });
    expect(channelsListV1('1')).toEqual({ channels: [] });
  });
});

describe('Functionality tests of channelsListallV1', () => {
  test('test if it lists all channels', () => {
    clear();
    // make a person
    createBasicAccount();
    createBasicAccount();
    // create channel 1
    const res1 = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: '1',
          name: 'channel1',
          isPublic: true,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    // create channel 2
    const res2 = request(
      'POST',
      `${url}:${port}/channels/create/v2`,
      {
        body: JSON.stringify({
          token: '1',
          name: 'channel2',
          isPublic: true,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const array = [res1, res2];
    array.slice(0);
    // call channels list all
    // call channelslistV1
    const res3 = request(
      'GET',
            `${url}:${port}/channels/listall/v2`,
            {
              qs: {
                token: '1',
              }
            });
    const bodyObj = JSON.parse(res3.body as string);
    expect(res3.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject(
      {
        channels: [
          {
            channelId: expect.any(Number),
            name: 'channel1',
          },

          {
            channelId: expect.any(Number),
            name: 'channel2',
          }
        ]
      });

    // test('test if when no channels', () => {
    //   clearV1();

  //   expect(channelsListallV1(1)).toEqual({ channels: [] });
  // });
  });
});
