"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var support_1 = require("@rheas/support");
var Session = /** @class */ (function () {
    /**
     * Creates a new session from the given data.
     *
     * @param data
     */
    function Session(data) {
        if (data === void 0) { data = {}; }
        /**
         * Last session accessed time in milliseconds.
         *
         * @var number
         */
        this._lastAccessed = Date.now();
        this._data = data;
    }
    /**
     * Returns the last accessed time in milliseconds.
     *
     * @returns string
     */
    Session.prototype.lastAccessed = function () {
        return this._lastAccessed;
    };
    /**
     * Updates the last accessed time.
     *
     * @returns this
     */
    Session.prototype.touch = function () {
        this._lastAccessed = Date.now();
        return this;
    };
    /**
     * Returns the session id.
     *
     * @params sessionId
     *
     * @returns
     */
    Session.prototype.id = function (sessionId) {
        if (sessionId === void 0) { sessionId = ""; }
        if (sessionId) {
            this.set('id', sessionId);
            return sessionId;
        }
        return this.get('id');
    };
    /**
     * Returns the session CSRF token.
     *
     * @params token
     * @returns
     */
    Session.prototype.csrf = function (token) {
        if (token === void 0) { token = ""; }
        if (token) {
            this.set('csrf', token);
            return token;
        }
        return this.get('csrf');
    };
    /**
     * Gets the session data for the key. If no value is found, defaultValue
     * is returned.
     *
     * Supports deep get using dotted format.
     *
     * @param key
     * @param defaultValue
     */
    Session.prototype.get = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        return support_1.Obj.get(this._data, key, defaultValue);
    };
    /**
     * Sets a new data on the session field.
     *
     * @param key
     * @param value
     */
    Session.prototype.set = function (key, value) {
        this._data[key] = value;
        return this;
    };
    /**
     * Returns the complete session data.
     *
     * @returns object
     */
    Session.prototype.data = function () {
        return this._data;
    };
    return Session;
}());
exports.Session = Session;
