import { Session } from './session';
import { IApp } from '@rheas/contracts/core';
import { DriverManager } from '@rheas/services';
import { InvalidArgumentException } from '@rheas/errors/invalidArgument';
import { ISessionStore, ISession, ISessionManager } from '@rheas/contracts/sessions';

export class SessionManager extends DriverManager<ISessionStore> implements ISessionManager {
    /**
     * Application container instance.
     *
     * @var IApp
     */
    protected _app: IApp;

    /**
     * Current request session.
     *
     * @var ISession
     */
    protected _session: ISession | null = null;

    /**
     * The name to be used as the session cookie name.
     *
     * @var string
     */
    protected _sessionCookieName: string = '_session';

    /**
     * The cookie name to be used as CSRF cookie name.
     *
     * @var string
     */
    protected _csrfCookieName: string = '_csrf';

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
     * Sets the given session as the request session if it is a valid one.
     * Otherwise, a new session is created.
     *
     * @param session
     */
    public async startSession(session: ISession | null): Promise<ISession> {
        // Create a new session if the session is null
        // or has expired.
        if (!session || session.hasExpired()) {
            session = await this.createSession();
        }
        this.setActiveSession(session);

        return session;
    }

    /**
     * Loads a session with the given id from the session store. A `null`
     * is returned, if sessionId is not valid or a session with the given id is
     * not found.
     *
     * @param sessionId
     */
    public async loadSession(sessionId: string): Promise<ISession | null> {
        const driver = this.hasActiveDriver();

        if (driver && Session.isValidToken(sessionId)) {
            return await driver.read(sessionId);
        }
        return null;
    }

    /**
     * Sets the given session as the current request session.
     *
     * @param session
     */
    public setActiveSession(session: ISession): ISessionManager {
        this._session = session;

        return this;
    }

    /**
     * Ends the current session by writing the session data on
     * the store.
     *
     * @returns
     */
    public endSession(): ISessionManager {
        const session = this.getSession();

        if (session) {
            const driver = this.hasActiveDriver();

            driver && driver.save(session);
        }
        return this;
    }

    /**
     * Returns the active session, if one exists or returns null;
     *
     * @returns
     */
    public getSession(): ISession | null {
        return this._session;
    }

    /**
     * Creates a new session and returns it.
     *
     * @returns
     */
    public async createSession(): Promise<ISession> {
        const expiry = Date.now() + this.getSessionLifetimeInSeconds() * 1000;

        return await Session.createSession(expiry);
    }

    /**
     * Returns session lifetime in seconds.
     *
     * @returns
     */
    public getSessionLifetimeInSeconds(): number {
        const lifetimeInMinutes: number = this._app.configs().get('session.lifetime', 120);

        return lifetimeInMinutes * 60;
    }

    /**
     * Sets a new session cookie name.
     *
     * @param name
     */
    public setSessionCookieName(name: string): ISessionManager {
        this._sessionCookieName = this.validatedCookieName(name, 'session');

        return this;
    }

    /**
     * Sets a new csrf cookie name.
     *
     * @param name
     */
    public setCsrfCookieName(name: string): ISessionManager {
        this._csrfCookieName = this.validatedCookieName(name, 'CSRF');

        return this;
    }

    /**
     * Throws an error if the cookie name is empty. Otherwise, returns
     * the name.
     *
     * @param name
     * @param whichCookie
     */
    private validatedCookieName(name: string, whichCookie: string = ''): string {
        if (name === '') {
            throw new InvalidArgumentException(`Cannot set empty name for ${whichCookie} cookie`);
        }
        return name;
    }

    /**
     * Returns the name to be used for the session cookie.
     *
     * @returns
     */
    public getSessionCookieName(): string {
        return this._sessionCookieName;
    }

    /**
     * Returns the name to be used for the csrf token cookie.
     *
     * @returns
     */
    public getCsrfCookieName(): string {
        return this._csrfCookieName;
    }
}
