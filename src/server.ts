import express, { json, Request, Response }  from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { authLoginV1, authRegisterV1 } from './auth';
import { channelsCreateV1 } from './channels';

import { messageSend, dmList, dmRemove, dmDetails } from './Rick';
import { dmTemplate } from './dm';

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
  console.log('auth/register/V2');
  const { email, password, nameFirst, nameLast } = req.body;
  // returns { token, authUserid }
  res.json(authRegisterV1(email, password, nameFirst, nameLast));
});
app.post('/auth/login/v2', (req, res) => {
  console.log('auth/login/V2');
  const { email, password } = req.body;
  // returns { token, authUserid }
  res.json(authLoginV1(email, password));
});
app.post('/channels/create/v2', (req, res) => {
  console.log('channels/create/V2');
  const { token, name, isPublic } = req.body;
  // returns channelId
  res.json(channelsCreateV1(token, name, isPublic));
});

app.post('message/send/v1', (req, res) => {
  const { token, channelId, message } = req.body;
  res.json(messageSend(token, channelId, message));
});

app.get('dm/list/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  res.json(dmList(token));
});

app.get('dm/details/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const dmId = req.query.dmId as string;
  res.json(dmDetails(token as string, parseInt(dmId)));
});

app.delete('/dm/remove/v1', (req: Request, res: Response) => {
  
  
  res.json({});
});


// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
