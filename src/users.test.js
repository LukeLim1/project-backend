import { clearV1 } from './other.js';
import {authRegisterV1} from './auth.js';
import { userProfileV1 } from './users.js';

test('Test successful userProfileV1', () => {
  clearV1();
  const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
  const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');
  const result = userProfileV1(owner.authUserId, user1.authUserId);
  
  expect(result).toMatchObject({
    uId: user1.authUserId, 
    email: 'user1@email.com',
    nameFirst: 'Ocean',
    nameLast: 'Hall',
    handleStr: 'oceanhall',
  });
});


describe('authRegisterV1', () => {
    let uId, authUserId;
    beforeEach(() => {
        clearV1();
        uId = authRegisterV1('yoloemail@gmail.com', 'drtfg1', 'Heron', 'Yolo').authUserId;
        authUserId = authRegisterV1('benmail2@gmail.com', 'drtfg1', 'Ben', 'Floyd').authUserId;
    });

    describe('Error cases', () => {
        test('invalid user', () => {
            console.log(uId);
            console.log(authUserId);
            expect(userProfileV1(authUserId, uId + 100)).toMatchObject({ error: 'error' });
        });
    });

    describe('No errors', () => {
        test('profile success', () => {
            let returnUser = {
                uId: uId,
                email: 'yoloemail@gmail.com',
                nameFirst: 'Heron',
                nameLast: 'Yolo',
                handleStr: 'heronyolo',
            }
            expect(userProfileV1(authUserId, uId)).toMatchObject(returnUser);
        });
    });
});