import { Str } from '@rheas/support';
import { Session } from '../src/session';

describe('Test session object', () => {
    /**
     * A session id should be created with an 
     */
    it('Session creation', async () => {
        // Valid session id
        let random = await Str.random(40);
        expect(new Session(random)).toBeInstanceOf(Session);

        // No id should throw error
        expect(() => new Session()).toThrow();

        // Invalid id to throw error
        expect(() => new Session('_idisinvalid')).toThrow();
    });
});
