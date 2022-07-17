import { dmCreateV1 } from './dm';
import { authRegisterV1 } from './auth';
import { clearV1 } from './other';

describe('Dm return values', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Valid creation of a DM', () => {
    const regTest1 = authRegisterV1('c@gmail.com', 'password', 'Cc', 'Cc');
    const regTest2 = authRegisterV1('ch@gmail.com', 'password', 'zz', 'zz');
    const regTest5 = authRegisterV1('chris@gmail.com', 'password', 'aa', 'aa');
    const regTest6 = authRegisterV1('harry@gmail.com', 'potter', 'tt', 'tt');
    const regTaken = authRegisterV1('christopher@gmail.com', 'password', 'bb', 'bb');
    // remove lint errors
    const lintArray = [regTaken];
    lintArray.slice(0);

    const array = [regTest1.authUserId, regTest2.authUserId, regTest5.authUserId, regTest6.authUserId];
    const test = dmCreateV1(regTest5.token, array);

    expect(test).toMatchObject({ identifier: expect.any(Number) });
  });
  test('invalid creation of a dm', () => {
    const regTest1 = authRegisterV1('c@gmail.com', 'password', 'Cc', 'Cc');
    const regTest2 = authRegisterV1('ch@gmail.com', 'password', 'zz', 'zz');
    const regTest5 = authRegisterV1('chris@gmail.com', 'password', 'aa', 'aa');
    const regTest6 = authRegisterV1('harry@gmail.com', 'potter', 'tt', 'tt');
    const regTaken = authRegisterV1('christopher@gmail.com', 'password', 'bb', 'bb');
    // remove lint errors
    const lintArray = [regTest6, regTaken];
    lintArray.slice(0);

    // uIds array isnt a subset of all registered users
    const array1 = [regTest1.authUserId, regTest2.authUserId, regTest5.authUserId, 2999990];
    expect(dmCreateV1(regTest5.token, array1)).toMatchObject({ error: 'error' });
    // duplicates in uIds array
    const array2 = [regTest1.authUserId, regTest5.authUserId, regTest5.authUserId];

    expect(dmCreateV1(regTest5.token, array2)).toMatchObject({ error: 'error' });

    // valid token
    expect(dmCreateV1('helllllooooooo', array2)).toMatchObject({ error: 'error' });
  });
});
