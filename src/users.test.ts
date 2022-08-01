import request from 'sync-request';
import { createBasicChannel } from './channels.test';
import { url, port } from './config.json';
import { createBasicAccount, createBasicAccount2, clear, changeName, changeEmail, newReg, requestUsersAll,
        requestUploadPhoto, requestUserStats, requestUsersStats, requestUserRemove, createBasicDm, requestSendDm } from './helperFunctions';

const OK = 200;

beforeEach(() => {
  clear();
});

function getallUsers() {
  const res = request(
    'GET',
    `${url}:${port}/users/all/v1`,
    {
      qs: {
        token: '1',
      },
    }
  );
  return res;
}

describe('HTTP tests using Jest', () => {
  test('Test successful usersAll', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));
    
    const res = requestUsersAll(newUser.token);
    
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({
      users: [{
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
      }]
    });
  });

  // test('Removed user is unseen', () => {
  //   const basicA = createBasicAccount();
  //   const newUser = JSON.parse(String(basicA.getBody()));
  //   requestUserRemove(newUser.token, newUser.authUserId);
  //   const res = requestUsersAll(newUser.token);
  //   const bodyObj = JSON.parse(res.body as string);
  //   console.log(bodyObj);
  // });
});
// zachs tests for setname, setemail and sethandle
describe('update name', () => {
  test('Changing name', () => {
    // owner
    const basic = createBasicAccount();
    const newUser = JSON.parse(String(basic.getBody()));
    // user2
    createBasicAccount2();
    // calling the setname route
    const res = changeName(newUser.token[0], 'tiktok', 'onTheClock');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({});
    const res2 = getallUsers();

    const userBody = JSON.parse(String(res2.getBody()));
    expect(res2.statusCode).toBe(OK);
    expect(userBody).toStrictEqual({
      users: [{
        uId: 1,
        email: 'zachary-chan@gmail.com',
        nameFirst: 'tiktok',
        nameLast: 'onTheClock',
        handleStr: 'zacharychan',
      },
      {
        uId: 2,
        email: 'zachary-chan2@gmail.com',
        nameFirst: 'Zachary2',
        nameLast: 'Chan2',
        handleStr: 'zachary2chan2',
      }]
    });
  });

  test('Either nameFirst or nameLast is not between 1-50 chars', () => {
    const basic = createBasicAccount();
    const newUser = JSON.parse(String(basic.getBody()));
    // user2
    createBasicAccount2();
    // calling the setname route with bad nameFirst
    const res = changeName(newUser.token[0], '', 'zachary');

    const bodyObj = JSON.parse(String(res.getBody()));

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
    // calling the setname route with bad nameLast
    const res2 = changeName(newUser.token[0], 'zachary', '');
    const bodyObj2 = JSON.parse(String(res.getBody()));
    expect(res2.statusCode).toBe(OK);
    expect(bodyObj2).toMatchObject({ error: expect.any(String) });
  });
});

describe('SetEmail http route tests', () => {
  test('Changing email valid', () => {
    // owner
    const basic = createBasicAccount();
    const newUser = JSON.parse(String(basic.getBody()));
    // user1
    createBasicAccount2();
    const res = changeEmail(newUser.token[0], 'newemail@gmail.com');
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({});
    const res2 = getallUsers();

    const userBody = JSON.parse(String(res2.getBody()));
    expect(res2.statusCode).toBe(OK);
    expect(userBody).toStrictEqual({
      users: [{
        uId: 1,
        email: 'newemail@gmail.com',
        nameFirst: 'Zachary',
        nameLast: 'Chan',
        handleStr: 'zacharychan',
      },
      {
        uId: 2,
        email: 'zachary-chan2@gmail.com',
        nameFirst: 'Zachary2',
        nameLast: 'Chan2',
        handleStr: 'zachary2chan2',
      }]
    });
  });
  test('Invalid Email', () => {
    // owner
    const basic = createBasicAccount();
    const newUser = JSON.parse(String(basic.getBody()));
    // user1
    createBasicAccount2();
    const res = changeEmail(newUser.token[0], 'newemail');
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });
  test('email already being used', () => {
    // owner
    const basic = newReg('zachary@gmail.com', 'password', 'zach', 'chan');
    const newUser = JSON.parse(String(basic.getBody()));
    // user1
    newReg('zachary1234@gmail.com', 'password', 'aaazach', 'aaachan');
    const res = changeEmail(newUser.token[0], 'zachary1234@gmail.com');
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });
});

