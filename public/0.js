(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[0],{

/***/ "./node_modules/@babel/runtime/regenerator/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/@babel/runtime/regenerator/index.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! regenerator-runtime */ "./node_modules/regenerator-runtime/runtime.js");


/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/BaseSession.js":
/*!************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/BaseSession.js ***!
  \************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return BaseSession; });
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/index.js");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(uuid__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _util_logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util/logger */ "./node_modules/@signalwire/js/dist/esm/common/src/util/logger.js");
/* harmony import */ var _services_Connection__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./services/Connection */ "./node_modules/@signalwire/js/dist/esm/common/src/services/Connection.js");
/* harmony import */ var _services_Setup__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./services/Setup */ "./node_modules/@signalwire/js/dist/esm/common/src/services/Setup.js");
/* harmony import */ var _services_Handler__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./services/Handler */ "./node_modules/@signalwire/js/dist/esm/common/src/services/Handler.js");
/* harmony import */ var _services_BroadcastHandler__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./services/BroadcastHandler */ "./node_modules/@signalwire/js/dist/esm/common/src/services/BroadcastHandler.js");
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./util/constants */ "./node_modules/@signalwire/js/dist/esm/common/src/util/constants/index.js");
/* harmony import */ var _webrtc_constants__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./webrtc/constants */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/constants.js");
/* harmony import */ var _messages_Blade__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./messages/Blade */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/Blade.js");
/* harmony import */ var _util_helpers__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./util/helpers */ "./node_modules/@signalwire/js/dist/esm/common/src/util/helpers.js");
/* harmony import */ var _util_storage___WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./util/storage/ */ "./node_modules/@signalwire/js/dist/esm/common/src/util/storage/index.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};











const KEEPALIVE_INTERVAL = 10 * 1000;
class BaseSession {
    constructor(options) {
        this.options = options;
        this.uuid = Object(uuid__WEBPACK_IMPORTED_MODULE_0__["v4"])();
        this.sessionid = '';
        this.subscriptions = {};
        this.expiresAt = 0;
        this.signature = null;
        this.relayProtocol = null;
        this.contexts = [];
        this.connection = null;
        this._jwtAuth = false;
        this._doKeepAlive = false;
        this._reconnectDelay = 5000;
        this._autoReconnect = true;
        this._idle = false;
        this._executeQueue = [];
        if (!this.validateOptions()) {
            throw new Error('Invalid init options');
        }
        this._onSocketOpen = this._onSocketOpen.bind(this);
        this._onSocketCloseOrError = this._onSocketCloseOrError.bind(this);
        this._onSocketMessage = this._onSocketMessage.bind(this);
        this._handleLoginError = this._handleLoginError.bind(this);
        this._checkTokenExpiration = this._checkTokenExpiration.bind(this);
        this._attachListeners();
        this.connection = new _services_Connection__WEBPACK_IMPORTED_MODULE_2__["default"](this);
    }
    get __logger() {
        return _util_logger__WEBPACK_IMPORTED_MODULE_1__["default"];
    }
    get connected() {
        return this.connection && this.connection.connected;
    }
    get expired() {
        return this.expiresAt && this.expiresAt <= (Date.now() / 1000);
    }
    execute(msg) {
        if (this._idle) {
            return new Promise(resolve => this._executeQueue.push({ resolve, msg }));
        }
        if (!this.connected) {
            return new Promise(resolve => {
                this._executeQueue.push({ resolve, msg });
                this.connect();
            });
        }
        return this.connection.send(msg);
    }
    executeRaw(text) {
        if (this._idle) {
            this._executeQueue.push({ msg: text });
            return;
        }
        this.connection.sendRawText(text);
    }
    validateOptions() {
        const { project = false, token = false } = this.options;
        return Boolean(project && token);
    }
    broadcast(params) { }
    subscribe({ protocol, channels, handler }) {
        return __awaiter(this, void 0, void 0, function* () {
            const bs = new _messages_Blade__WEBPACK_IMPORTED_MODULE_8__["Subscription"]({ command: _util_constants__WEBPACK_IMPORTED_MODULE_6__["ADD"], protocol, channels });
            const result = yield this.execute(bs);
            const { failed_channels = [], subscribe_channels = [] } = result;
            if (failed_channels.length) {
                failed_channels.forEach((channel) => this._removeSubscription(protocol, channel));
            }
            subscribe_channels.forEach((channel) => this._addSubscription(protocol, handler, channel));
            return result;
        });
    }
    unsubscribe({ protocol, channels, handler }) {
        return __awaiter(this, void 0, void 0, function* () {
            const bs = new _messages_Blade__WEBPACK_IMPORTED_MODULE_8__["Subscription"]({ command: _util_constants__WEBPACK_IMPORTED_MODULE_6__["REMOVE"], protocol, channels });
            return this.execute(bs);
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            clearTimeout(this._reconnectTimeout);
            this.subscriptions = {};
            this._autoReconnect = false;
            this.relayProtocol = null;
            this._closeConnection();
            yield _util_storage___WEBPACK_IMPORTED_MODULE_10__["sessionStorage"].removeItem(this.signature);
            this._executeQueue = [];
            this._detachListeners();
        });
    }
    on(eventName, callback) {
        Object(_services_Handler__WEBPACK_IMPORTED_MODULE_4__["register"])(eventName, callback, this.uuid);
        return this;
    }
    off(eventName, callback) {
        Object(_services_Handler__WEBPACK_IMPORTED_MODULE_4__["deRegister"])(eventName, callback, this.uuid);
        return this;
    }
    refreshToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            this.options.token = token;
            try {
                if (this.expired) {
                    yield this.connect();
                }
                else {
                    const br = new _messages_Blade__WEBPACK_IMPORTED_MODULE_8__["Reauthenticate"](this.options.project, token, this.sessionid);
                    const response = yield this.execute(br);
                    const { authorization: { expires_at = null } = {} } = response;
                    this.expiresAt = +expires_at || 0;
                }
            }
            catch (error) {
                _util_logger__WEBPACK_IMPORTED_MODULE_1__["default"].error('refreshToken error:', error);
                Object(_services_Handler__WEBPACK_IMPORTED_MODULE_4__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_6__["SwEvent"].Error, error, this.uuid, false);
            }
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connection) {
                this.connection = new _services_Connection__WEBPACK_IMPORTED_MODULE_2__["default"](this);
            }
            this._attachListeners();
            if (!this.connection.isAlive) {
                this.connection.connect();
            }
        });
    }
    _handleLoginError(error) {
        this._autoReconnect = false;
        Object(_services_Handler__WEBPACK_IMPORTED_MODULE_4__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_6__["SwEvent"].Error, error, this.uuid);
    }
    _onSocketOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            this._idle = false;
            const tokenKey = this._jwtAuth ? 'jwt_token' : 'token';
            const { project, token } = this.options;
            const bc = new _messages_Blade__WEBPACK_IMPORTED_MODULE_8__["Connect"]({ project, [tokenKey]: token }, this.sessionid);
            const response = yield this.execute(bc).catch(this._handleLoginError);
            if (response) {
                this._autoReconnect = true;
                const { sessionid, nodeid, master_nodeid, authorization: { expires_at = null, signature = null } = {} } = response;
                this.expiresAt = +expires_at || 0;
                this.signature = signature;
                this.relayProtocol = yield Object(_services_Setup__WEBPACK_IMPORTED_MODULE_3__["default"])(this);
                this._checkTokenExpiration();
                this.sessionid = sessionid;
                this.nodeid = nodeid;
                this.master_nodeid = master_nodeid;
                this._emptyExecuteQueues();
                this._pong = null;
                this._keepAlive();
                Object(_services_Handler__WEBPACK_IMPORTED_MODULE_4__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_6__["SwEvent"].Ready, this, this.uuid);
                _util_logger__WEBPACK_IMPORTED_MODULE_1__["default"].info('Session Ready!');
            }
        });
    }
    _onSocketCloseOrError(event) {
        _util_logger__WEBPACK_IMPORTED_MODULE_1__["default"].error(`Socket ${event.type} ${event.message}`);
        if (this.relayProtocol) {
            Object(_services_Handler__WEBPACK_IMPORTED_MODULE_4__["deRegisterAll"])(this.relayProtocol);
        }
        for (const sub in this.subscriptions) {
            Object(_services_Handler__WEBPACK_IMPORTED_MODULE_4__["deRegisterAll"])(sub);
        }
        this.subscriptions = {};
        this.contexts = [];
        if (this.expired) {
            this._idle = true;
            this._autoReconnect = false;
            this.expiresAt = 0;
        }
        if (this._autoReconnect) {
            this._reconnectTimeout = setTimeout(() => this.connect(), this._reconnectDelay);
        }
    }
    _onSocketMessage(response) {
        const { method, params } = response;
        switch (method) {
            case _util_constants__WEBPACK_IMPORTED_MODULE_6__["BladeMethod"].Broadcast:
                Object(_services_BroadcastHandler__WEBPACK_IMPORTED_MODULE_5__["default"])(this, params);
                break;
            case _util_constants__WEBPACK_IMPORTED_MODULE_6__["BladeMethod"].Disconnect:
                this._idle = true;
                break;
        }
    }
    _removeSubscription(protocol, channel) {
        if (!this._existsSubscription(protocol, channel)) {
            return;
        }
        if (channel) {
            delete this.subscriptions[protocol][channel];
            Object(_services_Handler__WEBPACK_IMPORTED_MODULE_4__["deRegister"])(protocol, null, channel);
        }
        else {
            delete this.subscriptions[protocol];
            Object(_services_Handler__WEBPACK_IMPORTED_MODULE_4__["deRegisterAll"])(protocol);
        }
    }
    _addSubscription(protocol, handler = null, channel) {
        if (this._existsSubscription(protocol, channel)) {
            return;
        }
        if (!this._existsSubscription(protocol)) {
            this.subscriptions[protocol] = {};
        }
        this.subscriptions[protocol][channel] = {};
        if (Object(_util_helpers__WEBPACK_IMPORTED_MODULE_9__["isFunction"])(handler)) {
            Object(_services_Handler__WEBPACK_IMPORTED_MODULE_4__["register"])(protocol, handler, channel);
        }
    }
    _existsSubscription(protocol, channel) {
        if (this.subscriptions.hasOwnProperty(protocol)) {
            if (!channel || (channel && this.subscriptions[protocol].hasOwnProperty(channel))) {
                return true;
            }
        }
        return false;
    }
    _attachListeners() {
        this._detachListeners();
        this.on(_util_constants__WEBPACK_IMPORTED_MODULE_6__["SwEvent"].SocketOpen, this._onSocketOpen);
        this.on(_util_constants__WEBPACK_IMPORTED_MODULE_6__["SwEvent"].SocketClose, this._onSocketCloseOrError);
        this.on(_util_constants__WEBPACK_IMPORTED_MODULE_6__["SwEvent"].SocketError, this._onSocketCloseOrError);
        this.on(_util_constants__WEBPACK_IMPORTED_MODULE_6__["SwEvent"].SocketMessage, this._onSocketMessage);
    }
    _detachListeners() {
        this.off(_util_constants__WEBPACK_IMPORTED_MODULE_6__["SwEvent"].SocketOpen, this._onSocketOpen);
        this.off(_util_constants__WEBPACK_IMPORTED_MODULE_6__["SwEvent"].SocketClose, this._onSocketCloseOrError);
        this.off(_util_constants__WEBPACK_IMPORTED_MODULE_6__["SwEvent"].SocketError, this._onSocketCloseOrError);
        this.off(_util_constants__WEBPACK_IMPORTED_MODULE_6__["SwEvent"].SocketMessage, this._onSocketMessage);
    }
    _emptyExecuteQueues() {
        this._executeQueue.forEach(({ resolve, msg }) => {
            if (typeof msg === 'string') {
                this.executeRaw(msg);
            }
            else {
                resolve(this.execute(msg));
            }
        });
    }
    _closeConnection() {
        this._idle = true;
        clearTimeout(this._keepAliveTimeout);
        if (this.connection) {
            this.connection.close();
        }
    }
    _checkTokenExpiration() {
        if (!this.expiresAt) {
            return;
        }
        const diff = this.expiresAt - (Date.now() / 1000);
        if (diff <= 60) {
            _util_logger__WEBPACK_IMPORTED_MODULE_1__["default"].warn('Your JWT is going to expire. You should refresh it to keep the session live.');
            Object(_services_Handler__WEBPACK_IMPORTED_MODULE_4__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_6__["SwEvent"].Notification, { type: _webrtc_constants__WEBPACK_IMPORTED_MODULE_7__["NOTIFICATION_TYPE"].refreshToken, session: this }, this.uuid, false);
        }
        if (!this.expired) {
            setTimeout(this._checkTokenExpiration, 30 * 1000);
        }
    }
    _keepAlive() {
        if (this._doKeepAlive !== true) {
            return;
        }
        if (this._pong === false) {
            return this._closeConnection();
        }
        this._pong = false;
        this.execute(new _messages_Blade__WEBPACK_IMPORTED_MODULE_8__["Ping"]())
            .then(() => this._pong = true)
            .catch(() => this._pong = false);
        this._keepAliveTimeout = setTimeout(() => this._keepAlive(), KEEPALIVE_INTERVAL);
    }
    static on(eventName, callback) {
        Object(_services_Handler__WEBPACK_IMPORTED_MODULE_4__["register"])(eventName, callback);
    }
    static off(eventName) {
        Object(_services_Handler__WEBPACK_IMPORTED_MODULE_4__["deRegister"])(eventName);
    }
    static uuid() {
        return Object(uuid__WEBPACK_IMPORTED_MODULE_0__["v4"])();
    }
}


/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/BrowserSession.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/BrowserSession.js ***!
  \***************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return BrowserSession; });
/* harmony import */ var _util_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util/logger */ "./node_modules/@signalwire/js/dist/esm/common/src/util/logger.js");
/* harmony import */ var _BaseSession__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./BaseSession */ "./node_modules/@signalwire/js/dist/esm/common/src/BaseSession.js");
/* harmony import */ var _services_Handler__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./services/Handler */ "./node_modules/@signalwire/js/dist/esm/common/src/services/Handler.js");
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util/constants */ "./node_modules/@signalwire/js/dist/esm/common/src/util/constants/index.js");
/* harmony import */ var _webrtc_constants__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./webrtc/constants */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/constants.js");
/* harmony import */ var _webrtc_helpers__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./webrtc/helpers */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/helpers.js");
/* harmony import */ var _util_helpers__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./util/helpers */ "./node_modules/@signalwire/js/dist/esm/common/src/util/helpers.js");
/* harmony import */ var _messages_Verto__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./messages/Verto */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/Verto.js");
/* harmony import */ var _util_storage___WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./util/storage/ */ "./node_modules/@signalwire/js/dist/esm/common/src/util/storage/index.js");
/* harmony import */ var _util_webrtc__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./util/webrtc */ "./node_modules/@signalwire/js/dist/esm/common/src/util/webrtc/index.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};










