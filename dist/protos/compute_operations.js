/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 252:
/***/ ((module) => {

"use strict";

module.exports = asPromise;

/**
 * Callback as used by {@link util.asPromise}.
 * @typedef asPromiseCallback
 * @type {function}
 * @param {Error|null} error Error, if any
 * @param {...*} params Additional arguments
 * @returns {undefined}
 */

/**
 * Returns a promise from a node-style callback function.
 * @memberof util
 * @param {asPromiseCallback} fn Function to call
 * @param {*} ctx Function context
 * @param {...*} params Function arguments
 * @returns {Promise<*>} Promisified function
 */
function asPromise(fn, ctx/*, varargs */) {
    var params  = new Array(arguments.length - 1),
        offset  = 0,
        index   = 2,
        pending = true;
    while (index < arguments.length)
        params[offset++] = arguments[index++];
    return new Promise(function executor(resolve, reject) {
        params[offset] = function callback(err/*, varargs */) {
            if (pending) {
                pending = false;
                if (err)
                    reject(err);
                else {
                    var params = new Array(arguments.length - 1),
                        offset = 0;
                    while (offset < params.length)
                        params[offset++] = arguments[offset];
                    resolve.apply(null, params);
                }
            }
        };
        try {
            fn.apply(ctx || null, params);
        } catch (err) {
            if (pending) {
                pending = false;
                reject(err);
            }
        }
    });
}


/***/ }),

/***/ 718:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


/**
 * A minimal base64 implementation for number arrays.
 * @memberof util
 * @namespace
 */
var base64 = exports;

/**
 * Calculates the byte length of a base64 encoded string.
 * @param {string} string Base64 encoded string
 * @returns {number} Byte length
 */
base64.length = function length(string) {
    var p = string.length;
    if (!p)
        return 0;
    var n = 0;
    while (--p % 4 > 1 && string.charAt(p) === "=")
        ++n;
    return Math.ceil(string.length * 3) / 4 - n;
};

// Base64 encoding table
var b64 = new Array(64);

// Base64 decoding table
var s64 = new Array(123);

// 65..90, 97..122, 48..57, 43, 47
for (var i = 0; i < 64;)
    s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;

/**
 * Encodes a buffer to a base64 encoded string.
 * @param {Uint8Array} buffer Source buffer
 * @param {number} start Source start
 * @param {number} end Source end
 * @returns {string} Base64 encoded string
 */
base64.encode = function encode(buffer, start, end) {
    var parts = null,
        chunk = [];
    var i = 0, // output index
        j = 0, // goto index
        t;     // temporary
    while (start < end) {
        var b = buffer[start++];
        switch (j) {
            case 0:
                chunk[i++] = b64[b >> 2];
                t = (b & 3) << 4;
                j = 1;
                break;
            case 1:
                chunk[i++] = b64[t | b >> 4];
                t = (b & 15) << 2;
                j = 2;
                break;
            case 2:
                chunk[i++] = b64[t | b >> 6];
                chunk[i++] = b64[b & 63];
                j = 0;
                break;
        }
        if (i > 8191) {
            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
            i = 0;
        }
    }
    if (j) {
        chunk[i++] = b64[t];
        chunk[i++] = 61;
        if (j === 1)
            chunk[i++] = 61;
    }
    if (parts) {
        if (i)
            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
        return parts.join("");
    }
    return String.fromCharCode.apply(String, chunk.slice(0, i));
};

var invalidEncoding = "invalid encoding";

/**
 * Decodes a base64 encoded string to a buffer.
 * @param {string} string Source string
 * @param {Uint8Array} buffer Destination buffer
 * @param {number} offset Destination offset
 * @returns {number} Number of bytes written
 * @throws {Error} If encoding is invalid
 */
base64.decode = function decode(string, buffer, offset) {
    var start = offset;
    var j = 0, // goto index
        t;     // temporary
    for (var i = 0; i < string.length;) {
        var c = string.charCodeAt(i++);
        if (c === 61 && j > 1)
            break;
        if ((c = s64[c]) === undefined)
            throw Error(invalidEncoding);
        switch (j) {
            case 0:
                t = c;
                j = 1;
                break;
            case 1:
                buffer[offset++] = t << 2 | (c & 48) >> 4;
                t = c;
                j = 2;
                break;
            case 2:
                buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
                t = c;
                j = 3;
                break;
            case 3:
                buffer[offset++] = (t & 3) << 6 | c;
                j = 0;
                break;
        }
    }
    if (j === 1)
        throw Error(invalidEncoding);
    return offset - start;
};

/**
 * Tests if the specified string appears to be base64 encoded.
 * @param {string} string String to test
 * @returns {boolean} `true` if probably base64 encoded, otherwise false
 */
base64.test = function test(string) {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string);
};


/***/ }),

/***/ 850:
/***/ ((module) => {

"use strict";

module.exports = EventEmitter;

/**
 * Constructs a new event emitter instance.
 * @classdesc A minimal event emitter.
 * @memberof util
 * @constructor
 */
function EventEmitter() {

    /**
     * Registered listeners.
     * @type {Object.<string,*>}
     * @private
     */
    this._listeners = {};
}

/**
 * Registers an event listener.
 * @param {string} evt Event name
 * @param {function} fn Listener
 * @param {*} [ctx] Listener context
 * @returns {util.EventEmitter} `this`
 */
EventEmitter.prototype.on = function on(evt, fn, ctx) {
    (this._listeners[evt] || (this._listeners[evt] = [])).push({
        fn  : fn,
        ctx : ctx || this
    });
    return this;
};

/**
 * Removes an event listener or any matching listeners if arguments are omitted.
 * @param {string} [evt] Event name. Removes all listeners if omitted.
 * @param {function} [fn] Listener to remove. Removes all listeners of `evt` if omitted.
 * @returns {util.EventEmitter} `this`
 */
EventEmitter.prototype.off = function off(evt, fn) {
    if (evt === undefined)
        this._listeners = {};
    else {
        if (fn === undefined)
            this._listeners[evt] = [];
        else {
            var listeners = this._listeners[evt];
            for (var i = 0; i < listeners.length;)
                if (listeners[i].fn === fn)
                    listeners.splice(i, 1);
                else
                    ++i;
        }
    }
    return this;
};

/**
 * Emits an event by calling its listeners with the specified arguments.
 * @param {string} evt Event name
 * @param {...*} args Arguments
 * @returns {util.EventEmitter} `this`
 */
EventEmitter.prototype.emit = function emit(evt) {
    var listeners = this._listeners[evt];
    if (listeners) {
        var args = [],
            i = 1;
        for (; i < arguments.length;)
            args.push(arguments[i++]);
        for (i = 0; i < listeners.length;)
            listeners[i].fn.apply(listeners[i++].ctx, args);
    }
    return this;
};


/***/ }),

/***/ 843:
/***/ ((module) => {

"use strict";


module.exports = factory(factory);

/**
 * Reads / writes floats / doubles from / to buffers.
 * @name util.float
 * @namespace
 */

/**
 * Writes a 32 bit float to a buffer using little endian byte order.
 * @name util.float.writeFloatLE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Writes a 32 bit float to a buffer using big endian byte order.
 * @name util.float.writeFloatBE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Reads a 32 bit float from a buffer using little endian byte order.
 * @name util.float.readFloatLE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

/**
 * Reads a 32 bit float from a buffer using big endian byte order.
 * @name util.float.readFloatBE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

/**
 * Writes a 64 bit double to a buffer using little endian byte order.
 * @name util.float.writeDoubleLE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Writes a 64 bit double to a buffer using big endian byte order.
 * @name util.float.writeDoubleBE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Reads a 64 bit double from a buffer using little endian byte order.
 * @name util.float.readDoubleLE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

/**
 * Reads a 64 bit double from a buffer using big endian byte order.
 * @name util.float.readDoubleBE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

// Factory function for the purpose of node-based testing in modified global environments
function factory(exports) {

    // float: typed array
    if (typeof Float32Array !== "undefined") (function() {

        var f32 = new Float32Array([ -0 ]),
            f8b = new Uint8Array(f32.buffer),
            le  = f8b[3] === 128;

        function writeFloat_f32_cpy(val, buf, pos) {
            f32[0] = val;
            buf[pos    ] = f8b[0];
            buf[pos + 1] = f8b[1];
            buf[pos + 2] = f8b[2];
            buf[pos + 3] = f8b[3];
        }

        function writeFloat_f32_rev(val, buf, pos) {
            f32[0] = val;
            buf[pos    ] = f8b[3];
            buf[pos + 1] = f8b[2];
            buf[pos + 2] = f8b[1];
            buf[pos + 3] = f8b[0];
        }

        /* istanbul ignore next */
        exports.writeFloatLE = le ? writeFloat_f32_cpy : writeFloat_f32_rev;
        /* istanbul ignore next */
        exports.writeFloatBE = le ? writeFloat_f32_rev : writeFloat_f32_cpy;

        function readFloat_f32_cpy(buf, pos) {
            f8b[0] = buf[pos    ];
            f8b[1] = buf[pos + 1];
            f8b[2] = buf[pos + 2];
            f8b[3] = buf[pos + 3];
            return f32[0];
        }

        function readFloat_f32_rev(buf, pos) {
            f8b[3] = buf[pos    ];
            f8b[2] = buf[pos + 1];
            f8b[1] = buf[pos + 2];
            f8b[0] = buf[pos + 3];
            return f32[0];
        }

        /* istanbul ignore next */
        exports.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
        /* istanbul ignore next */
        exports.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;

    // float: ieee754
    })(); else (function() {

        function writeFloat_ieee754(writeUint, val, buf, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
                val = -val;
            if (val === 0)
                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos);
            else if (isNaN(val))
                writeUint(2143289344, buf, pos);
            else if (val > 3.4028234663852886e+38) // +-Infinity
                writeUint((sign << 31 | 2139095040) >>> 0, buf, pos);
            else if (val < 1.1754943508222875e-38) // denormal
                writeUint((sign << 31 | Math.round(val / 1.401298464324817e-45)) >>> 0, buf, pos);
            else {
                var exponent = Math.floor(Math.log(val) / Math.LN2),
                    mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
                writeUint((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf, pos);
            }
        }

        exports.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
        exports.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);

        function readFloat_ieee754(readUint, buf, pos) {
            var uint = readUint(buf, pos),
                sign = (uint >> 31) * 2 + 1,
                exponent = uint >>> 23 & 255,
                mantissa = uint & 8388607;
            return exponent === 255
                ? mantissa
                ? NaN
                : sign * Infinity
                : exponent === 0 // denormal
                ? sign * 1.401298464324817e-45 * mantissa
                : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
        }

        exports.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
        exports.readFloatBE = readFloat_ieee754.bind(null, readUintBE);

    })();

    // double: typed array
    if (typeof Float64Array !== "undefined") (function() {

        var f64 = new Float64Array([-0]),
            f8b = new Uint8Array(f64.buffer),
            le  = f8b[7] === 128;

        function writeDouble_f64_cpy(val, buf, pos) {
            f64[0] = val;
            buf[pos    ] = f8b[0];
            buf[pos + 1] = f8b[1];
            buf[pos + 2] = f8b[2];
            buf[pos + 3] = f8b[3];
            buf[pos + 4] = f8b[4];
            buf[pos + 5] = f8b[5];
            buf[pos + 6] = f8b[6];
            buf[pos + 7] = f8b[7];
        }

        function writeDouble_f64_rev(val, buf, pos) {
            f64[0] = val;
            buf[pos    ] = f8b[7];
            buf[pos + 1] = f8b[6];
            buf[pos + 2] = f8b[5];
            buf[pos + 3] = f8b[4];
            buf[pos + 4] = f8b[3];
            buf[pos + 5] = f8b[2];
            buf[pos + 6] = f8b[1];
            buf[pos + 7] = f8b[0];
        }

        /* istanbul ignore next */
        exports.writeDoubleLE = le ? writeDouble_f64_cpy : writeDouble_f64_rev;
        /* istanbul ignore next */
        exports.writeDoubleBE = le ? writeDouble_f64_rev : writeDouble_f64_cpy;

        function readDouble_f64_cpy(buf, pos) {
            f8b[0] = buf[pos    ];
            f8b[1] = buf[pos + 1];
            f8b[2] = buf[pos + 2];
            f8b[3] = buf[pos + 3];
            f8b[4] = buf[pos + 4];
            f8b[5] = buf[pos + 5];
            f8b[6] = buf[pos + 6];
            f8b[7] = buf[pos + 7];
            return f64[0];
        }

        function readDouble_f64_rev(buf, pos) {
            f8b[7] = buf[pos    ];
            f8b[6] = buf[pos + 1];
            f8b[5] = buf[pos + 2];
            f8b[4] = buf[pos + 3];
            f8b[3] = buf[pos + 4];
            f8b[2] = buf[pos + 5];
            f8b[1] = buf[pos + 6];
            f8b[0] = buf[pos + 7];
            return f64[0];
        }

        /* istanbul ignore next */
        exports.readDoubleLE = le ? readDouble_f64_cpy : readDouble_f64_rev;
        /* istanbul ignore next */
        exports.readDoubleBE = le ? readDouble_f64_rev : readDouble_f64_cpy;

    // double: ieee754
    })(); else (function() {

        function writeDouble_ieee754(writeUint, off0, off1, val, buf, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
                val = -val;
            if (val === 0) {
                writeUint(0, buf, pos + off0);
                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos + off1);
            } else if (isNaN(val)) {
                writeUint(0, buf, pos + off0);
                writeUint(2146959360, buf, pos + off1);
            } else if (val > 1.7976931348623157e+308) { // +-Infinity
                writeUint(0, buf, pos + off0);
                writeUint((sign << 31 | 2146435072) >>> 0, buf, pos + off1);
            } else {
                var mantissa;
                if (val < 2.2250738585072014e-308) { // denormal
                    mantissa = val / 5e-324;
                    writeUint(mantissa >>> 0, buf, pos + off0);
                    writeUint((sign << 31 | mantissa / 4294967296) >>> 0, buf, pos + off1);
                } else {
                    var exponent = Math.floor(Math.log(val) / Math.LN2);
                    if (exponent === 1024)
                        exponent = 1023;
                    mantissa = val * Math.pow(2, -exponent);
                    writeUint(mantissa * 4503599627370496 >>> 0, buf, pos + off0);
                    writeUint((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf, pos + off1);
                }
            }
        }

        exports.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4);
        exports.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0);

        function readDouble_ieee754(readUint, off0, off1, buf, pos) {
            var lo = readUint(buf, pos + off0),
                hi = readUint(buf, pos + off1);
            var sign = (hi >> 31) * 2 + 1,
                exponent = hi >>> 20 & 2047,
                mantissa = 4294967296 * (hi & 1048575) + lo;
            return exponent === 2047
                ? mantissa
                ? NaN
                : sign * Infinity
                : exponent === 0 // denormal
                ? sign * 5e-324 * mantissa
                : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
        }

        exports.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4);
        exports.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0);

    })();

    return exports;
}

// uint helpers

function writeUintLE(val, buf, pos) {
    buf[pos    ] =  val        & 255;
    buf[pos + 1] =  val >>> 8  & 255;
    buf[pos + 2] =  val >>> 16 & 255;
    buf[pos + 3] =  val >>> 24;
}

function writeUintBE(val, buf, pos) {
    buf[pos    ] =  val >>> 24;
    buf[pos + 1] =  val >>> 16 & 255;
    buf[pos + 2] =  val >>> 8  & 255;
    buf[pos + 3] =  val        & 255;
}

function readUintLE(buf, pos) {
    return (buf[pos    ]
          | buf[pos + 1] << 8
          | buf[pos + 2] << 16
          | buf[pos + 3] << 24) >>> 0;
}

function readUintBE(buf, pos) {
    return (buf[pos    ] << 24
          | buf[pos + 1] << 16
          | buf[pos + 2] << 8
          | buf[pos + 3]) >>> 0;
}


/***/ }),

/***/ 94:
/***/ ((module) => {

"use strict";

module.exports = inquire;

/**
 * Requires a module only if available.
 * @memberof util
 * @param {string} moduleName Module to require
 * @returns {?Object} Required module if available and not empty, otherwise `null`
 */
function inquire(moduleName) {
    try {
        var mod = eval("quire".replace(/^/,"re"))(moduleName); // eslint-disable-line no-eval
        if (mod && (mod.length || Object.keys(mod).length))
            return mod;
    } catch (e) {} // eslint-disable-line no-empty
    return null;
}


/***/ }),

/***/ 743:
/***/ ((module) => {

"use strict";

module.exports = pool;

/**
 * An allocator as used by {@link util.pool}.
 * @typedef PoolAllocator
 * @type {function}
 * @param {number} size Buffer size
 * @returns {Uint8Array} Buffer
 */

/**
 * A slicer as used by {@link util.pool}.
 * @typedef PoolSlicer
 * @type {function}
 * @param {number} start Start offset
 * @param {number} end End offset
 * @returns {Uint8Array} Buffer slice
 * @this {Uint8Array}
 */

/**
 * A general purpose buffer pool.
 * @memberof util
 * @function
 * @param {PoolAllocator} alloc Allocator
 * @param {PoolSlicer} slice Slicer
 * @param {number} [size=8192] Slab size
 * @returns {PoolAllocator} Pooled allocator
 */
function pool(alloc, slice, size) {
    var SIZE   = size || 8192;
    var MAX    = SIZE >>> 1;
    var slab   = null;
    var offset = SIZE;
    return function pool_alloc(size) {
        if (size < 1 || size > MAX)
            return alloc(size);
        if (offset + size > SIZE) {
            slab = alloc(SIZE);
            offset = 0;
        }
        var buf = slice.call(slab, offset, offset += size);
        if (offset & 7) // align to 32 bit
            offset = (offset | 7) + 1;
        return buf;
    };
}


/***/ }),

/***/ 49:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


/**
 * A minimal UTF8 implementation for number arrays.
 * @memberof util
 * @namespace
 */
var utf8 = exports;

/**
 * Calculates the UTF8 byte length of a string.
 * @param {string} string String
 * @returns {number} Byte length
 */
utf8.length = function utf8_length(string) {
    var len = 0,
        c = 0;
    for (var i = 0; i < string.length; ++i) {
        c = string.charCodeAt(i);
        if (c < 128)
            len += 1;
        else if (c < 2048)
            len += 2;
        else if ((c & 0xFC00) === 0xD800 && (string.charCodeAt(i + 1) & 0xFC00) === 0xDC00) {
            ++i;
            len += 4;
        } else
            len += 3;
    }
    return len;
};

/**
 * Reads UTF8 bytes as a string.
 * @param {Uint8Array} buffer Source buffer
 * @param {number} start Source start
 * @param {number} end Source end
 * @returns {string} String read
 */
utf8.read = function utf8_read(buffer, start, end) {
    var len = end - start;
    if (len < 1)
        return "";
    var parts = null,
        chunk = [],
        i = 0, // char offset
        t;     // temporary
    while (start < end) {
        t = buffer[start++];
        if (t < 128)
            chunk[i++] = t;
        else if (t > 191 && t < 224)
            chunk[i++] = (t & 31) << 6 | buffer[start++] & 63;
        else if (t > 239 && t < 365) {
            t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 0x10000;
            chunk[i++] = 0xD800 + (t >> 10);
            chunk[i++] = 0xDC00 + (t & 1023);
        } else
            chunk[i++] = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
        if (i > 8191) {
            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
            i = 0;
        }
    }
    if (parts) {
        if (i)
            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
        return parts.join("");
    }
    return String.fromCharCode.apply(String, chunk.slice(0, i));
};

/**
 * Writes a string as UTF8 bytes.
 * @param {string} string Source string
 * @param {Uint8Array} buffer Destination buffer
 * @param {number} offset Destination offset
 * @returns {number} Bytes written
 */
utf8.write = function utf8_write(string, buffer, offset) {
    var start = offset,
        c1, // character 1
        c2; // character 2
    for (var i = 0; i < string.length; ++i) {
        c1 = string.charCodeAt(i);
        if (c1 < 128) {
            buffer[offset++] = c1;
        } else if (c1 < 2048) {
            buffer[offset++] = c1 >> 6       | 192;
            buffer[offset++] = c1       & 63 | 128;
        } else if ((c1 & 0xFC00) === 0xD800 && ((c2 = string.charCodeAt(i + 1)) & 0xFC00) === 0xDC00) {
            c1 = 0x10000 + ((c1 & 0x03FF) << 10) + (c2 & 0x03FF);
            ++i;
            buffer[offset++] = c1 >> 18      | 240;
            buffer[offset++] = c1 >> 12 & 63 | 128;
            buffer[offset++] = c1 >> 6  & 63 | 128;
            buffer[offset++] = c1       & 63 | 128;
        } else {
            buffer[offset++] = c1 >> 12      | 224;
            buffer[offset++] = c1 >> 6  & 63 | 128;
            buffer[offset++] = c1       & 63 | 128;
        }
    }
    return offset - start;
};


/***/ }),