describe('setHandle http route tests', () => {
  // test('Changing handle', () => {
  //   clear();
  //   const basic = newReg('zachary@gmail.com', 'password', 'Zachary', 'Chan');
  //   const newUser = JSON.parse(String(basic.getBody()));
  //   // user1
  //   newReg('zachary1234@gmail.com', 'password', 'aaazach', 'aaachan');
  //   const res = changeHandle(newUser.token[0], 'newhandle');
  //   const bodyObj = JSON.parse(String(res.getBody()));
  //   expect(res.statusCode).toBe(OK);
  //   expect(bodyObj).toMatchObject({});
  //   const res2 = getallUsers();

  //   const userBody = JSON.parse(String(res2.getBody()));
  //   expect(res2.statusCode).toBe(OK);
  //   expect(userBody).toStrictEqual({
  //     users: [{
  //       uId: 1,
  //       email: 'zachary@gmail.com',
  //       nameFirst: 'Zachary',
  //       nameLast: 'Chan',
  //       handleStr: 'zacharychan',
  //     },
  //     {
  //       uId: 2,
  //       email: 'zachary1234@gmail.com',
  //       nameFirst: 'aaazach',
  //       nameLast: 'aaachan',
  //       handleStr: 'newhandle',
  //     }]
  //   });
  // });
});

// describe('uploadPhoto tests using Jest', () => {
//   test('Test successful uploadPhoto', () => {
//     const res = requestUploadPhoto('http://images.all-free-download.com/images/graphiclarge/landscapes_landscape_see_263354.jpg', 0, 0, 100, 100);
//     const bodyObj = JSON.parse(String(res.getBody()));
//     expect(res.statusCode).toBe(OK);
//     expect(bodyObj).toMatchObject({});
//   });

//   test('imgUrl returns HTTP status code error', () => {
//     const res = requestUploadPhoto('https://images.all-free-download.com/images/graphiclarge/landscapes_landscape_see_263354.jpg', 0, 0, 100, 100);
//     const bodyObj = JSON.parse(String(res.getBody()));
//     expect(res.statusCode).toBe(400);
//   });

//   test('coordinates are not within dimensions of url image', () => {
//     const res = requestUploadPhoto('http://images.all-free-download.com/images/graphiclarge/landscapes_landscape_see_263354.jpg', 0, 0, 100000, 100000);
//     const bodyObj = JSON.parse(String(res.getBody()));
//     expect(res.statusCode).toBe(400);
//   });

//   test('xEnd <= xStart or yEnd <= yStart', () => {
//     const res = requestUploadPhoto('http://images.all-free-download.com/images/graphiclarge/landscapes_landscape_see_263354.jpg', 100, 500, 20, 30);
//     const bodyObj = JSON.parse(String(res.getBody()));
//     expect(res.statusCode).toBe(400);
//   });

//   test('Image is not JPG', () => {
//     const res = requestUploadPhoto('http://www.pngmart.com/files/5/Landscape-PNG-File.png', 0, 0, 100, 100);
//     const bodyObj = JSON.parse(String(res.getBody()));
//     expect(res.statusCode).toBe(400);
//   });
// });


describe('userStats & usersStats tests using Jest', () => {
  test('Test successful userStats', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const res = requestUserStats(newUser.token);
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({
      channelsJoined: [{
        numChannelsJoined: 0,
        timeStamp: expect.any(Number),
      }],
      dmsJoined: [{
        numDmsJoined: 0,
        timeStamp: expect.any(Number),
      }],
      messagesSent: [{
        numMessagesSent: 0,
        timeStamp: expect.any(Number),
      }],
      involvementRate: 0,
    })
  });

  test('Test successful userStats 2', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));

    createBasicChannel(newUser.token, 'channel1', true);
    const newDm = JSON.parse(String(createBasicDm(newUser.token, [newUser.authUserId]).getBody()));
    for (let i = 0; i < 12; i++) {
      requestSendDm(newUser.token, newDm.dmId, 'Hey');
    }

    const res = requestUserStats(newUser.token);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({
      channelsJoined: [{
        numChannelsJoined: 1,
        timeStamp: expect.any(Number),
      }],
      dmsJoined: [{
        numDmsJoined: 1,
        timeStamp: expect.any(Number),
      }],
      messagesSent: [{
        numMessagesSent: 12,
        timeStamp: expect.any(Number),
      }],
      involvementRate: 1,
    })
  });

  test('Test successful usersStats', () => {
    const res = requestUsersStats();
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({
      channelsExist: [{
        numChannelsExist: expect.any(Number),
        timeStamp: expect.any(Number),
      }],
      dmsExist: [{
        numDmsExist: expect.any(Number),
        timeStamp: expect.any(Number),
      }],
      messagesExist: [{
        numMessagesExist: expect.any(Number),
        timeStamp: expect.any(Number),
      }],
      utilizationRate: expect.any(Number),
    })
  });
});