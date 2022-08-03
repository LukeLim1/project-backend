import express, { Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { authLoginV1, authRegisterV1, authLogout, authPasswordResetRequest, authPasswordReset } from './auth';
import { channelsListV1, channelsListallV1, channelsCreateV1 } from './channels';
import { clearV1 } from './other';
import { getData } from './dataStore';
import { channelLeaveV1, channelDetails, channelJoin, channelInviteV2, channelAddownerV1, channelRemoveownerV1, channelMessagesV2 } from './channel';
import { dmCreateV1, dmLeave, dmMessages, senddm, dmDetails, dmList, dmRemove } from './dm';
import { setNameV1, setEmailV1, setHandleV1, usersAll } from './users';
import { messageSendV1, messageEditV1, messageRemoveV1, messagesShareV1 } from './message';
// import { notificationGetV1 } from './notifications';
import errorHandler from 'middleware-http-errors';
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

app.post('/auth/register/v2', (req, res) => {
  // console.log('auth/register/V2');
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(authRegisterV1(email, password, nameFirst, nameLast));
  // const data = getData();
  // fs.writeFileSync(__dirname + "/express.json".JSON.stringify(data,null,2))
});
app.post('/auth/login/v2', (req, res) => {
  // console.log('auth/login/V2');
  const { email, password } = req.body;
  // returns { token, authUserid }
  res.json(authLoginV1(email, password));
});

app.post('/auth/logout/v1', (req, res) => {
  const { token } = req.body;
  res.json(authLogout(token));
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

app.post('/channels/create/v2', (req, res) => {
  // console.log('channels/create/V2');
  const { name, isPublic } = req.body;
  const token = req.header('token');
  // returns channelId
  res.json(channelsCreateV1(token, name, isPublic));
});

app.get('/channels/list/v2', (req, res) => {
  // console.log('channels/create/V2');
  const token = req.query.token as string;
  // returns channelId
  res.json(channelsListV1(token));
});
app.get('/channels/listall/v2', (req, res) => {
  // console.log('channels/create/V2');
  const token = req.query.token as string;
  // returns channelId
  res.json(channelsListallV1(token));
});

app.get('/channels/list/v3', (req, res) => {
  const token = req.header('token');
  res.json(channelsListV1(token));
});

app.get('/channels/listall/v3', (req, res) => {
  const token = req.header('token');
  res.json(channelsListallV1(token));
});

app.get('/channel/details/v2', (req, res) => {
  const token = req.query.token as string;
  const channelId = parseInt(req.query.channelId as string);
  res.json(channelDetails(token, channelId));
});

app.post('/channel/leave/v1', (req, res) => {
  const { token, channelId } = req.body;
  res.json(channelLeaveV1(token, channelId));
});

app.post('/dm/create/v1', (req, res) => {
  const { uIds } = req.body;
  const token = req.header('token');
  res.json(dmCreateV1(token, uIds));
});

app.delete('/clear/v1', (req, res) => {
  res.json(clearV1());
});

app.get('/channel/details/v2', (req, res) => {
  const token = req.query.token as string;
  const channelId = parseInt(req.query.channelId as string);
  res.json(channelDetails(token, channelId));
});

app.post('/channel/join/v2', (req, res) => {
  const { token, channelId } = req.body;
  res.json(channelJoin(token, channelId));
});

app.post('/dm/leave/v1', (req, res) => {
  const { token, dmId } = req.body;
  res.json(dmLeave(token, dmId));
});

app.get('/dm/messages/v1', (req, res) => {
  const token = req.query.token as string;
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);
  res.json(dmMessages(token, dmId, start));
});

app.post('/message/senddm/v1', (req, res) => {
  const { token, dmId, message } = req.body;
  res.json(senddm(token, dmId, message));
});

app.get('/dm/list/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  res.json(dmList(token));
});

app.get('/dm/details/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const dmId = req.query.dmId as string;
  res.json(dmDetails(token as string, parseInt(dmId)));
});

app.delete('/dm/remove/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const dmId = req.query.dmId as string;
  res.json(dmRemove(token, parseInt(dmId)));
});

app.get('/users/all/v1', (req, res) => {
  const token = req.query.token as string;
  res.json(usersAll(token));
});
app.put('/user/profile/setname/v1', (req, res) => {
  const token = req.header('token');
  const { nameFirst, nameLast } = req.body;
  res.json(setNameV1(token, nameFirst, nameLast));
});

app.put('/user/profile/setemail/v1', (req, res) => {
  const token = req.header('token');
  const { email } = req.body;
  res.json(setEmailV1(token, email));
});

app.put('/user/profile/sethandle/v1', (req, res) => {
  const token = req.header('token');
  const { handleStr } = req.body;
  res.json(setHandleV1(token, handleStr));
});

app.post('/channel/invite/v2', (req, res) => {
  console.log('channel/invite/V2');
  const { token, channelId, uId } = req.body;
  res.json(channelInviteV2(token, channelId, uId));
});

app.get('/channel/messages/v2', (req, res) => {
  console.log('channel/messages/V2');
  const { token, channelId, start } = req.body;
  // returns {messages,start,end}
  res.json(channelMessagesV2(token, channelId, start));
});

app.post('/channel/addowner', (req, res) => {
  console.log('channel/addowner');
  const { token, channelId, uId } = req.body;
  // returns {}
  res.json(channelAddownerV1(token, channelId, uId));
});

app.post('/channel/removeowner', (req, res) => {
  console.log('channel/removeowner');
  const { token, channelId, uId } = req.body;
  // returns {}
  res.json(channelRemoveownerV1(token, channelId, uId));
});

app.post('/message/send', (req, res) => {
  console.log('message/send');
  const { token, channelId, message } = req.body;
  // returns {}
  res.json(messageSendV1(token, channelId, message));
});

app.put('/message/edit', (req, res) => {
  console.log('message/edit');
  const { token, messageId, message } = req.body;
  // returns {}
  res.json(messageEditV1(token, messageId, message));
});

app.post('/message/share/v1', (req, res) => {
  console.log('message/share/v1');
  const { ogMessageId, message, channelId, dmId } = req.body;
  // returns {}
  res.json(messagesShareV1(ogMessageId, message, channelId, dmId));
});

app.delete('/message/remove', (req, res) => {
  console.log('message/remove');
  const { token, messageId } = req.body;
  // returns {}
  res.json(messageRemoveV1(token, messageId));
});

// app.get('/notifications/get/v1', (req, res) => {
//   const token = req.header('token');
//   res.json(notificationGetV1(token))
// });

// for logging errors
app.use(morgan('dev'));

// for handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