/***/ 927:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/* module decorator */ module = __nccwpck_require__.nmd(module);
!function(e){"function"==typeof define&&define.amd?define(["protobufjs/minimal"],e): true&&module&&module.exports&&(module.exports=e(__nccwpck_require__(934)))}(function(r){"use strict";var e,t,n,o,i,G,s=r.Reader,a=r.Writer,c=r.util,u=r.roots.compute_operations_protos||(r.roots.compute_operations_protos={});function p(e){if(this.warnings=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function l(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function L(e){if(this.errors=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function d(e){if(this.data=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function g(e){if(this.data=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function f(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function y(e){if(this.operations=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function O(e){if(this.items={},this.unreachables=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function B(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function V(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function F(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function h(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function b(e){if(this.items=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function U(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function M(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function z(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function J(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function m(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function q(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function v(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function W(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function H(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function Y(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function P(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function X(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function Z(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function K(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function Q(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function w(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function $(e,t,n){r.rpc.Service.call(this,e,t,n)}function ee(e,t,n){r.rpc.Service.call(this,e,t,n)}function te(e,t,n){r.rpc.Service.call(this,e,t,n)}function ne(e,t,n){r.rpc.Service.call(this,e,t,n)}function re(e){if(this.rules=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function j(e){if(this.additionalBindings=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function oe(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function ie(e){if(this.file=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function S(e){if(this.dependency=[],this.publicDependency=[],this.weakDependency=[],this.messageType=[],this.enumType=[],this.service=[],this.extension=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function k(e){if(this.field=[],this.extension=[],this.nestedType=[],this.enumType=[],this.extensionRange=[],this.oneofDecl=[],this.reservedRange=[],this.reservedName=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function ae(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function pe(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function le(e){if(this.uninterpretedOption=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function T(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function se(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function x(e){if(this.value=[],this.reservedRange=[],this.reservedName=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function ce(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function ue(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function de(e){if(this.method=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function E(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function D(e){if(this.uninterpretedOption=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function R(e){if(this.uninterpretedOption=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function N(e){if(this.uninterpretedOption=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function ge(e){if(this.uninterpretedOption=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function fe(e){if(this.uninterpretedOption=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function ye(e){if(this.uninterpretedOption=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function Oe(e){if(this.uninterpretedOption=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function A(e){if(this.uninterpretedOption=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function _(e){if(this.name=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function he(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function be(e){if(this.location=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function I(e){if(this.path=[],this.span=[],this.leadingDetachedComments=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function me(e){if(this.annotation=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function C(e){if(this.path=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}return u.google=((G={}).cloud=((o={}).compute=((n={}).v1=((i={}).Operation=(p.prototype.clientOperationId=null,p.prototype.creationTimestamp=null,p.prototype.description=null,p.prototype.endTime=null,p.prototype.error=null,p.prototype.httpErrorMessage=null,p.prototype.httpErrorStatusCode=null,p.prototype.id=null,p.prototype.insertTime=null,p.prototype.kind=null,p.prototype.name=null,p.prototype.operationType=null,p.prototype.progress=null,p.prototype.region=null,p.prototype.selfLink=null,p.prototype.startTime=null,p.prototype.status=null,p.prototype.statusMessage=null,p.prototype.targetId=null,p.prototype.targetLink=null,p.prototype.user=null,p.prototype.warnings=c.emptyArray,p.prototype.zone=null,Object.defineProperty(p.prototype,"_clientOperationId",{get:c.oneOfGetter(t=["clientOperationId"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_creationTimestamp",{get:c.oneOfGetter(t=["creationTimestamp"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_description",{get:c.oneOfGetter(t=["description"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_endTime",{get:c.oneOfGetter(t=["endTime"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_error",{get:c.oneOfGetter(t=["error"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_httpErrorMessage",{get:c.oneOfGetter(t=["httpErrorMessage"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_httpErrorStatusCode",{get:c.oneOfGetter(t=["httpErrorStatusCode"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_id",{get:c.oneOfGetter(t=["id"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_insertTime",{get:c.oneOfGetter(t=["insertTime"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_kind",{get:c.oneOfGetter(t=["kind"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_name",{get:c.oneOfGetter(t=["name"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_operationType",{get:c.oneOfGetter(t=["operationType"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_progress",{get:c.oneOfGetter(t=["progress"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_region",{get:c.oneOfGetter(t=["region"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_selfLink",{get:c.oneOfGetter(t=["selfLink"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_startTime",{get:c.oneOfGetter(t=["startTime"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_status",{get:c.oneOfGetter(t=["status"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_statusMessage",{get:c.oneOfGetter(t=["statusMessage"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_targetId",{get:c.oneOfGetter(t=["targetId"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_targetLink",{get:c.oneOfGetter(t=["targetLink"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_user",{get:c.oneOfGetter(t=["user"]),set:c.oneOfSetter(t)}),Object.defineProperty(p.prototype,"_zone",{get:c.oneOfGetter(t=["zone"]),set:c.oneOfSetter(t)}),p.create=function(e){return new p(e)},p.encode=function(e,t){if(t=t||a.create(),null!=e.id&&Object.hasOwnProperty.call(e,"id")&&t.uint32(26842).string(e.id),null!=e.kind&&Object.hasOwnProperty.call(e,"kind")&&t.uint32(26336418).string(e.kind),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(26989658).string(e.name),null!=e.user&&Object.hasOwnProperty.call(e,"user")&&t.uint32(28794458).string(e.user),null!=e.zone&&Object.hasOwnProperty.call(e,"zone")&&t.uint32(29957474).string(e.zone),null!=e.creationTimestamp&&Object.hasOwnProperty.call(e,"creationTimestamp")&&t.uint32(244202930).string(e.creationTimestamp),null!=e.startTime&&Object.hasOwnProperty.call(e,"startTime")&&t.uint32(299738194).string(e.startTime),null!=e.targetLink&&Object.hasOwnProperty.call(e,"targetLink")&&t.uint32(501370690).string(e.targetLink),null!=e.progress&&Object.hasOwnProperty.call(e,"progress")&&t.uint32(581308776).int32(e.progress),null!=e.error&&Object.hasOwnProperty.call(e,"error")&&u.google.cloud.compute.v1.Error.encode(e.error,t.uint32(774279234).fork()).ldelim(),null!=e.endTime&&Object.hasOwnProperty.call(e,"endTime")&&t.uint32(919510410).string(e.endTime),null!=e.region&&Object.hasOwnProperty.call(e,"region")&&t.uint32(1111570338).string(e.region),null!=e.operationType&&Object.hasOwnProperty.call(e,"operationType")&&t.uint32(1421203602).string(e.operationType),null!=e.status&&Object.hasOwnProperty.call(e,"status")&&t.uint32(1450082192).int32(e.status),null!=e.httpErrorMessage&&Object.hasOwnProperty.call(e,"httpErrorMessage")&&t.uint32(1620175562).string(e.httpErrorMessage),null!=e.targetId&&Object.hasOwnProperty.call(e,"targetId")&&t.uint32(2065323082).string(e.targetId),null!=e.clientOperationId&&Object.hasOwnProperty.call(e,"clientOperationId")&&t.uint32(2377922362).string(e.clientOperationId),null!=e.statusMessage&&Object.hasOwnProperty.call(e,"statusMessage")&&t.uint32(2379425234).string(e.statusMessage),null!=e.httpErrorStatusCode&&Object.hasOwnProperty.call(e,"httpErrorStatusCode")&&t.uint32(2498761568).int32(e.httpErrorStatusCode),null!=e.description&&Object.hasOwnProperty.call(e,"description")&&t.uint32(3383500770).string(e.description),null!=e.insertTime&&Object.hasOwnProperty.call(e,"insertTime")&&t.uint32(3469780122).string(e.insertTime),null!=e.selfLink&&Object.hasOwnProperty.call(e,"selfLink")&&t.uint32(3649718378).string(e.selfLink),null!=e.warnings&&e.warnings.length)for(var n=0;n<e.warnings.length;++n)u.google.cloud.compute.v1.Warnings.encode(e.warnings[n],t.uint32(3984728762).fork()).ldelim();return t},p.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},p.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.Operation;e.pos<n;){var o=e.uint32();switch(o>>>3){case 297240295:r.clientOperationId=e.string();break;case 30525366:r.creationTimestamp=e.string();break;case 422937596:r.description=e.string();break;case 114938801:r.endTime=e.string();break;case 96784904:r.error=u.google.cloud.compute.v1.Error.decode(e,e.uint32());break;case 202521945:r.httpErrorMessage=e.string();break;case 312345196:r.httpErrorStatusCode=e.int32();break;case 3355:r.id=e.string();break;case 433722515:r.insertTime=e.string();break;case 3292052:r.kind=e.string();break;case 3373707:r.name=e.string();break;case 177650450:r.operationType=e.string();break;case 72663597:r.progress=e.int32();break;case 138946292:r.region=e.string();break;case 456214797:r.selfLink=e.string();break;case 37467274:r.startTime=e.string();break;case 181260274:r.status=e.int32();break;case 297428154:r.statusMessage=e.string();break;case 258165385:r.targetId=e.string();break;case 62671336:r.targetLink=e.string();break;case 3599307:r.user=e.string();break;case 498091095:r.warnings&&r.warnings.length||(r.warnings=[]),r.warnings.push(u.google.cloud.compute.v1.Warnings.decode(e,e.uint32()));break;case 3744684:r.zone=e.string();break;default:e.skipType(7&o)}}return r},p.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},p.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.clientOperationId&&e.hasOwnProperty("clientOperationId")&&!c.isString(e.clientOperationId))return"clientOperationId: string expected";if(null!=e.creationTimestamp&&e.hasOwnProperty("creationTimestamp")&&!c.isString(e.creationTimestamp))return"creationTimestamp: string expected";if(null!=e.description&&e.hasOwnProperty("description")&&!c.isString(e.description))return"description: string expected";if(null!=e.endTime&&e.hasOwnProperty("endTime")&&!c.isString(e.endTime))return"endTime: string expected";if(null!=e.error&&e.hasOwnProperty("error")&&(t=u.google.cloud.compute.v1.Error.verify(e.error)))return"error."+t;if(null!=e.httpErrorMessage&&e.hasOwnProperty("httpErrorMessage")&&!c.isString(e.httpErrorMessage))return"httpErrorMessage: string expected";if(null!=e.httpErrorStatusCode&&e.hasOwnProperty("httpErrorStatusCode")&&!c.isInteger(e.httpErrorStatusCode))return"httpErrorStatusCode: integer expected";if(null!=e.id&&e.hasOwnProperty("id")&&!c.isString(e.id))return"id: string expected";if(null!=e.insertTime&&e.hasOwnProperty("insertTime")&&!c.isString(e.insertTime))return"insertTime: string expected";if(null!=e.kind&&e.hasOwnProperty("kind")&&!c.isString(e.kind))return"kind: string expected";if(null!=e.name&&e.hasOwnProperty("name")&&!c.isString(e.name))return"name: string expected";if(null!=e.operationType&&e.hasOwnProperty("operationType")&&!c.isString(e.operationType))return"operationType: string expected";if(null!=e.progress&&e.hasOwnProperty("progress")&&!c.isInteger(e.progress))return"progress: integer expected";if(null!=e.region&&e.hasOwnProperty("region")&&!c.isString(e.region))return"region: string expected";if(null!=e.selfLink&&e.hasOwnProperty("selfLink")&&!c.isString(e.selfLink))return"selfLink: string expected";if(null!=e.startTime&&e.hasOwnProperty("startTime")&&!c.isString(e.startTime))return"startTime: string expected";if(null!=e.status&&e.hasOwnProperty("status"))switch(e.status){default:return"status: enum value expected";case 0:case 2104194:case 35394935:case 121282975:}if(null!=e.statusMessage&&e.hasOwnProperty("statusMessage")&&!c.isString(e.statusMessage))return"statusMessage: string expected";if(null!=e.targetId&&e.hasOwnProperty("targetId")&&!c.isString(e.targetId))return"targetId: string expected";if(null!=e.targetLink&&e.hasOwnProperty("targetLink")&&!c.isString(e.targetLink))return"targetLink: string expected";if(null!=e.user&&e.hasOwnProperty("user")&&!c.isString(e.user))return"user: string expected";if(null!=e.warnings&&e.hasOwnProperty("warnings")){if(!Array.isArray(e.warnings))return"warnings: array expected";for(var t,n=0;n<e.warnings.length;++n)if(t=u.google.cloud.compute.v1.Warnings.verify(e.warnings[n]))return"warnings."+t}return null!=e.zone&&e.hasOwnProperty("zone")&&!c.isString(e.zone)?"zone: string expected":null},p.fromObject=function(e){if(e instanceof u.google.cloud.compute.v1.Operation)return e;var t=new u.google.cloud.compute.v1.Operation;if(null!=e.clientOperationId&&(t.clientOperationId=String(e.clientOperationId)),null!=e.creationTimestamp&&(t.creationTimestamp=String(e.creationTimestamp)),null!=e.description&&(t.description=String(e.description)),null!=e.endTime&&(t.endTime=String(e.endTime)),null!=e.error){if("object"!=typeof e.error)throw TypeError(".google.cloud.compute.v1.Operation.error: object expected");t.error=u.google.cloud.compute.v1.Error.fromObject(e.error)}switch(null!=e.httpErrorMessage&&(t.httpErrorMessage=String(e.httpErrorMessage)),null!=e.httpErrorStatusCode&&(t.httpErrorStatusCode=0|e.httpErrorStatusCode),null!=e.id&&(t.id=String(e.id)),null!=e.insertTime&&(t.insertTime=String(e.insertTime)),null!=e.kind&&(t.kind=String(e.kind)),null!=e.name&&(t.name=String(e.name)),null!=e.operationType&&(t.operationType=String(e.operationType)),null!=e.progress&&(t.progress=0|e.progress),null!=e.region&&(t.region=String(e.region)),null!=e.selfLink&&(t.selfLink=String(e.selfLink)),null!=e.startTime&&(t.startTime=String(e.startTime)),e.status){case"UNDEFINED_STATUS":case 0:t.status=0;break;case"DONE":case 2104194:t.status=2104194;break;case"PENDING":case 35394935:t.status=35394935;break;case"RUNNING":case 121282975:t.status=121282975}if(null!=e.statusMessage&&(t.statusMessage=String(e.statusMessage)),null!=e.targetId&&(t.targetId=String(e.targetId)),null!=e.targetLink&&(t.targetLink=String(e.targetLink)),null!=e.user&&(t.user=String(e.user)),e.warnings){if(!Array.isArray(e.warnings))throw TypeError(".google.cloud.compute.v1.Operation.warnings: array expected");t.warnings=[];for(var n=0;n<e.warnings.length;++n){if("object"!=typeof e.warnings[n])throw TypeError(".google.cloud.compute.v1.Operation.warnings: object expected");t.warnings[n]=u.google.cloud.compute.v1.Warnings.fromObject(e.warnings[n])}}return null!=e.zone&&(t.zone=String(e.zone)),t},p.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.warnings=[]),null!=e.id&&e.hasOwnProperty("id")&&(n.id=e.id,t.oneofs)&&(n._id="id"),null!=e.kind&&e.hasOwnProperty("kind")&&(n.kind=e.kind,t.oneofs)&&(n._kind="kind"),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name,t.oneofs)&&(n._name="name"),null!=e.user&&e.hasOwnProperty("user")&&(n.user=e.user,t.oneofs)&&(n._user="user"),null!=e.zone&&e.hasOwnProperty("zone")&&(n.zone=e.zone,t.oneofs)&&(n._zone="zone"),null!=e.creationTimestamp&&e.hasOwnProperty("creationTimestamp")&&(n.creationTimestamp=e.creationTimestamp,t.oneofs)&&(n._creationTimestamp="creationTimestamp"),null!=e.startTime&&e.hasOwnProperty("startTime")&&(n.startTime=e.startTime,t.oneofs)&&(n._startTime="startTime"),null!=e.targetLink&&e.hasOwnProperty("targetLink")&&(n.targetLink=e.targetLink,t.oneofs)&&(n._targetLink="targetLink"),null!=e.progress&&e.hasOwnProperty("progress")&&(n.progress=e.progress,t.oneofs)&&(n._progress="progress"),null!=e.error&&e.hasOwnProperty("error")&&(n.error=u.google.cloud.compute.v1.Error.toObject(e.error,t),t.oneofs)&&(n._error="error"),null!=e.endTime&&e.hasOwnProperty("endTime")&&(n.endTime=e.endTime,t.oneofs)&&(n._endTime="endTime"),null!=e.region&&e.hasOwnProperty("region")&&(n.region=e.region,t.oneofs)&&(n._region="region"),null!=e.operationType&&e.hasOwnProperty("operationType")&&(n.operationType=e.operationType,t.oneofs)&&(n._operationType="operationType"),null!=e.status&&e.hasOwnProperty("status")&&(n.status=t.enums===String?u.google.cloud.compute.v1.Operation.Status[e.status]:e.status,t.oneofs)&&(n._status="status"),null!=e.httpErrorMessage&&e.hasOwnProperty("httpErrorMessage")&&(n.httpErrorMessage=e.httpErrorMessage,t.oneofs)&&(n._httpErrorMessage="httpErrorMessage"),null!=e.targetId&&e.hasOwnProperty("targetId")&&(n.targetId=e.targetId,t.oneofs)&&(n._targetId="targetId"),null!=e.clientOperationId&&e.hasOwnProperty("clientOperationId")&&(n.clientOperationId=e.clientOperationId,t.oneofs)&&(n._clientOperationId="clientOperationId"),null!=e.statusMessage&&e.hasOwnProperty("statusMessage")&&(n.statusMessage=e.statusMessage,t.oneofs)&&(n._statusMessage="statusMessage"),null!=e.httpErrorStatusCode&&e.hasOwnProperty("httpErrorStatusCode")&&(n.httpErrorStatusCode=e.httpErrorStatusCode,t.oneofs)&&(n._httpErrorStatusCode="httpErrorStatusCode"),null!=e.description&&e.hasOwnProperty("description")&&(n.description=e.description,t.oneofs)&&(n._description="description"),null!=e.insertTime&&e.hasOwnProperty("insertTime")&&(n.insertTime=e.insertTime,t.oneofs)&&(n._insertTime="insertTime"),null!=e.selfLink&&e.hasOwnProperty("selfLink")&&(n.selfLink=e.selfLink,t.oneofs)&&(n._selfLink="selfLink"),e.warnings&&e.warnings.length){n.warnings=[];for(var r=0;r<e.warnings.length;++r)n.warnings[r]=u.google.cloud.compute.v1.Warnings.toObject(e.warnings[r],t)}return n},p.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},p.Status=(t={},(e=Object.create(t))[t[0]="UNDEFINED_STATUS"]=0,e[t[2104194]="DONE"]=2104194,e[t[35394935]="PENDING"]=35394935,e[t[121282975]="RUNNING"]=121282975,e),p),i.Errors=(l.prototype.code=null,l.prototype.location=null,l.prototype.message=null,Object.defineProperty(l.prototype,"_code",{get:c.oneOfGetter(t=["code"]),set:c.oneOfSetter(t)}),Object.defineProperty(l.prototype,"_location",{get:c.oneOfGetter(t=["location"]),set:c.oneOfSetter(t)}),Object.defineProperty(l.prototype,"_message",{get:c.oneOfGetter(t=["message"]),set:c.oneOfSetter(t)}),l.create=function(e){return new l(e)},l.encode=function(e,t){return t=t||a.create(),null!=e.code&&Object.hasOwnProperty.call(e,"code")&&t.uint32(24473450).string(e.code),null!=e.location&&Object.hasOwnProperty.call(e,"location")&&t.uint32(2323447210).string(e.location),null!=e.message&&Object.hasOwnProperty.call(e,"message")&&t.uint32(3344433210).string(e.message),t},l.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},l.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.Errors;e.pos<n;){var o=e.uint32();switch(o>>>3){case 3059181:r.code=e.string();break;case 290430901:r.location=e.string();break;case 418054151:r.message=e.string();break;default:e.skipType(7&o)}}return r},l.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},l.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.code&&e.hasOwnProperty("code")&&!c.isString(e.code)?"code: string expected":null!=e.location&&e.hasOwnProperty("location")&&!c.isString(e.location)?"location: string expected":null!=e.message&&e.hasOwnProperty("message")&&!c.isString(e.message)?"message: string expected":null},l.fromObject=function(e){var t;return e instanceof u.google.cloud.compute.v1.Errors?e:(t=new u.google.cloud.compute.v1.Errors,null!=e.code&&(t.code=String(e.code)),null!=e.location&&(t.location=String(e.location)),null!=e.message&&(t.message=String(e.message)),t)},l.toObject=function(e,t){t=t||{};var n={};return null!=e.code&&e.hasOwnProperty("code")&&(n.code=e.code,t.oneofs)&&(n._code="code"),null!=e.location&&e.hasOwnProperty("location")&&(n.location=e.location,t.oneofs)&&(n._location="location"),null!=e.message&&e.hasOwnProperty("message")&&(n.message=e.message,t.oneofs)&&(n._message="message"),n},l.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},l),i.Error=(L.prototype.errors=c.emptyArray,L.create=function(e){return new L(e)},L.encode=function(e,t){if(t=t||a.create(),null!=e.errors&&e.errors.length)for(var n=0;n<e.errors.length;++n)u.google.cloud.compute.v1.Errors.encode(e.errors[n],t.uint32(2527820634).fork()).ldelim();return t},L.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},L.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.Error;e.pos<n;){var o=e.uint32();o>>>3==315977579?(r.errors&&r.errors.length||(r.errors=[]),r.errors.push(u.google.cloud.compute.v1.Errors.decode(e,e.uint32()))):e.skipType(7&o)}return r},L.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},L.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.errors&&e.hasOwnProperty("errors")){if(!Array.isArray(e.errors))return"errors: array expected";for(var t=0;t<e.errors.length;++t){var n=u.google.cloud.compute.v1.Errors.verify(e.errors[t]);if(n)return"errors."+n}}return null},L.fromObject=function(e){if(e instanceof u.google.cloud.compute.v1.Error)return e;var t=new u.google.cloud.compute.v1.Error;if(e.errors){if(!Array.isArray(e.errors))throw TypeError(".google.cloud.compute.v1.Error.errors: array expected");t.errors=[];for(var n=0;n<e.errors.length;++n){if("object"!=typeof e.errors[n])throw TypeError(".google.cloud.compute.v1.Error.errors: object expected");t.errors[n]=u.google.cloud.compute.v1.Errors.fromObject(e.errors[n])}}return t},L.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.errors=[]),e.errors&&e.errors.length){n.errors=[];for(var r=0;r<e.errors.length;++r)n.errors[r]=u.google.cloud.compute.v1.Errors.toObject(e.errors[r],t)}return n},L.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},L),i.Warnings=(d.prototype.code=null,d.prototype.data=c.emptyArray,d.prototype.message=null,Object.defineProperty(d.prototype,"_code",{get:c.oneOfGetter(e=["code"]),set:c.oneOfSetter(e)}),Object.defineProperty(d.prototype,"_message",{get:c.oneOfGetter(e=["message"]),set:c.oneOfSetter(e)}),d.create=function(e){return new d(e)},d.encode=function(e,t){if(t=t||a.create(),null!=e.code&&Object.hasOwnProperty.call(e,"code")&&t.uint32(24473448).int32(e.code),null!=e.data&&e.data.length)for(var n=0;n<e.data.length;++n)u.google.cloud.compute.v1.Data.encode(e.data[n],t.uint32(24608082).fork()).ldelim();return null!=e.message&&Object.hasOwnProperty.call(e,"message")&&t.uint32(3344433210).string(e.message),t},d.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},d.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.Warnings;e.pos<n;){var o=e.uint32();switch(o>>>3){case 3059181:r.code=e.int32();break;case 3076010:r.data&&r.data.length||(r.data=[]),r.data.push(u.google.cloud.compute.v1.Data.decode(e,e.uint32()));break;case 418054151:r.message=e.string();break;default:e.skipType(7&o)}}return r},d.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},d.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.code&&e.hasOwnProperty("code"))switch(e.code){default:return"code: enum value expected";case 0:case 150308440:case 391835586:case 346526230:case 369442967:case 451954443:case 175546307:case 329669423:case 417377419:case 344505463:case 324964999:case 383382887:case 464250446:case 243758146:case 417081265:case 105763924:case 30036744:case 3745539:case 496728641:case 168598460:case 275245642:case 268305617:case 390513439:case 13328052:}if(null!=e.data&&e.hasOwnProperty("data")){if(!Array.isArray(e.data))return"data: array expected";for(var t=0;t<e.data.length;++t){var n=u.google.cloud.compute.v1.Data.verify(e.data[t]);if(n)return"data."+n}}return null!=e.message&&e.hasOwnProperty("message")&&!c.isString(e.message)?"message: string expected":null},d.fromObject=function(e){if(e instanceof u.google.cloud.compute.v1.Warnings)return e;var t=new u.google.cloud.compute.v1.Warnings;switch(e.code){case"UNDEFINED_CODE":case 0:t.code=0;break;case"CLEANUP_FAILED":case 150308440:t.code=150308440;break;case"DEPRECATED_RESOURCE_USED":case 391835586:t.code=391835586;break;case"DEPRECATED_TYPE_USED":case 346526230:t.code=346526230;break;case"DISK_SIZE_LARGER_THAN_IMAGE_SIZE":case 369442967:t.code=369442967;break;case"EXPERIMENTAL_TYPE_USED":case 451954443:t.code=451954443;break;case"EXTERNAL_API_WARNING":case 175546307:t.code=175546307;break;case"FIELD_VALUE_OVERRIDEN":case 329669423:t.code=329669423;break;case"INJECTED_KERNELS_DEPRECATED":case 417377419:t.code=417377419;break;case"MISSING_TYPE_DEPENDENCY":case 344505463:t.code=344505463;break;case"NEXT_HOP_ADDRESS_NOT_ASSIGNED":case 324964999:t.code=324964999;break;case"NEXT_HOP_CANNOT_IP_FORWARD":case 383382887:t.code=383382887;break;case"NEXT_HOP_INSTANCE_NOT_FOUND":case 464250446:t.code=464250446;break;case"NEXT_HOP_INSTANCE_NOT_ON_NETWORK":case 243758146:t.code=243758146;break;case"NEXT_HOP_NOT_RUNNING":case 417081265:t.code=417081265;break;case"NOT_CRITICAL_ERROR":case 105763924:t.code=105763924;break;case"NO_RESULTS_ON_PAGE":case 30036744:t.code=30036744;break;case"REQUIRED_TOS_AGREEMENT":case 3745539:t.code=3745539;break;case"RESOURCE_IN_USE_BY_OTHER_RESOURCE_WARNING":case 496728641:t.code=496728641;break;case"RESOURCE_NOT_DELETED":case 168598460:t.code=168598460;break;case"SCHEMA_VALIDATION_IGNORED":case 275245642:t.code=275245642;break;case"SINGLE_INSTANCE_PROPERTY_TEMPLATE":case 268305617:t.code=268305617;break;case"UNDECLARED_PROPERTIES":case 390513439:t.code=390513439;break;case"UNREACHABLE":case 13328052:t.code=13328052}if(e.data){if(!Array.isArray(e.data))throw TypeError(".google.cloud.compute.v1.Warnings.data: array expected");t.data=[];for(var n=0;n<e.data.length;++n){if("object"!=typeof e.data[n])throw TypeError(".google.cloud.compute.v1.Warnings.data: object expected");t.data[n]=u.google.cloud.compute.v1.Data.fromObject(e.data[n])}}return null!=e.message&&(t.message=String(e.message)),t},d.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.data=[]),null!=e.code&&e.hasOwnProperty("code")&&(n.code=t.enums===String?u.google.cloud.compute.v1.Warnings.Code[e.code]:e.code,t.oneofs)&&(n._code="code"),e.data&&e.data.length){n.data=[];for(var r=0;r<e.data.length;++r)n.data[r]=u.google.cloud.compute.v1.Data.toObject(e.data[r],t)}return null!=e.message&&e.hasOwnProperty("message")&&(n.message=e.message,t.oneofs)&&(n._message="message"),n},d.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},d.Code=(e={},(t=Object.create(e))[e[0]="UNDEFINED_CODE"]=0,t[e[150308440]="CLEANUP_FAILED"]=150308440,t[e[391835586]="DEPRECATED_RESOURCE_USED"]=391835586,t[e[346526230]="DEPRECATED_TYPE_USED"]=346526230,t[e[369442967]="DISK_SIZE_LARGER_THAN_IMAGE_SIZE"]=369442967,t[e[451954443]="EXPERIMENTAL_TYPE_USED"]=451954443,t[e[175546307]="EXTERNAL_API_WARNING"]=175546307,t[e[329669423]="FIELD_VALUE_OVERRIDEN"]=329669423,t[e[417377419]="INJECTED_KERNELS_DEPRECATED"]=417377419,t[e[344505463]="MISSING_TYPE_DEPENDENCY"]=344505463,t[e[324964999]="NEXT_HOP_ADDRESS_NOT_ASSIGNED"]=324964999,t[e[383382887]="NEXT_HOP_CANNOT_IP_FORWARD"]=383382887,t[e[464250446]="NEXT_HOP_INSTANCE_NOT_FOUND"]=464250446,t[e[243758146]="NEXT_HOP_INSTANCE_NOT_ON_NETWORK"]=243758146,t[e[417081265]="NEXT_HOP_NOT_RUNNING"]=417081265,t[e[105763924]="NOT_CRITICAL_ERROR"]=105763924,t[e[30036744]="NO_RESULTS_ON_PAGE"]=30036744,t[e[3745539]="REQUIRED_TOS_AGREEMENT"]=3745539,t[e[496728641]="RESOURCE_IN_USE_BY_OTHER_RESOURCE_WARNING"]=496728641,t[e[168598460]="RESOURCE_NOT_DELETED"]=168598460,t[e[275245642]="SCHEMA_VALIDATION_IGNORED"]=275245642,t[e[268305617]="SINGLE_INSTANCE_PROPERTY_TEMPLATE"]=268305617,t[e[390513439]="UNDECLARED_PROPERTIES"]=390513439,t[e[13328052]="UNREACHABLE"]=13328052,t),d),i.Warning=(g.prototype.code=null,g.prototype.data=c.emptyArray,g.prototype.message=null,Object.defineProperty(g.prototype,"_code",{get:c.oneOfGetter(e=["code"]),set:c.oneOfSetter(e)}),Object.defineProperty(g.prototype,"_message",{get:c.oneOfGetter(e=["message"]),set:c.oneOfSetter(e)}),g.create=function(e){return new g(e)},g.encode=function(e,t){if(t=t||a.create(),null!=e.code&&Object.hasOwnProperty.call(e,"code")&&t.uint32(24473448).int32(e.code),null!=e.data&&e.data.length)for(var n=0;n<e.data.length;++n)u.google.cloud.compute.v1.Data.encode(e.data[n],t.uint32(24608082).fork()).ldelim();return null!=e.message&&Object.hasOwnProperty.call(e,"message")&&t.uint32(3344433210).string(e.message),t},g.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},g.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.Warning;e.pos<n;){var o=e.uint32();switch(o>>>3){case 3059181:r.code=e.int32();break;case 3076010:r.data&&r.data.length||(r.data=[]),r.data.push(u.google.cloud.compute.v1.Data.decode(e,e.uint32()));break;case 418054151:r.message=e.string();break;default:e.skipType(7&o)}}return r},g.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},g.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.code&&e.hasOwnProperty("code"))switch(e.code){default:return"code: enum value expected";case 0:case 150308440:case 391835586:case 346526230:case 369442967:case 451954443:case 175546307:case 329669423:case 417377419:case 481440678:case 344505463:case 324964999:case 383382887:case 464250446:case 243758146:case 417081265:case 105763924:case 30036744:case 39966469:case 3745539:case 496728641:case 168598460:case 275245642:case 268305617:case 390513439:case 13328052:}if(null!=e.data&&e.hasOwnProperty("data")){if(!Array.isArray(e.data))return"data: array expected";for(var t=0;t<e.data.length;++t){var n=u.google.cloud.compute.v1.Data.verify(e.data[t]);if(n)return"data."+n}}return null!=e.message&&e.hasOwnProperty("message")&&!c.isString(e.message)?"message: string expected":null},g.fromObject=function(e){if(e instanceof u.google.cloud.compute.v1.Warning)return e;var t=new u.google.cloud.compute.v1.Warning;switch(e.code){case"UNDEFINED_CODE":case 0:t.code=0;break;case"CLEANUP_FAILED":case 150308440:t.code=150308440;break;case"DEPRECATED_RESOURCE_USED":case 391835586:t.code=391835586;break;case"DEPRECATED_TYPE_USED":case 346526230:t.code=346526230;break;case"DISK_SIZE_LARGER_THAN_IMAGE_SIZE":case 369442967:t.code=369442967;break;case"EXPERIMENTAL_TYPE_USED":case 451954443:t.code=451954443;break;case"EXTERNAL_API_WARNING":case 175546307:t.code=175546307;break;case"FIELD_VALUE_OVERRIDEN":case 329669423:t.code=329669423;break;case"INJECTED_KERNELS_DEPRECATED":case 417377419:t.code=417377419;break;case"LARGE_DEPLOYMENT_WARNING":case 481440678:t.code=481440678;break;case"MISSING_TYPE_DEPENDENCY":case 344505463:t.code=344505463;break;case"NEXT_HOP_ADDRESS_NOT_ASSIGNED":case 324964999:t.code=324964999;break;case"NEXT_HOP_CANNOT_IP_FORWARD":case 383382887:t.code=383382887;break;case"NEXT_HOP_INSTANCE_NOT_FOUND":case 464250446:t.code=464250446;break;case"NEXT_HOP_INSTANCE_NOT_ON_NETWORK":case 243758146:t.code=243758146;break;case"NEXT_HOP_NOT_RUNNING":case 417081265:t.code=417081265;break;case"NOT_CRITICAL_ERROR":case 105763924:t.code=105763924;break;case"NO_RESULTS_ON_PAGE":case 30036744:t.code=30036744;break;case"PARTIAL_SUCCESS":case 39966469:t.code=39966469;break;case"REQUIRED_TOS_AGREEMENT":case 3745539:t.code=3745539;break;case"RESOURCE_IN_USE_BY_OTHER_RESOURCE_WARNING":case 496728641:t.code=496728641;break;case"RESOURCE_NOT_DELETED":case 168598460:t.code=168598460;break;case"SCHEMA_VALIDATION_IGNORED":case 275245642:t.code=275245642;break;case"SINGLE_INSTANCE_PROPERTY_TEMPLATE":case 268305617:t.code=268305617;break;case"UNDECLARED_PROPERTIES":case 390513439:t.code=390513439;break;case"UNREACHABLE":case 13328052:t.code=13328052}if(e.data){if(!Array.isArray(e.data))throw TypeError(".google.cloud.compute.v1.Warning.data: array expected");t.data=[];for(var n=0;n<e.data.length;++n){if("object"!=typeof e.data[n])throw TypeError(".google.cloud.compute.v1.Warning.data: object expected");t.data[n]=u.google.cloud.compute.v1.Data.fromObject(e.data[n])}}return null!=e.message&&(t.message=String(e.message)),t},g.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.data=[]),null!=e.code&&e.hasOwnProperty("code")&&(n.code=t.enums===String?u.google.cloud.compute.v1.Warning.Code[e.code]:e.code,t.oneofs)&&(n._code="code"),e.data&&e.data.length){n.data=[];for(var r=0;r<e.data.length;++r)n.data[r]=u.google.cloud.compute.v1.Data.toObject(e.data[r],t)}return null!=e.message&&e.hasOwnProperty("message")&&(n.message=e.message,t.oneofs)&&(n._message="message"),n},g.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},g.Code=(e={},(t=Object.create(e))[e[0]="UNDEFINED_CODE"]=0,t[e[150308440]="CLEANUP_FAILED"]=150308440,t[e[391835586]="DEPRECATED_RESOURCE_USED"]=391835586,t[e[346526230]="DEPRECATED_TYPE_USED"]=346526230,t[e[369442967]="DISK_SIZE_LARGER_THAN_IMAGE_SIZE"]=369442967,t[e[451954443]="EXPERIMENTAL_TYPE_USED"]=451954443,t[e[175546307]="EXTERNAL_API_WARNING"]=175546307,t[e[329669423]="FIELD_VALUE_OVERRIDEN"]=329669423,t[e[417377419]="INJECTED_KERNELS_DEPRECATED"]=417377419,t[e[481440678]="LARGE_DEPLOYMENT_WARNING"]=481440678,t[e[344505463]="MISSING_TYPE_DEPENDENCY"]=344505463,t[e[324964999]="NEXT_HOP_ADDRESS_NOT_ASSIGNED"]=324964999,t[e[383382887]="NEXT_HOP_CANNOT_IP_FORWARD"]=383382887,t[e[464250446]="NEXT_HOP_INSTANCE_NOT_FOUND"]=464250446,t[e[243758146]="NEXT_HOP_INSTANCE_NOT_ON_NETWORK"]=243758146,t[e[417081265]="NEXT_HOP_NOT_RUNNING"]=417081265,t[e[105763924]="NOT_CRITICAL_ERROR"]=105763924,t[e[30036744]="NO_RESULTS_ON_PAGE"]=30036744,t[e[39966469]="PARTIAL_SUCCESS"]=39966469,t[e[3745539]="REQUIRED_TOS_AGREEMENT"]=3745539,t[e[496728641]="RESOURCE_IN_USE_BY_OTHER_RESOURCE_WARNING"]=496728641,t[e[168598460]="RESOURCE_NOT_DELETED"]=168598460,t[e[275245642]="SCHEMA_VALIDATION_IGNORED"]=275245642,t[e[268305617]="SINGLE_INSTANCE_PROPERTY_TEMPLATE"]=268305617,t[e[390513439]="UNDECLARED_PROPERTIES"]=390513439,t[e[13328052]="UNREACHABLE"]=13328052,t),g),i.Data=(f.prototype.key=null,f.prototype.value=null,Object.defineProperty(f.prototype,"_key",{get:c.oneOfGetter(e=["key"]),set:c.oneOfSetter(e)}),Object.defineProperty(f.prototype,"_value",{get:c.oneOfGetter(e=["value"]),set:c.oneOfSetter(e)}),f.create=function(e){return new f(e)},f.encode=function(e,t){return t=t||a.create(),null!=e.key&&Object.hasOwnProperty.call(e,"key")&&t.uint32(848634).string(e.key),null!=e.value&&Object.hasOwnProperty.call(e,"value")&&t.uint32(895781770).string(e.value),t},f.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},f.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.Data;e.pos<n;){var o=e.uint32();switch(o>>>3){case 106079:r.key=e.string();break;case 111972721:r.value=e.string();break;default:e.skipType(7&o)}}return r},f.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},f.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.key&&e.hasOwnProperty("key")&&!c.isString(e.key)?"key: string expected":null!=e.value&&e.hasOwnProperty("value")&&!c.isString(e.value)?"value: string expected":null},f.fromObject=function(e){var t;return e instanceof u.google.cloud.compute.v1.Data?e:(t=new u.google.cloud.compute.v1.Data,null!=e.key&&(t.key=String(e.key)),null!=e.value&&(t.value=String(e.value)),t)},f.toObject=function(e,t){t=t||{};var n={};return null!=e.key&&e.hasOwnProperty("key")&&(n.key=e.key,t.oneofs)&&(n._key="key"),null!=e.value&&e.hasOwnProperty("value")&&(n.value=e.value,t.oneofs)&&(n._value="value"),n},f.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},f),i.OperationsScopedList=(y.prototype.operations=c.emptyArray,y.prototype.warning=null,Object.defineProperty(y.prototype,"_warning",{get:c.oneOfGetter(t=["warning"]),set:c.oneOfSetter(t)}),y.create=function(e){return new y(e)},y.encode=function(e,t){if(t=t||a.create(),null!=e.operations&&e.operations.length)for(var n=0;n<e.operations.length;++n)u.google.cloud.compute.v1.Operation.encode(e.operations[n],t.uint32(33472354).fork()).ldelim();return null!=e.warning&&Object.hasOwnProperty.call(e,"warning")&&u.google.cloud.compute.v1.Warning.encode(e.warning,t.uint32(405634274).fork()).ldelim(),t},y.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},y.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.OperationsScopedList;e.pos<n;){var o=e.uint32();switch(o>>>3){case 4184044:r.operations&&r.operations.length||(r.operations=[]),r.operations.push(u.google.cloud.compute.v1.Operation.decode(e,e.uint32()));break;case 50704284:r.warning=u.google.cloud.compute.v1.Warning.decode(e,e.uint32());break;default:e.skipType(7&o)}}return r},y.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},y.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.operations&&e.hasOwnProperty("operations")){if(!Array.isArray(e.operations))return"operations: array expected";for(var t,n=0;n<e.operations.length;++n)if(t=u.google.cloud.compute.v1.Operation.verify(e.operations[n]))return"operations."+t}if(null!=e.warning&&e.hasOwnProperty("warning")&&(t=u.google.cloud.compute.v1.Warning.verify(e.warning)))return"warning."+t;return null},y.fromObject=function(e){if(e instanceof u.google.cloud.compute.v1.OperationsScopedList)return e;var t=new u.google.cloud.compute.v1.OperationsScopedList;if(e.operations){if(!Array.isArray(e.operations))throw TypeError(".google.cloud.compute.v1.OperationsScopedList.operations: array expected");t.operations=[];for(var n=0;n<e.operations.length;++n){if("object"!=typeof e.operations[n])throw TypeError(".google.cloud.compute.v1.OperationsScopedList.operations: object expected");t.operations[n]=u.google.cloud.compute.v1.Operation.fromObject(e.operations[n])}}if(null!=e.warning){if("object"!=typeof e.warning)throw TypeError(".google.cloud.compute.v1.OperationsScopedList.warning: object expected");t.warning=u.google.cloud.compute.v1.Warning.fromObject(e.warning)}return t},y.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.operations=[]),e.operations&&e.operations.length){n.operations=[];for(var r=0;r<e.operations.length;++r)n.operations[r]=u.google.cloud.compute.v1.Operation.toObject(e.operations[r],t)}return null!=e.warning&&e.hasOwnProperty("warning")&&(n.warning=u.google.cloud.compute.v1.Warning.toObject(e.warning,t),t.oneofs)&&(n._warning="warning"),n},y.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},y),i.OperationAggregatedList=(O.prototype.id=null,O.prototype.items=c.emptyObject,O.prototype.kind=null,O.prototype.nextPageToken=null,O.prototype.selfLink=null,O.prototype.unreachables=c.emptyArray,O.prototype.warning=null,Object.defineProperty(O.prototype,"_id",{get:c.oneOfGetter(e=["id"]),set:c.oneOfSetter(e)}),Object.defineProperty(O.prototype,"_kind",{get:c.oneOfGetter(e=["kind"]),set:c.oneOfSetter(e)}),Object.defineProperty(O.prototype,"_nextPageToken",{get:c.oneOfGetter(e=["nextPageToken"]),set:c.oneOfSetter(e)}),Object.defineProperty(O.prototype,"_selfLink",{get:c.oneOfGetter(e=["selfLink"]),set:c.oneOfSetter(e)}),Object.defineProperty(O.prototype,"_warning",{get:c.oneOfGetter(e=["warning"]),set:c.oneOfSetter(e)}),O.create=function(e){return new O(e)},O.encode=function(e,t){if(t=t||a.create(),null!=e.id&&Object.hasOwnProperty.call(e,"id")&&t.uint32(26842).string(e.id),null!=e.kind&&Object.hasOwnProperty.call(e,"kind")&&t.uint32(26336418).string(e.kind),null!=e.warning&&Object.hasOwnProperty.call(e,"warning")&&u.google.cloud.compute.v1.Warning.encode(e.warning,t.uint32(405634274).fork()).ldelim(),null!=e.nextPageToken&&Object.hasOwnProperty.call(e,"nextPageToken")&&t.uint32(638380202).string(e.nextPageToken),null!=e.items&&Object.hasOwnProperty.call(e,"items"))for(var n=Object.keys(e.items),r=0;r<n.length;++r)t.uint32(804208130).fork().uint32(10).string(n[r]),u.google.cloud.compute.v1.OperationsScopedList.encode(e.items[n[r]],t.uint32(18).fork()).ldelim().ldelim();if(null!=e.unreachables&&e.unreachables.length)for(r=0;r<e.unreachables.length;++r)t.uint32(1946976506).string(e.unreachables[r]);return null!=e.selfLink&&Object.hasOwnProperty.call(e,"selfLink")&&t.uint32(3649718378).string(e.selfLink),t},O.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},O.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.OperationAggregatedList;e.pos<n;){var o=e.uint32();switch(o>>>3){case 3355:r.id=e.string();break;case 100526016:r.items===c.emptyObject&&(r.items={});for(var i=e.uint32()+e.pos,a="",p=null;e.pos<i;){var l=e.uint32();switch(l>>>3){case 1:a=e.string();break;case 2:p=u.google.cloud.compute.v1.OperationsScopedList.decode(e,e.uint32());break;default:e.skipType(7&l)}}r.items[a]=p;break;case 3292052:r.kind=e.string();break;case 79797525:r.nextPageToken=e.string();break;case 456214797:r.selfLink=e.string();break;case 243372063:r.unreachables&&r.unreachables.length||(r.unreachables=[]),r.unreachables.push(e.string());break;case 50704284:r.warning=u.google.cloud.compute.v1.Warning.decode(e,e.uint32());break;default:e.skipType(7&o)}}return r},O.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},O.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.id&&e.hasOwnProperty("id")&&!c.isString(e.id))return"id: string expected";if(null!=e.items&&e.hasOwnProperty("items")){if(!c.isObject(e.items))return"items: object expected";for(var t,n=Object.keys(e.items),r=0;r<n.length;++r)if(t=u.google.cloud.compute.v1.OperationsScopedList.verify(e.items[n[r]]))return"items."+t}if(null!=e.kind&&e.hasOwnProperty("kind")&&!c.isString(e.kind))return"kind: string expected";if(null!=e.nextPageToken&&e.hasOwnProperty("nextPageToken")&&!c.isString(e.nextPageToken))return"nextPageToken: string expected";if(null!=e.selfLink&&e.hasOwnProperty("selfLink")&&!c.isString(e.selfLink))return"selfLink: string expected";if(null!=e.unreachables&&e.hasOwnProperty("unreachables")){if(!Array.isArray(e.unreachables))return"unreachables: array expected";for(r=0;r<e.unreachables.length;++r)if(!c.isString(e.unreachables[r]))return"unreachables: string[] expected"}if(null!=e.warning&&e.hasOwnProperty("warning")&&(t=u.google.cloud.compute.v1.Warning.verify(e.warning)))return"warning."+t;return null},O.fromObject=function(e){if(e instanceof u.google.cloud.compute.v1.OperationAggregatedList)return e;var t=new u.google.cloud.compute.v1.OperationAggregatedList;if(null!=e.id&&(t.id=String(e.id)),e.items){if("object"!=typeof e.items)throw TypeError(".google.cloud.compute.v1.OperationAggregatedList.items: object expected");t.items={};for(var n=Object.keys(e.items),r=0;r<n.length;++r){if("object"!=typeof e.items[n[r]])throw TypeError(".google.cloud.compute.v1.OperationAggregatedList.items: object expected");t.items[n[r]]=u.google.cloud.compute.v1.OperationsScopedList.fromObject(e.items[n[r]])}}if(null!=e.kind&&(t.kind=String(e.kind)),null!=e.nextPageToken&&(t.nextPageToken=String(e.nextPageToken)),null!=e.selfLink&&(t.selfLink=String(e.selfLink)),e.unreachables){if(!Array.isArray(e.unreachables))throw TypeError(".google.cloud.compute.v1.OperationAggregatedList.unreachables: array expected");t.unreachables=[];for(r=0;r<e.unreachables.length;++r)t.unreachables[r]=String(e.unreachables[r])}if(null!=e.warning){if("object"!=typeof e.warning)throw TypeError(".google.cloud.compute.v1.OperationAggregatedList.warning: object expected");t.warning=u.google.cloud.compute.v1.Warning.fromObject(e.warning)}return t},O.toObject=function(e,t){var n,r={};if(((t=t||{}).arrays||t.defaults)&&(r.unreachables=[]),(t.objects||t.defaults)&&(r.items={}),null!=e.id&&e.hasOwnProperty("id")&&(r.id=e.id,t.oneofs)&&(r._id="id"),null!=e.kind&&e.hasOwnProperty("kind")&&(r.kind=e.kind,t.oneofs)&&(r._kind="kind"),null!=e.warning&&e.hasOwnProperty("warning")&&(r.warning=u.google.cloud.compute.v1.Warning.toObject(e.warning,t),t.oneofs)&&(r._warning="warning"),null!=e.nextPageToken&&e.hasOwnProperty("nextPageToken")&&(r.nextPageToken=e.nextPageToken,t.oneofs)&&(r._nextPageToken="nextPageToken"),e.items&&(n=Object.keys(e.items)).length){r.items={};for(var o=0;o<n.length;++o)r.items[n[o]]=u.google.cloud.compute.v1.OperationsScopedList.toObject(e.items[n[o]],t)}if(e.unreachables&&e.unreachables.length){r.unreachables=[];for(o=0;o<e.unreachables.length;++o)r.unreachables[o]=e.unreachables[o]}return null!=e.selfLink&&e.hasOwnProperty("selfLink")&&(r.selfLink=e.selfLink,t.oneofs)&&(r._selfLink="selfLink"),r},O.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},O),i.GetRegionOperationRequest=(B.prototype.operation="",B.prototype.project="",B.prototype.region="",B.create=function(e){return new B(e)},B.encode=function(e,t){return t=t||a.create(),null!=e.operation&&Object.hasOwnProperty.call(e,"operation")&&t.uint32(416721722).string(e.operation),null!=e.region&&Object.hasOwnProperty.call(e,"region")&&t.uint32(1111570338).string(e.region),null!=e.project&&Object.hasOwnProperty.call(e,"project")&&t.uint32(1820481738).string(e.project),t},B.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},B.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.GetRegionOperationRequest;e.pos<n;){var o=e.uint32();switch(o>>>3){case 52090215:r.operation=e.string();break;case 227560217:r.project=e.string();break;case 138946292:r.region=e.string();break;default:e.skipType(7&o)}}return r},B.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},B.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.operation&&e.hasOwnProperty("operation")&&!c.isString(e.operation)?"operation: string expected":null!=e.project&&e.hasOwnProperty("project")&&!c.isString(e.project)?"project: string expected":null!=e.region&&e.hasOwnProperty("region")&&!c.isString(e.region)?"region: string expected":null},B.fromObject=function(e){var t;return e instanceof u.google.cloud.compute.v1.GetRegionOperationRequest?e:(t=new u.google.cloud.compute.v1.GetRegionOperationRequest,null!=e.operation&&(t.operation=String(e.operation)),null!=e.project&&(t.project=String(e.project)),null!=e.region&&(t.region=String(e.region)),t)},B.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.operation="",n.region="",n.project=""),null!=e.operation&&e.hasOwnProperty("operation")&&(n.operation=e.operation),null!=e.region&&e.hasOwnProperty("region")&&(n.region=e.region),null!=e.project&&e.hasOwnProperty("project")&&(n.project=e.project),n},B.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},B),i.DeleteRegionOperationRequest=(V.prototype.operation="",V.prototype.project="",V.prototype.region="",V.create=function(e){return new V(e)},V.encode=function(e,t){return t=t||a.create(),null!=e.operation&&Object.hasOwnProperty.call(e,"operation")&&t.uint32(416721722).string(e.operation),null!=e.region&&Object.hasOwnProperty.call(e,"region")&&t.uint32(1111570338).string(e.region),null!=e.project&&Object.hasOwnProperty.call(e,"project")&&t.uint32(1820481738).string(e.project),t},V.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},V.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.DeleteRegionOperationRequest;e.pos<n;){var o=e.uint32();switch(o>>>3){case 52090215:r.operation=e.string();break;case 227560217:r.project=e.string();break;case 138946292:r.region=e.string();break;default:e.skipType(7&o)}}return r},V.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},V.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.operation&&e.hasOwnProperty("operation")&&!c.isString(e.operation)?"operation: string expected":null!=e.project&&e.hasOwnProperty("project")&&!c.isString(e.project)?"project: string expected":null!=e.region&&e.hasOwnProperty("region")&&!c.isString(e.region)?"region: string expected":null},V.fromObject=function(e){var t;return e instanceof u.google.cloud.compute.v1.DeleteRegionOperationRequest?e:(t=new u.google.cloud.compute.v1.DeleteRegionOperationRequest,null!=e.operation&&(t.operation=String(e.operation)),null!=e.project&&(t.project=String(e.project)),null!=e.region&&(t.region=String(e.region)),t)},V.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.operation="",n.region="",n.project=""),null!=e.operation&&e.hasOwnProperty("operation")&&(n.operation=e.operation),null!=e.region&&e.hasOwnProperty("region")&&(n.region=e.region),null!=e.project&&e.hasOwnProperty("project")&&(n.project=e.project),n},V.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},V),i.DeleteRegionOperationResponse=(F.create=function(e){return new F(e)},F.encode=function(e,t){return t=t||a.create()},F.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},F.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,t=new u.google.cloud.compute.v1.DeleteRegionOperationResponse;e.pos<n;){var r=e.uint32();e.skipType(7&r)}return t},F.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},F.verify=function(e){return"object"!=typeof e||null===e?"object expected":null},F.fromObject=function(e){return e instanceof u.google.cloud.compute.v1.DeleteRegionOperationResponse?e:new u.google.cloud.compute.v1.DeleteRegionOperationResponse},F.toObject=function(){return{}},F.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},F),i.ListRegionOperationsRequest=(h.prototype.filter=null,h.prototype.maxResults=null,h.prototype.orderBy=null,h.prototype.pageToken=null,h.prototype.project="",h.prototype.region="",h.prototype.returnPartialSuccess=null,Object.defineProperty(h.prototype,"_filter",{get:c.oneOfGetter(t=["filter"]),set:c.oneOfSetter(t)}),Object.defineProperty(h.prototype,"_maxResults",{get:c.oneOfGetter(t=["maxResults"]),set:c.oneOfSetter(t)}),Object.defineProperty(h.prototype,"_orderBy",{get:c.oneOfGetter(t=["orderBy"]),set:c.oneOfSetter(t)}),Object.defineProperty(h.prototype,"_pageToken",{get:c.oneOfGetter(t=["pageToken"]),set:c.oneOfSetter(t)}),Object.defineProperty(h.prototype,"_returnPartialSuccess",{get:c.oneOfGetter(t=["returnPartialSuccess"]),set:c.oneOfSetter(t)}),h.create=function(e){return new h(e)},h.encode=function(e,t){return t=t||a.create(),null!=e.pageToken&&Object.hasOwnProperty.call(e,"pageToken")&&t.uint32(159957578).string(e.pageToken),null!=e.maxResults&&Object.hasOwnProperty.call(e,"maxResults")&&t.uint32(437723352).uint32(e.maxResults),null!=e.region&&Object.hasOwnProperty.call(e,"region")&&t.uint32(1111570338).string(e.region),null!=e.orderBy&&Object.hasOwnProperty.call(e,"orderBy")&&t.uint32(1284503362).string(e.orderBy),null!=e.project&&Object.hasOwnProperty.call(e,"project")&&t.uint32(1820481738).string(e.project),null!=e.filter&&Object.hasOwnProperty.call(e,"filter")&&t.uint32(2688965570).string(e.filter),null!=e.returnPartialSuccess&&Object.hasOwnProperty.call(e,"returnPartialSuccess")&&t.uint32(4137587120).bool(e.returnPartialSuccess),t},h.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},h.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.ListRegionOperationsRequest;e.pos<n;){var o=e.uint32();switch(o>>>3){case 336120696:r.filter=e.string();break;case 54715419:r.maxResults=e.uint32();break;case 160562920:r.orderBy=e.string();break;case 19994697:r.pageToken=e.string();break;case 227560217:r.project=e.string();break;case 138946292:r.region=e.string();break;case 517198390:r.returnPartialSuccess=e.bool();break;default:e.skipType(7&o)}}return r},h.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},h.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.filter&&e.hasOwnProperty("filter")&&!c.isString(e.filter)?"filter: string expected":null!=e.maxResults&&e.hasOwnProperty("maxResults")&&!c.isInteger(e.maxResults)?"maxResults: integer expected":null!=e.orderBy&&e.hasOwnProperty("orderBy")&&!c.isString(e.orderBy)?"orderBy: string expected":null!=e.pageToken&&e.hasOwnProperty("pageToken")&&!c.isString(e.pageToken)?"pageToken: string expected":null!=e.project&&e.hasOwnProperty("project")&&!c.isString(e.project)?"project: string expected":null!=e.region&&e.hasOwnProperty("region")&&!c.isString(e.region)?"region: string expected":null!=e.returnPartialSuccess&&e.hasOwnProperty("returnPartialSuccess")&&"boolean"!=typeof e.returnPartialSuccess?"returnPartialSuccess: boolean expected":null},h.fromObject=function(e){var t;return e instanceof u.google.cloud.compute.v1.ListRegionOperationsRequest?e:(t=new u.google.cloud.compute.v1.ListRegionOperationsRequest,null!=e.filter&&(t.filter=String(e.filter)),null!=e.maxResults&&(t.maxResults=e.maxResults>>>0),null!=e.orderBy&&(t.orderBy=String(e.orderBy)),null!=e.pageToken&&(t.pageToken=String(e.pageToken)),null!=e.project&&(t.project=String(e.project)),null!=e.region&&(t.region=String(e.region)),null!=e.returnPartialSuccess&&(t.returnPartialSuccess=Boolean(e.returnPartialSuccess)),t)},h.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.region="",n.project=""),null!=e.pageToken&&e.hasOwnProperty("pageToken")&&(n.pageToken=e.pageToken,t.oneofs)&&(n._pageToken="pageToken"),null!=e.maxResults&&e.hasOwnProperty("maxResults")&&(n.maxResults=e.maxResults,t.oneofs)&&(n._maxResults="maxResults"),null!=e.region&&e.hasOwnProperty("region")&&(n.region=e.region),null!=e.orderBy&&e.hasOwnProperty("orderBy")&&(n.orderBy=e.orderBy,t.oneofs)&&(n._orderBy="orderBy"),null!=e.project&&e.hasOwnProperty("project")&&(n.project=e.project),null!=e.filter&&e.hasOwnProperty("filter")&&(n.filter=e.filter,t.oneofs)&&(n._filter="filter"),null!=e.returnPartialSuccess&&e.hasOwnProperty("returnPartialSuccess")&&(n.returnPartialSuccess=e.returnPartialSuccess,t.oneofs)&&(n._returnPartialSuccess="returnPartialSuccess"),n},h.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},h),i.OperationList=(b.prototype.id=null,b.prototype.items=c.emptyArray,b.prototype.kind=null,b.prototype.nextPageToken=null,b.prototype.selfLink=null,b.prototype.warning=null,Object.defineProperty(b.prototype,"_id",{get:c.oneOfGetter(e=["id"]),set:c.oneOfSetter(e)}),Object.defineProperty(b.prototype,"_kind",{get:c.oneOfGetter(e=["kind"]),set:c.oneOfSetter(e)}),Object.defineProperty(b.prototype,"_nextPageToken",{get:c.oneOfGetter(e=["nextPageToken"]),set:c.oneOfSetter(e)}),Object.defineProperty(b.prototype,"_selfLink",{get:c.oneOfGetter(e=["selfLink"]),set:c.oneOfSetter(e)}),Object.defineProperty(b.prototype,"_warning",{get:c.oneOfGetter(e=["warning"]),set:c.oneOfSetter(e)}),b.create=function(e){return new b(e)},b.encode=function(e,t){if(t=t||a.create(),null!=e.id&&Object.hasOwnProperty.call(e,"id")&&t.uint32(26842).string(e.id),null!=e.kind&&Object.hasOwnProperty.call(e,"kind")&&t.uint32(26336418).string(e.kind),null!=e.warning&&Object.hasOwnProperty.call(e,"warning")&&u.google.cloud.compute.v1.Warning.encode(e.warning,t.uint32(405634274).fork()).ldelim(),null!=e.nextPageToken&&Object.hasOwnProperty.call(e,"nextPageToken")&&t.uint32(638380202).string(e.nextPageToken),null!=e.items&&e.items.length)for(var n=0;n<e.items.length;++n)u.google.cloud.compute.v1.Operation.encode(e.items[n],t.uint32(804208130).fork()).ldelim();return null!=e.selfLink&&Object.hasOwnProperty.call(e,"selfLink")&&t.uint32(3649718378).string(e.selfLink),t},b.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},b.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.OperationList;e.pos<n;){var o=e.uint32();switch(o>>>3){case 3355:r.id=e.string();break;case 100526016:r.items&&r.items.length||(r.items=[]),r.items.push(u.google.cloud.compute.v1.Operation.decode(e,e.uint32()));break;case 3292052:r.kind=e.string();break;case 79797525:r.nextPageToken=e.string();break;case 456214797:r.selfLink=e.string();break;case 50704284:r.warning=u.google.cloud.compute.v1.Warning.decode(e,e.uint32());break;default:e.skipType(7&o)}}return r},b.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},b.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.id&&e.hasOwnProperty("id")&&!c.isString(e.id))return"id: string expected";if(null!=e.items&&e.hasOwnProperty("items")){if(!Array.isArray(e.items))return"items: array expected";for(var t,n=0;n<e.items.length;++n)if(t=u.google.cloud.compute.v1.Operation.verify(e.items[n]))return"items."+t}if(null!=e.kind&&e.hasOwnProperty("kind")&&!c.isString(e.kind))return"kind: string expected";if(null!=e.nextPageToken&&e.hasOwnProperty("nextPageToken")&&!c.isString(e.nextPageToken))return"nextPageToken: string expected";if(null!=e.selfLink&&e.hasOwnProperty("selfLink")&&!c.isString(e.selfLink))return"selfLink: string expected";if(null!=e.warning&&e.hasOwnProperty("warning")&&(t=u.google.cloud.compute.v1.Warning.verify(e.warning)))return"warning."+t;return null},b.fromObject=function(e){if(e instanceof u.google.cloud.compute.v1.OperationList)return e;var t=new u.google.cloud.compute.v1.OperationList;if(null!=e.id&&(t.id=String(e.id)),e.items){if(!Array.isArray(e.items))throw TypeError(".google.cloud.compute.v1.OperationList.items: array expected");t.items=[];for(var n=0;n<e.items.length;++n){if("object"!=typeof e.items[n])throw TypeError(".google.cloud.compute.v1.OperationList.items: object expected");t.items[n]=u.google.cloud.compute.v1.Operation.fromObject(e.items[n])}}if(null!=e.kind&&(t.kind=String(e.kind)),null!=e.nextPageToken&&(t.nextPageToken=String(e.nextPageToken)),null!=e.selfLink&&(t.selfLink=String(e.selfLink)),null!=e.warning){if("object"!=typeof e.warning)throw TypeError(".google.cloud.compute.v1.OperationList.warning: object expected");t.warning=u.google.cloud.compute.v1.Warning.fromObject(e.warning)}return t},b.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.items=[]),null!=e.id&&e.hasOwnProperty("id")&&(n.id=e.id,t.oneofs)&&(n._id="id"),null!=e.kind&&e.hasOwnProperty("kind")&&(n.kind=e.kind,t.oneofs)&&(n._kind="kind"),null!=e.warning&&e.hasOwnProperty("warning")&&(n.warning=u.google.cloud.compute.v1.Warning.toObject(e.warning,t),t.oneofs)&&(n._warning="warning"),null!=e.nextPageToken&&e.hasOwnProperty("nextPageToken")&&(n.nextPageToken=e.nextPageToken,t.oneofs)&&(n._nextPageToken="nextPageToken"),e.items&&e.items.length){n.items=[];for(var r=0;r<e.items.length;++r)n.items[r]=u.google.cloud.compute.v1.Operation.toObject(e.items[r],t)}return null!=e.selfLink&&e.hasOwnProperty("selfLink")&&(n.selfLink=e.selfLink,t.oneofs)&&(n._selfLink="selfLink"),n},b.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},b),i.WaitRegionOperationRequest=(U.prototype.operation="",U.prototype.project="",U.prototype.region="",U.create=function(e){return new U(e)},U.encode=function(e,t){return t=t||a.create(),null!=e.operation&&Object.hasOwnProperty.call(e,"operation")&&t.uint32(416721722).string(e.operation),null!=e.region&&Object.hasOwnProperty.call(e,"region")&&t.uint32(1111570338).string(e.region),null!=e.project&&Object.hasOwnProperty.call(e,"project")&&t.uint32(1820481738).string(e.project),t},U.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},U.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.WaitRegionOperationRequest;e.pos<n;){var o=e.uint32();switch(o>>>3){case 52090215:r.operation=e.string();break;case 227560217:r.project=e.string();break;case 138946292:r.region=e.string();break;default:e.skipType(7&o)}}return r},U.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},U.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.operation&&e.hasOwnProperty("operation")&&!c.isString(e.operation)?"operation: string expected":null!=e.project&&e.hasOwnProperty("project")&&!c.isString(e.project)?"project: string expected":null!=e.region&&e.hasOwnProperty("region")&&!c.isString(e.region)?"region: string expected":null},U.fromObject=function(e){var t;return e instanceof u.google.cloud.compute.v1.WaitRegionOperationRequest?e:(t=new u.google.cloud.compute.v1.WaitRegionOperationRequest,null!=e.operation&&(t.operation=String(e.operation)),null!=e.project&&(t.project=String(e.project)),null!=e.region&&(t.region=String(e.region)),t)},U.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.operation="",n.region="",n.project=""),null!=e.operation&&e.hasOwnProperty("operation")&&(n.operation=e.operation),null!=e.region&&e.hasOwnProperty("region")&&(n.region=e.region),null!=e.project&&e.hasOwnProperty("project")&&(n.project=e.project),n},U.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},U),i.DeleteZoneOperationRequest=(M.prototype.operation="",M.prototype.project="",M.prototype.zone="",M.create=function(e){return new M(e)},M.encode=function(e,t){return t=t||a.create(),null!=e.zone&&Object.hasOwnProperty.call(e,"zone")&&t.uint32(29957474).string(e.zone),null!=e.operation&&Object.hasOwnProperty.call(e,"operation")&&t.uint32(416721722).string(e.operation),null!=e.project&&Object.hasOwnProperty.call(e,"project")&&t.uint32(1820481738).string(e.project),t},M.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},M.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.DeleteZoneOperationRequest;e.pos<n;){var o=e.uint32();switch(o>>>3){case 52090215:r.operation=e.string();break;case 227560217:r.project=e.string();break;case 3744684:r.zone=e.string();break;default:e.skipType(7&o)}}return r},M.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},M.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.operation&&e.hasOwnProperty("operation")&&!c.isString(e.operation)?"operation: string expected":null!=e.project&&e.hasOwnProperty("project")&&!c.isString(e.project)?"project: string expected":null!=e.zone&&e.hasOwnProperty("zone")&&!c.isString(e.zone)?"zone: string expected":null},M.fromObject=function(e){var t;return e instanceof u.google.cloud.compute.v1.DeleteZoneOperationRequest?e:(t=new u.google.cloud.compute.v1.DeleteZoneOperationRequest,null!=e.operation&&(t.operation=String(e.operation)),null!=e.project&&(t.project=String(e.project)),null!=e.zone&&(t.zone=String(e.zone)),t)},M.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.zone="",n.operation="",n.project=""),null!=e.zone&&e.hasOwnProperty("zone")&&(n.zone=e.zone),null!=e.operation&&e.hasOwnProperty("operation")&&(n.operation=e.operation),null!=e.project&&e.hasOwnProperty("project")&&(n.project=e.project),n},M.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},M),i.DeleteZoneOperationResponse=(z.create=function(e){return new z(e)},z.encode=function(e,t){return t=t||a.create()},z.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},z.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,t=new u.google.cloud.compute.v1.DeleteZoneOperationResponse;e.pos<n;){var r=e.uint32();e.skipType(7&r)}return t},z.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},z.verify=function(e){return"object"!=typeof e||null===e?"object expected":null},z.fromObject=function(e){return e instanceof u.google.cloud.compute.v1.DeleteZoneOperationResponse?e:new u.google.cloud.compute.v1.DeleteZoneOperationResponse},z.toObject=function(){return{}},z.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},z),i.GetZoneOperationRequest=(J.prototype.operation="",J.prototype.project="",J.prototype.zone="",J.create=function(e){return new J(e)},J.encode=function(e,t){return t=t||a.create(),null!=e.zone&&Object.hasOwnProperty.call(e,"zone")&&t.uint32(29957474).string(e.zone),null!=e.operation&&Object.hasOwnProperty.call(e,"operation")&&t.uint32(416721722).string(e.operation),null!=e.project&&Object.hasOwnProperty.call(e,"project")&&t.uint32(1820481738).string(e.project),t},J.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},J.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.GetZoneOperationRequest;e.pos<n;){var o=e.uint32();switch(o>>>3){case 52090215:r.operation=e.string();break;case 227560217:r.project=e.string();break;case 3744684:r.zone=e.string();break;default:e.skipType(7&o)}}return r},J.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},J.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.operation&&e.hasOwnProperty("operation")&&!c.isString(e.operation)?"operation: string expected":null!=e.project&&e.hasOwnProperty("project")&&!c.isString(e.project)?"project: string expected":null!=e.zone&&e.hasOwnProperty("zone")&&!c.isString(e.zone)?"zone: string expected":null},J.fromObject=function(e){var t;return e instanceof u.google.cloud.compute.v1.GetZoneOperationRequest?e:(t=new u.google.cloud.compute.v1.GetZoneOperationRequest,null!=e.operation&&(t.operation=String(e.operation)),null!=e.project&&(t.project=String(e.project)),null!=e.zone&&(t.zone=String(e.zone)),t)},J.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.zone="",n.operation="",n.project=""),null!=e.zone&&e.hasOwnProperty("zone")&&(n.zone=e.zone),null!=e.operation&&e.hasOwnProperty("operation")&&(n.operation=e.operation),null!=e.project&&e.hasOwnProperty("project")&&(n.project=e.project),n},J.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},J),i.ListZoneOperationsRequest=(m.prototype.filter=null,m.prototype.maxResults=null,m.prototype.orderBy=null,m.prototype.pageToken=null,m.prototype.project="",m.prototype.returnPartialSuccess=null,m.prototype.zone="",Object.defineProperty(m.prototype,"_filter",{get:c.oneOfGetter(t=["filter"]),set:c.oneOfSetter(t)}),Object.defineProperty(m.prototype,"_maxResults",{get:c.oneOfGetter(t=["maxResults"]),set:c.oneOfSetter(t)}),Object.defineProperty(m.prototype,"_orderBy",{get:c.oneOfGetter(t=["orderBy"]),set:c.oneOfSetter(t)}),Object.defineProperty(m.prototype,"_pageToken",{get:c.oneOfGetter(t=["pageToken"]),set:c.oneOfSetter(t)}),Object.defineProperty(m.prototype,"_returnPartialSuccess",{get:c.oneOfGetter(t=["returnPartialSuccess"]),set:c.oneOfSetter(t)}),m.create=function(e){return new m(e)},m.encode=function(e,t){return t=t||a.create(),null!=e.zone&&Object.hasOwnProperty.call(e,"zone")&&t.uint32(29957474).string(e.zone),null!=e.pageToken&&Object.hasOwnProperty.call(e,"pageToken")&&t.uint32(159957578).string(e.pageToken),null!=e.maxResults&&Object.hasOwnProperty.call(e,"maxResults")&&t.uint32(437723352).uint32(e.maxResults),null!=e.orderBy&&Object.hasOwnProperty.call(e,"orderBy")&&t.uint32(1284503362).string(e.orderBy),null!=e.project&&Object.hasOwnProperty.call(e,"project")&&t.uint32(1820481738).string(e.project),null!=e.filter&&Object.hasOwnProperty.call(e,"filter")&&t.uint32(2688965570).string(e.filter),null!=e.returnPartialSuccess&&Object.hasOwnProperty.call(e,"returnPartialSuccess")&&t.uint32(4137587120).bool(e.returnPartialSuccess),t},m.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},m.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.ListZoneOperationsRequest;e.pos<n;){var o=e.uint32();switch(o>>>3){case 336120696:r.filter=e.string();break;case 54715419:r.maxResults=e.uint32();break;case 160562920:r.orderBy=e.string();break;case 19994697:r.pageToken=e.string();break;case 227560217:r.project=e.string();break;case 517198390:r.returnPartialSuccess=e.bool();break;case 3744684:r.zone=e.string();break;default:e.skipType(7&o)}}return r},m.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},m.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.filter&&e.hasOwnProperty("filter")&&!c.isString(e.filter)?"filter: string expected":null!=e.maxResults&&e.hasOwnProperty("maxResults")&&!c.isInteger(e.maxResults)?"maxResults: integer expected":null!=e.orderBy&&e.hasOwnProperty("orderBy")&&!c.isString(e.orderBy)?"orderBy: string expected":null!=e.pageToken&&e.hasOwnProperty("pageToken")&&!c.isString(e.pageToken)?"pageToken: string expected":null!=e.project&&e.hasOwnProperty("project")&&!c.isString(e.project)?"project: string expected":null!=e.returnPartialSuccess&&e.hasOwnProperty("returnPartialSuccess")&&"boolean"!=typeof e.returnPartialSuccess?"returnPartialSuccess: boolean expected":null!=e.zone&&e.hasOwnProperty("zone")&&!c.isString(e.zone)?"zone: string expected":null},m.fromObject=function(e){var t;return e instanceof u.google.cloud.compute.v1.ListZoneOperationsRequest?e:(t=new u.google.cloud.compute.v1.ListZoneOperationsRequest,null!=e.filter&&(t.filter=String(e.filter)),null!=e.maxResults&&(t.maxResults=e.maxResults>>>0),null!=e.orderBy&&(t.orderBy=String(e.orderBy)),null!=e.pageToken&&(t.pageToken=String(e.pageToken)),null!=e.project&&(t.project=String(e.project)),null!=e.returnPartialSuccess&&(t.returnPartialSuccess=Boolean(e.returnPartialSuccess)),null!=e.zone&&(t.zone=String(e.zone)),t)},m.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.zone="",n.project=""),null!=e.zone&&e.hasOwnProperty("zone")&&(n.zone=e.zone),null!=e.pageToken&&e.hasOwnProperty("pageToken")&&(n.pageToken=e.pageToken,t.oneofs)&&(n._pageToken="pageToken"),null!=e.maxResults&&e.hasOwnProperty("maxResults")&&(n.maxResults=e.maxResults,t.oneofs)&&(n._maxResults="maxResults"),null!=e.orderBy&&e.hasOwnProperty("orderBy")&&(n.orderBy=e.orderBy,t.oneofs)&&(n._orderBy="orderBy"),null!=e.project&&e.hasOwnProperty("project")&&(n.project=e.project),null!=e.filter&&e.hasOwnProperty("filter")&&(n.filter=e.filter,t.oneofs)&&(n._filter="filter"),null!=e.returnPartialSuccess&&e.hasOwnProperty("returnPartialSuccess")&&(n.returnPartialSuccess=e.returnPartialSuccess,t.oneofs)&&(n._returnPartialSuccess="returnPartialSuccess"),n},m.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},m),i.WaitZoneOperationRequest=(q.prototype.operation="",q.prototype.project="",q.prototype.zone="",q.create=function(e){return new q(e)},q.encode=function(e,t){return t=t||a.create(),null!=e.zone&&Object.hasOwnProperty.call(e,"zone")&&t.uint32(29957474).string(e.zone),null!=e.operation&&Object.hasOwnProperty.call(e,"operation")&&t.uint32(416721722).string(e.operation),null!=e.project&&Object.hasOwnProperty.call(e,"project")&&t.uint32(1820481738).string(e.project),t},q.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},q.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.WaitZoneOperationRequest;e.pos<n;){var o=e.uint32();switch(o>>>3){case 52090215:r.operation=e.string();break;case 227560217:r.project=e.string();break;case 3744684:r.zone=e.string();break;default:e.skipType(7&o)}}return r},q.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},q.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.operation&&e.hasOwnProperty("operation")&&!c.isString(e.operation)?"operation: string expected":null!=e.project&&e.hasOwnProperty("project")&&!c.isString(e.project)?"project: string expected":null!=e.zone&&e.hasOwnProperty("zone")&&!c.isString(e.zone)?"zone: string expected":null},q.fromObject=function(e){var t;return e instanceof u.google.cloud.compute.v1.WaitZoneOperationRequest?e:(t=new u.google.cloud.compute.v1.WaitZoneOperationRequest,null!=e.operation&&(t.operation=String(e.operation)),null!=e.project&&(t.project=String(e.project)),null!=e.zone&&(t.zone=String(e.zone)),t)},q.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.zone="",n.operation="",n.project=""),null!=e.zone&&e.hasOwnProperty("zone")&&(n.zone=e.zone),null!=e.operation&&e.hasOwnProperty("operation")&&(n.operation=e.operation),null!=e.project&&e.hasOwnProperty("project")&&(n.project=e.project),n},q.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},q),i.AggregatedListGlobalOperationsRequest=(v.prototype.filter=null,v.prototype.includeAllScopes=null,v.prototype.maxResults=null,v.prototype.orderBy=null,v.prototype.pageToken=null,v.prototype.project="",v.prototype.returnPartialSuccess=null,Object.defineProperty(v.prototype,"_filter",{get:c.oneOfGetter(e=["filter"]),set:c.oneOfSetter(e)}),Object.defineProperty(v.prototype,"_includeAllScopes",{get:c.oneOfGetter(e=["includeAllScopes"]),set:c.oneOfSetter(e)}),Object.defineProperty(v.prototype,"_maxResults",{get:c.oneOfGetter(e=["maxResults"]),set:c.oneOfSetter(e)}),Object.defineProperty(v.prototype,"_orderBy",{get:c.oneOfGetter(e=["orderBy"]),set:c.oneOfSetter(e)}),Object.defineProperty(v.prototype,"_pageToken",{get:c.oneOfGetter(e=["pageToken"]),set:c.oneOfSetter(e)}),Object.defineProperty(v.prototype,"_returnPartialSuccess",{get:c.oneOfGetter(e=["returnPartialSuccess"]),set:c.oneOfSetter(e)}),v.create=function(e){return new v(e)},v.encode=function(e,t){return t=t||a.create(),null!=e.pageToken&&Object.hasOwnProperty.call(e,"pageToken")&&t.uint32(159957578).string(e.pageToken),null!=e.maxResults&&Object.hasOwnProperty.call(e,"maxResults")&&t.uint32(437723352).uint32(e.maxResults),null!=e.orderBy&&Object.hasOwnProperty.call(e,"orderBy")&&t.uint32(1284503362).string(e.orderBy),null!=e.project&&Object.hasOwnProperty.call(e,"project")&&t.uint32(1820481738).string(e.project),null!=e.filter&&Object.hasOwnProperty.call(e,"filter")&&t.uint32(2688965570).string(e.filter),null!=e.includeAllScopes&&Object.hasOwnProperty.call(e,"includeAllScopes")&&t.uint32(3130623904).bool(e.includeAllScopes),null!=e.returnPartialSuccess&&Object.hasOwnProperty.call(e,"returnPartialSuccess")&&t.uint32(4137587120).bool(e.returnPartialSuccess),t},v.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},v.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.AggregatedListGlobalOperationsRequest;e.pos<n;){var o=e.uint32();switch(o>>>3){case 336120696:r.filter=e.string();break;case 391327988:r.includeAllScopes=e.bool();break;case 54715419:r.maxResults=e.uint32();break;case 160562920:r.orderBy=e.string();break;case 19994697:r.pageToken=e.string();break;case 227560217:r.project=e.string();break;case 517198390:r.returnPartialSuccess=e.bool();break;default:e.skipType(7&o)}}return r},v.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},v.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.filter&&e.hasOwnProperty("filter")&&!c.isString(e.filter)?"filter: string expected":null!=e.includeAllScopes&&e.hasOwnProperty("includeAllScopes")&&"boolean"!=typeof e.includeAllScopes?"includeAllScopes: boolean expected":null!=e.maxResults&&e.hasOwnProperty("maxResults")&&!c.isInteger(e.maxResults)?"maxResults: integer expected":null!=e.orderBy&&e.hasOwnProperty("orderBy")&&!c.isString(e.orderBy)?"orderBy: string expected":null!=e.pageToken&&e.hasOwnProperty("pageToken")&&!c.isString(e.pageToken)?"pageToken: string expected":null!=e.project&&e.hasOwnProperty("project")&&!c.isString(e.project)?"project: string expected":null!=e.returnPartialSuccess&&e.hasOwnProperty("returnPartialSuccess")&&"boolean"!=typeof e.returnPartialSuccess?"returnPartialSuccess: boolean expected":null},v.fromObject=function(e){var t;return e instanceof u.google.cloud.compute.v1.AggregatedListGlobalOperationsRequest?e:(t=new u.google.cloud.compute.v1.AggregatedListGlobalOperationsRequest,null!=e.filter&&(t.filter=String(e.filter)),null!=e.includeAllScopes&&(t.includeAllScopes=Boolean(e.includeAllScopes)),null!=e.maxResults&&(t.maxResults=e.maxResults>>>0),null!=e.orderBy&&(t.orderBy=String(e.orderBy)),null!=e.pageToken&&(t.pageToken=String(e.pageToken)),null!=e.project&&(t.project=String(e.project)),null!=e.returnPartialSuccess&&(t.returnPartialSuccess=Boolean(e.returnPartialSuccess)),t)},v.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.project=""),null!=e.pageToken&&e.hasOwnProperty("pageToken")&&(n.pageToken=e.pageToken,t.oneofs)&&(n._pageToken="pageToken"),null!=e.maxResults&&e.hasOwnProperty("maxResults")&&(n.maxResults=e.maxResults,t.oneofs)&&(n._maxResults="maxResults"),null!=e.orderBy&&e.hasOwnProperty("orderBy")&&(n.orderBy=e.orderBy,t.oneofs)&&(n._orderBy="orderBy"),null!=e.project&&e.hasOwnProperty("project")&&(n.project=e.project),null!=e.filter&&e.hasOwnProperty("filter")&&(n.filter=e.filter,t.oneofs)&&(n._filter="filter"),null!=e.includeAllScopes&&e.hasOwnProperty("includeAllScopes")&&(n.includeAllScopes=e.includeAllScopes,t.oneofs)&&(n._includeAllScopes="includeAllScopes"),null!=e.returnPartialSuccess&&e.hasOwnProperty("returnPartialSuccess")&&(n.returnPartialSuccess=e.returnPartialSuccess,t.oneofs)&&(n._returnPartialSuccess="returnPartialSuccess"),n},v.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},v),i.DeleteGlobalOperationRequest=(W.prototype.operation="",W.prototype.project="",W.create=function(e){return new W(e)},W.encode=function(e,t){return t=t||a.create(),null!=e.operation&&Object.hasOwnProperty.call(e,"operation")&&t.uint32(416721722).string(e.operation),null!=e.project&&Object.hasOwnProperty.call(e,"project")&&t.uint32(1820481738).string(e.project),t},W.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},W.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.DeleteGlobalOperationRequest;e.pos<n;){var o=e.uint32();switch(o>>>3){case 52090215:r.operation=e.string();break;case 227560217:r.project=e.string();break;default:e.skipType(7&o)}}return r},W.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},W.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.operation&&e.hasOwnProperty("operation")&&!c.isString(e.operation)?"operation: string expected":null!=e.project&&e.hasOwnProperty("project")&&!c.isString(e.project)?"project: string expected":null},W.fromObject=function(e){var t;return e instanceof u.google.cloud.compute.v1.DeleteGlobalOperationRequest?e:(t=new u.google.cloud.compute.v1.DeleteGlobalOperationRequest,null!=e.operation&&(t.operation=String(e.operation)),null!=e.project&&(t.project=String(e.project)),t)},W.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.operation="",n.project=""),null!=e.operation&&e.hasOwnProperty("operation")&&(n.operation=e.operation),null!=e.project&&e.hasOwnProperty("project")&&(n.project=e.project),n},W.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},W),i.DeleteGlobalOperationResponse=(H.create=function(e){return new H(e)},H.encode=function(e,t){return t=t||a.create()},H.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},H.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,t=new u.google.cloud.compute.v1.DeleteGlobalOperationResponse;e.pos<n;){var r=e.uint32();e.skipType(7&r)}return t},H.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},H.verify=function(e){return"object"!=typeof e||null===e?"object expected":null},H.fromObject=function(e){return e instanceof u.google.cloud.compute.v1.DeleteGlobalOperationResponse?e:new u.google.cloud.compute.v1.DeleteGlobalOperationResponse},H.toObject=function(){return{}},H.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},H),i.GetGlobalOperationRequest=(Y.prototype.operation="",Y.prototype.project="",Y.create=function(e){return new Y(e)},Y.encode=function(e,t){return t=t||a.create(),null!=e.operation&&Object.hasOwnProperty.call(e,"operation")&&t.uint32(416721722).string(e.operation),null!=e.project&&Object.hasOwnProperty.call(e,"project")&&t.uint32(1820481738).string(e.project),t},Y.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},Y.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.GetGlobalOperationRequest;e.pos<n;){var o=e.uint32();switch(o>>>3){case 52090215:r.operation=e.string();break;case 227560217:r.project=e.string();break;default:e.skipType(7&o)}}return r},Y.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},Y.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.operation&&e.hasOwnProperty("operation")&&!c.isString(e.operation)?"operation: string expected":null!=e.project&&e.hasOwnProperty("project")&&!c.isString(e.project)?"project: string expected":null},Y.fromObject=function(e){var t;return e instanceof u.google.cloud.compute.v1.GetGlobalOperationRequest?e:(t=new u.google.cloud.compute.v1.GetGlobalOperationRequest,null!=e.operation&&(t.operation=String(e.operation)),null!=e.project&&(t.project=String(e.project)),t)},Y.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.operation="",n.project=""),null!=e.operation&&e.hasOwnProperty("operation")&&(n.operation=e.operation),null!=e.project&&e.hasOwnProperty("project")&&(n.project=e.project),n},Y.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},Y),i.ListGlobalOperationsRequest=(P.prototype.filter=null,P.prototype.maxResults=null,P.prototype.orderBy=null,P.prototype.pageToken=null,P.prototype.project="",P.prototype.returnPartialSuccess=null,Object.defineProperty(P.prototype,"_filter",{get:c.oneOfGetter(t=["filter"]),set:c.oneOfSetter(t)}),Object.defineProperty(P.prototype,"_maxResults",{get:c.oneOfGetter(t=["maxResults"]),set:c.oneOfSetter(t)}),Object.defineProperty(P.prototype,"_orderBy",{get:c.oneOfGetter(t=["orderBy"]),set:c.oneOfSetter(t)}),Object.defineProperty(P.prototype,"_pageToken",{get:c.oneOfGetter(t=["pageToken"]),set:c.oneOfSetter(t)}),Object.defineProperty(P.prototype,"_returnPartialSuccess",{get:c.oneOfGetter(t=["returnPartialSuccess"]),set:c.oneOfSetter(t)}),P.create=function(e){return new P(e)},P.encode=function(e,t){return t=t||a.create(),null!=e.pageToken&&Object.hasOwnProperty.call(e,"pageToken")&&t.uint32(159957578).string(e.pageToken),null!=e.maxResults&&Object.hasOwnProperty.call(e,"maxResults")&&t.uint32(437723352).uint32(e.maxResults),null!=e.orderBy&&Object.hasOwnProperty.call(e,"orderBy")&&t.uint32(1284503362).string(e.orderBy),null!=e.project&&Object.hasOwnProperty.call(e,"project")&&t.uint32(1820481738).string(e.project),null!=e.filter&&Object.hasOwnProperty.call(e,"filter")&&t.uint32(2688965570).string(e.filter),null!=e.returnPartialSuccess&&Object.hasOwnProperty.call(e,"returnPartialSuccess")&&t.uint32(4137587120).bool(e.returnPartialSuccess),t},P.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},P.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.ListGlobalOperationsRequest;e.pos<n;){var o=e.uint32();switch(o>>>3){case 336120696:r.filter=e.string();break;case 54715419:r.maxResults=e.uint32();break;case 160562920:r.orderBy=e.string();break;case 19994697:r.pageToken=e.string();break;case 227560217:r.project=e.string();break;case 517198390:r.returnPartialSuccess=e.bool();break;default:e.skipType(7&o)}}return r},P.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},P.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.filter&&e.hasOwnProperty("filter")&&!c.isString(e.filter)?"filter: string expected":null!=e.maxResults&&e.hasOwnProperty("maxResults")&&!c.isInteger(e.maxResults)?"maxResults: integer expected":null!=e.orderBy&&e.hasOwnProperty("orderBy")&&!c.isString(e.orderBy)?"orderBy: string expected":null!=e.pageToken&&e.hasOwnProperty("pageToken")&&!c.isString(e.pageToken)?"pageToken: string expected":null!=e.project&&e.hasOwnProperty("project")&&!c.isString(e.project)?"project: string expected":null!=e.returnPartialSuccess&&e.hasOwnProperty("returnPartialSuccess")&&"boolean"!=typeof e.returnPartialSuccess?"returnPartialSuccess: boolean expected":null},P.fromObject=function(e){var t;return e instanceof u.google.cloud.compute.v1.ListGlobalOperationsRequest?e:(t=new u.google.cloud.compute.v1.ListGlobalOperationsRequest,null!=e.filter&&(t.filter=String(e.filter)),null!=e.maxResults&&(t.maxResults=e.maxResults>>>0),null!=e.orderBy&&(t.orderBy=String(e.orderBy)),null!=e.pageToken&&(t.pageToken=String(e.pageToken)),null!=e.project&&(t.project=String(e.project)),null!=e.returnPartialSuccess&&(t.returnPartialSuccess=Boolean(e.returnPartialSuccess)),t)},P.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.project=""),null!=e.pageToken&&e.hasOwnProperty("pageToken")&&(n.pageToken=e.pageToken,t.oneofs)&&(n._pageToken="pageToken"),null!=e.maxResults&&e.hasOwnProperty("maxResults")&&(n.maxResults=e.maxResults,t.oneofs)&&(n._maxResults="maxResults"),null!=e.orderBy&&e.hasOwnProperty("orderBy")&&(n.orderBy=e.orderBy,t.oneofs)&&(n._orderBy="orderBy"),null!=e.project&&e.hasOwnProperty("project")&&(n.project=e.project),null!=e.filter&&e.hasOwnProperty("filter")&&(n.filter=e.filter,t.oneofs)&&(n._filter="filter"),null!=e.returnPartialSuccess&&e.hasOwnProperty("returnPartialSuccess")&&(n.returnPartialSuccess=e.returnPartialSuccess,t.oneofs)&&(n._returnPartialSuccess="returnPartialSuccess"),n},P.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},P),i.WaitGlobalOperationRequest=(X.prototype.operation="",X.prototype.project="",X.create=function(e){return new X(e)},X.encode=function(e,t){return t=t||a.create(),null!=e.operation&&Object.hasOwnProperty.call(e,"operation")&&t.uint32(416721722).string(e.operation),null!=e.project&&Object.hasOwnProperty.call(e,"project")&&t.uint32(1820481738).string(e.project),t},X.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},X.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.WaitGlobalOperationRequest;e.pos<n;){var o=e.uint32();switch(o>>>3){case 52090215:r.operation=e.string();break;case 227560217:r.project=e.string();break;default:e.skipType(7&o)}}return r},X.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},X.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.operation&&e.hasOwnProperty("operation")&&!c.isString(e.operation)?"operation: string expected":null!=e.project&&e.hasOwnProperty("project")&&!c.isString(e.project)?"project: string expected":null},X.fromObject=function(e){var t;return e instanceof u.google.cloud.compute.v1.WaitGlobalOperationRequest?e:(t=new u.google.cloud.compute.v1.WaitGlobalOperationRequest,null!=e.operation&&(t.operation=String(e.operation)),null!=e.project&&(t.project=String(e.project)),t)},X.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.operation="",n.project=""),null!=e.operation&&e.hasOwnProperty("operation")&&(n.operation=e.operation),null!=e.project&&e.hasOwnProperty("project")&&(n.project=e.project),n},X.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},X),i.DeleteGlobalOrganizationOperationRequest=(Z.prototype.operation="",Z.prototype.parentId=null,Object.defineProperty(Z.prototype,"_parentId",{get:c.oneOfGetter(e=["parentId"]),set:c.oneOfSetter(e)}),Z.create=function(e){return new Z(e)},Z.encode=function(e,t){return t=t||a.create(),null!=e.operation&&Object.hasOwnProperty.call(e,"operation")&&t.uint32(416721722).string(e.operation),null!=e.parentId&&Object.hasOwnProperty.call(e,"parentId")&&t.uint32(3677718146).string(e.parentId),t},Z.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},Z.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.DeleteGlobalOrganizationOperationRequest;e.pos<n;){var o=e.uint32();switch(o>>>3){case 52090215:r.operation=e.string();break;case 459714768:r.parentId=e.string();break;default:e.skipType(7&o)}}return r},Z.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},Z.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.operation&&e.hasOwnProperty("operation")&&!c.isString(e.operation)?"operation: string expected":null!=e.parentId&&e.hasOwnProperty("parentId")&&!c.isString(e.parentId)?"parentId: string expected":null},Z.fromObject=function(e){var t;return e instanceof u.google.cloud.compute.v1.DeleteGlobalOrganizationOperationRequest?e:(t=new u.google.cloud.compute.v1.DeleteGlobalOrganizationOperationRequest,null!=e.operation&&(t.operation=String(e.operation)),null!=e.parentId&&(t.parentId=String(e.parentId)),t)},Z.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.operation=""),null!=e.operation&&e.hasOwnProperty("operation")&&(n.operation=e.operation),null!=e.parentId&&e.hasOwnProperty("parentId")&&(n.parentId=e.parentId,t.oneofs)&&(n._parentId="parentId"),n},Z.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},Z),i.DeleteGlobalOrganizationOperationResponse=(K.create=function(e){return new K(e)},K.encode=function(e,t){return t=t||a.create()},K.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},K.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,t=new u.google.cloud.compute.v1.DeleteGlobalOrganizationOperationResponse;e.pos<n;){var r=e.uint32();e.skipType(7&r)}return t},K.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},K.verify=function(e){return"object"!=typeof e||null===e?"object expected":null},K.fromObject=function(e){return e instanceof u.google.cloud.compute.v1.DeleteGlobalOrganizationOperationResponse?e:new u.google.cloud.compute.v1.DeleteGlobalOrganizationOperationResponse},K.toObject=function(){return{}},K.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},K),i.GetGlobalOrganizationOperationRequest=(Q.prototype.operation="",Q.prototype.parentId=null,Object.defineProperty(Q.prototype,"_parentId",{get:c.oneOfGetter(t=["parentId"]),set:c.oneOfSetter(t)}),Q.create=function(e){return new Q(e)},Q.encode=function(e,t){return t=t||a.create(),null!=e.operation&&Object.hasOwnProperty.call(e,"operation")&&t.uint32(416721722).string(e.operation),null!=e.parentId&&Object.hasOwnProperty.call(e,"parentId")&&t.uint32(3677718146).string(e.parentId),t},Q.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},Q.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.GetGlobalOrganizationOperationRequest;e.pos<n;){var o=e.uint32();switch(o>>>3){case 52090215:r.operation=e.string();break;case 459714768:r.parentId=e.string();break;default:e.skipType(7&o)}}return r},Q.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},Q.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.operation&&e.hasOwnProperty("operation")&&!c.isString(e.operation)?"operation: string expected":null!=e.parentId&&e.hasOwnProperty("parentId")&&!c.isString(e.parentId)?"parentId: string expected":null},Q.fromObject=function(e){var t;return e instanceof u.google.cloud.compute.v1.GetGlobalOrganizationOperationRequest?e:(t=new u.google.cloud.compute.v1.GetGlobalOrganizationOperationRequest,null!=e.operation&&(t.operation=String(e.operation)),null!=e.parentId&&(t.parentId=String(e.parentId)),t)},Q.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.operation=""),null!=e.operation&&e.hasOwnProperty("operation")&&(n.operation=e.operation),null!=e.parentId&&e.hasOwnProperty("parentId")&&(n.parentId=e.parentId,t.oneofs)&&(n._parentId="parentId"),n},Q.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},Q),i.ListGlobalOrganizationOperationsRequest=(w.prototype.filter=null,w.prototype.maxResults=null,w.prototype.orderBy=null,w.prototype.pageToken=null,w.prototype.parentId=null,w.prototype.returnPartialSuccess=null,Object.defineProperty(w.prototype,"_filter",{get:c.oneOfGetter(e=["filter"]),set:c.oneOfSetter(e)}),Object.defineProperty(w.prototype,"_maxResults",{get:c.oneOfGetter(e=["maxResults"]),set:c.oneOfSetter(e)}),Object.defineProperty(w.prototype,"_orderBy",{get:c.oneOfGetter(e=["orderBy"]),set:c.oneOfSetter(e)}),Object.defineProperty(w.prototype,"_pageToken",{get:c.oneOfGetter(e=["pageToken"]),set:c.oneOfSetter(e)}),Object.defineProperty(w.prototype,"_parentId",{get:c.oneOfGetter(e=["parentId"]),set:c.oneOfSetter(e)}),Object.defineProperty(w.prototype,"_returnPartialSuccess",{get:c.oneOfGetter(e=["returnPartialSuccess"]),set:c.oneOfSetter(e)}),w.create=function(e){return new w(e)},w.encode=function(e,t){return t=t||a.create(),null!=e.pageToken&&Object.hasOwnProperty.call(e,"pageToken")&&t.uint32(159957578).string(e.pageToken),null!=e.maxResults&&Object.hasOwnProperty.call(e,"maxResults")&&t.uint32(437723352).uint32(e.maxResults),null!=e.orderBy&&Object.hasOwnProperty.call(e,"orderBy")&&t.uint32(1284503362).string(e.orderBy),null!=e.filter&&Object.hasOwnProperty.call(e,"filter")&&t.uint32(2688965570).string(e.filter),null!=e.parentId&&Object.hasOwnProperty.call(e,"parentId")&&t.uint32(3677718146).string(e.parentId),null!=e.returnPartialSuccess&&Object.hasOwnProperty.call(e,"returnPartialSuccess")&&t.uint32(4137587120).bool(e.returnPartialSuccess),t},w.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},w.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.cloud.compute.v1.ListGlobalOrganizationOperationsRequest;e.pos<n;){var o=e.uint32();switch(o>>>3){case 336120696:r.filter=e.string();break;case 54715419:r.maxResults=e.uint32();break;case 160562920:r.orderBy=e.string();break;case 19994697:r.pageToken=e.string();break;case 459714768:r.parentId=e.string();break;case 517198390:r.returnPartialSuccess=e.bool();break;default:e.skipType(7&o)}}return r},w.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},w.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.filter&&e.hasOwnProperty("filter")&&!c.isString(e.filter)?"filter: string expected":null!=e.maxResults&&e.hasOwnProperty("maxResults")&&!c.isInteger(e.maxResults)?"maxResults: integer expected":null!=e.orderBy&&e.hasOwnProperty("orderBy")&&!c.isString(e.orderBy)?"orderBy: string expected":null!=e.pageToken&&e.hasOwnProperty("pageToken")&&!c.isString(e.pageToken)?"pageToken: string expected":null!=e.parentId&&e.hasOwnProperty("parentId")&&!c.isString(e.parentId)?"parentId: string expected":null!=e.returnPartialSuccess&&e.hasOwnProperty("returnPartialSuccess")&&"boolean"!=typeof e.returnPartialSuccess?"returnPartialSuccess: boolean expected":null},w.fromObject=function(e){var t;return e instanceof u.google.cloud.compute.v1.ListGlobalOrganizationOperationsRequest?e:(t=new u.google.cloud.compute.v1.ListGlobalOrganizationOperationsRequest,null!=e.filter&&(t.filter=String(e.filter)),null!=e.maxResults&&(t.maxResults=e.maxResults>>>0),null!=e.orderBy&&(t.orderBy=String(e.orderBy)),null!=e.pageToken&&(t.pageToken=String(e.pageToken)),null!=e.parentId&&(t.parentId=String(e.parentId)),null!=e.returnPartialSuccess&&(t.returnPartialSuccess=Boolean(e.returnPartialSuccess)),t)},w.toObject=function(e,t){t=t||{};var n={};return null!=e.pageToken&&e.hasOwnProperty("pageToken")&&(n.pageToken=e.pageToken,t.oneofs)&&(n._pageToken="pageToken"),null!=e.maxResults&&e.hasOwnProperty("maxResults")&&(n.maxResults=e.maxResults,t.oneofs)&&(n._maxResults="maxResults"),null!=e.orderBy&&e.hasOwnProperty("orderBy")&&(n.orderBy=e.orderBy,t.oneofs)&&(n._orderBy="orderBy"),null!=e.filter&&e.hasOwnProperty("filter")&&(n.filter=e.filter,t.oneofs)&&(n._filter="filter"),null!=e.parentId&&e.hasOwnProperty("parentId")&&(n.parentId=e.parentId,t.oneofs)&&(n._parentId="parentId"),null!=e.returnPartialSuccess&&e.hasOwnProperty("returnPartialSuccess")&&(n.returnPartialSuccess=e.returnPartialSuccess,t.oneofs)&&(n._returnPartialSuccess="returnPartialSuccess"),n},w.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},w),i.RegionOperations=((($.prototype=Object.create(r.rpc.Service.prototype)).constructor=$).create=function(e,t,n){return new this(e,t,n)},Object.defineProperty($.prototype.delete=function e(t,n){return this.rpcCall(e,u.google.cloud.compute.v1.DeleteRegionOperationRequest,u.google.cloud.compute.v1.DeleteRegionOperationResponse,t,n)},"name",{value:"Delete"}),Object.defineProperty($.prototype.get=function e(t,n){return this.rpcCall(e,u.google.cloud.compute.v1.GetRegionOperationRequest,u.google.cloud.compute.v1.Operation,t,n)},"name",{value:"Get"}),Object.defineProperty($.prototype.list=function e(t,n){return this.rpcCall(e,u.google.cloud.compute.v1.ListRegionOperationsRequest,u.google.cloud.compute.v1.OperationList,t,n)},"name",{value:"List"}),Object.defineProperty($.prototype.wait=function e(t,n){return this.rpcCall(e,u.google.cloud.compute.v1.WaitRegionOperationRequest,u.google.cloud.compute.v1.Operation,t,n)},"name",{value:"Wait"}),$),i.ZoneOperations=(((ee.prototype=Object.create(r.rpc.Service.prototype)).constructor=ee).create=function(e,t,n){return new this(e,t,n)},Object.defineProperty(ee.prototype.delete=function e(t,n){return this.rpcCall(e,u.google.cloud.compute.v1.DeleteZoneOperationRequest,u.google.cloud.compute.v1.DeleteZoneOperationResponse,t,n)},"name",{value:"Delete"}),Object.defineProperty(ee.prototype.get=function e(t,n){return this.rpcCall(e,u.google.cloud.compute.v1.GetZoneOperationRequest,u.google.cloud.compute.v1.Operation,t,n)},"name",{value:"Get"}),Object.defineProperty(ee.prototype.list=function e(t,n){return this.rpcCall(e,u.google.cloud.compute.v1.ListZoneOperationsRequest,u.google.cloud.compute.v1.OperationList,t,n)},"name",{value:"List"}),Object.defineProperty(ee.prototype.wait=function e(t,n){return this.rpcCall(e,u.google.cloud.compute.v1.WaitZoneOperationRequest,u.google.cloud.compute.v1.Operation,t,n)},"name",{value:"Wait"}),ee),i.GlobalOperations=(((te.prototype=Object.create(r.rpc.Service.prototype)).constructor=te).create=function(e,t,n){return new this(e,t,n)},Object.defineProperty(te.prototype.aggregatedList=function e(t,n){return this.rpcCall(e,u.google.cloud.compute.v1.AggregatedListGlobalOperationsRequest,u.google.cloud.compute.v1.OperationAggregatedList,t,n)},"name",{value:"AggregatedList"}),Object.defineProperty(te.prototype.delete=function e(t,n){return this.rpcCall(e,u.google.cloud.compute.v1.DeleteGlobalOperationRequest,u.google.cloud.compute.v1.DeleteGlobalOperationResponse,t,n)},"name",{value:"Delete"}),Object.defineProperty(te.prototype.get=function e(t,n){return this.rpcCall(e,u.google.cloud.compute.v1.GetGlobalOperationRequest,u.google.cloud.compute.v1.Operation,t,n)},"name",{value:"Get"}),Object.defineProperty(te.prototype.list=function e(t,n){return this.rpcCall(e,u.google.cloud.compute.v1.ListGlobalOperationsRequest,u.google.cloud.compute.v1.OperationList,t,n)},"name",{value:"List"}),Object.defineProperty(te.prototype.wait=function e(t,n){return this.rpcCall(e,u.google.cloud.compute.v1.WaitGlobalOperationRequest,u.google.cloud.compute.v1.Operation,t,n)},"name",{value:"Wait"}),te),i.GlobalOrganizationOperations=(((ne.prototype=Object.create(r.rpc.Service.prototype)).constructor=ne).create=function(e,t,n){return new this(e,t,n)},Object.defineProperty(ne.prototype.delete=function e(t,n){return this.rpcCall(e,u.google.cloud.compute.v1.DeleteGlobalOrganizationOperationRequest,u.google.cloud.compute.v1.DeleteGlobalOrganizationOperationResponse,t,n)},"name",{value:"Delete"}),Object.defineProperty(ne.prototype.get=function e(t,n){return this.rpcCall(e,u.google.cloud.compute.v1.GetGlobalOrganizationOperationRequest,u.google.cloud.compute.v1.Operation,t,n)},"name",{value:"Get"}),Object.defineProperty(ne.prototype.list=function e(t,n){return this.rpcCall(e,u.google.cloud.compute.v1.ListGlobalOrganizationOperationsRequest,u.google.cloud.compute.v1.OperationList,t,n)},"name",{value:"List"}),ne),i),n),o),G.api=((t={}).Http=(re.prototype.rules=c.emptyArray,re.prototype.fullyDecodeReservedExpansion=!1,re.create=function(e){return new re(e)},re.encode=function(e,t){if(t=t||a.create(),null!=e.rules&&e.rules.length)for(var n=0;n<e.rules.length;++n)u.google.api.HttpRule.encode(e.rules[n],t.uint32(10).fork()).ldelim();return null!=e.fullyDecodeReservedExpansion&&Object.hasOwnProperty.call(e,"fullyDecodeReservedExpansion")&&t.uint32(16).bool(e.fullyDecodeReservedExpansion),t},re.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},re.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.api.Http;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:r.rules&&r.rules.length||(r.rules=[]),r.rules.push(u.google.api.HttpRule.decode(e,e.uint32()));break;case 2:r.fullyDecodeReservedExpansion=e.bool();break;default:e.skipType(7&o)}}return r},re.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},re.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.rules&&e.hasOwnProperty("rules")){if(!Array.isArray(e.rules))return"rules: array expected";for(var t=0;t<e.rules.length;++t){var n=u.google.api.HttpRule.verify(e.rules[t]);if(n)return"rules."+n}}return null!=e.fullyDecodeReservedExpansion&&e.hasOwnProperty("fullyDecodeReservedExpansion")&&"boolean"!=typeof e.fullyDecodeReservedExpansion?"fullyDecodeReservedExpansion: boolean expected":null},re.fromObject=function(e){if(e instanceof u.google.api.Http)return e;var t=new u.google.api.Http;if(e.rules){if(!Array.isArray(e.rules))throw TypeError(".google.api.Http.rules: array expected");t.rules=[];for(var n=0;n<e.rules.length;++n){if("object"!=typeof e.rules[n])throw TypeError(".google.api.Http.rules: object expected");t.rules[n]=u.google.api.HttpRule.fromObject(e.rules[n])}}return null!=e.fullyDecodeReservedExpansion&&(t.fullyDecodeReservedExpansion=Boolean(e.fullyDecodeReservedExpansion)),t},re.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.rules=[]),t.defaults&&(n.fullyDecodeReservedExpansion=!1),e.rules&&e.rules.length){n.rules=[];for(var r=0;r<e.rules.length;++r)n.rules[r]=u.google.api.HttpRule.toObject(e.rules[r],t)}return null!=e.fullyDecodeReservedExpansion&&e.hasOwnProperty("fullyDecodeReservedExpansion")&&(n.fullyDecodeReservedExpansion=e.fullyDecodeReservedExpansion),n},re.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},re),t.HttpRule=(j.prototype.selector="",j.prototype.get=null,j.prototype.put=null,j.prototype.post=null,j.prototype.delete=null,j.prototype.patch=null,j.prototype.custom=null,j.prototype.body="",j.prototype.responseBody="",j.prototype.additionalBindings=c.emptyArray,Object.defineProperty(j.prototype,"pattern",{get:c.oneOfGetter(e=["get","put","post","delete","patch","custom"]),set:c.oneOfSetter(e)}),j.create=function(e){return new j(e)},j.encode=function(e,t){if(t=t||a.create(),null!=e.selector&&Object.hasOwnProperty.call(e,"selector")&&t.uint32(10).string(e.selector),null!=e.get&&Object.hasOwnProperty.call(e,"get")&&t.uint32(18).string(e.get),null!=e.put&&Object.hasOwnProperty.call(e,"put")&&t.uint32(26).string(e.put),null!=e.post&&Object.hasOwnProperty.call(e,"post")&&t.uint32(34).string(e.post),null!=e.delete&&Object.hasOwnProperty.call(e,"delete")&&t.uint32(42).string(e.delete),null!=e.patch&&Object.hasOwnProperty.call(e,"patch")&&t.uint32(50).string(e.patch),null!=e.body&&Object.hasOwnProperty.call(e,"body")&&t.uint32(58).string(e.body),null!=e.custom&&Object.hasOwnProperty.call(e,"custom")&&u.google.api.CustomHttpPattern.encode(e.custom,t.uint32(66).fork()).ldelim(),null!=e.additionalBindings&&e.additionalBindings.length)for(var n=0;n<e.additionalBindings.length;++n)u.google.api.HttpRule.encode(e.additionalBindings[n],t.uint32(90).fork()).ldelim();return null!=e.responseBody&&Object.hasOwnProperty.call(e,"responseBody")&&t.uint32(98).string(e.responseBody),t},j.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},j.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.api.HttpRule;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:r.selector=e.string();break;case 2:r.get=e.string();break;case 3:r.put=e.string();break;case 4:r.post=e.string();break;case 5:r.delete=e.string();break;case 6:r.patch=e.string();break;case 8:r.custom=u.google.api.CustomHttpPattern.decode(e,e.uint32());break;case 7:r.body=e.string();break;case 12:r.responseBody=e.string();break;case 11:r.additionalBindings&&r.additionalBindings.length||(r.additionalBindings=[]),r.additionalBindings.push(u.google.api.HttpRule.decode(e,e.uint32()));break;default:e.skipType(7&o)}}return r},j.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},j.verify=function(e){if("object"!=typeof e||null===e)return"object expected";var t={};if(null!=e.selector&&e.hasOwnProperty("selector")&&!c.isString(e.selector))return"selector: string expected";if(null!=e.get&&e.hasOwnProperty("get")&&(t.pattern=1,!c.isString(e.get)))return"get: string expected";if(null!=e.put&&e.hasOwnProperty("put")){if(1===t.pattern)return"pattern: multiple values";if(t.pattern=1,!c.isString(e.put))return"put: string expected"}if(null!=e.post&&e.hasOwnProperty("post")){if(1===t.pattern)return"pattern: multiple values";if(t.pattern=1,!c.isString(e.post))return"post: string expected"}if(null!=e.delete&&e.hasOwnProperty("delete")){if(1===t.pattern)return"pattern: multiple values";if(t.pattern=1,!c.isString(e.delete))return"delete: string expected"}if(null!=e.patch&&e.hasOwnProperty("patch")){if(1===t.pattern)return"pattern: multiple values";if(t.pattern=1,!c.isString(e.patch))return"patch: string expected"}if(null!=e.custom&&e.hasOwnProperty("custom")){if(1===t.pattern)return"pattern: multiple values";if(t.pattern=1,n=u.google.api.CustomHttpPattern.verify(e.custom))return"custom."+n}if(null!=e.body&&e.hasOwnProperty("body")&&!c.isString(e.body))return"body: string expected";if(null!=e.responseBody&&e.hasOwnProperty("responseBody")&&!c.isString(e.responseBody))return"responseBody: string expected";if(null!=e.additionalBindings&&e.hasOwnProperty("additionalBindings")){if(!Array.isArray(e.additionalBindings))return"additionalBindings: array expected";for(var n,r=0;r<e.additionalBindings.length;++r)if(n=u.google.api.HttpRule.verify(e.additionalBindings[r]))return"additionalBindings."+n}return null},j.fromObject=function(e){if(e instanceof u.google.api.HttpRule)return e;var t=new u.google.api.HttpRule;if(null!=e.selector&&(t.selector=String(e.selector)),null!=e.get&&(t.get=String(e.get)),null!=e.put&&(t.put=String(e.put)),null!=e.post&&(t.post=String(e.post)),null!=e.delete&&(t.delete=String(e.delete)),null!=e.patch&&(t.patch=String(e.patch)),null!=e.custom){if("object"!=typeof e.custom)throw TypeError(".google.api.HttpRule.custom: object expected");t.custom=u.google.api.CustomHttpPattern.fromObject(e.custom)}if(null!=e.body&&(t.body=String(e.body)),null!=e.responseBody&&(t.responseBody=String(e.responseBody)),e.additionalBindings){if(!Array.isArray(e.additionalBindings))throw TypeError(".google.api.HttpRule.additionalBindings: array expected");t.additionalBindings=[];for(var n=0;n<e.additionalBindings.length;++n){if("object"!=typeof e.additionalBindings[n])throw TypeError(".google.api.HttpRule.additionalBindings: object expected");t.additionalBindings[n]=u.google.api.HttpRule.fromObject(e.additionalBindings[n])}}return t},j.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.additionalBindings=[]),t.defaults&&(n.selector="",n.body="",n.responseBody=""),null!=e.selector&&e.hasOwnProperty("selector")&&(n.selector=e.selector),null!=e.get&&e.hasOwnProperty("get")&&(n.get=e.get,t.oneofs)&&(n.pattern="get"),null!=e.put&&e.hasOwnProperty("put")&&(n.put=e.put,t.oneofs)&&(n.pattern="put"),null!=e.post&&e.hasOwnProperty("post")&&(n.post=e.post,t.oneofs)&&(n.pattern="post"),null!=e.delete&&e.hasOwnProperty("delete")&&(n.delete=e.delete,t.oneofs)&&(n.pattern="delete"),null!=e.patch&&e.hasOwnProperty("patch")&&(n.patch=e.patch,t.oneofs)&&(n.pattern="patch"),null!=e.body&&e.hasOwnProperty("body")&&(n.body=e.body),null!=e.custom&&e.hasOwnProperty("custom")&&(n.custom=u.google.api.CustomHttpPattern.toObject(e.custom,t),t.oneofs)&&(n.pattern="custom"),e.additionalBindings&&e.additionalBindings.length){n.additionalBindings=[];for(var r=0;r<e.additionalBindings.length;++r)n.additionalBindings[r]=u.google.api.HttpRule.toObject(e.additionalBindings[r],t)}return null!=e.responseBody&&e.hasOwnProperty("responseBody")&&(n.responseBody=e.responseBody),n},j.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},j),t.CustomHttpPattern=(oe.prototype.kind="",oe.prototype.path="",oe.create=function(e){return new oe(e)},oe.encode=function(e,t){return t=t||a.create(),null!=e.kind&&Object.hasOwnProperty.call(e,"kind")&&t.uint32(10).string(e.kind),null!=e.path&&Object.hasOwnProperty.call(e,"path")&&t.uint32(18).string(e.path),t},oe.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},oe.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.api.CustomHttpPattern;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:r.kind=e.string();break;case 2:r.path=e.string();break;default:e.skipType(7&o)}}return r},oe.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},oe.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.kind&&e.hasOwnProperty("kind")&&!c.isString(e.kind)?"kind: string expected":null!=e.path&&e.hasOwnProperty("path")&&!c.isString(e.path)?"path: string expected":null},oe.fromObject=function(e){var t;return e instanceof u.google.api.CustomHttpPattern?e:(t=new u.google.api.CustomHttpPattern,null!=e.kind&&(t.kind=String(e.kind)),null!=e.path&&(t.path=String(e.path)),t)},oe.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.kind="",n.path=""),null!=e.kind&&e.hasOwnProperty("kind")&&(n.kind=e.kind),null!=e.path&&e.hasOwnProperty("path")&&(n.path=e.path),n},oe.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},oe),t),G.protobuf=((i={}).FileDescriptorSet=(ie.prototype.file=c.emptyArray,ie.create=function(e){return new ie(e)},ie.encode=function(e,t){if(t=t||a.create(),null!=e.file&&e.file.length)for(var n=0;n<e.file.length;++n)u.google.protobuf.FileDescriptorProto.encode(e.file[n],t.uint32(10).fork()).ldelim();return t},ie.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},ie.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.FileDescriptorSet;e.pos<n;){var o=e.uint32();o>>>3==1?(r.file&&r.file.length||(r.file=[]),r.file.push(u.google.protobuf.FileDescriptorProto.decode(e,e.uint32()))):e.skipType(7&o)}return r},ie.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},ie.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.file&&e.hasOwnProperty("file")){if(!Array.isArray(e.file))return"file: array expected";for(var t=0;t<e.file.length;++t){var n=u.google.protobuf.FileDescriptorProto.verify(e.file[t]);if(n)return"file."+n}}return null},ie.fromObject=function(e){if(e instanceof u.google.protobuf.FileDescriptorSet)return e;var t=new u.google.protobuf.FileDescriptorSet;if(e.file){if(!Array.isArray(e.file))throw TypeError(".google.protobuf.FileDescriptorSet.file: array expected");t.file=[];for(var n=0;n<e.file.length;++n){if("object"!=typeof e.file[n])throw TypeError(".google.protobuf.FileDescriptorSet.file: object expected");t.file[n]=u.google.protobuf.FileDescriptorProto.fromObject(e.file[n])}}return t},ie.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.file=[]),e.file&&e.file.length){n.file=[];for(var r=0;r<e.file.length;++r)n.file[r]=u.google.protobuf.FileDescriptorProto.toObject(e.file[r],t)}return n},ie.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},ie),i.FileDescriptorProto=(S.prototype.name="",S.prototype.package="",S.prototype.dependency=c.emptyArray,S.prototype.publicDependency=c.emptyArray,S.prototype.weakDependency=c.emptyArray,S.prototype.messageType=c.emptyArray,S.prototype.enumType=c.emptyArray,S.prototype.service=c.emptyArray,S.prototype.extension=c.emptyArray,S.prototype.options=null,S.prototype.sourceCodeInfo=null,S.prototype.syntax="",S.create=function(e){return new S(e)},S.encode=function(e,t){if(t=t||a.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),null!=e.package&&Object.hasOwnProperty.call(e,"package")&&t.uint32(18).string(e.package),null!=e.dependency&&e.dependency.length)for(var n=0;n<e.dependency.length;++n)t.uint32(26).string(e.dependency[n]);if(null!=e.messageType&&e.messageType.length)for(n=0;n<e.messageType.length;++n)u.google.protobuf.DescriptorProto.encode(e.messageType[n],t.uint32(34).fork()).ldelim();if(null!=e.enumType&&e.enumType.length)for(n=0;n<e.enumType.length;++n)u.google.protobuf.EnumDescriptorProto.encode(e.enumType[n],t.uint32(42).fork()).ldelim();if(null!=e.service&&e.service.length)for(n=0;n<e.service.length;++n)u.google.protobuf.ServiceDescriptorProto.encode(e.service[n],t.uint32(50).fork()).ldelim();if(null!=e.extension&&e.extension.length)for(n=0;n<e.extension.length;++n)u.google.protobuf.FieldDescriptorProto.encode(e.extension[n],t.uint32(58).fork()).ldelim();if(null!=e.options&&Object.hasOwnProperty.call(e,"options")&&u.google.protobuf.FileOptions.encode(e.options,t.uint32(66).fork()).ldelim(),null!=e.sourceCodeInfo&&Object.hasOwnProperty.call(e,"sourceCodeInfo")&&u.google.protobuf.SourceCodeInfo.encode(e.sourceCodeInfo,t.uint32(74).fork()).ldelim(),null!=e.publicDependency&&e.publicDependency.length)for(n=0;n<e.publicDependency.length;++n)t.uint32(80).int32(e.publicDependency[n]);if(null!=e.weakDependency&&e.weakDependency.length)for(n=0;n<e.weakDependency.length;++n)t.uint32(88).int32(e.weakDependency[n]);return null!=e.syntax&&Object.hasOwnProperty.call(e,"syntax")&&t.uint32(98).string(e.syntax),t},S.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},S.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.FileDescriptorProto;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:r.name=e.string();break;case 2:r.package=e.string();break;case 3:r.dependency&&r.dependency.length||(r.dependency=[]),r.dependency.push(e.string());break;case 10:if(r.publicDependency&&r.publicDependency.length||(r.publicDependency=[]),2==(7&o))for(var i=e.uint32()+e.pos;e.pos<i;)r.publicDependency.push(e.int32());else r.publicDependency.push(e.int32());break;case 11:if(r.weakDependency&&r.weakDependency.length||(r.weakDependency=[]),2==(7&o))for(i=e.uint32()+e.pos;e.pos<i;)r.weakDependency.push(e.int32());else r.weakDependency.push(e.int32());break;case 4:r.messageType&&r.messageType.length||(r.messageType=[]),r.messageType.push(u.google.protobuf.DescriptorProto.decode(e,e.uint32()));break;case 5:r.enumType&&r.enumType.length||(r.enumType=[]),r.enumType.push(u.google.protobuf.EnumDescriptorProto.decode(e,e.uint32()));break;case 6:r.service&&r.service.length||(r.service=[]),r.service.push(u.google.protobuf.ServiceDescriptorProto.decode(e,e.uint32()));break;case 7:r.extension&&r.extension.length||(r.extension=[]),r.extension.push(u.google.protobuf.FieldDescriptorProto.decode(e,e.uint32()));break;case 8:r.options=u.google.protobuf.FileOptions.decode(e,e.uint32());break;case 9:r.sourceCodeInfo=u.google.protobuf.SourceCodeInfo.decode(e,e.uint32());break;case 12:r.syntax=e.string();break;default:e.skipType(7&o)}}return r},S.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},S.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.name&&e.hasOwnProperty("name")&&!c.isString(e.name))return"name: string expected";if(null!=e.package&&e.hasOwnProperty("package")&&!c.isString(e.package))return"package: string expected";if(null!=e.dependency&&e.hasOwnProperty("dependency")){if(!Array.isArray(e.dependency))return"dependency: array expected";for(var t=0;t<e.dependency.length;++t)if(!c.isString(e.dependency[t]))return"dependency: string[] expected"}if(null!=e.publicDependency&&e.hasOwnProperty("publicDependency")){if(!Array.isArray(e.publicDependency))return"publicDependency: array expected";for(t=0;t<e.publicDependency.length;++t)if(!c.isInteger(e.publicDependency[t]))return"publicDependency: integer[] expected"}if(null!=e.weakDependency&&e.hasOwnProperty("weakDependency")){if(!Array.isArray(e.weakDependency))return"weakDependency: array expected";for(t=0;t<e.weakDependency.length;++t)if(!c.isInteger(e.weakDependency[t]))return"weakDependency: integer[] expected"}if(null!=e.messageType&&e.hasOwnProperty("messageType")){if(!Array.isArray(e.messageType))return"messageType: array expected";for(t=0;t<e.messageType.length;++t)if(n=u.google.protobuf.DescriptorProto.verify(e.messageType[t]))return"messageType."+n}if(null!=e.enumType&&e.hasOwnProperty("enumType")){if(!Array.isArray(e.enumType))return"enumType: array expected";for(t=0;t<e.enumType.length;++t)if(n=u.google.protobuf.EnumDescriptorProto.verify(e.enumType[t]))return"enumType."+n}if(null!=e.service&&e.hasOwnProperty("service")){if(!Array.isArray(e.service))return"service: array expected";for(t=0;t<e.service.length;++t)if(n=u.google.protobuf.ServiceDescriptorProto.verify(e.service[t]))return"service."+n}if(null!=e.extension&&e.hasOwnProperty("extension")){if(!Array.isArray(e.extension))return"extension: array expected";for(t=0;t<e.extension.length;++t)if(n=u.google.protobuf.FieldDescriptorProto.verify(e.extension[t]))return"extension."+n}var n;if(null!=e.options&&e.hasOwnProperty("options")&&(n=u.google.protobuf.FileOptions.verify(e.options)))return"options."+n;if(null!=e.sourceCodeInfo&&e.hasOwnProperty("sourceCodeInfo")&&(n=u.google.protobuf.SourceCodeInfo.verify(e.sourceCodeInfo)))return"sourceCodeInfo."+n;return null!=e.syntax&&e.hasOwnProperty("syntax")&&!c.isString(e.syntax)?"syntax: string expected":null},S.fromObject=function(e){if(e instanceof u.google.protobuf.FileDescriptorProto)return e;var t=new u.google.protobuf.FileDescriptorProto;if(null!=e.name&&(t.name=String(e.name)),null!=e.package&&(t.package=String(e.package)),e.dependency){if(!Array.isArray(e.dependency))throw TypeError(".google.protobuf.FileDescriptorProto.dependency: array expected");t.dependency=[];for(var n=0;n<e.dependency.length;++n)t.dependency[n]=String(e.dependency[n])}if(e.publicDependency){if(!Array.isArray(e.publicDependency))throw TypeError(".google.protobuf.FileDescriptorProto.publicDependency: array expected");t.publicDependency=[];for(n=0;n<e.publicDependency.length;++n)t.publicDependency[n]=0|e.publicDependency[n]}if(e.weakDependency){if(!Array.isArray(e.weakDependency))throw TypeError(".google.protobuf.FileDescriptorProto.weakDependency: array expected");t.weakDependency=[];for(n=0;n<e.weakDependency.length;++n)t.weakDependency[n]=0|e.weakDependency[n]}if(e.messageType){if(!Array.isArray(e.messageType))throw TypeError(".google.protobuf.FileDescriptorProto.messageType: array expected");t.messageType=[];for(n=0;n<e.messageType.length;++n){if("object"!=typeof e.messageType[n])throw TypeError(".google.protobuf.FileDescriptorProto.messageType: object expected");t.messageType[n]=u.google.protobuf.DescriptorProto.fromObject(e.messageType[n])}}if(e.enumType){if(!Array.isArray(e.enumType))throw TypeError(".google.protobuf.FileDescriptorProto.enumType: array expected");t.enumType=[];for(n=0;n<e.enumType.length;++n){if("object"!=typeof e.enumType[n])throw TypeError(".google.protobuf.FileDescriptorProto.enumType: object expected");t.enumType[n]=u.google.protobuf.EnumDescriptorProto.fromObject(e.enumType[n])}}if(e.service){if(!Array.isArray(e.service))throw TypeError(".google.protobuf.FileDescriptorProto.service: array expected");t.service=[];for(n=0;n<e.service.length;++n){if("object"!=typeof e.service[n])throw TypeError(".google.protobuf.FileDescriptorProto.service: object expected");t.service[n]=u.google.protobuf.ServiceDescriptorProto.fromObject(e.service[n])}}if(e.extension){if(!Array.isArray(e.extension))throw TypeError(".google.protobuf.FileDescriptorProto.extension: array expected");t.extension=[];for(n=0;n<e.extension.length;++n){if("object"!=typeof e.extension[n])throw TypeError(".google.protobuf.FileDescriptorProto.extension: object expected");t.extension[n]=u.google.protobuf.FieldDescriptorProto.fromObject(e.extension[n])}}if(null!=e.options){if("object"!=typeof e.options)throw TypeError(".google.protobuf.FileDescriptorProto.options: object expected");t.options=u.google.protobuf.FileOptions.fromObject(e.options)}if(null!=e.sourceCodeInfo){if("object"!=typeof e.sourceCodeInfo)throw TypeError(".google.protobuf.FileDescriptorProto.sourceCodeInfo: object expected");t.sourceCodeInfo=u.google.protobuf.SourceCodeInfo.fromObject(e.sourceCodeInfo)}return null!=e.syntax&&(t.syntax=String(e.syntax)),t},S.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.dependency=[],n.messageType=[],n.enumType=[],n.service=[],n.extension=[],n.publicDependency=[],n.weakDependency=[]),t.defaults&&(n.name="",n.package="",n.options=null,n.sourceCodeInfo=null,n.syntax=""),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),null!=e.package&&e.hasOwnProperty("package")&&(n.package=e.package),e.dependency&&e.dependency.length){n.dependency=[];for(var r=0;r<e.dependency.length;++r)n.dependency[r]=e.dependency[r]}if(e.messageType&&e.messageType.length){n.messageType=[];for(r=0;r<e.messageType.length;++r)n.messageType[r]=u.google.protobuf.DescriptorProto.toObject(e.messageType[r],t)}if(e.enumType&&e.enumType.length){n.enumType=[];for(r=0;r<e.enumType.length;++r)n.enumType[r]=u.google.protobuf.EnumDescriptorProto.toObject(e.enumType[r],t)}if(e.service&&e.service.length){n.service=[];for(r=0;r<e.service.length;++r)n.service[r]=u.google.protobuf.ServiceDescriptorProto.toObject(e.service[r],t)}if(e.extension&&e.extension.length){n.extension=[];for(r=0;r<e.extension.length;++r)n.extension[r]=u.google.protobuf.FieldDescriptorProto.toObject(e.extension[r],t)}if(null!=e.options&&e.hasOwnProperty("options")&&(n.options=u.google.protobuf.FileOptions.toObject(e.options,t)),null!=e.sourceCodeInfo&&e.hasOwnProperty("sourceCodeInfo")&&(n.sourceCodeInfo=u.google.protobuf.SourceCodeInfo.toObject(e.sourceCodeInfo,t)),e.publicDependency&&e.publicDependency.length){n.publicDependency=[];for(r=0;r<e.publicDependency.length;++r)n.publicDependency[r]=e.publicDependency[r]}if(e.weakDependency&&e.weakDependency.length){n.weakDependency=[];for(r=0;r<e.weakDependency.length;++r)n.weakDependency[r]=e.weakDependency[r]}return null!=e.syntax&&e.hasOwnProperty("syntax")&&(n.syntax=e.syntax),n},S.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},S),i.DescriptorProto=(k.prototype.name="",k.prototype.field=c.emptyArray,k.prototype.extension=c.emptyArray,k.prototype.nestedType=c.emptyArray,k.prototype.enumType=c.emptyArray,k.prototype.extensionRange=c.emptyArray,k.prototype.oneofDecl=c.emptyArray,k.prototype.options=null,k.prototype.reservedRange=c.emptyArray,k.prototype.reservedName=c.emptyArray,k.create=function(e){return new k(e)},k.encode=function(e,t){if(t=t||a.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),null!=e.field&&e.field.length)for(var n=0;n<e.field.length;++n)u.google.protobuf.FieldDescriptorProto.encode(e.field[n],t.uint32(18).fork()).ldelim();if(null!=e.nestedType&&e.nestedType.length)for(n=0;n<e.nestedType.length;++n)u.google.protobuf.DescriptorProto.encode(e.nestedType[n],t.uint32(26).fork()).ldelim();if(null!=e.enumType&&e.enumType.length)for(n=0;n<e.enumType.length;++n)u.google.protobuf.EnumDescriptorProto.encode(e.enumType[n],t.uint32(34).fork()).ldelim();if(null!=e.extensionRange&&e.extensionRange.length)for(n=0;n<e.extensionRange.length;++n)u.google.protobuf.DescriptorProto.ExtensionRange.encode(e.extensionRange[n],t.uint32(42).fork()).ldelim();if(null!=e.extension&&e.extension.length)for(n=0;n<e.extension.length;++n)u.google.protobuf.FieldDescriptorProto.encode(e.extension[n],t.uint32(50).fork()).ldelim();if(null!=e.options&&Object.hasOwnProperty.call(e,"options")&&u.google.protobuf.MessageOptions.encode(e.options,t.uint32(58).fork()).ldelim(),null!=e.oneofDecl&&e.oneofDecl.length)for(n=0;n<e.oneofDecl.length;++n)u.google.protobuf.OneofDescriptorProto.encode(e.oneofDecl[n],t.uint32(66).fork()).ldelim();if(null!=e.reservedRange&&e.reservedRange.length)for(n=0;n<e.reservedRange.length;++n)u.google.protobuf.DescriptorProto.ReservedRange.encode(e.reservedRange[n],t.uint32(74).fork()).ldelim();if(null!=e.reservedName&&e.reservedName.length)for(n=0;n<e.reservedName.length;++n)t.uint32(82).string(e.reservedName[n]);return t},k.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},k.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.DescriptorProto;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:r.name=e.string();break;case 2:r.field&&r.field.length||(r.field=[]),r.field.push(u.google.protobuf.FieldDescriptorProto.decode(e,e.uint32()));break;case 6:r.extension&&r.extension.length||(r.extension=[]),r.extension.push(u.google.protobuf.FieldDescriptorProto.decode(e,e.uint32()));break;case 3:r.nestedType&&r.nestedType.length||(r.nestedType=[]),r.nestedType.push(u.google.protobuf.DescriptorProto.decode(e,e.uint32()));break;case 4:r.enumType&&r.enumType.length||(r.enumType=[]),r.enumType.push(u.google.protobuf.EnumDescriptorProto.decode(e,e.uint32()));break;case 5:r.extensionRange&&r.extensionRange.length||(r.extensionRange=[]),r.extensionRange.push(u.google.protobuf.DescriptorProto.ExtensionRange.decode(e,e.uint32()));break;case 8:r.oneofDecl&&r.oneofDecl.length||(r.oneofDecl=[]),r.oneofDecl.push(u.google.protobuf.OneofDescriptorProto.decode(e,e.uint32()));break;case 7:r.options=u.google.protobuf.MessageOptions.decode(e,e.uint32());break;case 9:r.reservedRange&&r.reservedRange.length||(r.reservedRange=[]),r.reservedRange.push(u.google.protobuf.DescriptorProto.ReservedRange.decode(e,e.uint32()));break;case 10:r.reservedName&&r.reservedName.length||(r.reservedName=[]),r.reservedName.push(e.string());break;default:e.skipType(7&o)}}return r},k.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},k.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.name&&e.hasOwnProperty("name")&&!c.isString(e.name))return"name: string expected";if(null!=e.field&&e.hasOwnProperty("field")){if(!Array.isArray(e.field))return"field: array expected";for(var t=0;t<e.field.length;++t)if(n=u.google.protobuf.FieldDescriptorProto.verify(e.field[t]))return"field."+n}if(null!=e.extension&&e.hasOwnProperty("extension")){if(!Array.isArray(e.extension))return"extension: array expected";for(t=0;t<e.extension.length;++t)if(n=u.google.protobuf.FieldDescriptorProto.verify(e.extension[t]))return"extension."+n}if(null!=e.nestedType&&e.hasOwnProperty("nestedType")){if(!Array.isArray(e.nestedType))return"nestedType: array expected";for(t=0;t<e.nestedType.length;++t)if(n=u.google.protobuf.DescriptorProto.verify(e.nestedType[t]))return"nestedType."+n}if(null!=e.enumType&&e.hasOwnProperty("enumType")){if(!Array.isArray(e.enumType))return"enumType: array expected";for(t=0;t<e.enumType.length;++t)if(n=u.google.protobuf.EnumDescriptorProto.verify(e.enumType[t]))return"enumType."+n}if(null!=e.extensionRange&&e.hasOwnProperty("extensionRange")){if(!Array.isArray(e.extensionRange))return"extensionRange: array expected";for(t=0;t<e.extensionRange.length;++t)if(n=u.google.protobuf.DescriptorProto.ExtensionRange.verify(e.extensionRange[t]))return"extensionRange."+n}if(null!=e.oneofDecl&&e.hasOwnProperty("oneofDecl")){if(!Array.isArray(e.oneofDecl))return"oneofDecl: array expected";for(t=0;t<e.oneofDecl.length;++t)if(n=u.google.protobuf.OneofDescriptorProto.verify(e.oneofDecl[t]))return"oneofDecl."+n}if(null!=e.options&&e.hasOwnProperty("options")&&(n=u.google.protobuf.MessageOptions.verify(e.options)))return"options."+n;if(null!=e.reservedRange&&e.hasOwnProperty("reservedRange")){if(!Array.isArray(e.reservedRange))return"reservedRange: array expected";for(var n,t=0;t<e.reservedRange.length;++t)if(n=u.google.protobuf.DescriptorProto.ReservedRange.verify(e.reservedRange[t]))return"reservedRange."+n}if(null!=e.reservedName&&e.hasOwnProperty("reservedName")){if(!Array.isArray(e.reservedName))return"reservedName: array expected";for(t=0;t<e.reservedName.length;++t)if(!c.isString(e.reservedName[t]))return"reservedName: string[] expected"}return null},k.fromObject=function(e){if(e instanceof u.google.protobuf.DescriptorProto)return e;var t=new u.google.protobuf.DescriptorProto;if(null!=e.name&&(t.name=String(e.name)),e.field){if(!Array.isArray(e.field))throw TypeError(".google.protobuf.DescriptorProto.field: array expected");t.field=[];for(var n=0;n<e.field.length;++n){if("object"!=typeof e.field[n])throw TypeError(".google.protobuf.DescriptorProto.field: object expected");t.field[n]=u.google.protobuf.FieldDescriptorProto.fromObject(e.field[n])}}if(e.extension){if(!Array.isArray(e.extension))throw TypeError(".google.protobuf.DescriptorProto.extension: array expected");t.extension=[];for(n=0;n<e.extension.length;++n){if("object"!=typeof e.extension[n])throw TypeError(".google.protobuf.DescriptorProto.extension: object expected");t.extension[n]=u.google.protobuf.FieldDescriptorProto.fromObject(e.extension[n])}}if(e.nestedType){if(!Array.isArray(e.nestedType))throw TypeError(".google.protobuf.DescriptorProto.nestedType: array expected");t.nestedType=[];for(n=0;n<e.nestedType.length;++n){if("object"!=typeof e.nestedType[n])throw TypeError(".google.protobuf.DescriptorProto.nestedType: object expected");t.nestedType[n]=u.google.protobuf.DescriptorProto.fromObject(e.nestedType[n])}}if(e.enumType){if(!Array.isArray(e.enumType))throw TypeError(".google.protobuf.DescriptorProto.enumType: array expected");t.enumType=[];for(n=0;n<e.enumType.length;++n){if("object"!=typeof e.enumType[n])throw TypeError(".google.protobuf.DescriptorProto.enumType: object expected");t.enumType[n]=u.google.protobuf.EnumDescriptorProto.fromObject(e.enumType[n])}}if(e.extensionRange){if(!Array.isArray(e.extensionRange))throw TypeError(".google.protobuf.DescriptorProto.extensionRange: array expected");t.extensionRange=[];for(n=0;n<e.extensionRange.length;++n){if("object"!=typeof e.extensionRange[n])throw TypeError(".google.protobuf.DescriptorProto.extensionRange: object expected");t.extensionRange[n]=u.google.protobuf.DescriptorProto.ExtensionRange.fromObject(e.extensionRange[n])}}if(e.oneofDecl){if(!Array.isArray(e.oneofDecl))throw TypeError(".google.protobuf.DescriptorProto.oneofDecl: array expected");t.oneofDecl=[];for(n=0;n<e.oneofDecl.length;++n){if("object"!=typeof e.oneofDecl[n])throw TypeError(".google.protobuf.DescriptorProto.oneofDecl: object expected");t.oneofDecl[n]=u.google.protobuf.OneofDescriptorProto.fromObject(e.oneofDecl[n])}}if(null!=e.options){if("object"!=typeof e.options)throw TypeError(".google.protobuf.DescriptorProto.options: object expected");t.options=u.google.protobuf.MessageOptions.fromObject(e.options)}if(e.reservedRange){if(!Array.isArray(e.reservedRange))throw TypeError(".google.protobuf.DescriptorProto.reservedRange: array expected");t.reservedRange=[];for(n=0;n<e.reservedRange.length;++n){if("object"!=typeof e.reservedRange[n])throw TypeError(".google.protobuf.DescriptorProto.reservedRange: object expected");t.reservedRange[n]=u.google.protobuf.DescriptorProto.ReservedRange.fromObject(e.reservedRange[n])}}if(e.reservedName){if(!Array.isArray(e.reservedName))throw TypeError(".google.protobuf.DescriptorProto.reservedName: array expected");t.reservedName=[];for(n=0;n<e.reservedName.length;++n)t.reservedName[n]=String(e.reservedName[n])}return t},k.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.field=[],n.nestedType=[],n.enumType=[],n.extensionRange=[],n.extension=[],n.oneofDecl=[],n.reservedRange=[],n.reservedName=[]),t.defaults&&(n.name="",n.options=null),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),e.field&&e.field.length){n.field=[];for(var r=0;r<e.field.length;++r)n.field[r]=u.google.protobuf.FieldDescriptorProto.toObject(e.field[r],t)}if(e.nestedType&&e.nestedType.length){n.nestedType=[];for(r=0;r<e.nestedType.length;++r)n.nestedType[r]=u.google.protobuf.DescriptorProto.toObject(e.nestedType[r],t)}if(e.enumType&&e.enumType.length){n.enumType=[];for(r=0;r<e.enumType.length;++r)n.enumType[r]=u.google.protobuf.EnumDescriptorProto.toObject(e.enumType[r],t)}if(e.extensionRange&&e.extensionRange.length){n.extensionRange=[];for(r=0;r<e.extensionRange.length;++r)n.extensionRange[r]=u.google.protobuf.DescriptorProto.ExtensionRange.toObject(e.extensionRange[r],t)}if(e.extension&&e.extension.length){n.extension=[];for(r=0;r<e.extension.length;++r)n.extension[r]=u.google.protobuf.FieldDescriptorProto.toObject(e.extension[r],t)}if(null!=e.options&&e.hasOwnProperty("options")&&(n.options=u.google.protobuf.MessageOptions.toObject(e.options,t)),e.oneofDecl&&e.oneofDecl.length){n.oneofDecl=[];for(r=0;r<e.oneofDecl.length;++r)n.oneofDecl[r]=u.google.protobuf.OneofDescriptorProto.toObject(e.oneofDecl[r],t)}if(e.reservedRange&&e.reservedRange.length){n.reservedRange=[];for(r=0;r<e.reservedRange.length;++r)n.reservedRange[r]=u.google.protobuf.DescriptorProto.ReservedRange.toObject(e.reservedRange[r],t)}if(e.reservedName&&e.reservedName.length){n.reservedName=[];for(r=0;r<e.reservedName.length;++r)n.reservedName[r]=e.reservedName[r]}return n},k.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},k.ExtensionRange=(ae.prototype.start=0,ae.prototype.end=0,ae.prototype.options=null,ae.create=function(e){return new ae(e)},ae.encode=function(e,t){return t=t||a.create(),null!=e.start&&Object.hasOwnProperty.call(e,"start")&&t.uint32(8).int32(e.start),null!=e.end&&Object.hasOwnProperty.call(e,"end")&&t.uint32(16).int32(e.end),null!=e.options&&Object.hasOwnProperty.call(e,"options")&&u.google.protobuf.ExtensionRangeOptions.encode(e.options,t.uint32(26).fork()).ldelim(),t},ae.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},ae.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.DescriptorProto.ExtensionRange;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:r.start=e.int32();break;case 2:r.end=e.int32();break;case 3:r.options=u.google.protobuf.ExtensionRangeOptions.decode(e,e.uint32());break;default:e.skipType(7&o)}}return r},ae.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},ae.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.start&&e.hasOwnProperty("start")&&!c.isInteger(e.start))return"start: integer expected";if(null!=e.end&&e.hasOwnProperty("end")&&!c.isInteger(e.end))return"end: integer expected";if(null!=e.options&&e.hasOwnProperty("options")){e=u.google.protobuf.ExtensionRangeOptions.verify(e.options);if(e)return"options."+e}return null},ae.fromObject=function(e){if(e instanceof u.google.protobuf.DescriptorProto.ExtensionRange)return e;var t=new u.google.protobuf.DescriptorProto.ExtensionRange;if(null!=e.start&&(t.start=0|e.start),null!=e.end&&(t.end=0|e.end),null!=e.options){if("object"!=typeof e.options)throw TypeError(".google.protobuf.DescriptorProto.ExtensionRange.options: object expected");t.options=u.google.protobuf.ExtensionRangeOptions.fromObject(e.options)}return t},ae.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.start=0,n.end=0,n.options=null),null!=e.start&&e.hasOwnProperty("start")&&(n.start=e.start),null!=e.end&&e.hasOwnProperty("end")&&(n.end=e.end),null!=e.options&&e.hasOwnProperty("options")&&(n.options=u.google.protobuf.ExtensionRangeOptions.toObject(e.options,t)),n},ae.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},ae),k.ReservedRange=(pe.prototype.start=0,pe.prototype.end=0,pe.create=function(e){return new pe(e)},pe.encode=function(e,t){return t=t||a.create(),null!=e.start&&Object.hasOwnProperty.call(e,"start")&&t.uint32(8).int32(e.start),null!=e.end&&Object.hasOwnProperty.call(e,"end")&&t.uint32(16).int32(e.end),t},pe.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},pe.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.DescriptorProto.ReservedRange;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:r.start=e.int32();break;case 2:r.end=e.int32();break;default:e.skipType(7&o)}}return r},pe.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},pe.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.start&&e.hasOwnProperty("start")&&!c.isInteger(e.start)?"start: integer expected":null!=e.end&&e.hasOwnProperty("end")&&!c.isInteger(e.end)?"end: integer expected":null},pe.fromObject=function(e){var t;return e instanceof u.google.protobuf.DescriptorProto.ReservedRange?e:(t=new u.google.protobuf.DescriptorProto.ReservedRange,null!=e.start&&(t.start=0|e.start),null!=e.end&&(t.end=0|e.end),t)},pe.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.start=0,n.end=0),null!=e.start&&e.hasOwnProperty("start")&&(n.start=e.start),null!=e.end&&e.hasOwnProperty("end")&&(n.end=e.end),n},pe.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},pe),k),i.ExtensionRangeOptions=(le.prototype.uninterpretedOption=c.emptyArray,le.create=function(e){return new le(e)},le.encode=function(e,t){if(t=t||a.create(),null!=e.uninterpretedOption&&e.uninterpretedOption.length)for(var n=0;n<e.uninterpretedOption.length;++n)u.google.protobuf.UninterpretedOption.encode(e.uninterpretedOption[n],t.uint32(7994).fork()).ldelim();return t},le.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},le.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.ExtensionRangeOptions;e.pos<n;){var o=e.uint32();o>>>3==999?(r.uninterpretedOption&&r.uninterpretedOption.length||(r.uninterpretedOption=[]),r.uninterpretedOption.push(u.google.protobuf.UninterpretedOption.decode(e,e.uint32()))):e.skipType(7&o)}return r},le.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},le.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.uninterpretedOption&&e.hasOwnProperty("uninterpretedOption")){if(!Array.isArray(e.uninterpretedOption))return"uninterpretedOption: array expected";for(var t=0;t<e.uninterpretedOption.length;++t){var n=u.google.protobuf.UninterpretedOption.verify(e.uninterpretedOption[t]);if(n)return"uninterpretedOption."+n}}return null},le.fromObject=function(e){if(e instanceof u.google.protobuf.ExtensionRangeOptions)return e;var t=new u.google.protobuf.ExtensionRangeOptions;if(e.uninterpretedOption){if(!Array.isArray(e.uninterpretedOption))throw TypeError(".google.protobuf.ExtensionRangeOptions.uninterpretedOption: array expected");t.uninterpretedOption=[];for(var n=0;n<e.uninterpretedOption.length;++n){if("object"!=typeof e.uninterpretedOption[n])throw TypeError(".google.protobuf.ExtensionRangeOptions.uninterpretedOption: object expected");t.uninterpretedOption[n]=u.google.protobuf.UninterpretedOption.fromObject(e.uninterpretedOption[n])}}return t},le.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.uninterpretedOption=[]),e.uninterpretedOption&&e.uninterpretedOption.length){n.uninterpretedOption=[];for(var r=0;r<e.uninterpretedOption.length;++r)n.uninterpretedOption[r]=u.google.protobuf.UninterpretedOption.toObject(e.uninterpretedOption[r],t)}return n},le.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},le),i.FieldDescriptorProto=(T.prototype.name="",T.prototype.number=0,T.prototype.label=1,T.prototype.type=1,T.prototype.typeName="",T.prototype.extendee="",T.prototype.defaultValue="",T.prototype.oneofIndex=0,T.prototype.jsonName="",T.prototype.options=null,T.prototype.proto3Optional=!1,T.create=function(e){return new T(e)},T.encode=function(e,t){return t=t||a.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),null!=e.extendee&&Object.hasOwnProperty.call(e,"extendee")&&t.uint32(18).string(e.extendee),null!=e.number&&Object.hasOwnProperty.call(e,"number")&&t.uint32(24).int32(e.number),null!=e.label&&Object.hasOwnProperty.call(e,"label")&&t.uint32(32).int32(e.label),null!=e.type&&Object.hasOwnProperty.call(e,"type")&&t.uint32(40).int32(e.type),null!=e.typeName&&Object.hasOwnProperty.call(e,"typeName")&&t.uint32(50).string(e.typeName),null!=e.defaultValue&&Object.hasOwnProperty.call(e,"defaultValue")&&t.uint32(58).string(e.defaultValue),null!=e.options&&Object.hasOwnProperty.call(e,"options")&&u.google.protobuf.FieldOptions.encode(e.options,t.uint32(66).fork()).ldelim(),null!=e.oneofIndex&&Object.hasOwnProperty.call(e,"oneofIndex")&&t.uint32(72).int32(e.oneofIndex),null!=e.jsonName&&Object.hasOwnProperty.call(e,"jsonName")&&t.uint32(82).string(e.jsonName),null!=e.proto3Optional&&Object.hasOwnProperty.call(e,"proto3Optional")&&t.uint32(136).bool(e.proto3Optional),t},T.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},T.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.FieldDescriptorProto;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:r.name=e.string();break;case 3:r.number=e.int32();break;case 4:r.label=e.int32();break;case 5:r.type=e.int32();break;case 6:r.typeName=e.string();break;case 2:r.extendee=e.string();break;case 7:r.defaultValue=e.string();break;case 9:r.oneofIndex=e.int32();break;case 10:r.jsonName=e.string();break;case 8:r.options=u.google.protobuf.FieldOptions.decode(e,e.uint32());break;case 17:r.proto3Optional=e.bool();break;default:e.skipType(7&o)}}return r},T.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},T.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.name&&e.hasOwnProperty("name")&&!c.isString(e.name))return"name: string expected";if(null!=e.number&&e.hasOwnProperty("number")&&!c.isInteger(e.number))return"number: integer expected";if(null!=e.label&&e.hasOwnProperty("label"))switch(e.label){default:return"label: enum value expected";case 1:case 2:case 3:}if(null!=e.type&&e.hasOwnProperty("type"))switch(e.type){default:return"type: enum value expected";case 1:case 2:case 3:case 4:case 5:case 6:case 7:case 8:case 9:case 10:case 11:case 12:case 13:case 14:case 15:case 16:case 17:case 18:}if(null!=e.typeName&&e.hasOwnProperty("typeName")&&!c.isString(e.typeName))return"typeName: string expected";if(null!=e.extendee&&e.hasOwnProperty("extendee")&&!c.isString(e.extendee))return"extendee: string expected";if(null!=e.defaultValue&&e.hasOwnProperty("defaultValue")&&!c.isString(e.defaultValue))return"defaultValue: string expected";if(null!=e.oneofIndex&&e.hasOwnProperty("oneofIndex")&&!c.isInteger(e.oneofIndex))return"oneofIndex: integer expected";if(null!=e.jsonName&&e.hasOwnProperty("jsonName")&&!c.isString(e.jsonName))return"jsonName: string expected";if(null!=e.options&&e.hasOwnProperty("options")){var t=u.google.protobuf.FieldOptions.verify(e.options);if(t)return"options."+t}return null!=e.proto3Optional&&e.hasOwnProperty("proto3Optional")&&"boolean"!=typeof e.proto3Optional?"proto3Optional: boolean expected":null},T.fromObject=function(e){if(e instanceof u.google.protobuf.FieldDescriptorProto)return e;var t=new u.google.protobuf.FieldDescriptorProto;switch(null!=e.name&&(t.name=String(e.name)),null!=e.number&&(t.number=0|e.number),e.label){case"LABEL_OPTIONAL":case 1:t.label=1;break;case"LABEL_REQUIRED":case 2:t.label=2;break;case"LABEL_REPEATED":case 3:t.label=3}switch(e.type){case"TYPE_DOUBLE":case 1:t.type=1;break;case"TYPE_FLOAT":case 2:t.type=2;break;case"TYPE_INT64":case 3:t.type=3;break;case"TYPE_UINT64":case 4:t.type=4;break;case"TYPE_INT32":case 5:t.type=5;break;case"TYPE_FIXED64":case 6:t.type=6;break;case"TYPE_FIXED32":case 7:t.type=7;break;case"TYPE_BOOL":case 8:t.type=8;break;case"TYPE_STRING":case 9:t.type=9;break;case"TYPE_GROUP":case 10:t.type=10;break;case"TYPE_MESSAGE":case 11:t.type=11;break;case"TYPE_BYTES":case 12:t.type=12;break;case"TYPE_UINT32":case 13:t.type=13;break;case"TYPE_ENUM":case 14:t.type=14;break;case"TYPE_SFIXED32":case 15:t.type=15;break;case"TYPE_SFIXED64":case 16:t.type=16;break;case"TYPE_SINT32":case 17:t.type=17;break;case"TYPE_SINT64":case 18:t.type=18}if(null!=e.typeName&&(t.typeName=String(e.typeName)),null!=e.extendee&&(t.extendee=String(e.extendee)),null!=e.defaultValue&&(t.defaultValue=String(e.defaultValue)),null!=e.oneofIndex&&(t.oneofIndex=0|e.oneofIndex),null!=e.jsonName&&(t.jsonName=String(e.jsonName)),null!=e.options){if("object"!=typeof e.options)throw TypeError(".google.protobuf.FieldDescriptorProto.options: object expected");t.options=u.google.protobuf.FieldOptions.fromObject(e.options)}return null!=e.proto3Optional&&(t.proto3Optional=Boolean(e.proto3Optional)),t},T.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.name="",n.extendee="",n.number=0,n.label=t.enums===String?"LABEL_OPTIONAL":1,n.type=t.enums===String?"TYPE_DOUBLE":1,n.typeName="",n.defaultValue="",n.options=null,n.oneofIndex=0,n.jsonName="",n.proto3Optional=!1),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),null!=e.extendee&&e.hasOwnProperty("extendee")&&(n.extendee=e.extendee),null!=e.number&&e.hasOwnProperty("number")&&(n.number=e.number),null!=e.label&&e.hasOwnProperty("label")&&(n.label=t.enums===String?u.google.protobuf.FieldDescriptorProto.Label[e.label]:e.label),null!=e.type&&e.hasOwnProperty("type")&&(n.type=t.enums===String?u.google.protobuf.FieldDescriptorProto.Type[e.type]:e.type),null!=e.typeName&&e.hasOwnProperty("typeName")&&(n.typeName=e.typeName),null!=e.defaultValue&&e.hasOwnProperty("defaultValue")&&(n.defaultValue=e.defaultValue),null!=e.options&&e.hasOwnProperty("options")&&(n.options=u.google.protobuf.FieldOptions.toObject(e.options,t)),null!=e.oneofIndex&&e.hasOwnProperty("oneofIndex")&&(n.oneofIndex=e.oneofIndex),null!=e.jsonName&&e.hasOwnProperty("jsonName")&&(n.jsonName=e.jsonName),null!=e.proto3Optional&&e.hasOwnProperty("proto3Optional")&&(n.proto3Optional=e.proto3Optional),n},T.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},T.Type=(n={},(o=Object.create(n))[n[1]="TYPE_DOUBLE"]=1,o[n[2]="TYPE_FLOAT"]=2,o[n[3]="TYPE_INT64"]=3,o[n[4]="TYPE_UINT64"]=4,o[n[5]="TYPE_INT32"]=5,o[n[6]="TYPE_FIXED64"]=6,o[n[7]="TYPE_FIXED32"]=7,o[n[8]="TYPE_BOOL"]=8,o[n[9]="TYPE_STRING"]=9,o[n[10]="TYPE_GROUP"]=10,o[n[11]="TYPE_MESSAGE"]=11,o[n[12]="TYPE_BYTES"]=12,o[n[13]="TYPE_UINT32"]=13,o[n[14]="TYPE_ENUM"]=14,o[n[15]="TYPE_SFIXED32"]=15,o[n[16]="TYPE_SFIXED64"]=16,o[n[17]="TYPE_SINT32"]=17,o[n[18]="TYPE_SINT64"]=18,o),T.Label=(n={},(o=Object.create(n))[n[1]="LABEL_OPTIONAL"]=1,o[n[2]="LABEL_REQUIRED"]=2,o[n[3]="LABEL_REPEATED"]=3,o),T),i.OneofDescriptorProto=(se.prototype.name="",se.prototype.options=null,se.create=function(e){return new se(e)},se.encode=function(e,t){return t=t||a.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),null!=e.options&&Object.hasOwnProperty.call(e,"options")&&u.google.protobuf.OneofOptions.encode(e.options,t.uint32(18).fork()).ldelim(),t},se.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},se.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.OneofDescriptorProto;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:r.name=e.string();break;case 2:r.options=u.google.protobuf.OneofOptions.decode(e,e.uint32());break;default:e.skipType(7&o)}}return r},se.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},se.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.name&&e.hasOwnProperty("name")&&!c.isString(e.name))return"name: string expected";if(null!=e.options&&e.hasOwnProperty("options")){e=u.google.protobuf.OneofOptions.verify(e.options);if(e)return"options."+e}return null},se.fromObject=function(e){if(e instanceof u.google.protobuf.OneofDescriptorProto)return e;var t=new u.google.protobuf.OneofDescriptorProto;if(null!=e.name&&(t.name=String(e.name)),null!=e.options){if("object"!=typeof e.options)throw TypeError(".google.protobuf.OneofDescriptorProto.options: object expected");t.options=u.google.protobuf.OneofOptions.fromObject(e.options)}return t},se.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.name="",n.options=null),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),null!=e.options&&e.hasOwnProperty("options")&&(n.options=u.google.protobuf.OneofOptions.toObject(e.options,t)),n},se.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},se),i.EnumDescriptorProto=(x.prototype.name="",x.prototype.value=c.emptyArray,x.prototype.options=null,x.prototype.reservedRange=c.emptyArray,x.prototype.reservedName=c.emptyArray,x.create=function(e){return new x(e)},x.encode=function(e,t){if(t=t||a.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),null!=e.value&&e.value.length)for(var n=0;n<e.value.length;++n)u.google.protobuf.EnumValueDescriptorProto.encode(e.value[n],t.uint32(18).fork()).ldelim();if(null!=e.options&&Object.hasOwnProperty.call(e,"options")&&u.google.protobuf.EnumOptions.encode(e.options,t.uint32(26).fork()).ldelim(),null!=e.reservedRange&&e.reservedRange.length)for(n=0;n<e.reservedRange.length;++n)u.google.protobuf.EnumDescriptorProto.EnumReservedRange.encode(e.reservedRange[n],t.uint32(34).fork()).ldelim();if(null!=e.reservedName&&e.reservedName.length)for(n=0;n<e.reservedName.length;++n)t.uint32(42).string(e.reservedName[n]);return t},x.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},x.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.EnumDescriptorProto;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:r.name=e.string();break;case 2:r.value&&r.value.length||(r.value=[]),r.value.push(u.google.protobuf.EnumValueDescriptorProto.decode(e,e.uint32()));break;case 3:r.options=u.google.protobuf.EnumOptions.decode(e,e.uint32());break;case 4:r.reservedRange&&r.reservedRange.length||(r.reservedRange=[]),r.reservedRange.push(u.google.protobuf.EnumDescriptorProto.EnumReservedRange.decode(e,e.uint32()));break;case 5:r.reservedName&&r.reservedName.length||(r.reservedName=[]),r.reservedName.push(e.string());break;default:e.skipType(7&o)}}return r},x.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},x.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.name&&e.hasOwnProperty("name")&&!c.isString(e.name))return"name: string expected";if(null!=e.value&&e.hasOwnProperty("value")){if(!Array.isArray(e.value))return"value: array expected";for(var t=0;t<e.value.length;++t)if(n=u.google.protobuf.EnumValueDescriptorProto.verify(e.value[t]))return"value."+n}if(null!=e.options&&e.hasOwnProperty("options")&&(n=u.google.protobuf.EnumOptions.verify(e.options)))return"options."+n;if(null!=e.reservedRange&&e.hasOwnProperty("reservedRange")){if(!Array.isArray(e.reservedRange))return"reservedRange: array expected";for(var n,t=0;t<e.reservedRange.length;++t)if(n=u.google.protobuf.EnumDescriptorProto.EnumReservedRange.verify(e.reservedRange[t]))return"reservedRange."+n}if(null!=e.reservedName&&e.hasOwnProperty("reservedName")){if(!Array.isArray(e.reservedName))return"reservedName: array expected";for(t=0;t<e.reservedName.length;++t)if(!c.isString(e.reservedName[t]))return"reservedName: string[] expected"}return null},x.fromObject=function(e){if(e instanceof u.google.protobuf.EnumDescriptorProto)return e;var t=new u.google.protobuf.EnumDescriptorProto;if(null!=e.name&&(t.name=String(e.name)),e.value){if(!Array.isArray(e.value))throw TypeError(".google.protobuf.EnumDescriptorProto.value: array expected");t.value=[];for(var n=0;n<e.value.length;++n){if("object"!=typeof e.value[n])throw TypeError(".google.protobuf.EnumDescriptorProto.value: object expected");t.value[n]=u.google.protobuf.EnumValueDescriptorProto.fromObject(e.value[n])}}if(null!=e.options){if("object"!=typeof e.options)throw TypeError(".google.protobuf.EnumDescriptorProto.options: object expected");t.options=u.google.protobuf.EnumOptions.fromObject(e.options)}if(e.reservedRange){if(!Array.isArray(e.reservedRange))throw TypeError(".google.protobuf.EnumDescriptorProto.reservedRange: array expected");t.reservedRange=[];for(n=0;n<e.reservedRange.length;++n){if("object"!=typeof e.reservedRange[n])throw TypeError(".google.protobuf.EnumDescriptorProto.reservedRange: object expected");t.reservedRange[n]=u.google.protobuf.EnumDescriptorProto.EnumReservedRange.fromObject(e.reservedRange[n])}}if(e.reservedName){if(!Array.isArray(e.reservedName))throw TypeError(".google.protobuf.EnumDescriptorProto.reservedName: array expected");t.reservedName=[];for(n=0;n<e.reservedName.length;++n)t.reservedName[n]=String(e.reservedName[n])}return t},x.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.value=[],n.reservedRange=[],n.reservedName=[]),t.defaults&&(n.name="",n.options=null),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),e.value&&e.value.length){n.value=[];for(var r=0;r<e.value.length;++r)n.value[r]=u.google.protobuf.EnumValueDescriptorProto.toObject(e.value[r],t)}if(null!=e.options&&e.hasOwnProperty("options")&&(n.options=u.google.protobuf.EnumOptions.toObject(e.options,t)),e.reservedRange&&e.reservedRange.length){n.reservedRange=[];for(r=0;r<e.reservedRange.length;++r)n.reservedRange[r]=u.google.protobuf.EnumDescriptorProto.EnumReservedRange.toObject(e.reservedRange[r],t)}if(e.reservedName&&e.reservedName.length){n.reservedName=[];for(r=0;r<e.reservedName.length;++r)n.reservedName[r]=e.reservedName[r]}return n},x.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},x.EnumReservedRange=(ce.prototype.start=0,ce.prototype.end=0,ce.create=function(e){return new ce(e)},ce.encode=function(e,t){return t=t||a.create(),null!=e.start&&Object.hasOwnProperty.call(e,"start")&&t.uint32(8).int32(e.start),null!=e.end&&Object.hasOwnProperty.call(e,"end")&&t.uint32(16).int32(e.end),t},ce.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},ce.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.EnumDescriptorProto.EnumReservedRange;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:r.start=e.int32();break;case 2:r.end=e.int32();break;default:e.skipType(7&o)}}return r},ce.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},ce.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.start&&e.hasOwnProperty("start")&&!c.isInteger(e.start)?"start: integer expected":null!=e.end&&e.hasOwnProperty("end")&&!c.isInteger(e.end)?"end: integer expected":null},ce.fromObject=function(e){var t;return e instanceof u.google.protobuf.EnumDescriptorProto.EnumReservedRange?e:(t=new u.google.protobuf.EnumDescriptorProto.EnumReservedRange,null!=e.start&&(t.start=0|e.start),null!=e.end&&(t.end=0|e.end),t)},ce.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.start=0,n.end=0),null!=e.start&&e.hasOwnProperty("start")&&(n.start=e.start),null!=e.end&&e.hasOwnProperty("end")&&(n.end=e.end),n},ce.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},ce),x),i.EnumValueDescriptorProto=(ue.prototype.name="",ue.prototype.number=0,ue.prototype.options=null,ue.create=function(e){return new ue(e)},ue.encode=function(e,t){return t=t||a.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),null!=e.number&&Object.hasOwnProperty.call(e,"number")&&t.uint32(16).int32(e.number),null!=e.options&&Object.hasOwnProperty.call(e,"options")&&u.google.protobuf.EnumValueOptions.encode(e.options,t.uint32(26).fork()).ldelim(),t},ue.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},ue.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.EnumValueDescriptorProto;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:r.name=e.string();break;case 2:r.number=e.int32();break;case 3:r.options=u.google.protobuf.EnumValueOptions.decode(e,e.uint32());break;default:e.skipType(7&o)}}return r},ue.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},ue.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.name&&e.hasOwnProperty("name")&&!c.isString(e.name))return"name: string expected";if(null!=e.number&&e.hasOwnProperty("number")&&!c.isInteger(e.number))return"number: integer expected";if(null!=e.options&&e.hasOwnProperty("options")){e=u.google.protobuf.EnumValueOptions.verify(e.options);if(e)return"options."+e}return null},ue.fromObject=function(e){if(e instanceof u.google.protobuf.EnumValueDescriptorProto)return e;var t=new u.google.protobuf.EnumValueDescriptorProto;if(null!=e.name&&(t.name=String(e.name)),null!=e.number&&(t.number=0|e.number),null!=e.options){if("object"!=typeof e.options)throw TypeError(".google.protobuf.EnumValueDescriptorProto.options: object expected");t.options=u.google.protobuf.EnumValueOptions.fromObject(e.options)}return t},ue.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.name="",n.number=0,n.options=null),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),null!=e.number&&e.hasOwnProperty("number")&&(n.number=e.number),null!=e.options&&e.hasOwnProperty("options")&&(n.options=u.google.protobuf.EnumValueOptions.toObject(e.options,t)),n},ue.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},ue),i.ServiceDescriptorProto=(de.prototype.name="",de.prototype.method=c.emptyArray,de.prototype.options=null,de.create=function(e){return new de(e)},de.encode=function(e,t){if(t=t||a.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),null!=e.method&&e.method.length)for(var n=0;n<e.method.length;++n)u.google.protobuf.MethodDescriptorProto.encode(e.method[n],t.uint32(18).fork()).ldelim();return null!=e.options&&Object.hasOwnProperty.call(e,"options")&&u.google.protobuf.ServiceOptions.encode(e.options,t.uint32(26).fork()).ldelim(),t},de.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},de.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.ServiceDescriptorProto;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:r.name=e.string();break;case 2:r.method&&r.method.length||(r.method=[]),r.method.push(u.google.protobuf.MethodDescriptorProto.decode(e,e.uint32()));break;case 3:r.options=u.google.protobuf.ServiceOptions.decode(e,e.uint32());break;default:e.skipType(7&o)}}return r},de.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},de.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.name&&e.hasOwnProperty("name")&&!c.isString(e.name))return"name: string expected";if(null!=e.method&&e.hasOwnProperty("method")){if(!Array.isArray(e.method))return"method: array expected";for(var t=0;t<e.method.length;++t)if(n=u.google.protobuf.MethodDescriptorProto.verify(e.method[t]))return"method."+n}var n;if(null!=e.options&&e.hasOwnProperty("options")&&(n=u.google.protobuf.ServiceOptions.verify(e.options)))return"options."+n;return null},de.fromObject=function(e){if(e instanceof u.google.protobuf.ServiceDescriptorProto)return e;var t=new u.google.protobuf.ServiceDescriptorProto;if(null!=e.name&&(t.name=String(e.name)),e.method){if(!Array.isArray(e.method))throw TypeError(".google.protobuf.ServiceDescriptorProto.method: array expected");t.method=[];for(var n=0;n<e.method.length;++n){if("object"!=typeof e.method[n])throw TypeError(".google.protobuf.ServiceDescriptorProto.method: object expected");t.method[n]=u.google.protobuf.MethodDescriptorProto.fromObject(e.method[n])}}if(null!=e.options){if("object"!=typeof e.options)throw TypeError(".google.protobuf.ServiceDescriptorProto.options: object expected");t.options=u.google.protobuf.ServiceOptions.fromObject(e.options)}return t},de.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.method=[]),t.defaults&&(n.name="",n.options=null),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),e.method&&e.method.length){n.method=[];for(var r=0;r<e.method.length;++r)n.method[r]=u.google.protobuf.MethodDescriptorProto.toObject(e.method[r],t)}return null!=e.options&&e.hasOwnProperty("options")&&(n.options=u.google.protobuf.ServiceOptions.toObject(e.options,t)),n},de.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},de),i.MethodDescriptorProto=(E.prototype.name="",E.prototype.inputType="",E.prototype.outputType="",E.prototype.options=null,E.prototype.clientStreaming=!1,E.prototype.serverStreaming=!1,E.create=function(e){return new E(e)},E.encode=function(e,t){return t=t||a.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),null!=e.inputType&&Object.hasOwnProperty.call(e,"inputType")&&t.uint32(18).string(e.inputType),null!=e.outputType&&Object.hasOwnProperty.call(e,"outputType")&&t.uint32(26).string(e.outputType),null!=e.options&&Object.hasOwnProperty.call(e,"options")&&u.google.protobuf.MethodOptions.encode(e.options,t.uint32(34).fork()).ldelim(),null!=e.clientStreaming&&Object.hasOwnProperty.call(e,"clientStreaming")&&t.uint32(40).bool(e.clientStreaming),null!=e.serverStreaming&&Object.hasOwnProperty.call(e,"serverStreaming")&&t.uint32(48).bool(e.serverStreaming),t},E.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},E.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.MethodDescriptorProto;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:r.name=e.string();break;case 2:r.inputType=e.string();break;case 3:r.outputType=e.string();break;case 4:r.options=u.google.protobuf.MethodOptions.decode(e,e.uint32());break;case 5:r.clientStreaming=e.bool();break;case 6:r.serverStreaming=e.bool();break;default:e.skipType(7&o)}}return r},E.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},E.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.name&&e.hasOwnProperty("name")&&!c.isString(e.name))return"name: string expected";if(null!=e.inputType&&e.hasOwnProperty("inputType")&&!c.isString(e.inputType))return"inputType: string expected";if(null!=e.outputType&&e.hasOwnProperty("outputType")&&!c.isString(e.outputType))return"outputType: string expected";if(null!=e.options&&e.hasOwnProperty("options")){var t=u.google.protobuf.MethodOptions.verify(e.options);if(t)return"options."+t}return null!=e.clientStreaming&&e.hasOwnProperty("clientStreaming")&&"boolean"!=typeof e.clientStreaming?"clientStreaming: boolean expected":null!=e.serverStreaming&&e.hasOwnProperty("serverStreaming")&&"boolean"!=typeof e.serverStreaming?"serverStreaming: boolean expected":null},E.fromObject=function(e){if(e instanceof u.google.protobuf.MethodDescriptorProto)return e;var t=new u.google.protobuf.MethodDescriptorProto;if(null!=e.name&&(t.name=String(e.name)),null!=e.inputType&&(t.inputType=String(e.inputType)),null!=e.outputType&&(t.outputType=String(e.outputType)),null!=e.options){if("object"!=typeof e.options)throw TypeError(".google.protobuf.MethodDescriptorProto.options: object expected");t.options=u.google.protobuf.MethodOptions.fromObject(e.options)}return null!=e.clientStreaming&&(t.clientStreaming=Boolean(e.clientStreaming)),null!=e.serverStreaming&&(t.serverStreaming=Boolean(e.serverStreaming)),t},E.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.name="",n.inputType="",n.outputType="",n.options=null,n.clientStreaming=!1,n.serverStreaming=!1),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),null!=e.inputType&&e.hasOwnProperty("inputType")&&(n.inputType=e.inputType),null!=e.outputType&&e.hasOwnProperty("outputType")&&(n.outputType=e.outputType),null!=e.options&&e.hasOwnProperty("options")&&(n.options=u.google.protobuf.MethodOptions.toObject(e.options,t)),null!=e.clientStreaming&&e.hasOwnProperty("clientStreaming")&&(n.clientStreaming=e.clientStreaming),null!=e.serverStreaming&&e.hasOwnProperty("serverStreaming")&&(n.serverStreaming=e.serverStreaming),n},E.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},E),i.FileOptions=(D.prototype.javaPackage="",D.prototype.javaOuterClassname="",D.prototype.javaMultipleFiles=!1,D.prototype.javaGenerateEqualsAndHash=!1,D.prototype.javaStringCheckUtf8=!1,D.prototype.optimizeFor=1,D.prototype.goPackage="",D.prototype.ccGenericServices=!1,D.prototype.javaGenericServices=!1,D.prototype.pyGenericServices=!1,D.prototype.phpGenericServices=!1,D.prototype.deprecated=!1,D.prototype.ccEnableArenas=!0,D.prototype.objcClassPrefix="",D.prototype.csharpNamespace="",D.prototype.swiftPrefix="",D.prototype.phpClassPrefix="",D.prototype.phpNamespace="",D.prototype.phpMetadataNamespace="",D.prototype.rubyPackage="",D.prototype.uninterpretedOption=c.emptyArray,D.create=function(e){return new D(e)},D.encode=function(e,t){if(t=t||a.create(),null!=e.javaPackage&&Object.hasOwnProperty.call(e,"javaPackage")&&t.uint32(10).string(e.javaPackage),null!=e.javaOuterClassname&&Object.hasOwnProperty.call(e,"javaOuterClassname")&&t.uint32(66).string(e.javaOuterClassname),null!=e.optimizeFor&&Object.hasOwnProperty.call(e,"optimizeFor")&&t.uint32(72).int32(e.optimizeFor),null!=e.javaMultipleFiles&&Object.hasOwnProperty.call(e,"javaMultipleFiles")&&t.uint32(80).bool(e.javaMultipleFiles),null!=e.goPackage&&Object.hasOwnProperty.call(e,"goPackage")&&t.uint32(90).string(e.goPackage),null!=e.ccGenericServices&&Object.hasOwnProperty.call(e,"ccGenericServices")&&t.uint32(128).bool(e.ccGenericServices),null!=e.javaGenericServices&&Object.hasOwnProperty.call(e,"javaGenericServices")&&t.uint32(136).bool(e.javaGenericServices),null!=e.pyGenericServices&&Object.hasOwnProperty.call(e,"pyGenericServices")&&t.uint32(144).bool(e.pyGenericServices),null!=e.javaGenerateEqualsAndHash&&Object.hasOwnProperty.call(e,"javaGenerateEqualsAndHash")&&t.uint32(160).bool(e.javaGenerateEqualsAndHash),null!=e.deprecated&&Object.hasOwnProperty.call(e,"deprecated")&&t.uint32(184).bool(e.deprecated),null!=e.javaStringCheckUtf8&&Object.hasOwnProperty.call(e,"javaStringCheckUtf8")&&t.uint32(216).bool(e.javaStringCheckUtf8),null!=e.ccEnableArenas&&Object.hasOwnProperty.call(e,"ccEnableArenas")&&t.uint32(248).bool(e.ccEnableArenas),null!=e.objcClassPrefix&&Object.hasOwnProperty.call(e,"objcClassPrefix")&&t.uint32(290).string(e.objcClassPrefix),null!=e.csharpNamespace&&Object.hasOwnProperty.call(e,"csharpNamespace")&&t.uint32(298).string(e.csharpNamespace),null!=e.swiftPrefix&&Object.hasOwnProperty.call(e,"swiftPrefix")&&t.uint32(314).string(e.swiftPrefix),null!=e.phpClassPrefix&&Object.hasOwnProperty.call(e,"phpClassPrefix")&&t.uint32(322).string(e.phpClassPrefix),null!=e.phpNamespace&&Object.hasOwnProperty.call(e,"phpNamespace")&&t.uint32(330).string(e.phpNamespace),null!=e.phpGenericServices&&Object.hasOwnProperty.call(e,"phpGenericServices")&&t.uint32(336).bool(e.phpGenericServices),null!=e.phpMetadataNamespace&&Object.hasOwnProperty.call(e,"phpMetadataNamespace")&&t.uint32(354).string(e.phpMetadataNamespace),null!=e.rubyPackage&&Object.hasOwnProperty.call(e,"rubyPackage")&&t.uint32(362).string(e.rubyPackage),null!=e.uninterpretedOption&&e.uninterpretedOption.length)for(var n=0;n<e.uninterpretedOption.length;++n)u.google.protobuf.UninterpretedOption.encode(e.uninterpretedOption[n],t.uint32(7994).fork()).ldelim();return t},D.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},D.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.FileOptions;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:r.javaPackage=e.string();break;case 8:r.javaOuterClassname=e.string();break;case 10:r.javaMultipleFiles=e.bool();break;case 20:r.javaGenerateEqualsAndHash=e.bool();break;case 27:r.javaStringCheckUtf8=e.bool();break;case 9:r.optimizeFor=e.int32();break;case 11:r.goPackage=e.string();break;case 16:r.ccGenericServices=e.bool();break;case 17:r.javaGenericServices=e.bool();break;case 18:r.pyGenericServices=e.bool();break;case 42:r.phpGenericServices=e.bool();break;case 23:r.deprecated=e.bool();break;case 31:r.ccEnableArenas=e.bool();break;case 36:r.objcClassPrefix=e.string();break;case 37:r.csharpNamespace=e.string();break;case 39:r.swiftPrefix=e.string();break;case 40:r.phpClassPrefix=e.string();break;case 41:r.phpNamespace=e.string();break;case 44:r.phpMetadataNamespace=e.string();break;case 45:r.rubyPackage=e.string();break;case 999:r.uninterpretedOption&&r.uninterpretedOption.length||(r.uninterpretedOption=[]),r.uninterpretedOption.push(u.google.protobuf.UninterpretedOption.decode(e,e.uint32()));break;default:e.skipType(7&o)}}return r},D.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},D.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.javaPackage&&e.hasOwnProperty("javaPackage")&&!c.isString(e.javaPackage))return"javaPackage: string expected";if(null!=e.javaOuterClassname&&e.hasOwnProperty("javaOuterClassname")&&!c.isString(e.javaOuterClassname))return"javaOuterClassname: string expected";if(null!=e.javaMultipleFiles&&e.hasOwnProperty("javaMultipleFiles")&&"boolean"!=typeof e.javaMultipleFiles)return"javaMultipleFiles: boolean expected";if(null!=e.javaGenerateEqualsAndHash&&e.hasOwnProperty("javaGenerateEqualsAndHash")&&"boolean"!=typeof e.javaGenerateEqualsAndHash)return"javaGenerateEqualsAndHash: boolean expected";if(null!=e.javaStringCheckUtf8&&e.hasOwnProperty("javaStringCheckUtf8")&&"boolean"!=typeof e.javaStringCheckUtf8)return"javaStringCheckUtf8: boolean expected";if(null!=e.optimizeFor&&e.hasOwnProperty("optimizeFor"))switch(e.optimizeFor){default:return"optimizeFor: enum value expected";case 1:case 2:case 3:}if(null!=e.goPackage&&e.hasOwnProperty("goPackage")&&!c.isString(e.goPackage))return"goPackage: string expected";if(null!=e.ccGenericServices&&e.hasOwnProperty("ccGenericServices")&&"boolean"!=typeof e.ccGenericServices)return"ccGenericServices: boolean expected";if(null!=e.javaGenericServices&&e.hasOwnProperty("javaGenericServices")&&"boolean"!=typeof e.javaGenericServices)return"javaGenericServices: boolean expected";if(null!=e.pyGenericServices&&e.hasOwnProperty("pyGenericServices")&&"boolean"!=typeof e.pyGenericServices)return"pyGenericServices: boolean expected";if(null!=e.phpGenericServices&&e.hasOwnProperty("phpGenericServices")&&"boolean"!=typeof e.phpGenericServices)return"phpGenericServices: boolean expected";if(null!=e.deprecated&&e.hasOwnProperty("deprecated")&&"boolean"!=typeof e.deprecated)return"deprecated: boolean expected";if(null!=e.ccEnableArenas&&e.hasOwnProperty("ccEnableArenas")&&"boolean"!=typeof e.ccEnableArenas)return"ccEnableArenas: boolean expected";if(null!=e.objcClassPrefix&&e.hasOwnProperty("objcClassPrefix")&&!c.isString(e.objcClassPrefix))return"objcClassPrefix: string expected";if(null!=e.csharpNamespace&&e.hasOwnProperty("csharpNamespace")&&!c.isString(e.csharpNamespace))return"csharpNamespace: string expected";if(null!=e.swiftPrefix&&e.hasOwnProperty("swiftPrefix")&&!c.isString(e.swiftPrefix))return"swiftPrefix: string expected";if(null!=e.phpClassPrefix&&e.hasOwnProperty("phpClassPrefix")&&!c.isString(e.phpClassPrefix))return"phpClassPrefix: string expected";if(null!=e.phpNamespace&&e.hasOwnProperty("phpNamespace")&&!c.isString(e.phpNamespace))return"phpNamespace: string expected";if(null!=e.phpMetadataNamespace&&e.hasOwnProperty("phpMetadataNamespace")&&!c.isString(e.phpMetadataNamespace))return"phpMetadataNamespace: string expected";if(null!=e.rubyPackage&&e.hasOwnProperty("rubyPackage")&&!c.isString(e.rubyPackage))return"rubyPackage: string expected";if(null!=e.uninterpretedOption&&e.hasOwnProperty("uninterpretedOption")){if(!Array.isArray(e.uninterpretedOption))return"uninterpretedOption: array expected";for(var t=0;t<e.uninterpretedOption.length;++t){var n=u.google.protobuf.UninterpretedOption.verify(e.uninterpretedOption[t]);if(n)return"uninterpretedOption."+n}}return null},D.fromObject=function(e){if(e instanceof u.google.protobuf.FileOptions)return e;var t=new u.google.protobuf.FileOptions;switch(null!=e.javaPackage&&(t.javaPackage=String(e.javaPackage)),null!=e.javaOuterClassname&&(t.javaOuterClassname=String(e.javaOuterClassname)),null!=e.javaMultipleFiles&&(t.javaMultipleFiles=Boolean(e.javaMultipleFiles)),null!=e.javaGenerateEqualsAndHash&&(t.javaGenerateEqualsAndHash=Boolean(e.javaGenerateEqualsAndHash)),null!=e.javaStringCheckUtf8&&(t.javaStringCheckUtf8=Boolean(e.javaStringCheckUtf8)),e.optimizeFor){case"SPEED":case 1:t.optimizeFor=1;break;case"CODE_SIZE":case 2:t.optimizeFor=2;break;case"LITE_RUNTIME":case 3:t.optimizeFor=3}if(null!=e.goPackage&&(t.goPackage=String(e.goPackage)),null!=e.ccGenericServices&&(t.ccGenericServices=Boolean(e.ccGenericServices)),null!=e.javaGenericServices&&(t.javaGenericServices=Boolean(e.javaGenericServices)),null!=e.pyGenericServices&&(t.pyGenericServices=Boolean(e.pyGenericServices)),null!=e.phpGenericServices&&(t.phpGenericServices=Boolean(e.phpGenericServices)),null!=e.deprecated&&(t.deprecated=Boolean(e.deprecated)),null!=e.ccEnableArenas&&(t.ccEnableArenas=Boolean(e.ccEnableArenas)),null!=e.objcClassPrefix&&(t.objcClassPrefix=String(e.objcClassPrefix)),null!=e.csharpNamespace&&(t.csharpNamespace=String(e.csharpNamespace)),null!=e.swiftPrefix&&(t.swiftPrefix=String(e.swiftPrefix)),null!=e.phpClassPrefix&&(t.phpClassPrefix=String(e.phpClassPrefix)),null!=e.phpNamespace&&(t.phpNamespace=String(e.phpNamespace)),null!=e.phpMetadataNamespace&&(t.phpMetadataNamespace=String(e.phpMetadataNamespace)),null!=e.rubyPackage&&(t.rubyPackage=String(e.rubyPackage)),e.uninterpretedOption){if(!Array.isArray(e.uninterpretedOption))throw TypeError(".google.protobuf.FileOptions.uninterpretedOption: array expected");t.uninterpretedOption=[];for(var n=0;n<e.uninterpretedOption.length;++n){if("object"!=typeof e.uninterpretedOption[n])throw TypeError(".google.protobuf.FileOptions.uninterpretedOption: object expected");t.uninterpretedOption[n]=u.google.protobuf.UninterpretedOption.fromObject(e.uninterpretedOption[n])}}return t},D.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.uninterpretedOption=[]),t.defaults&&(n.javaPackage="",n.javaOuterClassname="",n.optimizeFor=t.enums===String?"SPEED":1,n.javaMultipleFiles=!1,n.goPackage="",n.ccGenericServices=!1,n.javaGenericServices=!1,n.pyGenericServices=!1,n.javaGenerateEqualsAndHash=!1,n.deprecated=!1,n.javaStringCheckUtf8=!1,n.ccEnableArenas=!0,n.objcClassPrefix="",n.csharpNamespace="",n.swiftPrefix="",n.phpClassPrefix="",n.phpNamespace="",n.phpGenericServices=!1,n.phpMetadataNamespace="",n.rubyPackage=""),null!=e.javaPackage&&e.hasOwnProperty("javaPackage")&&(n.javaPackage=e.javaPackage),null!=e.javaOuterClassname&&e.hasOwnProperty("javaOuterClassname")&&(n.javaOuterClassname=e.javaOuterClassname),null!=e.optimizeFor&&e.hasOwnProperty("optimizeFor")&&(n.optimizeFor=t.enums===String?u.google.protobuf.FileOptions.OptimizeMode[e.optimizeFor]:e.optimizeFor),null!=e.javaMultipleFiles&&e.hasOwnProperty("javaMultipleFiles")&&(n.javaMultipleFiles=e.javaMultipleFiles),null!=e.goPackage&&e.hasOwnProperty("goPackage")&&(n.goPackage=e.goPackage),null!=e.ccGenericServices&&e.hasOwnProperty("ccGenericServices")&&(n.ccGenericServices=e.ccGenericServices),null!=e.javaGenericServices&&e.hasOwnProperty("javaGenericServices")&&(n.javaGenericServices=e.javaGenericServices),null!=e.pyGenericServices&&e.hasOwnProperty("pyGenericServices")&&(n.pyGenericServices=e.pyGenericServices),null!=e.javaGenerateEqualsAndHash&&e.hasOwnProperty("javaGenerateEqualsAndHash")&&(n.javaGenerateEqualsAndHash=e.javaGenerateEqualsAndHash),null!=e.deprecated&&e.hasOwnProperty("deprecated")&&(n.deprecated=e.deprecated),null!=e.javaStringCheckUtf8&&e.hasOwnProperty("javaStringCheckUtf8")&&(n.javaStringCheckUtf8=e.javaStringCheckUtf8),null!=e.ccEnableArenas&&e.hasOwnProperty("ccEnableArenas")&&(n.ccEnableArenas=e.ccEnableArenas),null!=e.objcClassPrefix&&e.hasOwnProperty("objcClassPrefix")&&(n.objcClassPrefix=e.objcClassPrefix),null!=e.csharpNamespace&&e.hasOwnProperty("csharpNamespace")&&(n.csharpNamespace=e.csharpNamespace),null!=e.swiftPrefix&&e.hasOwnProperty("swiftPrefix")&&(n.swiftPrefix=e.swiftPrefix),null!=e.phpClassPrefix&&e.hasOwnProperty("phpClassPrefix")&&(n.phpClassPrefix=e.phpClassPrefix),null!=e.phpNamespace&&e.hasOwnProperty("phpNamespace")&&(n.phpNamespace=e.phpNamespace),null!=e.phpGenericServices&&e.hasOwnProperty("phpGenericServices")&&(n.phpGenericServices=e.phpGenericServices),null!=e.phpMetadataNamespace&&e.hasOwnProperty("phpMetadataNamespace")&&(n.phpMetadataNamespace=e.phpMetadataNamespace),null!=e.rubyPackage&&e.hasOwnProperty("rubyPackage")&&(n.rubyPackage=e.rubyPackage),e.uninterpretedOption&&e.uninterpretedOption.length){n.uninterpretedOption=[];for(var r=0;r<e.uninterpretedOption.length;++r)n.uninterpretedOption[r]=u.google.protobuf.UninterpretedOption.toObject(e.uninterpretedOption[r],t)}return n},D.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},D.OptimizeMode=(n={},(o=Object.create(n))[n[1]="SPEED"]=1,o[n[2]="CODE_SIZE"]=2,o[n[3]="LITE_RUNTIME"]=3,o),D),i.MessageOptions=(R.prototype.messageSetWireFormat=!1,R.prototype.noStandardDescriptorAccessor=!1,R.prototype.deprecated=!1,R.prototype.mapEntry=!1,R.prototype.uninterpretedOption=c.emptyArray,R.create=function(e){return new R(e)},R.encode=function(e,t){if(t=t||a.create(),null!=e.messageSetWireFormat&&Object.hasOwnProperty.call(e,"messageSetWireFormat")&&t.uint32(8).bool(e.messageSetWireFormat),null!=e.noStandardDescriptorAccessor&&Object.hasOwnProperty.call(e,"noStandardDescriptorAccessor")&&t.uint32(16).bool(e.noStandardDescriptorAccessor),null!=e.deprecated&&Object.hasOwnProperty.call(e,"deprecated")&&t.uint32(24).bool(e.deprecated),null!=e.mapEntry&&Object.hasOwnProperty.call(e,"mapEntry")&&t.uint32(56).bool(e.mapEntry),null!=e.uninterpretedOption&&e.uninterpretedOption.length)for(var n=0;n<e.uninterpretedOption.length;++n)u.google.protobuf.UninterpretedOption.encode(e.uninterpretedOption[n],t.uint32(7994).fork()).ldelim();return t},R.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},R.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.MessageOptions;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:r.messageSetWireFormat=e.bool();break;case 2:r.noStandardDescriptorAccessor=e.bool();break;case 3:r.deprecated=e.bool();break;case 7:r.mapEntry=e.bool();break;case 999:r.uninterpretedOption&&r.uninterpretedOption.length||(r.uninterpretedOption=[]),r.uninterpretedOption.push(u.google.protobuf.UninterpretedOption.decode(e,e.uint32()));break;default:e.skipType(7&o)}}return r},R.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},R.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.messageSetWireFormat&&e.hasOwnProperty("messageSetWireFormat")&&"boolean"!=typeof e.messageSetWireFormat)return"messageSetWireFormat: boolean expected";if(null!=e.noStandardDescriptorAccessor&&e.hasOwnProperty("noStandardDescriptorAccessor")&&"boolean"!=typeof e.noStandardDescriptorAccessor)return"noStandardDescriptorAccessor: boolean expected";if(null!=e.deprecated&&e.hasOwnProperty("deprecated")&&"boolean"!=typeof e.deprecated)return"deprecated: boolean expected";if(null!=e.mapEntry&&e.hasOwnProperty("mapEntry")&&"boolean"!=typeof e.mapEntry)return"mapEntry: boolean expected";if(null!=e.uninterpretedOption&&e.hasOwnProperty("uninterpretedOption")){if(!Array.isArray(e.uninterpretedOption))return"uninterpretedOption: array expected";for(var t=0;t<e.uninterpretedOption.length;++t){var n=u.google.protobuf.UninterpretedOption.verify(e.uninterpretedOption[t]);if(n)return"uninterpretedOption."+n}}return null},R.fromObject=function(e){if(e instanceof u.google.protobuf.MessageOptions)return e;var t=new u.google.protobuf.MessageOptions;if(null!=e.messageSetWireFormat&&(t.messageSetWireFormat=Boolean(e.messageSetWireFormat)),null!=e.noStandardDescriptorAccessor&&(t.noStandardDescriptorAccessor=Boolean(e.noStandardDescriptorAccessor)),null!=e.deprecated&&(t.deprecated=Boolean(e.deprecated)),null!=e.mapEntry&&(t.mapEntry=Boolean(e.mapEntry)),e.uninterpretedOption){if(!Array.isArray(e.uninterpretedOption))throw TypeError(".google.protobuf.MessageOptions.uninterpretedOption: array expected");t.uninterpretedOption=[];for(var n=0;n<e.uninterpretedOption.length;++n){if("object"!=typeof e.uninterpretedOption[n])throw TypeError(".google.protobuf.MessageOptions.uninterpretedOption: object expected");t.uninterpretedOption[n]=u.google.protobuf.UninterpretedOption.fromObject(e.uninterpretedOption[n])}}return t},R.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.uninterpretedOption=[]),t.defaults&&(n.messageSetWireFormat=!1,n.noStandardDescriptorAccessor=!1,n.deprecated=!1,n.mapEntry=!1),null!=e.messageSetWireFormat&&e.hasOwnProperty("messageSetWireFormat")&&(n.messageSetWireFormat=e.messageSetWireFormat),null!=e.noStandardDescriptorAccessor&&e.hasOwnProperty("noStandardDescriptorAccessor")&&(n.noStandardDescriptorAccessor=e.noStandardDescriptorAccessor),null!=e.deprecated&&e.hasOwnProperty("deprecated")&&(n.deprecated=e.deprecated),null!=e.mapEntry&&e.hasOwnProperty("mapEntry")&&(n.mapEntry=e.mapEntry),e.uninterpretedOption&&e.uninterpretedOption.length){n.uninterpretedOption=[];for(var r=0;r<e.uninterpretedOption.length;++r)n.uninterpretedOption[r]=u.google.protobuf.UninterpretedOption.toObject(e.uninterpretedOption[r],t)}return n},R.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},R),i.FieldOptions=(N.prototype.ctype=0,N.prototype.packed=!1,N.prototype.jstype=0,N.prototype.lazy=!1,N.prototype.deprecated=!1,N.prototype.weak=!1,N.prototype.uninterpretedOption=c.emptyArray,N.create=function(e){return new N(e)},N.encode=function(e,t){if(t=t||a.create(),null!=e.ctype&&Object.hasOwnProperty.call(e,"ctype")&&t.uint32(8).int32(e.ctype),null!=e.packed&&Object.hasOwnProperty.call(e,"packed")&&t.uint32(16).bool(e.packed),null!=e.deprecated&&Object.hasOwnProperty.call(e,"deprecated")&&t.uint32(24).bool(e.deprecated),null!=e.lazy&&Object.hasOwnProperty.call(e,"lazy")&&t.uint32(40).bool(e.lazy),null!=e.jstype&&Object.hasOwnProperty.call(e,"jstype")&&t.uint32(48).int32(e.jstype),null!=e.weak&&Object.hasOwnProperty.call(e,"weak")&&t.uint32(80).bool(e.weak),null!=e.uninterpretedOption&&e.uninterpretedOption.length)for(var n=0;n<e.uninterpretedOption.length;++n)u.google.protobuf.UninterpretedOption.encode(e.uninterpretedOption[n],t.uint32(7994).fork()).ldelim();return t},N.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},N.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.FieldOptions;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:r.ctype=e.int32();break;case 2:r.packed=e.bool();break;case 6:r.jstype=e.int32();break;case 5:r.lazy=e.bool();break;case 3:r.deprecated=e.bool();break;case 10:r.weak=e.bool();break;case 999:r.uninterpretedOption&&r.uninterpretedOption.length||(r.uninterpretedOption=[]),r.uninterpretedOption.push(u.google.protobuf.UninterpretedOption.decode(e,e.uint32()));break;default:e.skipType(7&o)}}return r},N.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},N.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.ctype&&e.hasOwnProperty("ctype"))switch(e.ctype){default:return"ctype: enum value expected";case 0:case 1:case 2:}if(null!=e.packed&&e.hasOwnProperty("packed")&&"boolean"!=typeof e.packed)return"packed: boolean expected";if(null!=e.jstype&&e.hasOwnProperty("jstype"))switch(e.jstype){default:return"jstype: enum value expected";case 0:case 1:case 2:}if(null!=e.lazy&&e.hasOwnProperty("lazy")&&"boolean"!=typeof e.lazy)return"lazy: boolean expected";if(null!=e.deprecated&&e.hasOwnProperty("deprecated")&&"boolean"!=typeof e.deprecated)return"deprecated: boolean expected";if(null!=e.weak&&e.hasOwnProperty("weak")&&"boolean"!=typeof e.weak)return"weak: boolean expected";if(null!=e.uninterpretedOption&&e.hasOwnProperty("uninterpretedOption")){if(!Array.isArray(e.uninterpretedOption))return"uninterpretedOption: array expected";for(var t=0;t<e.uninterpretedOption.length;++t){var n=u.google.protobuf.UninterpretedOption.verify(e.uninterpretedOption[t]);if(n)return"uninterpretedOption."+n}}return null},N.fromObject=function(e){if(e instanceof u.google.protobuf.FieldOptions)return e;var t=new u.google.protobuf.FieldOptions;switch(e.ctype){case"STRING":case 0:t.ctype=0;break;case"CORD":case 1:t.ctype=1;break;case"STRING_PIECE":case 2:t.ctype=2}switch(null!=e.packed&&(t.packed=Boolean(e.packed)),e.jstype){case"JS_NORMAL":case 0:t.jstype=0;break;case"JS_STRING":case 1:t.jstype=1;break;case"JS_NUMBER":case 2:t.jstype=2}if(null!=e.lazy&&(t.lazy=Boolean(e.lazy)),null!=e.deprecated&&(t.deprecated=Boolean(e.deprecated)),null!=e.weak&&(t.weak=Boolean(e.weak)),e.uninterpretedOption){if(!Array.isArray(e.uninterpretedOption))throw TypeError(".google.protobuf.FieldOptions.uninterpretedOption: array expected");t.uninterpretedOption=[];for(var n=0;n<e.uninterpretedOption.length;++n){if("object"!=typeof e.uninterpretedOption[n])throw TypeError(".google.protobuf.FieldOptions.uninterpretedOption: object expected");t.uninterpretedOption[n]=u.google.protobuf.UninterpretedOption.fromObject(e.uninterpretedOption[n])}}return t},N.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.uninterpretedOption=[]),t.defaults&&(n.ctype=t.enums===String?"STRING":0,n.packed=!1,n.deprecated=!1,n.lazy=!1,n.jstype=t.enums===String?"JS_NORMAL":0,n.weak=!1),null!=e.ctype&&e.hasOwnProperty("ctype")&&(n.ctype=t.enums===String?u.google.protobuf.FieldOptions.CType[e.ctype]:e.ctype),null!=e.packed&&e.hasOwnProperty("packed")&&(n.packed=e.packed),null!=e.deprecated&&e.hasOwnProperty("deprecated")&&(n.deprecated=e.deprecated),null!=e.lazy&&e.hasOwnProperty("lazy")&&(n.lazy=e.lazy),null!=e.jstype&&e.hasOwnProperty("jstype")&&(n.jstype=t.enums===String?u.google.protobuf.FieldOptions.JSType[e.jstype]:e.jstype),null!=e.weak&&e.hasOwnProperty("weak")&&(n.weak=e.weak),e.uninterpretedOption&&e.uninterpretedOption.length){n.uninterpretedOption=[];for(var r=0;r<e.uninterpretedOption.length;++r)n.uninterpretedOption[r]=u.google.protobuf.UninterpretedOption.toObject(e.uninterpretedOption[r],t)}return n},N.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},N.CType=(n={},(o=Object.create(n))[n[0]="STRING"]=0,o[n[1]="CORD"]=1,o[n[2]="STRING_PIECE"]=2,o),N.JSType=(n={},(o=Object.create(n))[n[0]="JS_NORMAL"]=0,o[n[1]="JS_STRING"]=1,o[n[2]="JS_NUMBER"]=2,o),N),i.OneofOptions=(ge.prototype.uninterpretedOption=c.emptyArray,ge.create=function(e){return new ge(e)},ge.encode=function(e,t){if(t=t||a.create(),null!=e.uninterpretedOption&&e.uninterpretedOption.length)for(var n=0;n<e.uninterpretedOption.length;++n)u.google.protobuf.UninterpretedOption.encode(e.uninterpretedOption[n],t.uint32(7994).fork()).ldelim();return t},ge.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},ge.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.OneofOptions;e.pos<n;){var o=e.uint32();o>>>3==999?(r.uninterpretedOption&&r.uninterpretedOption.length||(r.uninterpretedOption=[]),r.uninterpretedOption.push(u.google.protobuf.UninterpretedOption.decode(e,e.uint32()))):e.skipType(7&o)}return r},ge.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},ge.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.uninterpretedOption&&e.hasOwnProperty("uninterpretedOption")){if(!Array.isArray(e.uninterpretedOption))return"uninterpretedOption: array expected";for(var t=0;t<e.uninterpretedOption.length;++t){var n=u.google.protobuf.UninterpretedOption.verify(e.uninterpretedOption[t]);if(n)return"uninterpretedOption."+n}}return null},ge.fromObject=function(e){if(e instanceof u.google.protobuf.OneofOptions)return e;var t=new u.google.protobuf.OneofOptions;if(e.uninterpretedOption){if(!Array.isArray(e.uninterpretedOption))throw TypeError(".google.protobuf.OneofOptions.uninterpretedOption: array expected");t.uninterpretedOption=[];for(var n=0;n<e.uninterpretedOption.length;++n){if("object"!=typeof e.uninterpretedOption[n])throw TypeError(".google.protobuf.OneofOptions.uninterpretedOption: object expected");t.uninterpretedOption[n]=u.google.protobuf.UninterpretedOption.fromObject(e.uninterpretedOption[n])}}return t},ge.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.uninterpretedOption=[]),e.uninterpretedOption&&e.uninterpretedOption.length){n.uninterpretedOption=[];for(var r=0;r<e.uninterpretedOption.length;++r)n.uninterpretedOption[r]=u.google.protobuf.UninterpretedOption.toObject(e.uninterpretedOption[r],t)}return n},ge.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},ge),i.EnumOptions=(fe.prototype.allowAlias=!1,fe.prototype.deprecated=!1,fe.prototype.uninterpretedOption=c.emptyArray,fe.create=function(e){return new fe(e)},fe.encode=function(e,t){if(t=t||a.create(),null!=e.allowAlias&&Object.hasOwnProperty.call(e,"allowAlias")&&t.uint32(16).bool(e.allowAlias),null!=e.deprecated&&Object.hasOwnProperty.call(e,"deprecated")&&t.uint32(24).bool(e.deprecated),null!=e.uninterpretedOption&&e.uninterpretedOption.length)for(var n=0;n<e.uninterpretedOption.length;++n)u.google.protobuf.UninterpretedOption.encode(e.uninterpretedOption[n],t.uint32(7994).fork()).ldelim();return t},fe.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},fe.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.EnumOptions;e.pos<n;){var o=e.uint32();switch(o>>>3){case 2:r.allowAlias=e.bool();break;case 3:r.deprecated=e.bool();break;case 999:r.uninterpretedOption&&r.uninterpretedOption.length||(r.uninterpretedOption=[]),r.uninterpretedOption.push(u.google.protobuf.UninterpretedOption.decode(e,e.uint32()));break;default:e.skipType(7&o)}}return r},fe.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},fe.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.allowAlias&&e.hasOwnProperty("allowAlias")&&"boolean"!=typeof e.allowAlias)return"allowAlias: boolean expected";if(null!=e.deprecated&&e.hasOwnProperty("deprecated")&&"boolean"!=typeof e.deprecated)return"deprecated: boolean expected";if(null!=e.uninterpretedOption&&e.hasOwnProperty("uninterpretedOption")){if(!Array.isArray(e.uninterpretedOption))return"uninterpretedOption: array expected";for(var t=0;t<e.uninterpretedOption.length;++t){var n=u.google.protobuf.UninterpretedOption.verify(e.uninterpretedOption[t]);if(n)return"uninterpretedOption."+n}}return null},fe.fromObject=function(e){if(e instanceof u.google.protobuf.EnumOptions)return e;var t=new u.google.protobuf.EnumOptions;if(null!=e.allowAlias&&(t.allowAlias=Boolean(e.allowAlias)),null!=e.deprecated&&(t.deprecated=Boolean(e.deprecated)),e.uninterpretedOption){if(!Array.isArray(e.uninterpretedOption))throw TypeError(".google.protobuf.EnumOptions.uninterpretedOption: array expected");t.uninterpretedOption=[];for(var n=0;n<e.uninterpretedOption.length;++n){if("object"!=typeof e.uninterpretedOption[n])throw TypeError(".google.protobuf.EnumOptions.uninterpretedOption: object expected");t.uninterpretedOption[n]=u.google.protobuf.UninterpretedOption.fromObject(e.uninterpretedOption[n])}}return t},fe.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.uninterpretedOption=[]),t.defaults&&(n.allowAlias=!1,n.deprecated=!1),null!=e.allowAlias&&e.hasOwnProperty("allowAlias")&&(n.allowAlias=e.allowAlias),null!=e.deprecated&&e.hasOwnProperty("deprecated")&&(n.deprecated=e.deprecated),e.uninterpretedOption&&e.uninterpretedOption.length){n.uninterpretedOption=[];for(var r=0;r<e.uninterpretedOption.length;++r)n.uninterpretedOption[r]=u.google.protobuf.UninterpretedOption.toObject(e.uninterpretedOption[r],t)}return n},fe.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},fe),i.EnumValueOptions=(ye.prototype.deprecated=!1,ye.prototype.uninterpretedOption=c.emptyArray,ye.create=function(e){return new ye(e)},ye.encode=function(e,t){if(t=t||a.create(),null!=e.deprecated&&Object.hasOwnProperty.call(e,"deprecated")&&t.uint32(8).bool(e.deprecated),null!=e.uninterpretedOption&&e.uninterpretedOption.length)for(var n=0;n<e.uninterpretedOption.length;++n)u.google.protobuf.UninterpretedOption.encode(e.uninterpretedOption[n],t.uint32(7994).fork()).ldelim();return t},ye.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},ye.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.EnumValueOptions;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:r.deprecated=e.bool();break;case 999:r.uninterpretedOption&&r.uninterpretedOption.length||(r.uninterpretedOption=[]),r.uninterpretedOption.push(u.google.protobuf.UninterpretedOption.decode(e,e.uint32()));break;default:e.skipType(7&o)}}return r},ye.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},ye.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.deprecated&&e.hasOwnProperty("deprecated")&&"boolean"!=typeof e.deprecated)return"deprecated: boolean expected";if(null!=e.uninterpretedOption&&e.hasOwnProperty("uninterpretedOption")){if(!Array.isArray(e.uninterpretedOption))return"uninterpretedOption: array expected";for(var t=0;t<e.uninterpretedOption.length;++t){var n=u.google.protobuf.UninterpretedOption.verify(e.uninterpretedOption[t]);if(n)return"uninterpretedOption."+n}}return null},ye.fromObject=function(e){if(e instanceof u.google.protobuf.EnumValueOptions)return e;var t=new u.google.protobuf.EnumValueOptions;if(null!=e.deprecated&&(t.deprecated=Boolean(e.deprecated)),e.uninterpretedOption){if(!Array.isArray(e.uninterpretedOption))throw TypeError(".google.protobuf.EnumValueOptions.uninterpretedOption: array expected");t.uninterpretedOption=[];for(var n=0;n<e.uninterpretedOption.length;++n){if("object"!=typeof e.uninterpretedOption[n])throw TypeError(".google.protobuf.EnumValueOptions.uninterpretedOption: object expected");t.uninterpretedOption[n]=u.google.protobuf.UninterpretedOption.fromObject(e.uninterpretedOption[n])}}return t},ye.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.uninterpretedOption=[]),t.defaults&&(n.deprecated=!1),null!=e.deprecated&&e.hasOwnProperty("deprecated")&&(n.deprecated=e.deprecated),e.uninterpretedOption&&e.uninterpretedOption.length){n.uninterpretedOption=[];for(var r=0;r<e.uninterpretedOption.length;++r)n.uninterpretedOption[r]=u.google.protobuf.UninterpretedOption.toObject(e.uninterpretedOption[r],t)}return n},ye.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},ye),i.ServiceOptions=(Oe.prototype.deprecated=!1,Oe.prototype.uninterpretedOption=c.emptyArray,Oe.create=function(e){return new Oe(e)},Oe.encode=function(e,t){if(t=t||a.create(),null!=e.deprecated&&Object.hasOwnProperty.call(e,"deprecated")&&t.uint32(264).bool(e.deprecated),null!=e.uninterpretedOption&&e.uninterpretedOption.length)for(var n=0;n<e.uninterpretedOption.length;++n)u.google.protobuf.UninterpretedOption.encode(e.uninterpretedOption[n],t.uint32(7994).fork()).ldelim();return t},Oe.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},Oe.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.ServiceOptions;e.pos<n;){var o=e.uint32();switch(o>>>3){case 33:r.deprecated=e.bool();break;case 999:r.uninterpretedOption&&r.uninterpretedOption.length||(r.uninterpretedOption=[]),r.uninterpretedOption.push(u.google.protobuf.UninterpretedOption.decode(e,e.uint32()));break;default:e.skipType(7&o)}}return r},Oe.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},Oe.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.deprecated&&e.hasOwnProperty("deprecated")&&"boolean"!=typeof e.deprecated)return"deprecated: boolean expected";if(null!=e.uninterpretedOption&&e.hasOwnProperty("uninterpretedOption")){if(!Array.isArray(e.uninterpretedOption))return"uninterpretedOption: array expected";for(var t=0;t<e.uninterpretedOption.length;++t){var n=u.google.protobuf.UninterpretedOption.verify(e.uninterpretedOption[t]);if(n)return"uninterpretedOption."+n}}return null},Oe.fromObject=function(e){if(e instanceof u.google.protobuf.ServiceOptions)return e;var t=new u.google.protobuf.ServiceOptions;if(null!=e.deprecated&&(t.deprecated=Boolean(e.deprecated)),e.uninterpretedOption){if(!Array.isArray(e.uninterpretedOption))throw TypeError(".google.protobuf.ServiceOptions.uninterpretedOption: array expected");t.uninterpretedOption=[];for(var n=0;n<e.uninterpretedOption.length;++n){if("object"!=typeof e.uninterpretedOption[n])throw TypeError(".google.protobuf.ServiceOptions.uninterpretedOption: object expected");t.uninterpretedOption[n]=u.google.protobuf.UninterpretedOption.fromObject(e.uninterpretedOption[n])}}return t},Oe.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.uninterpretedOption=[]),t.defaults&&(n.deprecated=!1),null!=e.deprecated&&e.hasOwnProperty("deprecated")&&(n.deprecated=e.deprecated),e.uninterpretedOption&&e.uninterpretedOption.length){n.uninterpretedOption=[];for(var r=0;r<e.uninterpretedOption.length;++r)n.uninterpretedOption[r]=u.google.protobuf.UninterpretedOption.toObject(e.uninterpretedOption[r],t)}return n},Oe.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},Oe),i.MethodOptions=(A.prototype.deprecated=!1,A.prototype.idempotencyLevel=0,A.prototype.uninterpretedOption=c.emptyArray,A.prototype[".google.api.http"]=null,A.create=function(e){return new A(e)},A.encode=function(e,t){if(t=t||a.create(),null!=e.deprecated&&Object.hasOwnProperty.call(e,"deprecated")&&t.uint32(264).bool(e.deprecated),null!=e.idempotencyLevel&&Object.hasOwnProperty.call(e,"idempotencyLevel")&&t.uint32(272).int32(e.idempotencyLevel),null!=e.uninterpretedOption&&e.uninterpretedOption.length)for(var n=0;n<e.uninterpretedOption.length;++n)u.google.protobuf.UninterpretedOption.encode(e.uninterpretedOption[n],t.uint32(7994).fork()).ldelim();return null!=e[".google.api.http"]&&Object.hasOwnProperty.call(e,".google.api.http")&&u.google.api.HttpRule.encode(e[".google.api.http"],t.uint32(578365826).fork()).ldelim(),t},A.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},A.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.MethodOptions;e.pos<n;){var o=e.uint32();switch(o>>>3){case 33:r.deprecated=e.bool();break;case 34:r.idempotencyLevel=e.int32();break;case 999:r.uninterpretedOption&&r.uninterpretedOption.length||(r.uninterpretedOption=[]),r.uninterpretedOption.push(u.google.protobuf.UninterpretedOption.decode(e,e.uint32()));break;case 72295728:r[".google.api.http"]=u.google.api.HttpRule.decode(e,e.uint32());break;default:e.skipType(7&o)}}return r},A.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},A.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.deprecated&&e.hasOwnProperty("deprecated")&&"boolean"!=typeof e.deprecated)return"deprecated: boolean expected";if(null!=e.idempotencyLevel&&e.hasOwnProperty("idempotencyLevel"))switch(e.idempotencyLevel){default:return"idempotencyLevel: enum value expected";case 0:case 1:case 2:}if(null!=e.uninterpretedOption&&e.hasOwnProperty("uninterpretedOption")){if(!Array.isArray(e.uninterpretedOption))return"uninterpretedOption: array expected";for(var t=0;t<e.uninterpretedOption.length;++t)if(n=u.google.protobuf.UninterpretedOption.verify(e.uninterpretedOption[t]))return"uninterpretedOption."+n}var n;if(null!=e[".google.api.http"]&&e.hasOwnProperty(".google.api.http")&&(n=u.google.api.HttpRule.verify(e[".google.api.http"])))return".google.api.http."+n;return null},A.fromObject=function(e){if(e instanceof u.google.protobuf.MethodOptions)return e;var t=new u.google.protobuf.MethodOptions;switch(null!=e.deprecated&&(t.deprecated=Boolean(e.deprecated)),e.idempotencyLevel){case"IDEMPOTENCY_UNKNOWN":case 0:t.idempotencyLevel=0;break;case"NO_SIDE_EFFECTS":case 1:t.idempotencyLevel=1;break;case"IDEMPOTENT":case 2:t.idempotencyLevel=2}if(e.uninterpretedOption){if(!Array.isArray(e.uninterpretedOption))throw TypeError(".google.protobuf.MethodOptions.uninterpretedOption: array expected");t.uninterpretedOption=[];for(var n=0;n<e.uninterpretedOption.length;++n){if("object"!=typeof e.uninterpretedOption[n])throw TypeError(".google.protobuf.MethodOptions.uninterpretedOption: object expected");t.uninterpretedOption[n]=u.google.protobuf.UninterpretedOption.fromObject(e.uninterpretedOption[n])}}if(null!=e[".google.api.http"]){if("object"!=typeof e[".google.api.http"])throw TypeError(".google.protobuf.MethodOptions..google.api.http: object expected");t[".google.api.http"]=u.google.api.HttpRule.fromObject(e[".google.api.http"])}return t},A.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.uninterpretedOption=[]),t.defaults&&(n.deprecated=!1,n.idempotencyLevel=t.enums===String?"IDEMPOTENCY_UNKNOWN":0,n[".google.api.http"]=null),null!=e.deprecated&&e.hasOwnProperty("deprecated")&&(n.deprecated=e.deprecated),null!=e.idempotencyLevel&&e.hasOwnProperty("idempotencyLevel")&&(n.idempotencyLevel=t.enums===String?u.google.protobuf.MethodOptions.IdempotencyLevel[e.idempotencyLevel]:e.idempotencyLevel),e.uninterpretedOption&&e.uninterpretedOption.length){n.uninterpretedOption=[];for(var r=0;r<e.uninterpretedOption.length;++r)n.uninterpretedOption[r]=u.google.protobuf.UninterpretedOption.toObject(e.uninterpretedOption[r],t)}return null!=e[".google.api.http"]&&e.hasOwnProperty(".google.api.http")&&(n[".google.api.http"]=u.google.api.HttpRule.toObject(e[".google.api.http"],t)),n},A.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},A.IdempotencyLevel=(n={},(o=Object.create(n))[n[0]="IDEMPOTENCY_UNKNOWN"]=0,o[n[1]="NO_SIDE_EFFECTS"]=1,o[n[2]="IDEMPOTENT"]=2,o),A),i.UninterpretedOption=(_.prototype.name=c.emptyArray,_.prototype.identifierValue="",_.prototype.positiveIntValue=c.Long?c.Long.fromBits(0,0,!0):0,_.prototype.negativeIntValue=c.Long?c.Long.fromBits(0,0,!1):0,_.prototype.doubleValue=0,_.prototype.stringValue=c.newBuffer([]),_.prototype.aggregateValue="",_.create=function(e){return new _(e)},_.encode=function(e,t){if(t=t||a.create(),null!=e.name&&e.name.length)for(var n=0;n<e.name.length;++n)u.google.protobuf.UninterpretedOption.NamePart.encode(e.name[n],t.uint32(18).fork()).ldelim();return null!=e.identifierValue&&Object.hasOwnProperty.call(e,"identifierValue")&&t.uint32(26).string(e.identifierValue),null!=e.positiveIntValue&&Object.hasOwnProperty.call(e,"positiveIntValue")&&t.uint32(32).uint64(e.positiveIntValue),null!=e.negativeIntValue&&Object.hasOwnProperty.call(e,"negativeIntValue")&&t.uint32(40).int64(e.negativeIntValue),null!=e.doubleValue&&Object.hasOwnProperty.call(e,"doubleValue")&&t.uint32(49).double(e.doubleValue),null!=e.stringValue&&Object.hasOwnProperty.call(e,"stringValue")&&t.uint32(58).bytes(e.stringValue),null!=e.aggregateValue&&Object.hasOwnProperty.call(e,"aggregateValue")&&t.uint32(66).string(e.aggregateValue),t},_.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},_.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.UninterpretedOption;e.pos<n;){var o=e.uint32();switch(o>>>3){case 2:r.name&&r.name.length||(r.name=[]),r.name.push(u.google.protobuf.UninterpretedOption.NamePart.decode(e,e.uint32()));break;case 3:r.identifierValue=e.string();break;case 4:r.positiveIntValue=e.uint64();break;case 5:r.negativeIntValue=e.int64();break;case 6:r.doubleValue=e.double();break;case 7:r.stringValue=e.bytes();break;case 8:r.aggregateValue=e.string();break;default:e.skipType(7&o)}}return r},_.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},_.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.name&&e.hasOwnProperty("name")){if(!Array.isArray(e.name))return"name: array expected";for(var t=0;t<e.name.length;++t){var n=u.google.protobuf.UninterpretedOption.NamePart.verify(e.name[t]);if(n)return"name."+n}}return null!=e.identifierValue&&e.hasOwnProperty("identifierValue")&&!c.isString(e.identifierValue)?"identifierValue: string expected":null!=e.positiveIntValue&&e.hasOwnProperty("positiveIntValue")&&!(c.isInteger(e.positiveIntValue)||e.positiveIntValue&&c.isInteger(e.positiveIntValue.low)&&c.isInteger(e.positiveIntValue.high))?"positiveIntValue: integer|Long expected":null!=e.negativeIntValue&&e.hasOwnProperty("negativeIntValue")&&!(c.isInteger(e.negativeIntValue)||e.negativeIntValue&&c.isInteger(e.negativeIntValue.low)&&c.isInteger(e.negativeIntValue.high))?"negativeIntValue: integer|Long expected":null!=e.doubleValue&&e.hasOwnProperty("doubleValue")&&"number"!=typeof e.doubleValue?"doubleValue: number expected":null!=e.stringValue&&e.hasOwnProperty("stringValue")&&!(e.stringValue&&"number"==typeof e.stringValue.length||c.isString(e.stringValue))?"stringValue: buffer expected":null!=e.aggregateValue&&e.hasOwnProperty("aggregateValue")&&!c.isString(e.aggregateValue)?"aggregateValue: string expected":null},_.fromObject=function(e){if(e instanceof u.google.protobuf.UninterpretedOption)return e;var t=new u.google.protobuf.UninterpretedOption;if(e.name){if(!Array.isArray(e.name))throw TypeError(".google.protobuf.UninterpretedOption.name: array expected");t.name=[];for(var n=0;n<e.name.length;++n){if("object"!=typeof e.name[n])throw TypeError(".google.protobuf.UninterpretedOption.name: object expected");t.name[n]=u.google.protobuf.UninterpretedOption.NamePart.fromObject(e.name[n])}}return null!=e.identifierValue&&(t.identifierValue=String(e.identifierValue)),null!=e.positiveIntValue&&(c.Long?(t.positiveIntValue=c.Long.fromValue(e.positiveIntValue)).unsigned=!0:"string"==typeof e.positiveIntValue?t.positiveIntValue=parseInt(e.positiveIntValue,10):"number"==typeof e.positiveIntValue?t.positiveIntValue=e.positiveIntValue:"object"==typeof e.positiveIntValue&&(t.positiveIntValue=new c.LongBits(e.positiveIntValue.low>>>0,e.positiveIntValue.high>>>0).toNumber(!0))),null!=e.negativeIntValue&&(c.Long?(t.negativeIntValue=c.Long.fromValue(e.negativeIntValue)).unsigned=!1:"string"==typeof e.negativeIntValue?t.negativeIntValue=parseInt(e.negativeIntValue,10):"number"==typeof e.negativeIntValue?t.negativeIntValue=e.negativeIntValue:"object"==typeof e.negativeIntValue&&(t.negativeIntValue=new c.LongBits(e.negativeIntValue.low>>>0,e.negativeIntValue.high>>>0).toNumber())),null!=e.doubleValue&&(t.doubleValue=Number(e.doubleValue)),null!=e.stringValue&&("string"==typeof e.stringValue?c.base64.decode(e.stringValue,t.stringValue=c.newBuffer(c.base64.length(e.stringValue)),0):e.stringValue.length&&(t.stringValue=e.stringValue)),null!=e.aggregateValue&&(t.aggregateValue=String(e.aggregateValue)),t},_.toObject=function(e,t){var n,r={};if(((t=t||{}).arrays||t.defaults)&&(r.name=[]),t.defaults&&(r.identifierValue="",c.Long?(n=new c.Long(0,0,!0),r.positiveIntValue=t.longs===String?n.toString():t.longs===Number?n.toNumber():n):r.positiveIntValue=t.longs===String?"0":0,c.Long?(n=new c.Long(0,0,!1),r.negativeIntValue=t.longs===String?n.toString():t.longs===Number?n.toNumber():n):r.negativeIntValue=t.longs===String?"0":0,r.doubleValue=0,t.bytes===String?r.stringValue="":(r.stringValue=[],t.bytes!==Array&&(r.stringValue=c.newBuffer(r.stringValue))),r.aggregateValue=""),e.name&&e.name.length){r.name=[];for(var o=0;o<e.name.length;++o)r.name[o]=u.google.protobuf.UninterpretedOption.NamePart.toObject(e.name[o],t)}return null!=e.identifierValue&&e.hasOwnProperty("identifierValue")&&(r.identifierValue=e.identifierValue),null!=e.positiveIntValue&&e.hasOwnProperty("positiveIntValue")&&("number"==typeof e.positiveIntValue?r.positiveIntValue=t.longs===String?String(e.positiveIntValue):e.positiveIntValue:r.positiveIntValue=t.longs===String?c.Long.prototype.toString.call(e.positiveIntValue):t.longs===Number?new c.LongBits(e.positiveIntValue.low>>>0,e.positiveIntValue.high>>>0).toNumber(!0):e.positiveIntValue),null!=e.negativeIntValue&&e.hasOwnProperty("negativeIntValue")&&("number"==typeof e.negativeIntValue?r.negativeIntValue=t.longs===String?String(e.negativeIntValue):e.negativeIntValue:r.negativeIntValue=t.longs===String?c.Long.prototype.toString.call(e.negativeIntValue):t.longs===Number?new c.LongBits(e.negativeIntValue.low>>>0,e.negativeIntValue.high>>>0).toNumber():e.negativeIntValue),null!=e.doubleValue&&e.hasOwnProperty("doubleValue")&&(r.doubleValue=t.json&&!isFinite(e.doubleValue)?String(e.doubleValue):e.doubleValue),null!=e.stringValue&&e.hasOwnProperty("stringValue")&&(r.stringValue=t.bytes===String?c.base64.encode(e.stringValue,0,e.stringValue.length):t.bytes===Array?Array.prototype.slice.call(e.stringValue):e.stringValue),null!=e.aggregateValue&&e.hasOwnProperty("aggregateValue")&&(r.aggregateValue=e.aggregateValue),r},_.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},_.NamePart=(he.prototype.namePart="",he.prototype.isExtension=!1,he.create=function(e){return new he(e)},he.encode=function(e,t){return(t=t||a.create()).uint32(10).string(e.namePart),t.uint32(16).bool(e.isExtension),t},he.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},he.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.UninterpretedOption.NamePart;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:r.namePart=e.string();break;case 2:r.isExtension=e.bool();break;default:e.skipType(7&o)}}if(!r.hasOwnProperty("namePart"))throw c.ProtocolError("missing required 'namePart'",{instance:r});if(r.hasOwnProperty("isExtension"))return r;throw c.ProtocolError("missing required 'isExtension'",{instance:r})},he.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},he.verify=function(e){return"object"!=typeof e||null===e?"object expected":c.isString(e.namePart)?"boolean"!=typeof e.isExtension?"isExtension: boolean expected":null:"namePart: string expected"},he.fromObject=function(e){var t;return e instanceof u.google.protobuf.UninterpretedOption.NamePart?e:(t=new u.google.protobuf.UninterpretedOption.NamePart,null!=e.namePart&&(t.namePart=String(e.namePart)),null!=e.isExtension&&(t.isExtension=Boolean(e.isExtension)),t)},he.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.namePart="",n.isExtension=!1),null!=e.namePart&&e.hasOwnProperty("namePart")&&(n.namePart=e.namePart),null!=e.isExtension&&e.hasOwnProperty("isExtension")&&(n.isExtension=e.isExtension),n},he.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},he),_),i.SourceCodeInfo=(be.prototype.location=c.emptyArray,be.create=function(e){return new be(e)},be.encode=function(e,t){if(t=t||a.create(),null!=e.location&&e.location.length)for(var n=0;n<e.location.length;++n)u.google.protobuf.SourceCodeInfo.Location.encode(e.location[n],t.uint32(10).fork()).ldelim();return t},be.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},be.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.SourceCodeInfo;e.pos<n;){var o=e.uint32();o>>>3==1?(r.location&&r.location.length||(r.location=[]),r.location.push(u.google.protobuf.SourceCodeInfo.Location.decode(e,e.uint32()))):e.skipType(7&o)}return r},be.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},be.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.location&&e.hasOwnProperty("location")){if(!Array.isArray(e.location))return"location: array expected";for(var t=0;t<e.location.length;++t){var n=u.google.protobuf.SourceCodeInfo.Location.verify(e.location[t]);if(n)return"location."+n}}return null},be.fromObject=function(e){if(e instanceof u.google.protobuf.SourceCodeInfo)return e;var t=new u.google.protobuf.SourceCodeInfo;if(e.location){if(!Array.isArray(e.location))throw TypeError(".google.protobuf.SourceCodeInfo.location: array expected");t.location=[];for(var n=0;n<e.location.length;++n){if("object"!=typeof e.location[n])throw TypeError(".google.protobuf.SourceCodeInfo.location: object expected");t.location[n]=u.google.protobuf.SourceCodeInfo.Location.fromObject(e.location[n])}}return t},be.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.location=[]),e.location&&e.location.length){n.location=[];for(var r=0;r<e.location.length;++r)n.location[r]=u.google.protobuf.SourceCodeInfo.Location.toObject(e.location[r],t)}return n},be.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},be.Location=(I.prototype.path=c.emptyArray,I.prototype.span=c.emptyArray,I.prototype.leadingComments="",I.prototype.trailingComments="",I.prototype.leadingDetachedComments=c.emptyArray,I.create=function(e){return new I(e)},I.encode=function(e,t){if(t=t||a.create(),null!=e.path&&e.path.length){t.uint32(10).fork();for(var n=0;n<e.path.length;++n)t.int32(e.path[n]);t.ldelim()}if(null!=e.span&&e.span.length){t.uint32(18).fork();for(n=0;n<e.span.length;++n)t.int32(e.span[n]);t.ldelim()}if(null!=e.leadingComments&&Object.hasOwnProperty.call(e,"leadingComments")&&t.uint32(26).string(e.leadingComments),null!=e.trailingComments&&Object.hasOwnProperty.call(e,"trailingComments")&&t.uint32(34).string(e.trailingComments),null!=e.leadingDetachedComments&&e.leadingDetachedComments.length)for(n=0;n<e.leadingDetachedComments.length;++n)t.uint32(50).string(e.leadingDetachedComments[n]);return t},I.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},I.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.SourceCodeInfo.Location;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:if(r.path&&r.path.length||(r.path=[]),2==(7&o))for(var i=e.uint32()+e.pos;e.pos<i;)r.path.push(e.int32());else r.path.push(e.int32());break;case 2:if(r.span&&r.span.length||(r.span=[]),2==(7&o))for(i=e.uint32()+e.pos;e.pos<i;)r.span.push(e.int32());else r.span.push(e.int32());break;case 3:r.leadingComments=e.string();break;case 4:r.trailingComments=e.string();break;case 6:r.leadingDetachedComments&&r.leadingDetachedComments.length||(r.leadingDetachedComments=[]),r.leadingDetachedComments.push(e.string());break;default:e.skipType(7&o)}}return r},I.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},I.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.path&&e.hasOwnProperty("path")){if(!Array.isArray(e.path))return"path: array expected";for(var t=0;t<e.path.length;++t)if(!c.isInteger(e.path[t]))return"path: integer[] expected"}if(null!=e.span&&e.hasOwnProperty("span")){if(!Array.isArray(e.span))return"span: array expected";for(t=0;t<e.span.length;++t)if(!c.isInteger(e.span[t]))return"span: integer[] expected"}if(null!=e.leadingComments&&e.hasOwnProperty("leadingComments")&&!c.isString(e.leadingComments))return"leadingComments: string expected";if(null!=e.trailingComments&&e.hasOwnProperty("trailingComments")&&!c.isString(e.trailingComments))return"trailingComments: string expected";if(null!=e.leadingDetachedComments&&e.hasOwnProperty("leadingDetachedComments")){if(!Array.isArray(e.leadingDetachedComments))return"leadingDetachedComments: array expected";for(t=0;t<e.leadingDetachedComments.length;++t)if(!c.isString(e.leadingDetachedComments[t]))return"leadingDetachedComments: string[] expected"}return null},I.fromObject=function(e){if(e instanceof u.google.protobuf.SourceCodeInfo.Location)return e;var t=new u.google.protobuf.SourceCodeInfo.Location;if(e.path){if(!Array.isArray(e.path))throw TypeError(".google.protobuf.SourceCodeInfo.Location.path: array expected");t.path=[];for(var n=0;n<e.path.length;++n)t.path[n]=0|e.path[n]}if(e.span){if(!Array.isArray(e.span))throw TypeError(".google.protobuf.SourceCodeInfo.Location.span: array expected");t.span=[];for(n=0;n<e.span.length;++n)t.span[n]=0|e.span[n]}if(null!=e.leadingComments&&(t.leadingComments=String(e.leadingComments)),null!=e.trailingComments&&(t.trailingComments=String(e.trailingComments)),e.leadingDetachedComments){if(!Array.isArray(e.leadingDetachedComments))throw TypeError(".google.protobuf.SourceCodeInfo.Location.leadingDetachedComments: array expected");t.leadingDetachedComments=[];for(n=0;n<e.leadingDetachedComments.length;++n)t.leadingDetachedComments[n]=String(e.leadingDetachedComments[n])}return t},I.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.path=[],n.span=[],n.leadingDetachedComments=[]),t.defaults&&(n.leadingComments="",n.trailingComments=""),e.path&&e.path.length){n.path=[];for(var r=0;r<e.path.length;++r)n.path[r]=e.path[r]}if(e.span&&e.span.length){n.span=[];for(r=0;r<e.span.length;++r)n.span[r]=e.span[r]}if(null!=e.leadingComments&&e.hasOwnProperty("leadingComments")&&(n.leadingComments=e.leadingComments),null!=e.trailingComments&&e.hasOwnProperty("trailingComments")&&(n.trailingComments=e.trailingComments),e.leadingDetachedComments&&e.leadingDetachedComments.length){n.leadingDetachedComments=[];for(r=0;r<e.leadingDetachedComments.length;++r)n.leadingDetachedComments[r]=e.leadingDetachedComments[r]}return n},I.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},I),be),i.GeneratedCodeInfo=(me.prototype.annotation=c.emptyArray,me.create=function(e){return new me(e)},me.encode=function(e,t){if(t=t||a.create(),null!=e.annotation&&e.annotation.length)for(var n=0;n<e.annotation.length;++n)u.google.protobuf.GeneratedCodeInfo.Annotation.encode(e.annotation[n],t.uint32(10).fork()).ldelim();return t},me.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},me.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.GeneratedCodeInfo;e.pos<n;){var o=e.uint32();o>>>3==1?(r.annotation&&r.annotation.length||(r.annotation=[]),r.annotation.push(u.google.protobuf.GeneratedCodeInfo.Annotation.decode(e,e.uint32()))):e.skipType(7&o)}return r},me.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},me.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.annotation&&e.hasOwnProperty("annotation")){if(!Array.isArray(e.annotation))return"annotation: array expected";for(var t=0;t<e.annotation.length;++t){var n=u.google.protobuf.GeneratedCodeInfo.Annotation.verify(e.annotation[t]);if(n)return"annotation."+n}}return null},me.fromObject=function(e){if(e instanceof u.google.protobuf.GeneratedCodeInfo)return e;var t=new u.google.protobuf.GeneratedCodeInfo;if(e.annotation){if(!Array.isArray(e.annotation))throw TypeError(".google.protobuf.GeneratedCodeInfo.annotation: array expected");t.annotation=[];for(var n=0;n<e.annotation.length;++n){if("object"!=typeof e.annotation[n])throw TypeError(".google.protobuf.GeneratedCodeInfo.annotation: object expected");t.annotation[n]=u.google.protobuf.GeneratedCodeInfo.Annotation.fromObject(e.annotation[n])}}return t},me.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.annotation=[]),e.annotation&&e.annotation.length){n.annotation=[];for(var r=0;r<e.annotation.length;++r)n.annotation[r]=u.google.protobuf.GeneratedCodeInfo.Annotation.toObject(e.annotation[r],t)}return n},me.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},me.Annotation=(C.prototype.path=c.emptyArray,C.prototype.sourceFile="",C.prototype.begin=0,C.prototype.end=0,C.create=function(e){return new C(e)},C.encode=function(e,t){if(t=t||a.create(),null!=e.path&&e.path.length){t.uint32(10).fork();for(var n=0;n<e.path.length;++n)t.int32(e.path[n]);t.ldelim()}return null!=e.sourceFile&&Object.hasOwnProperty.call(e,"sourceFile")&&t.uint32(18).string(e.sourceFile),null!=e.begin&&Object.hasOwnProperty.call(e,"begin")&&t.uint32(24).int32(e.begin),null!=e.end&&Object.hasOwnProperty.call(e,"end")&&t.uint32(32).int32(e.end),t},C.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},C.decode=function(e,t){e instanceof s||(e=s.create(e));for(var n=void 0===t?e.len:e.pos+t,r=new u.google.protobuf.GeneratedCodeInfo.Annotation;e.pos<n;){var o=e.uint32();switch(o>>>3){case 1:if(r.path&&r.path.length||(r.path=[]),2==(7&o))for(var i=e.uint32()+e.pos;e.pos<i;)r.path.push(e.int32());else r.path.push(e.int32());break;case 2:r.sourceFile=e.string();break;case 3:r.begin=e.int32();break;case 4:r.end=e.int32();break;default:e.skipType(7&o)}}return r},C.decodeDelimited=function(e){return e instanceof s||(e=new s(e)),this.decode(e,e.uint32())},C.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.path&&e.hasOwnProperty("path")){if(!Array.isArray(e.path))return"path: array expected";for(var t=0;t<e.path.length;++t)if(!c.isInteger(e.path[t]))return"path: integer[] expected"}return null!=e.sourceFile&&e.hasOwnProperty("sourceFile")&&!c.isString(e.sourceFile)?"sourceFile: string expected":null!=e.begin&&e.hasOwnProperty("begin")&&!c.isInteger(e.begin)?"begin: integer expected":null!=e.end&&e.hasOwnProperty("end")&&!c.isInteger(e.end)?"end: integer expected":null},C.fromObject=function(e){if(e instanceof u.google.protobuf.GeneratedCodeInfo.Annotation)return e;var t=new u.google.protobuf.GeneratedCodeInfo.Annotation;if(e.path){if(!Array.isArray(e.path))throw TypeError(".google.protobuf.GeneratedCodeInfo.Annotation.path: array expected");t.path=[];for(var n=0;n<e.path.length;++n)t.path[n]=0|e.path[n]}return null!=e.sourceFile&&(t.sourceFile=String(e.sourceFile)),null!=e.begin&&(t.begin=0|e.begin),null!=e.end&&(t.end=0|e.end),t},C.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.path=[]),t.defaults&&(n.sourceFile="",n.begin=0,n.end=0),e.path&&e.path.length){n.path=[];for(var r=0;r<e.path.length;++r)n.path[r]=e.path[r]}return null!=e.sourceFile&&e.hasOwnProperty("sourceFile")&&(n.sourceFile=e.sourceFile),null!=e.begin&&e.hasOwnProperty("begin")&&(n.begin=e.begin),null!=e.end&&e.hasOwnProperty("end")&&(n.end=e.end),n},C.prototype.toJSON=function(){return this.constructor.toObject(this,r.util.toJSONOptions)},C),me),i),G),u});

