import { IApp } from '@rheas/contracts/core';
import { SessionManager } from './sessionManager';
import { DeferredServiceProvider } from '@rheas/services';
import { InstanceHandler } from '@rheas/contracts/container';

export class SessionServiceProvider extends DeferredServiceProvider {
    /**
     * Returns the session's service resolver.
     *
     * @returns
     */
    public serviceResolver(): InstanceHandler {
        return (app) => new SessionManager(app as IApp);
    }
}
