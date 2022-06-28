import {channelDetailsV1, channelJoinV1, channelMessagesV1, channelInviteV1} from './channel.js';
import { channelsCreateV1 } from './channels.js';
import {authRegisterV1} from './auth.js';
import {clearV1} from './other.js';

test('Testing successful channelDetailsV1 and channelJoinV1', () => {
    clearV1();
    const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
    const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');
    const channel1 = channelsCreateV1(owner.authUserId, 'channel#1', true);
    expect(channelJoinV1(user1.authUserId, channel1.channelId)).toMatchObject({});

    expect(channelDetailsV1(owner.authUserId, channel1.channelId)).toMatchObject(
    {
        name: 'channel#1', 
        isPublic: true,
        ownerMembers: [
            {
                uId: owner.authUserId,
                email: 'owner@email.com',
                nameFirst: 'Ada',
                nameLast: 'Bob',
                handleStr: 'adabob',
            },
        ], 
        allMembers: [
            {
                uId: owner.authUserId,
                email: 'owner@email.com',
                nameFirst: 'Ada',
                nameLast: 'Bob',
                handleStr: 'adabob',
            },
            {
                uId: user1.authUserId,
                email: 'user1@email.com',
                nameFirst: 'Ocean',
                nameLast: 'Hall',
                handleStr: 'oceanhall',
            }
        ]
    });
});

// Error cases

test('channelId does not refer to valid channel', () => {
    clearV1();
    const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
    const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');
    const channel1 = channelsCreateV1(owner.authUserId, 'channel#1', true);
    expect(channelJoinV1(user1.authUserId, channel1.channelId + 5)).toMatchObject({ error: 'error' });

    // Same test for channelDetailsV1
    expect(channelDetailsV1(owner.authUserId, channel1.channelId + 5)).toMatchObject({ error: 'error' });
});

test('authorised user is already a member', () => {
    clearV1();
    const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
    const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');
    const channel1 = channelsCreateV1(owner.authUserId, 'channel#1', true);
    channelJoinV1(user1.authUserId, channel1.channelId);
    expect(channelJoinV1(user1.authUserId, channel1.channelId)).toMatchObject({ error: 'error' });
});

test('channelId refers to private channel and the user is not channel member nor global owner', () => {
    clearV1();
    const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
    const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');
    const channel1 = channelsCreateV1(owner.authUserId, 'channel#1', false);
    expect(channelJoinV1(user1.authUserId, channel1.channelId)).toMatchObject({ error: 'error' });
});

test('channelId valid, but the user is not a member', () => {
    clearV1();
    const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
    const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');
    const channel1 = channelsCreateV1(owner.authUserId, 'channel#1', false);
    expect(channelDetailsV1(user1.authUserId, channel1.channelId)).toMatchObject({ error: 'error' });
});

// Tests for channelInviteV1
describe('channelInviteV1', () => {
    let channelID, uID, authUserID;
    beforeEach ( () => {
        clearV1();
        uID = authRegisterV1('uniquepeterrabbit@gmail.com', 'qgi6dt', 'Peter', 'Rabbit').authUserId;
        authUserID = authRegisterV1('uniqueBobLovel@gmail.com', 'qgi6dt', 'Bob', 'Lovel').authUserId;
        channelID = channelsCreateV1(authUserID, 'animal_kingdom', true).channelId;
    });

    describe('Error cases', () => {
        
        test('Invalid user', () => {   
            expect(channelInviteV1(authUserID, channelID, uID + 1)).toEqual({ error: 'error' });
        });

        test('Invalid channel', () => {   
            expect(channelInviteV1(authUserID, channelID + 1, uID)).toEqual({ error: 'error' });
        });

        test('User is already a member of this channel', () => {   
            expect(channelInviteV1(authUserID, channelID, authUserID)).toEqual({ error: 'error' });
        });

        test('User is already authorised but membership of this channel is still not granted', () => {   
            expect(channelInviteV1(uID, channelID, uID)).toEqual({ error: 'error' });
        });

    });

    describe('No errors: expected ideal cases', () => {
        
        test('Invitation successful!', () => {
            channelInviteV1(authUserID, channelID, uID);   
            expect(channelInviteV1(authUserID, channelID, uID)).toMatchObject({});
        });
    });
});

// Tests for channelMessageV1
describe('channelMessagesV1', () => {
    let channelID, uID, authUserID, start, message;
    beforeEach ( () => {
        clearV1();
        uID = authRegisterV1('uniquepeterrabbit@gmail.com', 'qgi6dt', 'Peter', 'Rabbit').authUserId;
        authUserID = authRegisterV1('uniqueBobLovel@gmail.com', 'qgi6dt', 'Bob', 'Lovel').authUserId;
        channelID = channelsCreateV1(authUserID, 'animal_kingdom', true).channelId;
    });

    describe('Error cases', () => {
        
        test('Invalid channel', () => {   
            start = 0;
            expect(channelMessagesV1(authUserID, channelID + 1, start)).toEqual({ error: 'error' });
        });

        test('start is greater than the total no. of messages in the channel', () => {   
            start = 100;
            expect(channelMessagesV1(authUserID, channelID, start)).toEqual({ error: 'error' });
        });

        test('User is already authorised but membership of this channel is still not granted', () => { 
            start = 0;  
            expect(channelMessagesV1(uID, channelID, start)).toEqual({ error: 'error' });
        });
    });

    describe('No errors: expected ideal cases', () => {
        
        test('Messages retrieval successful!', () => {
            const start = 0;
            let resultActual = channelMessagesV1(authUserID, channelID, start);
            expect(resultActual).toMatchObject({ 
                messages: [],
                start: 0,
                end: -1
            });
        });
    });
});