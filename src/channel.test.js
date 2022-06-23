import {channelDetailsV1, channelJoinV1} from './channel';
import { channelsCreateV1 } from './channels';
import {authRegisterV1} from './auth';
import {clearV1} from './other';
import { getData } from './dataStore';

test('Testing successful channelDetailsV1', () => {
    clearV1();
    const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
    const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');
    const channel1 = channelsCreateV1(owner.authUserId, 'channel#1', true);
    //channelJoinV1(user1.authUserId, channel1.channelId);
    const data = getData();
    console.log(data);
    const result = channelDetailsV1(owner.authUserId, channel1.channelId);
    expect(result).toMatchObject(
    {
        name: 'channel#1', 
        isPublic: true,
        ownerMembers: [
            {
                uId: 1,
                email: 'owner@email.com',
                nameFirst: 'Ada',
                nameLast: 'Bob',
                handleStr: 'ab1231',
            },
        ], 
        allMembers: [
            {
                uId: 1,
                email: 'owner@email.com',
                nameFirst: 'Ada',
                nameLast: 'Bob',
                handleStr: 'ab1231',
            },
            {
                uId: 2,
                email: 'user1@email.com',
                nameFirst: 'Ocean',
                nameLast: 'Hall',
                handleStr: 'oceanh',
            }
        ]
    });
});

// Error cases for channelJoinV1

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

// Error cases for channelDetailsV1

test('channelId valid, but the user is not a member', () => {
    clearV1();
    const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
    const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');
    const channel1 = channelsCreateV1(owner.authUserId, 'channel#1', false);
    expect(channelDetailsV1(user1.authUserId, channel1.channelId)).toMatchObject({ error: 'error' });
});