import { FileStore } from './fileStore';
import { KeyValue } from '@rheas/contracts';
import { IApp } from '@rheas/contracts/core';
import { SessionManager } from './sessionManager';
import { DeferredServiceProvider } from '@rheas/services';
import { ISessionStore } from '@rheas/contracts/sessions';
import { IDriverManager } from '@rheas/contracts/services';
import { InstanceHandler } from '@rheas/contracts/container';

type StoreGetter = undefined | ((app: IApp) => ISessionStore);

export class SessionServiceProvider extends DeferredServiceProvider {
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
     * Registers the applications ative session store. The function reads the
     * session.store configuration data and registers the same driver, if it is a
     * valid store driver. Otherwise, file store is used as the default driver.
     *
     * @param app
     * @param sessionManager
     */
    protected registerStore(app: IApp, sessionManager: IDriverManager<ISessionStore>) {
        const fileStores: KeyValue<StoreGetter> = { file: this.getFileStore };

        let storeName = app.configs().get('session.store', 'file');
        let fileStoreGetter = fileStores[storeName];

        if (!fileStoreGetter) {
            storeName = 'file';
            fileStoreGetter = this.getFileStore;
        }

        sessionManager.setActiveDriver(storeName, fileStoreGetter(app));
    }

    /**
     * Returns a new file store instance.
     *
     * @param app
     */
    protected getFileStore(app: IApp): ISessionStore {
        return new FileStore(app.get('encrypt'), app.get('path.sessions'));
    }
}