class BrowserSession extends _BaseSession__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor() {
        super(...arguments);
        this.calls = {};
        this.autoRecoverCalls = true;
        this._iceServers = [];
        this._localElement = null;
        this._remoteElement = null;
        this._jwtAuth = true;
        this._reconnectDelay = 1000;
        this._devices = {};
        this._audioConstraints = true;
        this._videoConstraints = false;
        this._speaker = null;
    }
    connect() {
        const _super = Object.create(null, {
            connect: { get: () => super.connect }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this.sessionid = yield _util_storage___WEBPACK_IMPORTED_MODULE_8__["localStorage"].getItem(_util_constants__WEBPACK_IMPORTED_MODULE_3__["SESSION_ID"]);
            _super.connect.call(this);
        });
    }
    checkPermissions(audio = true, video = true) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stream = yield Object(_webrtc_helpers__WEBPACK_IMPORTED_MODULE_5__["getUserMedia"])({ audio, video });
                Object(_util_webrtc__WEBPACK_IMPORTED_MODULE_9__["stopStream"])(stream);
                return true;
            }
            catch (_a) {
                return false;
            }
        });
    }
    logout() {
        this.disconnect();
    }
    disconnect() {
        const _super = Object.create(null, {
            disconnect: { get: () => super.disconnect }
        });
        return __awaiter(this, void 0, void 0, function* () {
            Object.keys(this.calls).forEach(k => this.calls[k].setState(_webrtc_constants__WEBPACK_IMPORTED_MODULE_4__["State"].Purge));
            this.calls = {};
            yield _super.disconnect.call(this);
        });
    }
    speedTest(bytes) {
        return new Promise((resolve, reject) => {
            Object(_services_Handler__WEBPACK_IMPORTED_MODULE_2__["registerOnce"])(_util_constants__WEBPACK_IMPORTED_MODULE_3__["SwEvent"].SpeedTest, speedTestResult => {
                const { upDur, downDur } = speedTestResult;
                const upKps = upDur ? (((bytes * 8) / (upDur / 1000)) / 1024) : 0;
                const downKps = downDur ? (((bytes * 8) / (downDur / 1000)) / 1024) : 0;
                resolve({ upDur, downDur, upKps: upKps.toFixed(0), downKps: downKps.toFixed(0) });
            }, this.uuid);
            bytes = Number(bytes);
            if (!bytes) {
                return reject(`Invalid parameter 'bytes': ${bytes}`);
            }
            this.executeRaw(`#SPU ${bytes}`);
            let loops = bytes / 1024;
            if (bytes % 1024) {
                loops++;
            }
            const dots = '.'.repeat(1024);
            for (let i = 0; i < loops; i++) {
                this.executeRaw(`#SPB ${dots}`);
            }
            this.executeRaw('#SPE');
        });
    }
    getDevices() {
        return Object(_webrtc_helpers__WEBPACK_IMPORTED_MODULE_5__["getDevices"])().catch(error => {
            Object(_services_Handler__WEBPACK_IMPORTED_MODULE_2__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_3__["SwEvent"].MediaError, error, this.uuid);
            return [];
        });
    }
    getVideoDevices() {
        return Object(_webrtc_helpers__WEBPACK_IMPORTED_MODULE_5__["getDevices"])(_webrtc_constants__WEBPACK_IMPORTED_MODULE_4__["DeviceType"].Video).catch(error => {
            Object(_services_Handler__WEBPACK_IMPORTED_MODULE_2__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_3__["SwEvent"].MediaError, error, this.uuid);
            return [];
        });
    }
    getAudioInDevices() {
        return Object(_webrtc_helpers__WEBPACK_IMPORTED_MODULE_5__["getDevices"])(_webrtc_constants__WEBPACK_IMPORTED_MODULE_4__["DeviceType"].AudioIn).catch(error => {
            Object(_services_Handler__WEBPACK_IMPORTED_MODULE_2__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_3__["SwEvent"].MediaError, error, this.uuid);
            return [];
        });
    }
    getAudioOutDevices() {
        return Object(_webrtc_helpers__WEBPACK_IMPORTED_MODULE_5__["getDevices"])(_webrtc_constants__WEBPACK_IMPORTED_MODULE_4__["DeviceType"].AudioOut).catch(error => {
            Object(_services_Handler__WEBPACK_IMPORTED_MODULE_2__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_3__["SwEvent"].MediaError, error, this.uuid);
            return [];
        });
    }
    validateDeviceId(id, label, kind) {
        return Object(_webrtc_helpers__WEBPACK_IMPORTED_MODULE_5__["assureDeviceId"])(id, label, kind);
    }
    refreshDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].warn('This method has been deprecated. Use getDevices() instead.');
            const cache = {};
            ['videoinput', 'audioinput', 'audiooutput'].map((kind) => {
                cache[kind] = {};
                Object.defineProperty(cache[kind], 'toArray', {
                    value: function () {
                        return Object.keys(this).map(k => this[k]);
                    }
                });
            });
            const devices = yield this.getDevices();
            devices.forEach((t) => {
                if (cache.hasOwnProperty(t.kind)) {
                    cache[t.kind][t.deviceId] = t;
                }
            });
            this._devices = cache;
            return this.devices;
        });
    }
    get devices() {
        return this._devices || {};
    }
    getDeviceResolutions(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield Object(_webrtc_helpers__WEBPACK_IMPORTED_MODULE_5__["scanResolutions"])(deviceId);
            }
            catch (error) {
                throw error;
            }
        });
    }
    get videoDevices() {
        _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].warn('This property has been deprecated. Use getVideoDevices() instead.');
        return this._devices.videoinput || {};
    }
    get audioInDevices() {
        _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].warn('This property has been deprecated. Use getAudioInDevices() instead.');
        return this._devices.audioinput || {};
    }
    get audioOutDevices() {
        _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].warn('This property has been deprecated. Use getAudioOutDevices() instead.');
        return this._devices.audiooutput || {};
    }
    get mediaConstraints() {
        return { audio: this._audioConstraints, video: this._videoConstraints };
    }
    setAudioSettings(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            const { micId, micLabel } = settings, constraints = __rest(settings, ["micId", "micLabel"]);
            Object(_webrtc_helpers__WEBPACK_IMPORTED_MODULE_5__["removeUnsupportedConstraints"])(constraints);
            this._audioConstraints = yield Object(_webrtc_helpers__WEBPACK_IMPORTED_MODULE_5__["checkDeviceIdConstraints"])(micId, micLabel, 'audioinput', constraints);
            this.micId = micId;
            this.micLabel = micLabel;
            return this._audioConstraints;
        });
    }
    disableMicrophone() {
        this._audioConstraints = false;
    }
    enableMicrophone() {
        this._audioConstraints = true;
    }
    setVideoSettings(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            const { camId, camLabel } = settings, constraints = __rest(settings, ["camId", "camLabel"]);
            Object(_webrtc_helpers__WEBPACK_IMPORTED_MODULE_5__["removeUnsupportedConstraints"])(constraints);
            this._videoConstraints = yield Object(_webrtc_helpers__WEBPACK_IMPORTED_MODULE_5__["checkDeviceIdConstraints"])(camId, camLabel, 'videoinput', constraints);
            this.camId = camId;
            this.camLabel = camLabel;
            return this._videoConstraints;
        });
    }
    disableWebcam() {
        this._videoConstraints = false;
    }
    enableWebcam() {
        this._videoConstraints = true;
    }
    set iceServers(servers) {
        if (typeof servers === 'boolean') {
            this._iceServers = servers ? [{ urls: ['stun:stun.l.google.com:19302'] }] : [];
        }
        else {
            this._iceServers = servers;
        }
    }
    get iceServers() {
        return this._iceServers;
    }
    set speaker(deviceId) {
        this._speaker = deviceId;
    }
    get speaker() {
        return this._speaker;
    }
    set localElement(tag) {
        this._localElement = Object(_util_helpers__WEBPACK_IMPORTED_MODULE_6__["findElementByType"])(tag);
    }
    get localElement() {
        return this._localElement;
    }
    set remoteElement(tag) {
        this._remoteElement = Object(_util_helpers__WEBPACK_IMPORTED_MODULE_6__["findElementByType"])(tag);
    }
    get remoteElement() {
        return this._remoteElement;
    }
    vertoBroadcast({ nodeId, channel: eventChannel = '', data }) {
        if (!eventChannel) {
            throw new Error('Invalid channel for broadcast: ' + eventChannel);
        }
        const msg = new _messages_Verto__WEBPACK_IMPORTED_MODULE_7__["Broadcast"]({ sessid: this.sessionid, eventChannel, data });
        if (nodeId) {
            msg.targetNodeId = nodeId;
        }
        this.execute(msg).catch(error => error);
    }
    vertoSubscribe({ nodeId, channels: eventChannel = [], handler }) {
        return __awaiter(this, void 0, void 0, function* () {
            eventChannel = eventChannel.filter(channel => channel && !this._existsSubscription(this.relayProtocol, channel));
            if (!eventChannel.length) {
                return {};
            }
            const msg = new _messages_Verto__WEBPACK_IMPORTED_MODULE_7__["Subscribe"]({ sessid: this.sessionid, eventChannel });
            if (nodeId) {
                msg.targetNodeId = nodeId;
            }
            const response = yield this.execute(msg);
            const { unauthorized = [], subscribed = [] } = Object(_webrtc_helpers__WEBPACK_IMPORTED_MODULE_5__["destructSubscribeResponse"])(response);
            if (unauthorized.length) {
                unauthorized.forEach(channel => this._removeSubscription(this.relayProtocol, channel));
            }
            subscribed.forEach(channel => this._addSubscription(this.relayProtocol, handler, channel));
            return response;
        });
    }
    vertoUnsubscribe({ nodeId, channels: eventChannel = [] }) {
        return __awaiter(this, void 0, void 0, function* () {
            eventChannel = eventChannel.filter(channel => channel && this._existsSubscription(this.relayProtocol, channel));
            if (!eventChannel.length) {
                return {};
            }
            const msg = new _messages_Verto__WEBPACK_IMPORTED_MODULE_7__["Unsubscribe"]({ sessid: this.sessionid, eventChannel });
            if (nodeId) {
                msg.targetNodeId = nodeId;
            }
            const response = yield this.execute(msg);
            const { unsubscribed = [], notSubscribed = [] } = Object(_webrtc_helpers__WEBPACK_IMPORTED_MODULE_5__["destructSubscribeResponse"])(response);
            unsubscribed.forEach(channel => this._removeSubscription(this.relayProtocol, channel));
            notSubscribed.forEach(channel => this._removeSubscription(this.relayProtocol, channel));
            return response;
        });
    }
}


/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/messages/BaseMessage.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/messages/BaseMessage.js ***!
  \*********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/index.js");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(uuid__WEBPACK_IMPORTED_MODULE_0__);

class BaseMessage {
    buildRequest(params) {
        this.request = Object.assign({ jsonrpc: '2.0', id: Object(uuid__WEBPACK_IMPORTED_MODULE_0__["v4"])() }, params);
    }
}
/* harmony default export */ __webpack_exports__["default"] = (BaseMessage);


/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/messages/Blade.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/messages/Blade.js ***!
  \***************************************************************************/
/*! exports provided: Connect, Subscription, Execute, Reauthenticate, Ping */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _blade_Connect__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./blade/Connect */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/blade/Connect.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Connect", function() { return _blade_Connect__WEBPACK_IMPORTED_MODULE_0__["Connect"]; });

/* harmony import */ var _blade_Execute__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./blade/Execute */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/blade/Execute.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Execute", function() { return _blade_Execute__WEBPACK_IMPORTED_MODULE_1__["Execute"]; });

/* harmony import */ var _blade_Subscription__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./blade/Subscription */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/blade/Subscription.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Subscription", function() { return _blade_Subscription__WEBPACK_IMPORTED_MODULE_2__["Subscription"]; });

/* harmony import */ var _blade_Reauthenticate__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./blade/Reauthenticate */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/blade/Reauthenticate.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Reauthenticate", function() { return _blade_Reauthenticate__WEBPACK_IMPORTED_MODULE_3__["Reauthenticate"]; });

/* harmony import */ var _blade_Ping__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./blade/Ping */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/blade/Ping.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Ping", function() { return _blade_Ping__WEBPACK_IMPORTED_MODULE_4__["Ping"]; });









/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/messages/Verto.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/messages/Verto.js ***!
  \***************************************************************************/
/*! exports provided: Login, Invite, Answer, Attach, Bye, Modify, Info, Broadcast, Subscribe, Unsubscribe, Result */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Invite", function() { return Invite; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Answer", function() { return Answer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Attach", function() { return Attach; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Bye", function() { return Bye; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Modify", function() { return Modify; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Info", function() { return Info; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Broadcast", function() { return Broadcast; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Subscribe", function() { return Subscribe; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Unsubscribe", function() { return Unsubscribe; });
/* harmony import */ var _verto_BaseRequest__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./verto/BaseRequest */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/verto/BaseRequest.js");
/* harmony import */ var _verto_Login__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./verto/Login */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/verto/Login.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Login", function() { return _verto_Login__WEBPACK_IMPORTED_MODULE_1__["Login"]; });

/* harmony import */ var _verto_Result__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./verto/Result */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/verto/Result.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Result", function() { return _verto_Result__WEBPACK_IMPORTED_MODULE_2__["Result"]; });

/* harmony import */ var _webrtc_constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../webrtc/constants */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/constants.js");




class Invite extends _verto_BaseRequest__WEBPACK_IMPORTED_MODULE_0__["default"] {
    toString() {
        return _webrtc_constants__WEBPACK_IMPORTED_MODULE_3__["VertoMethod"].Invite;
    }
}
class Answer extends _verto_BaseRequest__WEBPACK_IMPORTED_MODULE_0__["default"] {
    toString() {
        return _webrtc_constants__WEBPACK_IMPORTED_MODULE_3__["VertoMethod"].Answer;
    }
}
class Attach extends _verto_BaseRequest__WEBPACK_IMPORTED_MODULE_0__["default"] {
    toString() {
        return _webrtc_constants__WEBPACK_IMPORTED_MODULE_3__["VertoMethod"].Attach;
    }
}
class Bye extends _verto_BaseRequest__WEBPACK_IMPORTED_MODULE_0__["default"] {
    toString() {
        return _webrtc_constants__WEBPACK_IMPORTED_MODULE_3__["VertoMethod"].Bye;
    }
}
class Modify extends _verto_BaseRequest__WEBPACK_IMPORTED_MODULE_0__["default"] {
    toString() {
        return _webrtc_constants__WEBPACK_IMPORTED_MODULE_3__["VertoMethod"].Modify;
    }
}
class Info extends _verto_BaseRequest__WEBPACK_IMPORTED_MODULE_0__["default"] {
    toString() {
        return _webrtc_constants__WEBPACK_IMPORTED_MODULE_3__["VertoMethod"].Info;
    }
}
class Broadcast extends _verto_BaseRequest__WEBPACK_IMPORTED_MODULE_0__["default"] {
    toString() {
        return _webrtc_constants__WEBPACK_IMPORTED_MODULE_3__["VertoMethod"].Broadcast;
    }
}
class Subscribe extends _verto_BaseRequest__WEBPACK_IMPORTED_MODULE_0__["default"] {
    toString() {
        return _webrtc_constants__WEBPACK_IMPORTED_MODULE_3__["VertoMethod"].Subscribe;
    }
}
class Unsubscribe extends _verto_BaseRequest__WEBPACK_IMPORTED_MODULE_0__["default"] {
    toString() {
        return _webrtc_constants__WEBPACK_IMPORTED_MODULE_3__["VertoMethod"].Unsubscribe;
    }
}



/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/messages/blade/Connect.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/messages/blade/Connect.js ***!
  \***********************************************************************************/
/*! exports provided: Connect, setAgentName */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Connect", function() { return Connect; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setAgentName", function() { return setAgentName; });
/* harmony import */ var _BaseMessage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../BaseMessage */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/BaseMessage.js");

const major = 2;
const minor = 1;
const revision = 0;
let agent = null;
const setAgentName = (name) => {
    agent = name;
};
class Connect extends _BaseMessage__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(authentication, sessionid) {
        super();
        this.method = 'blade.connect';
        const params = {
            version: { major, minor, revision },
            authentication: authentication
        };
        if (sessionid) {
            params.sessionid = sessionid;
        }
        if (agent) {
            params.agent = agent;
        }
        this.buildRequest({ method: this.method, params });
    }
}



/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/messages/blade/Execute.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/messages/blade/Execute.js ***!
  \***********************************************************************************/
/*! exports provided: Execute */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Execute", function() { return Execute; });
/* harmony import */ var _BaseMessage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../BaseMessage */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/BaseMessage.js");

class Execute extends _BaseMessage__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(params, id = '') {
        super();
        this.method = 'blade.execute';
        let tmp;
        if (params.hasOwnProperty('result')) {
            tmp = { result: params };
        }
        else {
            tmp = { method: this.method, params };
        }
        if (id) {
            tmp.id = id;
        }
        this.buildRequest(tmp);
    }
}



/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/messages/blade/Ping.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/messages/blade/Ping.js ***!
  \********************************************************************************/
/*! exports provided: Ping */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Ping", function() { return Ping; });
/* harmony import */ var _BaseMessage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../BaseMessage */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/BaseMessage.js");

class Ping extends _BaseMessage__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor() {
        super();
        this.method = 'blade.ping';
        this.buildRequest({ method: this.method, params: {} });
    }
}



/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/messages/blade/Reauthenticate.js":
/*!******************************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/messages/blade/Reauthenticate.js ***!
  \******************************************************************************************/
/*! exports provided: Reauthenticate */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Reauthenticate", function() { return Reauthenticate; });
/* harmony import */ var _BaseMessage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../BaseMessage */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/BaseMessage.js");

class Reauthenticate extends _BaseMessage__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(project, jwt_token, sessionid) {
        super();
        this.method = 'blade.reauthenticate';
        const params = { sessionid, authentication: { project, jwt_token } };
        this.buildRequest({ method: this.method, params });
    }
}



/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/messages/blade/Subscription.js":
/*!****************************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/messages/blade/Subscription.js ***!
  \****************************************************************************************/
/*! exports provided: Subscription */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Subscription", function() { return Subscription; });
/* harmony import */ var _BaseMessage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../BaseMessage */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/BaseMessage.js");

class Subscription extends _BaseMessage__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(params) {
        super();
        this.method = 'blade.subscription';
        if (params.hasOwnProperty('auto_create') && !params.auto_create) {
            delete params.auto_create;
        }
        if (params.hasOwnProperty('downstream') && !params.downstream) {
            delete params.downstream;
        }
        this.buildRequest({ method: this.method, params });
    }
}



/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/messages/verto/BaseRequest.js":
/*!***************************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/messages/verto/BaseRequest.js ***!
  \***************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return BaseRequest; });
/* harmony import */ var _BaseMessage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../BaseMessage */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/BaseMessage.js");
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};

const tmpMap = {
    id: 'callID',
    destinationNumber: 'destination_number',
    remoteCallerName: 'remote_caller_id_name',
    remoteCallerNumber: 'remote_caller_id_number',
    callerName: 'caller_id_name',
    callerNumber: 'caller_id_number'
};
class BaseRequest extends _BaseMessage__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(params = {}) {
        super();
        if (params.hasOwnProperty('dialogParams')) {
            const _a = params.dialogParams, { remoteSdp, localStream, remoteStream, onNotification, camId, micId, speakerId } = _a, dialogParams = __rest(_a, ["remoteSdp", "localStream", "remoteStream", "onNotification", "camId", "micId", "speakerId"]);
            for (const key in tmpMap) {
                if (key && dialogParams.hasOwnProperty(key)) {
                    dialogParams[tmpMap[key]] = dialogParams[key];
                    delete dialogParams[key];
                }
            }
            params.dialogParams = dialogParams;
        }
        this.buildRequest({ method: this.toString(), params });
    }
}


/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/messages/verto/Login.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/messages/verto/Login.js ***!
  \*********************************************************************************/
/*! exports provided: Login */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Login", function() { return Login; });
/* harmony import */ var _BaseRequest__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseRequest */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/verto/BaseRequest.js");

class Login extends _BaseRequest__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(login, passwd, sessionid, userVariables = {}) {
        super();
        this.method = 'login';
        const params = { login, passwd, userVariables, loginParams: {} };
        if (sessionid) {
            params.sessid = sessionid;
        }
        this.buildRequest({ method: this.method, params });
    }
}



