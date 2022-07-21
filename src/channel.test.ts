import request from 'sync-request';
import { url, port } from './config.json';
import { createBasicAccount, createBasicAccount2, clear } from './auth.test';
import { createBasicChannel } from './channels.test';

const OK = 200;

beforeEach(() => {
  clear();
});

describe('HTTP tests using Jest', () => {
  // test('Testing successful channel details', () => {
  //   const basicA = createBasicAccount();
  //   const newUser = JSON.parse(String(basicA.getBody()));
  //   const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
  //   const newChannel = JSON.parse(String(basicC.getBody()));
  //   const res = request(
  //     'GET',
  //     `${url}:${port}/channel/details/v2`,
  //     {
  //       qs: {
  //         token: '1',
  //         channelId: 1,
  //       },
  //     }
  //   );
  //   console.log(res);
  //   expect(res.statusCode).toBe(OK);
  //   //expect(res).toMatchObject({ error: 'error' });
  // });

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

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  test('channelDetails: channelId valid, but user is not a member', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));
    const res = request(
      'GET',
      `${url}:${port}/channel/details/v2`,
      {
        qs: {
          token: newUser.token[0].concat('abc'),
          channelId: newChannel.channelId,
        },
      }
    );

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  test('Testing successful channelJoin', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    const res = request(
      'POST',
      `${url}:${port}/channel/join/v2`,
      {
        body: JSON.stringify({
          token: newUser2.token[0],
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
    const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
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
    const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    request(
      'POST',
      `${url}:${port}/channel/join/v2`,
      {
        body: JSON.stringify({
          token: newUser2.token[0],
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
          token: newUser2.token[0],
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
    const basicC = createBasicChannel(newUser.token[0], 'channel1', false);
    const newChannel = JSON.parse(String(basicC.getBody()));

    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));

    const res = request(
      'POST',
      `${url}:${port}/channel/join/v2`,
      {
        body: JSON.stringify({
          token: newUser2.token[0],
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

  // tests for channel/leave
  // describe('channelLeaveV1 tests', () => {
  //   test('Channel successfully left', () => {

  //     const basicA = createBasicAccount();
  //     const newUser = JSON.parse(String(basicA.getBody()));
  //     const res3 = request(
  //       'POST',
  //       `${url}:${port}/channels/create/v2`,
  //       {
  //         body: JSON.stringify({
  //           token: '1',
  //           name: 'Snickers',
  //           isPublic: true,
  //         }),
  //         headers: {
  //           'Content-type': 'application/json',
  //         },
  //       }
  //     );
  //     const newChannel = JSON.parse(String(res3.getBody()));

  //     const res = request(
  //       'POST',
  //       `${url}:${port}/channel/leave/v1`,
  //       {
  //         body: JSON.stringify({
  //           token: newUser.token[0],
  //           channelId: newChannel.channelId,
  //         }),
  //         headers: {
  //           'Content-type': 'application/json',
  //         },
  //       }
  //     );

  //     const bodyObj = JSON.parse(String(res.getBody()));
  //     expect(res.statusCode).toBe(OK);
  //     expect(bodyObj).toMatchObject({});

  // // account 1
  // createBasicAccount();
  // //  account 2
  // const res2 = request(
  //   'POST',
  //   `${url}:${port}/auth/register/v2`,
  //   {
  //     body: JSON.stringify({
  //       email: 'hello@gmail.com',
  //       password: 'z5312386',
  //       nameFirst: 'Taylor',
  //       nameLast: 'Swift'
  //     }),
  //     headers: {
  //       'Content-type': 'application/json',
  //     },
  //   }
  // );

  // // create channel
  // const res3 = request(
  //   'POST',
  //   `${url}:${port}/channels/create/v2`,
  //   {
  //     body: JSON.stringify({
  //       token: '1',
  //       name: 'Snickers',
  //       isPublic: true,
  //     }),
  //     headers: {
  //       'Content-type': 'application/json',
  //     },
  //   }
  // );
  // const res4 = request(
  //   'POST',
  //   `${url}:${port}/channel/join/v2`,
  //   {
  //     body: JSON.stringify({
  //       token: '1',
  //       channelId: 1
  //     }),
  //     headers: {
  //       'Content-type': 'application/json',
  //     },
  //   }
  // );
  // const bodyObj1 = JSON.parse(String(res4.getBody()));
  // expect(res2.statusCode).toBe(OK);
  // expect(res3.statusCode).toBe(OK);
  // expect(res4.statusCode).toBe(OK);
  // expect(bodyObj1).toMatchObject({});
  // // channel leave test
  // const res5 = request(
  //   'POST',
  //   `${url}:${port}/channel/leave/v1`,
  //   {
  //     body: JSON.stringify({
  //       token: '1',
  //       channelId: 1
  //     }),
  //     headers: {
  //       'Content-type': 'application/json',
  //     },
  //   }
  // );
  // const bodyObj2 = JSON.parse(String(res5.getBody()));
  // expect(res5.statusCode).toBe(OK);
  // expect(bodyObj2).toMatchObject({});
  // });
});