/***/ }),

/***/ 934:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
// minimal library entry point.


module.exports = __nccwpck_require__(911);


/***/ }),

/***/ 911:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

var protobuf = exports;

/**
 * Build type, one of `"full"`, `"light"` or `"minimal"`.
 * @name build
 * @type {string}
 * @const
 */
protobuf.build = "minimal";

// Serialization
protobuf.Writer       = __nccwpck_require__(860);
protobuf.BufferWriter = __nccwpck_require__(814);
protobuf.Reader       = __nccwpck_require__(373);
protobuf.BufferReader = __nccwpck_require__(899);

// Utility
protobuf.util         = __nccwpck_require__(565);
protobuf.rpc          = __nccwpck_require__(115);
protobuf.roots        = __nccwpck_require__(986);
protobuf.configure    = configure;

/* istanbul ignore next */
/**
 * Reconfigures the library according to the environment.
 * @returns {undefined}
 */
function configure() {
    protobuf.util._configure();
    protobuf.Writer._configure(protobuf.BufferWriter);
    protobuf.Reader._configure(protobuf.BufferReader);
}

// Set up buffer utility according to the environment
configure();


/***/ }),

/***/ 373:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

module.exports = Reader;

var util      = __nccwpck_require__(565);

var BufferReader; // cyclic

