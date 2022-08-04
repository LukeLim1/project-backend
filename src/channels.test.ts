<<<<<<< HEAD
// import { channelsListV1 } from './channels';
import { createBasicAccount, clear, createBasicAccount2 } from './helperFunctions';
=======
import { newReg, createBasicAccount, clear } from './helperFunctions';
>>>>>>> ad72230918a09054e076d0e077b30d8549f0468a
import request from 'sync-request';
import config from './config.json';
import { channelsListV1 } from './channels';

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

<<<<<<< HEAD
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
=======
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
>>>>>>> ad72230918a09054e076d0e077b30d8549f0468a
  });
});
