import path from 'path';
import { BaseStore } from './baseStore';
import { files } from '@rheas/support/helpers';
import { ISession } from '@rheas/contracts/sessions';
import { IEncrypter } from '@rheas/contracts/security';

export class FileStore extends BaseStore {
    /**
     * Path where all session files are stored.
     *
     * @var string
     */
    protected _sessionsDir: string;

    /**
     * Creates a new file store
     *
     * @param encrypter
     * @param path
     */
    constructor(encrypter: IEncrypter, path: string) {
        super(encrypter);

        this._sessionsDir = path;
    }

    /**
     * Saves a session on the sessions dir. The file will be saved
     * with the session id as name.
     *
     * @param session
     */
    public async save(session: ISession): Promise<boolean> {
        try {
            const encodedData = await this.encode(session);

            const filePath = path.resolve(this._sessionsDir, session.id());

            return files().write(encodedData, filePath);
        } catch (err) {
            return false;
        }
    }

    /**
     * Reads a session from the store and returns a Session object
     * if it exists or returns null.
     *
     * @param id
     */
    public async read(id: string): Promise<ISession | null> {
        try {
            const filePath = path.resolve(this._sessionsDir, id);
            const sessionData = await files().readFile(filePath);

            return this.decode(sessionData);
        } catch (err) {
            return null;
        }
    }

    /**
     * Removes a session file from the filesystem.
     *
     * @param id
     */
    public remove(id: string): boolean {
        const filePath = path.resolve(this._sessionsDir, id);

        return files().remove(filePath);
    }

    /**
     * @returns
     */
    public clear(): boolean {
        throw new Error('Method not implemented.');
    }
}
