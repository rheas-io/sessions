import { AnyObject } from "@rheas/contracts";
import { IEncrypter } from "@rheas/contracts/security";
import { DecryptException } from "@rheas/errors/decrypt";
import { ISessionStore, ISession } from "@rheas/contracts/sessions";
import { Str } from "@rheas/support";

export abstract class BaseStore implements ISessionStore {

    /**
     * Encryption status flag. All stores should encrypt session
     * data by default, unless explicitely disallowed.
     * 
     * @var boolean
     */
    protected _shouldEncrypt: boolean = true;

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
    constructor(encrypter: IEncrypter) {
        this._encrypter = encrypter;
    }

    /**
     * Saves the session on the store.
     * 
     * @param session 
     */
    public abstract save(session: ISession): boolean;

    /**
     * Reads the session of paramter id from the store.
     * 
     * @param id 
     */
    public abstract read(id: string): Promise<ISession | null>;

    /**
     * Removes the session of param id from the store.
     * 
     * @param id 
     */
    public abstract remove(id: string): boolean;

    /**
     * Removes expired sessions from the store.
     * 
     * @returns 
     */
    public abstract clear(): boolean;

    /**
     * Returns the data to be saved on the store. Returned value is 
     * base64 encoded value of JSON stringified { session:data, ecrypted: value }
     * The session data can be either encrypted value of JSON string or the 
     * JSON as it is, if encryption is turned off.
     * 
     * @param session 
     */
    protected async sessionDataToSave(session: ISession): Promise<string> {

        let dataToSave = { session: "", encrypted: false };

        try {
            dataToSave.session = JSON.stringify(session.data());

            if (this._shouldEncrypt) {
                dataToSave.session = await this.encrypt(session);
                dataToSave.encrypted = true;
            }
        } catch (err) { }

        return Str.base64Encode(JSON.stringify(dataToSave));
    }

    /**
     * Encrypts the session data and returns the encrypted string
     * 
     * @param session 
     */
    public async encrypt(session: ISession): Promise<string> {
        return await this._encrypter.encrypt(session.data());
    }

    /**
     * Decrypts the session data and returns an object.
     * 
     * @param data 
     */
    public decrypt(data: string): AnyObject {
        const decrypted = this._encrypter.decrypt(data);

        if (typeof decrypted === 'string') {
            throw new DecryptException('Error decrypting to session object.');
        }
        return decrypted;
    }

    /**
     * Sets the encryption flag. By default, all session store
     * data are encrypted.
     * 
     * @param encrypt 
     */
    public shouldEncrypt(encrypt: boolean): ISessionStore {
        this._shouldEncrypt = encrypt;

        return this;
    }
}