/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/messages/verto/Result.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/messages/verto/Result.js ***!
  \**********************************************************************************/
/*! exports provided: Result */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Result", function() { return Result; });
/* harmony import */ var _BaseRequest__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseRequest */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/verto/BaseRequest.js");

class Result extends _BaseRequest__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(id, method) {
        super();
        this.buildRequest({ id, result: { method } });
    }
}



/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/services/BroadcastHandler.js":
/*!**************************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/services/BroadcastHandler.js ***!
  \**************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _util_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/logger */ "./node_modules/@signalwire/js/dist/esm/common/src/util/logger.js");
/* harmony import */ var _webrtc_VertoHandler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../webrtc/VertoHandler */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/VertoHandler.js");


/* harmony default export */ __webpack_exports__["default"] = ((session, broadcastParams) => {
    const { protocol, event, params } = broadcastParams;
    const { event_type, node_id } = params;
    if (protocol !== session.relayProtocol) {
        return _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].error('Session protocol mismatch.');
    }
    switch (event) {
        case 'queuing.relay.events':
            if (event_type === 'webrtc.message') {
                const handler = new _webrtc_VertoHandler__WEBPACK_IMPORTED_MODULE_1__["default"](session);
                handler.nodeId = node_id;
                handler.handleMessage(params.params);
            }
            else {
                session.calling.notificationHandler(params);
            }
            break;
        case 'queuing.relay.tasks':
            session.tasking.notificationHandler(params);
            break;
        case 'queuing.relay.messaging':
            session.messaging.notificationHandler(params);
            break;
        default:
            return _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].error(`Unknown notification type: ${event_type}`);
    }
});


/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/services/Connection.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/services/Connection.js ***!
  \********************************************************************************/
/*! exports provided: setWebSocket, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setWebSocket", function() { return setWebSocket; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Connection; });
/* harmony import */ var _util_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/logger */ "./node_modules/@signalwire/js/dist/esm/common/src/util/logger.js");
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/constants */ "./node_modules/@signalwire/js/dist/esm/common/src/util/constants/index.js");
/* harmony import */ var _util_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/helpers */ "./node_modules/@signalwire/js/dist/esm/common/src/util/helpers.js");
/* harmony import */ var _services_Handler__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../services/Handler */ "./node_modules/@signalwire/js/dist/esm/common/src/services/Handler.js");





let WebSocketClass = typeof WebSocket !== 'undefined' ? WebSocket : null;
const setWebSocket = (websocket) => {
    WebSocketClass = websocket;
};
const WS_STATE = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
};
const REQUEST_TIMEOUT = 10 * 1000;
class Connection {
    constructor(session) {
        this.session = session;
        this._wsClient = null;
        this._host = 'wss://relay.signalwire.com';
        this._timers = {};
        this.upDur = null;
        this.downDur = null;
        const { host } = session.options;
        if (host) {
            this._host = Object(_util_helpers__WEBPACK_IMPORTED_MODULE_2__["checkWebSocketHost"])(host);
        }
    }
    get connected() {
        return this._wsClient && this._wsClient.readyState === WS_STATE.OPEN;
    }
    get connecting() {
        return this._wsClient && this._wsClient.readyState === WS_STATE.CONNECTING;
    }
    get closing() {
        return this._wsClient && this._wsClient.readyState === WS_STATE.CLOSING;
    }
    get closed() {
        return this._wsClient && this._wsClient.readyState === WS_STATE.CLOSED;
    }
    get isAlive() {
        return this.connecting || this.connected;
    }
    get isDead() {
        return this.closing || this.closed;
    }
    connect() {
        this._wsClient = new WebSocketClass(this._host);
        this._wsClient.onopen = (event) => Object(_services_Handler__WEBPACK_IMPORTED_MODULE_3__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_1__["SwEvent"].SocketOpen, event, this.session.uuid);
        this._wsClient.onclose = (event) => Object(_services_Handler__WEBPACK_IMPORTED_MODULE_3__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_1__["SwEvent"].SocketClose, event, this.session.uuid);
        this._wsClient.onerror = (event) => Object(_services_Handler__WEBPACK_IMPORTED_MODULE_3__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_1__["SwEvent"].SocketError, event, this.session.uuid);
        this._wsClient.onmessage = (event) => {
            const msg = Object(_util_helpers__WEBPACK_IMPORTED_MODULE_2__["safeParseJson"])(event.data);
            if (typeof msg === 'string') {
                this._handleStringResponse(msg);
                return;
            }
            this._unsetTimer(msg.id);
            _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].debug('RECV: \n', JSON.stringify(msg, null, 2), '\n');
            if (!Object(_services_Handler__WEBPACK_IMPORTED_MODULE_3__["trigger"])(msg.id, msg)) {
                Object(_services_Handler__WEBPACK_IMPORTED_MODULE_3__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_1__["SwEvent"].SocketMessage, msg, this.session.uuid);
            }
        };
    }
    sendRawText(request) {
        this._wsClient.send(request);
    }
    send(bladeObj) {
        const { request } = bladeObj;
        const promise = new Promise((resolve, reject) => {
            if (request.hasOwnProperty('result')) {
                return resolve();
            }
            Object(_services_Handler__WEBPACK_IMPORTED_MODULE_3__["registerOnce"])(request.id, (response) => {
                const { result, error } = Object(_util_helpers__WEBPACK_IMPORTED_MODULE_2__["destructResponse"])(response);
                return error ? reject(error) : resolve(result);
            });
            this._setTimer(request.id);
        });
        _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].debug('SEND: \n', JSON.stringify(request, null, 2), '\n');
        this._wsClient.send(JSON.stringify(request));
        return promise;
    }
    close() {
        if (this._wsClient) {
            Object(_util_helpers__WEBPACK_IMPORTED_MODULE_2__["isFunction"])(this._wsClient._beginClose) ? this._wsClient._beginClose() : this._wsClient.close();
        }
        this._wsClient = null;
    }
    _unsetTimer(id) {
        clearTimeout(this._timers[id]);
        delete this._timers[id];
    }
    _setTimer(id) {
        this._timers[id] = setTimeout(() => {
            Object(_services_Handler__WEBPACK_IMPORTED_MODULE_3__["trigger"])(id, { error: { code: '408', message: 'Request Timeout' } });
            this._unsetTimer(id);
        }, REQUEST_TIMEOUT);
    }
    _handleStringResponse(response) {
        if (/^#SP/.test(response)) {
            switch (response[3]) {
                case 'U':
                    this.upDur = parseInt(response.substring(4));
                    break;
                case 'D':
                    this.downDur = parseInt(response.substring(4));
                    Object(_services_Handler__WEBPACK_IMPORTED_MODULE_3__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_1__["SwEvent"].SpeedTest, { upDur: this.upDur, downDur: this.downDur }, this.session.uuid);
                    break;
            }
        }
        else {
            _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].warn('Unknown message from socket', response);
        }
    }
}


/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/services/Handler.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/services/Handler.js ***!
  \*****************************************************************************/
/*! exports provided: trigger, register, registerOnce, deRegister, deRegisterAll, isQueued, queueLength */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "trigger", function() { return trigger; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "register", function() { return register; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registerOnce", function() { return registerOnce; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deRegister", function() { return deRegister; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deRegisterAll", function() { return deRegisterAll; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isQueued", function() { return isQueued; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "queueLength", function() { return queueLength; });
/* harmony import */ var _util_helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/helpers */ "./node_modules/@signalwire/js/dist/esm/common/src/util/helpers.js");

const GLOBAL = 'GLOBAL';
const queue = {};
const isQueued = (eventName, uniqueId = GLOBAL) => queue.hasOwnProperty(eventName) && queue[eventName].hasOwnProperty(uniqueId);
const queueLength = (eventName, uniqueId = GLOBAL) => {
    if (!isQueued(eventName, uniqueId)) {
        return 0;
    }
    return queue[eventName][uniqueId].length;
};
const register = (eventName, callback, uniqueId = GLOBAL) => {
    if (!queue.hasOwnProperty(eventName)) {
        queue[eventName] = {};
    }
    if (!queue[eventName].hasOwnProperty(uniqueId)) {
        queue[eventName][uniqueId] = [];
    }
    queue[eventName][uniqueId].push(callback);
};
const registerOnce = (eventName, callback, uniqueId = GLOBAL) => {
    const cb = function (data) {
        deRegister(eventName, cb, uniqueId);
        callback(data);
    };
    cb.prototype.targetRef = callback;
    return register(eventName, cb, uniqueId);
};
const deRegister = (eventName, callback, uniqueId = GLOBAL) => {
    if (!isQueued(eventName, uniqueId)) {
        return false;
    }
    if (Object(_util_helpers__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(callback)) {
        const len = queue[eventName][uniqueId].length;
        for (let i = len - 1; i >= 0; i--) {
            const fn = queue[eventName][uniqueId][i];
            if (callback === fn || (fn.prototype && callback === fn.prototype.targetRef)) {
                queue[eventName][uniqueId].splice(i, 1);
            }
        }
    }
    else {
        queue[eventName][uniqueId] = [];
    }
    if (queue[eventName][uniqueId].length === 0) {
        delete queue[eventName][uniqueId];
        if (Object(_util_helpers__WEBPACK_IMPORTED_MODULE_0__["objEmpty"])(queue[eventName])) {
            delete queue[eventName];
        }
    }
    return true;
};
const trigger = (eventName, data, uniqueId = GLOBAL, globalPropagation = true) => {
    const _propagate = globalPropagation && uniqueId !== GLOBAL;
    if (!isQueued(eventName, uniqueId)) {
        if (_propagate) {
            trigger(eventName, data);
        }
        return false;
    }
    const len = queue[eventName][uniqueId].length;
    if (!len) {
        if (_propagate) {
            trigger(eventName, data);
        }
        return false;
    }
    for (let i = len - 1; i >= 0; i--) {
        queue[eventName][uniqueId][i](data);
    }
    if (_propagate) {
        trigger(eventName, data);
    }
    return true;
};
const deRegisterAll = (eventName) => {
    delete queue[eventName];
};



/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/services/Setup.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/services/Setup.js ***!
  \***************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _util_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/logger */ "./node_modules/@signalwire/js/dist/esm/common/src/util/logger.js");
/* harmony import */ var _messages_Blade__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../messages/Blade */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/Blade.js");
/* harmony import */ var _util_storage___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/storage/ */ "./node_modules/@signalwire/js/dist/esm/common/src/util/storage/index.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



const SETUP_PROTOCOL = 'signalwire';
const SETUP_METHOD = 'setup';
const SETUP_CHANNEL = 'notifications';
/* harmony default export */ __webpack_exports__["default"] = ((session) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {};
    const { signature, relayProtocol } = session;
    if (relayProtocol && relayProtocol.split('_')[1] === signature) {
        params.protocol = relayProtocol;
    }
    else {
        const prevProtocol = yield _util_storage___WEBPACK_IMPORTED_MODULE_2__["sessionStorage"].getItem(signature);
        if (prevProtocol) {
            params.protocol = prevProtocol;
        }
    }
    const be = new _messages_Blade__WEBPACK_IMPORTED_MODULE_1__["Execute"]({ protocol: SETUP_PROTOCOL, method: SETUP_METHOD, params });
    const { protocol = null } = yield session.execute(be);
    if (protocol) {
        yield session.subscribe({ protocol, channels: [SETUP_CHANNEL] });
        yield _util_storage___WEBPACK_IMPORTED_MODULE_2__["sessionStorage"].setItem(signature, protocol);
    }
    else {
        _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].error('Error during setup the session protocol.');
    }
    return protocol;
}));


/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/util/constants/index.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/util/constants/index.js ***!
  \*********************************************************************************/
/*! exports provided: STORAGE_PREFIX, ADD, REMOVE, SESSION_ID, SwEvent, BladeMethod */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "STORAGE_PREFIX", function() { return STORAGE_PREFIX; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ADD", function() { return ADD; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "REMOVE", function() { return REMOVE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SESSION_ID", function() { return SESSION_ID; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SwEvent", function() { return SwEvent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BladeMethod", function() { return BladeMethod; });
const STORAGE_PREFIX = '@signalwire:';
const ADD = 'add';
const REMOVE = 'remove';
const SESSION_ID = 'sessId';
var SwEvent;
(function (SwEvent) {
    SwEvent["SocketOpen"] = "signalwire.socket.open";
    SwEvent["SocketClose"] = "signalwire.socket.close";
    SwEvent["SocketError"] = "signalwire.socket.error";
    SwEvent["SocketMessage"] = "signalwire.socket.message";
    SwEvent["SpeedTest"] = "signalwire.internal.speedtest";
    SwEvent["Ready"] = "signalwire.ready";
    SwEvent["Error"] = "signalwire.error";
    SwEvent["Notification"] = "signalwire.notification";
    SwEvent["Messages"] = "signalwire.messages";
    SwEvent["Calls"] = "signalwire.calls";
    SwEvent["MediaError"] = "signalwire.rtc.mediaError";
})(SwEvent || (SwEvent = {}));
var BladeMethod;
(function (BladeMethod) {
    BladeMethod["Broadcast"] = "blade.broadcast";
    BladeMethod["Disconnect"] = "blade.disconnect";
})(BladeMethod || (BladeMethod = {}));


/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/util/helpers.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/util/helpers.js ***!
  \*************************************************************************/
/*! exports provided: deepCopy, objEmpty, mutateStorageKey, mutateLiveArrayData, safeParseJson, isDefined, isFunction, findElementByType, checkWebSocketHost, destructResponse */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deepCopy", function() { return deepCopy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "objEmpty", function() { return objEmpty; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mutateStorageKey", function() { return mutateStorageKey; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mutateLiveArrayData", function() { return mutateLiveArrayData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "safeParseJson", function() { return safeParseJson; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDefined", function() { return isDefined; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isFunction", function() { return isFunction; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findElementByType", function() { return findElementByType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkWebSocketHost", function() { return checkWebSocketHost; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "destructResponse", function() { return destructResponse; });
/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./logger */ "./node_modules/@signalwire/js/dist/esm/common/src/util/logger.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants */ "./node_modules/@signalwire/js/dist/esm/common/src/util/constants/index.js");


const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));
const objEmpty = (obj) => Object.keys(obj).length === 0;
const mutateStorageKey = (key) => `${_constants__WEBPACK_IMPORTED_MODULE_1__["STORAGE_PREFIX"]}${key}`;
const mutateLiveArrayData = (data) => {
    const [participantId, participantNumber, participantName, codec, mediaJson, participantData] = data;
    let media = {};
    try {
        media = JSON.parse(mediaJson.replace(/ID"/g, 'Id"'));
    }
    catch (error) {
        _logger__WEBPACK_IMPORTED_MODULE_0__["default"].warn('Verto LA invalid media JSON string:', mediaJson);
    }
    return { participantId: Number(participantId), participantNumber, participantName, codec, media, participantData };
};
const safeParseJson = (value) => {
    if (typeof value !== 'string') {
        return value;
    }
    try {
        return JSON.parse(value);
    }
    catch (error) {
        return value;
    }
};
const isDefined = (variable) => typeof variable !== 'undefined';
const isFunction = (variable) => variable instanceof Function || typeof variable === 'function';
const findElementByType = (tag) => {
    if (typeof document !== 'object' || !('getElementById' in document)) {
        return null;
    }
    if (typeof tag === 'string') {
        return document.getElementById(tag) || null;
    }
    else if (typeof tag === 'function') {
        return tag();
    }
    else if (tag instanceof HTMLMediaElement) {
        return tag;
    }
    return null;
};
const PROTOCOL_PATTERN = /^(ws|wss):\/\//;
const checkWebSocketHost = (host) => {
    const protocol = PROTOCOL_PATTERN.test(host) ? '' : 'wss://';
    return `${protocol}${host}`;
};
const destructResponse = (response, nodeId = null) => {
    const { result = {}, error } = response;
    if (error) {
        return { error };
    }
    const { result: nestedResult = null } = result;
    if (nestedResult === null) {
        if (nodeId !== null) {
            result.node_id = nodeId;
        }
        return { result };
    }
    const { code = null, node_id = null, result: vertoResult = null } = nestedResult;
    if (code && code !== '200') {
        return { error: nestedResult };
    }
    if (vertoResult) {
        return destructResponse(vertoResult, node_id);
    }
    return { result: nestedResult };
};


/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/util/logger.js":
/*!************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/util/logger.js ***!
  \************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var loglevel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! loglevel */ "./node_modules/loglevel/lib/loglevel.js");
/* harmony import */ var loglevel__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(loglevel__WEBPACK_IMPORTED_MODULE_0__);

const datetime = () => new Date().toISOString().replace('T', ' ').replace('Z', '');
const logger = loglevel__WEBPACK_IMPORTED_MODULE_0___default.a.getLogger('signalwire');
const originalFactory = logger.methodFactory;
logger.methodFactory = (methodName, logLevel, loggerName) => {
    const rawMethod = originalFactory(methodName, logLevel, loggerName);
    return function () {
        const messages = [datetime(), '-'];
        for (let i = 0; i < arguments.length; i++) {
            messages.push(arguments[i]);
        }
        rawMethod.apply(undefined, messages);
    };
};
logger.setLevel(logger.getLevel());
/* harmony default export */ __webpack_exports__["default"] = (logger);


/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/util/storage/index.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/util/storage/index.js ***!
  \*******************************************************************************/
/*! exports provided: localStorage, sessionStorage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(process) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "localStorage", function() { return localStorage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sessionStorage", function() { return sessionStorage; });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../helpers */ "./node_modules/@signalwire/js/dist/esm/common/src/util/helpers.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

const _inNode = () => typeof window === 'undefined' && typeof process !== 'undefined';
const _get = (storageType, key) => __awaiter(void 0, void 0, void 0, function* () {
    if (_inNode())
        return null;
    const res = window[storageType].getItem(Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["mutateStorageKey"])(key));
    return Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["safeParseJson"])(res);
});
const _set = (storageType, key, value) => __awaiter(void 0, void 0, void 0, function* () {
    if (_inNode())
        return null;
    if (typeof value === 'object') {
        value = JSON.stringify(value);
    }
    window[storageType].setItem(Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["mutateStorageKey"])(key), value);
});
const _remove = (storageType, key) => __awaiter(void 0, void 0, void 0, function* () {
    if (_inNode())
        return null;
    return window[storageType].removeItem(Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["mutateStorageKey"])(key));
});
const localStorage = {
    getItem: (key) => _get('localStorage', key),
    setItem: (key, value) => _set('localStorage', key, value),
    removeItem: (key) => _remove('localStorage', key),
};
const sessionStorage = {
    getItem: (key) => _get('sessionStorage', key),
    setItem: (key, value) => _set('sessionStorage', key, value),
    removeItem: (key) => _remove('sessionStorage', key),
};

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../../../../../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/util/webrtc/index.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/util/webrtc/index.js ***!
  \******************************************************************************/
