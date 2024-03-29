import express, { Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { authLoginV1, authRegisterV1, authLogout, authPasswordResetRequest, authPasswordReset } from './auth';
import { channelsListV1, channelsListallV1, channelsCreateV1 } from './channels';
import { clearV1 } from './other';
import { getData } from './dataStore';
import { channelLeaveV1, channelDetails, channelJoin, channelInviteV3, channelAddownerV2, channelRemoveownerV2, channelMessagesV3 } from './channel';
import { dmCreateV1, dmLeave, dmMessages, senddm, dmDetails, dmList, dmRemove } from './dm';
import { userProfileV1, setNameV1, setEmailV1, setHandleV1, usersAll, uploadPhoto, userStats, usersStats } from './users';
import { userRemove, userPermissionChange } from './admin';
import { saveData, loadData } from './helperFunctions';
// import { notificationGetV1 } from './notifications';
import {
  messageSendV2, messageEditV2, messageRemoveV2, messagesShareV1,
  messagesSearch, messagesUnReact, messagesReact, messageUnPin, messagePin, messageSendlaterdmV1, messageSendlaterV1
} from './message';
import { notificationGetV1 } from './notifications';
import errorHandler from 'middleware-http-errors';
import { standupActiveV1, standupSendV1, standupStartV1 } from './standup';

// import fs from 'fs';

// Set up web app, use JSON
const app = express();
app.use(express.json());
app.use(express.text());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req, res, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

app.get('/apple', (req, res) => {
  const name = req.query.name;
  res.send(JSON.stringify({
    msg: `Hi ${name}, thanks for sending apple!`,
  }));
});

app.get('/data', (req, res) => {
  const data = getData();
  const users = data;
  res.send({
    users
  });
});

app.post('/auth/register/v3', (req, res) => {
  // console.log('auth/register/V2');
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(authRegisterV1(email, password, nameFirst, nameLast));
  // const data = getData();
  // fs.writeFileSync(__dirname + "/express.json".JSON.stringify(data,null,2))
});
app.post('/auth/login/v3', (req, res) => {
  // console.log('auth/login/V2');
  const { email, password } = req.body;
  // returns { token, authUserid }
  res.json(authLoginV1(email, password));
});

app.post('/auth/logout/v2', (req, res) => {
  const token = req.header('token');
  res.json(authLogout(token));
  saveData();
});

app.post('/auth/passwordreset/request/v1', (req, res) => {
  const token = req.header('token');
  const email = req.body.email;
  res.json(authPasswordResetRequest(token, email));
});

app.post('/auth/passwordreset/v1', (req, res) => {
  const { resetCode, newPassword } = req.body;
  res.json(authPasswordReset(resetCode, newPassword));
});

// app.post('/channels/create/v2', (req, res) => {
//   // console.log('channels/create/V2');
//   const { token, name, isPublic } = req.body;
//   // returns channelId
//   res.json(channelsCreateV1(token, name, isPublic));
// });

app.post('/channels/create/v3', (req, res) => {
  // console.log('channels/create/V2');
  const { name, isPublic } = req.body;
  const token = req.header('token');
  // returns channelId
  res.json(channelsCreateV1(token, name, isPublic));
});

app.get('/channels/list/v3', (req, res) => {
  const token = req.header('token');
  res.json(channelsListV1(token));
});

app.get('/channels/listall/v3', (req, res) => {
  const token = req.header('token');
  res.json(channelsListallV1(token));
});

app.get('/channel/details/v3', (req, res) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  res.json(channelDetails(token, channelId));
  saveData();
});

app.post('/channel/join/v3', (req, res) => {
  const token = req.header('token');
  const { channelId } = req.body;
  res.json(channelJoin(token, channelId));
  saveData();
});

app.post('/channel/leave/v2', (req, res) => {
  const token = req.header('token');
  const { channelId } = req.body;
  res.json(channelLeaveV1(token, channelId));
});

app.post('/dm/create/v2', (req, res) => {
  const { uIds } = req.body;
  const token = req.header('token');
  res.json(dmCreateV1(token, uIds));
});

app.delete('/clear/v1', (req, res) => {
  res.json(clearV1());
  saveData();
});

app.post('/dm/leave/v2', (req, res) => {
  const token = req.header('token');
  const { dmId } = req.body;
  res.json(dmLeave(token, dmId));
  saveData();
});

app.get('/dm/messages/v2', (req, res) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);
  res.json(dmMessages(token, dmId, start));
  saveData();
});

app.post('/message/senddm/v2', (req, res) => {
  const token = req.header('token');
  const { dmId, message } = req.body;
  res.json(senddm(token, dmId, message));
});

app.get('/dm/list/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(dmList(token));
});

app.get('/dm/details/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = req.query.dmId as string;
  res.json(dmDetails(token, parseInt(dmId)));
});

app.delete('/dm/remove/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = req.query.dmId as string;
  res.json(dmRemove(token, parseInt(dmId)));
});

app.get('/user/profile/v3', (req, res) => {
  const token = req.header('token');
  const uId = parseInt(req.query.uId as string);
  res.json(userProfileV1(token, uId));
  saveData();
});

