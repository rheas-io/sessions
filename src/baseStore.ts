import { Session } from './session';
import { Str } from '@rheas/support';
import { AnyObject } from '@rheas/contracts';
import { IEncrypter } from '@rheas/contracts/security';
import { EncrypterException } from '@rheas/errors/encrypter';
import { ISession, ISessionStore, ISessionState } from '@rheas/contracts/sessions';

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
    public abstract save(session: ISession): Promise<boolean>;

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
    public abstract remove(id: string): Promise<boolean>;

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
    protected async encode(session: ISession): Promise<string> {
        const dataToSave: ISessionState = {
            session: '',
            encrypted: false,
            id: session.getId(),
            expiry: session.getExpiry(),
        };

        if (this._shouldEncrypt) {
            dataToSave.session = await this.encrypt(session);
            dataToSave.encrypted = true;
        }
        // If session should not be encrypted, set the session value
        // to json string of the session data.
        else {
            dataToSave.session = JSON.stringify(session.data());
        }

        return Str.base64Encode(JSON.stringify(dataToSave));
    }

    /**
     * Returns a session from the encoded session data saved in the store. Initially
     * decodes the data, then parses it into the ISessionState and performs the
     * necessary process depending on the value of session state "encrypted" key.
     *
     * @param data
     */
    protected decode(data: string): ISession {
        const { id, expiry, encrypted, session }: ISessionState = JSON.parse(
            Str.base64Decode(data),
        );

        if (encrypted) {
            return new Session(id, expiry, this.decrypt(session));
        }
        // If the session is not encrypted, the value of sessionData.session will be
        // JSON string of the session data. Parse it and return a new session.
        return new Session(id, expiry, JSON.parse(session));
    }

    /**
     * Encrypts the session data and returns the encrypted string
     *
     * @param session
     */
    public async encrypt(session: ISession): Promise<string> {
        return await this._encrypter.encrypt(Str.jsonToString(session.data()));
    }

    /**
     * Decrypts the session data and returns an object.
     *
     * @param data
     */
    public decrypt(data: string): AnyObject {
        let decrypted: string | AnyObject = this._encrypter.decrypt(data);

        // Try to get a json object from the decrypted string.
        decrypted = Str.stringToJson(decrypted, decrypted);

        if (typeof decrypted === 'string') {
            throw new EncrypterException('Error decrypting to session object.');
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
