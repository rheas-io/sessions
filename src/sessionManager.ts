import { IApp } from '@rheas/contracts/core';
import { DriverManager } from '@rheas/services';
import { ISessionStore } from '@rheas/contracts/sessions';

export class SessionManager extends DriverManager<ISessionStore> {
    /**
     * Application container instance.
     *
     * @var IApp
     */
    protected _app: IApp;

    /**
     * Creates a new session manager.
     *
     * @param app
     */
    constructor(app: IApp) {
        super();

        this._app = app;
    }

    /**
     * Returns the registered session cookie store.
     *
     * @returns
     */
    public cookies(): ISessionStore {
        return this.getDriver('cookies');
    }

    /**
     * Returns the registered session file store.
     *
     * @returns
     */
    public file(): ISessionStore {
        return this.getDriver('files');
    }

    /**
     * Returns the registered session database store.
     *
     * @returns
     */
    public database(): ISessionStore {
        return this.getDriver('database');
    }
}