var LongBits  = util.LongBits,
    utf8      = util.utf8;

/* istanbul ignore next */
function indexOutOfRange(reader, writeLength) {
    return RangeError("index out of range: " + reader.pos + " + " + (writeLength || 1) + " > " + reader.len);
}

/**
 * Constructs a new reader instance using the specified buffer.
 * @classdesc Wire format reader using `Uint8Array` if available, otherwise `Array`.
 * @constructor
 * @param {Uint8Array} buffer Buffer to read from
 */
function Reader(buffer) {

    /**
     * Read buffer.
     * @type {Uint8Array}
     */
    this.buf = buffer;

    /**
     * Read buffer position.
     * @type {number}
     */
    this.pos = 0;

    /**
     * Read buffer length.
     * @type {number}
     */
    this.len = buffer.length;
}

var create_array = typeof Uint8Array !== "undefined"
    ? function create_typed_array(buffer) {
        if (buffer instanceof Uint8Array || Array.isArray(buffer))
            return new Reader(buffer);
        throw Error("illegal buffer");
    }
    /* istanbul ignore next */
    : function create_array(buffer) {
        if (Array.isArray(buffer))
            return new Reader(buffer);
        throw Error("illegal buffer");
    };

var create = function create() {
    return util.Buffer
        ? function create_buffer_setup(buffer) {
            return (Reader.create = function create_buffer(buffer) {
                return util.Buffer.isBuffer(buffer)
                    ? new BufferReader(buffer)
                    /* istanbul ignore next */
                    : create_array(buffer);
            })(buffer);
        }
        /* istanbul ignore next */
        : create_array;
};

