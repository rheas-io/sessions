import { Obj } from '@rheas/support';
import { AnyObject } from '@rheas/contracts';
import { ISession } from '@rheas/contracts/sessions';

export class Session implements ISession {
    /**
     * Complete session data.
     *
     * @var AnyObject
     */
    protected _data: AnyObject;

    /**
     * Last session accessed time in milliseconds.
     *
     * @var number
     */
    protected _lastAccessed: number = Date.now();

    /**
     * Creates a new session from the given data.
     *
     * @param data
     */
    constructor(data: AnyObject = {}) {
        this._data = data;
    }

    /**
     * Returns the last accessed time in milliseconds.
     *
     * @returns string
     */
    public lastAccessed(): number {
        return this._lastAccessed;
    }

    /**
     * Updates the last accessed time.
     *
     * @returns this
     */
    public touch(): ISession {
        this._lastAccessed = Date.now();

        return this;
    }

    /**
     * Returns the session id.
     *
     * @params sessionId
     *
     * @returns
     */
    public id(sessionId: string = ''): string {
        if (sessionId) {
            this.set('id', sessionId);
            return sessionId;
        }
        return this.get('id');
    }

    /**
     * Returns the session CSRF token.
     *
     * @params token
     * @returns
     */
    public csrf(token: string = ''): string {
        if (token) {
            this.set('csrf', token);

            return token;
        }
        return this.get('csrf');
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
