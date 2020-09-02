import { IApp } from '@rheas/contracts/core';
import { SessionManager } from './sessionManager';
import { DeferredServiceProvider } from '@rheas/services';

export class SessionServiceProvider extends DeferredServiceProvider {
    /**
     * Registers a session manager on the app instance. Session manager
     * takes care of reading/writing/deleting session data.
     */
    public register() {
        this.container.singleton('session', (app) => {
            return new SessionManager(app as IApp);
        });
    }
}