/**
 * Creates a new reader using the specified buffer.
 * @function
 * @param {Uint8Array|Buffer} buffer Buffer to read from
 * @returns {Reader|BufferReader} A {@link BufferReader} if `buffer` is a Buffer, otherwise a {@link Reader}
 * @throws {Error} If `buffer` is not a valid buffer
 */
Reader.create = create();

Reader.prototype._slice = util.Array.prototype.subarray || /* istanbul ignore next */ util.Array.prototype.slice;

/**
 * Reads a varint as an unsigned 32 bit value.
 * @function
 * @returns {number} Value read
 */
Reader.prototype.uint32 = (function read_uint32_setup() {
    var value = 4294967295; // optimizer type-hint, tends to deopt otherwise (?!)
    return function read_uint32() {
        value = (         this.buf[this.pos] & 127       ) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) <<  7) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 14) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 21) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] &  15) << 28) >>> 0; if (this.buf[this.pos++] < 128) return value;

        /* istanbul ignore if */
        if ((this.pos += 5) > this.len) {
            this.pos = this.len;
            throw indexOutOfRange(this, 10);
        }
        return value;
    };
})();

/**
 * Reads a varint as a signed 32 bit value.
 * @returns {number} Value read
 */
Reader.prototype.int32 = function read_int32() {
    return this.uint32() | 0;
};

