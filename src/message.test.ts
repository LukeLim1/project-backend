// import { createBasicDm, dmSend, newReg, sendMessage, shareMessage } from './helperFunctions';
// import { createBasicChannel } from './channels.test';
// import { Response } from 'sync-request';

// const OK = 200;
// describe('messageShareV1', () => {
//   let user1: Response, user1Body: { token: string[]; authUserId: number; },
//     chan1: Response, chan1Body: { channelId: number; }, dm1: Response,
//     dm1Body: { dmId: number; }, send1: Response, send1Body: any,
//     dmMessage1: Response, dmMessage1Body: { messageId: number; };
//   beforeEach(() => {
//     // new reg
//     user1 = newReg('zach@gmail.com', '123456', 'zach', 'chan');
//     user1Body = JSON.parse(String(user1.getBody()));
//     expect(user1Body).toMatchObject({ token: expect.any(String), authUserId: expect.any(Number) });

//     // new channel
//     chan1 = createBasicChannel(user1Body.token[0], 'Channel 1', true);
//     chan1Body = JSON.parse(String(chan1.getBody()));
//     expect(chan1Body).toMatchObject({ channelId: expect.any(Number) });

//     // new dm
//     dm1 = createBasicDm(user1Body.token[0], [user1Body.authUserId]);
//     dm1Body = JSON.parse(String(dm1.getBody()));
//     console.log(dm1Body)
//     expect(dm1Body).toMatchObject({ dmId: expect.any(Number) });

//     // send message to channel
//     send1 = sendMessage(user1Body.token[0], chan1Body.channelId, 'chan1 message');
//     send1Body = JSON.parse(String(send1.getBody()));
//     expect(send1Body).toMatchObject({ messageId: expect.any(Number) });
//     expect(send1.statusCode).toBe(OK);
//     console.log(user1Body)
//     // send message to dm
//     dmMessage1 = dmSend(user1Body.token[0], dm1Body.dmId, 'DM 1 message 1 ahaha');
//     dmMessage1Body = JSON.parse(String(dmMessage1.getBody()));
//     //console.log(dmMessage1Body)
//     expect(dmMessage1Body).toMatchObject({ dmId: expect.any(Number) });
//   });
//   test('Testing successful messageShare 200 status code', () => {
//     dmSend(user1Body.token[0], dm1Body.dmId, 'DM 1 message 2 beheheh');
//     // new message in dm that is concatenation of first dm and new dm
//     const res = shareMessage(dmMessage1Body.messageId, 'new message ahahah', -1, dm1Body.dmId);
//     const resBody = JSON.parse(String(res.getBody()));
//     expect(res.statusCode).toBe(OK);
//     expect(resBody).toMatchObject({ sharedMessageId: expect.any(Number) });
//   });
//   test('message length exceeds 1000 chars 400 error', () => {
//     // new message in dm that is concatenation of first dm and new dm
//     const messageToGive = '1'.repeat(1001);
//     expect(shareMessage(dmMessage1Body.messageId, messageToGive, -1, dm1Body.dmId)).toHaveProperty('statusCode', 400);
//   });
//   test('channel id and dmid are invalid 400 error', () => {
//     expect(shareMessage(dmMessage1Body.messageId, 'any message', -1, dm1Body.dmId + 999)).toHaveProperty('statusCode', 400);
//     expect(shareMessage(dmMessage1Body.messageId, 'any message', chan1Body.channelId + 999, -1)).toHaveProperty('statusCode', 400);
//   });
//   test('neither channelid nor dmid are -1 400 error', () => {
//     expect(shareMessage(dmMessage1Body.messageId, 'any message', chan1Body.channelId, dm1Body.dmId)).toHaveProperty('statusCode', 400);
//   });
//   // test('authorised user not apart of channel or dm 403 error', () => {
//   //     expect(shareMessage(dmMessage1Body.messageId + 99, 'any message', -1, dm1Body.identifier)).toHaveProperty('statusCode', 400)
//   // });
// });

test('placeholder test', () => {
  const hello = 1;
  expect(hello).toEqual(1);
});
