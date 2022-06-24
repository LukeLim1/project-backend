import { clearV1 } from './other';
import { authRegisterV1 } from './auth.js'
import { userProfileV1 } from './users';

describe('authRegisterV1', () => {
    let uId, authUserId;
    beforeEach(() => {
        clearV1();
        uId = authRegisterV1('yoloemail@gmail.com', 'drtfg1', 'Heron', 'Yolo').authUserId;
        authUserId = authRegisterV1('benmail2@gmail.com', 'drtfg1', 'Ben', 'Floyd').authUserId;
    });

    describe('Error cases', () => {
        test('invalid user', () => {
            expect(userProfileV1(authUserId, uId + 1)).toEqual({ error: 'error' });
        });
    });

    describe('No errors', () => {
        test('profile success', () => {
            let returnUser = {
                userId: uId,
                emailAddress: 'yoloemail@gmail.com',
                nameFirst: 'Heron',
                nameLast: 'Yolo',
                handle: 'heronyolo'
            }
            expect(userProfileV1(authUserId, uId)).toEqual({returnUser});
        });
    });
});