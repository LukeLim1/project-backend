import {channelDetailsV1, channelJoinV1} from './channel';
import {authRegisterV1, authLoginV1} from './auth';
import {clearV1} from './other';
import {getData, setData} from './dataStore';

test('Testing successful channelDetailsV1', () => {
    clearV1();
    const owner = authRegisterV1('owner@email.com', '123456', 'Ada', 'Bob');
    const user1 = authRegisterV1('user1@email.com', '987654', 'Ocean', 'Hall');
    const channel1 = channelsCreateV1(owner.authUserId, 'channel#1', true);
    channelJoinV1(user1.authUserId, channel1.channelId);
    const result = channelDetailsV1(owner.authUserId, channel1.channelId);
    expect(result).toEqual('channel#1', true,
    // ownerMembers
    [
        {
            uId: 1,
            email: 'owner@email.com',
            nameFirst: 'Ada',
            nameLast: 'Bob',
            handleStr: 'ab1231',
        }
    ], 
    // allMembers
    [
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
    ]);
});

// code for testing channelJoinV1...
test('Testing successful channelJoinV1', () => {
    clearV1();
    
    channelJoinV1(4, 121212);
});

// code for testing error cases for channelDetailsV1...


// code for testing error cases for channelJoinV1...