import { KeyValue } from '@rheas/contracts';
import { IApp } from '@rheas/contracts/core';
import { FileStore } from './stores/fileStore';
import { ServiceProvider } from '@rheas/services';
import { SessionManager } from './sessionManager';
import { ISessionStore } from '@rheas/contracts/sessions';
import { IDriverManager } from '@rheas/contracts/services';
import { InstanceHandler } from '@rheas/contracts/container';

type StoreGetter = undefined | ((app: IApp) => ISessionStore);

export class SessionServiceProvider extends ServiceProvider {
    /**
     * Store registrars mapped to store keys.
     *
     * @var KeyValue
     */
    protected stores: KeyValue<StoreGetter> = {
        file: this.getFileStore,
    };

    /**
     * Returns the session's service resolver. Sessions are
     * created on the request lifecycle.
     *
     * @returns
     */
    public serviceResolver(): InstanceHandler {
        return (request) => {
            const app: IApp = request.get('app');
            const sessionManager = new SessionManager(app);

            this.registerStore(app, sessionManager);

            return sessionManager;
        };
    }

    /**
     * Registers the applications default session store. The function reads the
     * session.store configuration data and registers the same driver, if it is a
     * valid store driver. Otherwise, file store is used as the default driver.
     *
     * @param app
     * @param sessionManager
     */
    protected registerStore(app: IApp, sessionManager: IDriverManager<ISessionStore>) {
        let storeName = app.configs().get('session.store', 'file');
        let sessionStoreGetter = this.stores[storeName];

        if (!sessionStoreGetter) {
            storeName = 'file';
            sessionStoreGetter = this.getFileStore;
        }
        sessionManager.setDefaultDriver(storeName, sessionStoreGetter(app));
    }

    /**
     * Returns a new file store instance.
     *
     * @param app
     */
    protected getFileStore(app: IApp): ISessionStore {
        return new FileStore(app.get('encrypt'), app.path('sessions'));
    }
}
