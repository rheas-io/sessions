import { AnyObject } from "@rheas/contracts";
import { ISession } from "@rheas/contracts/sessions";
export declare class Session implements ISession {
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
    protected _lastAccessed: number;
    /**
     * Creates a new session from the given data.
     *
     * @param data
     */
    constructor(data?: AnyObject);
    /**
     * Returns the last accessed time in milliseconds.
     *
     * @returns string
     */
    lastAccessed(): number;
    /**
     * Updates the last accessed time.
     *
     * @returns this
     */
    touch(): ISession;
    /**
     * Returns the session id.
     *
     * @params sessionId
     *
     * @returns
     */
    id(sessionId?: string): string;
    /**
     * Returns the session CSRF token.
     *
     * @params token
     * @returns
     */
    csrf(token?: string): string;
    /**
     * Gets the session data for the key. If no value is found, defaultValue
     * is returned.
     *
     * Supports deep get using dotted format.
     *
     * @param key
     * @param defaultValue
     */
    get(key: string, defaultValue?: any): any;
    /**
     * Sets a new data on the session field.
     *
     * @param key
     * @param value
     */
    set(key: string, value: any): ISession;
    /**
     * Returns the complete session data.
     *
     * @returns object
     */
    data(): AnyObject;
}
