import { Str } from '@rheas/support/str';
import { Obj } from '@rheas/support/obj';
import { AnyObject } from '@rheas/contracts';
import { ISession } from '@rheas/contracts/sessions';
import { InvalidArgumentException } from '@rheas/errors/invalidArgument';

export class Session implements ISession {
    /**
     * Session id.
     *
     * @var string
     */
    protected _id: string;

    /**
     * Session expiry time in epoch ms.
     *
     * @var number
     */
    protected _expiry: number;

    /**
     * Complete session data.
     *
     * @var AnyObject
     */
    protected _data: AnyObject;

    /**
     * Creates a new session from the given data.
     *
     * @param id
     * @param data
     * @param lastAccessed
     */
    constructor(id: string, expiry: number, data: AnyObject = {}) {
        // Use the id setter, so that if it is not a valid id
        // an exception will be thrown.
        this._id = this.setId(id).getId();

        this._expiry = expiry;
        this._data = data;
    }

    /**
     * Creates a new session that expires at the given epoch time.
     *
     * @param expiry
     */
    public static async createSession(expiry: number): Promise<ISession> {
        const tokens = await Promise.all([Str.random(40), Str.random(40)]);

        const session = new Session(tokens[0], expiry);
        session.setCsrf(tokens[1]);

        return session;
    }

    /**
     * Returns true if the token is a valid session token.
     *
     * @param token
     */
    public static isValidToken(token: string): boolean {
        // Tokens should be an alphanumeric string with 0-9, A-Z and
        // a-z as the only characters and it should also be 40 chars
        // in length.
        return token.length === 40 && Str.isAlphaNum(token);
    }

    /**
     * Sets a new session id.
     *
     * @param id
     */
    public setId(id: string): ISession {
        if (!Session.isValidToken(id)) {
            throw new InvalidArgumentException('The given session id is not valid.');
        }
        this._id = id;

        return this;
    }

    /**
     * Sets the session expiry.
     *
     * @param timestamp
     */
    public setExpiry(timestamp: number): ISession {
        this._expiry = timestamp;

        return this;
    }

    /**
     * Sets a new CSRF token on the session.
     *
     * @param token
     */
    public setCsrf(token: string): ISession {
        if (!Session.isValidToken(token)) {
            throw new InvalidArgumentException('The given CSRF token is not valid.');
        }
        this.set('csrf', token);

        return this;
    }

    /**
     * Returns the session id.
     *
     * @returns
     */
    public getId(): string {
        return this._id;
    }

    /**
     * Returns the session expiry time in epoch ms.
     *
     * @returns
     */
    public getExpiry(): number {
        return this._expiry;
    }

    /**
     * Returns true if the session has expired. False otherwise.
     *
     * @returns
     */
    public hasExpired(): boolean {
        return Date.now() > this.getExpiry();
    }

    /**
     * Returns the CSRF token set in the session. An empty string is returned
     * if no CSRF token is found.
     *
     * @returns
     */
    public getCsrf(): string {
        return this.get('csrf', '');
    }

    /**
     * Gets the session data for the key. If no value is found, defaultValue
     * is returned.
     *
     * Supports deep get using dotted format.
     *
     * @param key
     * @param defaultValue
     */
    public get(key: string, defaultValue: any = null): any {
        return Obj.get(this._data, key, defaultValue);
    }

    /**
     * Sets a new data on the session field.
     *
     * @param key
     * @param value
     */
    public set(key: string, value: any): ISession {
        this._data[key] = value;

        return this;
    }

    /**
     * Returns the complete session data.
     *
     * @returns object
     */
    public data(): AnyObject {
        return this._data;
    }
}
