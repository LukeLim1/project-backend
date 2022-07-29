<<<<<<< HEAD
import { echo } from './echo.js';

test('Test successful echo', () => {
  let result = echo('1');
  expect(result).toBe('1');
  result = echo('abc');
  expect(result).toBe('abc');
});

test('Test invalid echo', () => {
  expect(echo({ echo: 'echo' })).toStrictEqual({ error: 'error' });
});
=======
// import { echo } from './echo';
import request from 'sync-request';
import config from './config.json';

const OK = 200;
// const INPUT_ERROR = 400;
const url = config.url;
const port = config.port;

/*
Iteration 3
*/
describe('HTTP tests using Jest', () => {
  test('Test successful echo', () => {
    const res = request(
      'GET',
            `${url}:${port}/echo`,
            {
              qs: {
                echo: 'Hello',
              }
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual('Hello');
  });
  // test('Test invalid echo', () => {
  //   const res = request(
  //     'GET',
  //           `${url}:${port}/echo`,
  //           {
  //             qs: {
  //               echo: 'echo',
  //             }
  //           }
  //   );
  //   const bodyObj = JSON.parse(res.body as string);
  //   expect(res.statusCode).toBe(INPUT_ERROR);
  //   expect(bodyObj.error).toStrictEqual({ message: 'Cannot echo "echo"' });
  // });
});
// function requestHelper(method: HttpVerb, path: string, payload: object) {
//   let qs = {};
//   let json = {};
//   if (['GET', 'DELETE'].includes(method)) {
//     qs = payload;
//   } else {
//     // PUT/POST
//     json = payload;
//   }
//   const res = request(method, `${url}:${port}` + path, { qs, json });
//   return JSON.parse(res.getBody() as string);
// }
// function echo(message: string) {
//   return requestHelper('GET', '/echo', { message });
// }
// describe('/echo', () => {
//   test('success', () => {
//     expect(echo('helloworld')).toStrictEqual({message: 'helloworld'} );
//   });
// });
>>>>>>> 23ab0a9897f3394234ea3b3f3f24bd62f287f0e9
