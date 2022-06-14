import {channelDetailsV1, channelJoinV1} from './channel';
import {clearV1} from './other';

test('Testing successful channelDetailsV1', () => {
    clearV1();
    const result = channelDetailsV1(4343, 121212);
    expect(result).toBe('channel#1', true,
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
            uId: 2,
            email: 'user1@email.com',
            nameFirst: 'Ocean',
            nameLast: 'Hall',
            handleStr: 'oceanh',
        },
        {
            uId: 3,
            email: 'user2@email.com',
            nameFirst: 'Lucien',
            nameLast: 'Erwin',
            handleStr: 'Lerwin2022',
        }
    ]);
});

// code for testing error cases for channelDetailsV1...

// code for testing channelJoinV1...

// code for testing error cases for channelJoinV1...