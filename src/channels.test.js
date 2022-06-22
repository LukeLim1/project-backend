import { channelsListV1, channelsListallV1, channelsCreateV1 } from './channels';
import { clearV1 } from './other';
import { getData} from './dataStore';
import { authRegisterV1 } from './auth';
beforeEach(() => {
    clearV1();  
});
describe('ChannelsCreateV1 returns correct data information', () => {
    test('Channel is created', () => {
        const data = getData();
        const regTest = authRegisterV1('zachary@gmail.com', 'z5312386', 'Zachary', 'Chan'); 
        const namedChannel = channelsCreateV1(regTest, 'Snickers', true );
        expect(namedChannel).toMatchObject({channelId: expect.any(Number)});
    });
    test('Channel name length is less than 1', () => {
        const regTest = authRegisterV1('zachary@gmail.com', 'z5312386', 'Zachary', 'Chan'); 
        const namedChannel = channelsCreateV1(regTest, '', true );
        expect(namedChannel).toMatchObject({error: 'error'})
    });
    test('Channel name length is longer than 20', () => {
        const regTest = authRegisterV1('zachary@gmail.com', 'z5312386', 'Zachary', 'Chan'); 
        const namedChannel = channelsCreateV1(regTest, 'thisisanamethatwillbelongerthan20chars', true );
        expect(namedChannel).toMatchObject({error: 'error'})
    });
});    