/*! exports provided: RTCPeerConnection, getUserMedia, getDisplayMedia, enumerateDevices, getSupportedConstraints, streamIsValid, attachMediaStream, detachMediaStream, sdpToJsonHack, stopStream, muteMediaElement, unmuteMediaElement, toggleMuteMediaElement, setMediaElementSinkId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RTCPeerConnection", function() { return RTCPeerConnection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getUserMedia", function() { return getUserMedia; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDisplayMedia", function() { return getDisplayMedia; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enumerateDevices", function() { return enumerateDevices; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSupportedConstraints", function() { return getSupportedConstraints; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "streamIsValid", function() { return streamIsValid; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "attachMediaStream", function() { return attachMediaStream; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "detachMediaStream", function() { return detachMediaStream; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sdpToJsonHack", function() { return sdpToJsonHack; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stopStream", function() { return stopStream; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "muteMediaElement", function() { return muteMediaElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unmuteMediaElement", function() { return unmuteMediaElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toggleMuteMediaElement", function() { return toggleMuteMediaElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setMediaElementSinkId", function() { return setMediaElementSinkId; });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../helpers */ "./node_modules/@signalwire/js/dist/esm/common/src/util/helpers.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

const RTCPeerConnection = (config) => new window.RTCPeerConnection(config);
const getUserMedia = (constraints) => navigator.mediaDevices.getUserMedia(constraints);
const getDisplayMedia = (constraints) => navigator.mediaDevices.getDisplayMedia(constraints);
const enumerateDevices = () => navigator.mediaDevices.enumerateDevices();
const getSupportedConstraints = () => navigator.mediaDevices.getSupportedConstraints();
const streamIsValid = (stream) => stream && stream instanceof MediaStream;
const attachMediaStream = (tag, stream) => {
    const element = Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["findElementByType"])(tag);
    if (element === null) {
        return;
    }
    if (!element.getAttribute('autoplay')) {
        element.setAttribute('autoplay', 'autoplay');
    }
    if (!element.getAttribute('playsinline')) {
        element.setAttribute('playsinline', 'playsinline');
    }
    element.srcObject = stream;
};
const detachMediaStream = (tag) => {
    const element = Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["findElementByType"])(tag);
    if (element) {
        element.srcObject = null;
    }
};
const muteMediaElement = (tag) => {
    const element = Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["findElementByType"])(tag);
    if (element) {
        element.muted = true;
    }
};
const unmuteMediaElement = (tag) => {
    const element = Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["findElementByType"])(tag);
    if (element) {
        element.muted = false;
    }
};
const toggleMuteMediaElement = (tag) => {
    const element = Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["findElementByType"])(tag);
    if (element) {
        element.muted = !element.muted;
    }
};
const setMediaElementSinkId = (tag, deviceId) => __awaiter(void 0, void 0, void 0, function* () {
    const element = Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["findElementByType"])(tag);
    if (element === null) {
        return false;
    }
    try {
        yield element.setSinkId(deviceId);
        return true;
    }
    catch (error) {
        return false;
    }
});
const sdpToJsonHack = sdp => sdp;
const stopStream = (stream) => {
    if (streamIsValid(stream)) {
        stream.getTracks().forEach(t => t.stop());
    }
    stream = null;
};



/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/BaseCall.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/webrtc/BaseCall.js ***!
  \****************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return BaseCall; });
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/index.js");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(uuid__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _util_logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/logger */ "./node_modules/@signalwire/js/dist/esm/common/src/util/logger.js");
/* harmony import */ var _messages_Verto__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../messages/Verto */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/Verto.js");
/* harmony import */ var _Peer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Peer */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/Peer.js");
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/constants */ "./node_modules/@signalwire/js/dist/esm/common/src/util/constants/index.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./constants */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/constants.js");
/* harmony import */ var _services_Handler__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../services/Handler */ "./node_modules/@signalwire/js/dist/esm/common/src/services/Handler.js");
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./helpers */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/helpers.js");
/* harmony import */ var _util_helpers__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../util/helpers */ "./node_modules/@signalwire/js/dist/esm/common/src/util/helpers.js");
/* harmony import */ var _util_webrtc__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../util/webrtc */ "./node_modules/@signalwire/js/dist/esm/common/src/util/webrtc/index.js");
/* harmony import */ var _LayoutHandler__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./LayoutHandler */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/LayoutHandler.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};











