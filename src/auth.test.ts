<<<<<<< HEAD
import { authLoginV1, authRegisterV1 } from './auth.js';
import { clearV1 } from './other.js';
import { getData} from './dataStore.js';
import { userProfileV1 } from './users.js';

describe('authRegisterV1', () => {
    beforeEach ( () => {
        clearV1();  
    });
    describe('Error cases', () => {
        test('Invalid email', () => {   
            const regTest = authRegisterV1('zachary.co', 'z5312386', 'Zachary', 'Chan'); 
            expect(regTest).toMatchObject({error: 'error'})
            
        });
        test('email in use already', () => {   
            const regTest1 = authRegisterV1('zachary@gmail.com', 'z5312386', 'Zachary', 'Chan');
            const regTest2 = authRegisterV1('zachary@gmail.com', 'z5312386', 'Zachary', 'Chan'); 
            expect(regTest2).toMatchObject({error: 'error'})
            
        });
        test('Password.length < 6', () => {   
            const regTest = authRegisterV1('zachary@gmail.com', 'z5', 'Zachary', 'Chan'); 
            expect(regTest).toMatchObject({error: 'error'})
        });
        test('nameFirst.length not between 1 and 50 inclusive', () => {   
            const regTest = authRegisterV1('zachary@gmail.com', 'z5857436', '', 'Chan'); 
            expect(regTest).toMatchObject({error: 'error'})
        });
        test('nameLast.length not between 1 and 50 inclusive', () => {   
            const regTest = authRegisterV1('zachary@gmail.com', 'z5857436', 'zachary', ''); 
            expect(regTest).toMatchObject({error: 'error'})
        });
    });
    describe('No errors in input', () => {
        test('Ensuring a unique number between 1-1000 is returned', () => {   
            const regTest = authRegisterV1('zachary-chan@gmail.com', 'z5312386', 'Zachary', 'Chan'); 
            expect(regTest).toMatchObject({authUserId: expect.any(Number)})
            
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
            expect(data.handleStr).toEqual('christopherconstanti4');
        });
    });    
});

describe('authLoginV1', () => {
    test('loginUserId matches a userID that has been registered', () => {
        clearV1();
        const data = getData();
        const regTest = authRegisterV1('zachary-chan@gmail.com', 'z5312386', 'zachary', 'chan');
        const loginTest = authLoginV1('zachary-chan@gmail.com', 'z5312386');
        expect(loginTest).toMatchObject(regTest); 
    });
    
    let loginFail;
    beforeEach(() => {
        clearV1();    
        loginFail = authLoginV1('failing-test@gmail.com', 'shouldntWork'); 
    });
    
    test("Returns error object when loginUserId doesnt match a registered userId", () => {
        expect(loginFail).toMatchObject({error: 'error'});
    });
    test("Returns error object when password is incorrect for valid email", () => {   
        expect(loginFail).toMatchObject({error: 'error'});
    });
    test("Returns error object when password is correct for an invalid email", () => {
        expect(loginFail).toMatchObject({error: 'error'});

    }); 
});   
=======
import request from 'sync-request';
import config from './config.json';
import { newReg, clear, createBasicAccount } from './helperFunctions';

const OK = 200;
const port = config.port;
const url = config.url;

describe('authRegisterV2', () => {
  test('Ensuring a unique number is returned', () => {
    clear();

    const res = newReg('zachary-chan@gmail.com', 'z5312386', 'Zach', 'Chan');
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({
      authUserId: expect.any(Number),
      token: expect.any(String)
    });
  });
  test('Length of either nameFirst or nameLast not between 1-50 chars', () => {
    clear();
    const res = newReg('zachary-chan@gmail.com', 'z5312386', '', '');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  test('invalid email', () => {
    clear();
    const res = newReg('57', 'z5312386', 'zachary', 'chan');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });
  test('email already used', () => {
    clear();
    const res = newReg('zachary-chan@gmail.com', 'z5312386', 'zachary', 'chan');
    const res2 = newReg('zachary-chan@gmail.com', 'z5312386', 'zachary', 'chan');

    const bodyObj = JSON.parse(String(res2.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(res2.statusCode).toBe(OK);

    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });
  test('password length < 6', () => {
    clear();

    const res = newReg('zachary-chan@gmail.com', 'z5', 'Zach', 'Chan');
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  describe('authLoginV2', () => {
    test('Ensuring a unique number is returned login', () => {
      clear();
      newReg('zachary-chan@gmail.com', 'z5312386', 'Zach', 'Chan');
      const res = request(
        'POST',
      `${url}:${port}/auth/login/v2`,
      {
        body: JSON.stringify({
          email: 'zachary-chan@gmail.com',
          password: 'z5312386',
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
      );
      const expectedNum = [1, 2];
      const expectedStr = expectedNum.map(num => {
        return String(num);
      });
      const bodyObj = JSON.parse(String(res.getBody()));
      expect(res.statusCode).toBe(OK);
      expect(bodyObj).toMatchObject({
        token: expectedStr
      });
    });

    test('Returns error when email is invalid', () => {
      clear();
      newReg('zachary-chan@gmail.com', 'z5312386', 'Zach', 'Chan');
      const res = request(
        'POST',
      `${url}:${port}/auth/login/v2`,
      {
        body: JSON.stringify({
          email: 'broken@gmail.com',
          password: 'z5312386',
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
      );
      const bodyObj = JSON.parse(String(res.getBody()));
      expect(res.statusCode).toBe(OK);
      expect(bodyObj).toMatchObject({ error: expect.any(String) });
    });
  });

  test('incorrect password', () => {
    clear();
    newReg('zachary-chan@gmail.com', 'z5312386', 'Zach', 'Chan');
    const res = request(
      'POST',
    `${url}:${port}/auth/login/v2`,
    {
      body: JSON.stringify({
        email: 'zachary-chan@gmail.com',
        password: 'z531',
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toMatchObject({ error: expect.any(String) });
  });

  describe('authLogout', () => {
    test('Testing successful authLogout', () => {
      clear();
      const basicA = createBasicAccount();
      const newUser = JSON.parse(String(basicA.getBody()));

      const res = request(
        'POST',
      `${url}:${port}/auth/logout/v1`,
      {
        body: JSON.stringify({
          token: newUser.token,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
      );

      const bodyObj = JSON.parse(String(res.getBody()));
      expect(res.statusCode).toBe(OK);
      expect(bodyObj).toMatchObject({});
    });
  });
});
>>>>>>> 23ab0a9897f3394234ea3b3f3f24bd62f287f0e9