app.get('/users/all/v2', (req, res) => {
  const token = req.header('token');
  res.json(usersAll(token));
  saveData();
});
app.put('/user/profile/setname/v2', (req, res) => {
  const token = req.header('token');
  const { nameFirst, nameLast } = req.body;
  res.json(setNameV1(token, nameFirst, nameLast));
});

app.put('/user/profile/setemail/v2', (req, res) => {
  const token = req.header('token');
  const { email } = req.body;
  res.json(setEmailV1(token, email));
});

app.put('/user/profile/sethandle/v2', (req, res) => {
  const token = req.header('token');
  const { handleStr } = req.body;
  res.json(setHandleV1(token, handleStr));
});

app.post('/user/profile/uploadphoto/v1', (req, res) => {
  const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
  res.json(uploadPhoto(imgUrl, xStart, yStart, xEnd, yEnd));
  saveData();
});

app.get('/user/stats/v1', (req, res) => {
  const token = req.header('token');
  res.json(userStats(token));
  saveData();
});

app.get('/users/stats/v1', (req, res) => {
  res.json(usersStats());
  saveData();
});

app.delete('/admin/user/remove/v1', (req, res) => {
  const token = req.header('token');
  const uId = parseInt(req.query.uId as string);
  res.json(userRemove(token, uId));
  saveData();
});

app.post('/admin/userpermission/change/v1', (req, res) => {
  const token = req.header('token');
  const { uId, permissionId } = req.body;
  res.json(userPermissionChange(token, uId, permissionId));
  saveData();
});

app.post('/channel/invite/v3', (req, res) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  res.json(channelInviteV3(token, channelId, uId));
});

app.get('/channel/messages/v3', (req, res) => {
  const token = req.header('token');
  const { channelId, start } = req.query;
  res.json(channelMessagesV3(token, Number(channelId), Number(start)));
});

app.post('/channel/addowner/v2', (req, res) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  res.json(channelAddownerV2(token, channelId, uId));
});

app.post('/channel/removeowner/v2', (req, res) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  res.json(channelRemoveownerV2(token, channelId, uId));
});

app.post('/message/send/v2', (req, res) => {
  const token = req.header('token');
  const { channelId, message } = req.body;
  res.json(messageSendV2(token, channelId, message));
});

app.put('/message/edit/v2', (req, res) => {
  const token = req.header('token');
  const { messageId, message } = req.body;
  res.json(messageEditV2(token, messageId, message));
});

app.post('/message/share/v1', (req, res) => {
  console.log('message/share/v1');
  const token = req.header('token');
  const { ogMessageId, message, channelId, dmId } = req.body;
  // returns {}
  res.json(messagesShareV1(token, ogMessageId, message, channelId, dmId));
});

app.delete('/message/remove/v2', (req, res) => {
  const token = req.header('token');
  const { messageId } = req.query;
  res.json(messageRemoveV2(token, Number(messageId)));
});

app.get('/search/v1', (req, res) => {
  const token = req.header('token');
  const queryStr = req.query.queryStr as string;
  res.json(messagesSearch(token, queryStr));
});

app.post('/message/react/v1', (req, res) => {
  const token = req.header('token');
  const { messageId, reactId } = req.body;
  res.json(messagesReact(token, messageId, reactId));
});

app.post('/message/unreact/v1', (req, res) => {
  const token = req.header('token');
  const { messageId, reactId } = req.body;
  res.json(messagesUnReact(token, messageId, reactId));
});

app.post('/message/pin/v1', (req, res) => {
  const token = req.header('token');
  const { messageId } = req.body;
  res.json(messagePin(token, messageId));
});

app.post('/message/unpin/v1', (req, res) => {
  const token = req.header('token');
  const { messageId } = req.body;
  res.json(messageUnPin(token, messageId));
});

app.post('/message/sendlater/v1', (req, res) => {
  const token = req.header('token');
  const { channelId, message, timeSent } = req.body;
  res.json(messageSendlaterV1(token, channelId, message, timeSent));
});

app.post('/message/sendlaterdm/v1', (req, res) => {
  const token = req.header('token');
  const { dmId, message, timeSent } = req.body;
  res.json(messageSendlaterdmV1(token, dmId, message, timeSent));
});

app.get('/notifications/get/v1', (req, res) => {
  const token = req.header('token');
  res.json(notificationGetV1(token));
});

app.post('/standup/start/v1', (req, res) => {
  const token = req.header('token');
  const { channelId, length } = req.body;
  res.json(standupStartV1(token, channelId, length));
});

app.get('/standup/active/v1', (req, res) => {
  const token = req.header('token');
  const { channelId } = req.query;
  res.json(standupActiveV1(token, Number(channelId)));
});

app.post('/standup/send/v1', (req, res) => {
  const token = req.header('token');
  const { channelId, message } = req.body;
  res.json(standupSendV1(token, channelId, message));
});

// for logging errors
app.use(morgan('dev'));

// for handling errors
app.use(errorHandler());

// persistence
loadData();

// start server
const server = app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
