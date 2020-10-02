import { Session } from './session';
import { Cookie } from '@rheas/cookies';
import { Obj } from '@rheas/support/obj';
import { IApp } from '@rheas/contracts/core';
import { AnyObject } from '@rheas/contracts';
import { DriverManager } from '@rheas/services';
import { ICookie } from '@rheas/contracts/cookies';
import { SameSite } from '@rheas/contracts/cookies/sameSite';
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
        this._session = session;

        return session;
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
        const sessionConfig = this.getSessionConfig();
        const lifetimeInMinutes: number = Obj.get(sessionConfig, 'lifetime', 120);

        return lifetimeInMinutes * 60;
    }

    /**
     * Loads a session with the given id from the session store. A `null`
     * is returned, if sessionId is not valid or a session with the given id is
     * not found.
     *
     * @param sessionId
     */
    public async loadSession(sessionId: string): Promise<ISession | null> {
        const driver = this.defaultDriver();

        if (driver && Session.isValidToken(sessionId)) {
            return await driver.read(sessionId);
        }
        return null;
    }

    /**
     * Ends the current session by writing the session data on
     * the store.
     *
     * @returns
     */
    public endSession(session: ISession): ISessionManager {
        const driver = this.defaultDriver();

        driver && driver.save(session);

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
     * Returns a cookie with the given name, value and expiry. Other cookie
     * properties will be set from the session configuration data.
     *
     * @param name
     * @param value
     * @param expiry
     */
    public getCookie(name: string, value: string, expiry: number): ICookie {
        const cookie = this.getCookieWithConfigProperties(new Cookie(name, value, expiry));

        if (!this.shouldExpireOnClose()) {
            cookie.setExpire(expiry);
        }

        return cookie;
    }

    /**
     * Returns true if the expire_on_close value is set to truthy on the
     * configurations.
     *
     * @returns
     */
    public shouldExpireOnClose(): boolean {
        const sessionConfig = this.getSessionConfig();

        return !!Obj.get(sessionConfig, 'expire_on_close', false);
    }

    /**
     * Sets the cookie properties given on the config file and returns
     * the cookie.
     *
     * @param cookie
     */
    public getCookieWithConfigProperties(cookie: ICookie): ICookie {
        const sessionConfig = this.getSessionConfig();

        cookie.setPath(Obj.get(sessionConfig, 'path', '/'));
        cookie.setDomain(Obj.get(sessionConfig, 'domain', ''));
        cookie.setSecure(Obj.get(sessionConfig, 'secure', false));
        cookie.setHttpOnly(Obj.get(sessionConfig, 'httpOnly', false));
        cookie.setRaw(Obj.get(sessionConfig, 'raw', true));
        cookie.setSameSite(Obj.get(sessionConfig, 'sameSite', SameSite.NONE));

        return cookie;
    }

    /**
     * Returns the session configurations.
     *
     * @returns
     */
    public getSessionConfig(): AnyObject {
        return this._app.configs().get('session', {});
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
}