class BaseCall {
    constructor(session, opts) {
        this.session = session;
        this.id = '';
        this.state = _constants__WEBPACK_IMPORTED_MODULE_5__["State"][_constants__WEBPACK_IMPORTED_MODULE_5__["State"].New];
        this.prevState = '';
        this.channels = [];
        this.role = _constants__WEBPACK_IMPORTED_MODULE_5__["Role"].Participant;
        this.extension = null;
        this._state = _constants__WEBPACK_IMPORTED_MODULE_5__["State"].New;
        this._prevState = _constants__WEBPACK_IMPORTED_MODULE_5__["State"].New;
        this.gotAnswer = false;
        this.gotEarly = false;
        this._lastSerno = 0;
        this._targetNodeId = null;
        this._iceTimeout = null;
        this._iceDone = false;
        this._checkConferenceSerno = (serno) => {
            const check = (serno < 0) || (!this._lastSerno || (this._lastSerno && serno === (this._lastSerno + 1)));
            if (check && serno >= 0) {
                this._lastSerno = serno;
            }
            return check;
        };
        const { iceServers, speaker: speakerId, micId, micLabel, camId, camLabel, localElement, remoteElement, mediaConstraints: { audio, video } } = session;
        this.options = Object.assign({}, _constants__WEBPACK_IMPORTED_MODULE_5__["DEFAULT_CALL_OPTIONS"], { audio, video, iceServers, localElement, remoteElement, micId, micLabel, camId, camLabel, speakerId }, opts);
        this._onMediaError = this._onMediaError.bind(this);
        this._init();
    }
    get nodeId() {
        return this._targetNodeId;
    }
    set nodeId(what) {
        this._targetNodeId = what;
    }
    get localStream() {
        return this.options.localStream;
    }
    get remoteStream() {
        return this.options.remoteStream;
    }
    get memberChannel() {
        return `conference-member.${this.id}`;
    }
    invite() {
        this.direction = _constants__WEBPACK_IMPORTED_MODULE_5__["Direction"].Outbound;
        this.peer = new _Peer__WEBPACK_IMPORTED_MODULE_3__["default"](_constants__WEBPACK_IMPORTED_MODULE_5__["PeerType"].Offer, this.options);
        this._registerPeerEvents();
    }
    answer() {
        this.direction = _constants__WEBPACK_IMPORTED_MODULE_5__["Direction"].Inbound;
        this.peer = new _Peer__WEBPACK_IMPORTED_MODULE_3__["default"](_constants__WEBPACK_IMPORTED_MODULE_5__["PeerType"].Answer, this.options);
        this._registerPeerEvents();
    }
    hangup(params = {}, execute = true) {
        this.cause = params.cause || 'NORMAL_CLEARING';
        this.causeCode = params.causeCode || 16;
        this.setState(_constants__WEBPACK_IMPORTED_MODULE_5__["State"].Hangup);
        const _close = () => {
            this.peer ? this.peer.instance.close() : null;
            this.setState(_constants__WEBPACK_IMPORTED_MODULE_5__["State"].Destroy);
        };
        if (execute) {
            const bye = new _messages_Verto__WEBPACK_IMPORTED_MODULE_2__["Bye"]({ sessid: this.session.sessionid, dialogParams: this.options });
            this._execute(bye)
                .catch(error => _util_logger__WEBPACK_IMPORTED_MODULE_1__["default"].error('verto.bye failed!', error))
                .then(_close.bind(this));
        }
        else {
            _close();
        }
    }
    transfer(destination) {
        const msg = new _messages_Verto__WEBPACK_IMPORTED_MODULE_2__["Modify"]({ sessid: this.session.sessionid, action: 'transfer', destination, dialogParams: this.options });
        this._execute(msg);
    }
    replace(replaceCallID) {
        const msg = new _messages_Verto__WEBPACK_IMPORTED_MODULE_2__["Modify"]({ sessid: this.session.sessionid, action: 'replace', replaceCallID, dialogParams: this.options });
        this._execute(msg);
    }
    hold() {
        const msg = new _messages_Verto__WEBPACK_IMPORTED_MODULE_2__["Modify"]({ sessid: this.session.sessionid, action: 'hold', dialogParams: this.options });
        return this._execute(msg)
            .then(this._handleChangeHoldStateSuccess.bind(this))
            .catch(this._handleChangeHoldStateError.bind(this));
    }
    unhold() {
        const msg = new _messages_Verto__WEBPACK_IMPORTED_MODULE_2__["Modify"]({ sessid: this.session.sessionid, action: 'unhold', dialogParams: this.options });
        return this._execute(msg)
            .then(this._handleChangeHoldStateSuccess.bind(this))
            .catch(this._handleChangeHoldStateError.bind(this));
    }
    toggleHold() {
        const msg = new _messages_Verto__WEBPACK_IMPORTED_MODULE_2__["Modify"]({ sessid: this.session.sessionid, action: 'toggleHold', dialogParams: this.options });
        return this._execute(msg)
            .then(this._handleChangeHoldStateSuccess.bind(this))
            .catch(this._handleChangeHoldStateError.bind(this));
    }
    dtmf(dtmf) {
        const msg = new _messages_Verto__WEBPACK_IMPORTED_MODULE_2__["Info"]({ sessid: this.session.sessionid, dtmf, dialogParams: this.options });
        this._execute(msg);
    }
    message(to, body) {
        const msg = { from: this.session.options.login, to, body };
        const info = new _messages_Verto__WEBPACK_IMPORTED_MODULE_2__["Info"]({ sessid: this.session.sessionid, msg, dialogParams: this.options });
        this._execute(info);
    }
    muteAudio() {
        Object(_helpers__WEBPACK_IMPORTED_MODULE_7__["disableAudioTracks"])(this.options.localStream);
    }
    unmuteAudio() {
        Object(_helpers__WEBPACK_IMPORTED_MODULE_7__["enableAudioTracks"])(this.options.localStream);
    }
    toggleAudioMute() {
        Object(_helpers__WEBPACK_IMPORTED_MODULE_7__["toggleAudioTracks"])(this.options.localStream);
    }
    setAudioInDevice(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { instance } = this.peer;
            const sender = instance.getSenders().find(({ track: { kind } }) => kind === 'audio');
            if (sender) {
                const newStream = yield Object(_util_webrtc__WEBPACK_IMPORTED_MODULE_9__["getUserMedia"])({ audio: { deviceId: { exact: deviceId } } });
                const audioTrack = newStream.getAudioTracks()[0];
                sender.replaceTrack(audioTrack);
                this.options.micId = deviceId;
                const { localStream } = this.options;
                localStream.getAudioTracks().forEach(t => t.stop());
                localStream.getVideoTracks().forEach(t => newStream.addTrack(t));
                this.options.localStream = newStream;
            }
        });
    }
    muteVideo() {
        Object(_helpers__WEBPACK_IMPORTED_MODULE_7__["disableVideoTracks"])(this.options.localStream);
    }
    unmuteVideo() {
        Object(_helpers__WEBPACK_IMPORTED_MODULE_7__["enableVideoTracks"])(this.options.localStream);
    }
    toggleVideoMute() {
        Object(_helpers__WEBPACK_IMPORTED_MODULE_7__["toggleVideoTracks"])(this.options.localStream);
    }
    setVideoDevice(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { instance } = this.peer;
            const sender = instance.getSenders().find(({ track: { kind } }) => kind === 'video');
            if (sender) {
                const newStream = yield Object(_util_webrtc__WEBPACK_IMPORTED_MODULE_9__["getUserMedia"])({ video: { deviceId: { exact: deviceId } } });
                const videoTrack = newStream.getVideoTracks()[0];
                sender.replaceTrack(videoTrack);
                const { localElement, localStream } = this.options;
                Object(_util_webrtc__WEBPACK_IMPORTED_MODULE_9__["attachMediaStream"])(localElement, newStream);
                this.options.camId = deviceId;
                localStream.getAudioTracks().forEach(t => newStream.addTrack(t));
                localStream.getVideoTracks().forEach(t => t.stop());
                this.options.localStream = newStream;
            }
        });
    }
    deaf() {
        Object(_helpers__WEBPACK_IMPORTED_MODULE_7__["disableAudioTracks"])(this.options.remoteStream);
    }
    undeaf() {
        Object(_helpers__WEBPACK_IMPORTED_MODULE_7__["enableAudioTracks"])(this.options.remoteStream);
    }
    toggleDeaf() {
        Object(_helpers__WEBPACK_IMPORTED_MODULE_7__["toggleAudioTracks"])(this.options.remoteStream);
    }
    setState(state) {
        this._prevState = this._state;
        this._state = state;
        this.state = _constants__WEBPACK_IMPORTED_MODULE_5__["State"][this._state].toLowerCase();
        this.prevState = _constants__WEBPACK_IMPORTED_MODULE_5__["State"][this._prevState].toLowerCase();
        _util_logger__WEBPACK_IMPORTED_MODULE_1__["default"].info(`Call ${this.id} state change from ${this.prevState} to ${this.state}`);
        this._dispatchNotification({ type: _constants__WEBPACK_IMPORTED_MODULE_5__["NOTIFICATION_TYPE"].callUpdate, call: this });
        switch (state) {
            case _constants__WEBPACK_IMPORTED_MODULE_5__["State"].Purge:
                this.hangup({ cause: 'PURGE', causeCode: '01' }, false);
                break;
            case _constants__WEBPACK_IMPORTED_MODULE_5__["State"].Active: {
                setTimeout(() => {
                    const { remoteElement, speakerId } = this.options;
                    if (remoteElement && speakerId) {
                        Object(_util_webrtc__WEBPACK_IMPORTED_MODULE_9__["setMediaElementSinkId"])(remoteElement, speakerId);
                    }
                }, 0);
                break;
            }
            case _constants__WEBPACK_IMPORTED_MODULE_5__["State"].Destroy:
                this._finalize();
                break;
        }
    }
    handleMessage(msg) {
        const { method, params } = msg;
        switch (method) {
            case _constants__WEBPACK_IMPORTED_MODULE_5__["VertoMethod"].Answer: {
                this.gotAnswer = true;
                if (this._state >= _constants__WEBPACK_IMPORTED_MODULE_5__["State"].Active) {
                    return;
                }
                if (this._state >= _constants__WEBPACK_IMPORTED_MODULE_5__["State"].Early) {
                    this.setState(_constants__WEBPACK_IMPORTED_MODULE_5__["State"].Active);
                }
                if (!this.gotEarly) {
                    this._onRemoteSdp(params.sdp);
                }
                break;
            }
            case _constants__WEBPACK_IMPORTED_MODULE_5__["VertoMethod"].Media: {
                if (this._state >= _constants__WEBPACK_IMPORTED_MODULE_5__["State"].Early) {
                    return;
                }
                this.gotEarly = true;
                this._onRemoteSdp(params.sdp);
                break;
            }
            case _constants__WEBPACK_IMPORTED_MODULE_5__["VertoMethod"].Display:
            case _constants__WEBPACK_IMPORTED_MODULE_5__["VertoMethod"].Attach: {
                const { display_name: displayName, display_number: displayNumber, display_direction } = params;
                this.extension = displayNumber;
                const displayDirection = display_direction === _constants__WEBPACK_IMPORTED_MODULE_5__["Direction"].Inbound ? _constants__WEBPACK_IMPORTED_MODULE_5__["Direction"].Outbound : _constants__WEBPACK_IMPORTED_MODULE_5__["Direction"].Inbound;
                const notification = { type: _constants__WEBPACK_IMPORTED_MODULE_5__["NOTIFICATION_TYPE"][method], call: this, displayName, displayNumber, displayDirection };
                if (!Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_4__["SwEvent"].Notification, notification, this.id)) {
                    Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_4__["SwEvent"].Notification, notification, this.session.uuid);
                }
                break;
            }
            case _constants__WEBPACK_IMPORTED_MODULE_5__["VertoMethod"].Info:
            case _constants__WEBPACK_IMPORTED_MODULE_5__["VertoMethod"].Event: {
                const notification = Object.assign(Object.assign({}, params), { type: _constants__WEBPACK_IMPORTED_MODULE_5__["NOTIFICATION_TYPE"].generic, call: this });
                if (!Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_4__["SwEvent"].Notification, notification, this.id)) {
                    Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_4__["SwEvent"].Notification, notification, this.session.uuid);
                }
                break;
            }
            case _constants__WEBPACK_IMPORTED_MODULE_5__["VertoMethod"].Bye:
                this.hangup(params, false);
                break;
        }
    }
    handleConferenceUpdate(packet, initialPvtData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._checkConferenceSerno(packet.wireSerno) && packet.name !== initialPvtData.laName) {
                _util_logger__WEBPACK_IMPORTED_MODULE_1__["default"].error('ConferenceUpdate invalid wireSerno or packet name:', packet);
                return 'INVALID_PACKET';
            }
            const { action, data, hashKey: callId = String(this._lastSerno), arrIndex: index } = packet;
            switch (action) {
                case 'bootObj': {
                    this._lastSerno = 0;
                    const { chatID, chatChannel, infoChannel, modChannel, laName, conferenceMemberID, role } = initialPvtData;
                    this._dispatchConferenceUpdate({ action: _constants__WEBPACK_IMPORTED_MODULE_5__["ConferenceAction"].Join, conferenceName: laName, participantId: Number(conferenceMemberID), role });
                    if (chatChannel) {
                        yield this._subscribeConferenceChat(chatChannel);
                    }
                    if (infoChannel) {
                        yield this._subscribeConferenceInfo(infoChannel);
                    }
                    if (modChannel && role === _constants__WEBPACK_IMPORTED_MODULE_5__["Role"].Moderator) {
                        yield this._subscribeConferenceModerator(modChannel);
                    }
                    const participants = [];
                    for (const i in data) {
                        participants.push(Object.assign({ callId: data[i][0], index: Number(i) }, Object(_util_helpers__WEBPACK_IMPORTED_MODULE_8__["mutateLiveArrayData"])(data[i][1])));
                    }
                    this._dispatchConferenceUpdate({ action: _constants__WEBPACK_IMPORTED_MODULE_5__["ConferenceAction"].Bootstrap, participants });
                    break;
                }
                case 'add': {
                    this._dispatchConferenceUpdate(Object.assign({ action: _constants__WEBPACK_IMPORTED_MODULE_5__["ConferenceAction"].Add, callId, index }, Object(_util_helpers__WEBPACK_IMPORTED_MODULE_8__["mutateLiveArrayData"])(data)));
                    break;
                }
                case 'modify':
                    this._dispatchConferenceUpdate(Object.assign({ action: _constants__WEBPACK_IMPORTED_MODULE_5__["ConferenceAction"].Modify, callId, index }, Object(_util_helpers__WEBPACK_IMPORTED_MODULE_8__["mutateLiveArrayData"])(data)));
                    break;
                case 'del':
                    this._dispatchConferenceUpdate(Object.assign({ action: _constants__WEBPACK_IMPORTED_MODULE_5__["ConferenceAction"].Delete, callId, index }, Object(_util_helpers__WEBPACK_IMPORTED_MODULE_8__["mutateLiveArrayData"])(data)));
                    break;
                case 'clear':
                    this._dispatchConferenceUpdate({ action: _constants__WEBPACK_IMPORTED_MODULE_5__["ConferenceAction"].Clear });
                    break;
                default:
                    this._dispatchConferenceUpdate({ action, data, callId, index });
                    break;
            }
        });
    }
    _addChannel(channel) {
        if (!this.channels.includes(channel)) {
            this.channels.push(channel);
        }
        const protocol = this.session.relayProtocol;
        if (this.session._existsSubscription(protocol, channel)) {
            this.session.subscriptions[protocol][channel] = Object.assign(Object.assign({}, this.session.subscriptions[protocol][channel]), { callId: this.id });
        }
    }
    _subscribeConferenceChat(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            const tmp = {
                nodeId: this.nodeId,
                channels: [channel],
                handler: (params) => {
                    const { direction, from: participantNumber, fromDisplay: participantName, message: messageText, type: messageType } = params.data;
                    this._dispatchConferenceUpdate({ action: _constants__WEBPACK_IMPORTED_MODULE_5__["ConferenceAction"].ChatMessage, direction, participantNumber, participantName, messageText, messageType, messageId: params.eventSerno });
                }
            };
            const response = yield this.session.vertoSubscribe(tmp)
                .catch(error => {
                _util_logger__WEBPACK_IMPORTED_MODULE_1__["default"].error('ConfChat subscription error:', error);
            });
            if (Object(_helpers__WEBPACK_IMPORTED_MODULE_7__["checkSubscribeResponse"])(response, channel)) {
                this._addChannel(channel);
                Object.defineProperties(this, {
                    sendChatMessage: {
                        configurable: true,
                        value: (message, type) => {
                            this.session.vertoBroadcast({ nodeId: this.nodeId, channel, data: { action: 'send', message, type } });
                        }
                    }
                });
            }
        });
    }
    _subscribeConferenceInfo(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            const tmp = {
                nodeId: this.nodeId,
                channels: [channel],
                handler: (params) => {
                    const { eventData } = params;
                    switch (eventData.contentType) {
                        case 'layout-info':
                            eventData.callID = this.id;
                            Object(_LayoutHandler__WEBPACK_IMPORTED_MODULE_10__["MCULayoutEventHandler"])(this.session, eventData);
                            break;
                        default:
                            _util_logger__WEBPACK_IMPORTED_MODULE_1__["default"].error('Conference-Info unknown contentType', params);
                    }
                }
            };
            const response = yield this.session.vertoSubscribe(tmp)
                .catch(error => {
                _util_logger__WEBPACK_IMPORTED_MODULE_1__["default"].error('ConfInfo subscription error:', error);
            });
            if (Object(_helpers__WEBPACK_IMPORTED_MODULE_7__["checkSubscribeResponse"])(response, channel)) {
                this._addChannel(channel);
            }
        });
    }
    _confControl(channel, params = {}) {
        const data = Object.assign({ application: 'conf-control', callID: this.id, value: null }, params);
        this.session.vertoBroadcast({ nodeId: this.nodeId, channel, data });
    }
    _subscribeConferenceModerator(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            const _modCommand = (command, memberID = null, value = null) => {
                const id = parseInt(memberID) || null;
                this._confControl(channel, { command, id, value });
            };
            const _videoRequired = () => {
                const { video } = this.options;
                if ((typeof video === 'boolean' && !video) || (typeof video === 'object' && Object(_util_helpers__WEBPACK_IMPORTED_MODULE_8__["objEmpty"])(video))) {
                    throw `Conference ${this.id} has no video!`;
                }
            };
            const tmp = {
                nodeId: this.nodeId,
                channels: [channel],
                handler: (params) => {
                    const { data } = params;
                    switch (data['conf-command']) {
                        case 'list-videoLayouts':
                            if (data.responseData) {
                                const tmp = JSON.stringify(data.responseData).replace(/IDS"/g, 'Ids"');
                                this._dispatchConferenceUpdate({ action: _constants__WEBPACK_IMPORTED_MODULE_5__["ConferenceAction"].LayoutList, layouts: JSON.parse(tmp) });
                            }
                            break;
                        default:
                            this._dispatchConferenceUpdate({ action: _constants__WEBPACK_IMPORTED_MODULE_5__["ConferenceAction"].ModCmdResponse, command: data['conf-command'], response: data.response });
                    }
                }
            };
            const response = yield this.session.vertoSubscribe(tmp)
                .catch(error => {
                _util_logger__WEBPACK_IMPORTED_MODULE_1__["default"].error('ConfMod subscription error:', error);
            });
            if (Object(_helpers__WEBPACK_IMPORTED_MODULE_7__["checkSubscribeResponse"])(response, channel)) {
                this.role = _constants__WEBPACK_IMPORTED_MODULE_5__["Role"].Moderator;
                this._addChannel(channel);
                Object.defineProperties(this, {
                    listVideoLayouts: {
                        configurable: true,
                        value: () => {
                            _modCommand('list-videoLayouts');
                        }
                    },
                    playMedia: {
                        configurable: true,
                        value: (file) => {
                            _modCommand('play', null, file);
                        }
                    },
                    stopMedia: {
                        configurable: true,
                        value: () => {
                            _modCommand('stop', null, 'all');
                        }
                    },
                    deaf: {
                        configurable: true,
                        value: (memberID) => {
                            _modCommand('deaf', memberID);
                        }
                    },
                    undeaf: {
                        configurable: true,
                        value: (memberID) => {
                            _modCommand('undeaf', memberID);
                        }
                    },
                    startRecord: {
                        configurable: true,
                        value: (file) => {
                            _modCommand('recording', null, ['start', file]);
                        }
                    },
                    stopRecord: {
                        configurable: true,
                        value: () => {
                            _modCommand('recording', null, ['stop', 'all']);
                        }
                    },
                    snapshot: {
                        configurable: true,
                        value: (file) => {
                            _videoRequired();
                            _modCommand('vid-write-png', null, file);
                        }
                    },
                    setVideoLayout: {
                        configurable: true,
                        value: (layout, canvasID) => {
                            _videoRequired();
                            const value = canvasID ? [layout, canvasID] : layout;
                            _modCommand('vid-layout', null, value);
                        }
                    },
                    kick: {
                        configurable: true,
                        value: (memberID) => {
                            _modCommand('kick', memberID);
                        }
                    },
                    muteMic: {
                        configurable: true,
                        value: (memberID) => {
                            _modCommand('tmute', memberID);
                        }
                    },
                    muteVideo: {
                        configurable: true,
                        value: (memberID) => {
                            _videoRequired();
                            _modCommand('tvmute', memberID);
                        }
                    },
                    presenter: {
                        configurable: true,
                        value: (memberID) => {
                            _videoRequired();
                            _modCommand('vid-res-id', memberID, 'presenter');
                        }
                    },
                    videoFloor: {
                        configurable: true,
                        value: (memberID) => {
                            _videoRequired();
                            _modCommand('vid-floor', memberID, 'force');
                        }
                    },
                    banner: {
                        configurable: true,
                        value: (memberID, text) => {
                            _videoRequired();
                            _modCommand('vid-banner', memberID, encodeURI(text));
                        }
                    },
                    volumeDown: {
                        configurable: true,
                        value: (memberID) => {
                            _modCommand('volume_out', memberID, 'down');
                        }
                    },
                    volumeUp: {
                        configurable: true,
                        value: (memberID) => {
                            _modCommand('volume_out', memberID, 'up');
                        }
                    },
                    gainDown: {
                        configurable: true,
                        value: (memberID) => {
                            _modCommand('volume_in', memberID, 'down');
                        }
                    },
                    gainUp: {
                        configurable: true,
                        value: (memberID) => {
                            _modCommand('volume_in', memberID, 'up');
                        }
                    },
                    transfer: {
                        configurable: true,
                        value: (memberID, exten) => {
                            _modCommand('transfer', memberID, exten);
                        }
                    }
                });
            }
        });
    }
    _handleChangeHoldStateSuccess(response) {
        response.holdState === 'active' ? this.setState(_constants__WEBPACK_IMPORTED_MODULE_5__["State"].Active) : this.setState(_constants__WEBPACK_IMPORTED_MODULE_5__["State"].Held);
        return true;
    }
    _handleChangeHoldStateError(error) {
        _util_logger__WEBPACK_IMPORTED_MODULE_1__["default"].error(`Failed to ${error.action} on call ${this.id}`);
        return false;
    }
    _onRemoteSdp(remoteSdp) {
        let sdp = Object(_helpers__WEBPACK_IMPORTED_MODULE_7__["sdpMediaOrderHack"])(remoteSdp, this.peer.instance.localDescription.sdp);
        if (this.options.useStereo) {
            sdp = Object(_helpers__WEBPACK_IMPORTED_MODULE_7__["sdpStereoHack"])(sdp);
        }
        const sessionDescr = Object(_util_webrtc__WEBPACK_IMPORTED_MODULE_9__["sdpToJsonHack"])({ sdp, type: _constants__WEBPACK_IMPORTED_MODULE_5__["PeerType"].Answer });
        this.peer.instance.setRemoteDescription(sessionDescr)
            .then(() => {
            if (this.gotEarly) {
                this.setState(_constants__WEBPACK_IMPORTED_MODULE_5__["State"].Early);
            }
            if (this.gotAnswer) {
                this.setState(_constants__WEBPACK_IMPORTED_MODULE_5__["State"].Active);
            }
        })
            .catch(error => {
            _util_logger__WEBPACK_IMPORTED_MODULE_1__["default"].error('Call setRemoteDescription Error: ', error);
            this.hangup();
        });
    }
    _requestAnotherLocalDescription() {
        if (Object(_util_helpers__WEBPACK_IMPORTED_MODULE_8__["isFunction"])(this.peer.onSdpReadyTwice)) {
            Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_4__["SwEvent"].Error, new Error('SDP without candidates for the second time!'), this.session.uuid);
            return;
        }
        Object.defineProperty(this.peer, 'onSdpReadyTwice', { value: this._onIceSdp.bind(this) });
        this._iceDone = false;
        this.peer.startNegotiation();
    }
    _onIceSdp(data) {
        if (this._iceTimeout) {
            clearTimeout(this._iceTimeout);
        }
        this._iceTimeout = null;
        this._iceDone = true;
        const { sdp, type } = data;
        if (sdp.indexOf('candidate') === -1) {
            this._requestAnotherLocalDescription();
            return;
        }
        let msg = null;
        const tmpParams = { sessid: this.session.sessionid, sdp, dialogParams: this.options };
        switch (type) {
            case _constants__WEBPACK_IMPORTED_MODULE_5__["PeerType"].Offer:
                this.setState(_constants__WEBPACK_IMPORTED_MODULE_5__["State"].Requesting);
                msg = new _messages_Verto__WEBPACK_IMPORTED_MODULE_2__["Invite"](tmpParams);
                break;
            case _constants__WEBPACK_IMPORTED_MODULE_5__["PeerType"].Answer:
                this.setState(_constants__WEBPACK_IMPORTED_MODULE_5__["State"].Answering);
                msg = this.options.attach === true ? new _messages_Verto__WEBPACK_IMPORTED_MODULE_2__["Attach"](tmpParams) : new _messages_Verto__WEBPACK_IMPORTED_MODULE_2__["Answer"](tmpParams);
                break;
            default:
                _util_logger__WEBPACK_IMPORTED_MODULE_1__["default"].error(`${this.id} - Unknown local SDP type:`, data);
                return this.hangup({}, false);
        }
        this._execute(msg)
            .then(response => {
            const { node_id = null } = response;
            this._targetNodeId = node_id;
            type === _constants__WEBPACK_IMPORTED_MODULE_5__["PeerType"].Offer ? this.setState(_constants__WEBPACK_IMPORTED_MODULE_5__["State"].Trying) : this.setState(_constants__WEBPACK_IMPORTED_MODULE_5__["State"].Active);
        })
            .catch(error => {
            _util_logger__WEBPACK_IMPORTED_MODULE_1__["default"].error(`${this.id} - Sending ${type} error:`, error);
            this.hangup();
        });
    }
    _registerPeerEvents() {
        const { instance } = this.peer;
        this._iceDone = false;
        instance.onicecandidate = event => {
            if (this._iceDone) {
                return;
            }
            if (this._iceTimeout === null) {
                this._iceTimeout = setTimeout(() => this._onIceSdp(instance.localDescription), 1000);
            }
            if (event.candidate) {
                _util_logger__WEBPACK_IMPORTED_MODULE_1__["default"].info('IceCandidate:', event.candidate);
            }
            else {
                this._onIceSdp(instance.localDescription);
            }
        };
        instance.addEventListener('track', (event) => {
            this.options.remoteStream = event.streams[0];
            const { remoteElement, remoteStream, screenShare } = this.options;
            if (screenShare === false) {
                Object(_util_webrtc__WEBPACK_IMPORTED_MODULE_9__["attachMediaStream"])(remoteElement, remoteStream);
            }
        });
        instance.addEventListener('addstream', (event) => {
            this.options.remoteStream = event.stream;
        });
    }
    _onMediaError(error) {
        this._dispatchNotification({ type: _constants__WEBPACK_IMPORTED_MODULE_5__["NOTIFICATION_TYPE"].userMediaError, error });
        this.hangup({}, false);
    }
    _dispatchConferenceUpdate(params) {
        this._dispatchNotification(Object.assign({ type: _constants__WEBPACK_IMPORTED_MODULE_5__["NOTIFICATION_TYPE"].conferenceUpdate, call: this }, params));
    }
    _dispatchNotification(notification) {
        if (this.options.screenShare === true) {
            return;
        }
        if (!Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_4__["SwEvent"].Notification, notification, this.id, false)) {
            Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_4__["SwEvent"].Notification, notification, this.session.uuid);
        }
    }
    _execute(msg) {
        if (this.nodeId) {
            msg.targetNodeId = this.nodeId;
        }
        return this.session.execute(msg);
    }
    _init() {
        const { id, userVariables, remoteCallerNumber, onNotification } = this.options;
        if (!id) {
            this.options.id = Object(uuid__WEBPACK_IMPORTED_MODULE_0__["v4"])();
        }
        this.id = this.options.id;
        if (!userVariables || Object(_util_helpers__WEBPACK_IMPORTED_MODULE_8__["objEmpty"])(userVariables)) {
            this.options.userVariables = this.session.options.userVariables || {};
        }
        if (!remoteCallerNumber) {
            this.options.remoteCallerNumber = this.options.destinationNumber;
        }
        this.session.calls[this.id] = this;
        Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["register"])(_util_constants__WEBPACK_IMPORTED_MODULE_4__["SwEvent"].MediaError, this._onMediaError, this.id);
        if (Object(_util_helpers__WEBPACK_IMPORTED_MODULE_8__["isFunction"])(onNotification)) {
            Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["register"])(_util_constants__WEBPACK_IMPORTED_MODULE_4__["SwEvent"].Notification, onNotification.bind(this), this.id);
        }
        this.setState(_constants__WEBPACK_IMPORTED_MODULE_5__["State"].New);
        _util_logger__WEBPACK_IMPORTED_MODULE_1__["default"].info('New Call with Options:', this.options);
    }
    _finalize() {
        const { remoteStream, localStream, remoteElement, localElement } = this.options;
        Object(_util_webrtc__WEBPACK_IMPORTED_MODULE_9__["stopStream"])(remoteStream);
        Object(_util_webrtc__WEBPACK_IMPORTED_MODULE_9__["stopStream"])(localStream);
        if (this.options.screenShare !== true) {
            Object(_util_webrtc__WEBPACK_IMPORTED_MODULE_9__["detachMediaStream"])(remoteElement);
            Object(_util_webrtc__WEBPACK_IMPORTED_MODULE_9__["detachMediaStream"])(localElement);
        }
        Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["deRegister"])(_util_constants__WEBPACK_IMPORTED_MODULE_4__["SwEvent"].MediaError, null, this.id);
        this.peer = null;
        this.session.calls[this.id] = null;
        delete this.session.calls[this.id];
    }
}


