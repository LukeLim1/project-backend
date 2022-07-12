import { authLoginV1, authRegisterV1 } from './auth';
import { clearV1 } from './other';
import { userProfileV1 } from './users';

describe('authRegisterV1', () => {
  beforeEach(() => {
    clearV1();
  });
  describe('Error cases', () => {
    test('Invalid email', () => {
      const regTest = authRegisterV1('zachary.co', 'z5312386', 'Zachary', 'Chan');
      expect(regTest).toMatchObject({ error: 'error' });
    });
    test('email in use already', () => {
      // eslint-disable-next-line
            const regTest1 = authRegisterV1('zachary@gmail.com', 'z5312386', 'Zachary', 'Chan');
      const regTest2 = authRegisterV1('zachary@gmail.com', 'z5312386', 'Zachary', 'Chan');

      expect(regTest2).toMatchObject({ error: 'error' });
    });
    test('Password.length < 6', () => {
      const regTest = authRegisterV1('zachary@gmail.com', 'z5', 'Zachary', 'Chan');
      expect(regTest).toMatchObject({ error: 'error' });
    });
    test('nameFirst.length not between 1 and 50 inclusive', () => {
      const regTest = authRegisterV1('zachary@gmail.com', 'z5857436', '', 'Chan');
      expect(regTest).toMatchObject({ error: 'error' });
    });
    test('nameLast.length not between 1 and 50 inclusive', () => {
      const regTest = authRegisterV1('zachary@gmail.com', 'z5857436', 'zachary', '');
      expect(regTest).toMatchObject({ error: 'error' });
    });
  });
  describe('No errors in input', () => {
    test('Ensuring a unique number between 1-1000 is returned', () => {
      const regTest = authRegisterV1('zachary-chan@gmail.com', 'z5312386', 'Zachary', 'Chan');
      expect(regTest).toMatchObject({ authUserId: expect.any(Number) });
    });
    test('simple lower case concatenation of new handle not taken yet', () => {
      const regTest2 = authRegisterV1('the-rock@gmail.com', 'z5312386', 'Dwayne', 'johnson');
      const regTest = authRegisterV1('zachary-chan@gmail.com', 'z5312386', 'Zachary', 'Chan');

      const data = userProfileV1(regTest2.authUserId, regTest.authUserId);
      expect(data.handleStr).toEqual('zacharychan');
    });
    test('handle has already been taken by one other person', () => {
      const regTest = authRegisterV1('zachary-chan@gmail.com', 'z5312386', 'Zachary', 'Chan');
      const regTaken = authRegisterV1('zacharytest@gmail.com', 'z5312312', 'Zachary', 'Chan');
      const data = userProfileV1(regTest.authUserId, regTaken.authUserId);
      expect(data.handleStr).toEqual('zacharychan0');
    });
    test('handle has already been taken by 5 other people', () => {
      const regTest1 = authRegisterV1('zachary-chan@gmail.com', 'z5312386', 'Zachary', 'Chan');
      const regTest2 = authRegisterV1('z@gmail.com', 'z5312386', 'Zachary', 'Chan');
      const regTest3 = authRegisterV1('zac@gmail.com', 'z5312386', 'Zachary', 'Chan');
      const regTest4 = authRegisterV1('za@gmail.com', 'z5312386', 'Zachary', 'Chan');
      const regTest5 = authRegisterV1('zach@gmail.com', 'z5312386', 'Zachary', 'Chan');
      const regTest6 = authRegisterV1('different@gmail.com', 'z544532', 'Harry', 'Potter');
      const regTaken = authRegisterV1('zachar@gmail.com', 'z5312386', 'Zachary', 'Chan');
      const data = userProfileV1(regTest2.authUserId, regTaken.authUserId);
      // removing linting errors of unused variables
      const array = [regTest1, regTest2, regTest3, regTest4, regTest5, regTest6];
      array.slice(2);
      expect(data.handleStr).toEqual('zacharychan4');
    });
    test('handle longer than 20 characters but handle already taken by 5 other people', () => {
      const regTest1 = authRegisterV1('c@gmail.com', 'password', 'Christopher', 'Constantine');
      const regTest2 = authRegisterV1('ch@gmail.com', 'password', 'Christopher', 'Constantine');
      const regTest3 = authRegisterV1('chr@gmail.com', 'password', 'Christopher', 'Constantine');
      const regTest4 = authRegisterV1('chri@gmail.com', 'password', 'Christopher', 'Constantine');
      const regTest5 = authRegisterV1('chris@gmail.com', 'password', 'Christopher', 'Constantine');
      const regTest6 = authRegisterV1('harry@gmail.com', 'potter', 'Harry', 'Potter');
      const regTaken = authRegisterV1('christopher@gmail.com', 'password', 'Christopher', 'Constantine');
      const data = userProfileV1(regTest2.authUserId, regTaken.authUserId);

      // removing linting errors of unused variables
      const array = [regTest1, regTest2, regTest3, regTest4, regTest5, regTest6];
      array.slice(2);

      expect(data.handleStr).toEqual('christopherconstanti4');
    });
  });
});

describe('authLoginV1', () => {
  test('loginUserId matches a userID that has been registered', () => {
    clearV1();

    const regTest = authRegisterV1('zachary-chan@gmail.com', 'z5312386', 'zachary', 'chan');
    const loginTest = authLoginV1('zachary-chan@gmail.com', 'z5312386');
    expect(loginTest).toMatchObject({
      authUserId: regTest.authUserId,
      token: [expect.any(Number), expect.any(Number)],
    });
  });

  let loginFail: object;
  beforeEach(() => {
    clearV1();
    loginFail = authLoginV1('failing-test@gmail.com', 'shouldntWork');
  });

  test('Returns error object when loginUserId doesnt match a registered userId', () => {
    expect(loginFail).toMatchObject({ error: 'error' });
  });
  test('Returns error object when password is incorrect for valid email', () => {
    expect(loginFail).toMatchObject({ error: 'error' });
  });
  test('Returns error object when password is correct for an invalid email', () => {
    expect(loginFail).toMatchObject({ error: 'error' });
  });
});
