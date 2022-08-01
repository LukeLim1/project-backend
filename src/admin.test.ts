import request from 'sync-request';
import { createBasicChannel } from './channels.test';
import { url, port } from './config.json';
import { createBasicAccount, createBasicAccount2, clear, requestUserRemove, requestUserPermissionChange, createBasicDm, requestJoinChannel, requestChannelDetails } from './helperFunctions';

const OK = 200;

beforeEach(() => {
    clear();
});

describe('userRemove tests using Jest', () => {
    test('Test successful userRemove', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const newUser2 = JSON.parse(String(createBasicAccount2().getBody()));
        const newChannel = JSON.parse(JSON.stringify(createBasicChannel(newUser.token, 'channel1', true)));
        const newDm = JSON.parse(JSON.stringify(createBasicDm(newUser.token, [newUser.authUserId, newUser2.authUserId])));
        requestJoinChannel(newUser2.token, newChannel.channelId);

        const res = requestUserRemove(newUser.token, newUser2.authUserId);
        const bodyObj = JSON.parse(String(res.getBody()));

        const channelDetails = JSON.parse(JSON.stringify(requestChannelDetails(newUser.token, newChannel.channelId)));
        console.log(channelDetails);

        expect(res.statusCode).toBe(OK);
        expect(bodyObj).toMatchObject({});
    });

    test('uId doesn\'t refer to valid user', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const res = requestUserRemove(newUser.token, newUser.authUserId + 5);
        const bodyObj = JSON.parse(String(res.getBody()));
        expect(res.statusCode).toBe(400);
    });

    test('uId refers to a user who is only global owner', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const res = requestUserRemove(newUser.token, newUser.authUserId);
        const bodyObj = JSON.parse(String(res.getBody()));
        expect(res.statusCode).toBe(400);
    });

    test('authorised user is not global owner', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const res = requestUserRemove(newUser.token, newUser.authUserId);
        const bodyObj = JSON.parse(String(res.getBody()));
        expect(res.statusCode).toBe(403);
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
        expect(res.statusCode).toBe(400);
    });

    test('uId refers to only global owner who is being demoted to a user', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const res = requestUserPermissionChange(newUser.token, newUser.authUserId, 1);
        const bodyObj = JSON.parse(String(res.getBody()));
        expect(res.statusCode).toBe(400);
    });

    test('permission ID invalid', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const res = requestUserPermissionChange(newUser.token, newUser.authUserId, 10000);
        const bodyObj = JSON.parse(String(res.getBody()));
        expect(res.statusCode).toBe(400);
    });

    test('user already has permission level of permission ID', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const res = requestUserPermissionChange(newUser.token, newUser.authUserId, 1);
        const bodyObj = JSON.parse(String(res.getBody()));
        expect(res.statusCode).toBe(400);
    });

    test('authorised user is not global owner', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const res = requestUserPermissionChange(newUser.token, newUser.authUserId, 1);
        const bodyObj = JSON.parse(String(res.getBody()));
        expect(res.statusCode).toBe(403);
    });
});