/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/Call.js":
/*!************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/webrtc/Call.js ***!
  \************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Call; });
/* harmony import */ var _util_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/logger */ "./node_modules/@signalwire/js/dist/esm/common/src/util/logger.js");
/* harmony import */ var _BaseCall__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./BaseCall */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/BaseCall.js");
/* harmony import */ var _util_webrtc__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/webrtc */ "./node_modules/@signalwire/js/dist/esm/common/src/util/webrtc/index.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



class Call extends _BaseCall__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor() {
        super(...arguments);
        this._statsInterval = null;
    }
    hangup(params = {}, execute = true) {
        if (this.screenShare instanceof Call) {
            this.screenShare.hangup(params, execute);
        }
        super.hangup(params, execute);
    }
    startScreenShare(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const displayStream = yield Object(_util_webrtc__WEBPACK_IMPORTED_MODULE_2__["getDisplayMedia"])({ video: true });
            displayStream.getTracks().forEach(t => {
                t.addEventListener('ended', () => {
                    if (this.screenShare) {
                        this.screenShare.hangup();
                    }
                });
            });
            const { remoteCallerName, remoteCallerNumber, callerName, callerNumber } = this.options;
            const options = Object.assign({ screenShare: true, localStream: displayStream, destinationNumber: `${this.extension}-screen`, remoteCallerName, remoteCallerNumber: `${remoteCallerNumber}-screen`, callerName: `${callerName} (Screen)`, callerNumber: `${callerNumber} (Screen)` }, opts);
            this.screenShare = new Call(this.session, options);
            this.screenShare.invite();
            return this.screenShare;
        });
    }
    stopScreenShare() {
        if (this.screenShare instanceof Call) {
            this.screenShare.hangup();
        }
    }
    setAudioOutDevice(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.options.speakerId = deviceId;
            const { remoteElement, speakerId } = this.options;
            if (remoteElement && speakerId) {
                return Object(_util_webrtc__WEBPACK_IMPORTED_MODULE_2__["setMediaElementSinkId"])(remoteElement, speakerId);
            }
            return false;
        });
    }
    _finalize() {
        this._stats(false);
        super._finalize();
    }
    _stats(what = true) {
        if (what === false) {
            return clearInterval(this._statsInterval);
        }
        _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].setLevel(2);
        this._statsInterval = window.setInterval(() => __awaiter(this, void 0, void 0, function* () {
            const stats = yield this.peer.instance.getStats(null);
            let statsOutput = '';
            const invalidReport = ['certificate', 'codec', 'peer-connection', 'stream', 'local-candidate', 'remote-candidate'];
            const invalidStat = ['id', 'type', 'timestamp'];
            stats.forEach(report => {
                if (invalidReport.includes(report.type)) {
                    return;
                }
                statsOutput += `\n${report.type}\n`;
                Object.keys(report).forEach(statName => {
                    if (!invalidStat.includes(statName)) {
                        statsOutput += `\t${statName}: ${report[statName]}\n`;
                    }
                });
            });
            _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].info(statsOutput);
        }), 2000);
    }
}


/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/CantinaAuth.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/webrtc/CantinaAuth.js ***!
  \*******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _util_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/logger */ "./node_modules/@signalwire/js/dist/esm/common/src/util/logger.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

const FETCH_OPTIONS = {
    method: 'POST',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json'
    }
};
class CantinaAuth {
    constructor(params = {}) {
        this.params = params;
        this.baseUrl = 'https://cantina-backend.signalwire.com';
        this._fetch = (url, options) => {
            return fetch(url, options).then((response) => __awaiter(this, void 0, void 0, function* () {
                const payload = yield response.json();
                if (response.status >= 200 && response.status < 300) {
                    return payload;
                }
                else {
                    const errorMessage = `HTTP Request failed with status ${response.status}`;
                    const error = new Error(errorMessage);
                    error.payload = payload;
                    return Promise.reject(error);
                }
            }));
        };
        const { hostname = location.hostname } = params;
        this.hostname = hostname;
    }
    userLogin(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._fetch(`${this.baseUrl}/login/user`, Object.assign(Object.assign({}, FETCH_OPTIONS), { body: JSON.stringify({ username, password, hostname: this.hostname }) }));
            _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].info('userLogin response', response);
            return response;
        });
    }
    guestLogin(name, email, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._fetch(`${this.baseUrl}/login/guest`, Object.assign(Object.assign({}, FETCH_OPTIONS), { body: JSON.stringify({ name, email, token, hostname: this.hostname }) }));
            _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].info('guestLogin response', response);
            return response;
        });
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._fetch(`${this.baseUrl}/refresh`, Object.assign(Object.assign({}, FETCH_OPTIONS), { method: 'PUT', body: JSON.stringify({ hostname: this.hostname }) }));
            _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].info('refresh response', response);
            return response;
        });
    }
    checkInviteToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._fetch(`${this.baseUrl}/check-token`, Object.assign(Object.assign({}, FETCH_OPTIONS), { body: JSON.stringify({ token, hostname: this.hostname }) }));
            _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].info('checkInviteToken response', response);
            return response;
        });
    }
}
/* harmony default export */ __webpack_exports__["default"] = (CantinaAuth);


/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/LayoutHandler.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/webrtc/LayoutHandler.js ***!
  \*********************************************************************************/
/*! exports provided: MCULayoutEventHandler */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MCULayoutEventHandler", function() { return MCULayoutEventHandler; });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/constants.js");
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/constants */ "./node_modules/@signalwire/js/dist/esm/common/src/util/constants/index.js");
/* harmony import */ var _services_Handler__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../services/Handler */ "./node_modules/@signalwire/js/dist/esm/common/src/services/Handler.js");
/* harmony import */ var _util_helpers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/helpers */ "./node_modules/@signalwire/js/dist/esm/common/src/util/helpers.js");




const MCULayoutEventHandler = (session, eventData) => {
    const { contentType, canvasType, callID, canvasInfo = null, currentLayerIdx = -1 } = eventData;
    if (canvasInfo && canvasType !== 'mcu-personal-canvas') {
        delete canvasInfo.memberID;
    }
    const data = {
        type: _constants__WEBPACK_IMPORTED_MODULE_0__["NOTIFICATION_TYPE"].conferenceUpdate,
        call: session.calls[callID],
        canvasInfo: _clearCanvasInfo(canvasInfo),
        currentLayerIdx
    };
    switch (contentType) {
        case 'layer-info': {
            const notification = Object.assign({ action: _constants__WEBPACK_IMPORTED_MODULE_0__["ConferenceAction"].LayerInfo }, data);
            Object(_services_Handler__WEBPACK_IMPORTED_MODULE_2__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_1__["SwEvent"].Notification, notification, session.uuid);
            break;
        }
        case 'layout-info': {
            const notification = Object.assign({ action: _constants__WEBPACK_IMPORTED_MODULE_0__["ConferenceAction"].LayoutInfo }, data);
            Object(_services_Handler__WEBPACK_IMPORTED_MODULE_2__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_1__["SwEvent"].Notification, notification, session.uuid);
            break;
        }
    }
};
const _clearCanvasInfo = (canvasInfo) => {
    const tmp = JSON.stringify(canvasInfo)
        .replace(/memberID/g, 'participantId')
        .replace(/ID"/g, 'Id"')
        .replace(/POS"/g, 'Pos"');
    return Object(_util_helpers__WEBPACK_IMPORTED_MODULE_3__["safeParseJson"])(tmp);
};



/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/Peer.js":
/*!************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/webrtc/Peer.js ***!
  \************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Peer; });
/* harmony import */ var _util_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/logger */ "./node_modules/@signalwire/js/dist/esm/common/src/util/logger.js");
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/helpers.js");
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/constants */ "./node_modules/@signalwire/js/dist/esm/common/src/util/constants/index.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./constants */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/constants.js");
/* harmony import */ var _util_webrtc__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/webrtc */ "./node_modules/@signalwire/js/dist/esm/common/src/util/webrtc/index.js");
/* harmony import */ var _util_helpers__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../util/helpers */ "./node_modules/@signalwire/js/dist/esm/common/src/util/helpers.js");
/* harmony import */ var _services_Handler__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../services/Handler */ "./node_modules/@signalwire/js/dist/esm/common/src/services/Handler.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};







class Peer {
    constructor(type, options) {
        this.type = type;
        this.options = options;
        this.onSdpReadyTwice = null;
        this._negotiating = false;
        _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].info('New Peer with type:', this.type, 'Options:', this.options);
        this._constraints = { offerToReceiveAudio: true, offerToReceiveVideo: true };
        this._sdpReady = this._sdpReady.bind(this);
        this._init();
    }
    startNegotiation() {
        this._negotiating = true;
        if (this._isOffer()) {
            this._createOffer();
        }
        else {
            this._createAnswer();
        }
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.instance = Object(_util_webrtc__WEBPACK_IMPORTED_MODULE_4__["RTCPeerConnection"])(this._config());
            this.instance.onsignalingstatechange = event => {
                switch (this.instance.signalingState) {
                    case 'stable':
                        this._negotiating = false;
                        break;
                    case 'closed':
                        this.instance = null;
                        break;
                    default:
                        this._negotiating = true;
                }
            };
            this.instance.onnegotiationneeded = event => {
                if (this._negotiating) {
                    _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].debug('Skip twice onnegotiationneeded..');
                    return;
                }
                this.startNegotiation();
            };
            this.options.localStream = yield this._retrieveLocalStream()
                .catch(error => {
                Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_2__["SwEvent"].MediaError, error, this.options.id);
                return null;
            });
            const { localElement, localStream = null, screenShare = false } = this.options;
            if (Object(_util_webrtc__WEBPACK_IMPORTED_MODULE_4__["streamIsValid"])(localStream)) {
                if (typeof this.instance.addTrack === 'function') {
                    localStream.getTracks().forEach(t => this.instance.addTrack(t, localStream));
                }
                else {
                    this.instance.addStream(localStream);
                }
                if (screenShare !== true) {
                    Object(_util_webrtc__WEBPACK_IMPORTED_MODULE_4__["muteMediaElement"])(localElement);
                    Object(_util_webrtc__WEBPACK_IMPORTED_MODULE_4__["attachMediaStream"])(localElement, localStream);
                }
            }
            else if (localStream === null) {
                this.startNegotiation();
            }
        });
    }
    _createOffer() {
        if (!this._isOffer()) {
            return;
        }
        this.instance.createOffer(this._constraints)
            .then(this._setLocalDescription.bind(this))
            .then(this._sdpReady)
            .catch(error => _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].error('Peer _createOffer error:', error));
    }
    _createAnswer() {
        if (!this._isAnswer()) {
            return;
        }
        const { remoteSdp, useStereo } = this.options;
        const sdp = useStereo ? Object(_helpers__WEBPACK_IMPORTED_MODULE_1__["sdpStereoHack"])(remoteSdp) : remoteSdp;
        const sessionDescr = Object(_util_webrtc__WEBPACK_IMPORTED_MODULE_4__["sdpToJsonHack"])({ sdp, type: _constants__WEBPACK_IMPORTED_MODULE_3__["PeerType"].Offer });
        this.instance.setRemoteDescription(sessionDescr)
            .then(() => this.instance.createAnswer())
            .then(this._setLocalDescription.bind(this))
            .then(this._sdpReady)
            .catch(error => _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].error('Peer _createAnswer error:', error));
    }
    _setLocalDescription(sessionDescription) {
        const { useStereo, googleMaxBitrate, googleMinBitrate, googleStartBitrate } = this.options;
        if (useStereo) {
            sessionDescription.sdp = Object(_helpers__WEBPACK_IMPORTED_MODULE_1__["sdpStereoHack"])(sessionDescription.sdp);
        }
        if (googleMaxBitrate && googleMinBitrate && googleStartBitrate) {
            sessionDescription.sdp = Object(_helpers__WEBPACK_IMPORTED_MODULE_1__["sdpBitrateHack"])(sessionDescription.sdp, googleMaxBitrate, googleMinBitrate, googleStartBitrate);
        }
        return this.instance.setLocalDescription(sessionDescription);
    }
    _sdpReady() {
        if (Object(_util_helpers__WEBPACK_IMPORTED_MODULE_5__["isFunction"])(this.onSdpReadyTwice)) {
            this.onSdpReadyTwice(this.instance.localDescription);
        }
    }
    _retrieveLocalStream() {
        return __awaiter(this, void 0, void 0, function* () {
            if (Object(_util_webrtc__WEBPACK_IMPORTED_MODULE_4__["streamIsValid"])(this.options.localStream)) {
                return this.options.localStream;
            }
            const constraints = yield Object(_helpers__WEBPACK_IMPORTED_MODULE_1__["getMediaConstraints"])(this.options);
            return Object(_helpers__WEBPACK_IMPORTED_MODULE_1__["getUserMedia"])(constraints);
        });
    }
    _isOffer() {
        return this.type === _constants__WEBPACK_IMPORTED_MODULE_3__["PeerType"].Offer;
    }
    _isAnswer() {
        return this.type === _constants__WEBPACK_IMPORTED_MODULE_3__["PeerType"].Answer;
    }
    _config() {
        const { iceServers = [] } = this.options;
        const config = { sdpSemantics: 'plan-b', bundlePolicy: 'max-compat', iceServers };
        _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].info('RTC config', config);
        return config;
    }
}


/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/VertoHandler.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/webrtc/VertoHandler.js ***!
  \********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _util_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/logger */ "./node_modules/@signalwire/js/dist/esm/common/src/util/logger.js");
/* harmony import */ var _Call__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Call */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/Call.js");
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/helpers.js");
/* harmony import */ var _messages_Verto__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../messages/Verto */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/Verto.js");
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/constants */ "./node_modules/@signalwire/js/dist/esm/common/src/util/constants/index.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./constants */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/constants.js");
/* harmony import */ var _services_Handler__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../services/Handler */ "./node_modules/@signalwire/js/dist/esm/common/src/services/Handler.js");
/* harmony import */ var _LayoutHandler__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./LayoutHandler */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/LayoutHandler.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};









