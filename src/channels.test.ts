// import { channelsListV1 } from './channels';
import { createBasicAccount, clear, createBasicAccount2 } from './helperFunctions';
import request from 'sync-request';
import config from './config.json';
import { channelsListV1 } from './channels';

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

describe('Functionality tests of channelsListV1', () => {
  test('test if it lists all authorised users that is part of', () => {
    clear();
    const newUser = JSON.parse(String(createBasicAccount().getBody()));
    createBasicChannel(newUser.token, 'Snickers', true);
    // const user = authRegisterV1('test@gmail.com', 'hello', 'kesha', 'freeman');
    // create channel
    // call channelslistV1
    const res = request(
      'GET',
            `${url}:${port}/channels/list/v2`,
            {
              qs: {
                token: newUser.token,
              }
            });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
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
    const newUser = JSON.parse(String(createBasicAccount().getBody()));
    const newUser2 = JSON.parse(String(createBasicAccount2().getBody()));
    createBasicChannel(newUser.token, 'channel1', true);
    createBasicChannel(newUser2.token, 'channel2', true);

    const res = request(
      'GET',
            `${url}:${port}/channels/listall/v2`,
            {
              qs: {
                token: newUser.token,
              }
            });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
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
