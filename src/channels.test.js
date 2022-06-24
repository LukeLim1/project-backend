import { channelsListV1, channelsListallV1, channelsCreateV1 } from './channels.js';
import { clearV1 } from './other.js';
import { getData} from './dataStore.js';
import { authRegisterV1 } from './auth.js';
beforeEach(() => {
    clearV1();
    const data = getData();  
});
describe('ChannelsCreateV1 returns correct data information', () => {
    test('Channel is created', () => {
        const regTest = authRegisterV1('zachary@gmail.com', 'z5312386', 'Zachary', 'Chan'); 
        const namedChannel = channelsCreateV1(regTest, 'Snickers', true );
        const data = getData();
        expect(namedChannel).toMatchObject({channelId: expect.any(Number)});
    });
    test('Channel name length is less than 1', () => {
        const regTest = authRegisterV1('zachary@gmail.com', 'z5312386', 'Zachary', 'Chan'); 
        const namedChannel = channelsCreateV1(regTest, '', true );
        const data = getData();
        expect(namedChannel).toMatchObject({error: 'error'})
    });
    test('Channel name length is longer than 20', () => {
        
        const regTest = authRegisterV1('zachary@gmail.com', 'z5312386', 'Zachary', 'Chan'); 
        const namedChannel = channelsCreateV1(regTest, 'thisisanamethatwillbelongerthan20chars', true );
        const data = getData();
        expect(namedChannel).toMatchObject({error: 'error'})
    });
    test('Ensuring the whole channels object is created with the correct parameters', () => {
        const regTest = authRegisterV1('zachary@gmail.com', 'z5312386', 'Zachary', 'Chan'); 
        const namedChannel = channelsCreateV1(regTest, 'Snickers', true );
        const data = getData();
        expect(data.channels[0]).toMatchObject({
            name: 'Snickers',
            isPublic: true, 
            ownerMembers: [regTest],
            allMembers: [regTest],
            channelId: expect.any(Number),
        })
    });
});    


describe('Functionality tests of channelsListV1', () => {
    
    test('test if it lists all authorised users that is part of', () => {
        clearV1();
        const data = getData();

        const user1 = authRegisterV1('user@email.com', '123456', 'Ada', 'Bob');
        const user2 = authRegisterV1('user2@email.com', '123456', 'Canthy', 'David');
        
        const channel1 = channelsCreateV1(user1, 'channel#1', true);
        const channel2 = channelsCreateV1(user2, 'channel#2', true);

        expect(channelsListV1(user1)).toMatchObject([
        {
            channelId: channel1.channelId,
            name: 'channel#1',
        }
        ]);
    });
  
});
// new users => return emtpy array. (check the length of the array to be 0)


describe('Functionality tests of channelsListallV1', () => {

    test('test if it lists all channels', () => {
        clearV1();
        const data = getData();

        const user1 = authRegisterV1('user1@email.com', '123456', 'Ada', 'Bob');
        const user2 = authRegisterV1('user2@email.com', '123456', 'Canthy', 'David');

        const channel1 = channelsCreateV1(user1, 'channel#1', true);
        const channel2 = channelsCreateV1(user2, 'channel#2', true);

        expect(channelsListallV1(user1)).toMatchObject([
        {
            channelId: channel1.channelId,
            name: 'channel#1',
            
        },
        {
            channelId: channel2.channelId,
            name: 'channel#2',
        }
        ]);
    });
});