class VertoHandler {
    constructor(session) {
        this.session = session;
    }
    _ack(id, method) {
        const msg = new _messages_Verto__WEBPACK_IMPORTED_MODULE_3__["Result"](id, method);
        if (this.nodeId) {
            msg.targetNodeId = this.nodeId;
        }
        this.session.execute(msg);
    }
    handleMessage(msg) {
        const { session } = this;
        const { id, method, params } = msg;
        const { callID, eventChannel, eventType } = params;
        const attach = method === _constants__WEBPACK_IMPORTED_MODULE_5__["VertoMethod"].Attach;
        if (eventType === 'channelPvtData') {
            return this._handlePvtEvent(params.pvtData);
        }
        if (callID && session.calls.hasOwnProperty(callID)) {
            if (attach) {
                session.calls[callID].hangup({}, false);
            }
            else {
                session.calls[callID].handleMessage(msg);
                this._ack(id, method);
                return;
            }
        }
        const _buildCall = () => {
            const call = new _Call__WEBPACK_IMPORTED_MODULE_1__["default"](session, {
                id: callID,
                remoteSdp: params.sdp,
                destinationNumber: params.callee_id_number,
                remoteCallerName: params.caller_id_name,
                remoteCallerNumber: params.caller_id_number,
                callerName: params.callee_id_name,
                callerNumber: params.callee_id_number,
                attach
            });
            call.nodeId = this.nodeId;
            return call;
        };
        switch (method) {
            case _constants__WEBPACK_IMPORTED_MODULE_5__["VertoMethod"].Punt:
                session.disconnect();
                break;
            case _constants__WEBPACK_IMPORTED_MODULE_5__["VertoMethod"].Invite: {
                const call = _buildCall();
                call.setState(_constants__WEBPACK_IMPORTED_MODULE_5__["State"].Ringing);
                this._ack(id, method);
                break;
            }
            case _constants__WEBPACK_IMPORTED_MODULE_5__["VertoMethod"].Attach: {
                const call = _buildCall();
                if (this.session.autoRecoverCalls) {
                    call.answer();
                }
                else {
                    call.setState(_constants__WEBPACK_IMPORTED_MODULE_5__["State"].Recovering);
                }
                call.handleMessage(msg);
                break;
            }
            case _constants__WEBPACK_IMPORTED_MODULE_5__["VertoMethod"].Event:
            case 'webrtc.event':
                if (!eventChannel) {
                    _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].error('Verto received an unknown event:', params);
                    return;
                }
                const protocol = session.relayProtocol;
                const firstValue = eventChannel.split('.')[0];
                if (session._existsSubscription(protocol, eventChannel)) {
                    Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["trigger"])(protocol, params, eventChannel);
                }
                else if (eventChannel === session.sessionid) {
                    this._handleSessionEvent(params.eventData);
                }
                else if (session._existsSubscription(protocol, firstValue)) {
                    Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["trigger"])(protocol, params, firstValue);
                }
                else if (session.calls.hasOwnProperty(eventChannel)) {
                    session.calls[eventChannel].handleMessage(msg);
                }
                else {
                    Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_4__["SwEvent"].Notification, params, session.uuid);
                }
                break;
            case _constants__WEBPACK_IMPORTED_MODULE_5__["VertoMethod"].Info:
                params.type = _constants__WEBPACK_IMPORTED_MODULE_5__["NOTIFICATION_TYPE"].generic;
                Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_4__["SwEvent"].Notification, params, session.uuid);
                break;
            case _constants__WEBPACK_IMPORTED_MODULE_5__["VertoMethod"].ClientReady:
                params.type = _constants__WEBPACK_IMPORTED_MODULE_5__["NOTIFICATION_TYPE"].vertoClientReady;
                Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_4__["SwEvent"].Notification, params, session.uuid);
                break;
            default:
                _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].warn('Verto message unknown method:', msg);
        }
    }
    _retrieveCallId(packet, laChannel) {
        const callIds = Object.keys(this.session.calls);
        if (packet.action === 'bootObj') {
            const me = packet.data.find((pr) => callIds.includes(pr[0]));
            if (me instanceof Array) {
                return me[0];
            }
        }
        else {
            return callIds.find((id) => this.session.calls[id].channels.includes(laChannel));
        }
    }
    _handlePvtEvent(pvtData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { session } = this;
            const protocol = session.relayProtocol;
            const { action, laChannel, laName, chatChannel, infoChannel, modChannel, conferenceMemberID, role, callID } = pvtData;
            switch (action) {
                case 'conference-liveArray-join': {
                    const _liveArrayBootstrap = () => {
                        session.vertoBroadcast({ nodeId: this.nodeId, channel: laChannel, data: { liveArray: { command: 'bootstrap', context: laChannel, name: laName } } });
                    };
                    const tmp = {
                        nodeId: this.nodeId,
                        channels: [laChannel],
                        handler: ({ data: packet }) => {
                            const id = callID || this._retrieveCallId(packet, laChannel);
                            if (id && session.calls.hasOwnProperty(id)) {
                                const call = session.calls[id];
                                call._addChannel(laChannel);
                                call.extension = laName;
                                call.handleConferenceUpdate(packet, pvtData)
                                    .then(error => {
                                    if (error === 'INVALID_PACKET') {
                                        _liveArrayBootstrap();
                                    }
                                });
                            }
                        }
                    };
                    const result = yield session.vertoSubscribe(tmp)
                        .catch(error => {
                        _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].error('liveArray subscription error:', error);
                    });
                    if (Object(_helpers__WEBPACK_IMPORTED_MODULE_2__["checkSubscribeResponse"])(result, laChannel)) {
                        _liveArrayBootstrap();
                    }
                    break;
                }
                case 'conference-liveArray-part': {
                    let call = null;
                    if (laChannel && session._existsSubscription(protocol, laChannel)) {
                        const { callId = null } = session.subscriptions[protocol][laChannel];
                        call = session.calls[callId] || null;
                        if (callId !== null) {
                            const notification = { type: _constants__WEBPACK_IMPORTED_MODULE_5__["NOTIFICATION_TYPE"].conferenceUpdate, action: _constants__WEBPACK_IMPORTED_MODULE_5__["ConferenceAction"].Leave, conferenceName: laName, participantId: Number(conferenceMemberID), role };
                            if (!Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_4__["SwEvent"].Notification, notification, callId, false)) {
                                Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_4__["SwEvent"].Notification, notification, session.uuid);
                            }
                            if (call === null) {
                                Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["deRegister"])(_util_constants__WEBPACK_IMPORTED_MODULE_4__["SwEvent"].Notification, null, callId);
                            }
                        }
                    }
                    const channels = [laChannel, chatChannel, infoChannel, modChannel];
                    session.vertoUnsubscribe({ nodeId: this.nodeId, channels })
                        .then(({ unsubscribedChannels = [] }) => {
                        if (call) {
                            call.channels = call.channels.filter(c => !unsubscribedChannels.includes(c));
                        }
                    })
                        .catch(error => {
                        _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].error('liveArray unsubscribe error:', error);
                    });
                    break;
                }
            }
        });
    }
    _handleSessionEvent(eventData) {
        switch (eventData.contentType) {
            case 'layout-info':
            case 'layer-info':
                Object(_LayoutHandler__WEBPACK_IMPORTED_MODULE_7__["MCULayoutEventHandler"])(this.session, eventData);
                break;
            case 'logo-info': {
                const notification = { type: _constants__WEBPACK_IMPORTED_MODULE_5__["NOTIFICATION_TYPE"].conferenceUpdate, action: _constants__WEBPACK_IMPORTED_MODULE_5__["ConferenceAction"].LogoInfo, logo: eventData.logoURL };
                Object(_services_Handler__WEBPACK_IMPORTED_MODULE_6__["trigger"])(_util_constants__WEBPACK_IMPORTED_MODULE_4__["SwEvent"].Notification, notification, this.session.uuid);
                break;
            }
        }
    }
}
/* harmony default export */ __webpack_exports__["default"] = (VertoHandler);


/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/constants.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/webrtc/constants.js ***!
  \*****************************************************************************/
/*! exports provided: PeerType, Direction, VertoMethod, NOTIFICATION_TYPE, DEFAULT_CALL_OPTIONS, State, Role, ConferenceAction, DeviceType */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PeerType", function() { return PeerType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Direction", function() { return Direction; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VertoMethod", function() { return VertoMethod; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NOTIFICATION_TYPE", function() { return NOTIFICATION_TYPE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DEFAULT_CALL_OPTIONS", function() { return DEFAULT_CALL_OPTIONS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "State", function() { return State; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Role", function() { return Role; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConferenceAction", function() { return ConferenceAction; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DeviceType", function() { return DeviceType; });
var PeerType;
(function (PeerType) {
    PeerType["Offer"] = "offer";
    PeerType["Answer"] = "answer";
})(PeerType || (PeerType = {}));
var Direction;
(function (Direction) {
    Direction["Inbound"] = "inbound";
    Direction["Outbound"] = "outbound";
})(Direction || (Direction = {}));
var VertoMethod;
(function (VertoMethod) {
    VertoMethod["Invite"] = "verto.invite";
    VertoMethod["Attach"] = "verto.attach";
    VertoMethod["Answer"] = "verto.answer";
    VertoMethod["Info"] = "verto.info";
    VertoMethod["Display"] = "verto.display";
    VertoMethod["Media"] = "verto.media";
    VertoMethod["Event"] = "verto.event";
    VertoMethod["Bye"] = "verto.bye";
    VertoMethod["Punt"] = "verto.punt";
    VertoMethod["Broadcast"] = "verto.broadcast";
    VertoMethod["Subscribe"] = "verto.subscribe";
    VertoMethod["Unsubscribe"] = "verto.unsubscribe";
    VertoMethod["ClientReady"] = "verto.clientReady";
    VertoMethod["Modify"] = "verto.modify";
})(VertoMethod || (VertoMethod = {}));
const NOTIFICATION_TYPE = {
    generic: 'event',
    [VertoMethod.Display]: 'participantData',
    [VertoMethod.Attach]: 'participantData',
    conferenceUpdate: 'conferenceUpdate',
    callUpdate: 'callUpdate',
    vertoClientReady: 'vertoClientReady',
    userMediaError: 'userMediaError',
    refreshToken: 'refreshToken',
};
const DEFAULT_CALL_OPTIONS = {
    destinationNumber: '',
    remoteCallerName: 'Outbound Call',
    remoteCallerNumber: '',
    callerName: '',
    callerNumber: '',
    audio: true,
    video: false,
    useStereo: false,
    attach: false,
    screenShare: false,
    userVariables: {},
};
var State;
(function (State) {
    State[State["New"] = 0] = "New";
    State[State["Requesting"] = 1] = "Requesting";
    State[State["Trying"] = 2] = "Trying";
    State[State["Recovering"] = 3] = "Recovering";
    State[State["Ringing"] = 4] = "Ringing";
    State[State["Answering"] = 5] = "Answering";
    State[State["Early"] = 6] = "Early";
    State[State["Active"] = 7] = "Active";
    State[State["Held"] = 8] = "Held";
    State[State["Hangup"] = 9] = "Hangup";
    State[State["Destroy"] = 10] = "Destroy";
    State[State["Purge"] = 11] = "Purge";
})(State || (State = {}));
var Role;
(function (Role) {
    Role["Participant"] = "participant";
    Role["Moderator"] = "moderator";
})(Role || (Role = {}));
var ConferenceAction;
(function (ConferenceAction) {
    ConferenceAction["Join"] = "join";
    ConferenceAction["Leave"] = "leave";
    ConferenceAction["Bootstrap"] = "bootstrap";
    ConferenceAction["Add"] = "add";
    ConferenceAction["Modify"] = "modify";
    ConferenceAction["Delete"] = "delete";
    ConferenceAction["Clear"] = "clear";
    ConferenceAction["ChatMessage"] = "chatMessage";
    ConferenceAction["LayerInfo"] = "layerInfo";
    ConferenceAction["LogoInfo"] = "logoInfo";
    ConferenceAction["LayoutInfo"] = "layoutInfo";
    ConferenceAction["LayoutList"] = "layoutList";
    ConferenceAction["ModCmdResponse"] = "modCommandResponse";
})(ConferenceAction || (ConferenceAction = {}));
var DeviceType;
(function (DeviceType) {
    DeviceType["Video"] = "videoinput";
    DeviceType["AudioIn"] = "audioinput";
    DeviceType["AudioOut"] = "audiooutput";
})(DeviceType || (DeviceType = {}));


/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/helpers.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/common/src/webrtc/helpers.js ***!
  \***************************************************************************/
/*! exports provided: getUserMedia, getDevices, scanResolutions, getMediaConstraints, assureDeviceId, removeUnsupportedConstraints, checkDeviceIdConstraints, sdpStereoHack, sdpMediaOrderHack, sdpBitrateHack, checkSubscribeResponse, destructSubscribeResponse, enableAudioTracks, disableAudioTracks, toggleAudioTracks, enableVideoTracks, disableVideoTracks, toggleVideoTracks */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getUserMedia", function() { return getUserMedia; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDevices", function() { return getDevices; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scanResolutions", function() { return scanResolutions; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getMediaConstraints", function() { return getMediaConstraints; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "assureDeviceId", function() { return assureDeviceId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeUnsupportedConstraints", function() { return removeUnsupportedConstraints; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkDeviceIdConstraints", function() { return checkDeviceIdConstraints; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sdpStereoHack", function() { return sdpStereoHack; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sdpMediaOrderHack", function() { return sdpMediaOrderHack; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sdpBitrateHack", function() { return sdpBitrateHack; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkSubscribeResponse", function() { return checkSubscribeResponse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "destructSubscribeResponse", function() { return destructSubscribeResponse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enableAudioTracks", function() { return enableAudioTracks; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "disableAudioTracks", function() { return disableAudioTracks; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toggleAudioTracks", function() { return toggleAudioTracks; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enableVideoTracks", function() { return enableVideoTracks; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "disableVideoTracks", function() { return disableVideoTracks; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toggleVideoTracks", function() { return toggleVideoTracks; });
/* harmony import */ var _util_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/logger */ "./node_modules/@signalwire/js/dist/esm/common/src/util/logger.js");
/* harmony import */ var _util_webrtc__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/webrtc */ "./node_modules/@signalwire/js/dist/esm/common/src/util/webrtc/index.js");
/* harmony import */ var _util_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/helpers */ "./node_modules/@signalwire/js/dist/esm/common/src/util/helpers.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./constants */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/constants.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};




const getUserMedia = (constraints) => __awaiter(void 0, void 0, void 0, function* () {
    _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].info('RTCService.getUserMedia', constraints);
    const { audio, video } = constraints;
    if (!audio && !video) {
        return null;
    }
    try {
        return yield _util_webrtc__WEBPACK_IMPORTED_MODULE_1__["getUserMedia"](constraints);
    }
    catch (error) {
        _util_logger__WEBPACK_IMPORTED_MODULE_0__["default"].error('getUserMedia error: ', error);
        throw error;
    }
});
const _constraintsByKind = (kind = null) => {
    return {
        audio: !kind || kind === _constants__WEBPACK_IMPORTED_MODULE_3__["DeviceType"].AudioIn,
        video: !kind || kind === _constants__WEBPACK_IMPORTED_MODULE_3__["DeviceType"].Video
    };
};
const getDevices = (kind = null, fullList = false) => __awaiter(void 0, void 0, void 0, function* () {
    let devices = yield _util_webrtc__WEBPACK_IMPORTED_MODULE_1__["enumerateDevices"]().catch(error => []);
    if (kind) {
        devices = devices.filter((d) => d.kind === kind);
    }
    const valid = devices.length && devices.every((d) => (d.deviceId && d.label));
    if (!valid) {
        const stream = yield _util_webrtc__WEBPACK_IMPORTED_MODULE_1__["getUserMedia"](_constraintsByKind(kind));
        _util_webrtc__WEBPACK_IMPORTED_MODULE_1__["stopStream"](stream);
        return getDevices(kind);
    }
    if (fullList === true) {
        return devices;
    }
    const found = [];
    devices = devices.filter(({ kind, groupId }) => {
        if (!groupId) {
            return true;
        }
        const key = `${kind}-${groupId}`;
        if (!found.includes(key)) {
            found.push(key);
            return true;
        }
        return false;
    });
    return devices;
});
const resolutionList = [[320, 240], [640, 360], [640, 480], [1280, 720], [1920, 1080]];
const scanResolutions = (deviceId) => __awaiter(void 0, void 0, void 0, function* () {
    const supported = [];
    const stream = yield getUserMedia({ video: { deviceId: { exact: deviceId } } });
    const videoTrack = stream.getVideoTracks()[0];
    for (let i = 0; i < resolutionList.length; i++) {
        const [width, height] = resolutionList[i];
        const success = yield videoTrack.applyConstraints({ width: { exact: width }, height: { exact: height } })
            .then(() => true)
            .catch(() => false);
        if (success) {
            supported.push({ resolution: `${width}x${height}`, width, height });
        }
    }
    _util_webrtc__WEBPACK_IMPORTED_MODULE_1__["stopStream"](stream);
    return supported;
});
const getMediaConstraints = (options) => __awaiter(void 0, void 0, void 0, function* () {
    let { audio = true, micId } = options;
    const { micLabel = '' } = options;
    if (micId) {
        micId = yield assureDeviceId(micId, micLabel, _constants__WEBPACK_IMPORTED_MODULE_3__["DeviceType"].AudioIn).catch(error => null);
        if (micId) {
            if (typeof audio === 'boolean') {
                audio = {};
            }
            audio.deviceId = { exact: micId };
        }
    }
    let { video = false, camId } = options;
    const { camLabel = '' } = options;
    if (camId) {
        camId = yield assureDeviceId(camId, camLabel, _constants__WEBPACK_IMPORTED_MODULE_3__["DeviceType"].Video).catch(error => null);
        if (camId) {
            if (typeof video === 'boolean') {
                video = {};
            }
            video.deviceId = { exact: camId };
        }
    }
    return { audio, video };
});
const assureDeviceId = (id, label, kind) => __awaiter(void 0, void 0, void 0, function* () {
    const devices = yield getDevices(kind, true);
    for (let i = 0; i < devices.length; i++) {
        const { deviceId, label: deviceLabel } = devices[i];
        if (id === deviceId || label === deviceLabel) {
            return deviceId;
        }
    }
    return null;
});
const removeUnsupportedConstraints = (constraints) => {
    const supported = _util_webrtc__WEBPACK_IMPORTED_MODULE_1__["getSupportedConstraints"]();
    Object.keys(constraints).map(key => {
        if (!supported.hasOwnProperty(key) || constraints[key] === null || constraints[key] === undefined) {
            delete constraints[key];
        }
    });
};
const checkDeviceIdConstraints = (id, label, kind, constraints) => __awaiter(void 0, void 0, void 0, function* () {
    const { deviceId } = constraints;
    if (!Object(_util_helpers__WEBPACK_IMPORTED_MODULE_2__["isDefined"])(deviceId) && (id || label)) {
        const deviceId = yield assureDeviceId(id, label, kind).catch(error => null);
        if (deviceId) {
            constraints.deviceId = { exact: deviceId };
        }
    }
    return constraints;
});
const sdpStereoHack = (sdp) => {
    const endOfLine = '\r\n';
    const sdpLines = sdp.split(endOfLine);
    const opusIndex = sdpLines.findIndex(s => /^a=rtpmap/.test(s) && /opus\/48000/.test(s));
    if (opusIndex < 0) {
        return sdp;
    }
    const getCodecPayloadType = (line) => {
        const pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
        const result = line.match(pattern);
        return result && result.length == 2 ? result[1] : null;
    };
    const opusPayload = getCodecPayloadType(sdpLines[opusIndex]);
    const pattern = new RegExp(`a=fmtp:${opusPayload}`);
    const fmtpLineIndex = sdpLines.findIndex(s => pattern.test(s));
    if (fmtpLineIndex >= 0) {
        if (!/stereo=1;/.test(sdpLines[fmtpLineIndex])) {
            sdpLines[fmtpLineIndex] += '; stereo=1; sprop-stereo=1';
        }
    }
    else {
        sdpLines[opusIndex] += `${endOfLine}a=fmtp:${opusPayload} stereo=1; sprop-stereo=1`;
    }
    return sdpLines.join(endOfLine);
};
const _isAudioLine = (line) => /^m=audio/.test(line);
const _isVideoLine = (line) => /^m=video/.test(line);
const sdpMediaOrderHack = (answer, localOffer) => {
    const endOfLine = '\r\n';
    const offerLines = localOffer.split(endOfLine);
    const offerAudioIndex = offerLines.findIndex(_isAudioLine);
    const offerVideoIndex = offerLines.findIndex(_isVideoLine);
    if (offerAudioIndex < offerVideoIndex) {
        return answer;
    }
    const answerLines = answer.split(endOfLine);
    const answerAudioIndex = answerLines.findIndex(_isAudioLine);
    const answerVideoIndex = answerLines.findIndex(_isVideoLine);
    const audioLines = answerLines.slice(answerAudioIndex, answerVideoIndex);
    const videoLines = answerLines.slice(answerVideoIndex, (answerLines.length - 1));
    const beginLines = answerLines.slice(0, answerAudioIndex);
    return [...beginLines, ...videoLines, ...audioLines, ''].join(endOfLine);
};
const checkSubscribeResponse = (response, channel) => {
    if (!response) {
        return false;
    }
    const { subscribed, alreadySubscribed } = destructSubscribeResponse(response);
    return subscribed.includes(channel) || alreadySubscribed.includes(channel);
};
const destructSubscribeResponse = (response) => {
    const tmp = {
        subscribed: [],
        alreadySubscribed: [],
        unauthorized: [],
        unsubscribed: [],
        notSubscribed: []
    };
    Object.keys(tmp).forEach(k => { tmp[k] = response[`${k}Channels`] || []; });
    return tmp;
};
const enableAudioTracks = (stream) => {
    _updateMediaStreamTracks(stream, 'audio', true);
};
const disableAudioTracks = (stream) => {
    _updateMediaStreamTracks(stream, 'audio', false);
};
const toggleAudioTracks = (stream) => {
    _updateMediaStreamTracks(stream, 'audio', null);
};
const enableVideoTracks = (stream) => {
    _updateMediaStreamTracks(stream, 'video', true);
};
const disableVideoTracks = (stream) => {
    _updateMediaStreamTracks(stream, 'video', false);
};
const toggleVideoTracks = (stream) => {
    _updateMediaStreamTracks(stream, 'video', null);
};
const _updateMediaStreamTracks = (stream, kind = null, enabled = null) => {
    if (!_util_webrtc__WEBPACK_IMPORTED_MODULE_1__["streamIsValid"](stream)) {
        return null;
    }
    let tracks = [];
    switch (kind) {
        case 'audio':
            tracks = stream.getAudioTracks();
            break;
        case 'video':
            tracks = stream.getVideoTracks();
            break;
        default:
            tracks = stream.getTracks();
            break;
    }
    tracks.forEach((track) => {
        switch (enabled) {
            case 'on':
            case true:
                track.enabled = true;
                break;
            case 'off':
            case false:
                track.enabled = false;
                break;
            default:
                track.enabled = !track.enabled;
                break;
        }
    });
};
const sdpBitrateHack = (sdp, max, min, start) => {
    const endOfLine = '\r\n';
    const lines = sdp.split(endOfLine);
    lines.forEach((line, i) => {
        if (/^a=fmtp:\d*/.test(line)) {
            lines[i] += `;x-google-max-bitrate=${max};x-google-min-bitrate=${min};x-google-start-bitrate=${start}`;
        }
        else if (/^a=mid:(1|video)/.test(line)) {
            lines[i] += `\r\nb=AS:${max}`;
        }
    });
    return lines.join(endOfLine);
};



/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/js/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/js/index.js ***!
  \**********************************************************/
/*! exports provided: VERSION, Relay, Verto, CantinaAuth */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VERSION", function() { return VERSION; });
/* harmony import */ var _src_SignalWire__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/SignalWire */ "./node_modules/@signalwire/js/dist/esm/js/src/SignalWire.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Relay", function() { return _src_SignalWire__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _src_Verto__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/Verto */ "./node_modules/@signalwire/js/dist/esm/js/src/Verto.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Verto", function() { return _src_Verto__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _common_src_messages_blade_Connect__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../common/src/messages/blade/Connect */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/blade/Connect.js");
/* harmony import */ var _common_src_webrtc_CantinaAuth__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../common/src/webrtc/CantinaAuth */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/CantinaAuth.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CantinaAuth", function() { return _common_src_webrtc_CantinaAuth__WEBPACK_IMPORTED_MODULE_3__["default"]; });





const VERSION = '1.2.7';
Object(_common_src_messages_blade_Connect__WEBPACK_IMPORTED_MODULE_2__["setAgentName"])(`JavaScript SDK/${VERSION}`);



/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/js/src/SignalWire.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/js/src/SignalWire.js ***!
  \*******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return SignalWire; });
/* harmony import */ var _common_src_BrowserSession__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../common/src/BrowserSession */ "./node_modules/@signalwire/js/dist/esm/common/src/BrowserSession.js");
/* harmony import */ var _common_src_messages_Blade__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../common/src/messages/Blade */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/Blade.js");
/* harmony import */ var _common_src_messages_verto_BaseRequest__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../common/src/messages/verto/BaseRequest */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/verto/BaseRequest.js");
/* harmony import */ var _common_src_webrtc_Call__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../common/src/webrtc/Call */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/Call.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};




class SignalWire extends _common_src_BrowserSession__WEBPACK_IMPORTED_MODULE_0__["default"] {
    execute(message) {
        let msg = message;
        if (message instanceof _common_src_messages_verto_BaseRequest__WEBPACK_IMPORTED_MODULE_2__["default"]) {
            const params = { message: message.request };
            if (message.targetNodeId) {
                params.node_id = message.targetNodeId;
            }
            msg = new _common_src_messages_Blade__WEBPACK_IMPORTED_MODULE_1__["Execute"]({ protocol: this.relayProtocol, method: 'message', params });
        }
        return super.execute(msg);
    }
    newCall(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { destinationNumber = null } = options;
            if (!destinationNumber) {
                throw new TypeError('destinationNumber is required');
            }
            const call = new _common_src_webrtc_Call__WEBPACK_IMPORTED_MODULE_3__["default"](this, options);
            call.invite();
            return call;
        });
    }
}


/***/ }),