/**
 * Reads a zig-zag encoded varint as a signed 32 bit value.
 * @returns {number} Value read
 */
Reader.prototype.sint32 = function read_sint32() {
    var value = this.uint32();
    return value >>> 1 ^ -(value & 1) | 0;
};

/* eslint-disable no-invalid-this */

function readLongVarint() {
    // tends to deopt with local vars for octet etc.
    var bits = new LongBits(0, 0);
    var i = 0;
    if (this.len - this.pos > 4) { // fast route (lo)
        for (; i < 4; ++i) {
            // 1st..4th
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
        // 5th
        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
        bits.hi = (bits.hi | (this.buf[this.pos] & 127) >>  4) >>> 0;
        if (this.buf[this.pos++] < 128)
            return bits;
        i = 0;
    } else {
        for (; i < 3; ++i) {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
            // 1st..3th
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
        // 4th
        bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
        return bits;
    }
    if (this.len - this.pos > 4) { // fast route (hi)
        for (; i < 5; ++i) {
            // 6th..10th
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
    } else {
        for (; i < 5; ++i) {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
            // 6th..10th
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
    }
    /* istanbul ignore next */
    throw Error("invalid varint encoding");
}

/* eslint-enable no-invalid-this */

/**
 * Reads a varint as a signed 64 bit value.
 * @name Reader#int64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a varint as an unsigned 64 bit value.
 * @name Reader#uint64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a zig-zag encoded varint as a signed 64 bit value.
 * @name Reader#sint64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a varint as a boolean.
 * @returns {boolean} Value read
 */
Reader.prototype.bool = function read_bool() {
    return this.uint32() !== 0;
};

function readFixed32_end(buf, end) { // note that this uses `end`, not `pos`
    return (buf[end - 4]
          | buf[end - 3] << 8
          | buf[end - 2] << 16
          | buf[end - 1] << 24) >>> 0;
}

/**
 * Reads fixed 32 bits as an unsigned 32 bit integer.
 * @returns {number} Value read
 */
Reader.prototype.fixed32 = function read_fixed32() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    return readFixed32_end(this.buf, this.pos += 4);
};

/**
 * Reads fixed 32 bits as a signed 32 bit integer.
 * @returns {number} Value read
 */
Reader.prototype.sfixed32 = function read_sfixed32() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    return readFixed32_end(this.buf, this.pos += 4) | 0;
};

/* eslint-disable no-invalid-this */

function readFixed64(/* this: Reader */) {

    /* istanbul ignore if */
    if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 8);

    return new LongBits(readFixed32_end(this.buf, this.pos += 4), readFixed32_end(this.buf, this.pos += 4));
}

/* eslint-enable no-invalid-this */

/**
 * Reads fixed 64 bits.
 * @name Reader#fixed64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads zig-zag encoded fixed 64 bits.
 * @name Reader#sfixed64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a float (32 bit) as a number.
 * @function
 * @returns {number} Value read
 */
Reader.prototype.float = function read_float() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    var value = util.float.readFloatLE(this.buf, this.pos);
    this.pos += 4;
    return value;
};

