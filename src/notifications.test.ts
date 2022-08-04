import request from 'sync-request';
import config from './config.json';
import { newReg, clear, createBasicDm } from './helperFunctions';

const OK = 200;
const port = config.port;
const url = config.url;

describe('notification', () => {
  test('Ensuring a unique number is returned', () => {
    clear();
    // create user
    const res = newReg('zachary-chan@gmail.com', 'z5312386', 'Zach', 'Chan');
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({
      authUserId: expect.any(Number),
      token: expect.any(String)
    });
    // create user 2
    const res2 = newReg('zhello@gmail.com', 'z5312386', 'omg', 'hiiiii');
    const bodyObj2 = JSON.parse(String(res2.getBody()));
    expect(res2.statusCode).toBe(OK);
    expect(bodyObj2).toMatchObject({
      authUserId: expect.any(Number),
      token: expect.any(String)
    });

    // create user 3
    const res3 = newReg('tswifty@gmail.com', 'z5312386', 'Rick', 'andMorty');
    const bodyObj3 = JSON.parse(String(res3.getBody()));
    expect(res3.statusCode).toBe(OK);
    expect(bodyObj3).toMatchObject({
      authUserId: expect.any(Number),
      token: expect.any(String)
    });
    // create dm from user 1
    const res4 = createBasicDm(bodyObj.token, [bodyObj.authUserId, bodyObj3.authUserId]);
    const bodyObj4 = JSON.parse(String(res4.getBody()));
    expect(res4.statusCode).toBe(OK);
    expect(bodyObj4).toMatchObject({ dmId: expect.any(Number) });
    // create dm from user 2
    const res5 = createBasicDm(bodyObj2.token, [bodyObj2.authUserId, bodyObj3.authUserId]);
    const bodyObj5 = JSON.parse(String(res5.getBody()));
    expect(res5.statusCode).toBe(OK);
    expect(bodyObj5).toMatchObject({ dmId: expect.any(Number) });

    const resNotif = request(
      'GET',
            `${url}:${port}/notifications/get/v1`,
            {
              qs: {
              },
              headers: {
                // user 1 token
                token: bodyObj3.token,
              }
            }
    );
    const resNotifBody = JSON.parse(String(resNotif.getBody()));
    expect(resNotifBody).toMatchObject([
      {
        channelId: -1,
        dmId: 2,
        notificationMessage: 'omghiiiii added you to omghiiiii, rickandmorty'
      },
      {
        channelId: -1,
        dmId: 1,
        notificationMessage: 'zachchan added you to rickandmorty, zachchan'
      }
    ]);
  });
});
