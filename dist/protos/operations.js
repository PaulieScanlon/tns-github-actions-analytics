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

/***/ 81:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/* module decorator */ module = __nccwpck_require__.nmd(module);
!function(e){"function"==typeof define&&define.amd?define(["protobufjs/minimal"],e): true&&module&&module.exports&&(module.exports=e(__nccwpck_require__(934)))}(function(o){"use strict";var e,t,n,F,a=o.Reader,r=o.Writer,i=o.util,p=o.roots.operations_protos||(o.roots.operations_protos={});function G(e,t,n){o.rpc.Service.call(this,e,t,n)}function l(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function B(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function s(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function u(e){if(this.operations=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function L(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function U(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function c(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function d(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function g(e){if(this.rules=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function f(e){if(this.additionalBindings=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function y(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function J(e){if(this.file=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function h(e){if(this.dependency=[],this.publicDependency=[],this.weakDependency=[],this.messageType=[],this.enumType=[],this.service=[],this.extension=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function O(e){if(this.field=[],this.extension=[],this.nestedType=[],this.enumType=[],this.extensionRange=[],this.oneofDecl=[],this.reservedRange=[],this.reservedName=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function b(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function m(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function M(e){if(this.uninterpretedOption=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function v(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function w(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function P(e){if(this.value=[],this.reservedRange=[],this.reservedName=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function _(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function j(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function S(e){if(this.method=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function x(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function k(e){if(this.uninterpretedOption=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function D(e){if(this.uninterpretedOption=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function T(e){if(this.uninterpretedOption=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function H(e){if(this.uninterpretedOption=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function E(e){if(this.uninterpretedOption=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function z(e){if(this.uninterpretedOption=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function A(e){if(this.uninterpretedOption=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function N(e){if(this.uninterpretedOption=[],this[".google.api.methodSignature"]=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function I(e){if(this.name=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function q(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function Y(e){if(this.location=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function R(e){if(this.path=[],this.span=[],this.leadingDetachedComments=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function W(e){if(this.annotation=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function C(e){if(this.path=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function X(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function K(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function Q(e){if(e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}function V(e){if(this.details=[],e)for(var t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]])}return p.google=((F={}).longrunning=((t={}).Operations=(((G.prototype=Object.create(o.rpc.Service.prototype)).constructor=G).create=function(e,t,n){return new this(e,t,n)},Object.defineProperty(G.prototype.listOperations=function e(t,n){return this.rpcCall(e,p.google.longrunning.ListOperationsRequest,p.google.longrunning.ListOperationsResponse,t,n)},"name",{value:"ListOperations"}),Object.defineProperty(G.prototype.getOperation=function e(t,n){return this.rpcCall(e,p.google.longrunning.GetOperationRequest,p.google.longrunning.Operation,t,n)},"name",{value:"GetOperation"}),Object.defineProperty(G.prototype.deleteOperation=function e(t,n){return this.rpcCall(e,p.google.longrunning.DeleteOperationRequest,p.google.protobuf.Empty,t,n)},"name",{value:"DeleteOperation"}),Object.defineProperty(G.prototype.cancelOperation=function e(t,n){return this.rpcCall(e,p.google.longrunning.CancelOperationRequest,p.google.protobuf.Empty,t,n)},"name",{value:"CancelOperation"}),Object.defineProperty(G.prototype.waitOperation=function e(t,n){return this.rpcCall(e,p.google.longrunning.WaitOperationRequest,p.google.longrunning.Operation,t,n)},"name",{value:"WaitOperation"}),G),t.Operation=(l.prototype.name="",l.prototype.metadata=null,l.prototype.done=!1,l.prototype.error=null,l.prototype.response=null,Object.defineProperty(l.prototype,"result",{get:i.oneOfGetter(n=["error","response"]),set:i.oneOfSetter(n)}),l.create=function(e){return new l(e)},l.encode=function(e,t){return t=t||r.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),null!=e.metadata&&Object.hasOwnProperty.call(e,"metadata")&&p.google.protobuf.Any.encode(e.metadata,t.uint32(18).fork()).ldelim(),null!=e.done&&Object.hasOwnProperty.call(e,"done")&&t.uint32(24).bool(e.done),null!=e.error&&Object.hasOwnProperty.call(e,"error")&&p.google.rpc.Status.encode(e.error,t.uint32(34).fork()).ldelim(),null!=e.response&&Object.hasOwnProperty.call(e,"response")&&p.google.protobuf.Any.encode(e.response,t.uint32(42).fork()).ldelim(),t},l.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},l.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.longrunning.Operation;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.name=e.string();break;case 2:o.metadata=p.google.protobuf.Any.decode(e,e.uint32());break;case 3:o.done=e.bool();break;case 4:o.error=p.google.rpc.Status.decode(e,e.uint32());break;case 5:o.response=p.google.protobuf.Any.decode(e,e.uint32());break;default:e.skipType(7&r)}}return o},l.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},l.verify=function(e){if("object"!=typeof e||null===e)return"object expected";var t,n={};if(null!=e.name&&e.hasOwnProperty("name")&&!i.isString(e.name))return"name: string expected";if(null!=e.metadata&&e.hasOwnProperty("metadata")&&(t=p.google.protobuf.Any.verify(e.metadata)))return"metadata."+t;if(null!=e.done&&e.hasOwnProperty("done")&&"boolean"!=typeof e.done)return"done: boolean expected";if(null!=e.error&&e.hasOwnProperty("error")&&(n.result=1,t=p.google.rpc.Status.verify(e.error)))return"error."+t;if(null!=e.response&&e.hasOwnProperty("response")){if(1===n.result)return"result: multiple values";if(n.result=1,t=p.google.protobuf.Any.verify(e.response))return"response."+t}return null},l.fromObject=function(e){if(e instanceof p.google.longrunning.Operation)return e;var t=new p.google.longrunning.Operation;if(null!=e.name&&(t.name=String(e.name)),null!=e.metadata){if("object"!=typeof e.metadata)throw TypeError(".google.longrunning.Operation.metadata: object expected");t.metadata=p.google.protobuf.Any.fromObject(e.metadata)}if(null!=e.done&&(t.done=Boolean(e.done)),null!=e.error){if("object"!=typeof e.error)throw TypeError(".google.longrunning.Operation.error: object expected");t.error=p.google.rpc.Status.fromObject(e.error)}if(null!=e.response){if("object"!=typeof e.response)throw TypeError(".google.longrunning.Operation.response: object expected");t.response=p.google.protobuf.Any.fromObject(e.response)}return t},l.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.name="",n.metadata=null,n.done=!1),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),null!=e.metadata&&e.hasOwnProperty("metadata")&&(n.metadata=p.google.protobuf.Any.toObject(e.metadata,t)),null!=e.done&&e.hasOwnProperty("done")&&(n.done=e.done),null!=e.error&&e.hasOwnProperty("error")&&(n.error=p.google.rpc.Status.toObject(e.error,t),t.oneofs)&&(n.result="error"),null!=e.response&&e.hasOwnProperty("response")&&(n.response=p.google.protobuf.Any.toObject(e.response,t),t.oneofs)&&(n.result="response"),n},l.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},l),t.GetOperationRequest=(B.prototype.name="",B.create=function(e){return new B(e)},B.encode=function(e,t){return t=t||r.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),t},B.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},B.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.longrunning.GetOperationRequest;e.pos<n;){var r=e.uint32();r>>>3==1?o.name=e.string():e.skipType(7&r)}return o},B.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},B.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.name&&e.hasOwnProperty("name")&&!i.isString(e.name)?"name: string expected":null},B.fromObject=function(e){var t;return e instanceof p.google.longrunning.GetOperationRequest?e:(t=new p.google.longrunning.GetOperationRequest,null!=e.name&&(t.name=String(e.name)),t)},B.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.name=""),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),n},B.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},B),t.ListOperationsRequest=(s.prototype.name="",s.prototype.filter="",s.prototype.pageSize=0,s.prototype.pageToken="",s.create=function(e){return new s(e)},s.encode=function(e,t){return t=t||r.create(),null!=e.filter&&Object.hasOwnProperty.call(e,"filter")&&t.uint32(10).string(e.filter),null!=e.pageSize&&Object.hasOwnProperty.call(e,"pageSize")&&t.uint32(16).int32(e.pageSize),null!=e.pageToken&&Object.hasOwnProperty.call(e,"pageToken")&&t.uint32(26).string(e.pageToken),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(34).string(e.name),t},s.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},s.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.longrunning.ListOperationsRequest;e.pos<n;){var r=e.uint32();switch(r>>>3){case 4:o.name=e.string();break;case 1:o.filter=e.string();break;case 2:o.pageSize=e.int32();break;case 3:o.pageToken=e.string();break;default:e.skipType(7&r)}}return o},s.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},s.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.name&&e.hasOwnProperty("name")&&!i.isString(e.name)?"name: string expected":null!=e.filter&&e.hasOwnProperty("filter")&&!i.isString(e.filter)?"filter: string expected":null!=e.pageSize&&e.hasOwnProperty("pageSize")&&!i.isInteger(e.pageSize)?"pageSize: integer expected":null!=e.pageToken&&e.hasOwnProperty("pageToken")&&!i.isString(e.pageToken)?"pageToken: string expected":null},s.fromObject=function(e){var t;return e instanceof p.google.longrunning.ListOperationsRequest?e:(t=new p.google.longrunning.ListOperationsRequest,null!=e.name&&(t.name=String(e.name)),null!=e.filter&&(t.filter=String(e.filter)),null!=e.pageSize&&(t.pageSize=0|e.pageSize),null!=e.pageToken&&(t.pageToken=String(e.pageToken)),t)},s.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.filter="",n.pageSize=0,n.pageToken="",n.name=""),null!=e.filter&&e.hasOwnProperty("filter")&&(n.filter=e.filter),null!=e.pageSize&&e.hasOwnProperty("pageSize")&&(n.pageSize=e.pageSize),null!=e.pageToken&&e.hasOwnProperty("pageToken")&&(n.pageToken=e.pageToken),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),n},s.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},s),t.ListOperationsResponse=(u.prototype.operations=i.emptyArray,u.prototype.nextPageToken="",u.create=function(e){return new u(e)},u.encode=function(e,t){if(t=t||r.create(),null!=e.operations&&e.operations.length)for(var n=0;n<e.operations.length;++n)p.google.longrunning.Operation.encode(e.operations[n],t.uint32(10).fork()).ldelim();return null!=e.nextPageToken&&Object.hasOwnProperty.call(e,"nextPageToken")&&t.uint32(18).string(e.nextPageToken),t},u.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},u.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.longrunning.ListOperationsResponse;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.operations&&o.operations.length||(o.operations=[]),o.operations.push(p.google.longrunning.Operation.decode(e,e.uint32()));break;case 2:o.nextPageToken=e.string();break;default:e.skipType(7&r)}}return o},u.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},u.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.operations&&e.hasOwnProperty("operations")){if(!Array.isArray(e.operations))return"operations: array expected";for(var t=0;t<e.operations.length;++t){var n=p.google.longrunning.Operation.verify(e.operations[t]);if(n)return"operations."+n}}return null!=e.nextPageToken&&e.hasOwnProperty("nextPageToken")&&!i.isString(e.nextPageToken)?"nextPageToken: string expected":null},u.fromObject=function(e){if(e instanceof p.google.longrunning.ListOperationsResponse)return e;var t=new p.google.longrunning.ListOperationsResponse;if(e.operations){if(!Array.isArray(e.operations))throw TypeError(".google.longrunning.ListOperationsResponse.operations: array expected");t.operations=[];for(var n=0;n<e.operations.length;++n){if("object"!=typeof e.operations[n])throw TypeError(".google.longrunning.ListOperationsResponse.operations: object expected");t.operations[n]=p.google.longrunning.Operation.fromObject(e.operations[n])}}return null!=e.nextPageToken&&(t.nextPageToken=String(e.nextPageToken)),t},u.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.operations=[]),t.defaults&&(n.nextPageToken=""),e.operations&&e.operations.length){n.operations=[];for(var o=0;o<e.operations.length;++o)n.operations[o]=p.google.longrunning.Operation.toObject(e.operations[o],t)}return null!=e.nextPageToken&&e.hasOwnProperty("nextPageToken")&&(n.nextPageToken=e.nextPageToken),n},u.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},u),t.CancelOperationRequest=(L.prototype.name="",L.create=function(e){return new L(e)},L.encode=function(e,t){return t=t||r.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),t},L.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},L.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.longrunning.CancelOperationRequest;e.pos<n;){var r=e.uint32();r>>>3==1?o.name=e.string():e.skipType(7&r)}return o},L.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},L.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.name&&e.hasOwnProperty("name")&&!i.isString(e.name)?"name: string expected":null},L.fromObject=function(e){var t;return e instanceof p.google.longrunning.CancelOperationRequest?e:(t=new p.google.longrunning.CancelOperationRequest,null!=e.name&&(t.name=String(e.name)),t)},L.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.name=""),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),n},L.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},L),t.DeleteOperationRequest=(U.prototype.name="",U.create=function(e){return new U(e)},U.encode=function(e,t){return t=t||r.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),t},U.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},U.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.longrunning.DeleteOperationRequest;e.pos<n;){var r=e.uint32();r>>>3==1?o.name=e.string():e.skipType(7&r)}return o},U.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},U.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.name&&e.hasOwnProperty("name")&&!i.isString(e.name)?"name: string expected":null},U.fromObject=function(e){var t;return e instanceof p.google.longrunning.DeleteOperationRequest?e:(t=new p.google.longrunning.DeleteOperationRequest,null!=e.name&&(t.name=String(e.name)),t)},U.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.name=""),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),n},U.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},U),t.WaitOperationRequest=(c.prototype.name="",c.prototype.timeout=null,c.create=function(e){return new c(e)},c.encode=function(e,t){return t=t||r.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),null!=e.timeout&&Object.hasOwnProperty.call(e,"timeout")&&p.google.protobuf.Duration.encode(e.timeout,t.uint32(18).fork()).ldelim(),t},c.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},c.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.longrunning.WaitOperationRequest;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.name=e.string();break;case 2:o.timeout=p.google.protobuf.Duration.decode(e,e.uint32());break;default:e.skipType(7&r)}}return o},c.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},c.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.name&&e.hasOwnProperty("name")&&!i.isString(e.name))return"name: string expected";if(null!=e.timeout&&e.hasOwnProperty("timeout")){e=p.google.protobuf.Duration.verify(e.timeout);if(e)return"timeout."+e}return null},c.fromObject=function(e){if(e instanceof p.google.longrunning.WaitOperationRequest)return e;var t=new p.google.longrunning.WaitOperationRequest;if(null!=e.name&&(t.name=String(e.name)),null!=e.timeout){if("object"!=typeof e.timeout)throw TypeError(".google.longrunning.WaitOperationRequest.timeout: object expected");t.timeout=p.google.protobuf.Duration.fromObject(e.timeout)}return t},c.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.name="",n.timeout=null),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),null!=e.timeout&&e.hasOwnProperty("timeout")&&(n.timeout=p.google.protobuf.Duration.toObject(e.timeout,t)),n},c.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},c),t.OperationInfo=(d.prototype.responseType="",d.prototype.metadataType="",d.create=function(e){return new d(e)},d.encode=function(e,t){return t=t||r.create(),null!=e.responseType&&Object.hasOwnProperty.call(e,"responseType")&&t.uint32(10).string(e.responseType),null!=e.metadataType&&Object.hasOwnProperty.call(e,"metadataType")&&t.uint32(18).string(e.metadataType),t},d.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},d.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.longrunning.OperationInfo;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.responseType=e.string();break;case 2:o.metadataType=e.string();break;default:e.skipType(7&r)}}return o},d.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},d.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.responseType&&e.hasOwnProperty("responseType")&&!i.isString(e.responseType)?"responseType: string expected":null!=e.metadataType&&e.hasOwnProperty("metadataType")&&!i.isString(e.metadataType)?"metadataType: string expected":null},d.fromObject=function(e){var t;return e instanceof p.google.longrunning.OperationInfo?e:(t=new p.google.longrunning.OperationInfo,null!=e.responseType&&(t.responseType=String(e.responseType)),null!=e.metadataType&&(t.metadataType=String(e.metadataType)),t)},d.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.responseType="",n.metadataType=""),null!=e.responseType&&e.hasOwnProperty("responseType")&&(n.responseType=e.responseType),null!=e.metadataType&&e.hasOwnProperty("metadataType")&&(n.metadataType=e.metadataType),n},d.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},d),t),F.api=((n={}).Http=(g.prototype.rules=i.emptyArray,g.prototype.fullyDecodeReservedExpansion=!1,g.create=function(e){return new g(e)},g.encode=function(e,t){if(t=t||r.create(),null!=e.rules&&e.rules.length)for(var n=0;n<e.rules.length;++n)p.google.api.HttpRule.encode(e.rules[n],t.uint32(10).fork()).ldelim();return null!=e.fullyDecodeReservedExpansion&&Object.hasOwnProperty.call(e,"fullyDecodeReservedExpansion")&&t.uint32(16).bool(e.fullyDecodeReservedExpansion),t},g.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},g.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.api.Http;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.rules&&o.rules.length||(o.rules=[]),o.rules.push(p.google.api.HttpRule.decode(e,e.uint32()));break;case 2:o.fullyDecodeReservedExpansion=e.bool();break;default:e.skipType(7&r)}}return o},g.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},g.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.rules&&e.hasOwnProperty("rules")){if(!Array.isArray(e.rules))return"rules: array expected";for(var t=0;t<e.rules.length;++t){var n=p.google.api.HttpRule.verify(e.rules[t]);if(n)return"rules."+n}}return null!=e.fullyDecodeReservedExpansion&&e.hasOwnProperty("fullyDecodeReservedExpansion")&&"boolean"!=typeof e.fullyDecodeReservedExpansion?"fullyDecodeReservedExpansion: boolean expected":null},g.fromObject=function(e){if(e instanceof p.google.api.Http)return e;var t=new p.google.api.Http;if(e.rules){if(!Array.isArray(e.rules))throw TypeError(".google.api.Http.rules: array expected");t.rules=[];for(var n=0;n<e.rules.length;++n){if("object"!=typeof e.rules[n])throw TypeError(".google.api.Http.rules: object expected");t.rules[n]=p.google.api.HttpRule.fromObject(e.rules[n])}}return null!=e.fullyDecodeReservedExpansion&&(t.fullyDecodeReservedExpansion=Boolean(e.fullyDecodeReservedExpansion)),t},g.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.rules=[]),t.defaults&&(n.fullyDecodeReservedExpansion=!1),e.rules&&e.rules.length){n.rules=[];for(var o=0;o<e.rules.length;++o)n.rules[o]=p.google.api.HttpRule.toObject(e.rules[o],t)}return null!=e.fullyDecodeReservedExpansion&&e.hasOwnProperty("fullyDecodeReservedExpansion")&&(n.fullyDecodeReservedExpansion=e.fullyDecodeReservedExpansion),n},g.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},g),n.HttpRule=(f.prototype.selector="",f.prototype.get="",f.prototype.put="",f.prototype.post="",f.prototype.delete="",f.prototype.patch="",f.prototype.custom=null,f.prototype.body="",f.prototype.responseBody="",f.prototype.additionalBindings=i.emptyArray,Object.defineProperty(f.prototype,"pattern",{get:i.oneOfGetter(t=["get","put","post","delete","patch","custom"]),set:i.oneOfSetter(t)}),f.create=function(e){return new f(e)},f.encode=function(e,t){if(t=t||r.create(),null!=e.selector&&Object.hasOwnProperty.call(e,"selector")&&t.uint32(10).string(e.selector),null!=e.get&&Object.hasOwnProperty.call(e,"get")&&t.uint32(18).string(e.get),null!=e.put&&Object.hasOwnProperty.call(e,"put")&&t.uint32(26).string(e.put),null!=e.post&&Object.hasOwnProperty.call(e,"post")&&t.uint32(34).string(e.post),null!=e.delete&&Object.hasOwnProperty.call(e,"delete")&&t.uint32(42).string(e.delete),null!=e.patch&&Object.hasOwnProperty.call(e,"patch")&&t.uint32(50).string(e.patch),null!=e.body&&Object.hasOwnProperty.call(e,"body")&&t.uint32(58).string(e.body),null!=e.custom&&Object.hasOwnProperty.call(e,"custom")&&p.google.api.CustomHttpPattern.encode(e.custom,t.uint32(66).fork()).ldelim(),null!=e.additionalBindings&&e.additionalBindings.length)for(var n=0;n<e.additionalBindings.length;++n)p.google.api.HttpRule.encode(e.additionalBindings[n],t.uint32(90).fork()).ldelim();return null!=e.responseBody&&Object.hasOwnProperty.call(e,"responseBody")&&t.uint32(98).string(e.responseBody),t},f.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},f.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.api.HttpRule;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.selector=e.string();break;case 2:o.get=e.string();break;case 3:o.put=e.string();break;case 4:o.post=e.string();break;case 5:o.delete=e.string();break;case 6:o.patch=e.string();break;case 8:o.custom=p.google.api.CustomHttpPattern.decode(e,e.uint32());break;case 7:o.body=e.string();break;case 12:o.responseBody=e.string();break;case 11:o.additionalBindings&&o.additionalBindings.length||(o.additionalBindings=[]),o.additionalBindings.push(p.google.api.HttpRule.decode(e,e.uint32()));break;default:e.skipType(7&r)}}return o},f.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},f.verify=function(e){if("object"!=typeof e||null===e)return"object expected";var t={};if(null!=e.selector&&e.hasOwnProperty("selector")&&!i.isString(e.selector))return"selector: string expected";if(null!=e.get&&e.hasOwnProperty("get")&&(t.pattern=1,!i.isString(e.get)))return"get: string expected";if(null!=e.put&&e.hasOwnProperty("put")){if(1===t.pattern)return"pattern: multiple values";if(t.pattern=1,!i.isString(e.put))return"put: string expected"}if(null!=e.post&&e.hasOwnProperty("post")){if(1===t.pattern)return"pattern: multiple values";if(t.pattern=1,!i.isString(e.post))return"post: string expected"}if(null!=e.delete&&e.hasOwnProperty("delete")){if(1===t.pattern)return"pattern: multiple values";if(t.pattern=1,!i.isString(e.delete))return"delete: string expected"}if(null!=e.patch&&e.hasOwnProperty("patch")){if(1===t.pattern)return"pattern: multiple values";if(t.pattern=1,!i.isString(e.patch))return"patch: string expected"}if(null!=e.custom&&e.hasOwnProperty("custom")){if(1===t.pattern)return"pattern: multiple values";if(t.pattern=1,n=p.google.api.CustomHttpPattern.verify(e.custom))return"custom."+n}if(null!=e.body&&e.hasOwnProperty("body")&&!i.isString(e.body))return"body: string expected";if(null!=e.responseBody&&e.hasOwnProperty("responseBody")&&!i.isString(e.responseBody))return"responseBody: string expected";if(null!=e.additionalBindings&&e.hasOwnProperty("additionalBindings")){if(!Array.isArray(e.additionalBindings))return"additionalBindings: array expected";for(var n,o=0;o<e.additionalBindings.length;++o)if(n=p.google.api.HttpRule.verify(e.additionalBindings[o]))return"additionalBindings."+n}return null},f.fromObject=function(e){if(e instanceof p.google.api.HttpRule)return e;var t=new p.google.api.HttpRule;if(null!=e.selector&&(t.selector=String(e.selector)),null!=e.get&&(t.get=String(e.get)),null!=e.put&&(t.put=String(e.put)),null!=e.post&&(t.post=String(e.post)),null!=e.delete&&(t.delete=String(e.delete)),null!=e.patch&&(t.patch=String(e.patch)),null!=e.custom){if("object"!=typeof e.custom)throw TypeError(".google.api.HttpRule.custom: object expected");t.custom=p.google.api.CustomHttpPattern.fromObject(e.custom)}if(null!=e.body&&(t.body=String(e.body)),null!=e.responseBody&&(t.responseBody=String(e.responseBody)),e.additionalBindings){if(!Array.isArray(e.additionalBindings))throw TypeError(".google.api.HttpRule.additionalBindings: array expected");t.additionalBindings=[];for(var n=0;n<e.additionalBindings.length;++n){if("object"!=typeof e.additionalBindings[n])throw TypeError(".google.api.HttpRule.additionalBindings: object expected");t.additionalBindings[n]=p.google.api.HttpRule.fromObject(e.additionalBindings[n])}}return t},f.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.additionalBindings=[]),t.defaults&&(n.selector="",n.body="",n.responseBody=""),null!=e.selector&&e.hasOwnProperty("selector")&&(n.selector=e.selector),null!=e.get&&e.hasOwnProperty("get")&&(n.get=e.get,t.oneofs)&&(n.pattern="get"),null!=e.put&&e.hasOwnProperty("put")&&(n.put=e.put,t.oneofs)&&(n.pattern="put"),null!=e.post&&e.hasOwnProperty("post")&&(n.post=e.post,t.oneofs)&&(n.pattern="post"),null!=e.delete&&e.hasOwnProperty("delete")&&(n.delete=e.delete,t.oneofs)&&(n.pattern="delete"),null!=e.patch&&e.hasOwnProperty("patch")&&(n.patch=e.patch,t.oneofs)&&(n.pattern="patch"),null!=e.body&&e.hasOwnProperty("body")&&(n.body=e.body),null!=e.custom&&e.hasOwnProperty("custom")&&(n.custom=p.google.api.CustomHttpPattern.toObject(e.custom,t),t.oneofs)&&(n.pattern="custom"),e.additionalBindings&&e.additionalBindings.length){n.additionalBindings=[];for(var o=0;o<e.additionalBindings.length;++o)n.additionalBindings[o]=p.google.api.HttpRule.toObject(e.additionalBindings[o],t)}return null!=e.responseBody&&e.hasOwnProperty("responseBody")&&(n.responseBody=e.responseBody),n},f.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},f),n.CustomHttpPattern=(y.prototype.kind="",y.prototype.path="",y.create=function(e){return new y(e)},y.encode=function(e,t){return t=t||r.create(),null!=e.kind&&Object.hasOwnProperty.call(e,"kind")&&t.uint32(10).string(e.kind),null!=e.path&&Object.hasOwnProperty.call(e,"path")&&t.uint32(18).string(e.path),t},y.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},y.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.api.CustomHttpPattern;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.kind=e.string();break;case 2:o.path=e.string();break;default:e.skipType(7&r)}}return o},y.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},y.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.kind&&e.hasOwnProperty("kind")&&!i.isString(e.kind)?"kind: string expected":null!=e.path&&e.hasOwnProperty("path")&&!i.isString(e.path)?"path: string expected":null},y.fromObject=function(e){var t;return e instanceof p.google.api.CustomHttpPattern?e:(t=new p.google.api.CustomHttpPattern,null!=e.kind&&(t.kind=String(e.kind)),null!=e.path&&(t.path=String(e.path)),t)},y.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.kind="",n.path=""),null!=e.kind&&e.hasOwnProperty("kind")&&(n.kind=e.kind),null!=e.path&&e.hasOwnProperty("path")&&(n.path=e.path),n},y.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},y),n),F.protobuf=((t={}).FileDescriptorSet=(J.prototype.file=i.emptyArray,J.create=function(e){return new J(e)},J.encode=function(e,t){if(t=t||r.create(),null!=e.file&&e.file.length)for(var n=0;n<e.file.length;++n)p.google.protobuf.FileDescriptorProto.encode(e.file[n],t.uint32(10).fork()).ldelim();return t},J.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},J.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.FileDescriptorSet;e.pos<n;){var r=e.uint32();r>>>3==1?(o.file&&o.file.length||(o.file=[]),o.file.push(p.google.protobuf.FileDescriptorProto.decode(e,e.uint32()))):e.skipType(7&r)}return o},J.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},J.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.file&&e.hasOwnProperty("file")){if(!Array.isArray(e.file))return"file: array expected";for(var t=0;t<e.file.length;++t){var n=p.google.protobuf.FileDescriptorProto.verify(e.file[t]);if(n)return"file."+n}}return null},J.fromObject=function(e){if(e instanceof p.google.protobuf.FileDescriptorSet)return e;var t=new p.google.protobuf.FileDescriptorSet;if(e.file){if(!Array.isArray(e.file))throw TypeError(".google.protobuf.FileDescriptorSet.file: array expected");t.file=[];for(var n=0;n<e.file.length;++n){if("object"!=typeof e.file[n])throw TypeError(".google.protobuf.FileDescriptorSet.file: object expected");t.file[n]=p.google.protobuf.FileDescriptorProto.fromObject(e.file[n])}}return t},J.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.file=[]),e.file&&e.file.length){n.file=[];for(var o=0;o<e.file.length;++o)n.file[o]=p.google.protobuf.FileDescriptorProto.toObject(e.file[o],t)}return n},J.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},J),t.FileDescriptorProto=(h.prototype.name="",h.prototype.package="",h.prototype.dependency=i.emptyArray,h.prototype.publicDependency=i.emptyArray,h.prototype.weakDependency=i.emptyArray,h.prototype.messageType=i.emptyArray,h.prototype.enumType=i.emptyArray,h.prototype.service=i.emptyArray,h.prototype.extension=i.emptyArray,h.prototype.options=null,h.prototype.sourceCodeInfo=null,h.prototype.syntax="",h.create=function(e){return new h(e)},h.encode=function(e,t){if(t=t||r.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),null!=e.package&&Object.hasOwnProperty.call(e,"package")&&t.uint32(18).string(e.package),null!=e.dependency&&e.dependency.length)for(var n=0;n<e.dependency.length;++n)t.uint32(26).string(e.dependency[n]);if(null!=e.messageType&&e.messageType.length)for(n=0;n<e.messageType.length;++n)p.google.protobuf.DescriptorProto.encode(e.messageType[n],t.uint32(34).fork()).ldelim();if(null!=e.enumType&&e.enumType.length)for(n=0;n<e.enumType.length;++n)p.google.protobuf.EnumDescriptorProto.encode(e.enumType[n],t.uint32(42).fork()).ldelim();if(null!=e.service&&e.service.length)for(n=0;n<e.service.length;++n)p.google.protobuf.ServiceDescriptorProto.encode(e.service[n],t.uint32(50).fork()).ldelim();if(null!=e.extension&&e.extension.length)for(n=0;n<e.extension.length;++n)p.google.protobuf.FieldDescriptorProto.encode(e.extension[n],t.uint32(58).fork()).ldelim();if(null!=e.options&&Object.hasOwnProperty.call(e,"options")&&p.google.protobuf.FileOptions.encode(e.options,t.uint32(66).fork()).ldelim(),null!=e.sourceCodeInfo&&Object.hasOwnProperty.call(e,"sourceCodeInfo")&&p.google.protobuf.SourceCodeInfo.encode(e.sourceCodeInfo,t.uint32(74).fork()).ldelim(),null!=e.publicDependency&&e.publicDependency.length)for(n=0;n<e.publicDependency.length;++n)t.uint32(80).int32(e.publicDependency[n]);if(null!=e.weakDependency&&e.weakDependency.length)for(n=0;n<e.weakDependency.length;++n)t.uint32(88).int32(e.weakDependency[n]);return null!=e.syntax&&Object.hasOwnProperty.call(e,"syntax")&&t.uint32(98).string(e.syntax),t},h.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},h.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.FileDescriptorProto;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.name=e.string();break;case 2:o.package=e.string();break;case 3:o.dependency&&o.dependency.length||(o.dependency=[]),o.dependency.push(e.string());break;case 10:if(o.publicDependency&&o.publicDependency.length||(o.publicDependency=[]),2==(7&r))for(var i=e.uint32()+e.pos;e.pos<i;)o.publicDependency.push(e.int32());else o.publicDependency.push(e.int32());break;case 11:if(o.weakDependency&&o.weakDependency.length||(o.weakDependency=[]),2==(7&r))for(i=e.uint32()+e.pos;e.pos<i;)o.weakDependency.push(e.int32());else o.weakDependency.push(e.int32());break;case 4:o.messageType&&o.messageType.length||(o.messageType=[]),o.messageType.push(p.google.protobuf.DescriptorProto.decode(e,e.uint32()));break;case 5:o.enumType&&o.enumType.length||(o.enumType=[]),o.enumType.push(p.google.protobuf.EnumDescriptorProto.decode(e,e.uint32()));break;case 6:o.service&&o.service.length||(o.service=[]),o.service.push(p.google.protobuf.ServiceDescriptorProto.decode(e,e.uint32()));break;case 7:o.extension&&o.extension.length||(o.extension=[]),o.extension.push(p.google.protobuf.FieldDescriptorProto.decode(e,e.uint32()));break;case 8:o.options=p.google.protobuf.FileOptions.decode(e,e.uint32());break;case 9:o.sourceCodeInfo=p.google.protobuf.SourceCodeInfo.decode(e,e.uint32());break;case 12:o.syntax=e.string();break;default:e.skipType(7&r)}}return o},h.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},h.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.name&&e.hasOwnProperty("name")&&!i.isString(e.name))return"name: string expected";if(null!=e.package&&e.hasOwnProperty("package")&&!i.isString(e.package))return"package: string expected";if(null!=e.dependency&&e.hasOwnProperty("dependency")){if(!Array.isArray(e.dependency))return"dependency: array expected";for(var t=0;t<e.dependency.length;++t)if(!i.isString(e.dependency[t]))return"dependency: string[] expected"}if(null!=e.publicDependency&&e.hasOwnProperty("publicDependency")){if(!Array.isArray(e.publicDependency))return"publicDependency: array expected";for(t=0;t<e.publicDependency.length;++t)if(!i.isInteger(e.publicDependency[t]))return"publicDependency: integer[] expected"}if(null!=e.weakDependency&&e.hasOwnProperty("weakDependency")){if(!Array.isArray(e.weakDependency))return"weakDependency: array expected";for(t=0;t<e.weakDependency.length;++t)if(!i.isInteger(e.weakDependency[t]))return"weakDependency: integer[] expected"}if(null!=e.messageType&&e.hasOwnProperty("messageType")){if(!Array.isArray(e.messageType))return"messageType: array expected";for(t=0;t<e.messageType.length;++t)if(n=p.google.protobuf.DescriptorProto.verify(e.messageType[t]))return"messageType."+n}if(null!=e.enumType&&e.hasOwnProperty("enumType")){if(!Array.isArray(e.enumType))return"enumType: array expected";for(t=0;t<e.enumType.length;++t)if(n=p.google.protobuf.EnumDescriptorProto.verify(e.enumType[t]))return"enumType."+n}if(null!=e.service&&e.hasOwnProperty("service")){if(!Array.isArray(e.service))return"service: array expected";for(t=0;t<e.service.length;++t)if(n=p.google.protobuf.ServiceDescriptorProto.verify(e.service[t]))return"service."+n}if(null!=e.extension&&e.hasOwnProperty("extension")){if(!Array.isArray(e.extension))return"extension: array expected";for(t=0;t<e.extension.length;++t)if(n=p.google.protobuf.FieldDescriptorProto.verify(e.extension[t]))return"extension."+n}var n;if(null!=e.options&&e.hasOwnProperty("options")&&(n=p.google.protobuf.FileOptions.verify(e.options)))return"options."+n;if(null!=e.sourceCodeInfo&&e.hasOwnProperty("sourceCodeInfo")&&(n=p.google.protobuf.SourceCodeInfo.verify(e.sourceCodeInfo)))return"sourceCodeInfo."+n;return null!=e.syntax&&e.hasOwnProperty("syntax")&&!i.isString(e.syntax)?"syntax: string expected":null},h.fromObject=function(e){if(e instanceof p.google.protobuf.FileDescriptorProto)return e;var t=new p.google.protobuf.FileDescriptorProto;if(null!=e.name&&(t.name=String(e.name)),null!=e.package&&(t.package=String(e.package)),e.dependency){if(!Array.isArray(e.dependency))throw TypeError(".google.protobuf.FileDescriptorProto.dependency: array expected");t.dependency=[];for(var n=0;n<e.dependency.length;++n)t.dependency[n]=String(e.dependency[n])}if(e.publicDependency){if(!Array.isArray(e.publicDependency))throw TypeError(".google.protobuf.FileDescriptorProto.publicDependency: array expected");t.publicDependency=[];for(n=0;n<e.publicDependency.length;++n)t.publicDependency[n]=0|e.publicDependency[n]}if(e.weakDependency){if(!Array.isArray(e.weakDependency))throw TypeError(".google.protobuf.FileDescriptorProto.weakDependency: array expected");t.weakDependency=[];for(n=0;n<e.weakDependency.length;++n)t.weakDependency[n]=0|e.weakDependency[n]}if(e.messageType){if(!Array.isArray(e.messageType))throw TypeError(".google.protobuf.FileDescriptorProto.messageType: array expected");t.messageType=[];for(n=0;n<e.messageType.length;++n){if("object"!=typeof e.messageType[n])throw TypeError(".google.protobuf.FileDescriptorProto.messageType: object expected");t.messageType[n]=p.google.protobuf.DescriptorProto.fromObject(e.messageType[n])}}if(e.enumType){if(!Array.isArray(e.enumType))throw TypeError(".google.protobuf.FileDescriptorProto.enumType: array expected");t.enumType=[];for(n=0;n<e.enumType.length;++n){if("object"!=typeof e.enumType[n])throw TypeError(".google.protobuf.FileDescriptorProto.enumType: object expected");t.enumType[n]=p.google.protobuf.EnumDescriptorProto.fromObject(e.enumType[n])}}if(e.service){if(!Array.isArray(e.service))throw TypeError(".google.protobuf.FileDescriptorProto.service: array expected");t.service=[];for(n=0;n<e.service.length;++n){if("object"!=typeof e.service[n])throw TypeError(".google.protobuf.FileDescriptorProto.service: object expected");t.service[n]=p.google.protobuf.ServiceDescriptorProto.fromObject(e.service[n])}}if(e.extension){if(!Array.isArray(e.extension))throw TypeError(".google.protobuf.FileDescriptorProto.extension: array expected");t.extension=[];for(n=0;n<e.extension.length;++n){if("object"!=typeof e.extension[n])throw TypeError(".google.protobuf.FileDescriptorProto.extension: object expected");t.extension[n]=p.google.protobuf.FieldDescriptorProto.fromObject(e.extension[n])}}if(null!=e.options){if("object"!=typeof e.options)throw TypeError(".google.protobuf.FileDescriptorProto.options: object expected");t.options=p.google.protobuf.FileOptions.fromObject(e.options)}if(null!=e.sourceCodeInfo){if("object"!=typeof e.sourceCodeInfo)throw TypeError(".google.protobuf.FileDescriptorProto.sourceCodeInfo: object expected");t.sourceCodeInfo=p.google.protobuf.SourceCodeInfo.fromObject(e.sourceCodeInfo)}return null!=e.syntax&&(t.syntax=String(e.syntax)),t},h.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.dependency=[],n.messageType=[],n.enumType=[],n.service=[],n.extension=[],n.publicDependency=[],n.weakDependency=[]),t.defaults&&(n.name="",n.package="",n.options=null,n.sourceCodeInfo=null,n.syntax=""),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),null!=e.package&&e.hasOwnProperty("package")&&(n.package=e.package),e.dependency&&e.dependency.length){n.dependency=[];for(var o=0;o<e.dependency.length;++o)n.dependency[o]=e.dependency[o]}if(e.messageType&&e.messageType.length){n.messageType=[];for(o=0;o<e.messageType.length;++o)n.messageType[o]=p.google.protobuf.DescriptorProto.toObject(e.messageType[o],t)}if(e.enumType&&e.enumType.length){n.enumType=[];for(o=0;o<e.enumType.length;++o)n.enumType[o]=p.google.protobuf.EnumDescriptorProto.toObject(e.enumType[o],t)}if(e.service&&e.service.length){n.service=[];for(o=0;o<e.service.length;++o)n.service[o]=p.google.protobuf.ServiceDescriptorProto.toObject(e.service[o],t)}if(e.extension&&e.extension.length){n.extension=[];for(o=0;o<e.extension.length;++o)n.extension[o]=p.google.protobuf.FieldDescriptorProto.toObject(e.extension[o],t)}if(null!=e.options&&e.hasOwnProperty("options")&&(n.options=p.google.protobuf.FileOptions.toObject(e.options,t)),null!=e.sourceCodeInfo&&e.hasOwnProperty("sourceCodeInfo")&&(n.sourceCodeInfo=p.google.protobuf.SourceCodeInfo.toObject(e.sourceCodeInfo,t)),e.publicDependency&&e.publicDependency.length){n.publicDependency=[];for(o=0;o<e.publicDependency.length;++o)n.publicDependency[o]=e.publicDependency[o]}if(e.weakDependency&&e.weakDependency.length){n.weakDependency=[];for(o=0;o<e.weakDependency.length;++o)n.weakDependency[o]=e.weakDependency[o]}return null!=e.syntax&&e.hasOwnProperty("syntax")&&(n.syntax=e.syntax),n},h.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},h),t.DescriptorProto=(O.prototype.name="",O.prototype.field=i.emptyArray,O.prototype.extension=i.emptyArray,O.prototype.nestedType=i.emptyArray,O.prototype.enumType=i.emptyArray,O.prototype.extensionRange=i.emptyArray,O.prototype.oneofDecl=i.emptyArray,O.prototype.options=null,O.prototype.reservedRange=i.emptyArray,O.prototype.reservedName=i.emptyArray,O.create=function(e){return new O(e)},O.encode=function(e,t){if(t=t||r.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),null!=e.field&&e.field.length)for(var n=0;n<e.field.length;++n)p.google.protobuf.FieldDescriptorProto.encode(e.field[n],t.uint32(18).fork()).ldelim();if(null!=e.nestedType&&e.nestedType.length)for(n=0;n<e.nestedType.length;++n)p.google.protobuf.DescriptorProto.encode(e.nestedType[n],t.uint32(26).fork()).ldelim();if(null!=e.enumType&&e.enumType.length)for(n=0;n<e.enumType.length;++n)p.google.protobuf.EnumDescriptorProto.encode(e.enumType[n],t.uint32(34).fork()).ldelim();if(null!=e.extensionRange&&e.extensionRange.length)for(n=0;n<e.extensionRange.length;++n)p.google.protobuf.DescriptorProto.ExtensionRange.encode(e.extensionRange[n],t.uint32(42).fork()).ldelim();if(null!=e.extension&&e.extension.length)for(n=0;n<e.extension.length;++n)p.google.protobuf.FieldDescriptorProto.encode(e.extension[n],t.uint32(50).fork()).ldelim();if(null!=e.options&&Object.hasOwnProperty.call(e,"options")&&p.google.protobuf.MessageOptions.encode(e.options,t.uint32(58).fork()).ldelim(),null!=e.oneofDecl&&e.oneofDecl.length)for(n=0;n<e.oneofDecl.length;++n)p.google.protobuf.OneofDescriptorProto.encode(e.oneofDecl[n],t.uint32(66).fork()).ldelim();if(null!=e.reservedRange&&e.reservedRange.length)for(n=0;n<e.reservedRange.length;++n)p.google.protobuf.DescriptorProto.ReservedRange.encode(e.reservedRange[n],t.uint32(74).fork()).ldelim();if(null!=e.reservedName&&e.reservedName.length)for(n=0;n<e.reservedName.length;++n)t.uint32(82).string(e.reservedName[n]);return t},O.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},O.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.DescriptorProto;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.name=e.string();break;case 2:o.field&&o.field.length||(o.field=[]),o.field.push(p.google.protobuf.FieldDescriptorProto.decode(e,e.uint32()));break;case 6:o.extension&&o.extension.length||(o.extension=[]),o.extension.push(p.google.protobuf.FieldDescriptorProto.decode(e,e.uint32()));break;case 3:o.nestedType&&o.nestedType.length||(o.nestedType=[]),o.nestedType.push(p.google.protobuf.DescriptorProto.decode(e,e.uint32()));break;case 4:o.enumType&&o.enumType.length||(o.enumType=[]),o.enumType.push(p.google.protobuf.EnumDescriptorProto.decode(e,e.uint32()));break;case 5:o.extensionRange&&o.extensionRange.length||(o.extensionRange=[]),o.extensionRange.push(p.google.protobuf.DescriptorProto.ExtensionRange.decode(e,e.uint32()));break;case 8:o.oneofDecl&&o.oneofDecl.length||(o.oneofDecl=[]),o.oneofDecl.push(p.google.protobuf.OneofDescriptorProto.decode(e,e.uint32()));break;case 7:o.options=p.google.protobuf.MessageOptions.decode(e,e.uint32());break;case 9:o.reservedRange&&o.reservedRange.length||(o.reservedRange=[]),o.reservedRange.push(p.google.protobuf.DescriptorProto.ReservedRange.decode(e,e.uint32()));break;case 10:o.reservedName&&o.reservedName.length||(o.reservedName=[]),o.reservedName.push(e.string());break;default:e.skipType(7&r)}}return o},O.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},O.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.name&&e.hasOwnProperty("name")&&!i.isString(e.name))return"name: string expected";if(null!=e.field&&e.hasOwnProperty("field")){if(!Array.isArray(e.field))return"field: array expected";for(var t=0;t<e.field.length;++t)if(n=p.google.protobuf.FieldDescriptorProto.verify(e.field[t]))return"field."+n}if(null!=e.extension&&e.hasOwnProperty("extension")){if(!Array.isArray(e.extension))return"extension: array expected";for(t=0;t<e.extension.length;++t)if(n=p.google.protobuf.FieldDescriptorProto.verify(e.extension[t]))return"extension."+n}if(null!=e.nestedType&&e.hasOwnProperty("nestedType")){if(!Array.isArray(e.nestedType))return"nestedType: array expected";for(t=0;t<e.nestedType.length;++t)if(n=p.google.protobuf.DescriptorProto.verify(e.nestedType[t]))return"nestedType."+n}if(null!=e.enumType&&e.hasOwnProperty("enumType")){if(!Array.isArray(e.enumType))return"enumType: array expected";for(t=0;t<e.enumType.length;++t)if(n=p.google.protobuf.EnumDescriptorProto.verify(e.enumType[t]))return"enumType."+n}if(null!=e.extensionRange&&e.hasOwnProperty("extensionRange")){if(!Array.isArray(e.extensionRange))return"extensionRange: array expected";for(t=0;t<e.extensionRange.length;++t)if(n=p.google.protobuf.DescriptorProto.ExtensionRange.verify(e.extensionRange[t]))return"extensionRange."+n}if(null!=e.oneofDecl&&e.hasOwnProperty("oneofDecl")){if(!Array.isArray(e.oneofDecl))return"oneofDecl: array expected";for(t=0;t<e.oneofDecl.length;++t)if(n=p.google.protobuf.OneofDescriptorProto.verify(e.oneofDecl[t]))return"oneofDecl."+n}if(null!=e.options&&e.hasOwnProperty("options")&&(n=p.google.protobuf.MessageOptions.verify(e.options)))return"options."+n;if(null!=e.reservedRange&&e.hasOwnProperty("reservedRange")){if(!Array.isArray(e.reservedRange))return"reservedRange: array expected";for(var n,t=0;t<e.reservedRange.length;++t)if(n=p.google.protobuf.DescriptorProto.ReservedRange.verify(e.reservedRange[t]))return"reservedRange."+n}if(null!=e.reservedName&&e.hasOwnProperty("reservedName")){if(!Array.isArray(e.reservedName))return"reservedName: array expected";for(t=0;t<e.reservedName.length;++t)if(!i.isString(e.reservedName[t]))return"reservedName: string[] expected"}return null},O.fromObject=function(e){if(e instanceof p.google.protobuf.DescriptorProto)return e;var t=new p.google.protobuf.DescriptorProto;if(null!=e.name&&(t.name=String(e.name)),e.field){if(!Array.isArray(e.field))throw TypeError(".google.protobuf.DescriptorProto.field: array expected");t.field=[];for(var n=0;n<e.field.length;++n){if("object"!=typeof e.field[n])throw TypeError(".google.protobuf.DescriptorProto.field: object expected");t.field[n]=p.google.protobuf.FieldDescriptorProto.fromObject(e.field[n])}}if(e.extension){if(!Array.isArray(e.extension))throw TypeError(".google.protobuf.DescriptorProto.extension: array expected");t.extension=[];for(n=0;n<e.extension.length;++n){if("object"!=typeof e.extension[n])throw TypeError(".google.protobuf.DescriptorProto.extension: object expected");t.extension[n]=p.google.protobuf.FieldDescriptorProto.fromObject(e.extension[n])}}if(e.nestedType){if(!Array.isArray(e.nestedType))throw TypeError(".google.protobuf.DescriptorProto.nestedType: array expected");t.nestedType=[];for(n=0;n<e.nestedType.length;++n){if("object"!=typeof e.nestedType[n])throw TypeError(".google.protobuf.DescriptorProto.nestedType: object expected");t.nestedType[n]=p.google.protobuf.DescriptorProto.fromObject(e.nestedType[n])}}if(e.enumType){if(!Array.isArray(e.enumType))throw TypeError(".google.protobuf.DescriptorProto.enumType: array expected");t.enumType=[];for(n=0;n<e.enumType.length;++n){if("object"!=typeof e.enumType[n])throw TypeError(".google.protobuf.DescriptorProto.enumType: object expected");t.enumType[n]=p.google.protobuf.EnumDescriptorProto.fromObject(e.enumType[n])}}if(e.extensionRange){if(!Array.isArray(e.extensionRange))throw TypeError(".google.protobuf.DescriptorProto.extensionRange: array expected");t.extensionRange=[];for(n=0;n<e.extensionRange.length;++n){if("object"!=typeof e.extensionRange[n])throw TypeError(".google.protobuf.DescriptorProto.extensionRange: object expected");t.extensionRange[n]=p.google.protobuf.DescriptorProto.ExtensionRange.fromObject(e.extensionRange[n])}}if(e.oneofDecl){if(!Array.isArray(e.oneofDecl))throw TypeError(".google.protobuf.DescriptorProto.oneofDecl: array expected");t.oneofDecl=[];for(n=0;n<e.oneofDecl.length;++n){if("object"!=typeof e.oneofDecl[n])throw TypeError(".google.protobuf.DescriptorProto.oneofDecl: object expected");t.oneofDecl[n]=p.google.protobuf.OneofDescriptorProto.fromObject(e.oneofDecl[n])}}if(null!=e.options){if("object"!=typeof e.options)throw TypeError(".google.protobuf.DescriptorProto.options: object expected");t.options=p.google.protobuf.MessageOptions.fromObject(e.options)}if(e.reservedRange){if(!Array.isArray(e.reservedRange))throw TypeError(".google.protobuf.DescriptorProto.reservedRange: array expected");t.reservedRange=[];for(n=0;n<e.reservedRange.length;++n){if("object"!=typeof e.reservedRange[n])throw TypeError(".google.protobuf.DescriptorProto.reservedRange: object expected");t.reservedRange[n]=p.google.protobuf.DescriptorProto.ReservedRange.fromObject(e.reservedRange[n])}}if(e.reservedName){if(!Array.isArray(e.reservedName))throw TypeError(".google.protobuf.DescriptorProto.reservedName: array expected");t.reservedName=[];for(n=0;n<e.reservedName.length;++n)t.reservedName[n]=String(e.reservedName[n])}return t},O.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.field=[],n.nestedType=[],n.enumType=[],n.extensionRange=[],n.extension=[],n.oneofDecl=[],n.reservedRange=[],n.reservedName=[]),t.defaults&&(n.name="",n.options=null),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),e.field&&e.field.length){n.field=[];for(var o=0;o<e.field.length;++o)n.field[o]=p.google.protobuf.FieldDescriptorProto.toObject(e.field[o],t)}if(e.nestedType&&e.nestedType.length){n.nestedType=[];for(o=0;o<e.nestedType.length;++o)n.nestedType[o]=p.google.protobuf.DescriptorProto.toObject(e.nestedType[o],t)}if(e.enumType&&e.enumType.length){n.enumType=[];for(o=0;o<e.enumType.length;++o)n.enumType[o]=p.google.protobuf.EnumDescriptorProto.toObject(e.enumType[o],t)}if(e.extensionRange&&e.extensionRange.length){n.extensionRange=[];for(o=0;o<e.extensionRange.length;++o)n.extensionRange[o]=p.google.protobuf.DescriptorProto.ExtensionRange.toObject(e.extensionRange[o],t)}if(e.extension&&e.extension.length){n.extension=[];for(o=0;o<e.extension.length;++o)n.extension[o]=p.google.protobuf.FieldDescriptorProto.toObject(e.extension[o],t)}if(null!=e.options&&e.hasOwnProperty("options")&&(n.options=p.google.protobuf.MessageOptions.toObject(e.options,t)),e.oneofDecl&&e.oneofDecl.length){n.oneofDecl=[];for(o=0;o<e.oneofDecl.length;++o)n.oneofDecl[o]=p.google.protobuf.OneofDescriptorProto.toObject(e.oneofDecl[o],t)}if(e.reservedRange&&e.reservedRange.length){n.reservedRange=[];for(o=0;o<e.reservedRange.length;++o)n.reservedRange[o]=p.google.protobuf.DescriptorProto.ReservedRange.toObject(e.reservedRange[o],t)}if(e.reservedName&&e.reservedName.length){n.reservedName=[];for(o=0;o<e.reservedName.length;++o)n.reservedName[o]=e.reservedName[o]}return n},O.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},O.ExtensionRange=(b.prototype.start=0,b.prototype.end=0,b.prototype.options=null,b.create=function(e){return new b(e)},b.encode=function(e,t){return t=t||r.create(),null!=e.start&&Object.hasOwnProperty.call(e,"start")&&t.uint32(8).int32(e.start),null!=e.end&&Object.hasOwnProperty.call(e,"end")&&t.uint32(16).int32(e.end),null!=e.options&&Object.hasOwnProperty.call(e,"options")&&p.google.protobuf.ExtensionRangeOptions.encode(e.options,t.uint32(26).fork()).ldelim(),t},b.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},b.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.DescriptorProto.ExtensionRange;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.start=e.int32();break;case 2:o.end=e.int32();break;case 3:o.options=p.google.protobuf.ExtensionRangeOptions.decode(e,e.uint32());break;default:e.skipType(7&r)}}return o},b.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},b.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.start&&e.hasOwnProperty("start")&&!i.isInteger(e.start))return"start: integer expected";if(null!=e.end&&e.hasOwnProperty("end")&&!i.isInteger(e.end))return"end: integer expected";if(null!=e.options&&e.hasOwnProperty("options")){e=p.google.protobuf.ExtensionRangeOptions.verify(e.options);if(e)return"options."+e}return null},b.fromObject=function(e){if(e instanceof p.google.protobuf.DescriptorProto.ExtensionRange)return e;var t=new p.google.protobuf.DescriptorProto.ExtensionRange;if(null!=e.start&&(t.start=0|e.start),null!=e.end&&(t.end=0|e.end),null!=e.options){if("object"!=typeof e.options)throw TypeError(".google.protobuf.DescriptorProto.ExtensionRange.options: object expected");t.options=p.google.protobuf.ExtensionRangeOptions.fromObject(e.options)}return t},b.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.start=0,n.end=0,n.options=null),null!=e.start&&e.hasOwnProperty("start")&&(n.start=e.start),null!=e.end&&e.hasOwnProperty("end")&&(n.end=e.end),null!=e.options&&e.hasOwnProperty("options")&&(n.options=p.google.protobuf.ExtensionRangeOptions.toObject(e.options,t)),n},b.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},b),O.ReservedRange=(m.prototype.start=0,m.prototype.end=0,m.create=function(e){return new m(e)},m.encode=function(e,t){return t=t||r.create(),null!=e.start&&Object.hasOwnProperty.call(e,"start")&&t.uint32(8).int32(e.start),null!=e.end&&Object.hasOwnProperty.call(e,"end")&&t.uint32(16).int32(e.end),t},m.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},m.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.DescriptorProto.ReservedRange;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.start=e.int32();break;case 2:o.end=e.int32();break;default:e.skipType(7&r)}}return o},m.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},m.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.start&&e.hasOwnProperty("start")&&!i.isInteger(e.start)?"start: integer expected":null!=e.end&&e.hasOwnProperty("end")&&!i.isInteger(e.end)?"end: integer expected":null},m.fromObject=function(e){var t;return e instanceof p.google.protobuf.DescriptorProto.ReservedRange?e:(t=new p.google.protobuf.DescriptorProto.ReservedRange,null!=e.start&&(t.start=0|e.start),null!=e.end&&(t.end=0|e.end),t)},m.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.start=0,n.end=0),null!=e.start&&e.hasOwnProperty("start")&&(n.start=e.start),null!=e.end&&e.hasOwnProperty("end")&&(n.end=e.end),n},m.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},m),O),t.ExtensionRangeOptions=(M.prototype.uninterpretedOption=i.emptyArray,M.create=function(e){return new M(e)},M.encode=function(e,t){if(t=t||r.create(),null!=e.uninterpretedOption&&e.uninterpretedOption.length)for(var n=0;n<e.uninterpretedOption.length;++n)p.google.protobuf.UninterpretedOption.encode(e.uninterpretedOption[n],t.uint32(7994).fork()).ldelim();return t},M.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},M.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.ExtensionRangeOptions;e.pos<n;){var r=e.uint32();r>>>3==999?(o.uninterpretedOption&&o.uninterpretedOption.length||(o.uninterpretedOption=[]),o.uninterpretedOption.push(p.google.protobuf.UninterpretedOption.decode(e,e.uint32()))):e.skipType(7&r)}return o},M.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},M.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.uninterpretedOption&&e.hasOwnProperty("uninterpretedOption")){if(!Array.isArray(e.uninterpretedOption))return"uninterpretedOption: array expected";for(var t=0;t<e.uninterpretedOption.length;++t){var n=p.google.protobuf.UninterpretedOption.verify(e.uninterpretedOption[t]);if(n)return"uninterpretedOption."+n}}return null},M.fromObject=function(e){if(e instanceof p.google.protobuf.ExtensionRangeOptions)return e;var t=new p.google.protobuf.ExtensionRangeOptions;if(e.uninterpretedOption){if(!Array.isArray(e.uninterpretedOption))throw TypeError(".google.protobuf.ExtensionRangeOptions.uninterpretedOption: array expected");t.uninterpretedOption=[];for(var n=0;n<e.uninterpretedOption.length;++n){if("object"!=typeof e.uninterpretedOption[n])throw TypeError(".google.protobuf.ExtensionRangeOptions.uninterpretedOption: object expected");t.uninterpretedOption[n]=p.google.protobuf.UninterpretedOption.fromObject(e.uninterpretedOption[n])}}return t},M.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.uninterpretedOption=[]),e.uninterpretedOption&&e.uninterpretedOption.length){n.uninterpretedOption=[];for(var o=0;o<e.uninterpretedOption.length;++o)n.uninterpretedOption[o]=p.google.protobuf.UninterpretedOption.toObject(e.uninterpretedOption[o],t)}return n},M.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},M),t.FieldDescriptorProto=(v.prototype.name="",v.prototype.number=0,v.prototype.label=1,v.prototype.type=1,v.prototype.typeName="",v.prototype.extendee="",v.prototype.defaultValue="",v.prototype.oneofIndex=0,v.prototype.jsonName="",v.prototype.options=null,v.prototype.proto3Optional=!1,v.create=function(e){return new v(e)},v.encode=function(e,t){return t=t||r.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),null!=e.extendee&&Object.hasOwnProperty.call(e,"extendee")&&t.uint32(18).string(e.extendee),null!=e.number&&Object.hasOwnProperty.call(e,"number")&&t.uint32(24).int32(e.number),null!=e.label&&Object.hasOwnProperty.call(e,"label")&&t.uint32(32).int32(e.label),null!=e.type&&Object.hasOwnProperty.call(e,"type")&&t.uint32(40).int32(e.type),null!=e.typeName&&Object.hasOwnProperty.call(e,"typeName")&&t.uint32(50).string(e.typeName),null!=e.defaultValue&&Object.hasOwnProperty.call(e,"defaultValue")&&t.uint32(58).string(e.defaultValue),null!=e.options&&Object.hasOwnProperty.call(e,"options")&&p.google.protobuf.FieldOptions.encode(e.options,t.uint32(66).fork()).ldelim(),null!=e.oneofIndex&&Object.hasOwnProperty.call(e,"oneofIndex")&&t.uint32(72).int32(e.oneofIndex),null!=e.jsonName&&Object.hasOwnProperty.call(e,"jsonName")&&t.uint32(82).string(e.jsonName),null!=e.proto3Optional&&Object.hasOwnProperty.call(e,"proto3Optional")&&t.uint32(136).bool(e.proto3Optional),t},v.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},v.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.FieldDescriptorProto;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.name=e.string();break;case 3:o.number=e.int32();break;case 4:o.label=e.int32();break;case 5:o.type=e.int32();break;case 6:o.typeName=e.string();break;case 2:o.extendee=e.string();break;case 7:o.defaultValue=e.string();break;case 9:o.oneofIndex=e.int32();break;case 10:o.jsonName=e.string();break;case 8:o.options=p.google.protobuf.FieldOptions.decode(e,e.uint32());break;case 17:o.proto3Optional=e.bool();break;default:e.skipType(7&r)}}return o},v.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},v.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.name&&e.hasOwnProperty("name")&&!i.isString(e.name))return"name: string expected";if(null!=e.number&&e.hasOwnProperty("number")&&!i.isInteger(e.number))return"number: integer expected";if(null!=e.label&&e.hasOwnProperty("label"))switch(e.label){default:return"label: enum value expected";case 1:case 2:case 3:}if(null!=e.type&&e.hasOwnProperty("type"))switch(e.type){default:return"type: enum value expected";case 1:case 2:case 3:case 4:case 5:case 6:case 7:case 8:case 9:case 10:case 11:case 12:case 13:case 14:case 15:case 16:case 17:case 18:}if(null!=e.typeName&&e.hasOwnProperty("typeName")&&!i.isString(e.typeName))return"typeName: string expected";if(null!=e.extendee&&e.hasOwnProperty("extendee")&&!i.isString(e.extendee))return"extendee: string expected";if(null!=e.defaultValue&&e.hasOwnProperty("defaultValue")&&!i.isString(e.defaultValue))return"defaultValue: string expected";if(null!=e.oneofIndex&&e.hasOwnProperty("oneofIndex")&&!i.isInteger(e.oneofIndex))return"oneofIndex: integer expected";if(null!=e.jsonName&&e.hasOwnProperty("jsonName")&&!i.isString(e.jsonName))return"jsonName: string expected";if(null!=e.options&&e.hasOwnProperty("options")){var t=p.google.protobuf.FieldOptions.verify(e.options);if(t)return"options."+t}return null!=e.proto3Optional&&e.hasOwnProperty("proto3Optional")&&"boolean"!=typeof e.proto3Optional?"proto3Optional: boolean expected":null},v.fromObject=function(e){if(e instanceof p.google.protobuf.FieldDescriptorProto)return e;var t=new p.google.protobuf.FieldDescriptorProto;switch(null!=e.name&&(t.name=String(e.name)),null!=e.number&&(t.number=0|e.number),e.label){case"LABEL_OPTIONAL":case 1:t.label=1;break;case"LABEL_REQUIRED":case 2:t.label=2;break;case"LABEL_REPEATED":case 3:t.label=3}switch(e.type){case"TYPE_DOUBLE":case 1:t.type=1;break;case"TYPE_FLOAT":case 2:t.type=2;break;case"TYPE_INT64":case 3:t.type=3;break;case"TYPE_UINT64":case 4:t.type=4;break;case"TYPE_INT32":case 5:t.type=5;break;case"TYPE_FIXED64":case 6:t.type=6;break;case"TYPE_FIXED32":case 7:t.type=7;break;case"TYPE_BOOL":case 8:t.type=8;break;case"TYPE_STRING":case 9:t.type=9;break;case"TYPE_GROUP":case 10:t.type=10;break;case"TYPE_MESSAGE":case 11:t.type=11;break;case"TYPE_BYTES":case 12:t.type=12;break;case"TYPE_UINT32":case 13:t.type=13;break;case"TYPE_ENUM":case 14:t.type=14;break;case"TYPE_SFIXED32":case 15:t.type=15;break;case"TYPE_SFIXED64":case 16:t.type=16;break;case"TYPE_SINT32":case 17:t.type=17;break;case"TYPE_SINT64":case 18:t.type=18}if(null!=e.typeName&&(t.typeName=String(e.typeName)),null!=e.extendee&&(t.extendee=String(e.extendee)),null!=e.defaultValue&&(t.defaultValue=String(e.defaultValue)),null!=e.oneofIndex&&(t.oneofIndex=0|e.oneofIndex),null!=e.jsonName&&(t.jsonName=String(e.jsonName)),null!=e.options){if("object"!=typeof e.options)throw TypeError(".google.protobuf.FieldDescriptorProto.options: object expected");t.options=p.google.protobuf.FieldOptions.fromObject(e.options)}return null!=e.proto3Optional&&(t.proto3Optional=Boolean(e.proto3Optional)),t},v.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.name="",n.extendee="",n.number=0,n.label=t.enums===String?"LABEL_OPTIONAL":1,n.type=t.enums===String?"TYPE_DOUBLE":1,n.typeName="",n.defaultValue="",n.options=null,n.oneofIndex=0,n.jsonName="",n.proto3Optional=!1),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),null!=e.extendee&&e.hasOwnProperty("extendee")&&(n.extendee=e.extendee),null!=e.number&&e.hasOwnProperty("number")&&(n.number=e.number),null!=e.label&&e.hasOwnProperty("label")&&(n.label=t.enums===String?p.google.protobuf.FieldDescriptorProto.Label[e.label]:e.label),null!=e.type&&e.hasOwnProperty("type")&&(n.type=t.enums===String?p.google.protobuf.FieldDescriptorProto.Type[e.type]:e.type),null!=e.typeName&&e.hasOwnProperty("typeName")&&(n.typeName=e.typeName),null!=e.defaultValue&&e.hasOwnProperty("defaultValue")&&(n.defaultValue=e.defaultValue),null!=e.options&&e.hasOwnProperty("options")&&(n.options=p.google.protobuf.FieldOptions.toObject(e.options,t)),null!=e.oneofIndex&&e.hasOwnProperty("oneofIndex")&&(n.oneofIndex=e.oneofIndex),null!=e.jsonName&&e.hasOwnProperty("jsonName")&&(n.jsonName=e.jsonName),null!=e.proto3Optional&&e.hasOwnProperty("proto3Optional")&&(n.proto3Optional=e.proto3Optional),n},v.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},v.Type=(n={},(e=Object.create(n))[n[1]="TYPE_DOUBLE"]=1,e[n[2]="TYPE_FLOAT"]=2,e[n[3]="TYPE_INT64"]=3,e[n[4]="TYPE_UINT64"]=4,e[n[5]="TYPE_INT32"]=5,e[n[6]="TYPE_FIXED64"]=6,e[n[7]="TYPE_FIXED32"]=7,e[n[8]="TYPE_BOOL"]=8,e[n[9]="TYPE_STRING"]=9,e[n[10]="TYPE_GROUP"]=10,e[n[11]="TYPE_MESSAGE"]=11,e[n[12]="TYPE_BYTES"]=12,e[n[13]="TYPE_UINT32"]=13,e[n[14]="TYPE_ENUM"]=14,e[n[15]="TYPE_SFIXED32"]=15,e[n[16]="TYPE_SFIXED64"]=16,e[n[17]="TYPE_SINT32"]=17,e[n[18]="TYPE_SINT64"]=18,e),v.Label=(n={},(e=Object.create(n))[n[1]="LABEL_OPTIONAL"]=1,e[n[2]="LABEL_REQUIRED"]=2,e[n[3]="LABEL_REPEATED"]=3,e),v),t.OneofDescriptorProto=(w.prototype.name="",w.prototype.options=null,w.create=function(e){return new w(e)},w.encode=function(e,t){return t=t||r.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),null!=e.options&&Object.hasOwnProperty.call(e,"options")&&p.google.protobuf.OneofOptions.encode(e.options,t.uint32(18).fork()).ldelim(),t},w.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},w.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.OneofDescriptorProto;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.name=e.string();break;case 2:o.options=p.google.protobuf.OneofOptions.decode(e,e.uint32());break;default:e.skipType(7&r)}}return o},w.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},w.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.name&&e.hasOwnProperty("name")&&!i.isString(e.name))return"name: string expected";if(null!=e.options&&e.hasOwnProperty("options")){e=p.google.protobuf.OneofOptions.verify(e.options);if(e)return"options."+e}return null},w.fromObject=function(e){if(e instanceof p.google.protobuf.OneofDescriptorProto)return e;var t=new p.google.protobuf.OneofDescriptorProto;if(null!=e.name&&(t.name=String(e.name)),null!=e.options){if("object"!=typeof e.options)throw TypeError(".google.protobuf.OneofDescriptorProto.options: object expected");t.options=p.google.protobuf.OneofOptions.fromObject(e.options)}return t},w.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.name="",n.options=null),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),null!=e.options&&e.hasOwnProperty("options")&&(n.options=p.google.protobuf.OneofOptions.toObject(e.options,t)),n},w.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},w),t.EnumDescriptorProto=(P.prototype.name="",P.prototype.value=i.emptyArray,P.prototype.options=null,P.prototype.reservedRange=i.emptyArray,P.prototype.reservedName=i.emptyArray,P.create=function(e){return new P(e)},P.encode=function(e,t){if(t=t||r.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),null!=e.value&&e.value.length)for(var n=0;n<e.value.length;++n)p.google.protobuf.EnumValueDescriptorProto.encode(e.value[n],t.uint32(18).fork()).ldelim();if(null!=e.options&&Object.hasOwnProperty.call(e,"options")&&p.google.protobuf.EnumOptions.encode(e.options,t.uint32(26).fork()).ldelim(),null!=e.reservedRange&&e.reservedRange.length)for(n=0;n<e.reservedRange.length;++n)p.google.protobuf.EnumDescriptorProto.EnumReservedRange.encode(e.reservedRange[n],t.uint32(34).fork()).ldelim();if(null!=e.reservedName&&e.reservedName.length)for(n=0;n<e.reservedName.length;++n)t.uint32(42).string(e.reservedName[n]);return t},P.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},P.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.EnumDescriptorProto;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.name=e.string();break;case 2:o.value&&o.value.length||(o.value=[]),o.value.push(p.google.protobuf.EnumValueDescriptorProto.decode(e,e.uint32()));break;case 3:o.options=p.google.protobuf.EnumOptions.decode(e,e.uint32());break;case 4:o.reservedRange&&o.reservedRange.length||(o.reservedRange=[]),o.reservedRange.push(p.google.protobuf.EnumDescriptorProto.EnumReservedRange.decode(e,e.uint32()));break;case 5:o.reservedName&&o.reservedName.length||(o.reservedName=[]),o.reservedName.push(e.string());break;default:e.skipType(7&r)}}return o},P.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},P.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.name&&e.hasOwnProperty("name")&&!i.isString(e.name))return"name: string expected";if(null!=e.value&&e.hasOwnProperty("value")){if(!Array.isArray(e.value))return"value: array expected";for(var t=0;t<e.value.length;++t)if(n=p.google.protobuf.EnumValueDescriptorProto.verify(e.value[t]))return"value."+n}if(null!=e.options&&e.hasOwnProperty("options")&&(n=p.google.protobuf.EnumOptions.verify(e.options)))return"options."+n;if(null!=e.reservedRange&&e.hasOwnProperty("reservedRange")){if(!Array.isArray(e.reservedRange))return"reservedRange: array expected";for(var n,t=0;t<e.reservedRange.length;++t)if(n=p.google.protobuf.EnumDescriptorProto.EnumReservedRange.verify(e.reservedRange[t]))return"reservedRange."+n}if(null!=e.reservedName&&e.hasOwnProperty("reservedName")){if(!Array.isArray(e.reservedName))return"reservedName: array expected";for(t=0;t<e.reservedName.length;++t)if(!i.isString(e.reservedName[t]))return"reservedName: string[] expected"}return null},P.fromObject=function(e){if(e instanceof p.google.protobuf.EnumDescriptorProto)return e;var t=new p.google.protobuf.EnumDescriptorProto;if(null!=e.name&&(t.name=String(e.name)),e.value){if(!Array.isArray(e.value))throw TypeError(".google.protobuf.EnumDescriptorProto.value: array expected");t.value=[];for(var n=0;n<e.value.length;++n){if("object"!=typeof e.value[n])throw TypeError(".google.protobuf.EnumDescriptorProto.value: object expected");t.value[n]=p.google.protobuf.EnumValueDescriptorProto.fromObject(e.value[n])}}if(null!=e.options){if("object"!=typeof e.options)throw TypeError(".google.protobuf.EnumDescriptorProto.options: object expected");t.options=p.google.protobuf.EnumOptions.fromObject(e.options)}if(e.reservedRange){if(!Array.isArray(e.reservedRange))throw TypeError(".google.protobuf.EnumDescriptorProto.reservedRange: array expected");t.reservedRange=[];for(n=0;n<e.reservedRange.length;++n){if("object"!=typeof e.reservedRange[n])throw TypeError(".google.protobuf.EnumDescriptorProto.reservedRange: object expected");t.reservedRange[n]=p.google.protobuf.EnumDescriptorProto.EnumReservedRange.fromObject(e.reservedRange[n])}}if(e.reservedName){if(!Array.isArray(e.reservedName))throw TypeError(".google.protobuf.EnumDescriptorProto.reservedName: array expected");t.reservedName=[];for(n=0;n<e.reservedName.length;++n)t.reservedName[n]=String(e.reservedName[n])}return t},P.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.value=[],n.reservedRange=[],n.reservedName=[]),t.defaults&&(n.name="",n.options=null),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),e.value&&e.value.length){n.value=[];for(var o=0;o<e.value.length;++o)n.value[o]=p.google.protobuf.EnumValueDescriptorProto.toObject(e.value[o],t)}if(null!=e.options&&e.hasOwnProperty("options")&&(n.options=p.google.protobuf.EnumOptions.toObject(e.options,t)),e.reservedRange&&e.reservedRange.length){n.reservedRange=[];for(o=0;o<e.reservedRange.length;++o)n.reservedRange[o]=p.google.protobuf.EnumDescriptorProto.EnumReservedRange.toObject(e.reservedRange[o],t)}if(e.reservedName&&e.reservedName.length){n.reservedName=[];for(o=0;o<e.reservedName.length;++o)n.reservedName[o]=e.reservedName[o]}return n},P.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},P.EnumReservedRange=(_.prototype.start=0,_.prototype.end=0,_.create=function(e){return new _(e)},_.encode=function(e,t){return t=t||r.create(),null!=e.start&&Object.hasOwnProperty.call(e,"start")&&t.uint32(8).int32(e.start),null!=e.end&&Object.hasOwnProperty.call(e,"end")&&t.uint32(16).int32(e.end),t},_.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},_.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.EnumDescriptorProto.EnumReservedRange;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.start=e.int32();break;case 2:o.end=e.int32();break;default:e.skipType(7&r)}}return o},_.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},_.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.start&&e.hasOwnProperty("start")&&!i.isInteger(e.start)?"start: integer expected":null!=e.end&&e.hasOwnProperty("end")&&!i.isInteger(e.end)?"end: integer expected":null},_.fromObject=function(e){var t;return e instanceof p.google.protobuf.EnumDescriptorProto.EnumReservedRange?e:(t=new p.google.protobuf.EnumDescriptorProto.EnumReservedRange,null!=e.start&&(t.start=0|e.start),null!=e.end&&(t.end=0|e.end),t)},_.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.start=0,n.end=0),null!=e.start&&e.hasOwnProperty("start")&&(n.start=e.start),null!=e.end&&e.hasOwnProperty("end")&&(n.end=e.end),n},_.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},_),P),t.EnumValueDescriptorProto=(j.prototype.name="",j.prototype.number=0,j.prototype.options=null,j.create=function(e){return new j(e)},j.encode=function(e,t){return t=t||r.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),null!=e.number&&Object.hasOwnProperty.call(e,"number")&&t.uint32(16).int32(e.number),null!=e.options&&Object.hasOwnProperty.call(e,"options")&&p.google.protobuf.EnumValueOptions.encode(e.options,t.uint32(26).fork()).ldelim(),t},j.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},j.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.EnumValueDescriptorProto;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.name=e.string();break;case 2:o.number=e.int32();break;case 3:o.options=p.google.protobuf.EnumValueOptions.decode(e,e.uint32());break;default:e.skipType(7&r)}}return o},j.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},j.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.name&&e.hasOwnProperty("name")&&!i.isString(e.name))return"name: string expected";if(null!=e.number&&e.hasOwnProperty("number")&&!i.isInteger(e.number))return"number: integer expected";if(null!=e.options&&e.hasOwnProperty("options")){e=p.google.protobuf.EnumValueOptions.verify(e.options);if(e)return"options."+e}return null},j.fromObject=function(e){if(e instanceof p.google.protobuf.EnumValueDescriptorProto)return e;var t=new p.google.protobuf.EnumValueDescriptorProto;if(null!=e.name&&(t.name=String(e.name)),null!=e.number&&(t.number=0|e.number),null!=e.options){if("object"!=typeof e.options)throw TypeError(".google.protobuf.EnumValueDescriptorProto.options: object expected");t.options=p.google.protobuf.EnumValueOptions.fromObject(e.options)}return t},j.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.name="",n.number=0,n.options=null),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),null!=e.number&&e.hasOwnProperty("number")&&(n.number=e.number),null!=e.options&&e.hasOwnProperty("options")&&(n.options=p.google.protobuf.EnumValueOptions.toObject(e.options,t)),n},j.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},j),t.ServiceDescriptorProto=(S.prototype.name="",S.prototype.method=i.emptyArray,S.prototype.options=null,S.create=function(e){return new S(e)},S.encode=function(e,t){if(t=t||r.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),null!=e.method&&e.method.length)for(var n=0;n<e.method.length;++n)p.google.protobuf.MethodDescriptorProto.encode(e.method[n],t.uint32(18).fork()).ldelim();return null!=e.options&&Object.hasOwnProperty.call(e,"options")&&p.google.protobuf.ServiceOptions.encode(e.options,t.uint32(26).fork()).ldelim(),t},S.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},S.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.ServiceDescriptorProto;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.name=e.string();break;case 2:o.method&&o.method.length||(o.method=[]),o.method.push(p.google.protobuf.MethodDescriptorProto.decode(e,e.uint32()));break;case 3:o.options=p.google.protobuf.ServiceOptions.decode(e,e.uint32());break;default:e.skipType(7&r)}}return o},S.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},S.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.name&&e.hasOwnProperty("name")&&!i.isString(e.name))return"name: string expected";if(null!=e.method&&e.hasOwnProperty("method")){if(!Array.isArray(e.method))return"method: array expected";for(var t=0;t<e.method.length;++t)if(n=p.google.protobuf.MethodDescriptorProto.verify(e.method[t]))return"method."+n}var n;if(null!=e.options&&e.hasOwnProperty("options")&&(n=p.google.protobuf.ServiceOptions.verify(e.options)))return"options."+n;return null},S.fromObject=function(e){if(e instanceof p.google.protobuf.ServiceDescriptorProto)return e;var t=new p.google.protobuf.ServiceDescriptorProto;if(null!=e.name&&(t.name=String(e.name)),e.method){if(!Array.isArray(e.method))throw TypeError(".google.protobuf.ServiceDescriptorProto.method: array expected");t.method=[];for(var n=0;n<e.method.length;++n){if("object"!=typeof e.method[n])throw TypeError(".google.protobuf.ServiceDescriptorProto.method: object expected");t.method[n]=p.google.protobuf.MethodDescriptorProto.fromObject(e.method[n])}}if(null!=e.options){if("object"!=typeof e.options)throw TypeError(".google.protobuf.ServiceDescriptorProto.options: object expected");t.options=p.google.protobuf.ServiceOptions.fromObject(e.options)}return t},S.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.method=[]),t.defaults&&(n.name="",n.options=null),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),e.method&&e.method.length){n.method=[];for(var o=0;o<e.method.length;++o)n.method[o]=p.google.protobuf.MethodDescriptorProto.toObject(e.method[o],t)}return null!=e.options&&e.hasOwnProperty("options")&&(n.options=p.google.protobuf.ServiceOptions.toObject(e.options,t)),n},S.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},S),t.MethodDescriptorProto=(x.prototype.name="",x.prototype.inputType="",x.prototype.outputType="",x.prototype.options=null,x.prototype.clientStreaming=!1,x.prototype.serverStreaming=!1,x.create=function(e){return new x(e)},x.encode=function(e,t){return t=t||r.create(),null!=e.name&&Object.hasOwnProperty.call(e,"name")&&t.uint32(10).string(e.name),null!=e.inputType&&Object.hasOwnProperty.call(e,"inputType")&&t.uint32(18).string(e.inputType),null!=e.outputType&&Object.hasOwnProperty.call(e,"outputType")&&t.uint32(26).string(e.outputType),null!=e.options&&Object.hasOwnProperty.call(e,"options")&&p.google.protobuf.MethodOptions.encode(e.options,t.uint32(34).fork()).ldelim(),null!=e.clientStreaming&&Object.hasOwnProperty.call(e,"clientStreaming")&&t.uint32(40).bool(e.clientStreaming),null!=e.serverStreaming&&Object.hasOwnProperty.call(e,"serverStreaming")&&t.uint32(48).bool(e.serverStreaming),t},x.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},x.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.MethodDescriptorProto;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.name=e.string();break;case 2:o.inputType=e.string();break;case 3:o.outputType=e.string();break;case 4:o.options=p.google.protobuf.MethodOptions.decode(e,e.uint32());break;case 5:o.clientStreaming=e.bool();break;case 6:o.serverStreaming=e.bool();break;default:e.skipType(7&r)}}return o},x.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},x.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.name&&e.hasOwnProperty("name")&&!i.isString(e.name))return"name: string expected";if(null!=e.inputType&&e.hasOwnProperty("inputType")&&!i.isString(e.inputType))return"inputType: string expected";if(null!=e.outputType&&e.hasOwnProperty("outputType")&&!i.isString(e.outputType))return"outputType: string expected";if(null!=e.options&&e.hasOwnProperty("options")){var t=p.google.protobuf.MethodOptions.verify(e.options);if(t)return"options."+t}return null!=e.clientStreaming&&e.hasOwnProperty("clientStreaming")&&"boolean"!=typeof e.clientStreaming?"clientStreaming: boolean expected":null!=e.serverStreaming&&e.hasOwnProperty("serverStreaming")&&"boolean"!=typeof e.serverStreaming?"serverStreaming: boolean expected":null},x.fromObject=function(e){if(e instanceof p.google.protobuf.MethodDescriptorProto)return e;var t=new p.google.protobuf.MethodDescriptorProto;if(null!=e.name&&(t.name=String(e.name)),null!=e.inputType&&(t.inputType=String(e.inputType)),null!=e.outputType&&(t.outputType=String(e.outputType)),null!=e.options){if("object"!=typeof e.options)throw TypeError(".google.protobuf.MethodDescriptorProto.options: object expected");t.options=p.google.protobuf.MethodOptions.fromObject(e.options)}return null!=e.clientStreaming&&(t.clientStreaming=Boolean(e.clientStreaming)),null!=e.serverStreaming&&(t.serverStreaming=Boolean(e.serverStreaming)),t},x.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.name="",n.inputType="",n.outputType="",n.options=null,n.clientStreaming=!1,n.serverStreaming=!1),null!=e.name&&e.hasOwnProperty("name")&&(n.name=e.name),null!=e.inputType&&e.hasOwnProperty("inputType")&&(n.inputType=e.inputType),null!=e.outputType&&e.hasOwnProperty("outputType")&&(n.outputType=e.outputType),null!=e.options&&e.hasOwnProperty("options")&&(n.options=p.google.protobuf.MethodOptions.toObject(e.options,t)),null!=e.clientStreaming&&e.hasOwnProperty("clientStreaming")&&(n.clientStreaming=e.clientStreaming),null!=e.serverStreaming&&e.hasOwnProperty("serverStreaming")&&(n.serverStreaming=e.serverStreaming),n},x.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},x),t.FileOptions=(k.prototype.javaPackage="",k.prototype.javaOuterClassname="",k.prototype.javaMultipleFiles=!1,k.prototype.javaGenerateEqualsAndHash=!1,k.prototype.javaStringCheckUtf8=!1,k.prototype.optimizeFor=1,k.prototype.goPackage="",k.prototype.ccGenericServices=!1,k.prototype.javaGenericServices=!1,k.prototype.pyGenericServices=!1,k.prototype.phpGenericServices=!1,k.prototype.deprecated=!1,k.prototype.ccEnableArenas=!0,k.prototype.objcClassPrefix="",k.prototype.csharpNamespace="",k.prototype.swiftPrefix="",k.prototype.phpClassPrefix="",k.prototype.phpNamespace="",k.prototype.phpMetadataNamespace="",k.prototype.rubyPackage="",k.prototype.uninterpretedOption=i.emptyArray,k.create=function(e){return new k(e)},k.encode=function(e,t){if(t=t||r.create(),null!=e.javaPackage&&Object.hasOwnProperty.call(e,"javaPackage")&&t.uint32(10).string(e.javaPackage),null!=e.javaOuterClassname&&Object.hasOwnProperty.call(e,"javaOuterClassname")&&t.uint32(66).string(e.javaOuterClassname),null!=e.optimizeFor&&Object.hasOwnProperty.call(e,"optimizeFor")&&t.uint32(72).int32(e.optimizeFor),null!=e.javaMultipleFiles&&Object.hasOwnProperty.call(e,"javaMultipleFiles")&&t.uint32(80).bool(e.javaMultipleFiles),null!=e.goPackage&&Object.hasOwnProperty.call(e,"goPackage")&&t.uint32(90).string(e.goPackage),null!=e.ccGenericServices&&Object.hasOwnProperty.call(e,"ccGenericServices")&&t.uint32(128).bool(e.ccGenericServices),null!=e.javaGenericServices&&Object.hasOwnProperty.call(e,"javaGenericServices")&&t.uint32(136).bool(e.javaGenericServices),null!=e.pyGenericServices&&Object.hasOwnProperty.call(e,"pyGenericServices")&&t.uint32(144).bool(e.pyGenericServices),null!=e.javaGenerateEqualsAndHash&&Object.hasOwnProperty.call(e,"javaGenerateEqualsAndHash")&&t.uint32(160).bool(e.javaGenerateEqualsAndHash),null!=e.deprecated&&Object.hasOwnProperty.call(e,"deprecated")&&t.uint32(184).bool(e.deprecated),null!=e.javaStringCheckUtf8&&Object.hasOwnProperty.call(e,"javaStringCheckUtf8")&&t.uint32(216).bool(e.javaStringCheckUtf8),null!=e.ccEnableArenas&&Object.hasOwnProperty.call(e,"ccEnableArenas")&&t.uint32(248).bool(e.ccEnableArenas),null!=e.objcClassPrefix&&Object.hasOwnProperty.call(e,"objcClassPrefix")&&t.uint32(290).string(e.objcClassPrefix),null!=e.csharpNamespace&&Object.hasOwnProperty.call(e,"csharpNamespace")&&t.uint32(298).string(e.csharpNamespace),null!=e.swiftPrefix&&Object.hasOwnProperty.call(e,"swiftPrefix")&&t.uint32(314).string(e.swiftPrefix),null!=e.phpClassPrefix&&Object.hasOwnProperty.call(e,"phpClassPrefix")&&t.uint32(322).string(e.phpClassPrefix),null!=e.phpNamespace&&Object.hasOwnProperty.call(e,"phpNamespace")&&t.uint32(330).string(e.phpNamespace),null!=e.phpGenericServices&&Object.hasOwnProperty.call(e,"phpGenericServices")&&t.uint32(336).bool(e.phpGenericServices),null!=e.phpMetadataNamespace&&Object.hasOwnProperty.call(e,"phpMetadataNamespace")&&t.uint32(354).string(e.phpMetadataNamespace),null!=e.rubyPackage&&Object.hasOwnProperty.call(e,"rubyPackage")&&t.uint32(362).string(e.rubyPackage),null!=e.uninterpretedOption&&e.uninterpretedOption.length)for(var n=0;n<e.uninterpretedOption.length;++n)p.google.protobuf.UninterpretedOption.encode(e.uninterpretedOption[n],t.uint32(7994).fork()).ldelim();return t},k.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},k.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.FileOptions;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.javaPackage=e.string();break;case 8:o.javaOuterClassname=e.string();break;case 10:o.javaMultipleFiles=e.bool();break;case 20:o.javaGenerateEqualsAndHash=e.bool();break;case 27:o.javaStringCheckUtf8=e.bool();break;case 9:o.optimizeFor=e.int32();break;case 11:o.goPackage=e.string();break;case 16:o.ccGenericServices=e.bool();break;case 17:o.javaGenericServices=e.bool();break;case 18:o.pyGenericServices=e.bool();break;case 42:o.phpGenericServices=e.bool();break;case 23:o.deprecated=e.bool();break;case 31:o.ccEnableArenas=e.bool();break;case 36:o.objcClassPrefix=e.string();break;case 37:o.csharpNamespace=e.string();break;case 39:o.swiftPrefix=e.string();break;case 40:o.phpClassPrefix=e.string();break;case 41:o.phpNamespace=e.string();break;case 44:o.phpMetadataNamespace=e.string();break;case 45:o.rubyPackage=e.string();break;case 999:o.uninterpretedOption&&o.uninterpretedOption.length||(o.uninterpretedOption=[]),o.uninterpretedOption.push(p.google.protobuf.UninterpretedOption.decode(e,e.uint32()));break;default:e.skipType(7&r)}}return o},k.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},k.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.javaPackage&&e.hasOwnProperty("javaPackage")&&!i.isString(e.javaPackage))return"javaPackage: string expected";if(null!=e.javaOuterClassname&&e.hasOwnProperty("javaOuterClassname")&&!i.isString(e.javaOuterClassname))return"javaOuterClassname: string expected";if(null!=e.javaMultipleFiles&&e.hasOwnProperty("javaMultipleFiles")&&"boolean"!=typeof e.javaMultipleFiles)return"javaMultipleFiles: boolean expected";if(null!=e.javaGenerateEqualsAndHash&&e.hasOwnProperty("javaGenerateEqualsAndHash")&&"boolean"!=typeof e.javaGenerateEqualsAndHash)return"javaGenerateEqualsAndHash: boolean expected";if(null!=e.javaStringCheckUtf8&&e.hasOwnProperty("javaStringCheckUtf8")&&"boolean"!=typeof e.javaStringCheckUtf8)return"javaStringCheckUtf8: boolean expected";if(null!=e.optimizeFor&&e.hasOwnProperty("optimizeFor"))switch(e.optimizeFor){default:return"optimizeFor: enum value expected";case 1:case 2:case 3:}if(null!=e.goPackage&&e.hasOwnProperty("goPackage")&&!i.isString(e.goPackage))return"goPackage: string expected";if(null!=e.ccGenericServices&&e.hasOwnProperty("ccGenericServices")&&"boolean"!=typeof e.ccGenericServices)return"ccGenericServices: boolean expected";if(null!=e.javaGenericServices&&e.hasOwnProperty("javaGenericServices")&&"boolean"!=typeof e.javaGenericServices)return"javaGenericServices: boolean expected";if(null!=e.pyGenericServices&&e.hasOwnProperty("pyGenericServices")&&"boolean"!=typeof e.pyGenericServices)return"pyGenericServices: boolean expected";if(null!=e.phpGenericServices&&e.hasOwnProperty("phpGenericServices")&&"boolean"!=typeof e.phpGenericServices)return"phpGenericServices: boolean expected";if(null!=e.deprecated&&e.hasOwnProperty("deprecated")&&"boolean"!=typeof e.deprecated)return"deprecated: boolean expected";if(null!=e.ccEnableArenas&&e.hasOwnProperty("ccEnableArenas")&&"boolean"!=typeof e.ccEnableArenas)return"ccEnableArenas: boolean expected";if(null!=e.objcClassPrefix&&e.hasOwnProperty("objcClassPrefix")&&!i.isString(e.objcClassPrefix))return"objcClassPrefix: string expected";if(null!=e.csharpNamespace&&e.hasOwnProperty("csharpNamespace")&&!i.isString(e.csharpNamespace))return"csharpNamespace: string expected";if(null!=e.swiftPrefix&&e.hasOwnProperty("swiftPrefix")&&!i.isString(e.swiftPrefix))return"swiftPrefix: string expected";if(null!=e.phpClassPrefix&&e.hasOwnProperty("phpClassPrefix")&&!i.isString(e.phpClassPrefix))return"phpClassPrefix: string expected";if(null!=e.phpNamespace&&e.hasOwnProperty("phpNamespace")&&!i.isString(e.phpNamespace))return"phpNamespace: string expected";if(null!=e.phpMetadataNamespace&&e.hasOwnProperty("phpMetadataNamespace")&&!i.isString(e.phpMetadataNamespace))return"phpMetadataNamespace: string expected";if(null!=e.rubyPackage&&e.hasOwnProperty("rubyPackage")&&!i.isString(e.rubyPackage))return"rubyPackage: string expected";if(null!=e.uninterpretedOption&&e.hasOwnProperty("uninterpretedOption")){if(!Array.isArray(e.uninterpretedOption))return"uninterpretedOption: array expected";for(var t=0;t<e.uninterpretedOption.length;++t){var n=p.google.protobuf.UninterpretedOption.verify(e.uninterpretedOption[t]);if(n)return"uninterpretedOption."+n}}return null},k.fromObject=function(e){if(e instanceof p.google.protobuf.FileOptions)return e;var t=new p.google.protobuf.FileOptions;switch(null!=e.javaPackage&&(t.javaPackage=String(e.javaPackage)),null!=e.javaOuterClassname&&(t.javaOuterClassname=String(e.javaOuterClassname)),null!=e.javaMultipleFiles&&(t.javaMultipleFiles=Boolean(e.javaMultipleFiles)),null!=e.javaGenerateEqualsAndHash&&(t.javaGenerateEqualsAndHash=Boolean(e.javaGenerateEqualsAndHash)),null!=e.javaStringCheckUtf8&&(t.javaStringCheckUtf8=Boolean(e.javaStringCheckUtf8)),e.optimizeFor){case"SPEED":case 1:t.optimizeFor=1;break;case"CODE_SIZE":case 2:t.optimizeFor=2;break;case"LITE_RUNTIME":case 3:t.optimizeFor=3}if(null!=e.goPackage&&(t.goPackage=String(e.goPackage)),null!=e.ccGenericServices&&(t.ccGenericServices=Boolean(e.ccGenericServices)),null!=e.javaGenericServices&&(t.javaGenericServices=Boolean(e.javaGenericServices)),null!=e.pyGenericServices&&(t.pyGenericServices=Boolean(e.pyGenericServices)),null!=e.phpGenericServices&&(t.phpGenericServices=Boolean(e.phpGenericServices)),null!=e.deprecated&&(t.deprecated=Boolean(e.deprecated)),null!=e.ccEnableArenas&&(t.ccEnableArenas=Boolean(e.ccEnableArenas)),null!=e.objcClassPrefix&&(t.objcClassPrefix=String(e.objcClassPrefix)),null!=e.csharpNamespace&&(t.csharpNamespace=String(e.csharpNamespace)),null!=e.swiftPrefix&&(t.swiftPrefix=String(e.swiftPrefix)),null!=e.phpClassPrefix&&(t.phpClassPrefix=String(e.phpClassPrefix)),null!=e.phpNamespace&&(t.phpNamespace=String(e.phpNamespace)),null!=e.phpMetadataNamespace&&(t.phpMetadataNamespace=String(e.phpMetadataNamespace)),null!=e.rubyPackage&&(t.rubyPackage=String(e.rubyPackage)),e.uninterpretedOption){if(!Array.isArray(e.uninterpretedOption))throw TypeError(".google.protobuf.FileOptions.uninterpretedOption: array expected");t.uninterpretedOption=[];for(var n=0;n<e.uninterpretedOption.length;++n){if("object"!=typeof e.uninterpretedOption[n])throw TypeError(".google.protobuf.FileOptions.uninterpretedOption: object expected");t.uninterpretedOption[n]=p.google.protobuf.UninterpretedOption.fromObject(e.uninterpretedOption[n])}}return t},k.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.uninterpretedOption=[]),t.defaults&&(n.javaPackage="",n.javaOuterClassname="",n.optimizeFor=t.enums===String?"SPEED":1,n.javaMultipleFiles=!1,n.goPackage="",n.ccGenericServices=!1,n.javaGenericServices=!1,n.pyGenericServices=!1,n.javaGenerateEqualsAndHash=!1,n.deprecated=!1,n.javaStringCheckUtf8=!1,n.ccEnableArenas=!0,n.objcClassPrefix="",n.csharpNamespace="",n.swiftPrefix="",n.phpClassPrefix="",n.phpNamespace="",n.phpGenericServices=!1,n.phpMetadataNamespace="",n.rubyPackage=""),null!=e.javaPackage&&e.hasOwnProperty("javaPackage")&&(n.javaPackage=e.javaPackage),null!=e.javaOuterClassname&&e.hasOwnProperty("javaOuterClassname")&&(n.javaOuterClassname=e.javaOuterClassname),null!=e.optimizeFor&&e.hasOwnProperty("optimizeFor")&&(n.optimizeFor=t.enums===String?p.google.protobuf.FileOptions.OptimizeMode[e.optimizeFor]:e.optimizeFor),null!=e.javaMultipleFiles&&e.hasOwnProperty("javaMultipleFiles")&&(n.javaMultipleFiles=e.javaMultipleFiles),null!=e.goPackage&&e.hasOwnProperty("goPackage")&&(n.goPackage=e.goPackage),null!=e.ccGenericServices&&e.hasOwnProperty("ccGenericServices")&&(n.ccGenericServices=e.ccGenericServices),null!=e.javaGenericServices&&e.hasOwnProperty("javaGenericServices")&&(n.javaGenericServices=e.javaGenericServices),null!=e.pyGenericServices&&e.hasOwnProperty("pyGenericServices")&&(n.pyGenericServices=e.pyGenericServices),null!=e.javaGenerateEqualsAndHash&&e.hasOwnProperty("javaGenerateEqualsAndHash")&&(n.javaGenerateEqualsAndHash=e.javaGenerateEqualsAndHash),null!=e.deprecated&&e.hasOwnProperty("deprecated")&&(n.deprecated=e.deprecated),null!=e.javaStringCheckUtf8&&e.hasOwnProperty("javaStringCheckUtf8")&&(n.javaStringCheckUtf8=e.javaStringCheckUtf8),null!=e.ccEnableArenas&&e.hasOwnProperty("ccEnableArenas")&&(n.ccEnableArenas=e.ccEnableArenas),null!=e.objcClassPrefix&&e.hasOwnProperty("objcClassPrefix")&&(n.objcClassPrefix=e.objcClassPrefix),null!=e.csharpNamespace&&e.hasOwnProperty("csharpNamespace")&&(n.csharpNamespace=e.csharpNamespace),null!=e.swiftPrefix&&e.hasOwnProperty("swiftPrefix")&&(n.swiftPrefix=e.swiftPrefix),null!=e.phpClassPrefix&&e.hasOwnProperty("phpClassPrefix")&&(n.phpClassPrefix=e.phpClassPrefix),null!=e.phpNamespace&&e.hasOwnProperty("phpNamespace")&&(n.phpNamespace=e.phpNamespace),null!=e.phpGenericServices&&e.hasOwnProperty("phpGenericServices")&&(n.phpGenericServices=e.phpGenericServices),null!=e.phpMetadataNamespace&&e.hasOwnProperty("phpMetadataNamespace")&&(n.phpMetadataNamespace=e.phpMetadataNamespace),null!=e.rubyPackage&&e.hasOwnProperty("rubyPackage")&&(n.rubyPackage=e.rubyPackage),e.uninterpretedOption&&e.uninterpretedOption.length){n.uninterpretedOption=[];for(var o=0;o<e.uninterpretedOption.length;++o)n.uninterpretedOption[o]=p.google.protobuf.UninterpretedOption.toObject(e.uninterpretedOption[o],t)}return n},k.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},k.OptimizeMode=(n={},(e=Object.create(n))[n[1]="SPEED"]=1,e[n[2]="CODE_SIZE"]=2,e[n[3]="LITE_RUNTIME"]=3,e),k),t.MessageOptions=(D.prototype.messageSetWireFormat=!1,D.prototype.noStandardDescriptorAccessor=!1,D.prototype.deprecated=!1,D.prototype.mapEntry=!1,D.prototype.uninterpretedOption=i.emptyArray,D.create=function(e){return new D(e)},D.encode=function(e,t){if(t=t||r.create(),null!=e.messageSetWireFormat&&Object.hasOwnProperty.call(e,"messageSetWireFormat")&&t.uint32(8).bool(e.messageSetWireFormat),null!=e.noStandardDescriptorAccessor&&Object.hasOwnProperty.call(e,"noStandardDescriptorAccessor")&&t.uint32(16).bool(e.noStandardDescriptorAccessor),null!=e.deprecated&&Object.hasOwnProperty.call(e,"deprecated")&&t.uint32(24).bool(e.deprecated),null!=e.mapEntry&&Object.hasOwnProperty.call(e,"mapEntry")&&t.uint32(56).bool(e.mapEntry),null!=e.uninterpretedOption&&e.uninterpretedOption.length)for(var n=0;n<e.uninterpretedOption.length;++n)p.google.protobuf.UninterpretedOption.encode(e.uninterpretedOption[n],t.uint32(7994).fork()).ldelim();return t},D.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},D.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.MessageOptions;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.messageSetWireFormat=e.bool();break;case 2:o.noStandardDescriptorAccessor=e.bool();break;case 3:o.deprecated=e.bool();break;case 7:o.mapEntry=e.bool();break;case 999:o.uninterpretedOption&&o.uninterpretedOption.length||(o.uninterpretedOption=[]),o.uninterpretedOption.push(p.google.protobuf.UninterpretedOption.decode(e,e.uint32()));break;default:e.skipType(7&r)}}return o},D.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},D.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.messageSetWireFormat&&e.hasOwnProperty("messageSetWireFormat")&&"boolean"!=typeof e.messageSetWireFormat)return"messageSetWireFormat: boolean expected";if(null!=e.noStandardDescriptorAccessor&&e.hasOwnProperty("noStandardDescriptorAccessor")&&"boolean"!=typeof e.noStandardDescriptorAccessor)return"noStandardDescriptorAccessor: boolean expected";if(null!=e.deprecated&&e.hasOwnProperty("deprecated")&&"boolean"!=typeof e.deprecated)return"deprecated: boolean expected";if(null!=e.mapEntry&&e.hasOwnProperty("mapEntry")&&"boolean"!=typeof e.mapEntry)return"mapEntry: boolean expected";if(null!=e.uninterpretedOption&&e.hasOwnProperty("uninterpretedOption")){if(!Array.isArray(e.uninterpretedOption))return"uninterpretedOption: array expected";for(var t=0;t<e.uninterpretedOption.length;++t){var n=p.google.protobuf.UninterpretedOption.verify(e.uninterpretedOption[t]);if(n)return"uninterpretedOption."+n}}return null},D.fromObject=function(e){if(e instanceof p.google.protobuf.MessageOptions)return e;var t=new p.google.protobuf.MessageOptions;if(null!=e.messageSetWireFormat&&(t.messageSetWireFormat=Boolean(e.messageSetWireFormat)),null!=e.noStandardDescriptorAccessor&&(t.noStandardDescriptorAccessor=Boolean(e.noStandardDescriptorAccessor)),null!=e.deprecated&&(t.deprecated=Boolean(e.deprecated)),null!=e.mapEntry&&(t.mapEntry=Boolean(e.mapEntry)),e.uninterpretedOption){if(!Array.isArray(e.uninterpretedOption))throw TypeError(".google.protobuf.MessageOptions.uninterpretedOption: array expected");t.uninterpretedOption=[];for(var n=0;n<e.uninterpretedOption.length;++n){if("object"!=typeof e.uninterpretedOption[n])throw TypeError(".google.protobuf.MessageOptions.uninterpretedOption: object expected");t.uninterpretedOption[n]=p.google.protobuf.UninterpretedOption.fromObject(e.uninterpretedOption[n])}}return t},D.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.uninterpretedOption=[]),t.defaults&&(n.messageSetWireFormat=!1,n.noStandardDescriptorAccessor=!1,n.deprecated=!1,n.mapEntry=!1),null!=e.messageSetWireFormat&&e.hasOwnProperty("messageSetWireFormat")&&(n.messageSetWireFormat=e.messageSetWireFormat),null!=e.noStandardDescriptorAccessor&&e.hasOwnProperty("noStandardDescriptorAccessor")&&(n.noStandardDescriptorAccessor=e.noStandardDescriptorAccessor),null!=e.deprecated&&e.hasOwnProperty("deprecated")&&(n.deprecated=e.deprecated),null!=e.mapEntry&&e.hasOwnProperty("mapEntry")&&(n.mapEntry=e.mapEntry),e.uninterpretedOption&&e.uninterpretedOption.length){n.uninterpretedOption=[];for(var o=0;o<e.uninterpretedOption.length;++o)n.uninterpretedOption[o]=p.google.protobuf.UninterpretedOption.toObject(e.uninterpretedOption[o],t)}return n},D.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},D),t.FieldOptions=(T.prototype.ctype=0,T.prototype.packed=!1,T.prototype.jstype=0,T.prototype.lazy=!1,T.prototype.deprecated=!1,T.prototype.weak=!1,T.prototype.uninterpretedOption=i.emptyArray,T.create=function(e){return new T(e)},T.encode=function(e,t){if(t=t||r.create(),null!=e.ctype&&Object.hasOwnProperty.call(e,"ctype")&&t.uint32(8).int32(e.ctype),null!=e.packed&&Object.hasOwnProperty.call(e,"packed")&&t.uint32(16).bool(e.packed),null!=e.deprecated&&Object.hasOwnProperty.call(e,"deprecated")&&t.uint32(24).bool(e.deprecated),null!=e.lazy&&Object.hasOwnProperty.call(e,"lazy")&&t.uint32(40).bool(e.lazy),null!=e.jstype&&Object.hasOwnProperty.call(e,"jstype")&&t.uint32(48).int32(e.jstype),null!=e.weak&&Object.hasOwnProperty.call(e,"weak")&&t.uint32(80).bool(e.weak),null!=e.uninterpretedOption&&e.uninterpretedOption.length)for(var n=0;n<e.uninterpretedOption.length;++n)p.google.protobuf.UninterpretedOption.encode(e.uninterpretedOption[n],t.uint32(7994).fork()).ldelim();return t},T.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},T.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.FieldOptions;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.ctype=e.int32();break;case 2:o.packed=e.bool();break;case 6:o.jstype=e.int32();break;case 5:o.lazy=e.bool();break;case 3:o.deprecated=e.bool();break;case 10:o.weak=e.bool();break;case 999:o.uninterpretedOption&&o.uninterpretedOption.length||(o.uninterpretedOption=[]),o.uninterpretedOption.push(p.google.protobuf.UninterpretedOption.decode(e,e.uint32()));break;default:e.skipType(7&r)}}return o},T.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},T.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.ctype&&e.hasOwnProperty("ctype"))switch(e.ctype){default:return"ctype: enum value expected";case 0:case 1:case 2:}if(null!=e.packed&&e.hasOwnProperty("packed")&&"boolean"!=typeof e.packed)return"packed: boolean expected";if(null!=e.jstype&&e.hasOwnProperty("jstype"))switch(e.jstype){default:return"jstype: enum value expected";case 0:case 1:case 2:}if(null!=e.lazy&&e.hasOwnProperty("lazy")&&"boolean"!=typeof e.lazy)return"lazy: boolean expected";if(null!=e.deprecated&&e.hasOwnProperty("deprecated")&&"boolean"!=typeof e.deprecated)return"deprecated: boolean expected";if(null!=e.weak&&e.hasOwnProperty("weak")&&"boolean"!=typeof e.weak)return"weak: boolean expected";if(null!=e.uninterpretedOption&&e.hasOwnProperty("uninterpretedOption")){if(!Array.isArray(e.uninterpretedOption))return"uninterpretedOption: array expected";for(var t=0;t<e.uninterpretedOption.length;++t){var n=p.google.protobuf.UninterpretedOption.verify(e.uninterpretedOption[t]);if(n)return"uninterpretedOption."+n}}return null},T.fromObject=function(e){if(e instanceof p.google.protobuf.FieldOptions)return e;var t=new p.google.protobuf.FieldOptions;switch(e.ctype){case"STRING":case 0:t.ctype=0;break;case"CORD":case 1:t.ctype=1;break;case"STRING_PIECE":case 2:t.ctype=2}switch(null!=e.packed&&(t.packed=Boolean(e.packed)),e.jstype){case"JS_NORMAL":case 0:t.jstype=0;break;case"JS_STRING":case 1:t.jstype=1;break;case"JS_NUMBER":case 2:t.jstype=2}if(null!=e.lazy&&(t.lazy=Boolean(e.lazy)),null!=e.deprecated&&(t.deprecated=Boolean(e.deprecated)),null!=e.weak&&(t.weak=Boolean(e.weak)),e.uninterpretedOption){if(!Array.isArray(e.uninterpretedOption))throw TypeError(".google.protobuf.FieldOptions.uninterpretedOption: array expected");t.uninterpretedOption=[];for(var n=0;n<e.uninterpretedOption.length;++n){if("object"!=typeof e.uninterpretedOption[n])throw TypeError(".google.protobuf.FieldOptions.uninterpretedOption: object expected");t.uninterpretedOption[n]=p.google.protobuf.UninterpretedOption.fromObject(e.uninterpretedOption[n])}}return t},T.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.uninterpretedOption=[]),t.defaults&&(n.ctype=t.enums===String?"STRING":0,n.packed=!1,n.deprecated=!1,n.lazy=!1,n.jstype=t.enums===String?"JS_NORMAL":0,n.weak=!1),null!=e.ctype&&e.hasOwnProperty("ctype")&&(n.ctype=t.enums===String?p.google.protobuf.FieldOptions.CType[e.ctype]:e.ctype),null!=e.packed&&e.hasOwnProperty("packed")&&(n.packed=e.packed),null!=e.deprecated&&e.hasOwnProperty("deprecated")&&(n.deprecated=e.deprecated),null!=e.lazy&&e.hasOwnProperty("lazy")&&(n.lazy=e.lazy),null!=e.jstype&&e.hasOwnProperty("jstype")&&(n.jstype=t.enums===String?p.google.protobuf.FieldOptions.JSType[e.jstype]:e.jstype),null!=e.weak&&e.hasOwnProperty("weak")&&(n.weak=e.weak),e.uninterpretedOption&&e.uninterpretedOption.length){n.uninterpretedOption=[];for(var o=0;o<e.uninterpretedOption.length;++o)n.uninterpretedOption[o]=p.google.protobuf.UninterpretedOption.toObject(e.uninterpretedOption[o],t)}return n},T.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},T.CType=(n={},(e=Object.create(n))[n[0]="STRING"]=0,e[n[1]="CORD"]=1,e[n[2]="STRING_PIECE"]=2,e),T.JSType=(n={},(e=Object.create(n))[n[0]="JS_NORMAL"]=0,e[n[1]="JS_STRING"]=1,e[n[2]="JS_NUMBER"]=2,e),T),t.OneofOptions=(H.prototype.uninterpretedOption=i.emptyArray,H.create=function(e){return new H(e)},H.encode=function(e,t){if(t=t||r.create(),null!=e.uninterpretedOption&&e.uninterpretedOption.length)for(var n=0;n<e.uninterpretedOption.length;++n)p.google.protobuf.UninterpretedOption.encode(e.uninterpretedOption[n],t.uint32(7994).fork()).ldelim();return t},H.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},H.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.OneofOptions;e.pos<n;){var r=e.uint32();r>>>3==999?(o.uninterpretedOption&&o.uninterpretedOption.length||(o.uninterpretedOption=[]),o.uninterpretedOption.push(p.google.protobuf.UninterpretedOption.decode(e,e.uint32()))):e.skipType(7&r)}return o},H.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},H.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.uninterpretedOption&&e.hasOwnProperty("uninterpretedOption")){if(!Array.isArray(e.uninterpretedOption))return"uninterpretedOption: array expected";for(var t=0;t<e.uninterpretedOption.length;++t){var n=p.google.protobuf.UninterpretedOption.verify(e.uninterpretedOption[t]);if(n)return"uninterpretedOption."+n}}return null},H.fromObject=function(e){if(e instanceof p.google.protobuf.OneofOptions)return e;var t=new p.google.protobuf.OneofOptions;if(e.uninterpretedOption){if(!Array.isArray(e.uninterpretedOption))throw TypeError(".google.protobuf.OneofOptions.uninterpretedOption: array expected");t.uninterpretedOption=[];for(var n=0;n<e.uninterpretedOption.length;++n){if("object"!=typeof e.uninterpretedOption[n])throw TypeError(".google.protobuf.OneofOptions.uninterpretedOption: object expected");t.uninterpretedOption[n]=p.google.protobuf.UninterpretedOption.fromObject(e.uninterpretedOption[n])}}return t},H.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.uninterpretedOption=[]),e.uninterpretedOption&&e.uninterpretedOption.length){n.uninterpretedOption=[];for(var o=0;o<e.uninterpretedOption.length;++o)n.uninterpretedOption[o]=p.google.protobuf.UninterpretedOption.toObject(e.uninterpretedOption[o],t)}return n},H.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},H),t.EnumOptions=(E.prototype.allowAlias=!1,E.prototype.deprecated=!1,E.prototype.uninterpretedOption=i.emptyArray,E.create=function(e){return new E(e)},E.encode=function(e,t){if(t=t||r.create(),null!=e.allowAlias&&Object.hasOwnProperty.call(e,"allowAlias")&&t.uint32(16).bool(e.allowAlias),null!=e.deprecated&&Object.hasOwnProperty.call(e,"deprecated")&&t.uint32(24).bool(e.deprecated),null!=e.uninterpretedOption&&e.uninterpretedOption.length)for(var n=0;n<e.uninterpretedOption.length;++n)p.google.protobuf.UninterpretedOption.encode(e.uninterpretedOption[n],t.uint32(7994).fork()).ldelim();return t},E.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},E.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.EnumOptions;e.pos<n;){var r=e.uint32();switch(r>>>3){case 2:o.allowAlias=e.bool();break;case 3:o.deprecated=e.bool();break;case 999:o.uninterpretedOption&&o.uninterpretedOption.length||(o.uninterpretedOption=[]),o.uninterpretedOption.push(p.google.protobuf.UninterpretedOption.decode(e,e.uint32()));break;default:e.skipType(7&r)}}return o},E.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},E.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.allowAlias&&e.hasOwnProperty("allowAlias")&&"boolean"!=typeof e.allowAlias)return"allowAlias: boolean expected";if(null!=e.deprecated&&e.hasOwnProperty("deprecated")&&"boolean"!=typeof e.deprecated)return"deprecated: boolean expected";if(null!=e.uninterpretedOption&&e.hasOwnProperty("uninterpretedOption")){if(!Array.isArray(e.uninterpretedOption))return"uninterpretedOption: array expected";for(var t=0;t<e.uninterpretedOption.length;++t){var n=p.google.protobuf.UninterpretedOption.verify(e.uninterpretedOption[t]);if(n)return"uninterpretedOption."+n}}return null},E.fromObject=function(e){if(e instanceof p.google.protobuf.EnumOptions)return e;var t=new p.google.protobuf.EnumOptions;if(null!=e.allowAlias&&(t.allowAlias=Boolean(e.allowAlias)),null!=e.deprecated&&(t.deprecated=Boolean(e.deprecated)),e.uninterpretedOption){if(!Array.isArray(e.uninterpretedOption))throw TypeError(".google.protobuf.EnumOptions.uninterpretedOption: array expected");t.uninterpretedOption=[];for(var n=0;n<e.uninterpretedOption.length;++n){if("object"!=typeof e.uninterpretedOption[n])throw TypeError(".google.protobuf.EnumOptions.uninterpretedOption: object expected");t.uninterpretedOption[n]=p.google.protobuf.UninterpretedOption.fromObject(e.uninterpretedOption[n])}}return t},E.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.uninterpretedOption=[]),t.defaults&&(n.allowAlias=!1,n.deprecated=!1),null!=e.allowAlias&&e.hasOwnProperty("allowAlias")&&(n.allowAlias=e.allowAlias),null!=e.deprecated&&e.hasOwnProperty("deprecated")&&(n.deprecated=e.deprecated),e.uninterpretedOption&&e.uninterpretedOption.length){n.uninterpretedOption=[];for(var o=0;o<e.uninterpretedOption.length;++o)n.uninterpretedOption[o]=p.google.protobuf.UninterpretedOption.toObject(e.uninterpretedOption[o],t)}return n},E.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},E),t.EnumValueOptions=(z.prototype.deprecated=!1,z.prototype.uninterpretedOption=i.emptyArray,z.create=function(e){return new z(e)},z.encode=function(e,t){if(t=t||r.create(),null!=e.deprecated&&Object.hasOwnProperty.call(e,"deprecated")&&t.uint32(8).bool(e.deprecated),null!=e.uninterpretedOption&&e.uninterpretedOption.length)for(var n=0;n<e.uninterpretedOption.length;++n)p.google.protobuf.UninterpretedOption.encode(e.uninterpretedOption[n],t.uint32(7994).fork()).ldelim();return t},z.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},z.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.EnumValueOptions;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.deprecated=e.bool();break;case 999:o.uninterpretedOption&&o.uninterpretedOption.length||(o.uninterpretedOption=[]),o.uninterpretedOption.push(p.google.protobuf.UninterpretedOption.decode(e,e.uint32()));break;default:e.skipType(7&r)}}return o},z.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},z.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.deprecated&&e.hasOwnProperty("deprecated")&&"boolean"!=typeof e.deprecated)return"deprecated: boolean expected";if(null!=e.uninterpretedOption&&e.hasOwnProperty("uninterpretedOption")){if(!Array.isArray(e.uninterpretedOption))return"uninterpretedOption: array expected";for(var t=0;t<e.uninterpretedOption.length;++t){var n=p.google.protobuf.UninterpretedOption.verify(e.uninterpretedOption[t]);if(n)return"uninterpretedOption."+n}}return null},z.fromObject=function(e){if(e instanceof p.google.protobuf.EnumValueOptions)return e;var t=new p.google.protobuf.EnumValueOptions;if(null!=e.deprecated&&(t.deprecated=Boolean(e.deprecated)),e.uninterpretedOption){if(!Array.isArray(e.uninterpretedOption))throw TypeError(".google.protobuf.EnumValueOptions.uninterpretedOption: array expected");t.uninterpretedOption=[];for(var n=0;n<e.uninterpretedOption.length;++n){if("object"!=typeof e.uninterpretedOption[n])throw TypeError(".google.protobuf.EnumValueOptions.uninterpretedOption: object expected");t.uninterpretedOption[n]=p.google.protobuf.UninterpretedOption.fromObject(e.uninterpretedOption[n])}}return t},z.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.uninterpretedOption=[]),t.defaults&&(n.deprecated=!1),null!=e.deprecated&&e.hasOwnProperty("deprecated")&&(n.deprecated=e.deprecated),e.uninterpretedOption&&e.uninterpretedOption.length){n.uninterpretedOption=[];for(var o=0;o<e.uninterpretedOption.length;++o)n.uninterpretedOption[o]=p.google.protobuf.UninterpretedOption.toObject(e.uninterpretedOption[o],t)}return n},z.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},z),t.ServiceOptions=(A.prototype.deprecated=!1,A.prototype.uninterpretedOption=i.emptyArray,A.prototype[".google.api.defaultHost"]="",A.prototype[".google.api.oauthScopes"]="",A.create=function(e){return new A(e)},A.encode=function(e,t){if(t=t||r.create(),null!=e.deprecated&&Object.hasOwnProperty.call(e,"deprecated")&&t.uint32(264).bool(e.deprecated),null!=e.uninterpretedOption&&e.uninterpretedOption.length)for(var n=0;n<e.uninterpretedOption.length;++n)p.google.protobuf.UninterpretedOption.encode(e.uninterpretedOption[n],t.uint32(7994).fork()).ldelim();return null!=e[".google.api.defaultHost"]&&Object.hasOwnProperty.call(e,".google.api.defaultHost")&&t.uint32(8394).string(e[".google.api.defaultHost"]),null!=e[".google.api.oauthScopes"]&&Object.hasOwnProperty.call(e,".google.api.oauthScopes")&&t.uint32(8402).string(e[".google.api.oauthScopes"]),t},A.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},A.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.ServiceOptions;e.pos<n;){var r=e.uint32();switch(r>>>3){case 33:o.deprecated=e.bool();break;case 999:o.uninterpretedOption&&o.uninterpretedOption.length||(o.uninterpretedOption=[]),o.uninterpretedOption.push(p.google.protobuf.UninterpretedOption.decode(e,e.uint32()));break;case 1049:o[".google.api.defaultHost"]=e.string();break;case 1050:o[".google.api.oauthScopes"]=e.string();break;default:e.skipType(7&r)}}return o},A.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},A.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.deprecated&&e.hasOwnProperty("deprecated")&&"boolean"!=typeof e.deprecated)return"deprecated: boolean expected";if(null!=e.uninterpretedOption&&e.hasOwnProperty("uninterpretedOption")){if(!Array.isArray(e.uninterpretedOption))return"uninterpretedOption: array expected";for(var t=0;t<e.uninterpretedOption.length;++t){var n=p.google.protobuf.UninterpretedOption.verify(e.uninterpretedOption[t]);if(n)return"uninterpretedOption."+n}}return null!=e[".google.api.defaultHost"]&&e.hasOwnProperty(".google.api.defaultHost")&&!i.isString(e[".google.api.defaultHost"])?".google.api.defaultHost: string expected":null!=e[".google.api.oauthScopes"]&&e.hasOwnProperty(".google.api.oauthScopes")&&!i.isString(e[".google.api.oauthScopes"])?".google.api.oauthScopes: string expected":null},A.fromObject=function(e){if(e instanceof p.google.protobuf.ServiceOptions)return e;var t=new p.google.protobuf.ServiceOptions;if(null!=e.deprecated&&(t.deprecated=Boolean(e.deprecated)),e.uninterpretedOption){if(!Array.isArray(e.uninterpretedOption))throw TypeError(".google.protobuf.ServiceOptions.uninterpretedOption: array expected");t.uninterpretedOption=[];for(var n=0;n<e.uninterpretedOption.length;++n){if("object"!=typeof e.uninterpretedOption[n])throw TypeError(".google.protobuf.ServiceOptions.uninterpretedOption: object expected");t.uninterpretedOption[n]=p.google.protobuf.UninterpretedOption.fromObject(e.uninterpretedOption[n])}}return null!=e[".google.api.defaultHost"]&&(t[".google.api.defaultHost"]=String(e[".google.api.defaultHost"])),null!=e[".google.api.oauthScopes"]&&(t[".google.api.oauthScopes"]=String(e[".google.api.oauthScopes"])),t},A.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.uninterpretedOption=[]),t.defaults&&(n.deprecated=!1,n[".google.api.defaultHost"]="",n[".google.api.oauthScopes"]=""),null!=e.deprecated&&e.hasOwnProperty("deprecated")&&(n.deprecated=e.deprecated),e.uninterpretedOption&&e.uninterpretedOption.length){n.uninterpretedOption=[];for(var o=0;o<e.uninterpretedOption.length;++o)n.uninterpretedOption[o]=p.google.protobuf.UninterpretedOption.toObject(e.uninterpretedOption[o],t)}return null!=e[".google.api.defaultHost"]&&e.hasOwnProperty(".google.api.defaultHost")&&(n[".google.api.defaultHost"]=e[".google.api.defaultHost"]),null!=e[".google.api.oauthScopes"]&&e.hasOwnProperty(".google.api.oauthScopes")&&(n[".google.api.oauthScopes"]=e[".google.api.oauthScopes"]),n},A.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},A),t.MethodOptions=(N.prototype.deprecated=!1,N.prototype.idempotencyLevel=0,N.prototype.uninterpretedOption=i.emptyArray,N.prototype[".google.longrunning.operationInfo"]=null,N.prototype[".google.api.http"]=null,N.prototype[".google.api.methodSignature"]=i.emptyArray,N.create=function(e){return new N(e)},N.encode=function(e,t){if(t=t||r.create(),null!=e.deprecated&&Object.hasOwnProperty.call(e,"deprecated")&&t.uint32(264).bool(e.deprecated),null!=e.idempotencyLevel&&Object.hasOwnProperty.call(e,"idempotencyLevel")&&t.uint32(272).int32(e.idempotencyLevel),null!=e.uninterpretedOption&&e.uninterpretedOption.length)for(var n=0;n<e.uninterpretedOption.length;++n)p.google.protobuf.UninterpretedOption.encode(e.uninterpretedOption[n],t.uint32(7994).fork()).ldelim();if(null!=e[".google.longrunning.operationInfo"]&&Object.hasOwnProperty.call(e,".google.longrunning.operationInfo")&&p.google.longrunning.OperationInfo.encode(e[".google.longrunning.operationInfo"],t.uint32(8394).fork()).ldelim(),null!=e[".google.api.methodSignature"]&&e[".google.api.methodSignature"].length)for(n=0;n<e[".google.api.methodSignature"].length;++n)t.uint32(8410).string(e[".google.api.methodSignature"][n]);return null!=e[".google.api.http"]&&Object.hasOwnProperty.call(e,".google.api.http")&&p.google.api.HttpRule.encode(e[".google.api.http"],t.uint32(578365826).fork()).ldelim(),t},N.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},N.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.MethodOptions;e.pos<n;){var r=e.uint32();switch(r>>>3){case 33:o.deprecated=e.bool();break;case 34:o.idempotencyLevel=e.int32();break;case 999:o.uninterpretedOption&&o.uninterpretedOption.length||(o.uninterpretedOption=[]),o.uninterpretedOption.push(p.google.protobuf.UninterpretedOption.decode(e,e.uint32()));break;case 1049:o[".google.longrunning.operationInfo"]=p.google.longrunning.OperationInfo.decode(e,e.uint32());break;case 72295728:o[".google.api.http"]=p.google.api.HttpRule.decode(e,e.uint32());break;case 1051:o[".google.api.methodSignature"]&&o[".google.api.methodSignature"].length||(o[".google.api.methodSignature"]=[]),o[".google.api.methodSignature"].push(e.string());break;default:e.skipType(7&r)}}return o},N.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},N.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.deprecated&&e.hasOwnProperty("deprecated")&&"boolean"!=typeof e.deprecated)return"deprecated: boolean expected";if(null!=e.idempotencyLevel&&e.hasOwnProperty("idempotencyLevel"))switch(e.idempotencyLevel){default:return"idempotencyLevel: enum value expected";case 0:case 1:case 2:}if(null!=e.uninterpretedOption&&e.hasOwnProperty("uninterpretedOption")){if(!Array.isArray(e.uninterpretedOption))return"uninterpretedOption: array expected";for(var t=0;t<e.uninterpretedOption.length;++t)if(n=p.google.protobuf.UninterpretedOption.verify(e.uninterpretedOption[t]))return"uninterpretedOption."+n}var n;if(null!=e[".google.longrunning.operationInfo"]&&e.hasOwnProperty(".google.longrunning.operationInfo")&&(n=p.google.longrunning.OperationInfo.verify(e[".google.longrunning.operationInfo"])))return".google.longrunning.operationInfo."+n;if(null!=e[".google.api.http"]&&e.hasOwnProperty(".google.api.http")&&(n=p.google.api.HttpRule.verify(e[".google.api.http"])))return".google.api.http."+n;if(null!=e[".google.api.methodSignature"]&&e.hasOwnProperty(".google.api.methodSignature")){if(!Array.isArray(e[".google.api.methodSignature"]))return".google.api.methodSignature: array expected";for(t=0;t<e[".google.api.methodSignature"].length;++t)if(!i.isString(e[".google.api.methodSignature"][t]))return".google.api.methodSignature: string[] expected"}return null},N.fromObject=function(e){if(e instanceof p.google.protobuf.MethodOptions)return e;var t=new p.google.protobuf.MethodOptions;switch(null!=e.deprecated&&(t.deprecated=Boolean(e.deprecated)),e.idempotencyLevel){case"IDEMPOTENCY_UNKNOWN":case 0:t.idempotencyLevel=0;break;case"NO_SIDE_EFFECTS":case 1:t.idempotencyLevel=1;break;case"IDEMPOTENT":case 2:t.idempotencyLevel=2}if(e.uninterpretedOption){if(!Array.isArray(e.uninterpretedOption))throw TypeError(".google.protobuf.MethodOptions.uninterpretedOption: array expected");t.uninterpretedOption=[];for(var n=0;n<e.uninterpretedOption.length;++n){if("object"!=typeof e.uninterpretedOption[n])throw TypeError(".google.protobuf.MethodOptions.uninterpretedOption: object expected");t.uninterpretedOption[n]=p.google.protobuf.UninterpretedOption.fromObject(e.uninterpretedOption[n])}}if(null!=e[".google.longrunning.operationInfo"]){if("object"!=typeof e[".google.longrunning.operationInfo"])throw TypeError(".google.protobuf.MethodOptions..google.longrunning.operationInfo: object expected");t[".google.longrunning.operationInfo"]=p.google.longrunning.OperationInfo.fromObject(e[".google.longrunning.operationInfo"])}if(null!=e[".google.api.http"]){if("object"!=typeof e[".google.api.http"])throw TypeError(".google.protobuf.MethodOptions..google.api.http: object expected");t[".google.api.http"]=p.google.api.HttpRule.fromObject(e[".google.api.http"])}if(e[".google.api.methodSignature"]){if(!Array.isArray(e[".google.api.methodSignature"]))throw TypeError(".google.protobuf.MethodOptions..google.api.methodSignature: array expected");t[".google.api.methodSignature"]=[];for(n=0;n<e[".google.api.methodSignature"].length;++n)t[".google.api.methodSignature"][n]=String(e[".google.api.methodSignature"][n])}return t},N.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.uninterpretedOption=[],n[".google.api.methodSignature"]=[]),t.defaults&&(n.deprecated=!1,n.idempotencyLevel=t.enums===String?"IDEMPOTENCY_UNKNOWN":0,n[".google.longrunning.operationInfo"]=null,n[".google.api.http"]=null),null!=e.deprecated&&e.hasOwnProperty("deprecated")&&(n.deprecated=e.deprecated),null!=e.idempotencyLevel&&e.hasOwnProperty("idempotencyLevel")&&(n.idempotencyLevel=t.enums===String?p.google.protobuf.MethodOptions.IdempotencyLevel[e.idempotencyLevel]:e.idempotencyLevel),e.uninterpretedOption&&e.uninterpretedOption.length){n.uninterpretedOption=[];for(var o=0;o<e.uninterpretedOption.length;++o)n.uninterpretedOption[o]=p.google.protobuf.UninterpretedOption.toObject(e.uninterpretedOption[o],t)}if(null!=e[".google.longrunning.operationInfo"]&&e.hasOwnProperty(".google.longrunning.operationInfo")&&(n[".google.longrunning.operationInfo"]=p.google.longrunning.OperationInfo.toObject(e[".google.longrunning.operationInfo"],t)),e[".google.api.methodSignature"]&&e[".google.api.methodSignature"].length){n[".google.api.methodSignature"]=[];for(o=0;o<e[".google.api.methodSignature"].length;++o)n[".google.api.methodSignature"][o]=e[".google.api.methodSignature"][o]}return null!=e[".google.api.http"]&&e.hasOwnProperty(".google.api.http")&&(n[".google.api.http"]=p.google.api.HttpRule.toObject(e[".google.api.http"],t)),n},N.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},N.IdempotencyLevel=(n={},(e=Object.create(n))[n[0]="IDEMPOTENCY_UNKNOWN"]=0,e[n[1]="NO_SIDE_EFFECTS"]=1,e[n[2]="IDEMPOTENT"]=2,e),N),t.UninterpretedOption=(I.prototype.name=i.emptyArray,I.prototype.identifierValue="",I.prototype.positiveIntValue=i.Long?i.Long.fromBits(0,0,!0):0,I.prototype.negativeIntValue=i.Long?i.Long.fromBits(0,0,!1):0,I.prototype.doubleValue=0,I.prototype.stringValue=i.newBuffer([]),I.prototype.aggregateValue="",I.create=function(e){return new I(e)},I.encode=function(e,t){if(t=t||r.create(),null!=e.name&&e.name.length)for(var n=0;n<e.name.length;++n)p.google.protobuf.UninterpretedOption.NamePart.encode(e.name[n],t.uint32(18).fork()).ldelim();return null!=e.identifierValue&&Object.hasOwnProperty.call(e,"identifierValue")&&t.uint32(26).string(e.identifierValue),null!=e.positiveIntValue&&Object.hasOwnProperty.call(e,"positiveIntValue")&&t.uint32(32).uint64(e.positiveIntValue),null!=e.negativeIntValue&&Object.hasOwnProperty.call(e,"negativeIntValue")&&t.uint32(40).int64(e.negativeIntValue),null!=e.doubleValue&&Object.hasOwnProperty.call(e,"doubleValue")&&t.uint32(49).double(e.doubleValue),null!=e.stringValue&&Object.hasOwnProperty.call(e,"stringValue")&&t.uint32(58).bytes(e.stringValue),null!=e.aggregateValue&&Object.hasOwnProperty.call(e,"aggregateValue")&&t.uint32(66).string(e.aggregateValue),t},I.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},I.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.UninterpretedOption;e.pos<n;){var r=e.uint32();switch(r>>>3){case 2:o.name&&o.name.length||(o.name=[]),o.name.push(p.google.protobuf.UninterpretedOption.NamePart.decode(e,e.uint32()));break;case 3:o.identifierValue=e.string();break;case 4:o.positiveIntValue=e.uint64();break;case 5:o.negativeIntValue=e.int64();break;case 6:o.doubleValue=e.double();break;case 7:o.stringValue=e.bytes();break;case 8:o.aggregateValue=e.string();break;default:e.skipType(7&r)}}return o},I.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},I.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.name&&e.hasOwnProperty("name")){if(!Array.isArray(e.name))return"name: array expected";for(var t=0;t<e.name.length;++t){var n=p.google.protobuf.UninterpretedOption.NamePart.verify(e.name[t]);if(n)return"name."+n}}return null!=e.identifierValue&&e.hasOwnProperty("identifierValue")&&!i.isString(e.identifierValue)?"identifierValue: string expected":null!=e.positiveIntValue&&e.hasOwnProperty("positiveIntValue")&&!(i.isInteger(e.positiveIntValue)||e.positiveIntValue&&i.isInteger(e.positiveIntValue.low)&&i.isInteger(e.positiveIntValue.high))?"positiveIntValue: integer|Long expected":null!=e.negativeIntValue&&e.hasOwnProperty("negativeIntValue")&&!(i.isInteger(e.negativeIntValue)||e.negativeIntValue&&i.isInteger(e.negativeIntValue.low)&&i.isInteger(e.negativeIntValue.high))?"negativeIntValue: integer|Long expected":null!=e.doubleValue&&e.hasOwnProperty("doubleValue")&&"number"!=typeof e.doubleValue?"doubleValue: number expected":null!=e.stringValue&&e.hasOwnProperty("stringValue")&&!(e.stringValue&&"number"==typeof e.stringValue.length||i.isString(e.stringValue))?"stringValue: buffer expected":null!=e.aggregateValue&&e.hasOwnProperty("aggregateValue")&&!i.isString(e.aggregateValue)?"aggregateValue: string expected":null},I.fromObject=function(e){if(e instanceof p.google.protobuf.UninterpretedOption)return e;var t=new p.google.protobuf.UninterpretedOption;if(e.name){if(!Array.isArray(e.name))throw TypeError(".google.protobuf.UninterpretedOption.name: array expected");t.name=[];for(var n=0;n<e.name.length;++n){if("object"!=typeof e.name[n])throw TypeError(".google.protobuf.UninterpretedOption.name: object expected");t.name[n]=p.google.protobuf.UninterpretedOption.NamePart.fromObject(e.name[n])}}return null!=e.identifierValue&&(t.identifierValue=String(e.identifierValue)),null!=e.positiveIntValue&&(i.Long?(t.positiveIntValue=i.Long.fromValue(e.positiveIntValue)).unsigned=!0:"string"==typeof e.positiveIntValue?t.positiveIntValue=parseInt(e.positiveIntValue,10):"number"==typeof e.positiveIntValue?t.positiveIntValue=e.positiveIntValue:"object"==typeof e.positiveIntValue&&(t.positiveIntValue=new i.LongBits(e.positiveIntValue.low>>>0,e.positiveIntValue.high>>>0).toNumber(!0))),null!=e.negativeIntValue&&(i.Long?(t.negativeIntValue=i.Long.fromValue(e.negativeIntValue)).unsigned=!1:"string"==typeof e.negativeIntValue?t.negativeIntValue=parseInt(e.negativeIntValue,10):"number"==typeof e.negativeIntValue?t.negativeIntValue=e.negativeIntValue:"object"==typeof e.negativeIntValue&&(t.negativeIntValue=new i.LongBits(e.negativeIntValue.low>>>0,e.negativeIntValue.high>>>0).toNumber())),null!=e.doubleValue&&(t.doubleValue=Number(e.doubleValue)),null!=e.stringValue&&("string"==typeof e.stringValue?i.base64.decode(e.stringValue,t.stringValue=i.newBuffer(i.base64.length(e.stringValue)),0):e.stringValue.length&&(t.stringValue=e.stringValue)),null!=e.aggregateValue&&(t.aggregateValue=String(e.aggregateValue)),t},I.toObject=function(e,t){var n,o={};if(((t=t||{}).arrays||t.defaults)&&(o.name=[]),t.defaults&&(o.identifierValue="",i.Long?(n=new i.Long(0,0,!0),o.positiveIntValue=t.longs===String?n.toString():t.longs===Number?n.toNumber():n):o.positiveIntValue=t.longs===String?"0":0,i.Long?(n=new i.Long(0,0,!1),o.negativeIntValue=t.longs===String?n.toString():t.longs===Number?n.toNumber():n):o.negativeIntValue=t.longs===String?"0":0,o.doubleValue=0,t.bytes===String?o.stringValue="":(o.stringValue=[],t.bytes!==Array&&(o.stringValue=i.newBuffer(o.stringValue))),o.aggregateValue=""),e.name&&e.name.length){o.name=[];for(var r=0;r<e.name.length;++r)o.name[r]=p.google.protobuf.UninterpretedOption.NamePart.toObject(e.name[r],t)}return null!=e.identifierValue&&e.hasOwnProperty("identifierValue")&&(o.identifierValue=e.identifierValue),null!=e.positiveIntValue&&e.hasOwnProperty("positiveIntValue")&&("number"==typeof e.positiveIntValue?o.positiveIntValue=t.longs===String?String(e.positiveIntValue):e.positiveIntValue:o.positiveIntValue=t.longs===String?i.Long.prototype.toString.call(e.positiveIntValue):t.longs===Number?new i.LongBits(e.positiveIntValue.low>>>0,e.positiveIntValue.high>>>0).toNumber(!0):e.positiveIntValue),null!=e.negativeIntValue&&e.hasOwnProperty("negativeIntValue")&&("number"==typeof e.negativeIntValue?o.negativeIntValue=t.longs===String?String(e.negativeIntValue):e.negativeIntValue:o.negativeIntValue=t.longs===String?i.Long.prototype.toString.call(e.negativeIntValue):t.longs===Number?new i.LongBits(e.negativeIntValue.low>>>0,e.negativeIntValue.high>>>0).toNumber():e.negativeIntValue),null!=e.doubleValue&&e.hasOwnProperty("doubleValue")&&(o.doubleValue=t.json&&!isFinite(e.doubleValue)?String(e.doubleValue):e.doubleValue),null!=e.stringValue&&e.hasOwnProperty("stringValue")&&(o.stringValue=t.bytes===String?i.base64.encode(e.stringValue,0,e.stringValue.length):t.bytes===Array?Array.prototype.slice.call(e.stringValue):e.stringValue),null!=e.aggregateValue&&e.hasOwnProperty("aggregateValue")&&(o.aggregateValue=e.aggregateValue),o},I.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},I.NamePart=(q.prototype.namePart="",q.prototype.isExtension=!1,q.create=function(e){return new q(e)},q.encode=function(e,t){return(t=t||r.create()).uint32(10).string(e.namePart),t.uint32(16).bool(e.isExtension),t},q.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},q.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.UninterpretedOption.NamePart;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.namePart=e.string();break;case 2:o.isExtension=e.bool();break;default:e.skipType(7&r)}}if(!o.hasOwnProperty("namePart"))throw i.ProtocolError("missing required 'namePart'",{instance:o});if(o.hasOwnProperty("isExtension"))return o;throw i.ProtocolError("missing required 'isExtension'",{instance:o})},q.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},q.verify=function(e){return"object"!=typeof e||null===e?"object expected":i.isString(e.namePart)?"boolean"!=typeof e.isExtension?"isExtension: boolean expected":null:"namePart: string expected"},q.fromObject=function(e){var t;return e instanceof p.google.protobuf.UninterpretedOption.NamePart?e:(t=new p.google.protobuf.UninterpretedOption.NamePart,null!=e.namePart&&(t.namePart=String(e.namePart)),null!=e.isExtension&&(t.isExtension=Boolean(e.isExtension)),t)},q.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.namePart="",n.isExtension=!1),null!=e.namePart&&e.hasOwnProperty("namePart")&&(n.namePart=e.namePart),null!=e.isExtension&&e.hasOwnProperty("isExtension")&&(n.isExtension=e.isExtension),n},q.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},q),I),t.SourceCodeInfo=(Y.prototype.location=i.emptyArray,Y.create=function(e){return new Y(e)},Y.encode=function(e,t){if(t=t||r.create(),null!=e.location&&e.location.length)for(var n=0;n<e.location.length;++n)p.google.protobuf.SourceCodeInfo.Location.encode(e.location[n],t.uint32(10).fork()).ldelim();return t},Y.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},Y.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.SourceCodeInfo;e.pos<n;){var r=e.uint32();r>>>3==1?(o.location&&o.location.length||(o.location=[]),o.location.push(p.google.protobuf.SourceCodeInfo.Location.decode(e,e.uint32()))):e.skipType(7&r)}return o},Y.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},Y.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.location&&e.hasOwnProperty("location")){if(!Array.isArray(e.location))return"location: array expected";for(var t=0;t<e.location.length;++t){var n=p.google.protobuf.SourceCodeInfo.Location.verify(e.location[t]);if(n)return"location."+n}}return null},Y.fromObject=function(e){if(e instanceof p.google.protobuf.SourceCodeInfo)return e;var t=new p.google.protobuf.SourceCodeInfo;if(e.location){if(!Array.isArray(e.location))throw TypeError(".google.protobuf.SourceCodeInfo.location: array expected");t.location=[];for(var n=0;n<e.location.length;++n){if("object"!=typeof e.location[n])throw TypeError(".google.protobuf.SourceCodeInfo.location: object expected");t.location[n]=p.google.protobuf.SourceCodeInfo.Location.fromObject(e.location[n])}}return t},Y.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.location=[]),e.location&&e.location.length){n.location=[];for(var o=0;o<e.location.length;++o)n.location[o]=p.google.protobuf.SourceCodeInfo.Location.toObject(e.location[o],t)}return n},Y.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},Y.Location=(R.prototype.path=i.emptyArray,R.prototype.span=i.emptyArray,R.prototype.leadingComments="",R.prototype.trailingComments="",R.prototype.leadingDetachedComments=i.emptyArray,R.create=function(e){return new R(e)},R.encode=function(e,t){if(t=t||r.create(),null!=e.path&&e.path.length){t.uint32(10).fork();for(var n=0;n<e.path.length;++n)t.int32(e.path[n]);t.ldelim()}if(null!=e.span&&e.span.length){t.uint32(18).fork();for(n=0;n<e.span.length;++n)t.int32(e.span[n]);t.ldelim()}if(null!=e.leadingComments&&Object.hasOwnProperty.call(e,"leadingComments")&&t.uint32(26).string(e.leadingComments),null!=e.trailingComments&&Object.hasOwnProperty.call(e,"trailingComments")&&t.uint32(34).string(e.trailingComments),null!=e.leadingDetachedComments&&e.leadingDetachedComments.length)for(n=0;n<e.leadingDetachedComments.length;++n)t.uint32(50).string(e.leadingDetachedComments[n]);return t},R.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},R.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.SourceCodeInfo.Location;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:if(o.path&&o.path.length||(o.path=[]),2==(7&r))for(var i=e.uint32()+e.pos;e.pos<i;)o.path.push(e.int32());else o.path.push(e.int32());break;case 2:if(o.span&&o.span.length||(o.span=[]),2==(7&r))for(i=e.uint32()+e.pos;e.pos<i;)o.span.push(e.int32());else o.span.push(e.int32());break;case 3:o.leadingComments=e.string();break;case 4:o.trailingComments=e.string();break;case 6:o.leadingDetachedComments&&o.leadingDetachedComments.length||(o.leadingDetachedComments=[]),o.leadingDetachedComments.push(e.string());break;default:e.skipType(7&r)}}return o},R.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},R.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.path&&e.hasOwnProperty("path")){if(!Array.isArray(e.path))return"path: array expected";for(var t=0;t<e.path.length;++t)if(!i.isInteger(e.path[t]))return"path: integer[] expected"}if(null!=e.span&&e.hasOwnProperty("span")){if(!Array.isArray(e.span))return"span: array expected";for(t=0;t<e.span.length;++t)if(!i.isInteger(e.span[t]))return"span: integer[] expected"}if(null!=e.leadingComments&&e.hasOwnProperty("leadingComments")&&!i.isString(e.leadingComments))return"leadingComments: string expected";if(null!=e.trailingComments&&e.hasOwnProperty("trailingComments")&&!i.isString(e.trailingComments))return"trailingComments: string expected";if(null!=e.leadingDetachedComments&&e.hasOwnProperty("leadingDetachedComments")){if(!Array.isArray(e.leadingDetachedComments))return"leadingDetachedComments: array expected";for(t=0;t<e.leadingDetachedComments.length;++t)if(!i.isString(e.leadingDetachedComments[t]))return"leadingDetachedComments: string[] expected"}return null},R.fromObject=function(e){if(e instanceof p.google.protobuf.SourceCodeInfo.Location)return e;var t=new p.google.protobuf.SourceCodeInfo.Location;if(e.path){if(!Array.isArray(e.path))throw TypeError(".google.protobuf.SourceCodeInfo.Location.path: array expected");t.path=[];for(var n=0;n<e.path.length;++n)t.path[n]=0|e.path[n]}if(e.span){if(!Array.isArray(e.span))throw TypeError(".google.protobuf.SourceCodeInfo.Location.span: array expected");t.span=[];for(n=0;n<e.span.length;++n)t.span[n]=0|e.span[n]}if(null!=e.leadingComments&&(t.leadingComments=String(e.leadingComments)),null!=e.trailingComments&&(t.trailingComments=String(e.trailingComments)),e.leadingDetachedComments){if(!Array.isArray(e.leadingDetachedComments))throw TypeError(".google.protobuf.SourceCodeInfo.Location.leadingDetachedComments: array expected");t.leadingDetachedComments=[];for(n=0;n<e.leadingDetachedComments.length;++n)t.leadingDetachedComments[n]=String(e.leadingDetachedComments[n])}return t},R.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.path=[],n.span=[],n.leadingDetachedComments=[]),t.defaults&&(n.leadingComments="",n.trailingComments=""),e.path&&e.path.length){n.path=[];for(var o=0;o<e.path.length;++o)n.path[o]=e.path[o]}if(e.span&&e.span.length){n.span=[];for(o=0;o<e.span.length;++o)n.span[o]=e.span[o]}if(null!=e.leadingComments&&e.hasOwnProperty("leadingComments")&&(n.leadingComments=e.leadingComments),null!=e.trailingComments&&e.hasOwnProperty("trailingComments")&&(n.trailingComments=e.trailingComments),e.leadingDetachedComments&&e.leadingDetachedComments.length){n.leadingDetachedComments=[];for(o=0;o<e.leadingDetachedComments.length;++o)n.leadingDetachedComments[o]=e.leadingDetachedComments[o]}return n},R.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},R),Y),t.GeneratedCodeInfo=(W.prototype.annotation=i.emptyArray,W.create=function(e){return new W(e)},W.encode=function(e,t){if(t=t||r.create(),null!=e.annotation&&e.annotation.length)for(var n=0;n<e.annotation.length;++n)p.google.protobuf.GeneratedCodeInfo.Annotation.encode(e.annotation[n],t.uint32(10).fork()).ldelim();return t},W.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},W.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.GeneratedCodeInfo;e.pos<n;){var r=e.uint32();r>>>3==1?(o.annotation&&o.annotation.length||(o.annotation=[]),o.annotation.push(p.google.protobuf.GeneratedCodeInfo.Annotation.decode(e,e.uint32()))):e.skipType(7&r)}return o},W.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},W.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.annotation&&e.hasOwnProperty("annotation")){if(!Array.isArray(e.annotation))return"annotation: array expected";for(var t=0;t<e.annotation.length;++t){var n=p.google.protobuf.GeneratedCodeInfo.Annotation.verify(e.annotation[t]);if(n)return"annotation."+n}}return null},W.fromObject=function(e){if(e instanceof p.google.protobuf.GeneratedCodeInfo)return e;var t=new p.google.protobuf.GeneratedCodeInfo;if(e.annotation){if(!Array.isArray(e.annotation))throw TypeError(".google.protobuf.GeneratedCodeInfo.annotation: array expected");t.annotation=[];for(var n=0;n<e.annotation.length;++n){if("object"!=typeof e.annotation[n])throw TypeError(".google.protobuf.GeneratedCodeInfo.annotation: object expected");t.annotation[n]=p.google.protobuf.GeneratedCodeInfo.Annotation.fromObject(e.annotation[n])}}return t},W.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.annotation=[]),e.annotation&&e.annotation.length){n.annotation=[];for(var o=0;o<e.annotation.length;++o)n.annotation[o]=p.google.protobuf.GeneratedCodeInfo.Annotation.toObject(e.annotation[o],t)}return n},W.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},W.Annotation=(C.prototype.path=i.emptyArray,C.prototype.sourceFile="",C.prototype.begin=0,C.prototype.end=0,C.create=function(e){return new C(e)},C.encode=function(e,t){if(t=t||r.create(),null!=e.path&&e.path.length){t.uint32(10).fork();for(var n=0;n<e.path.length;++n)t.int32(e.path[n]);t.ldelim()}return null!=e.sourceFile&&Object.hasOwnProperty.call(e,"sourceFile")&&t.uint32(18).string(e.sourceFile),null!=e.begin&&Object.hasOwnProperty.call(e,"begin")&&t.uint32(24).int32(e.begin),null!=e.end&&Object.hasOwnProperty.call(e,"end")&&t.uint32(32).int32(e.end),t},C.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},C.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.GeneratedCodeInfo.Annotation;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:if(o.path&&o.path.length||(o.path=[]),2==(7&r))for(var i=e.uint32()+e.pos;e.pos<i;)o.path.push(e.int32());else o.path.push(e.int32());break;case 2:o.sourceFile=e.string();break;case 3:o.begin=e.int32();break;case 4:o.end=e.int32();break;default:e.skipType(7&r)}}return o},C.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},C.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.path&&e.hasOwnProperty("path")){if(!Array.isArray(e.path))return"path: array expected";for(var t=0;t<e.path.length;++t)if(!i.isInteger(e.path[t]))return"path: integer[] expected"}return null!=e.sourceFile&&e.hasOwnProperty("sourceFile")&&!i.isString(e.sourceFile)?"sourceFile: string expected":null!=e.begin&&e.hasOwnProperty("begin")&&!i.isInteger(e.begin)?"begin: integer expected":null!=e.end&&e.hasOwnProperty("end")&&!i.isInteger(e.end)?"end: integer expected":null},C.fromObject=function(e){if(e instanceof p.google.protobuf.GeneratedCodeInfo.Annotation)return e;var t=new p.google.protobuf.GeneratedCodeInfo.Annotation;if(e.path){if(!Array.isArray(e.path))throw TypeError(".google.protobuf.GeneratedCodeInfo.Annotation.path: array expected");t.path=[];for(var n=0;n<e.path.length;++n)t.path[n]=0|e.path[n]}return null!=e.sourceFile&&(t.sourceFile=String(e.sourceFile)),null!=e.begin&&(t.begin=0|e.begin),null!=e.end&&(t.end=0|e.end),t},C.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.path=[]),t.defaults&&(n.sourceFile="",n.begin=0,n.end=0),e.path&&e.path.length){n.path=[];for(var o=0;o<e.path.length;++o)n.path[o]=e.path[o]}return null!=e.sourceFile&&e.hasOwnProperty("sourceFile")&&(n.sourceFile=e.sourceFile),null!=e.begin&&e.hasOwnProperty("begin")&&(n.begin=e.begin),null!=e.end&&e.hasOwnProperty("end")&&(n.end=e.end),n},C.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},C),W),t.Any=(X.prototype.type_url="",X.prototype.value=i.newBuffer([]),X.create=function(e){return new X(e)},X.encode=function(e,t){return t=t||r.create(),null!=e.type_url&&Object.hasOwnProperty.call(e,"type_url")&&t.uint32(10).string(e.type_url),null!=e.value&&Object.hasOwnProperty.call(e,"value")&&t.uint32(18).bytes(e.value),t},X.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},X.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.Any;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.type_url=e.string();break;case 2:o.value=e.bytes();break;default:e.skipType(7&r)}}return o},X.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},X.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.type_url&&e.hasOwnProperty("type_url")&&!i.isString(e.type_url)?"type_url: string expected":null!=e.value&&e.hasOwnProperty("value")&&!(e.value&&"number"==typeof e.value.length||i.isString(e.value))?"value: buffer expected":null},X.fromObject=function(e){var t;return e instanceof p.google.protobuf.Any?e:(t=new p.google.protobuf.Any,null!=e.type_url&&(t.type_url=String(e.type_url)),null!=e.value&&("string"==typeof e.value?i.base64.decode(e.value,t.value=i.newBuffer(i.base64.length(e.value)),0):e.value.length&&(t.value=e.value)),t)},X.toObject=function(e,t){var n={};return(t=t||{}).defaults&&(n.type_url="",t.bytes===String?n.value="":(n.value=[],t.bytes!==Array&&(n.value=i.newBuffer(n.value)))),null!=e.type_url&&e.hasOwnProperty("type_url")&&(n.type_url=e.type_url),null!=e.value&&e.hasOwnProperty("value")&&(n.value=t.bytes===String?i.base64.encode(e.value,0,e.value.length):t.bytes===Array?Array.prototype.slice.call(e.value):e.value),n},X.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},X),t.Duration=(K.prototype.seconds=i.Long?i.Long.fromBits(0,0,!1):0,K.prototype.nanos=0,K.create=function(e){return new K(e)},K.encode=function(e,t){return t=t||r.create(),null!=e.seconds&&Object.hasOwnProperty.call(e,"seconds")&&t.uint32(8).int64(e.seconds),null!=e.nanos&&Object.hasOwnProperty.call(e,"nanos")&&t.uint32(16).int32(e.nanos),t},K.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},K.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.protobuf.Duration;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.seconds=e.int64();break;case 2:o.nanos=e.int32();break;default:e.skipType(7&r)}}return o},K.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},K.verify=function(e){return"object"!=typeof e||null===e?"object expected":null!=e.seconds&&e.hasOwnProperty("seconds")&&!(i.isInteger(e.seconds)||e.seconds&&i.isInteger(e.seconds.low)&&i.isInteger(e.seconds.high))?"seconds: integer|Long expected":null!=e.nanos&&e.hasOwnProperty("nanos")&&!i.isInteger(e.nanos)?"nanos: integer expected":null},K.fromObject=function(e){var t;return e instanceof p.google.protobuf.Duration?e:(t=new p.google.protobuf.Duration,null!=e.seconds&&(i.Long?(t.seconds=i.Long.fromValue(e.seconds)).unsigned=!1:"string"==typeof e.seconds?t.seconds=parseInt(e.seconds,10):"number"==typeof e.seconds?t.seconds=e.seconds:"object"==typeof e.seconds&&(t.seconds=new i.LongBits(e.seconds.low>>>0,e.seconds.high>>>0).toNumber())),null!=e.nanos&&(t.nanos=0|e.nanos),t)},K.toObject=function(e,t){var n,o={};return(t=t||{}).defaults&&(i.Long?(n=new i.Long(0,0,!1),o.seconds=t.longs===String?n.toString():t.longs===Number?n.toNumber():n):o.seconds=t.longs===String?"0":0,o.nanos=0),null!=e.seconds&&e.hasOwnProperty("seconds")&&("number"==typeof e.seconds?o.seconds=t.longs===String?String(e.seconds):e.seconds:o.seconds=t.longs===String?i.Long.prototype.toString.call(e.seconds):t.longs===Number?new i.LongBits(e.seconds.low>>>0,e.seconds.high>>>0).toNumber():e.seconds),null!=e.nanos&&e.hasOwnProperty("nanos")&&(o.nanos=e.nanos),o},K.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},K),t.Empty=(Q.create=function(e){return new Q(e)},Q.encode=function(e,t){return t=t||r.create()},Q.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},Q.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,t=new p.google.protobuf.Empty;e.pos<n;){var o=e.uint32();e.skipType(7&o)}return t},Q.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},Q.verify=function(e){return"object"!=typeof e||null===e?"object expected":null},Q.fromObject=function(e){return e instanceof p.google.protobuf.Empty?e:new p.google.protobuf.Empty},Q.toObject=function(){return{}},Q.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},Q),t),F.rpc=((n={}).Status=(V.prototype.code=0,V.prototype.message="",V.prototype.details=i.emptyArray,V.create=function(e){return new V(e)},V.encode=function(e,t){if(t=t||r.create(),null!=e.code&&Object.hasOwnProperty.call(e,"code")&&t.uint32(8).int32(e.code),null!=e.message&&Object.hasOwnProperty.call(e,"message")&&t.uint32(18).string(e.message),null!=e.details&&e.details.length)for(var n=0;n<e.details.length;++n)p.google.protobuf.Any.encode(e.details[n],t.uint32(26).fork()).ldelim();return t},V.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},V.decode=function(e,t){e instanceof a||(e=a.create(e));for(var n=void 0===t?e.len:e.pos+t,o=new p.google.rpc.Status;e.pos<n;){var r=e.uint32();switch(r>>>3){case 1:o.code=e.int32();break;case 2:o.message=e.string();break;case 3:o.details&&o.details.length||(o.details=[]),o.details.push(p.google.protobuf.Any.decode(e,e.uint32()));break;default:e.skipType(7&r)}}return o},V.decodeDelimited=function(e){return e instanceof a||(e=new a(e)),this.decode(e,e.uint32())},V.verify=function(e){if("object"!=typeof e||null===e)return"object expected";if(null!=e.code&&e.hasOwnProperty("code")&&!i.isInteger(e.code))return"code: integer expected";if(null!=e.message&&e.hasOwnProperty("message")&&!i.isString(e.message))return"message: string expected";if(null!=e.details&&e.hasOwnProperty("details")){if(!Array.isArray(e.details))return"details: array expected";for(var t=0;t<e.details.length;++t){var n=p.google.protobuf.Any.verify(e.details[t]);if(n)return"details."+n}}return null},V.fromObject=function(e){if(e instanceof p.google.rpc.Status)return e;var t=new p.google.rpc.Status;if(null!=e.code&&(t.code=0|e.code),null!=e.message&&(t.message=String(e.message)),e.details){if(!Array.isArray(e.details))throw TypeError(".google.rpc.Status.details: array expected");t.details=[];for(var n=0;n<e.details.length;++n){if("object"!=typeof e.details[n])throw TypeError(".google.rpc.Status.details: object expected");t.details[n]=p.google.protobuf.Any.fromObject(e.details[n])}}return t},V.toObject=function(e,t){var n={};if(((t=t||{}).arrays||t.defaults)&&(n.details=[]),t.defaults&&(n.code=0,n.message=""),null!=e.code&&e.hasOwnProperty("code")&&(n.code=e.code),null!=e.message&&e.hasOwnProperty("message")&&(n.message=e.message),e.details&&e.details.length){n.details=[];for(var o=0;o<e.details.length;++o)n.details[o]=p.google.protobuf.Any.toObject(e.details[o],t)}return n},V.prototype.toJSON=function(){return this.constructor.toObject(this,o.util.toJSONOptions)},V),n),F),p});

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
/******/ 	var __webpack_exports__ = __nccwpck_require__(81);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;