/**
 * Reads a double (64 bit float) as a number.
 * @function
 * @returns {number} Value read
 */
Reader.prototype.double = function read_double() {

    /* istanbul ignore if */
    if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 4);

    var value = util.float.readDoubleLE(this.buf, this.pos);
    this.pos += 8;
    return value;
};

/**
 * Reads a sequence of bytes preceeded by its length as a varint.
 * @returns {Uint8Array} Value read
 */
Reader.prototype.bytes = function read_bytes() {
    var length = this.uint32(),
        start  = this.pos,
        end    = this.pos + length;

    /* istanbul ignore if */
    if (end > this.len)
        throw indexOutOfRange(this, length);

    this.pos += length;
    if (Array.isArray(this.buf)) // plain array
        return this.buf.slice(start, end);

    if (start === end) { // fix for IE 10/Win8 and others' subarray returning array of size 1
        var nativeBuffer = util.Buffer;
        return nativeBuffer
            ? nativeBuffer.alloc(0)
            : new this.buf.constructor(0);
    }
    return this._slice.call(this.buf, start, end);
};

/**
 * Reads a string preceeded by its byte length as a varint.
 * @returns {string} Value read
 */
Reader.prototype.string = function read_string() {
    var bytes = this.bytes();
    return utf8.read(bytes, 0, bytes.length);
};

/**
 * Skips the specified number of bytes if specified, otherwise skips a varint.
 * @param {number} [length] Length if known, otherwise a varint is assumed
 * @returns {Reader} `this`
 */
Reader.prototype.skip = function skip(length) {
    if (typeof length === "number") {
        /* istanbul ignore if */
        if (this.pos + length > this.len)
            throw indexOutOfRange(this, length);
        this.pos += length;
    } else {
        do {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
        } while (this.buf[this.pos++] & 128);
    }
    return this;
};

/**
 * Skips the next element of the specified wire type.
 * @param {number} wireType Wire type received
 * @returns {Reader} `this`
 */
Reader.prototype.skipType = function(wireType) {
    switch (wireType) {
        case 0:
            this.skip();
            break;
        case 1:
            this.skip(8);
            break;
        case 2:
            this.skip(this.uint32());
            break;
        case 3:
            while ((wireType = this.uint32() & 7) !== 4) {
                this.skipType(wireType);
            }
            break;
        case 5:
            this.skip(4);
            break;

        /* istanbul ignore next */
        default:
            throw Error("invalid wire type " + wireType + " at offset " + this.pos);
    }
    return this;
};

