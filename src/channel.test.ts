import request from 'sync-request';
import { url, port } from './config.json';
import { createBasicChannel } from './channels.test';
import { newReg, createBasicAccount, createBasicAccount2, leaveChannel, requestJoinChannel, clear, requestChannelDetails } from './helperFunctions';
// import { join } from 'path';

const OK = 200;
// const Error400 = 400;
// const Error403 = 403;

beforeEach(() => {
  clear();
});

describe('HTTP tests using Jest', () => {
  test('Testing successful single channel details', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
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
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicA2 = createBasicAccount2();
    const newUser2 = JSON.parse(String(basicA2.getBody()));
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
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token, 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));
    const res = requestChannelDetails(newUser.token, newChannel.channelId + 5);

    expect(res.statusCode).toBe(400);
  });

  test('channelDetails: channelId valid, but user is not a member', () => {
    const basicA = createBasicAccount();
    const newUser = JSON.parse(String(basicA.getBody()));
    const basicC = createBasicChannel(newUser.token, 'channel1', true);
    const newChannel = JSON.parse(String(basicC.getBody()));
    const res = requestChannelDetails(newUser.token.concat('abc'), newChannel.channelId);

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

// Not my tests; uncomment them!! /////////////////////////////////////////////////////////////////////////

//   // tests for channel/leave
//   describe('channelLeaveV1 tests', () => {
//     test('Channel successfully left', () => {
//       // account 1
//       const basicA = newReg('zachary-chan@gmail.com', 'z5312386', 'Zach', 'Chan');
//       const newUser = JSON.parse(String(basicA.getBody()));
//       //  account 2
//       const res2 = newReg('hello@gmail.com', 'z5312386', 'Taylor', 'Swift');

//       expect(res2.statusCode).toBe(OK);

//       const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
//       const newChannel = JSON.parse(String(basicC.getBody()));

//       // join a channel
//       const res4 = requestJoinChannel(newUser.token[0], newChannel.channelId);

//       const bodyObj1 = JSON.parse(String(res4.getBody()));
//       expect(res4.statusCode).toBe(OK);
//       expect(bodyObj1).toMatchObject({});

//       // channel leave test
//       const res5 = leaveChannel(newUser.token[0], newChannel.channelId);

//       const bodyObj2 = JSON.parse(String(res5.getBody()));
//       expect(res5.statusCode).toBe(OK);
//       expect(bodyObj2).toMatchObject({});
//     });

//     test('Channel leave failed', () => {
//       // account 1
//       const basicA = newReg('zachary-chan@gmail.com', 'z5312386', 'Zach', 'Chan');
//       const newUser = JSON.parse(String(basicA.getBody()));
//       //  account 2
//       const res2 = newReg('hello@gmail.com', 'z5312386', 'Taylor', 'Swift');
//       // account 3 not apart of the channel
//       const new1 = newReg('test@gmail.com', 'fail1234', 'failure', 'ofATest');
//       const failUser = JSON.parse(String(new1.getBody()));

//       expect(res2.statusCode).toBe(OK);

//       const basicC = createBasicChannel(newUser.token[0], 'channel1', true);
//       const newChannel = JSON.parse(String(basicC.getBody()));

//       // join a channel
//       const res4 = requestJoinChannel(newUser.token[0], newChannel.channelId);

//       const bodyObj1 = JSON.parse(String(res4.getBody()));
//       expect(res4.statusCode).toBe(OK);
//       expect(bodyObj1).toMatchObject({});

//       // channel leave  'CHANNELID DOES NOT REFER TO A VALID CHANNEL'
//       const res5 = leaveChannel(newUser.token[0], newChannel.channelId + 99999);
//       const bodyObj2 = JSON.parse(String(res5.getBody()));

//       // TO IMPLEMENT
//       // expect(res5.statusCode).toBe(Error400);
//       expect(bodyObj2).toMatchObject({ error: expect.any(String) });

//       // channel leave 'AUTHORISED USER NOT A MEMBER OF A VALID CHANNEL
//       // account not part of channel
//       // channel leave
//       const res6 = leaveChannel(failUser.token[0], newChannel.channelId);
//       const bodyObj3 = JSON.parse(String(res6.getBody()));
//       expect(bodyObj3).toMatchObject({ error: expect.any(String) });
//     });
//   });
// });

// // Tests for channelInviteV2
// describe('Test channel/invite/v2,successfully', () => {
//   test('If it returns {} successfully, otherwise {error:"error"}', () => {
//     const res = request(
//       'POST',
//       'http://localhost:3200/auth/register/v2',
//       {
//         json: {
//           email: 'uniquepeterrabbit5@gmail.com',
//           password: 'qgi6dt',
//           nameFirst: 'Peter',
//           nameLast: 'Rabbit'
//         },
//       }
//     );
//     const bodyObj = JSON.parse(String(res.getBody()));
//     const uID = bodyObj.authUserId;
//     const res2 = request(
//       'POST',
//       'http://localhost:3200/channels/create/v2',
//       {
//         json: {
//           token: String(uID),
//           name: 'channel005',
//           isPublic: true
//         },

//       }
//     );
//     const bodyObj2 = JSON.parse(String(res2.getBody()));
//     const channelID = bodyObj2.channelId;

//     const res3 = request(
//       'POST',
//       'http://localhost:3200/channel/invite/v2',
//       {
//         json: {
//           token: String(uID),
//           channelId: channelID,
//           uId: uID
//         },
//       }
//     );
//     const bodyObj3 = JSON.parse(String(res3.getBody()));
//     expect(bodyObj3).toMatchObject({});
//   });
// });
// // Tests for channelInviteV2
// describe('channelId does not refer to a valid channel, return {error:"error"} ', () => {
//   test('If it returns {} successfully, otherwise {error:"error"}', () => {
//     const res = request(
//       'POST',
//       'http://localhost:3200/auth/register/v2',
//       {
//         json: {
//           email: 'uniquepeterrabbit52@gmail.com',
//           password: 'qgi6dt',
//           nameFirst: 'Peter',
//           nameLast: 'Rabbit'
//         },
//       }
//     );
//     const bodyObj = JSON.parse(String(res.getBody()));
//     const uID = bodyObj.authUserId;
//     const res2 = request(
//       'POST',
//       'http://localhost:3200/channels/create/v2',
//       {
//         json: {
//           token: String(uID),
//           name: 'channel005',
//           isPublic: true
//         },
//       }
//     );
//     const bodyObj2 = JSON.parse(String(res2.getBody()));
//     const channelID = bodyObj2.channelId;

//     const res4 = request(
//       'POST',
//       'http://localhost:3200/channel/invite/v2',
//       {
//         json: {
//           token: String(uID),
//           channelId: channelID + 100,
//           uId: uID
//         },
//       }
//     );
//     const bodyObj4 = JSON.parse(String(res4.getBody()));
//     expect(bodyObj4).toMatchObject({ error: 'error' });
//   });
// });
// // Tests for channelInviteV2
// describe('uId does not refer to a valid user, return {error:"error"} ', () => {
//   test('If it returns {} successfully, otherwise {error:"error"}', () => {
//     const res = request(
//       'POST',
//       'http://localhost:3200/auth/register/v2',
//       {
//         json: {
//           email: 'uniquepeterrabbit53@gmail.com',
//           password: 'qgi6dt',
//           nameFirst: 'Peter',
//           nameLast: 'Rabbit'
//         },
//       }
//     );
//     const bodyObj = JSON.parse(String(res.getBody()));
//     const uID = bodyObj.authUserId;
//     const res2 = request(
//       'POST',
//       'http://localhost:3200/channels/create/v2',
//       {
//         json: {
//           token: String(uID),
//           name: 'channel005',
//           isPublic: true
//         },
//       }
//     );
//     const bodyObj2 = JSON.parse(String(res2.getBody()));
//     const channelID = bodyObj2.channelId;

//     const res5 = request(
//       'POST',
//       'http://localhost:3200/channel/invite/v2',
//       {
//         json: {
//           token: String(uID),
//           channelId: channelID,
//           uId: uID + 100
//         },
//       }
//     );

//     const bodyObj5 = JSON.parse(String(res5.getBody()));
//     expect(bodyObj5).toMatchObject({ error: 'error' });
//   });
// });
// // Tests for channelInviteV2
// describe('uId refers to a user who is already a member of the channel, return {error:"error"} ', () => {
//   test('If it returns {} successfully, otherwise {error:"error"}', () => {
//     const res = request(
//       'POST',
//       'http://localhost:3200/auth/register/v2',
//       {
//         json: {
//           email: 'uniquepeterrabbit55@gmail.com',
//           password: 'qgi6dt',
//           nameFirst: 'Peter',
//           nameLast: 'Rabbit'
//         },
//       }
//     );
//     const bodyObj = JSON.parse(String(res.getBody()));
//     const uID = bodyObj.authUserId;
//     const res2 = request(
//       'POST',
//       'http://localhost:3200/channels/create/v2',
//       {
//         json: {
//           token: String(uID),
//           name: 'channel005',
//           isPublic: true
//         },
//       }
//     );
//     const bodyObj2 = JSON.parse(String(res2.getBody()));
//     const channelID = bodyObj2.channelId;

//     // const res6 = request(
//     //  'POST',
//     //  'http://localhost:3200/channel/invite/v2',
//     // {
//     //   json: {
//     //     token: String(uID),
//     //    channelId: channelID,
//     //    uId: uID
//     //  },
//     // }
//     // );
//     // const bodyObj6 = JSON.parse(String(res6.getBody()));

//     const res7 = request(
//       'POST',
//       'http://localhost:3200/channel/invite/v2',
//       {
//         json: {
//           token: String(uID),
//           channelId: channelID,
//           uId: uID
//         },
//       }
//     );
//     const bodyObj7 = JSON.parse(String(res7.getBody()));
//     expect(bodyObj7).toMatchObject({ error: 'error' });
//   });
// });
// // Tests for channelInviteV2
// describe('channelId is valid and the authorised user is not a member of the channel, return {error:"error"} ', () => {
//   test('If it returns {} successfully, otherwise {error:"error"}', () => {
//     const res = request(
//       'POST',
//       'http://localhost:3200/auth/register/v2',
//       {
//         json: {
//           email: 'uniquepeterrabbit56@gmail.com',
//           password: 'qgi6dt',
//           nameFirst: 'Peter',
//           nameLast: 'Rabbit'
//         },
//       }
//     );
//     const bodyObj = JSON.parse(String(res.getBody()));
//     const uID = bodyObj.authUserId;
//     const res2 = request(
//       'POST',
//       'http://localhost:3200/channels/create/v2',
//       {
//         json: {
//           token: String(uID),
//           name: 'channel005',
//           isPublic: true
//         },
//       }
//     );
//     const bodyObj2 = JSON.parse(String(res2.getBody()));
//     const channelID = bodyObj2.channelId;

//     const res7 = request(
//       'POST',
//       'http://localhost:3200/channel/invite/v2',
//       {
//         json: {
//           token: String(uID),
//           channelId: channelID,
//           uId: uID + 99
//         },
//       }
//     );
//     const bodyObj7 = JSON.parse(String(res7.getBody()));
//     expect(bodyObj7).toMatchObject({ error: 'error' });
//   });
// });

// // Tests for channelMessageV2

// // Tests for channelMessageV2
// describe('channelId does not refer to a valid channel', () => {
//   test('If it returns {message:,start:,end:} successfully, otherwise {error:"error"}', () => {
//     const res = request(
//       'POST',
//       'http://localhost:3200/auth/register/v2',
//       {
//         json: {
//           email: 'uniquepeterrabbit62@gmail.com',
//           password: 'qgi6dt',
//           nameFirst: 'Peter',
//           nameLast: 'Rabbit'
//         },
//       }
//     );
//     const bodyObj = JSON.parse(String(res.getBody()));
//     const uID = bodyObj.authUserId;
//     const res2 = request(
//       'POST',
//       'http://localhost:3200/channels/create/v2',
//       {
//         json: {
//           token: String(uID),
//           name: 'channel006',
//           isPublic: true
//         },
//       }
//     );
//     const bodyObj2 = JSON.parse(String(res2.getBody()));
//     const channelID = bodyObj2.channelId;

//     const res3 = request(
//       'GET',
//       'http://localhost:3200/channel/messages/v2',
//       {
//         json: {
//           token: String(uID),
//           channelId: channelID + 10,
//           start: 0
//         },
//       }
//     );
//     const bodyObj3 = JSON.parse(String(res3.getBody()));
//     expect(bodyObj3).toEqual({ error: 'error' });
//   });
// });

// // Tests for channelMessageV2

// // Tests for channelAddownerV2
// describe('Test channel/addowner successfully', () => {
//   test('If user is not already a member of the channel, return {error:"error"}', () => {
//     const res = request(
//       'POST',
//       'http://localhost:3200/auth/register/v2',
//       {
//         json: {
//           email: 'uniquepeterrabbit' + Math.floor(Math.random() * 444) + '@gmail.com',
//           password: 'qgi6dt',
//           nameFirst: 'Peter',
//           nameLast: 'Rabbit'
//         },
//       }
//     );
//     const bodyObj = JSON.parse(String(res.getBody()));
//     const bodyuID = bodyObj.authUserId;
//     const bodyToken = bodyObj.token;
//     const res2 = request(
//       'POST',
//       'http://localhost:3200/channels/create/v2',
//       {
//         json: {
//           token: String(bodyToken),
//           name: 'channel009999djfs',
//           isPublic: true
//         },
//       }
//     );
//     const bodyObj2 = JSON.parse(String(res2.getBody()));
//     const channelID2 = bodyObj2.channelId;

//     const res3 = request(
//       'POST',
//       'http://localhost:3200/channel/addowner',
//       {
//         json: {
//           token: String(bodyToken),
//           channelId: channelID2,
//           uId: bodyuID
//         },
//       }
//     );
//     const bodyObj3 = JSON.parse(String(res3.getBody()));
//     expect(bodyObj3).toEqual({ error: 'error' });
//   });
// });

// // Tests for channelAddownerV2
// describe('channelId does not refer to a valid channel,return {error:"error"}', () => {
//   test('If it returns {} successfully, otherwise {error:"error"}', () => {
//     const res = request(
//       'POST',
//       'http://localhost:3200/auth/register/v2',
//       {
//         json: {
//           email: 'uniquepeterrabbit72@gmail.com',
//           password: 'qgi6dt',
//           nameFirst: 'Peter',
//           nameLast: 'Rabbit'
//         },
//       }
//     );
//     const bodyObj = JSON.parse(String(res.getBody()));
//     const uID = bodyObj.authUserId;
//     const res2 = request(
//       'POST',
//       'http://localhost:3200/channels/create/v2',
//       {
//         json: {
//           token: String(uID),
//           name: 'channel007',
//           isPublic: true
//         },
//       }
//     );
//     const bodyObj2 = JSON.parse(String(res2.getBody()));
//     const channelID = bodyObj2.channelId;

//     const res4 = request(
//       'POST',
//       'http://localhost:3200/channel/addowner',
//       {
//         json: {
//           token: String(uID),
//           channelId: channelID + 999,
//           uId: uID
//         },
//       }
//     );
//     const bodyObj4 = JSON.parse(String(res4.getBody()));
//     expect(bodyObj4).toEqual({ error: 'error' });
//   });
// });
// // Tests for channelAddownerV2
// describe('uId does not refer to a valid user,return {error:"error"}', () => {
//   test('If it returns {} successfully, otherwise {error:"error"}', () => {
//     const res = request(
//       'POST',
//       'http://localhost:3200/auth/register/v2',
//       {
//         json: {
//           email: 'uniquepeterrabbit73@gmail.com',
//           password: 'qgi6dt',
//           nameFirst: 'Peter',
//           nameLast: 'Rabbit'
//         },
//       }
//     );
//     const bodyObj = JSON.parse(String(res.getBody()));
//     const uID = bodyObj.authUserId;
//     const res2 = request(
//       'POST',
//       'http://localhost:3200/channels/create/v2',
//       {
//         json: {
//           token: String(uID),
//           name: 'channel007',
//           isPublic: true
//         },
//       }
//     );
//     const bodyObj2 = JSON.parse(String(res2.getBody()));
//     const channelID = bodyObj2.channelId;

//     const res4 = request(
//       'POST',
//       'http://localhost:3200/channel/addowner',
//       {
//         json: {
//           token: String(uID),
//           channelId: channelID,
//           uId: uID + Math.floor(Math.random() * 88888)
//         },
//       }
//     );
//     const bodyObj4 = JSON.parse(String(res4.getBody()));
//     expect(bodyObj4).toEqual({ error: 'error' });
//   });
// });
// // Tests for channelAddownerV2
// describe('channelId is valid and the authorised user is not a member of the channel,return {error:"error"}', () => {
//   test('If it returns {} successfully, otherwise {error:"error"}', () => {
//     const res = request(
//       'POST',
//       'http://localhost:3200/auth/register/v2',
//       {
//         json: {
//           email: 'uniquepeterrabbit75@gmail.com',
//           password: 'qgi6dt',
//           nameFirst: 'Peter',
//           nameLast: 'Rabbit'
//         },
//       }
//     );
//     const bodyObj = JSON.parse(String(res.getBody()));
//     const uID = bodyObj.authUserId;

//     const res11 = request(
//       'POST',
//       'http://localhost:3200/auth/register/v2',
//       {
//         json: {
//           email: 'uniquepeterrabbit751@gmail.com',
//           password: 'qgi6dt',
//           nameFirst: 'Peter',
//           nameLast: 'Rabbit'
//         },
//       }
//     );
//     const bodyObj11 = JSON.parse(String(res11.getBody()));
//     const uID11 = bodyObj.authUserId;

//     const res2 = request(
//       'POST',
//       'http://localhost:3200/channels/create/v2',
//       {
//         json: {
//           token: String(uID),
//           name: 'channel007',
//           isPublic: true
//         },
//       }
//     );
//     const bodyObj2 = JSON.parse(String(res2.getBody()));
//     const channelID = bodyObj2.channelId;

//     const res4 = request(
//       'POST',
//       'http://localhost:3200/channel/addowner',
//       {
//         json: {
//           token: String(uID11),
//           channelId: channelID,
//           uId: uID11 + Math.floor(Math.random() * 88888)
//         },
//       }
//     );
//     const bodyObj4 = JSON.parse(String(res4.getBody()));
//     expect(bodyObj4).toEqual({ error: 'error' });
//   });
// });

// // // Tests for channelRemoveownerV2
// // describe('Test channel/removeowner successfully', () => {
// //   test('If it returns {} successfully, otherwise {error:"error"}', () => {
// //     // let email = 'unique'+Math.floor(Math.random() * 88888)+'@gmail.com';
// //     // let password = "qgi6dt";
// //     const res = request(
// //       'POST',
// //       'http://localhost:3200/auth/register/v2',
// //       {
// //         json: {
// //           email: 'peterthedft13cft@gmail.com',
// //           password: '1Asdfg35g',
// //           nameFirst: 'Peter',
// //           nameLast: 'Rabbit'
// //         },
// //       }
// //     );
// //     const bodyObj = JSON.parse(String(res.getBody()));
// //     const uID1 = bodyObj.authUserId;
// //     const token1 = bodyObj.token;

// //     const res9 = request(
// //       'POST',
// //       'http://localhost:3200/auth/register/v2',
// //       {
// //         json: {
// //           email: 'petertheduffie3@gmail.com',
// //           password: '1Asdfg358e',
// //           nameFirst: 'Duffie',
// //           nameLast: 'Habbit'
// //         },
// //       }
// //     );
// //     const bodyObj9 = JSON.parse(String(res9.getBody()));
// //     const uID9 = bodyObj9.authUserId;
// //     const token9 = bodyObj9.token;

// //     const res8 = request(
// //       'POST',
// //       'http://localhost:3200/channels/create/v2',
// //       {
// //         json: {
// //           token: token1,
// //           name: 'letstry09',
// //           isPublic: true
// //         },
// //       }
// //     );
// //     const bodyObj8 = JSON.parse(String(res8.getBody()));
// //     const channelID8 = bodyObj8.channelId;

// //     const res5 = request(
// //       'POST',
// //       'http://localhost:3200/channel/invite/v2',
// //       {
// //         json: {
// //           token: token1,
// //           channelId: channelID8,
// //           uId: uID1,
// //         },
// //       }
// //     );
// //     const bodyObj5 = JSON.parse(String(res5.getBody()));
// //     console.log(bodyObj5);

// //     const res6 = request(
// //       'POST',
// //       'http://localhost:3200/channel/invite/v2',
// //       {
// //         json: {
// //           token: token9,
// //           channelId: channelID8,
// //           uId: uID9,
// //         },
// //       }
// //     );
// //     const bodyObj6 = JSON.parse(String(res6.getBody()));
// //     console.log(bodyObj6);

// //     const res4 = request(
// //       'POST',
// //       'http://localhost:3200/channel/addowner',
// //       {
// //         json: {
// //           token: token1,
// //           channelId: channelID8,
// //           uId: uID1
// //         },
// //       }
// //     );
// //     const bodyObj4 = JSON.parse(String(res4.getBody()));
// //     console.log(bodyObj4);

// //     const res7 = request(
// //       'POST',
// //       'http://localhost:3200/channel/addowner',
// //       {
// //         json: {
// //           token: token9,
// //           channelId: channelID8,
// //           uId: uID9
// //         },
// //       }
// //     );
// //     const bodyObj7 = JSON.parse(String(res7.getBody()));
// //     console.log(bodyObj7);

// //     const res3 = request(
// //       'POST',
// //       'http://localhost:3200/channel/removeowner',
// //       {
// //         json: {
// //           token: token1,
// //           channelId: channelID8,
// //           uId: uID1,
// //         },
// //       }
// //     );
// //     const bodyObj3 = JSON.parse(String(res3.getBody()));
// //     expect(bodyObj3).toEqual({ });
// //   });
// // });

// // Tests for channelRemoveownerV2
// describe('uId does not refer to a valid user,return {error:"error"}', () => {
//   test('If it returns {} successfully, otherwise {error:"error"}', () => {
//     const res = request(
//       'POST',
//       'http://localhost:3200/auth/register/v2',
//       {
//         json: {
//           email: 'uniquepeterrabbit82@gmail.com',
//           password: 'qgi6dt',
//           nameFirst: 'Peter',
//           nameLast: 'Rabbit'
//         },
//       }
//     );

//     const bodyObj = JSON.parse(String(res.getBody()));
//     const uID = bodyObj.authUserId;
//     const res2 = request(
//       'POST',
//       'http://localhost:3200/channels/create/v2',
//       {
//         json: {
//           token: String(uID),
//           name: 'channel008',
//           isPublic: true
//         },
//       }
//     );
//     const bodyObj2 = JSON.parse(String(res2.getBody()));
//     const channelID = bodyObj2.channelId;

//     const res4 = request(
//       'POST',
//       'http://localhost:3200/channel/removeowner',
//       {
//         json: {
//           token: String(uID),
//           channelId: channelID,
//           uId: uID + 666
//         },
//       }
//     );
//     const bodyObj4 = JSON.parse(String(res4.getBody()));
//     expect(bodyObj4).toEqual({ error: 'error' });
//   });
// });

// // Tests for channelRemoveownerV2
// describe('channelId does not refer to a valid channel,return {error:"error"}', () => {
//   test('If it returns {} successfully, otherwise {error:"error"}', () => {
//     const res = request(
//       'POST',
//       'http://localhost:3200/auth/register/v2',
//       {
//         json: {
//           email: 'uniquepeterrabbit83@gmail.com',
//           password: 'qgi6dt',
//           nameFirst: 'Peter',
//           nameLast: 'Rabbit'
//         },
//       }
//     );
//     const bodyObj = JSON.parse(String(res.getBody()));
//     const uID = bodyObj.authUserId;
//     const res2 = request(
//       'POST',
//       'http://localhost:3200/channels/create/v2',
//       {
//         json: {
//           token: String(uID),
//           name: 'channel008',
//           isPublic: true
//         },
//       }
//     );
//     const bodyObj2 = JSON.parse(String(res2.getBody()));
//     const channelID = bodyObj2.channelId;

//     const res5 = request(
//       'POST',
//       'http://localhost:3200/channel/removeowner',
//       {
//         json: {
//           token: String(uID),
//           channelId: channelID + Math.floor(Math.random() * 1000),
//           uId: uID
//         },
//       }
//     );
//     const bodyObj5 = JSON.parse(String(res5.getBody()));
//     expect(bodyObj5).toEqual({ error: 'error' });
//   });
// });
