import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { authLoginV1, authRegisterV1, authLogout } from './auth';
import { channelsCreateV1 } from './channels';
import { channelDetails, channelJoin } from './channel';
import { dmCreateV1, dmLeave, dmMessages } from './dm';
import { usersAll } from './users';
import { clearV1 } from './other';
import { getData, setData } from './dataStore';
import fs from 'fs';

// Set up web app, use JSON
const app = express();
app.use(express.json());

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

app.post('/auth/register/v2', (req, res) => {
  // console.log('auth/register/V2');
  const { email, password, nameFirst, nameLast } = req.body;
  // returns { token, authUserid }
  res.json(authRegisterV1(email, password, nameFirst, nameLast));
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

app.get('/channel/details/v2', (req, res) => {
  const token = req.query.token as string;
  const channelId = parseInt(req.query.channelId as string);
  res.json(channelDetails(token, channelId));
});

app.post('/channel/join/v2', (req, res) => {
  const { token, channelId } = req.body;
  res.json(channelJoin(token, channelId));
});

app.post('/dm/create/v1', (req, res) => {
  const { token, uIds } = req.body;
  res.json(dmCreateV1(token, uIds));
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

/*
app.post('/message/senddm/v1', (req, res) => {
  const { token, dmId, message } = req.body;
  res.json(messageSenddm(token, dmId));
});
*/

app.get('/users/all/v1', (req, res) => {
  const token = req.query.token as string;
  res.json(usersAll(token));
});

app.delete('/clear/v1', (req, res) => {
  res.json(clearV1());
});

app.post('/save', (req, res) => {
  const data = getData();
  fs.writeFileSync('src/data.json', JSON.stringify(data), { flag: 'w' });
  res.json({});
});

const storedData = fs.readFileSync('src/data.json', { flag: 'r' });
setData(storedData);

// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
