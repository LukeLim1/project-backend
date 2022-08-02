import request from 'sync-request';
import { createBasicChannel } from './channels.test';
import { url, port } from './config.json';
import { createBasicAccount, createBasicAccount2, clear, requestUserRemove, requestUserPermissionChange, 
        createBasicDm, requestJoinChannel, requestChannelDetails, requestDmDetails, createBasicAccount3, requestDmMessages, requestSendDm } from './helperFunctions';

const OK = 200;

beforeEach(() => {
    clear();
});

describe('userRemove tests using Jest', () => {
    test('Test successful userRemove', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const newUser2 = JSON.parse(String(createBasicAccount2().getBody()));
        const newChannel = JSON.parse(String(createBasicChannel(newUser.token, 'channel1', true).getBody()));
        const newDm = JSON.parse(String(createBasicDm(newUser.token, [newUser.authUserId, newUser2.authUserId]).getBody()));
        requestJoinChannel(newUser2.token, newChannel.channelId);

        const res = requestUserRemove(newUser.token, newUser2.authUserId);
        const bodyObj = JSON.parse(String(res.getBody()));

        const channelDetails = JSON.parse(String(requestChannelDetails(newUser.token, newChannel.channelId).getBody()));
        expect(channelDetails.allMembers.length).toBe(1);

        const dmDetails = JSON.parse(String(requestDmDetails(newUser.token, newDm.dmId).getBody()));
        expect(dmDetails.members.length).toBe(1);

        expect(res.statusCode).toBe(OK);
        expect(bodyObj).toMatchObject({});
    });

    test("Messages of removed user is shown as 'Removed user'", () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const newUser2 = JSON.parse(String(createBasicAccount2().getBody()));
        const newChannel = JSON.parse(String(createBasicChannel(newUser.token, 'channel1', true).getBody()));
        const newDm = JSON.parse(String(createBasicDm(newUser.token, [newUser.authUserId, newUser2.authUserId]).getBody()));
        requestJoinChannel(newUser2.token, newChannel.channelId);

        const res = requestUserRemove(newUser.token, newUser2.authUserId);
        const bodyObj = JSON.parse(String(res.getBody()));

        for (let i = 0; i < 10; i++) {
            requestSendDm(newUser2.token, newDm.dmId, 'Hi');
        }

        const dmMessages = JSON.parse(String(requestDmMessages(newUser2.token, newDm.dmId, 0).getBody()));
        console.log(dmMessages);

        expect(res.statusCode).toBe(OK);
        expect(bodyObj).toMatchObject({});
    })

    test('uId doesn\'t refer to valid user', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const newUser2 = JSON.parse(String(createBasicAccount2().getBody()));
        const res = requestUserRemove(newUser.token, newUser2.authUserId + 5);
        expect(res.statusCode).toBe(400);
    });

    test('uId refers to a user who is only global owner', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        JSON.parse(String(createBasicAccount2().getBody()));
        const res = requestUserRemove(newUser.token, newUser.authUserId);
        expect(res.statusCode).toBe(400);
    });

    test('authorised user is not global owner', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const newUser2 = JSON.parse(String(createBasicAccount2().getBody()));
        const res = requestUserRemove(newUser2.token, newUser.authUserId);
        expect(res.statusCode).toBe(403);
    });
});

describe('userPermissionChange tests using Jest', () => {
    test('Test successful userPermissionChange', () => {
        const newUser = JSON.parse(String(createBasicAccount().getBody()));
        const newUser2 = JSON.parse(String(createBasicAccount2().getBody()));

        const res = requestUserPermissionChange(newUser.token, newUser2.authUserId, 1);
        const bodyObj = JSON.parse(String(res.getBody()));

        expect(requestUserRemove(newUser2.token, newUser.authUserId).statusCode).toBe(OK);

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