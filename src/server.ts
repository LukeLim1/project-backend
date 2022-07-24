import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { authLoginV1, authRegisterV1, authLogout } from './auth';
import { channelsListV1, channelsListallV1, channelsCreateV1 } from './channels';
import { clearV1 } from './other';
import { getData } from './dataStore';
import { channelLeaveV1, channelDetails, channelJoin, channelInviteV2, channelMessagesV2, channelAddownerV1, channelRemoveownerV1 } from './channel';
import { dmCreateV1, dmLeave, dmMessages, senddm } from './dm';
import { setNameV1, usersAll, setEmailV1, setHandleV1 } from './users';
import { messageSendV1, messageEditV1, messageRemoveV1 } from './message';
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

app.get('/data/channels', (req, res) => {
  const data = getData();
  const users = data.channels;
  res.send({
    users
  });
});
app.get('/data/users', (req, res) => {
  const data = getData();
  const users = data.users;
  res.send({
    users
  });
});
app.get('/data/all', (req, res) => {
  const data = getData();
  const users = data.channels;
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

app.post('/channels/create/v2', (req, res) => {
  // console.log('channels/create/V2');
  const { token, name, isPublic } = req.body;
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
  const { token, uIds } = req.body;
  res.json(dmCreateV1(token, uIds));
});

app.get('/user/profile/v2', (req, res) => {
  const token = String(req.query.token);
  const uId = parseInt(req.query.uId as string);
  res.json(channelDetails(token, uId));
});

app.put('/user/profile/setname/v1', (req, res) => {
  const token = String(req.body.token);
  const { nameFirst, nameLast } = req.body;
  res.json(setNameV1(token, nameFirst, nameLast));
});

app.put('/user/profile/setemail/v1', (req, res) => {
  const token = String(req.body.token);
  const email = req.body.email;
  res.json(setEmailV1(token, email));
});

app.put('/user/profile/sethandle/v1', (req, res) => {
  const token = String(req.body.token);
  const handle = req.body.handle;
  res.json(setHandleV1(token, handle));
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

app.get('/users/all/v1', (req, res) => {
  const token = req.query.token as string;
  res.json(usersAll(token));
});

app.post('/channel/invite/v2', (req, res) => {
  console.log('channel/invite/V2');
  const { token, channelId, uId } = req.body;
  res.json(channelInviteV2(token, channelId, uId));
});

app.get('/channel/messages/v2', (req, res) => {
  console.log('channel/messages/V2');
  const { token, channelId, start } = req.body;
  res.json(channelMessagesV2(token, channelId, start));
});

app.post('/channel/addowner/v1', (req, res) => {
  console.log('channel/addowner/v1');
  const { token, channelId, uId } = req.body;
  res.json(channelAddownerV1(token, channelId, uId));
});

app.post('/channel/removeowner/v1', (req, res) => {
  console.log('channel/removeowner/v1');
  const { token, channelId, uId } = req.body;
  res.json(channelRemoveownerV1(token, channelId, uId));
});

app.post('/message/send/v1', (req, res) => {
  console.log('message/send/v1');
  const { token, channelId, message } = req.body;
  res.json(messageSendV1(token, channelId, message));
});

app.put('/message/edit/v1', (req, res) => {
  console.log('message/edit/v1');
  const { token, messageId, message } = req.body;
  res.json(messageEditV1(token, messageId, message));
});

app.delete('/message/remove/v1', (req, res) => {
  console.log('message/remove/v1');
  const { token, messageId } = req.body;
  res.json(messageRemoveV1(token, messageId));
});

// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
