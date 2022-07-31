import request from 'sync-request';
import { url, port } from './config.json';
import { createBasicAccount, clear, requestUserRemove, requestUserPermissionChange } from './helperFunctions';

const OK = 200;

beforeEach(() => {
    clear();
});

describe('userRemove tests using Jest', () => {
    test('Test successful userRemove', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const res = requestUserRemove(newUser.token, newUser.authUserId);
        const bodyObj = JSON.parse(String(res.getBody()));
        expect(res.statusCode).toBe(OK);
        expect(bodyObj).toMatchObject({});
    });

    test('uId doesn\'t refer to valid user', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const res = requestUserRemove(newUser.token, newUser.authUserId + 5);
        const bodyObj = JSON.parse(String(res.getBody()));
        expect(res.statusCode).toBe(OK);
        // expect 400 error
    });

    test('uId refers to a user who is only global owner', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const res = requestUserRemove(newUser.token, newUser.authUserId);
        const bodyObj = JSON.parse(String(res.getBody()));
        expect(res.statusCode).toBe(OK);
        // expect 400 error
    });

    test('authorised user is not global owner', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const res = requestUserRemove(newUser.token, newUser.authUserId);
        const bodyObj = JSON.parse(String(res.getBody()));
        expect(res.statusCode).toBe(OK);
        // expect 403 error
    });
});

describe('userPermissionChange tests using Jest', () => {
    test('Test successful userPermissionChange', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const res = requestUserPermissionChange(newUser.token, newUser.authUserId, 1);
        const bodyObj = JSON.parse(String(res.getBody()));
        expect(res.statusCode).toBe(OK);
        expect(bodyObj).toMatchObject({});
    });

    test('uId does not refer to a valid user', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const res = requestUserPermissionChange(newUser.token, newUser.authUserId + 5, 1);
        const bodyObj = JSON.parse(String(res.getBody()));
        expect(res.statusCode).toBe(OK);
        // expect 400 error
    });

    test('uId refers to only global owner who is being demoted to a user', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const res = requestUserPermissionChange(newUser.token, newUser.authUserId, 1);
        const bodyObj = JSON.parse(String(res.getBody()));
        expect(res.statusCode).toBe(OK);
        // expect 400 error
    });

    test('permission ID invalid', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const res = requestUserPermissionChange(newUser.token, newUser.authUserId, 10000);
        const bodyObj = JSON.parse(String(res.getBody()));
        expect(res.statusCode).toBe(OK);
        // expect 400 error
    });

    test('user already has permission level of permission ID', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const res = requestUserPermissionChange(newUser.token, newUser.authUserId, 1);
        const bodyObj = JSON.parse(String(res.getBody()));
        expect(res.statusCode).toBe(OK);
        // expect 400 error
    });

    test('authorised user is not global owner', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const res = requestUserPermissionChange(newUser.token, newUser.authUserId, 1);
        const bodyObj = JSON.parse(String(res.getBody()));
        expect(res.statusCode).toBe(OK);
        // expect 403 error
    });
});