/***/ "./node_modules/@signalwire/js/dist/esm/js/src/Verto.js":
/*!**************************************************************!*\
  !*** ./node_modules/@signalwire/js/dist/esm/js/src/Verto.js ***!
  \**************************************************************/
/*! exports provided: VERTO_PROTOCOL, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VERTO_PROTOCOL", function() { return VERTO_PROTOCOL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Verto; });
/* harmony import */ var _common_src_BrowserSession__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../common/src/BrowserSession */ "./node_modules/@signalwire/js/dist/esm/common/src/BrowserSession.js");
/* harmony import */ var _common_src_messages_Verto__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../common/src/messages/Verto */ "./node_modules/@signalwire/js/dist/esm/common/src/messages/Verto.js");
/* harmony import */ var _common_src_webrtc_Call__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../common/src/webrtc/Call */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/Call.js");
/* harmony import */ var _common_src_util_constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../common/src/util/constants */ "./node_modules/@signalwire/js/dist/esm/common/src/util/constants/index.js");
/* harmony import */ var _common_src_services_Handler__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../common/src/services/Handler */ "./node_modules/@signalwire/js/dist/esm/common/src/services/Handler.js");
/* harmony import */ var _common_src_util_storage___WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../common/src/util/storage/ */ "./node_modules/@signalwire/js/dist/esm/common/src/util/storage/index.js");
/* harmony import */ var _common_src_webrtc_VertoHandler__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../common/src/webrtc/VertoHandler */ "./node_modules/@signalwire/js/dist/esm/common/src/webrtc/VertoHandler.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};







const VERTO_PROTOCOL = 'verto-protocol';
class Verto extends _common_src_BrowserSession__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor() {
        super(...arguments);
        this.relayProtocol = VERTO_PROTOCOL;
    }
    validateOptions() {
        const { host, login, passwd, password } = this.options;
        return Boolean(host) && Boolean(login && (passwd || password));
    }
    newCall(options) {
        const { destinationNumber = null } = options;
        if (!destinationNumber) {
            throw new Error('Verto.newCall() error: destinationNumber is required.');
        }
        const call = new _common_src_webrtc_Call__WEBPACK_IMPORTED_MODULE_2__["default"](this, options);
        call.invite();
        return call;
    }
    broadcast(params) {
        return this.vertoBroadcast(params);
    }
    subscribe(params) {
        return this.vertoSubscribe(params);
    }
    unsubscribe(params) {
        return this.vertoUnsubscribe(params);
    }
    _onSocketOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            this._idle = false;
            const { login, password, passwd, userVariables } = this.options;
            if (this.sessionid) {
                const sessidLogin = new _common_src_messages_Verto__WEBPACK_IMPORTED_MODULE_1__["Login"](undefined, undefined, this.sessionid, undefined);
                yield this.execute(sessidLogin).catch(console.error);
            }
            const msg = new _common_src_messages_Verto__WEBPACK_IMPORTED_MODULE_1__["Login"](login, (password || passwd), this.sessionid, userVariables);
            const response = yield this.execute(msg).catch(this._handleLoginError);
            if (response) {
                this._autoReconnect = true;
                this.sessionid = response.sessid;
                _common_src_util_storage___WEBPACK_IMPORTED_MODULE_5__["localStorage"].setItem(_common_src_util_constants__WEBPACK_IMPORTED_MODULE_3__["SESSION_ID"], this.sessionid);
                Object(_common_src_services_Handler__WEBPACK_IMPORTED_MODULE_4__["trigger"])(_common_src_util_constants__WEBPACK_IMPORTED_MODULE_3__["SwEvent"].Ready, this, this.uuid);
            }
        });
    }
    _onSocketMessage(msg) {
        const handler = new _common_src_webrtc_VertoHandler__WEBPACK_IMPORTED_MODULE_6__["default"](this);
        handler.handleMessage(msg);
    }
}


/***/ }),

/***/ "./node_modules/loglevel/lib/loglevel.js":
/*!***********************************************!*\
  !*** ./node_modules/loglevel/lib/loglevel.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/
(function (root, definition) {
    "use strict";
    if (true) {
        !(__WEBPACK_AMD_DEFINE_FACTORY__ = (definition),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function () {
    "use strict";

    // Slightly dubious tricks to cut down minimized file size
    var noop = function() {};
    var undefinedType = "undefined";
    var isIE = (typeof window !== undefinedType) && (typeof window.navigator !== undefinedType) && (
        /Trident\/|MSIE /.test(window.navigator.userAgent)
    );

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    // Cross-browser bind equivalent that works at least back to IE6
    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj);
        } else {
            try {
                return Function.prototype.bind.call(method, obj);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function() {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    // Trace() doesn't print the message in IE, so for that case we need to wrap it
    function traceForIE() {
        if (console.log) {
            if (console.log.apply) {
                console.log.apply(console, arguments);
            } else {
                // In old IE, native console methods themselves don't have apply().
                Function.prototype.apply.apply(console.log, [console, arguments]);
            }
        }
        if (console.trace) console.trace();
    }

    // Build the best logging method possible for this env
    // Wherever possible we want to bind, not wrap, to preserve stack traces
    function realMethod(methodName) {
        if (methodName === 'debug') {
            methodName = 'log';
        }

        if (typeof console === undefinedType) {
            return false; // No method possible, for now - fixed later by enableLoggingWhenConsoleArrives
        } else if (methodName === 'trace' && isIE) {
            return traceForIE;
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    // These private functions always need `this` to be set properly

    function replaceLoggingMethods(level, loggerName) {
        /*jshint validthis:true */
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this[methodName] = (i < level) ?
                noop :
                this.methodFactory(methodName, level, loggerName);
        }

        // Define log.log as an alias for log.debug
        this.log = this.debug;
    }

    // In old IE versions, the console isn't present until you first open it.
    // We build realMethod() replacements here that regenerate logging methods
    function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
        return function () {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods.call(this, level, loggerName);
                this[methodName].apply(this, arguments);
            }
        };
    }

    // By default, we use closely bound real methods wherever possible, and
    // otherwise we wait for a console to appear, and then try again.
    function defaultMethodFactory(methodName, level, loggerName) {
        /*jshint validthis:true */
        return realMethod(methodName) ||
               enableLoggingWhenConsoleArrives.apply(this, arguments);
    }

    function Logger(name, defaultLevel, factory) {
      var self = this;
      var currentLevel;
      var storageKey = "loglevel";
      if (name) {
        storageKey += ":" + name;
      }

      function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

          if (typeof window === undefinedType) return;

          // Use localStorage if available
          try {
              window.localStorage[storageKey] = levelName;
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {}
      }

      function getPersistedLevel() {
          var storedLevel;

          if (typeof window === undefinedType) return;

          try {
              storedLevel = window.localStorage[storageKey];
          } catch (ignore) {}

          // Fallback to cookies if local storage gives us nothing
          if (typeof storedLevel === undefinedType) {
              try {
                  var cookie = window.document.cookie;
                  var location = cookie.indexOf(
                      encodeURIComponent(storageKey) + "=");
                  if (location !== -1) {
                      storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                  }
              } catch (ignore) {}
          }

          // If the stored level is not valid, treat it as if nothing was stored.
          if (self.levels[storedLevel] === undefined) {
              storedLevel = undefined;
          }

          return storedLevel;
      }

      /*
       *
       * Public logger API - see https://github.com/pimterry/loglevel for details
       *
       */

      self.name = name;

      self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
          "ERROR": 4, "SILENT": 5};

      self.methodFactory = factory || defaultMethodFactory;

      self.getLevel = function () {
          return currentLevel;
      };

      self.setLevel = function (level, persist) {
          if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
              level = self.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
              currentLevel = level;
              if (persist !== false) {  // defaults to true
                  persistLevelIfPossible(level);
              }
              replaceLoggingMethods.call(self, level, name);
              if (typeof console === undefinedType && level < self.levels.SILENT) {
                  return "No console available for logging";
              }
          } else {
              throw "log.setLevel() called with invalid level: " + level;
          }
      };

      self.setDefaultLevel = function (level) {
          if (!getPersistedLevel()) {
              self.setLevel(level, false);
          }
      };

      self.enableAll = function(persist) {
          self.setLevel(self.levels.TRACE, persist);
      };

      self.disableAll = function(persist) {
          self.setLevel(self.levels.SILENT, persist);
      };

      // Initialize with the right level
      var initialLevel = getPersistedLevel();
      if (initialLevel == null) {
          initialLevel = defaultLevel == null ? "WARN" : defaultLevel;
      }
      self.setLevel(initialLevel, false);
    }

    /*
     *
     * Top-level API
     *
     */

    var defaultLogger = new Logger();

    var _loggersByName = {};
    defaultLogger.getLogger = function getLogger(name) {
        if (typeof name !== "string" || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }

        var logger = _loggersByName[name];
        if (!logger) {
          logger = _loggersByName[name] = new Logger(
            name, defaultLogger.getLevel(), defaultLogger.methodFactory);
        }
        return logger;
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    defaultLogger.getLoggers = function getLoggers() {
        return _loggersByName;
    };

    return defaultLogger;
}));


/***/ }),

/***/ "./node_modules/regenerator-runtime/runtime.js":
/*!*****************************************************!*\
  !*** ./node_modules/regenerator-runtime/runtime.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   true ? module.exports : undefined
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}


/***/ }),

/***/ "./node_modules/uuid/index.js":
/*!************************************!*\
  !*** ./node_modules/uuid/index.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var v1 = __webpack_require__(/*! ./v1 */ "./node_modules/uuid/v1.js");
var v4 = __webpack_require__(/*! ./v4 */ "./node_modules/uuid/v4.js");

var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;

module.exports = uuid;


/***/ }),

/***/ "./node_modules/uuid/lib/bytesToUuid.js":
/*!**********************************************!*\
  !*** ./node_modules/uuid/lib/bytesToUuid.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]]
  ]).join('');
}

module.exports = bytesToUuid;


/***/ }),

/***/ "./node_modules/uuid/lib/rng-browser.js":
/*!**********************************************!*\
  !*** ./node_modules/uuid/lib/rng-browser.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto
// implementation. Also, find the complete implementation of crypto on IE11.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}


/***/ }),

/***/ "./node_modules/uuid/v1.js":
/*!*********************************!*\
  !*** ./node_modules/uuid/v1.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var rng = __webpack_require__(/*! ./lib/rng */ "./node_modules/uuid/lib/rng-browser.js");
var bytesToUuid = __webpack_require__(/*! ./lib/bytesToUuid */ "./node_modules/uuid/lib/bytesToUuid.js");

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

var _nodeId;
var _clockseq;

// Previous uuid creation time
var _lastMSecs = 0;
var _lastNSecs = 0;

// See https://github.com/uuidjs/uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189
  if (node == null || clockseq == null) {
    var seedBytes = rng();
    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [
        seedBytes[0] | 0x01,
        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
      ];
    }
    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  }

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : bytesToUuid(b);
}

module.exports = v1;


/***/ }),

/***/ "./node_modules/uuid/v4.js":
/*!*********************************!*\
  !*** ./node_modules/uuid/v4.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var rng = __webpack_require__(/*! ./lib/rng */ "./node_modules/uuid/lib/rng-browser.js");
var bytesToUuid = __webpack_require__(/*! ./lib/bytesToUuid */ "./node_modules/uuid/lib/bytesToUuid.js");

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;


/***/ }),

/***/ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js":
/*!********************************************************************!*\
  !*** ./node_modules/vue-loader/lib/runtime/componentNormalizer.js ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return normalizeComponent; });
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent (
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier, /* server only */
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () {
        injectStyles.call(
          this,
          (options.functional ? this.parent : this).$root.$options.shadowRoot
        )
      }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functional component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}


/***/ })

}]);