Reader._configure = function(BufferReader_) {
    BufferReader = BufferReader_;
    Reader.create = create();
    BufferReader._configure();

    var fn = util.Long ? "toLong" : /* istanbul ignore next */ "toNumber";
    util.merge(Reader.prototype, {

        int64: function read_int64() {
            return readLongVarint.call(this)[fn](false);
        },

        uint64: function read_uint64() {
            return readLongVarint.call(this)[fn](true);
        },

        sint64: function read_sint64() {
            return readLongVarint.call(this).zzDecode()[fn](false);
        },

        fixed64: function read_fixed64() {
            return readFixed64.call(this)[fn](true);
        },

        sfixed64: function read_sfixed64() {
            return readFixed64.call(this)[fn](false);
        }

    });
};


/***/ }),

/***/ 899:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

module.exports = BufferReader;

// extends Reader
var Reader = __nccwpck_require__(373);
(BufferReader.prototype = Object.create(Reader.prototype)).constructor = BufferReader;

var util = __nccwpck_require__(565);

/**
 * Constructs a new buffer reader instance.
 * @classdesc Wire format reader using node buffers.
 * @extends Reader
 * @constructor
 * @param {Buffer} buffer Buffer to read from
 */
function BufferReader(buffer) {
    Reader.call(this, buffer);

    /**
     * Read buffer.
     * @name BufferReader#buf
     * @type {Buffer}
     */
}

BufferReader._configure = function () {
    /* istanbul ignore else */
    if (util.Buffer)
        BufferReader.prototype._slice = util.Buffer.prototype.slice;
};


/**
 * @override
 */
BufferReader.prototype.string = function read_string_buffer() {
    var len = this.uint32(); // modifies pos
    return this.buf.utf8Slice
        ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + len, this.len))
        : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + len, this.len));
};

/**
 * Reads a sequence of bytes preceeded by its length as a varint.
 * @name BufferReader#bytes
 * @function
 * @returns {Buffer} Value read
 */

BufferReader._configure();


/***/ }),

/***/ 986:
/***/ ((module) => {

"use strict";

module.exports = {};

/**
 * Named roots.
 * This is where pbjs stores generated structures (the option `-r, --root` specifies a name).
 * Can also be used manually to make roots available across modules.
 * @name roots
 * @type {Object.<string,Root>}
 * @example
 * // pbjs -r myroot -o compiled.js ...
 *
 * // in another module:
 * require("./compiled.js");
 *
 * // in any subsequent module:
 * var root = protobuf.roots["myroot"];
 */


/***/ }),

/***/ 115:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


/**
 * Streaming RPC helpers.
 * @namespace
 */
var rpc = exports;

/**
 * RPC implementation passed to {@link Service#create} performing a service request on network level, i.e. by utilizing http requests or websockets.
 * @typedef RPCImpl
 * @type {function}
 * @param {Method|rpc.ServiceMethod<Message<{}>,Message<{}>>} method Reflected or static method being called
 * @param {Uint8Array} requestData Request data
 * @param {RPCImplCallback} callback Callback function
 * @returns {undefined}
 * @example
 * function rpcImpl(method, requestData, callback) {
 *     if (protobuf.util.lcFirst(method.name) !== "myMethod") // compatible with static code
 *         throw Error("no such method");
 *     asynchronouslyObtainAResponse(requestData, function(err, responseData) {
 *         callback(err, responseData);
 *     });
 * }
 */

/**
 * Node-style callback as used by {@link RPCImpl}.
 * @typedef RPCImplCallback
 * @type {function}
 * @param {Error|null} error Error, if any, otherwise `null`
 * @param {Uint8Array|null} [response] Response data or `null` to signal end of stream, if there hasn't been an error
 * @returns {undefined}
 */

rpc.Service = __nccwpck_require__(606);


/***/ }),

/***/ 606:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

module.exports = Service;

var util = __nccwpck_require__(565);

// Extends EventEmitter
(Service.prototype = Object.create(util.EventEmitter.prototype)).constructor = Service;

/**
 * A service method callback as used by {@link rpc.ServiceMethod|ServiceMethod}.
 *
 * Differs from {@link RPCImplCallback} in that it is an actual callback of a service method which may not return `response = null`.
 * @typedef rpc.ServiceMethodCallback
 * @template TRes extends Message<TRes>
 * @type {function}
 * @param {Error|null} error Error, if any
 * @param {TRes} [response] Response message
 * @returns {undefined}
 */

/**
 * A service method part of a {@link rpc.Service} as created by {@link Service.create}.
 * @typedef rpc.ServiceMethod
 * @template TReq extends Message<TReq>
 * @template TRes extends Message<TRes>
 * @type {function}
 * @param {TReq|Properties<TReq>} request Request message or plain object
 * @param {rpc.ServiceMethodCallback<TRes>} [callback] Node-style callback called with the error, if any, and the response message
 * @returns {Promise<Message<TRes>>} Promise if `callback` has been omitted, otherwise `undefined`
 */

/**
 * Constructs a new RPC service instance.
 * @classdesc An RPC service as returned by {@link Service#create}.
 * @exports rpc.Service
 * @extends util.EventEmitter
 * @constructor
 * @param {RPCImpl} rpcImpl RPC implementation
 * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
 * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
 */
function Service(rpcImpl, requestDelimited, responseDelimited) {

    if (typeof rpcImpl !== "function")
        throw TypeError("rpcImpl must be a function");

    util.EventEmitter.call(this);

    /**
     * RPC implementation. Becomes `null` once the service is ended.
     * @type {RPCImpl|null}
     */
    this.rpcImpl = rpcImpl;

    /**
     * Whether requests are length-delimited.
     * @type {boolean}
     */
    this.requestDelimited = Boolean(requestDelimited);

    /**
     * Whether responses are length-delimited.
     * @type {boolean}
     */
    this.responseDelimited = Boolean(responseDelimited);
}

/**
 * Calls a service method through {@link rpc.Service#rpcImpl|rpcImpl}.
 * @param {Method|rpc.ServiceMethod<TReq,TRes>} method Reflected or static method
 * @param {Constructor<TReq>} requestCtor Request constructor
 * @param {Constructor<TRes>} responseCtor Response constructor
 * @param {TReq|Properties<TReq>} request Request message or plain object
 * @param {rpc.ServiceMethodCallback<TRes>} callback Service callback
 * @returns {undefined}
 * @template TReq extends Message<TReq>
 * @template TRes extends Message<TRes>
 */
Service.prototype.rpcCall = function rpcCall(method, requestCtor, responseCtor, request, callback) {

    if (!request)
        throw TypeError("request must be specified");

    var self = this;
    if (!callback)
        return util.asPromise(rpcCall, self, method, requestCtor, responseCtor, request);

    if (!self.rpcImpl) {
        setTimeout(function() { callback(Error("already ended")); }, 0);
        return undefined;
    }

    try {
        return self.rpcImpl(
            method,
            requestCtor[self.requestDelimited ? "encodeDelimited" : "encode"](request).finish(),
            function rpcCallback(err, response) {

                if (err) {
                    self.emit("error", err, method);
                    return callback(err);
                }

                if (response === null) {
                    self.end(/* endedByRPC */ true);
                    return undefined;
                }

                if (!(response instanceof responseCtor)) {
                    try {
                        response = responseCtor[self.responseDelimited ? "decodeDelimited" : "decode"](response);
                    } catch (err) {
                        self.emit("error", err, method);
                        return callback(err);
                    }
                }

                self.emit("data", response, method);
                return callback(null, response);
            }
        );
    } catch (err) {
        self.emit("error", err, method);
        setTimeout(function() { callback(err); }, 0);
        return undefined;
    }
};

/**
 * Ends this service and emits the `end` event.
 * @param {boolean} [endedByRPC=false] Whether the service has been ended by the RPC implementation.
 * @returns {rpc.Service} `this`
 */
Service.prototype.end = function end(endedByRPC) {
    if (this.rpcImpl) {
        if (!endedByRPC) // signal end to rpcImpl
            this.rpcImpl(null, null, null);
        this.rpcImpl = null;
        this.emit("end").off();
    }
    return this;
};


/***/ }),

/***/ 35:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

module.exports = LongBits;

var util = __nccwpck_require__(565);

/**
 * Constructs new long bits.
 * @classdesc Helper class for working with the low and high bits of a 64 bit value.
 * @memberof util
 * @constructor
 * @param {number} lo Low 32 bits, unsigned
 * @param {number} hi High 32 bits, unsigned
 */
function LongBits(lo, hi) {

    // note that the casts below are theoretically unnecessary as of today, but older statically
    // generated converter code might still call the ctor with signed 32bits. kept for compat.

    /**
     * Low bits.
     * @type {number}
     */
    this.lo = lo >>> 0;

    /**
     * High bits.
     * @type {number}
     */
    this.hi = hi >>> 0;
}

/**
 * Zero bits.
 * @memberof util.LongBits
 * @type {util.LongBits}
 */
var zero = LongBits.zero = new LongBits(0, 0);

zero.toNumber = function() { return 0; };
zero.zzEncode = zero.zzDecode = function() { return this; };
zero.length = function() { return 1; };

/**
 * Zero hash.
 * @memberof util.LongBits
 * @type {string}
 */
var zeroHash = LongBits.zeroHash = "\0\0\0\0\0\0\0\0";

/**
 * Constructs new long bits from the specified number.
 * @param {number} value Value
 * @returns {util.LongBits} Instance
 */
LongBits.fromNumber = function fromNumber(value) {
    if (value === 0)
        return zero;
    var sign = value < 0;
    if (sign)
        value = -value;
    var lo = value >>> 0,
        hi = (value - lo) / 4294967296 >>> 0;
    if (sign) {
        hi = ~hi >>> 0;
        lo = ~lo >>> 0;
        if (++lo > 4294967295) {
            lo = 0;
            if (++hi > 4294967295)
                hi = 0;
        }
    }
    return new LongBits(lo, hi);
};

/**
 * Constructs new long bits from a number, long or string.
 * @param {Long|number|string} value Value
 * @returns {util.LongBits} Instance
 */
LongBits.from = function from(value) {
    if (typeof value === "number")
        return LongBits.fromNumber(value);
    if (util.isString(value)) {
        /* istanbul ignore else */
        if (util.Long)
            value = util.Long.fromString(value);
        else
            return LongBits.fromNumber(parseInt(value, 10));
    }
    return value.low || value.high ? new LongBits(value.low >>> 0, value.high >>> 0) : zero;
};

/**
 * Converts this long bits to a possibly unsafe JavaScript number.
 * @param {boolean} [unsigned=false] Whether unsigned or not
 * @returns {number} Possibly unsafe number
 */
LongBits.prototype.toNumber = function toNumber(unsigned) {
    if (!unsigned && this.hi >>> 31) {
        var lo = ~this.lo + 1 >>> 0,
            hi = ~this.hi     >>> 0;
        if (!lo)
            hi = hi + 1 >>> 0;
        return -(lo + hi * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
};

/**
 * Converts this long bits to a long.
 * @param {boolean} [unsigned=false] Whether unsigned or not
 * @returns {Long} Long
 */
LongBits.prototype.toLong = function toLong(unsigned) {
    return util.Long
        ? new util.Long(this.lo | 0, this.hi | 0, Boolean(unsigned))
        /* istanbul ignore next */
        : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(unsigned) };
};

var charCodeAt = String.prototype.charCodeAt;

/**
 * Constructs new long bits from the specified 8 characters long hash.
 * @param {string} hash Hash
 * @returns {util.LongBits} Bits
 */
LongBits.fromHash = function fromHash(hash) {
    if (hash === zeroHash)
        return zero;
    return new LongBits(
        ( charCodeAt.call(hash, 0)
        | charCodeAt.call(hash, 1) << 8
        | charCodeAt.call(hash, 2) << 16
        | charCodeAt.call(hash, 3) << 24) >>> 0
    ,
        ( charCodeAt.call(hash, 4)
        | charCodeAt.call(hash, 5) << 8
        | charCodeAt.call(hash, 6) << 16
        | charCodeAt.call(hash, 7) << 24) >>> 0
    );
};

/**
 * Converts this long bits to a 8 characters long hash.
 * @returns {string} Hash
 */
LongBits.prototype.toHash = function toHash() {
    return String.fromCharCode(
        this.lo        & 255,
        this.lo >>> 8  & 255,
        this.lo >>> 16 & 255,
        this.lo >>> 24      ,
        this.hi        & 255,
        this.hi >>> 8  & 255,
        this.hi >>> 16 & 255,
        this.hi >>> 24
    );
};

/**
 * Zig-zag encodes this long bits.
 * @returns {util.LongBits} `this`
 */
LongBits.prototype.zzEncode = function zzEncode() {
    var mask =   this.hi >> 31;
    this.hi  = ((this.hi << 1 | this.lo >>> 31) ^ mask) >>> 0;
    this.lo  = ( this.lo << 1                   ^ mask) >>> 0;
    return this;
};

/**
 * Zig-zag decodes this long bits.
 * @returns {util.LongBits} `this`
 */
LongBits.prototype.zzDecode = function zzDecode() {
    var mask = -(this.lo & 1);
    this.lo  = ((this.lo >>> 1 | this.hi << 31) ^ mask) >>> 0;
    this.hi  = ( this.hi >>> 1                  ^ mask) >>> 0;
    return this;
};

/**
 * Calculates the length of this longbits when encoded as a varint.
 * @returns {number} Length
 */
LongBits.prototype.length = function length() {
    var part0 =  this.lo,
        part1 = (this.lo >>> 28 | this.hi << 4) >>> 0,
        part2 =  this.hi >>> 24;
    return part2 === 0
         ? part1 === 0
           ? part0 < 16384
             ? part0 < 128 ? 1 : 2
             : part0 < 2097152 ? 3 : 4
           : part1 < 16384
             ? part1 < 128 ? 5 : 6
             : part1 < 2097152 ? 7 : 8
         : part2 < 128 ? 9 : 10;
};


/***/ }),

/***/ 565:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var util = exports;

// used to return a Promise where callback is omitted
util.asPromise = __nccwpck_require__(252);

// converts to / from base64 encoded strings
util.base64 = __nccwpck_require__(718);

// base class of rpc.Service
util.EventEmitter = __nccwpck_require__(850);

// float handling accross browsers
util.float = __nccwpck_require__(843);

// requires modules optionally and hides the call from bundlers
util.inquire = __nccwpck_require__(94);

// converts to / from utf8 encoded strings
util.utf8 = __nccwpck_require__(49);

// provides a node-like buffer pool in the browser
util.pool = __nccwpck_require__(743);

// utility to work with the low and high bits of a 64 bit value
util.LongBits = __nccwpck_require__(35);

/**
 * Whether running within node or not.
 * @memberof util
 * @type {boolean}
 */
util.isNode = Boolean(typeof global !== "undefined"
                   && global
                   && global.process
                   && global.process.versions
                   && global.process.versions.node);

/**
 * Global object reference.
 * @memberof util
 * @type {Object}
 */
util.global = util.isNode && global
           || typeof window !== "undefined" && window
           || typeof self   !== "undefined" && self
           || this; // eslint-disable-line no-invalid-this

/**
 * An immuable empty array.
 * @memberof util
 * @type {Array.<*>}
 * @const
 */
util.emptyArray = Object.freeze ? Object.freeze([]) : /* istanbul ignore next */ []; // used on prototypes

/**
 * An immutable empty object.
 * @type {Object}
 * @const
 */
util.emptyObject = Object.freeze ? Object.freeze({}) : /* istanbul ignore next */ {}; // used on prototypes

/**
 * Tests if the specified value is an integer.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an integer
 */
util.isInteger = Number.isInteger || /* istanbul ignore next */ function isInteger(value) {
    return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
};

/**
 * Tests if the specified value is a string.
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is a string
 */
util.isString = function isString(value) {
    return typeof value === "string" || value instanceof String;
};

/**
 * Tests if the specified value is a non-null object.
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is a non-null object
 */
util.isObject = function isObject(value) {
    return value && typeof value === "object";
};

/**
 * Checks if a property on a message is considered to be present.
 * This is an alias of {@link util.isSet}.
 * @function
 * @param {Object} obj Plain object or message instance
 * @param {string} prop Property name
 * @returns {boolean} `true` if considered to be present, otherwise `false`
 */
util.isset =

/**
 * Checks if a property on a message is considered to be present.
 * @param {Object} obj Plain object or message instance
 * @param {string} prop Property name
 * @returns {boolean} `true` if considered to be present, otherwise `false`
 */
util.isSet = function isSet(obj, prop) {
    var value = obj[prop];
    if (value != null && obj.hasOwnProperty(prop)) // eslint-disable-line eqeqeq, no-prototype-builtins
        return typeof value !== "object" || (Array.isArray(value) ? value.length : Object.keys(value).length) > 0;
    return false;
};

/**
 * Any compatible Buffer instance.
 * This is a minimal stand-alone definition of a Buffer instance. The actual type is that exported by node's typings.
 * @interface Buffer
 * @extends Uint8Array
 */

/**
 * Node's Buffer class if available.
 * @type {Constructor<Buffer>}
 */
util.Buffer = (function() {
    try {
        var Buffer = util.inquire("buffer").Buffer;
        // refuse to use non-node buffers if not explicitly assigned (perf reasons):
        return Buffer.prototype.utf8Write ? Buffer : /* istanbul ignore next */ null;
    } catch (e) {
        /* istanbul ignore next */
        return null;
    }
})();

// Internal alias of or polyfull for Buffer.from.
util._Buffer_from = null;

// Internal alias of or polyfill for Buffer.allocUnsafe.
util._Buffer_allocUnsafe = null;

/**
 * Creates a new buffer of whatever type supported by the environment.
 * @param {number|number[]} [sizeOrArray=0] Buffer size or number array
 * @returns {Uint8Array|Buffer} Buffer
 */
util.newBuffer = function newBuffer(sizeOrArray) {
    /* istanbul ignore next */
    return typeof sizeOrArray === "number"
        ? util.Buffer
            ? util._Buffer_allocUnsafe(sizeOrArray)
            : new util.Array(sizeOrArray)
        : util.Buffer
            ? util._Buffer_from(sizeOrArray)
            : typeof Uint8Array === "undefined"
                ? sizeOrArray
                : new Uint8Array(sizeOrArray);
};

/**
 * Array implementation used in the browser. `Uint8Array` if supported, otherwise `Array`.
 * @type {Constructor<Uint8Array>}
 */
util.Array = typeof Uint8Array !== "undefined" ? Uint8Array /* istanbul ignore next */ : Array;

/**
 * Any compatible Long instance.
 * This is a minimal stand-alone definition of a Long instance. The actual type is that exported by long.js.
 * @interface Long
 * @property {number} low Low bits
 * @property {number} high High bits
 * @property {boolean} unsigned Whether unsigned or not
 */

/**
 * Long.js's Long class if available.
 * @type {Constructor<Long>}
 */
util.Long = /* istanbul ignore next */ util.global.dcodeIO && /* istanbul ignore next */ util.global.dcodeIO.Long
         || /* istanbul ignore next */ util.global.Long
         || util.inquire("long");

/**
 * Regular expression used to verify 2 bit (`bool`) map keys.
 * @type {RegExp}
 * @const
 */
util.key2Re = /^true|false|0|1$/;

/**
 * Regular expression used to verify 32 bit (`int32` etc.) map keys.
 * @type {RegExp}
 * @const
 */
util.key32Re = /^-?(?:0|[1-9][0-9]*)$/;

/**
 * Regular expression used to verify 64 bit (`int64` etc.) map keys.
 * @type {RegExp}
 * @const
 */
util.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;

/**
 * Converts a number or long to an 8 characters long hash string.
 * @param {Long|number} value Value to convert
 * @returns {string} Hash
 */
util.longToHash = function longToHash(value) {
    return value
        ? util.LongBits.from(value).toHash()
        : util.LongBits.zeroHash;
};

/**
 * Converts an 8 characters long hash string to a long or number.
 * @param {string} hash Hash
 * @param {boolean} [unsigned=false] Whether unsigned or not
 * @returns {Long|number} Original value
 */
util.longFromHash = function longFromHash(hash, unsigned) {
    var bits = util.LongBits.fromHash(hash);
    if (util.Long)
        return util.Long.fromBits(bits.lo, bits.hi, unsigned);
    return bits.toNumber(Boolean(unsigned));
};

/**
 * Merges the properties of the source object into the destination object.
 * @memberof util
 * @param {Object.<string,*>} dst Destination object
 * @param {Object.<string,*>} src Source object
 * @param {boolean} [ifNotSet=false] Merges only if the key is not already set
 * @returns {Object.<string,*>} Destination object
 */
function merge(dst, src, ifNotSet) { // used by converters
    for (var keys = Object.keys(src), i = 0; i < keys.length; ++i)
        if (dst[keys[i]] === undefined || !ifNotSet)
            dst[keys[i]] = src[keys[i]];
    return dst;
}

util.merge = merge;

/**
 * Converts the first character of a string to lower case.
 * @param {string} str String to convert
 * @returns {string} Converted string
 */
util.lcFirst = function lcFirst(str) {
    return str.charAt(0).toLowerCase() + str.substring(1);
};

/**
 * Creates a custom error constructor.
 * @memberof util
 * @param {string} name Error name
 * @returns {Constructor<Error>} Custom error constructor
 */
function newError(name) {

    function CustomError(message, properties) {

        if (!(this instanceof CustomError))
            return new CustomError(message, properties);

        // Error.call(this, message);
        // ^ just returns a new error instance because the ctor can be called as a function

        Object.defineProperty(this, "message", { get: function() { return message; } });

        /* istanbul ignore next */
        if (Error.captureStackTrace) // node
            Error.captureStackTrace(this, CustomError);
        else
            Object.defineProperty(this, "stack", { value: new Error().stack || "" });

        if (properties)
            merge(this, properties);
    }

    CustomError.prototype = Object.create(Error.prototype, {
        constructor: {
            value: CustomError,
            writable: true,
            enumerable: false,
            configurable: true,
        },
        name: {
            get: function get() { return name; },
            set: undefined,
            enumerable: false,
            // configurable: false would accurately preserve the behavior of
            // the original, but I'm guessing that was not intentional.
            // For an actual error subclass, this property would
            // be configurable.
            configurable: true,
        },
        toString: {
            value: function value() { return this.name + ": " + this.message; },
            writable: true,
            enumerable: false,
            configurable: true,
        },
    });

    return CustomError;
}

util.newError = newError;

/**
 * Constructs a new protocol error.
 * @classdesc Error subclass indicating a protocol specifc error.
 * @memberof util
 * @extends Error
 * @template T extends Message<T>
 * @constructor
 * @param {string} message Error message
 * @param {Object.<string,*>} [properties] Additional properties
 * @example
 * try {
 *     MyMessage.decode(someBuffer); // throws if required fields are missing
 * } catch (e) {
 *     if (e instanceof ProtocolError && e.instance)
 *         console.log("decoded so far: " + JSON.stringify(e.instance));
 * }
 */
util.ProtocolError = newError("ProtocolError");

/**
 * So far decoded message instance.
 * @name util.ProtocolError#instance
 * @type {Message<T>}
 */

/**
 * A OneOf getter as returned by {@link util.oneOfGetter}.
 * @typedef OneOfGetter
 * @type {function}
 * @returns {string|undefined} Set field name, if any
 */

/**
 * Builds a getter for a oneof's present field name.
 * @param {string[]} fieldNames Field names
 * @returns {OneOfGetter} Unbound getter
 */
util.oneOfGetter = function getOneOf(fieldNames) {
    var fieldMap = {};
    for (var i = 0; i < fieldNames.length; ++i)
        fieldMap[fieldNames[i]] = 1;

    /**
     * @returns {string|undefined} Set field name, if any
     * @this Object
     * @ignore
     */
    return function() { // eslint-disable-line consistent-return
        for (var keys = Object.keys(this), i = keys.length - 1; i > -1; --i)
            if (fieldMap[keys[i]] === 1 && this[keys[i]] !== undefined && this[keys[i]] !== null)
                return keys[i];
    };
};

/**
 * A OneOf setter as returned by {@link util.oneOfSetter}.
 * @typedef OneOfSetter
 * @type {function}
 * @param {string|undefined} value Field name
 * @returns {undefined}
 */

/**
 * Builds a setter for a oneof's present field name.
 * @param {string[]} fieldNames Field names
 * @returns {OneOfSetter} Unbound setter
 */
util.oneOfSetter = function setOneOf(fieldNames) {

    /**
     * @param {string} name Field name
     * @returns {undefined}
     * @this Object
     * @ignore
     */
    return function(name) {
        for (var i = 0; i < fieldNames.length; ++i)
            if (fieldNames[i] !== name)
                delete this[fieldNames[i]];
    };
};

/**
 * Default conversion options used for {@link Message#toJSON} implementations.
 *
 * These options are close to proto3's JSON mapping with the exception that internal types like Any are handled just like messages. More precisely:
 *
 * - Longs become strings
 * - Enums become string keys
 * - Bytes become base64 encoded strings
 * - (Sub-)Messages become plain objects
 * - Maps become plain objects with all string keys
 * - Repeated fields become arrays
 * - NaN and Infinity for float and double fields become strings
 *
 * @type {IConversionOptions}
 * @see https://developers.google.com/protocol-buffers/docs/proto3?hl=en#json
 */
util.toJSONOptions = {
    longs: String,
    enums: String,
    bytes: String,
    json: true
};

// Sets up buffer utility according to the environment (called in index-minimal)
util._configure = function() {
    var Buffer = util.Buffer;
    /* istanbul ignore if */
    if (!Buffer) {
        util._Buffer_from = util._Buffer_allocUnsafe = null;
        return;
    }
    // because node 4.x buffers are incompatible & immutable
    // see: https://github.com/dcodeIO/protobuf.js/pull/665
    util._Buffer_from = Buffer.from !== Uint8Array.from && Buffer.from ||
        /* istanbul ignore next */
        function Buffer_from(value, encoding) {
            return new Buffer(value, encoding);
        };
    util._Buffer_allocUnsafe = Buffer.allocUnsafe ||
        /* istanbul ignore next */
        function Buffer_allocUnsafe(size) {
            return new Buffer(size);
        };
};


/***/ }),

/***/ 860:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

module.exports = Writer;

var util      = __nccwpck_require__(565);

var BufferWriter; // cyclic

var LongBits  = util.LongBits,
    base64    = util.base64,
    utf8      = util.utf8;

/**
 * Constructs a new writer operation instance.
 * @classdesc Scheduled writer operation.
 * @constructor
 * @param {function(*, Uint8Array, number)} fn Function to call
 * @param {number} len Value byte length
 * @param {*} val Value to write
 * @ignore
 */
function Op(fn, len, val) {

    /**
     * Function to call.
     * @type {function(Uint8Array, number, *)}
     */
    this.fn = fn;

    /**
     * Value byte length.
     * @type {number}
     */
    this.len = len;

    /**
     * Next operation.
     * @type {Writer.Op|undefined}
     */
    this.next = undefined;

    /**
     * Value to write.
     * @type {*}
     */
    this.val = val; // type varies
}

/* istanbul ignore next */
function noop() {} // eslint-disable-line no-empty-function

/**
 * Constructs a new writer state instance.
 * @classdesc Copied writer state.
 * @memberof Writer
 * @constructor
 * @param {Writer} writer Writer to copy state from
 * @ignore
 */
function State(writer) {

    /**
     * Current head.
     * @type {Writer.Op}
     */
    this.head = writer.head;

    /**
     * Current tail.
     * @type {Writer.Op}
     */
    this.tail = writer.tail;

    /**
     * Current buffer length.
     * @type {number}
     */
    this.len = writer.len;

    /**
     * Next state.
     * @type {State|null}
     */
    this.next = writer.states;
}

/**
 * Constructs a new writer instance.
 * @classdesc Wire format writer using `Uint8Array` if available, otherwise `Array`.
 * @constructor
 */
function Writer() {

    /**
     * Current length.
     * @type {number}
     */
    this.len = 0;

    /**
     * Operations head.
     * @type {Object}
     */
    this.head = new Op(noop, 0, 0);

    /**
     * Operations tail
     * @type {Object}
     */
    this.tail = this.head;

    /**
     * Linked forked states.
     * @type {Object|null}
     */
    this.states = null;

    // When a value is written, the writer calculates its byte length and puts it into a linked
    // list of operations to perform when finish() is called. This both allows us to allocate
    // buffers of the exact required size and reduces the amount of work we have to do compared
    // to first calculating over objects and then encoding over objects. In our case, the encoding
    // part is just a linked list walk calling operations with already prepared values.
}

var create = function create() {
    return util.Buffer
        ? function create_buffer_setup() {
            return (Writer.create = function create_buffer() {
                return new BufferWriter();
            })();
        }
        /* istanbul ignore next */
        : function create_array() {
            return new Writer();
        };
};

/**
 * Creates a new writer.
 * @function
 * @returns {BufferWriter|Writer} A {@link BufferWriter} when Buffers are supported, otherwise a {@link Writer}
 */
Writer.create = create();

/**
 * Allocates a buffer of the specified size.
 * @param {number} size Buffer size
 * @returns {Uint8Array} Buffer
 */
Writer.alloc = function alloc(size) {
    return new util.Array(size);
};

// Use Uint8Array buffer pool in the browser, just like node does with buffers
/* istanbul ignore else */
if (util.Array !== Array)
    Writer.alloc = util.pool(Writer.alloc, util.Array.prototype.subarray);

/**
 * Pushes a new operation to the queue.
 * @param {function(Uint8Array, number, *)} fn Function to call
 * @param {number} len Value byte length
 * @param {number} val Value to write
 * @returns {Writer} `this`
 * @private
 */
Writer.prototype._push = function push(fn, len, val) {
    this.tail = this.tail.next = new Op(fn, len, val);
    this.len += len;
    return this;
};

function writeByte(val, buf, pos) {
    buf[pos] = val & 255;
}

function writeVarint32(val, buf, pos) {
    while (val > 127) {
        buf[pos++] = val & 127 | 128;
        val >>>= 7;
    }
    buf[pos] = val;
}

/**
 * Constructs a new varint writer operation instance.
 * @classdesc Scheduled varint writer operation.
 * @extends Op
 * @constructor
 * @param {number} len Value byte length
 * @param {number} val Value to write
 * @ignore
 */
function VarintOp(len, val) {
    this.len = len;
    this.next = undefined;
    this.val = val;
}

VarintOp.prototype = Object.create(Op.prototype);
VarintOp.prototype.fn = writeVarint32;

/**
 * Writes an unsigned 32 bit value as a varint.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.uint32 = function write_uint32(value) {
    // here, the call to this.push has been inlined and a varint specific Op subclass is used.
    // uint32 is by far the most frequently used operation and benefits significantly from this.
    this.len += (this.tail = this.tail.next = new VarintOp(
        (value = value >>> 0)
                < 128       ? 1
        : value < 16384     ? 2
        : value < 2097152   ? 3
        : value < 268435456 ? 4
        :                     5,
    value)).len;
    return this;
};

/**
 * Writes a signed 32 bit value as a varint.
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.int32 = function write_int32(value) {
    return value < 0
        ? this._push(writeVarint64, 10, LongBits.fromNumber(value)) // 10 bytes per spec
        : this.uint32(value);
};

/**
 * Writes a 32 bit value as a varint, zig-zag encoded.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.sint32 = function write_sint32(value) {
    return this.uint32((value << 1 ^ value >> 31) >>> 0);
};

function writeVarint64(val, buf, pos) {
    while (val.hi) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
        val.hi >>>= 7;
    }
    while (val.lo > 127) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = val.lo >>> 7;
    }
    buf[pos++] = val.lo;
}

/**
 * Writes an unsigned 64 bit value as a varint.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.uint64 = function write_uint64(value) {
    var bits = LongBits.from(value);
    return this._push(writeVarint64, bits.length(), bits);
};

/**
 * Writes a signed 64 bit value as a varint.
 * @function
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.int64 = Writer.prototype.uint64;

/**
 * Writes a signed 64 bit value as a varint, zig-zag encoded.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.sint64 = function write_sint64(value) {
    var bits = LongBits.from(value).zzEncode();
    return this._push(writeVarint64, bits.length(), bits);
};

/**
 * Writes a boolish value as a varint.
 * @param {boolean} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.bool = function write_bool(value) {
    return this._push(writeByte, 1, value ? 1 : 0);
};

function writeFixed32(val, buf, pos) {
    buf[pos    ] =  val         & 255;
    buf[pos + 1] =  val >>> 8   & 255;
    buf[pos + 2] =  val >>> 16  & 255;
    buf[pos + 3] =  val >>> 24;
}

/**
 * Writes an unsigned 32 bit value as fixed 32 bits.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.fixed32 = function write_fixed32(value) {
    return this._push(writeFixed32, 4, value >>> 0);
};

/**
 * Writes a signed 32 bit value as fixed 32 bits.
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.sfixed32 = Writer.prototype.fixed32;

/**
 * Writes an unsigned 64 bit value as fixed 64 bits.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.fixed64 = function write_fixed64(value) {
    var bits = LongBits.from(value);
    return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
};

/**
 * Writes a signed 64 bit value as fixed 64 bits.
 * @function
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.sfixed64 = Writer.prototype.fixed64;

/**
 * Writes a float (32 bit).
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.float = function write_float(value) {
    return this._push(util.float.writeFloatLE, 4, value);
};

/**
 * Writes a double (64 bit float).
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.double = function write_double(value) {
    return this._push(util.float.writeDoubleLE, 8, value);
};

var writeBytes = util.Array.prototype.set
    ? function writeBytes_set(val, buf, pos) {
        buf.set(val, pos); // also works for plain array values
    }
    /* istanbul ignore next */
    : function writeBytes_for(val, buf, pos) {
        for (var i = 0; i < val.length; ++i)
            buf[pos + i] = val[i];
    };

/**
 * Writes a sequence of bytes.
 * @param {Uint8Array|string} value Buffer or base64 encoded string to write
 * @returns {Writer} `this`
 */
Writer.prototype.bytes = function write_bytes(value) {
    var len = value.length >>> 0;
    if (!len)
        return this._push(writeByte, 1, 0);
    if (util.isString(value)) {
        var buf = Writer.alloc(len = base64.length(value));
        base64.decode(value, buf, 0);
        value = buf;
    }
    return this.uint32(len)._push(writeBytes, len, value);
};

/**
 * Writes a string.
 * @param {string} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.string = function write_string(value) {
    var len = utf8.length(value);
    return len
        ? this.uint32(len)._push(utf8.write, len, value)
        : this._push(writeByte, 1, 0);
};

/**
 * Forks this writer's state by pushing it to a stack.
 * Calling {@link Writer#reset|reset} or {@link Writer#ldelim|ldelim} resets the writer to the previous state.
 * @returns {Writer} `this`
 */
Writer.prototype.fork = function fork() {
    this.states = new State(this);
    this.head = this.tail = new Op(noop, 0, 0);
    this.len = 0;
    return this;
};

/**
 * Resets this instance to the last state.
 * @returns {Writer} `this`
 */
Writer.prototype.reset = function reset() {
    if (this.states) {
        this.head   = this.states.head;
        this.tail   = this.states.tail;
        this.len    = this.states.len;
        this.states = this.states.next;
    } else {
        this.head = this.tail = new Op(noop, 0, 0);
        this.len  = 0;
    }
    return this;
};

/**
 * Resets to the last state and appends the fork state's current write length as a varint followed by its operations.
 * @returns {Writer} `this`
 */
Writer.prototype.ldelim = function ldelim() {
    var head = this.head,
        tail = this.tail,
        len  = this.len;
    this.reset().uint32(len);
    if (len) {
        this.tail.next = head.next; // skip noop
        this.tail = tail;
        this.len += len;
    }
    return this;
};

/**
 * Finishes the write operation.
 * @returns {Uint8Array} Finished buffer
 */
Writer.prototype.finish = function finish() {
    var head = this.head.next, // skip noop
        buf  = this.constructor.alloc(this.len),
        pos  = 0;
    while (head) {
        head.fn(head.val, buf, pos);
        pos += head.len;
        head = head.next;
    }
    // this.head = this.tail = null;
    return buf;
};

Writer._configure = function(BufferWriter_) {
    BufferWriter = BufferWriter_;
    Writer.create = create();
    BufferWriter._configure();
};


/***/ }),

/***/ 814:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

module.exports = BufferWriter;

// extends Writer
var Writer = __nccwpck_require__(860);
(BufferWriter.prototype = Object.create(Writer.prototype)).constructor = BufferWriter;

var util = __nccwpck_require__(565);

/**
 * Constructs a new buffer writer instance.
 * @classdesc Wire format writer using node buffers.
 * @extends Writer
 * @constructor
 */
function BufferWriter() {
    Writer.call(this);
}

BufferWriter._configure = function () {
    /**
     * Allocates a buffer of the specified size.
     * @function
     * @param {number} size Buffer size
     * @returns {Buffer} Buffer
     */
    BufferWriter.alloc = util._Buffer_allocUnsafe;

    BufferWriter.writeBytesBuffer = util.Buffer && util.Buffer.prototype instanceof Uint8Array && util.Buffer.prototype.set.name === "set"
        ? function writeBytesBuffer_set(val, buf, pos) {
          buf.set(val, pos); // faster than copy (requires node >= 4 where Buffers extend Uint8Array and set is properly inherited)
          // also works for plain array values
        }
        /* istanbul ignore next */
        : function writeBytesBuffer_copy(val, buf, pos) {
          if (val.copy) // Buffer values
            val.copy(buf, pos, 0, val.length);
          else for (var i = 0; i < val.length;) // plain array values
            buf[pos++] = val[i++];
        };
};


/**
 * @override
 */
BufferWriter.prototype.bytes = function write_bytes_buffer(value) {
    if (util.isString(value))
        value = util._Buffer_from(value, "base64");
    var len = value.length >>> 0;
    this.uint32(len);
    if (len)
        this._push(BufferWriter.writeBytesBuffer, len, value);
    return this;
};

function writeStringBuffer(val, buf, pos) {
    if (val.length < 40) // plain js is faster for short strings (probably due to redundant assertions)
        util.utf8.write(val, buf, pos);
    else if (buf.utf8Write)
        buf.utf8Write(val, pos);
    else
        buf.write(val, pos);
}

/**
 * @override
 */
BufferWriter.prototype.string = function write_string_buffer(value) {
    var len = util.Buffer.byteLength(value);
    this.uint32(len);
    if (len)
        this._push(writeStringBuffer, len, value);
    return this;
};


/**
 * Finishes the write operation.
 * @name BufferWriter#finish
 * @function
 * @returns {Buffer} Finished buffer
 */

BufferWriter._configure();


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__nccwpck_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(927);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;