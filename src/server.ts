import express, { json, Request, Response }  from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';

import { messageSend, dmList, dmRemove, dmDetails } from './Rick';

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

app.post('message/send/v1', (req: Request, res: Response) => {
  const { token, channelId, message } = req.body;

  res.json(messageSend( token, channelId, message ));
});



// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
