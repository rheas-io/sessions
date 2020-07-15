import { AnyObject } from "@rheas/contracts";
import { IEncrypter } from "@rheas/contracts/security";
import { ISessionStore, ISession } from "@rheas/contracts/sessions";
export declare abstract class BaseStore implements ISessionStore {
    /**
     * Encryption status flag. All stores should encrypt session
     * data by default, unless explicitely disallowed.
     *
     * @var boolean
     */
    protected _shouldEncrypt: boolean;
    /**
     * Application encryption handler.
     *
     * @var IEncrypter
     */
    protected _encrypter: IEncrypter;
    /**
     * Creates a base store which takes care of session encryption
     * which is common for all store.
     *
     * @param encrypter
     */
    constructor(encrypter: IEncrypter);
    /**
     * Saves the session on the store.
     *
     * @param session
     */
    abstract save(session: ISession): boolean;
    /**
     * Reads the session of paramter id from the store.
     *
     * @param id
     */
    abstract read(id: string): Promise<ISession | null>;
    /**
     * Removes the session of param id from the store.
     *
     * @param id
     */
    abstract remove(id: string): boolean;
    /**
     * Removes expired sessions from the store.
     *
     * @returns
     */
    abstract clear(): boolean;
    /**
     * Returns the data to be saved on the store. Returned value is
     * base64 encoded value of JSON stringified { session:data, ecrypted: value }
     * The session data can be either encrypted value of JSON string or the
     * JSON as it is, if encryption is turned off.
     *
     * @param session
     */
    protected sessionDataToSave(session: ISession): Promise<string>;
    /**
     * Encrypts the session data and returns the encrypted string
     *
     * @param session
     */
    encrypt(session: ISession): Promise<string>;
    /**
     * Decrypts the session data and returns an object.
     *
     * @param data
     */
    decrypt(data: string): AnyObject;
    /**
     * Sets the encryption flag. By default, all session store
     * data are encrypted.
     *
     * @param encrypt
     */
    shouldEncrypt(encrypt: boolean): ISessionStore;
}
