import { channelsListV1, channelsListallV1, channelsCreateV1 } from './channels';
import { clearV1 } from './other';
beforeEach(() => {
    clearV1();  
});
describe('ChannelsCreateV1', () => {
    test('Channel is created', () => {
        const namedChannel = channelsCreateV1('zacharychan', 'Snickers', true );
        expect(namedChannel).toBe('Snickers')
    });
    test('Channel name length is less than 1', () => {
        const namedChannel = channelsCreateV1('zacharychan', '', true );
        expect(namedChannel).toBe({error: 'error'})
    });
    test('Channel name length is less than 1', () => {
        const namedChannel = channelsCreateV1('zacharychan', 'snickersmarscadburysnakes', true );
        expect(namedChannel).toBe({error: 'error'})
    });

});    