// Aliyun OSS SDK for JavaScript v6.9.5
// Copyright Aliyun.com, Inc. or its affiliates. All Rights Reserved.
// License at https://github.com/ali-sdk/ali-oss/blob/master/LICENSE
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.OSS = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports._createStream = void 0;
var stream_1 = require("stream");
var isBlob_1 = require("../../common/utils/isBlob");
var isFile_1 = require("../../common/utils/isFile");
var webFileReadStream_1 = require("../../common/utils/webFileReadStream");
var isBuffer_1 = require("../../common/utils/isBuffer");
function _createStream(file, start, end) {
    if (isBlob_1.isBlob(file) || isFile_1.isFile(file)) {
        return new webFileReadStream_1.WebFileReadStream(file.slice(start, end));
    } else if (isBuffer_1.isBuffer(file)) {
        // we can't use Readable.from() since it is only support in Node v10
        var iterable = file.subarray(start, end);
        return new stream_1.Readable({
            read: function read() {
                this.push(iterable);
                this.push(null);
            }
        });
    }
    throw new Error('_createStream requires File/Blob/Buffer.');
}
exports._createStream = _createStream;

},{"../../common/utils/isBlob":138,"../../common/utils/isBuffer":139,"../../common/utils/isFile":140,"../../common/utils/webFileReadStream":150,"stream":338}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var _createStream_1 = require("./_createStream");
exports.default = {
    _createStream: _createStream_1._createStream
};

},{"./_createStream":1}],3:[function(require,module,exports){
"use strict";

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var buffer_1 = require("buffer");
var setConfig_1 = require("../setConfig");
var version_1 = require("./version");
var object_1 = __importDefault(require("../common/object"));
var multipart_1 = __importDefault(require("../common/multipart"));
var utils_1 = __importDefault(require("../common/utils"));
var image_1 = __importDefault(require("../common/image"));
var bucket_1 = __importDefault(require("../common/bucket"));
var client_1 = __importDefault(require("../common/client"));
var object_2 = __importDefault(require("./object"));
var client_2 = __importDefault(require("./client"));
var multipart_2 = __importDefault(require("./multipart"));
function initClientProto(protos) {
    (0, _keys2.default)(protos).forEach(function (prop) {
        setConfig_1.Client.prototype[prop] = protos[prop];
    });
}
var OSS = setConfig_1.Client;
OSS.urllib = require('../../shims/xhr');
OSS.version = version_1.version;
OSS.Buffer = buffer_1.Buffer;
initClientProto(object_1.default);
initClientProto(multipart_1.default);
initClientProto(utils_1.default);
initClientProto(image_1.default);
initClientProto(bucket_1.default);
initClientProto(client_1.default);
initClientProto(object_2.default);
initClientProto(client_2.default);
initClientProto(multipart_2.default);
module.exports = OSS;

},{"../../shims/xhr":354,"../common/bucket":37,"../common/client":61,"../common/image":70,"../common/multipart":75,"../common/object":99,"../common/utils":136,"../setConfig":152,"./client":2,"./multipart":4,"./object":6,"./version":10,"babel-runtime/core-js/object/keys":161,"buffer":184}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var multipartUpload_1 = require("./multipartUpload");
exports.default = {
    multipartUpload: multipartUpload_1.multipartUpload
};

},{"./multipartUpload":5}],5:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multipartUpload = void 0;
var path_1 = __importDefault(require("path"));
var mime_1 = __importDefault(require("mime"));
var initMultipartUpload_1 = require("../../common/multipart/initMultipartUpload");
var resumeMultipart_1 = require("../../common/multipart/resumeMultipart");
var putStream_1 = require("../object/putStream");
var isFile_1 = require("../../common/utils/isFile");
var isBlob_1 = require("../../common/utils/isBlob");
var getPartSize_1 = require("../../common/utils/getPartSize");
var convertMetaToHeaders_1 = require("../../common/utils/convertMetaToHeaders");
var getFileSize_1 = require("../utils/getFileSize");
var isBuffer_1 = require("../../common/utils/isBuffer");
/**
 * Upload a file to OSS using multipart uploads
 * @param {String} name
 * @param {String|File|Buffer} file
 * @param {Object} options
 *        {Object} options.callback The callback parameter is composed of a JSON string encoded in Base64
 *        {String} options.callback.url the OSS sends a callback request to this URL
 *        {String} options.callback.host The host header value for initiating callback requests
 *        {String} options.callback.body The value of the request body when a callback is initiated
 *        {String} options.callback.contentType The Content-Type of the callback requests initiatiated
 *        {Object} options.callback.customValue Custom parameters are a map of key-values, e.g:
 *                  customValue = {
 *                    key1: 'value1',
 *                    key2: 'value2'
 *                  }
 */
function multipartUpload(name, file) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var minPartSize, fileSize, stream, result, ret, initResult, uploadId, partSize, checkpoint;
    return _regenerator2.default.async(function multipartUpload$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    this.resetCancelFlag();

                    if (!(options.checkpoint && options.checkpoint.uploadId)) {
                        _context.next = 5;
                        break;
                    }

                    _context.next = 4;
                    return _regenerator2.default.awrap(resumeMultipart_1.resumeMultipart.call(this, options.checkpoint, options));

                case 4:
                    return _context.abrupt("return", _context.sent);

                case 5:
                    minPartSize = 100 * 1024;

                    if (!options.mime) {
                        if (isFile_1.isFile(file)) {
                            options.mime = mime_1.default.getType(path_1.default.extname(file.name));
                        } else if (isBlob_1.isBlob(file)) {
                            options.mime = file.type;
                        } else if (isBuffer_1.isBuffer(file)) {
                            options.mime = '';
                        } else {
                            options.mime = mime_1.default.getType(path_1.default.extname(file));
                        }
                    }
                    options.headers = options.headers || {};
                    convertMetaToHeaders_1.convertMetaToHeaders(options.meta, options.headers);
                    _context.next = 11;
                    return _regenerator2.default.awrap(getFileSize_1.getFileSize(file));

                case 11:
                    fileSize = _context.sent;

                    if (!(fileSize < minPartSize)) {
                        _context.next = 24;
                        break;
                    }

                    stream = this._createStream(file, 0, fileSize);

                    options.contentLength = fileSize;
                    _context.next = 17;
                    return _regenerator2.default.awrap(putStream_1.putStream.call(this, name, stream, options));

                case 17:
                    result = _context.sent;

                    if (!(options && options.progress)) {
                        _context.next = 21;
                        break;
                    }

                    _context.next = 21;
                    return _regenerator2.default.awrap(options.progress(1));

                case 21:
                    ret = {
                        res: result.res,
                        bucket: this.options.bucket,
                        name: name,
                        etag: result.res.headers.etag
                    };

                    if (options.headers && options.headers['x-oss-callback'] || options.callback) {
                        ret.data = result.data;
                    }
                    return _context.abrupt("return", ret);

                case 24:
                    if (!(options.partSize && !(parseInt(options.partSize.toString(), 10) === options.partSize))) {
                        _context.next = 26;
                        break;
                    }

                    throw new Error('partSize must be int number');

                case 26:
                    if (!(options.partSize && options.partSize < minPartSize)) {
                        _context.next = 28;
                        break;
                    }

                    throw new Error("partSize must not be smaller than " + minPartSize);

                case 28:
                    _context.next = 30;
                    return _regenerator2.default.awrap(initMultipartUpload_1.initMultipartUpload.call(this, name, options));

                case 30:
                    initResult = _context.sent;
                    uploadId = initResult.uploadId;
                    partSize = getPartSize_1.getPartSize(fileSize, options.partSize);
                    checkpoint = {
                        file: file,
                        name: name,
                        fileSize: fileSize,
                        partSize: partSize,
                        uploadId: uploadId,
                        doneParts: []
                    };

                    if (!(options && options.progress)) {
                        _context.next = 37;
                        break;
                    }

                    _context.next = 37;
                    return _regenerator2.default.awrap(options.progress(0, checkpoint, initResult.res));

                case 37:
                    _context.next = 39;
                    return _regenerator2.default.awrap(resumeMultipart_1.resumeMultipart.call(this, checkpoint, options));

                case 39:
                    return _context.abrupt("return", _context.sent);

                case 40:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.multipartUpload = multipartUpload;

},{"../../common/multipart/initMultipartUpload":76,"../../common/multipart/resumeMultipart":80,"../../common/utils/convertMetaToHeaders":119,"../../common/utils/getPartSize":130,"../../common/utils/isBlob":138,"../../common/utils/isBuffer":139,"../../common/utils/isFile":140,"../object/putStream":8,"../utils/getFileSize":9,"babel-runtime/regenerator":176,"mime":312,"path":315}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var putStream_1 = require("./putStream");
var put_1 = require("./put");
exports.default = {
    putStream: putStream_1.putStream,
    put: put_1.put
};

},{"./put":7,"./putStream":8}],7:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.put = void 0;
var path_1 = __importDefault(require("path"));
var mime_1 = __importDefault(require("mime"));
var putStream_1 = require("./putStream");
var isBlob_1 = require("../../common/utils/isBlob");
var isFile_1 = require("../../common/utils/isFile");
var objectName_1 = require("../../common/utils/objectName");
var encodeCallback_1 = require("../../common/utils/encodeCallback");
var objectUrl_1 = require("../../common/utils/objectUrl");
var convertMetaToHeaders_1 = require("../../common/utils/convertMetaToHeaders");
var getFileSize_1 = require("../utils/getFileSize");
var isBuffer_1 = require("../../common/utils/isBuffer");
/**
 * put an object from String(file path)/Buffer/ReadableStream
 * @param {String} name the object key
 * @param {Mixed} file String(file path)/Buffer/ReadableStream
 * @param {Object} options
 *        {Object} options.callback The callback parameter is composed of a JSON string encoded in Base64
 *        {String} options.callback.url  the OSS sends a callback request to this URL
 *        {String} options.callback.host  The host header value for initiating callback requests
 *        {String} options.callback.body  The value of the request body when a callback is initiated
 *        {String} options.callback.contentType  The Content-Type of the callback requests initiatiated
 *        {Object} options.callback.customValue  Custom parameters are a map of key-values, e.g:
 *                  customValue = {
 *                    key1: 'value1',
 *                    key2: 'value2'
 *                  }
 * @return {Object}
 */
function put(name, file) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var content, stream, _result, method, params, result, ret;

    return _regenerator2.default.async(function put$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    content = void 0;

                    name = objectName_1.objectName(name);

                    if (!isBuffer_1.isBuffer(file)) {
                        _context.next = 6;
                        break;
                    }

                    content = file;
                    _context.next = 32;
                    break;

                case 6:
                    if (!(isBlob_1.isBlob(file) || isFile_1.isFile(file))) {
                        _context.next = 31;
                        break;
                    }

                    if (!options.mime) {
                        if (isFile_1.isFile(file)) {
                            options.mime = mime_1.default.getType(path_1.default.extname(file.name));
                        } else {
                            options.mime = file.type;
                        }
                    }
                    stream = this._createStream(file, 0, file.size);
                    _context.next = 11;
                    return _regenerator2.default.awrap(getFileSize_1.getFileSize(file));

                case 11:
                    options.contentLength = _context.sent;
                    _context.prev = 12;
                    _context.next = 15;
                    return _regenerator2.default.awrap(putStream_1.putStream.call(this, name, stream, options));

                case 15:
                    _result = _context.sent;
                    return _context.abrupt("return", _result);

                case 19:
                    _context.prev = 19;
                    _context.t0 = _context["catch"](12);

                    if (!(_context.t0.code === 'RequestTimeTooSkewed')) {
                        _context.next = 28;
                        break;
                    }

                    this.options.amendTimeSkewed = +new Date(_context.t0.serverTime) - new Date().valueOf();
                    _context.next = 25;
                    return _regenerator2.default.awrap(put.call(this, name, file, options));

                case 25:
                    return _context.abrupt("return", _context.sent);

                case 28:
                    throw _context.t0;

                case 29:
                    _context.next = 32;
                    break;

                case 31:
                    throw new TypeError('Must provide Buffer/Blob/File for put.');

                case 32:
                    options.headers = options.headers || {};
                    convertMetaToHeaders_1.convertMetaToHeaders(options.meta, options.headers);
                    method = options.method || 'PUT';
                    params = this._objectRequestParams(method, name, options);

                    encodeCallback_1.encodeCallback(params, options);
                    params.mime = options.mime;
                    params.content = content;
                    params.successStatuses = [200];
                    _context.next = 42;
                    return _regenerator2.default.awrap(this.request(params));

                case 42:
                    result = _context.sent;
                    ret = {
                        name: name,
                        url: objectUrl_1.objectUrl(name, this.options),
                        res: result.res
                    };

                    if (params.headers && params.headers['x-oss-callback']) {
                        ret.data = JSON.parse(result.data.toString());
                    }
                    return _context.abrupt("return", ret);

                case 46:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this, [[12, 19]]);
}
exports.put = put;

},{"../../common/utils/convertMetaToHeaders":119,"../../common/utils/encodeCallback":124,"../../common/utils/isBlob":138,"../../common/utils/isBuffer":139,"../../common/utils/isFile":140,"../../common/utils/objectName":145,"../../common/utils/objectUrl":146,"../utils/getFileSize":9,"./putStream":8,"babel-runtime/regenerator":176,"mime":312,"path":315}],8:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.putStream = void 0;
var objectName_1 = require("../../common/utils/objectName");
var convertMetaToHeaders_1 = require("../../common/utils/convertMetaToHeaders");
var objectUrl_1 = require("../../common/utils/objectUrl");
var encodeCallback_1 = require("../../common/utils/encodeCallback");
/**
 * put an object from ReadableStream. If `options.contentLength` is
 * not provided, chunked encoding is used.
 * @param {String} name the object key
 * @param {Readable} stream the ReadableStream
 * @param {Object} options
 * @return {Object}
 */
function putStream(name, stream) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var method, params, result, ret;
    return _regenerator2.default.async(function putStream$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    options.headers = options.headers || {};
                    name = objectName_1.objectName(name);
                    if (options.contentLength) {
                        options.headers['Content-Length'] = options.contentLength;
                    } else {
                        options.headers['Transfer-Encoding'] = 'chunked';
                    }
                    convertMetaToHeaders_1.convertMetaToHeaders(options.meta, options.headers);
                    method = options.method || 'PUT';
                    params = this._objectRequestParams(method, name, options);

                    encodeCallback_1.encodeCallback(params, options);
                    params.mime = options.mime;
                    params.stream = stream;
                    params.successStatuses = [200];
                    _context.next = 12;
                    return _regenerator2.default.awrap(this.request(params));

                case 12:
                    result = _context.sent;
                    ret = {
                        name: name,
                        url: objectUrl_1.objectUrl(name, this.options),
                        res: result.res
                    };

                    if (params.headers && params.headers['x-oss-callback']) {
                        ret.data = JSON.parse(result.data.toString());
                    }
                    return _context.abrupt("return", ret);

                case 16:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.putStream = putStream;

},{"../../common/utils/convertMetaToHeaders":119,"../../common/utils/encodeCallback":124,"../../common/utils/objectName":145,"../../common/utils/objectUrl":146,"babel-runtime/regenerator":176}],9:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileSize = void 0;
var isBlob_1 = require("../../common/utils/isBlob");
var isFile_1 = require("../../common/utils/isFile");
var isBuffer_1 = require("../../common/utils/isBuffer");
function getFileSize(file) {
    return _regenerator2.default.async(function getFileSize$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    if (!isBuffer_1.isBuffer(file)) {
                        _context.next = 4;
                        break;
                    }

                    return _context.abrupt("return", file.length);

                case 4:
                    if (!(isBlob_1.isBlob(file) || isFile_1.isFile(file))) {
                        _context.next = 6;
                        break;
                    }

                    return _context.abrupt("return", file.size);

                case 6:
                    throw new Error('getFileSize requires Buffer/File/Blob.');

                case 7:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getFileSize = getFileSize;

},{"../../common/utils/isBlob":138,"../../common/utils/isBuffer":139,"../../common/utils/isFile":140,"babel-runtime/regenerator":176}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.version = void 0;
exports.version = '6.9.5';

},{}],11:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.abortBucketWorm = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
function abortBucketWorm(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result;
    return _regenerator2.default.async(function abortBucketWorm$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('DELETE', name, 'worm', options);
                    _context.next = 4;
                    return _regenerator2.default.awrap(this.request(params));

                case 4:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res,
                        status: result.status
                    });

                case 6:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.abortBucketWorm = abortBucketWorm;

},{"../utils/checkBucketName":114,"babel-runtime/regenerator":176}],12:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.completeBucketWorm = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
function completeBucketWorm(name, wormId) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var params, result;
    return _regenerator2.default.async(function completeBucketWorm$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('POST', name, { wormId: wormId }, options);
                    _context.next = 4;
                    return _regenerator2.default.awrap(this.request(params));

                case 4:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res,
                        status: result.status
                    });

                case 6:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.completeBucketWorm = completeBucketWorm;

},{"../utils/checkBucketName":114,"babel-runtime/regenerator":176}],13:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBucket = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
function deleteBucket(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result;
    return _regenerator2.default.async(function deleteBucket$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('DELETE', name, '', options);
                    _context.next = 4;
                    return _regenerator2.default.awrap(this.request(params));

                case 4:
                    result = _context.sent;

                    if (!(result.status === 200 || result.status === 204)) {
                        _context.next = 7;
                        break;
                    }

                    return _context.abrupt("return", {
                        res: result.res
                    });

                case 7:
                    _context.next = 9;
                    return _regenerator2.default.awrap(this.requestError(result));

                case 9:
                    throw _context.sent;

                case 10:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.deleteBucket = deleteBucket;

},{"../utils/checkBucketName":114,"babel-runtime/regenerator":176}],14:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBucketCORS = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
function deleteBucketCORS(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result;
    return _regenerator2.default.async(function deleteBucketCORS$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('DELETE', name, 'cors', options);

                    params.successStatuses = [204];
                    _context.next = 5;
                    return _regenerator2.default.awrap(this.request(params));

                case 5:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res
                    });

                case 7:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.deleteBucketCORS = deleteBucketCORS;

},{"../utils/checkBucketName":114,"babel-runtime/regenerator":176}],15:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBucketEncryption = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
/**
 * deleteBucketEncryption
 * @param {String} bucketName - bucket name
 */
function deleteBucketEncryption(bucketName) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result;
    return _regenerator2.default.async(function deleteBucketEncryption$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(bucketName);
                    params = this._bucketRequestParams('DELETE', bucketName, 'encryption', options);

                    params.successStatuses = [204];
                    params.xmlResponse = true;
                    _context.next = 6;
                    return _regenerator2.default.awrap(this.request(params));

                case 6:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        status: result.status,
                        res: result.res
                    });

                case 8:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.deleteBucketEncryption = deleteBucketEncryption;

},{"../utils/checkBucketName":114,"babel-runtime/regenerator":176}],16:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBucketLifecycle = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
function deleteBucketLifecycle(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result;
    return _regenerator2.default.async(function deleteBucketLifecycle$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('DELETE', name, 'lifecycle', options);

                    params.successStatuses = [204];
                    _context.next = 5;
                    return _regenerator2.default.awrap(this.request(params));

                case 5:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res
                    });

                case 7:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.deleteBucketLifecycle = deleteBucketLifecycle;

},{"../utils/checkBucketName":114,"babel-runtime/regenerator":176}],17:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBucketLogging = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
function deleteBucketLogging(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result;
    return _regenerator2.default.async(function deleteBucketLogging$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('DELETE', name, 'logging', options);

                    params.successStatuses = [204, 200];
                    _context.next = 5;
                    return _regenerator2.default.awrap(this.request(params));

                case 5:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res
                    });

                case 7:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.deleteBucketLogging = deleteBucketLogging;

},{"../utils/checkBucketName":114,"babel-runtime/regenerator":176}],18:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBucketPolicy = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
/**
 * deleteBucketPolicy
 * @param {String} bucketName - bucket name
 * @param {Object} options
 */
function deleteBucketPolicy(bucketName) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result;
    return _regenerator2.default.async(function deleteBucketPolicy$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(bucketName);
                    params = this._bucketRequestParams('DELETE', bucketName, 'policy', options);

                    params.successStatuses = [204];
                    _context.next = 5;
                    return _regenerator2.default.awrap(this.request(params));

                case 5:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        status: result.status,
                        res: result.res
                    });

                case 7:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.deleteBucketPolicy = deleteBucketPolicy;

},{"../utils/checkBucketName":114,"babel-runtime/regenerator":176}],19:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBucketReferer = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
var putBucketReferer_1 = require("./putBucketReferer");
function deleteBucketReferer(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return _regenerator2.default.async(function deleteBucketReferer$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    _context.next = 3;
                    return _regenerator2.default.awrap(putBucketReferer_1.putBucketReferer.call(this, name, true, null, options));

                case 3:
                    return _context.abrupt("return", _context.sent);

                case 4:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.deleteBucketReferer = deleteBucketReferer;

},{"../utils/checkBucketName":114,"./putBucketReferer":47,"babel-runtime/regenerator":176}],20:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBucketTags = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
/**
 * deleteBucketTags
 * @param {String} name - bucket name
 * @param {Object} options
 */
function deleteBucketTags(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result;
    return _regenerator2.default.async(function deleteBucketTags$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('DELETE', name, 'tagging', options);

                    params.successStatuses = [204];
                    _context.next = 5;
                    return _regenerator2.default.awrap(this.request(params));

                case 5:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        status: result.status,
                        res: result.res
                    });

                case 7:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.deleteBucketTags = deleteBucketTags;

},{"../utils/checkBucketName":114,"babel-runtime/regenerator":176}],21:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBucketWebsite = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
function deleteBucketWebsite(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result;
    return _regenerator2.default.async(function deleteBucketWebsite$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('DELETE', name, 'website', options);

                    params.successStatuses = [204];
                    _context.next = 5;
                    return _regenerator2.default.awrap(this.request(params));

                case 5:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res
                    });

                case 7:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.deleteBucketWebsite = deleteBucketWebsite;

},{"../utils/checkBucketName":114,"babel-runtime/regenerator":176}],22:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.extendBucketWorm = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
var obj2xml_1 = require("../utils/obj2xml");
function extendBucketWorm(name, wormId, days) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var params, paramlXMLObJ, result;
    return _regenerator2.default.async(function extendBucketWorm$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('POST', name, { wormExtend: '', wormId: wormId }, options);
                    paramlXMLObJ = {
                        ExtendWormConfiguration: {
                            RetentionPeriodInDays: days
                        }
                    };

                    params.mime = 'xml';
                    params.content = obj2xml_1.obj2xml(paramlXMLObJ, { headers: true });
                    params.successStatuses = [200];
                    _context.next = 8;
                    return _regenerator2.default.awrap(this.request(params));

                case 8:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res,
                        status: result.status
                    });

                case 10:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.extendBucketWorm = extendBucketWorm;

},{"../utils/checkBucketName":114,"../utils/obj2xml":144,"babel-runtime/regenerator":176}],23:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucketACL = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
function getBucketACL(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result;
    return _regenerator2.default.async(function getBucketACL$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('GET', name, 'acl', options);

                    params.successStatuses = [200];
                    params.xmlResponse = true;
                    _context.next = 6;
                    return _regenerator2.default.awrap(this.request(params));

                case 6:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        acl: result.data.AccessControlList.Grant,
                        owner: {
                            id: result.data.Owner.ID,
                            displayName: result.data.Owner.DisplayName
                        },
                        res: result.res
                    });

                case 8:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getBucketACL = getBucketACL;

},{"../utils/checkBucketName":114,"babel-runtime/regenerator":176}],24:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucketCORS = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
var isArray_1 = require("../utils/isArray");
function getBucketCORS(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result, rules, CORSRule;
    return _regenerator2.default.async(function getBucketCORS$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('GET', name, 'cors', options);

                    params.successStatuses = [200];
                    params.xmlResponse = true;
                    _context.next = 6;
                    return _regenerator2.default.awrap(this.request(params));

                case 6:
                    result = _context.sent;
                    rules = [];

                    if (result.data && result.data.CORSRule) {
                        CORSRule = result.data.CORSRule;

                        if (!isArray_1.isArray(CORSRule)) CORSRule = [CORSRule];
                        CORSRule.forEach(function (rule) {
                            var r = {};
                            (0, _keys2.default)(rule).forEach(function (key) {
                                r[key.slice(0, 1).toLowerCase() + key.slice(1, key.length)] = rule[key];
                            });
                            rules.push(r);
                        });
                    }
                    return _context.abrupt("return", {
                        rules: rules,
                        res: result.res
                    });

                case 10:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getBucketCORS = getBucketCORS;

},{"../utils/checkBucketName":114,"../utils/isArray":137,"babel-runtime/core-js/object/keys":161,"babel-runtime/regenerator":176}],25:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucketEncryption = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
/**
 * getBucketEncryption
 * @param {String} bucketName - bucket name
 */
function getBucketEncryption(bucketName) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result, encryption;
    return _regenerator2.default.async(function getBucketEncryption$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(bucketName);
                    params = this._bucketRequestParams('GET', bucketName, 'encryption', options);

                    params.successStatuses = [200];
                    params.xmlResponse = true;
                    _context.next = 6;
                    return _regenerator2.default.awrap(this.request(params));

                case 6:
                    result = _context.sent;
                    encryption = result.data.ApplyServerSideEncryptionByDefault;
                    return _context.abrupt("return", {
                        encryption: encryption,
                        status: result.status,
                        res: result.res
                    });

                case 9:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getBucketEncryption = getBucketEncryption;

},{"../utils/checkBucketName":114,"babel-runtime/regenerator":176}],26:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucketInfo = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
function getBucketInfo(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result;
    return _regenerator2.default.async(function getBucketInfo$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    name = name || this.options.bucket;
                    params = this._bucketRequestParams('GET', name, 'bucketInfo', options);

                    params.successStatuses = [200];
                    params.xmlResponse = true;
                    _context.next = 7;
                    return _regenerator2.default.awrap(this.request(params));

                case 7:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        bucket: result.data.Bucket,
                        res: result.res
                    });

                case 9:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getBucketInfo = getBucketInfo;

},{"../utils/checkBucketName":114,"babel-runtime/regenerator":176}],27:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucketLifecycle = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
var isArray_1 = require("../utils/isArray");
var formatObjKey_1 = require("../utils/formatObjKey");
function getBucketLifecycle(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result, rules;
    return _regenerator2.default.async(function getBucketLifecycle$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('GET', name, 'lifecycle', options);

                    params.successStatuses = [200];
                    params.xmlResponse = true;
                    _context.next = 6;
                    return _regenerator2.default.awrap(this.request(params));

                case 6:
                    result = _context.sent;
                    rules = result.data.Rule || null;

                    if (rules) {
                        if (!isArray_1.isArray(rules)) {
                            rules = [rules];
                        }
                        rules = rules.map(function (_) {
                            if (_.ID) {
                                _.id = _.ID;
                                delete _.ID;
                            }
                            if (_.Tag && !isArray_1.isArray(_.Tag)) {
                                _.Tag = [_.Tag];
                            }
                            return formatObjKey_1.formatObjKey(_, 'firstLowerCase');
                        });
                    }
                    return _context.abrupt("return", {
                        rules: rules,
                        res: result.res
                    });

                case 10:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getBucketLifecycle = getBucketLifecycle;

},{"../utils/checkBucketName":114,"../utils/formatObjKey":127,"../utils/isArray":137,"babel-runtime/regenerator":176}],28:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucketLocation = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
function getBucketLocation(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result;
    return _regenerator2.default.async(function getBucketLocation$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    name = name || this.options.bucket;
                    params = this._bucketRequestParams('GET', name, 'location', options);

                    params.successStatuses = [200];
                    params.xmlResponse = true;
                    _context.next = 7;
                    return _regenerator2.default.awrap(this.request(params));

                case 7:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        location: result.data,
                        res: result.res
                    });

                case 9:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getBucketLocation = getBucketLocation;

},{"../utils/checkBucketName":114,"babel-runtime/regenerator":176}],29:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucketLogging = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
function getBucketLogging(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result, enable;
    return _regenerator2.default.async(function getBucketLogging$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('GET', name, 'logging', options);

                    params.successStatuses = [200];
                    params.xmlResponse = true;
                    _context.next = 6;
                    return _regenerator2.default.awrap(this.request(params));

                case 6:
                    result = _context.sent;
                    enable = result.data.LoggingEnabled;
                    return _context.abrupt("return", {
                        enable: !!enable,
                        prefix: enable && enable.TargetPrefix || null,
                        res: result.res
                    });

                case 9:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getBucketLogging = getBucketLogging;

},{"../utils/checkBucketName":114,"babel-runtime/regenerator":176}],30:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucketPolicy = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
/**
 * getBucketPolicy
 * @param {String} bucketName - bucket name
 * @param {Object} options
 */
function getBucketPolicy(bucketName) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result, policy;
    return _regenerator2.default.async(function getBucketPolicy$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(bucketName);
                    params = this._bucketRequestParams('GET', bucketName, 'policy', options);
                    _context.next = 4;
                    return _regenerator2.default.awrap(this.request(params));

                case 4:
                    result = _context.sent;

                    params.successStatuses = [200];
                    policy = null;

                    if (result.res.status === 200) {
                        policy = JSON.parse(result.res.data.toString());
                    }
                    return _context.abrupt("return", {
                        policy: policy,
                        status: result.status,
                        res: result.res
                    });

                case 9:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getBucketPolicy = getBucketPolicy;

},{"../utils/checkBucketName":114,"babel-runtime/regenerator":176}],31:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucketReferer = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
var isArray_1 = require("../utils/isArray");
function getBucketReferer(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result, referers;
    return _regenerator2.default.async(function getBucketReferer$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('GET', name, 'referer', options);

                    params.successStatuses = [200];
                    params.xmlResponse = true;
                    _context.next = 6;
                    return _regenerator2.default.awrap(this.request(params));

                case 6:
                    result = _context.sent;
                    referers = result.data.RefererList.Referer || null;

                    if (referers) {
                        if (!isArray_1.isArray(referers)) {
                            referers = [referers];
                        }
                    }
                    return _context.abrupt("return", {
                        allowEmpty: result.data.AllowEmptyReferer === 'true',
                        referers: referers,
                        res: result.res
                    });

                case 10:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getBucketReferer = getBucketReferer;

},{"../utils/checkBucketName":114,"../utils/isArray":137,"babel-runtime/regenerator":176}],32:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucketRequestPayment = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
/**
 * getBucketRequestPayment
 * @param {String} bucketName - bucket name
 * @param {Object} options
 */
function getBucketRequestPayment(bucketName) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result;
    return _regenerator2.default.async(function getBucketRequestPayment$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(bucketName);
                    params = this._bucketRequestParams('GET', bucketName, 'requestPayment', options);

                    params.successStatuses = [200];
                    params.xmlResponse = true;
                    _context.next = 6;
                    return _regenerator2.default.awrap(this.request(params));

                case 6:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        status: result.status,
                        res: result.res,
                        payer: result.data.Payer
                    });

                case 8:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getBucketRequestPayment = getBucketRequestPayment;

},{"../utils/checkBucketName":114,"babel-runtime/regenerator":176}],33:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucketTags = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
var formatTag_1 = require("../utils/formatTag");
/**
 * getBucketTags
 * @param {String} name - bucket name
 * @param {Object} options
 * @return {Object}
 */
function getBucketTags(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result, Tagging;
    return _regenerator2.default.async(function getBucketTags$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('GET', name, 'tagging', options);

                    params.successStatuses = [200];
                    params.xmlResponse = true;
                    _context.next = 6;
                    return _regenerator2.default.awrap(this.request(params));

                case 6:
                    result = _context.sent;
                    Tagging = result.data;
                    return _context.abrupt("return", {
                        status: result.status,
                        res: result.res,
                        tag: formatTag_1.formatTag(Tagging)
                    });

                case 9:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getBucketTags = getBucketTags;

},{"../utils/checkBucketName":114,"../utils/formatTag":129,"babel-runtime/regenerator":176}],34:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucketVersioning = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
/**
 * getBucketVersioning
 * @param {String} bucketName - bucket name
 */
function getBucketVersioning(bucketName) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result, versionStatus;
    return _regenerator2.default.async(function getBucketVersioning$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(bucketName);
                    params = this._bucketRequestParams('GET', bucketName, 'versioning', options);

                    params.xmlResponse = true;
                    params.successStatuses = [200];
                    _context.next = 6;
                    return _regenerator2.default.awrap(this.request(params));

                case 6:
                    result = _context.sent;
                    versionStatus = result.data.Status;
                    return _context.abrupt("return", {
                        status: result.status,
                        versionStatus: versionStatus,
                        res: result.res
                    });

                case 9:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getBucketVersioning = getBucketVersioning;

},{"../utils/checkBucketName":114,"babel-runtime/regenerator":176}],35:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucketWebsite = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
var isObject_1 = require("../utils/isObject");
function getBucketWebsite(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result, routingRules;
    return _regenerator2.default.async(function getBucketWebsite$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('GET', name, 'website', options);

                    params.successStatuses = [200];
                    params.xmlResponse = true;
                    _context.next = 6;
                    return _regenerator2.default.awrap(this.request(params));

                case 6:
                    result = _context.sent;
                    routingRules = [];

                    if (result.data.RoutingRules && result.data.RoutingRules.RoutingRule) {
                        if (isObject_1.isObject(result.data.RoutingRules.RoutingRule)) {
                            routingRules = [result.data.RoutingRules.RoutingRule];
                        } else {
                            routingRules = result.data.RoutingRules.RoutingRule;
                        }
                    }
                    return _context.abrupt("return", {
                        index: result.data.IndexDocument && result.data.IndexDocument.Suffix || '',
                        supportSubDir: result.data.IndexDocument && result.data.IndexDocument.SupportSubDir || 'false',
                        type: result.data.IndexDocument && result.data.IndexDocument.Type,
                        routingRules: routingRules,
                        error: result.data.ErrorDocument && result.data.ErrorDocument.Key || null,
                        res: result.res
                    });

                case 10:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getBucketWebsite = getBucketWebsite;

},{"../utils/checkBucketName":114,"../utils/isObject":142,"babel-runtime/regenerator":176}],36:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucketWorm = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
var dataFix_1 = require("../utils/dataFix");
function getBucketWorm(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result;
    return _regenerator2.default.async(function getBucketWorm$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('GET', name, 'worm', options);

                    params.successStatuses = [200];
                    params.xmlResponse = true;
                    _context.next = 6;
                    return _regenerator2.default.awrap(this.request(params));

                case 6:
                    result = _context.sent;

                    dataFix_1.dataFix(result.data, {
                        lowerFirst: true,
                        rename: {
                            RetentionPeriodInDays: 'days'
                        }
                    });
                    return _context.abrupt("return", (0, _assign2.default)((0, _assign2.default)({}, result.data), { res: result.res, status: result.status }));

                case 9:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getBucketWorm = getBucketWorm;

},{"../utils/checkBucketName":114,"../utils/dataFix":120,"babel-runtime/core-js/object/assign":156,"babel-runtime/regenerator":176}],37:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var abortBucketWorm_1 = require("./abortBucketWorm");
var completeBucketWorm_1 = require("./completeBucketWorm");
var deleteBucket_1 = require("./deleteBucket");
var deleteBucketCORS_1 = require("./deleteBucketCORS");
var deleteBucketEncryption_1 = require("./deleteBucketEncryption");
var deleteBucketLifecycle_1 = require("./deleteBucketLifecycle");
var deleteBucketLogging_1 = require("./deleteBucketLogging");
var deleteBucketPolicy_1 = require("./deleteBucketPolicy");
var deleteBucketReferer_1 = require("./deleteBucketReferer");
var deleteBucketTags_1 = require("./deleteBucketTags");
var deleteBucketWebsite_1 = require("./deleteBucketWebsite");
var extendBucketWorm_1 = require("./extendBucketWorm");
var getBucketACL_1 = require("./getBucketACL");
var getBucketCORS_1 = require("./getBucketCORS");
var getBucketEncryption_1 = require("./getBucketEncryption");
var getBucketInfo_1 = require("./getBucketInfo");
var getBucketLifecycle_1 = require("./getBucketLifecycle");
var getBucketLocation_1 = require("./getBucketLocation");
var getBucketLogging_1 = require("./getBucketLogging");
var getBucketPolicy_1 = require("./getBucketPolicy");
var getBucketReferer_1 = require("./getBucketReferer");
var getBucketRequestPayment_1 = require("./getBucketRequestPayment");
var getBucketTags_1 = require("./getBucketTags");
var getBucketVersioning_1 = require("./getBucketVersioning");
var getBucketWebsite_1 = require("./getBucketWebsite");
var getBucketWorm_1 = require("./getBucketWorm");
var initiateBucketWorm_1 = require("./initiateBucketWorm");
var listBuckets_1 = require("./listBuckets");
var putBucket_1 = require("./putBucket");
var putBucketACL_1 = require("./putBucketACL");
var putBucketCORS_1 = require("./putBucketCORS");
var putBucketEncryption_1 = require("./putBucketEncryption");
var putBucketLifecycle_1 = require("./putBucketLifecycle");
var putBucketLogging_1 = require("./putBucketLogging");
var putBucketPolicy_1 = require("./putBucketPolicy");
var putBucketReferer_1 = require("./putBucketReferer");
var putBucketRequestPayment_1 = require("./putBucketRequestPayment");
var putBucketTags_1 = require("./putBucketTags");
var putBucketVersioning_1 = require("./putBucketVersioning");
var putBucketWebsite_1 = require("./putBucketWebsite");
exports.default = {
    abortBucketWorm: abortBucketWorm_1.abortBucketWorm,
    completeBucketWorm: completeBucketWorm_1.completeBucketWorm,
    deleteBucket: deleteBucket_1.deleteBucket,
    deleteBucketCORS: deleteBucketCORS_1.deleteBucketCORS,
    deleteBucketEncryption: deleteBucketEncryption_1.deleteBucketEncryption,
    deleteBucketLifecycle: deleteBucketLifecycle_1.deleteBucketLifecycle,
    deleteBucketLogging: deleteBucketLogging_1.deleteBucketLogging,
    deleteBucketPolicy: deleteBucketPolicy_1.deleteBucketPolicy,
    deleteBucketReferer: deleteBucketReferer_1.deleteBucketReferer,
    deleteBucketTags: deleteBucketTags_1.deleteBucketTags,
    deleteBucketWebsite: deleteBucketWebsite_1.deleteBucketWebsite,
    extendBucketWorm: extendBucketWorm_1.extendBucketWorm,
    getBucketACL: getBucketACL_1.getBucketACL,
    getBucketCORS: getBucketCORS_1.getBucketCORS,
    getBucketEncryption: getBucketEncryption_1.getBucketEncryption,
    getBucketInfo: getBucketInfo_1.getBucketInfo,
    getBucketLifecycle: getBucketLifecycle_1.getBucketLifecycle,
    getBucketLocation: getBucketLocation_1.getBucketLocation,
    getBucketLogging: getBucketLogging_1.getBucketLogging,
    getBucketPolicy: getBucketPolicy_1.getBucketPolicy,
    getBucketReferer: getBucketReferer_1.getBucketReferer,
    getBucketRequestPayment: getBucketRequestPayment_1.getBucketRequestPayment,
    getBucketTags: getBucketTags_1.getBucketTags,
    getBucketVersioning: getBucketVersioning_1.getBucketVersioning,
    getBucketWebsite: getBucketWebsite_1.getBucketWebsite,
    getBucketWorm: getBucketWorm_1.getBucketWorm,
    initiateBucketWorm: initiateBucketWorm_1.initiateBucketWorm,
    listBuckets: listBuckets_1.listBuckets,
    putBucket: putBucket_1.putBucket,
    putBucketACL: putBucketACL_1.putBucketACL,
    putBucketCORS: putBucketCORS_1.putBucketCORS,
    putBucketEncryption: putBucketEncryption_1.putBucketEncryption,
    putBucketLifecycle: putBucketLifecycle_1.putBucketLifecycle,
    putBucketLogging: putBucketLogging_1.putBucketLogging,
    putBucketPolicy: putBucketPolicy_1.putBucketPolicy,
    putBucketReferer: putBucketReferer_1.putBucketReferer,
    putBucketRequestPayment: putBucketRequestPayment_1.putBucketRequestPayment,
    putBucketTags: putBucketTags_1.putBucketTags,
    putBucketVersioning: putBucketVersioning_1.putBucketVersioning,
    putBucketWebsite: putBucketWebsite_1.putBucketWebsite
};

},{"./abortBucketWorm":11,"./completeBucketWorm":12,"./deleteBucket":13,"./deleteBucketCORS":14,"./deleteBucketEncryption":15,"./deleteBucketLifecycle":16,"./deleteBucketLogging":17,"./deleteBucketPolicy":18,"./deleteBucketReferer":19,"./deleteBucketTags":20,"./deleteBucketWebsite":21,"./extendBucketWorm":22,"./getBucketACL":23,"./getBucketCORS":24,"./getBucketEncryption":25,"./getBucketInfo":26,"./getBucketLifecycle":27,"./getBucketLocation":28,"./getBucketLogging":29,"./getBucketPolicy":30,"./getBucketReferer":31,"./getBucketRequestPayment":32,"./getBucketTags":33,"./getBucketVersioning":34,"./getBucketWebsite":35,"./getBucketWorm":36,"./initiateBucketWorm":38,"./listBuckets":39,"./putBucket":40,"./putBucketACL":41,"./putBucketCORS":42,"./putBucketEncryption":43,"./putBucketLifecycle":44,"./putBucketLogging":45,"./putBucketPolicy":46,"./putBucketReferer":47,"./putBucketRequestPayment":48,"./putBucketTags":49,"./putBucketVersioning":50,"./putBucketWebsite":51}],38:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateBucketWorm = void 0;
var obj2xml_1 = require("../utils/obj2xml");
var checkBucketName_1 = require("../utils/checkBucketName");
function initiateBucketWorm(name, days) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var params, paramlXMLObJ, result;
    return _regenerator2.default.async(function initiateBucketWorm$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('POST', name, 'worm', options);
                    paramlXMLObJ = {
                        InitiateWormConfiguration: {
                            RetentionPeriodInDays: days
                        }
                    };

                    params.mime = 'xml';
                    params.content = obj2xml_1.obj2xml(paramlXMLObJ, { headers: true });
                    params.successStatuses = [200];
                    _context.next = 8;
                    return _regenerator2.default.awrap(this.request(params));

                case 8:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res,
                        wormId: result.res.headers['x-oss-worm-id'],
                        status: result.status
                    });

                case 10:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.initiateBucketWorm = initiateBucketWorm;

},{"../utils/checkBucketName":114,"../utils/obj2xml":144,"babel-runtime/regenerator":176}],39:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.listBuckets = void 0;
var isArray_1 = require("../utils/isArray");
var formatTag_1 = require("../utils/formatTag");
function listBuckets() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var _query$subres, subres, restParams, key, params, result, data, buckets;

    return _regenerator2.default.async(function listBuckets$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    // prefix, marker, max-keys
                    _query$subres = query.subres, subres = _query$subres === undefined ? {} : _query$subres;
                    restParams = {};

                    for (key in query) {
                        if (key !== 'subres') {
                            restParams[key] = query[key];
                        }
                    }
                    params = this._bucketRequestParams('GET', '', (0, _assign2.default)(subres, options.subres), options);

                    params.xmlResponse = true;
                    params.query = restParams || {};
                    _context.next = 8;
                    return _regenerator2.default.awrap(this.request(params));

                case 8:
                    result = _context.sent;

                    if (!(result.status === 200)) {
                        _context.next = 14;
                        break;
                    }

                    data = result.data;
                    buckets = data.Buckets || null;

                    if (buckets) {
                        if (buckets.Bucket) {
                            buckets = buckets.Bucket;
                        }
                        if (!isArray_1.isArray(buckets)) {
                            buckets = [buckets];
                        }
                        buckets = buckets.map(function (item) {
                            return {
                                name: item.Name,
                                region: item.Location,
                                creationDate: item.CreationDate,
                                StorageClass: item.StorageClass,
                                tag: formatTag_1.formatTag(item)
                            };
                        });
                    }
                    return _context.abrupt("return", {
                        buckets: buckets,
                        owner: {
                            id: data.Owner.ID,
                            displayName: data.Owner.DisplayName
                        },
                        isTruncated: data.IsTruncated === 'true',
                        nextMarker: data.NextMarker || null,
                        res: result.res
                    });

                case 14:
                    _context.next = 16;
                    return _regenerator2.default.awrap(this.requestError(result));

                case 16:
                    throw _context.sent;

                case 17:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.listBuckets = listBuckets;

},{"../utils/formatTag":129,"../utils/isArray":137,"babel-runtime/core-js/object/assign":156,"babel-runtime/regenerator":176}],40:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.putBucket = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
var obj2xml_1 = require("../utils/obj2xml");
function putBucket(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var params, CreateBucketConfiguration, paramlXMLObJ, storageClass, dataRedundancyType, _options, acl, _options$headers, headers, result;

    return _regenerator2.default.async(function putBucket$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name, true);
                    options = options || {};
                    params = this._bucketRequestParams('PUT', name, '', options);
                    CreateBucketConfiguration = {};
                    paramlXMLObJ = {
                        CreateBucketConfiguration: CreateBucketConfiguration
                    };
                    storageClass = options.StorageClass || options.storageClass;
                    dataRedundancyType = options.DataRedundancyType || options.dataRedundancyType;

                    if (storageClass || dataRedundancyType) {
                        storageClass && (CreateBucketConfiguration.StorageClass = storageClass);
                        dataRedundancyType && (CreateBucketConfiguration.DataRedundancyType = dataRedundancyType);
                        params.mime = 'xml';
                        params.content = obj2xml_1.obj2xml(paramlXMLObJ, { headers: true });
                    }
                    _options = options, acl = _options.acl, _options$headers = _options.headers, headers = _options$headers === undefined ? {} : _options$headers;

                    acl && (headers['x-oss-acl'] = acl);
                    params.headers = headers;
                    params.successStatuses = [200];
                    _context.next = 14;
                    return _regenerator2.default.awrap(this.request(params));

                case 14:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        bucket: result.headers.location && result.headers.location.substring(1) || null,
                        res: result.res
                    });

                case 16:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.putBucket = putBucket;

},{"../utils/checkBucketName":114,"../utils/obj2xml":144,"babel-runtime/regenerator":176}],41:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.putBucketACL = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
function putBucketACL(name, acl) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var params, result;
    return _regenerator2.default.async(function putBucketACL$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('PUT', name, 'acl', options);

                    params.headers = {
                        'x-oss-acl': acl
                    };
                    params.successStatuses = [200];
                    _context.next = 6;
                    return _regenerator2.default.awrap(this.request(params));

                case 6:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        bucket: result.headers.location && result.headers.location.substring(1) || null,
                        res: result.res
                    });

                case 8:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.putBucketACL = putBucketACL;

},{"../utils/checkBucketName":114,"babel-runtime/regenerator":176}],42:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.putBucketCORS = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
var obj2xml_1 = require("../utils/obj2xml");
function putBucketCORS(name) {
    var rules = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var params, CORSRule, parseXMLobj, result;
    return _regenerator2.default.async(function putBucketCORS$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);

                    if (rules.length) {
                        _context.next = 3;
                        break;
                    }

                    throw new Error('rules is required');

                case 3:
                    rules.forEach(function (rule) {
                        if (!rule.allowedOrigin) {
                            throw new Error('allowedOrigin is required');
                        }
                        if (!rule.allowedMethod) {
                            throw new Error('allowedMethod is required');
                        }
                    });
                    params = this._bucketRequestParams('PUT', name, 'cors', options);
                    CORSRule = rules.map(function (_) {
                        var rule = {
                            AllowedOrigin: _.allowedOrigin,
                            AllowedMethod: _.allowedMethod,
                            AllowedHeader: _.allowedHeader || '',
                            ExposeHeader: _.exposeHeader || ''
                        };
                        if (_.maxAgeSeconds) rule.MaxAgeSeconds = _.maxAgeSeconds;
                        return rule;
                    });
                    parseXMLobj = {
                        CORSConfiguration: {
                            CORSRule: CORSRule
                        }
                    };

                    params.content = obj2xml_1.obj2xml(parseXMLobj, { headers: true });
                    params.mime = 'xml';
                    params.successStatuses = [200];
                    _context.next = 12;
                    return _regenerator2.default.awrap(this.request(params));

                case 12:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res
                    });

                case 14:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.putBucketCORS = putBucketCORS;

},{"../utils/checkBucketName":114,"../utils/obj2xml":144,"babel-runtime/regenerator":176}],43:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.putBucketEncryption = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
var obj2xml_1 = require("../utils/obj2xml");
/**
 * putBucketEncryption
 * @param {String} bucketName - bucket name
 * @param {Object} options
 */
function putBucketEncryption(bucketName, options) {
    var params, paramXMLObj, paramXML, result;
    return _regenerator2.default.async(function putBucketEncryption$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(bucketName);
                    params = this._bucketRequestParams('PUT', bucketName, 'encryption', options);

                    params.successStatuses = [200];
                    paramXMLObj = {
                        ServerSideEncryptionRule: {
                            ApplyServerSideEncryptionByDefault: {
                                SSEAlgorithm: options.SSEAlgorithm
                            }
                        }
                    };

                    if (options.KMSMasterKeyID !== undefined) {
                        paramXMLObj.ServerSideEncryptionRule.ApplyServerSideEncryptionByDefault.KMSMasterKeyID = options.KMSMasterKeyID;
                    }
                    paramXML = obj2xml_1.obj2xml(paramXMLObj, {
                        headers: true
                    });

                    params.mime = 'xml';
                    params.content = paramXML;
                    _context.next = 10;
                    return _regenerator2.default.awrap(this.request(params));

                case 10:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        status: result.status,
                        res: result.res
                    });

                case 12:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.putBucketEncryption = putBucketEncryption;

},{"../utils/checkBucketName":114,"../utils/obj2xml":144,"babel-runtime/regenerator":176}],44:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.putBucketLifecycle = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
var isArray_1 = require("../utils/isArray");
var deepCopy_1 = require("../utils/deepCopy");
var isObject_1 = require("../utils/isObject");
var obj2xml_1 = require("../utils/obj2xml");
var checkObjectTag_1 = require("../utils/checkObjectTag");
var getStrBytesCount_1 = require("../utils/getStrBytesCount");
function putBucketLifecycle(name, rules) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var params, Rule, paramXMLObj, paramXML, result;
    return _regenerator2.default.async(function putBucketLifecycle$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);

                    if (isArray_1.isArray(rules)) {
                        _context.next = 3;
                        break;
                    }

                    throw new Error('rules must be Array');

                case 3:
                    params = this._bucketRequestParams('PUT', name, 'lifecycle', options);
                    Rule = [];
                    paramXMLObj = {
                        LifecycleConfiguration: {
                            Rule: Rule
                        }
                    };

                    rules.forEach(function (_) {
                        defaultDaysAndDate2Expiration(_); // todo delete, 兼容旧版本
                        checkRule(_);
                        var rule = deepCopy_1.deepCopy(_);
                        if (rule.id) {
                            rule.ID = rule.id;
                            delete rule.id;
                        }
                        Rule.push(rule);
                    });
                    paramXML = obj2xml_1.obj2xml(paramXMLObj, {
                        headers: true,
                        firstUpperCase: true
                    });

                    params.content = paramXML;
                    params.mime = 'xml';
                    params.successStatuses = [200];
                    _context.next = 13;
                    return _regenerator2.default.awrap(this.request(params));

                case 13:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res
                    });

                case 15:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.putBucketLifecycle = putBucketLifecycle;
// todo delete, 兼容旧版本
function defaultDaysAndDate2Expiration(obj) {
    if (obj.days) {
        obj.expiration = {
            days: obj.days
        };
    }
    if (obj.date) {
        obj.expiration = {
            createdBeforeDate: obj.date
        };
    }
}
function checkDaysAndDate(obj, key) {
    var days = obj.days,
        createdBeforeDate = obj.createdBeforeDate;

    if (!days && !createdBeforeDate) {
        throw new Error(key + " must includes days or createdBeforeDate");
    } else if (days && !/^[1-9][0-9]*$/.test(days)) {
        throw new Error('days must be a positive integer');
    } else if (createdBeforeDate && !/\d{4}-\d{2}-\d{2}T00:00:00.000Z/.test(createdBeforeDate)) {
        throw new Error('createdBeforeDate must be date and conform to iso8601 format');
    }
}
function handleCheckTag(tag) {
    if (!isArray_1.isArray(tag) && !isObject_1.isObject(tag)) {
        throw new Error('tag must be Object or Array');
    }
    tag = isObject_1.isObject(tag) ? [tag] : tag;
    var tagObj = {};
    var tagClone = deepCopy_1.deepCopy(tag);
    tagClone.forEach(function (v) {
        tagObj[v.key] = v.value;
    });
    checkObjectTag_1.checkObjectTag(tagObj);
}
function checkRule(rule) {
    if (rule.id && getStrBytesCount_1.getStrBytesCount(rule.id) > 255) throw new Error('ID is composed of 255 bytes at most');
    if (rule.prefix === undefined) throw new Error('Rule must includes prefix');
    if (!['Enabled', 'Disabled'].includes(rule.status)) throw new Error('Status must be  Enabled or Disabled');
    if (rule.transition) {
        if (!['IA', 'Archive'].includes(rule.transition.storageClass)) throw new Error('StorageClass must be  IA or Archive');
        checkDaysAndDate(rule.transition, 'Transition');
    }
    if (rule.expiration) {
        if (!rule.expiration.expiredObjectDeleteMarker) {
            checkDaysAndDate(rule.expiration, 'Expiration');
        } else if (rule.expiration.days || rule.expiration.createdBeforeDate) {
            throw new Error('expiredObjectDeleteMarker cannot be used with days or createdBeforeDate');
        }
    }
    if (rule.abortMultipartUpload) {
        checkDaysAndDate(rule.abortMultipartUpload, 'AbortMultipartUpload');
    }
    if (!rule.expiration && !rule.abortMultipartUpload && !rule.transition && !rule.noncurrentVersionTransition) {
        throw new Error('Rule must includes expiration or abortMultipartUpload or transition or noncurrentVersionTransition');
    }
    if (rule.tag) {
        if (rule.abortMultipartUpload) {
            throw new Error('Tag cannot be used with abortMultipartUpload');
        }
        handleCheckTag(rule.tag);
    }
}

},{"../utils/checkBucketName":114,"../utils/checkObjectTag":116,"../utils/deepCopy":121,"../utils/getStrBytesCount":134,"../utils/isArray":137,"../utils/isObject":142,"../utils/obj2xml":144,"babel-runtime/regenerator":176}],45:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.putBucketLogging = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
var obj2xml_1 = require("../utils/obj2xml");
function putBucketLogging(name) {
    var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var params, parseXMLObj, result;
    return _regenerator2.default.async(function putBucketLogging$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('PUT', name, 'logging', options);
                    parseXMLObj = {
                        BucketLoggingStatus: {
                            LoggingEnabled: {
                                TargetBucket: name,
                                TargetPrefix: prefix
                            }
                        }
                    };

                    params.content = obj2xml_1.obj2xml(parseXMLObj, { headers: true });
                    params.mime = 'xml';
                    params.successStatuses = [200];
                    _context.next = 8;
                    return _regenerator2.default.awrap(this.request(params));

                case 8:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res
                    });

                case 10:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.putBucketLogging = putBucketLogging;

},{"../utils/checkBucketName":114,"../utils/obj2xml":144,"babel-runtime/regenerator":176}],46:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.putBucketPolicy = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
var policy2Str_1 = require("../utils/policy2Str");
var isObject_1 = require("../utils/isObject");
/**
 * putBucketPolicy
 * @param {String} bucketName - bucket name
 * @param {Object} policy - bucket policy
 * @param {Object} options
 */
function putBucketPolicy(bucketName, policy) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var params, result;
    return _regenerator2.default.async(function putBucketPolicy$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(bucketName);

                    if (isObject_1.isObject(policy)) {
                        _context.next = 3;
                        break;
                    }

                    throw new Error('policy is not Object');

                case 3:
                    params = this._bucketRequestParams('PUT', bucketName, 'policy', options);

                    params.content = policy2Str_1.policy2Str(policy);
                    params.successStatuses = [200];
                    _context.next = 8;
                    return _regenerator2.default.awrap(this.request(params));

                case 8:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        status: result.status,
                        res: result.res
                    });

                case 10:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.putBucketPolicy = putBucketPolicy;

},{"../utils/checkBucketName":114,"../utils/isObject":142,"../utils/policy2Str":148,"babel-runtime/regenerator":176}],47:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.putBucketReferer = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
var obj2xml_1 = require("../utils/obj2xml");
function putBucketReferer(name, allowEmpty, referers) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var params, parseXMLObj, result;
    return _regenerator2.default.async(function putBucketReferer$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('PUT', name, 'referer', options);
                    parseXMLObj = {
                        RefererConfiguration: {
                            AllowEmptyReferer: allowEmpty ? 'true' : 'false',
                            RefererList: referers && referers.length > 0 ? {
                                Referer: referers
                            } : ''
                        }
                    };

                    params.content = obj2xml_1.obj2xml(parseXMLObj);
                    params.mime = 'xml';
                    params.successStatuses = [200];
                    _context.next = 8;
                    return _regenerator2.default.awrap(this.request(params));

                case 8:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res
                    });

                case 10:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.putBucketReferer = putBucketReferer;

},{"../utils/checkBucketName":114,"../utils/obj2xml":144,"babel-runtime/regenerator":176}],48:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.putBucketRequestPayment = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
var obj2xml_1 = require("../utils/obj2xml");
/**
 * putBucketRequestPayment
 * @param {String} bucketName
 * @param {String} payer
 * @param {Object} options
 */
var payerAll = ['BucketOwner', 'Requester'];
function putBucketRequestPayment(bucketName, payer) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var params, paramXMLObj, paramXML, result;
    return _regenerator2.default.async(function putBucketRequestPayment$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    if (!(!payer || payerAll.indexOf(payer) < 0)) {
                        _context.next = 2;
                        break;
                    }

                    throw new Error('payer must be BucketOwner or Requester');

                case 2:
                    checkBucketName_1.checkBucketName(bucketName);
                    params = this._bucketRequestParams('PUT', bucketName, 'requestPayment', options);

                    params.successStatuses = [200];
                    paramXMLObj = {
                        RequestPaymentConfiguration: {
                            Payer: payer
                        }
                    };
                    paramXML = obj2xml_1.obj2xml(paramXMLObj, {
                        headers: true
                    });

                    params.mime = 'xml';
                    params.content = paramXML;
                    _context.next = 11;
                    return _regenerator2.default.awrap(this.request(params));

                case 11:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        status: result.status,
                        res: result.res
                    });

                case 13:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.putBucketRequestPayment = putBucketRequestPayment;

},{"../utils/checkBucketName":114,"../utils/obj2xml":144,"babel-runtime/regenerator":176}],49:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.putBucketTags = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
var obj2xml_1 = require("../utils/obj2xml");
var checkBucketTag_1 = require("../utils/checkBucketTag");
/**
 * putBucketTags
 * @param {String} name - bucket name
 * @param {Object} tag -  bucket tag, eg: `{a: "1", b: "2"}`
 * @param {Object} options
 */
function putBucketTags(name, tag) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var params, paramXMLObj, result;
    return _regenerator2.default.async(function putBucketTags$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    checkBucketTag_1.checkBucketTag(tag);
                    params = this._bucketRequestParams('PUT', name, 'tagging', options);

                    params.successStatuses = [200];
                    tag = (0, _keys2.default)(tag).map(function (key) {
                        return {
                            Key: key,
                            Value: tag[key]
                        };
                    });
                    paramXMLObj = {
                        Tagging: {
                            TagSet: {
                                Tag: tag
                            }
                        }
                    };

                    params.mime = 'xml';
                    params.content = obj2xml_1.obj2xml(paramXMLObj);
                    _context.next = 10;
                    return _regenerator2.default.awrap(this.request(params));

                case 10:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res,
                        status: result.status
                    });

                case 12:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.putBucketTags = putBucketTags;

},{"../utils/checkBucketName":114,"../utils/checkBucketTag":115,"../utils/obj2xml":144,"babel-runtime/core-js/object/keys":161,"babel-runtime/regenerator":176}],50:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.putBucketVersioning = void 0;
var obj2xml_1 = require("../utils/obj2xml");
var checkBucketName_1 = require("../utils/checkBucketName");
/**
 * putBucketVersioning
 * @param {String} name - bucket name
 * @param {String} status
 * @param {Object} options
 */
function putBucketVersioning(name, status) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var params, paramXMLObj, result;
    return _regenerator2.default.async(function putBucketVersioning$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);

                    if (['Enabled', 'Suspended'].includes(status)) {
                        _context.next = 3;
                        break;
                    }

                    throw new Error('status must be Enabled or Suspended');

                case 3:
                    params = this._bucketRequestParams('PUT', name, 'versioning', options);
                    paramXMLObj = {
                        VersioningConfiguration: {
                            Status: status
                        }
                    };

                    params.mime = 'xml';
                    params.content = obj2xml_1.obj2xml(paramXMLObj, {
                        headers: true
                    });
                    _context.next = 9;
                    return _regenerator2.default.awrap(this.request(params));

                case 9:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res,
                        status: result.status
                    });

                case 11:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.putBucketVersioning = putBucketVersioning;

},{"../utils/checkBucketName":114,"../utils/obj2xml":144,"babel-runtime/regenerator":176}],51:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.putBucketWebsite = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
var obj2xml_1 = require("../utils/obj2xml");
var isArray_1 = require("../utils/isArray");
function putBucketWebsite(name) {
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { index: 'index.html' };
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var params, IndexDocument, WebsiteConfiguration, website, result;
    return _regenerator2.default.async(function putBucketWebsite$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkBucketName_1.checkBucketName(name);
                    params = this._bucketRequestParams('PUT', name, 'website', options);
                    IndexDocument = {
                        Suffix: config.index || 'index.html'
                    };
                    WebsiteConfiguration = {
                        IndexDocument: IndexDocument
                    };
                    website = {
                        WebsiteConfiguration: WebsiteConfiguration
                    };

                    if (config.supportSubDir) {
                        IndexDocument.SupportSubDir = config.supportSubDir;
                    }
                    if (config.type) {
                        IndexDocument.Type = config.type;
                    }
                    if (config.error) {
                        WebsiteConfiguration.ErrorDocument = {
                            Key: config.error
                        };
                    }

                    if (!(config.routingRules !== undefined)) {
                        _context.next = 12;
                        break;
                    }

                    if (isArray_1.isArray(config.routingRules)) {
                        _context.next = 11;
                        break;
                    }

                    throw new Error('RoutingRules must be Array');

                case 11:
                    WebsiteConfiguration.RoutingRules = {
                        RoutingRule: config.routingRules
                    };

                case 12:
                    website = obj2xml_1.obj2xml(website);
                    params.content = website;
                    params.mime = 'xml';
                    params.successStatuses = [200];
                    _context.next = 18;
                    return _regenerator2.default.awrap(this.request(params));

                case 18:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res
                    });

                case 20:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.putBucketWebsite = putBucketWebsite;

},{"../utils/checkBucketName":114,"../utils/isArray":137,"../utils/obj2xml":144,"babel-runtime/regenerator":176}],52:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports._bucketRequestParams = void 0;
function _bucketRequestParams(method, bucket, subres, options) {
    return {
        method: method,
        bucket: bucket,
        subres: subres,
        timeout: options && options.timeout,
        ctx: options && options.ctx
    };
}
exports._bucketRequestParams = _bucketRequestParams;

},{}],53:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports._checkUserAgent = void 0;
function _checkUserAgent(ua) {
    var userAgent = ua.replace(/\u03b1/, 'alpha').replace(/\u03b2/, 'beta');
    return userAgent;
}
exports._checkUserAgent = _checkUserAgent;

},{}],54:[function(require,module,exports){
(function (Buffer){
"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._createRequest = void 0;
var crypto_1 = __importDefault(require('./../../../shims/crypto/crypto.js'));
var mime_1 = __importDefault(require("mime"));
var dateformat_1 = __importDefault(require("dateformat"));
var copy_to_1 = __importDefault(require("copy-to"));
var path_1 = __importDefault(require("path"));
var debug_1 = __importDefault(require("debug"));
var getResource_1 = require("../utils/getResource");
var authorization_1 = require("../utils/authorization");
var getReqUrl_1 = require("../utils/getReqUrl");
var encoder_1 = require("../utils/encoder");
var _debug = debug_1.default('ali-oss');
function getHeader(headers, name) {
    return headers[name] || headers[name.toLowerCase()];
}
function delHeader(headers, name) {
    delete headers[name];
    delete headers[name.toLowerCase()];
}
function _createRequest(params) {
    var date = new Date();
    if (this.options.amendTimeSkewed) {
        date = +new Date() + this.options.amendTimeSkewed;
    }
    var headers = {
        'x-oss-date': dateformat_1.default(date, 'UTC:ddd, dd mmm yyyy HH:MM:ss \'GMT\''),
        'x-oss-user-agent': this.userAgent
    };
    if (this.userAgent.includes('nodejs')) {
        headers['User-Agent'] = this.userAgent;
    }
    if (this.options.isRequestPay) {
        (0, _assign2.default)(headers, { 'x-oss-request-payer': 'requester' });
    }
    if (this.options.stsToken) {
        headers['x-oss-security-token'] = this.options.stsToken;
    }
    copy_to_1.default(params.headers).to(headers);
    if (!getHeader(headers, 'Content-Type')) {
        if (params.mime && params.mime.indexOf('/') > 0) {
            headers['Content-Type'] = params.mime;
        } else {
            headers['Content-Type'] = mime_1.default.getType(params.mime || path_1.default.extname(params.object || ''));
        }
    }
    if (!getHeader(headers, 'Content-Type')) {
        delHeader(headers, 'Content-Type');
    }
    if (params.content) {
        headers['Content-Md5'] = crypto_1.default.createHash('md5').update(Buffer.from(params.content, 'utf8')).digest('base64');
        if (!headers['Content-Length']) {
            headers['Content-Length'] = params.content.length;
        }
    }
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    for (var k in headers) {
        if (headers[k] && hasOwnProperty.call(headers, k)) {
            headers[k] = encoder_1.encoder(String(headers[k]), this.options.headerEncoding);
        }
    }
    var authResource = getResource_1.getResource(params, this.options.headerEncoding);
    headers.authorization = authorization_1.authorization(params.method, authResource, params.subres, headers, this.options, this.options.headerEncoding);
    var url = getReqUrl_1.getReqUrl(params, this.options);
    _debug('request %s %s, with headers %j, !!stream: %s', params.method, url, headers, !!params.stream);
    var timeout = params.timeout || this.options.timeout;
    var reqParams = {
        method: params.method,
        content: params.content,
        stream: params.stream,
        headers: headers,
        timeout: timeout,
        writeStream: params.writeStream,
        customResponse: params.customResponse,
        ctx: params.ctx || this.ctx
    };
    if (this.agent) {
        reqParams.agent = this.agent;
    }
    if (this.httpsAgent) {
        reqParams.httpsAgent = this.httpsAgent;
    }
    return {
        url: url,
        params: reqParams
    };
}
exports._createRequest = _createRequest;

}).call(this,require("buffer").Buffer)
},{"../utils/authorization":112,"../utils/encoder":125,"../utils/getReqUrl":131,"../utils/getResource":132,"./../../../shims/crypto/crypto.js":347,"babel-runtime/core-js/object/assign":156,"buffer":184,"copy-to":187,"dateformat":300,"debug":351,"mime":312,"path":315}],55:[function(require,module,exports){
"use strict";

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._getReqUrl = void 0;
var url_1 = __importDefault(require("url"));
var copy_to_1 = __importDefault(require("copy-to"));
var merge_descriptors_1 = __importDefault(require("merge-descriptors"));
var is_type_of_1 = __importDefault(require("is-type-of"));
var isIP_1 = require("../utils/isIP");
var escapeName_1 = require("../utils/escapeName");
function _getReqUrl(params) {
    var _escape = this._escape || escapeName_1.escapeName;
    var ep = {};
    copy_to_1.default(this.options.endpoint).to(ep);
    var _isIP = isIP_1.isIP(ep.hostname);
    var isCname = this.options.cname;
    if (params.bucket && !isCname && !_isIP && !this.options.sldEnable) {
        ep.host = params.bucket + "." + ep.host;
    }
    var resourcePath = '/';
    if (params.bucket && (this.options.sldEnable || _isIP)) {
        resourcePath += params.bucket + "/";
    }
    if (params.object) {
        // Preserve '/' in result url
        resourcePath += _escape(params.object).replace(/\+/g, '%2B');
    }
    ep.pathname = resourcePath;
    var query = {};
    if (params.query) {
        merge_descriptors_1.default(query, params.query);
    }
    if (params.subres) {
        var subresAsQuery = {};
        if (is_type_of_1.default.string(params.subres)) {
            subresAsQuery[params.subres] = '';
        } else if (is_type_of_1.default.array(params.subres)) {
            params.subres.forEach(function (k) {
                subresAsQuery[k] = '';
            });
        } else {
            subresAsQuery = params.subres;
        }
        merge_descriptors_1.default(query, subresAsQuery);
    }
    ep.query = query;
    return url_1.default.format(ep);
}
exports._getReqUrl = _getReqUrl;

},{"../utils/escapeName":126,"../utils/isIP":141,"copy-to":187,"is-type-of":352,"merge-descriptors":310,"url":340}],56:[function(require,module,exports){
(function (process){
"use strict";

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._getUserAgent = void 0;
var platform_1 = __importDefault(require("platform"));
var _checkUserAgent_1 = require("./_checkUserAgent");
var version_1 = require("../../browser/version");
/*
 * Get User-Agent for browser & node.js
 * @example
 *   aliyun-sdk-nodejs/4.1.2 Node.js 5.3.0 on Darwin 64-bit
 *   aliyun-sdk-js/4.1.2 Safari 9.0 on Apple iPhone(iOS 9.2.1)
 *   aliyun-sdk-js/4.1.2 Chrome 43.0.2357.134 32-bit on Windows Server 2008 R2 / 7 64-bit
 */
function _getUserAgent() {
    var agent = process && process.browser ? 'js' : 'nodejs';
    var sdk = "aliyun-sdk-" + agent + "/" + version_1.version;
    var plat = platform_1.default.description;
    if (!plat && process) {
        plat = "Node.js " + process.version.slice(1) + " on " + process.platform + " " + process.arch;
    }
    return _checkUserAgent_1._checkUserAgent(sdk + " " + plat);
}
exports._getUserAgent = _getUserAgent;

}).call(this,require('_process'))
},{"../../browser/version":10,"./_checkUserAgent":53,"_process":318,"platform":316}],57:[function(require,module,exports){
"use strict";

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._objectRequestParams = void 0;
var copy_to_1 = __importDefault(require("copy-to"));
var objectName_1 = require("../utils/objectName");
function _objectRequestParams(method, name) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var bucket = this.options.bucket;

    if (!bucket) {
        throw new Error('Please create a bucket first');
    }
    name = objectName_1.objectName(name);
    var params = {
        object: name,
        bucket: bucket,
        method: method,
        subres: options && options.subres,
        timeout: options && options.timeout,
        ctx: options && options.ctx
    };
    if (options.headers) {
        params.headers = {};
        copy_to_1.default(options.headers).to(params.headers);
    }
    return params;
}
exports._objectRequestParams = _objectRequestParams;

},{"../utils/objectName":145,"copy-to":187}],58:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports._stop = void 0;
function _stop() {
    this.options.cancelFlag = true;
}
exports._stop = _stop;

},{}],59:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.cancel = void 0;
var abortMultipartUpload_1 = require("../multipart/abortMultipartUpload");
var isArray_1 = require("../utils/isArray");
/**
 * cancel operation, now can use with multipartUpload
 * @param {Object} abort
 *        {String} anort.name object key
 *        {String} anort.uploadId upload id
 *        {String} anort.options timeout
 */
function cancel(abort) {
    this.options.cancelFlag = true;
    if (isArray_1.isArray(this.multipartUploadStreams)) {
        this.multipartUploadStreams.forEach(function (_) {
            if (_.destroyed === false) {
                var err = {
                    name: 'cancel',
                    message: 'multipartUpload cancel'
                };
                _.destroy(err);
            }
        });
    }
    this.multipartUploadStreams = [];
    if (abort) {
        abortMultipartUpload_1.abortMultipartUpload.call(this, abort.name, abort.uploadId, abort.options);
    }
}
exports.cancel = cancel;

},{"../multipart/abortMultipartUpload":72,"../utils/isArray":137}],60:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucket = void 0;
function getBucket() {
    return this.options.bucket;
}
exports.getBucket = getBucket;

},{}],61:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var _bucketRequestParams_1 = require("./_bucketRequestParams");
var _checkUserAgent_1 = require("./_checkUserAgent");
var _createRequest_1 = require("./_createRequest");
var _getReqUrl_1 = require("./_getReqUrl");
var _getUserAgent_1 = require("./_getUserAgent");
var _objectRequestParams_1 = require("./_objectRequestParams");
var _stop_1 = require("./_stop");
var cancel_1 = require("./cancel");
var getBucket_1 = require("./getBucket");
var isCancel_1 = require("./isCancel");
var request_1 = require("./request");
var requestError_1 = require("./requestError");
var resetCancelFlag_1 = require("./resetCancelFlag");
var setBucket_1 = require("./setBucket");
var setSLDEnabled_1 = require("./setSLDEnabled");
var signature_1 = require("./signature");
exports.default = {
    _bucketRequestParams: _bucketRequestParams_1._bucketRequestParams,
    _checkUserAgent: _checkUserAgent_1._checkUserAgent,
    _createRequest: _createRequest_1._createRequest,
    _getReqUrl: _getReqUrl_1._getReqUrl,
    _getUserAgent: _getUserAgent_1._getUserAgent,
    _objectRequestParams: _objectRequestParams_1._objectRequestParams,
    _stop: _stop_1._stop,
    cancel: cancel_1.cancel,
    getBucket: getBucket_1.getBucket,
    isCancel: isCancel_1.isCancel,
    request: request_1.request,
    requestError: requestError_1.requestError,
    resetCancelFlag: resetCancelFlag_1.resetCancelFlag,
    setBucket: setBucket_1.setBucket,
    useBucket: setBucket_1.setBucket,
    setSLDEnabled: setSLDEnabled_1.setSLDEnabled,
    signature: signature_1.signature
};

},{"./_bucketRequestParams":52,"./_checkUserAgent":53,"./_createRequest":54,"./_getReqUrl":55,"./_getUserAgent":56,"./_objectRequestParams":57,"./_stop":58,"./cancel":59,"./getBucket":60,"./isCancel":63,"./request":64,"./requestError":65,"./resetCancelFlag":66,"./setBucket":67,"./setSLDEnabled":68,"./signature":69}],62:[function(require,module,exports){
"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOptions = void 0;
var humanize_ms_1 = __importDefault(require("humanize-ms"));
var url_1 = __importDefault(require("url"));
var checkBucketName_1 = require("../utils/checkBucketName");
function setEndpoint(endpoint, secure) {
    var url = url_1.default.parse(endpoint);
    if (!url.protocol) {
        url = url_1.default.parse("http" + (secure ? 's' : '') + "://" + endpoint);
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('Endpoint protocol must be http or https.');
    }
    return url;
}
function setRegion(region, internal, secure) {
    var protocol = secure ? 'https://' : 'http://';
    var suffix = internal ? '-internal.aliyuncs.com' : '.aliyuncs.com';
    var prefix = 'vpc100-oss-cn-';
    // aliyun VPC region: https://help.aliyun.com/knowledge_detail/38740.html
    if (region.substr(0, prefix.length) === prefix) {
        suffix = '.aliyuncs.com';
    }
    return url_1.default.parse(protocol + region + suffix);
}
// check local web protocol,if https secure default set true , if http secure default set false
function isHttpsWebProtocol() {
    var secure = false;
    try {
        secure = location && location.protocol === 'https:';
        // eslint-disable-next-line no-empty
    } catch (error) {}
    return secure;
}
function initOptions(options) {
    if (!options || !options.accessKeyId || !options.accessKeySecret) {
        throw new Error('require accessKeyId, accessKeySecret');
    }
    if (options.bucket) {
        checkBucketName_1.checkBucketName(options.bucket);
    }
    var opts = (0, _assign2.default)({
        region: 'oss-cn-hangzhou',
        internal: false,
        secure: isHttpsWebProtocol(),
        timeout: 60000,
        bucket: null,
        endpoint: null,
        cname: false,
        isRequestPay: false,
        sldEnable: false,
        useFetch: false,
        headerEncoding: 'utf-8',
        amendTimeSkewed: 0
    }, options);
    opts.accessKeyId = opts.accessKeyId.trim();
    opts.accessKeySecret = opts.accessKeySecret.trim();
    if (opts.timeout) {
        opts.timeout = humanize_ms_1.default(opts.timeout);
    }
    if (opts.endpoint) {
        opts.endpoint = setEndpoint(opts.endpoint, opts.secure);
    } else if (opts.region) {
        opts.endpoint = setRegion(opts.region, opts.internal, opts.secure);
    } else {
        throw new Error('require options.endpoint or options.region');
    }
    opts.inited = true;
    return opts;
}
exports.initOptions = initOptions;

},{"../utils/checkBucketName":114,"babel-runtime/core-js/object/assign":156,"humanize-ms":304,"url":340}],63:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.isCancel = void 0;
function isCancel() {
    return this.options.cancelFlag;
}
exports.isCancel = isCancel;

},{}],64:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = void 0;
var debug_1 = __importDefault(require("debug"));
var parseXML_1 = require("../utils/parseXML");
var debug = debug_1.default('ali-oss');
/**
 * request oss server
 * @param {Object} params
 *   - {String} object
 *   - {String} bucket
 *   - {Object} [headers]
 *   - {Object} [query]
 *   - {Buffer} [content]
 *   - {Stream} [stream]
 *   - {Stream} [writeStream]
 *   - {String} [mime]
 *   - {Boolean} [xmlResponse]
 *   - {Boolean} [customResponse]
 *   - {Number} [timeout]
 *   - {Object} [ctx] request context, default is `this.ctx`
 *
 * @api private
 */
function request(params) {
    var reqParams, isNode, result, reqErr, useStream, err;
    return _regenerator2.default.async(function request$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    reqParams = this._createRequest(params);
                    isNode = this._getUserAgent().includes('nodejs');

                    if (!isNode && !this.options.useFetch) {
                        reqParams.params.mode = 'disable-fetch';
                    }
                    result = void 0;
                    reqErr = void 0;
                    useStream = !!params.stream;
                    _context.prev = 6;
                    _context.next = 9;
                    return _regenerator2.default.awrap(this.urllib.request(reqParams.url, reqParams.params));

                case 9:
                    result = _context.sent;

                    debug('response %s %s, got %s, headers: %j', params.method, reqParams.url, result.status, result.headers);
                    _context.next = 16;
                    break;

                case 13:
                    _context.prev = 13;
                    _context.t0 = _context["catch"](6);

                    reqErr = _context.t0;

                case 16:
                    err = void 0;

                    if (!(result && params.successStatuses && params.successStatuses.indexOf(result.status) === -1)) {
                        _context.next = 29;
                        break;
                    }

                    _context.next = 20;
                    return _regenerator2.default.awrap(this.requestError(result));

                case 20:
                    err = _context.sent;

                    if (!(err.code === 'RequestTimeTooSkewed' && !useStream && !isNode)) {
                        _context.next = 26;
                        break;
                    }

                    this.options.amendTimeSkewed = +new Date(err.serverTime) - new Date().valueOf();
                    _context.next = 25;
                    return _regenerator2.default.awrap(this.request(params));

                case 25:
                    return _context.abrupt("return", _context.sent);

                case 26:
                    err.params = params;
                    _context.next = 33;
                    break;

                case 29:
                    if (!reqErr) {
                        _context.next = 33;
                        break;
                    }

                    _context.next = 32;
                    return _regenerator2.default.awrap(this.requestError(reqErr));

                case 32:
                    err = _context.sent;

                case 33:
                    if (!err) {
                        _context.next = 38;
                        break;
                    }

                    if (!(this.sendToWormhole && params.customResponse && result && result.res)) {
                        _context.next = 37;
                        break;
                    }

                    _context.next = 37;
                    return _regenerator2.default.awrap(this.sendToWormhole(result.res));

                case 37:
                    throw err;

                case 38:
                    if (!params.xmlResponse) {
                        _context.next = 42;
                        break;
                    }

                    _context.next = 41;
                    return _regenerator2.default.awrap(parseXML_1.parseXML(result.data));

                case 41:
                    result.data = _context.sent;

                case 42:
                    return _context.abrupt("return", result);

                case 43:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this, [[6, 13]]);
}
exports.request = request;

},{"../utils/parseXML":147,"babel-runtime/regenerator":176,"debug":351}],65:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestError = void 0;
var debug_1 = __importDefault(require("debug"));
var parseXML_1 = require("../utils/parseXML");
var debug = debug_1.default('ali-oss');
function requestError(result) {
    var err, message, info, msg;
    return _regenerator2.default.async(function requestError$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    err = null;

                    if (!(!result.data || !result.data.length)) {
                        _context.next = 5;
                        break;
                    }

                    if (result.status === -1 || result.status === -2) {
                        // -1 is net error , -2 is timeout
                        err = new Error(result.message);
                        err.name = result.name;
                        err.status = result.status;
                        err.code = result.name;
                    } else {
                        // HEAD not exists resource
                        if (result.status === 404) {
                            err = new Error('Object not exists');
                            err.name = 'NoSuchKeyError';
                            err.status = 404;
                            err.code = 'NoSuchKey';
                        } else if (result.status === 412) {
                            err = new Error('Pre condition failed');
                            err.name = 'PreconditionFailedError';
                            err.status = 412;
                            err.code = 'PreconditionFailed';
                        } else {
                            err = new Error("Unknow error, status: " + result.status);
                            err.name = 'UnknowError';
                            err.status = result.status;
                        }
                        err.requestId = result.headers['x-oss-request-id'];
                        err.host = '';
                    }
                    _context.next = 33;
                    break;

                case 5:
                    message = String(result.data);

                    debug('request response error data: %s', message);
                    info = void 0;
                    _context.prev = 8;
                    _context.next = 11;
                    return _regenerator2.default.awrap(parseXML_1.parseXML(message));

                case 11:
                    _context.t0 = _context.sent;

                    if (_context.t0) {
                        _context.next = 14;
                        break;
                    }

                    _context.t0 = {};

                case 14:
                    info = _context.t0;
                    _context.next = 24;
                    break;

                case 17:
                    _context.prev = 17;
                    _context.t1 = _context["catch"](8);

                    debug(message);
                    _context.t1.message += "\nraw xml: " + message;
                    _context.t1.status = result.status;
                    _context.t1.requestId = result.headers['x-oss-request-id'];
                    return _context.abrupt("return", _context.t1);

                case 24:
                    msg = info.Message || "unknow request error, status: " + result.status;

                    if (info.Condition) {
                        msg += " (condition: " + info.Condition + ")";
                    }
                    err = new Error(msg);
                    err.name = info.Code ? info.Code + "Error" : 'UnknowError';
                    err.status = result.status;
                    err.code = info.Code;
                    err.requestId = info.RequestId;
                    err.hostId = info.HostId;
                    err.serverTime = info.ServerTime;

                case 33:
                    debug('generate error %j', err);
                    return _context.abrupt("return", err);

                case 35:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this, [[8, 17]]);
}
exports.requestError = requestError;

},{"../utils/parseXML":147,"babel-runtime/regenerator":176,"debug":351}],66:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.resetCancelFlag = void 0;
function resetCancelFlag() {
    this.options.cancelFlag = false;
}
exports.resetCancelFlag = resetCancelFlag;

},{}],67:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.setBucket = void 0;
var checkBucketName_1 = require("../utils/checkBucketName");
function setBucket(name) {
    checkBucketName_1.checkBucketName(name);
    this.options.bucket = name;
    return this;
}
exports.setBucket = setBucket;

},{"../utils/checkBucketName":114}],68:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.setSLDEnabled = void 0;
function setSLDEnabled(enable) {
    this.options.sldEnable = !!enable;
    return this;
}
exports.setSLDEnabled = setSLDEnabled;

},{}],69:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.signature = void 0;
var signUtils_1 = require("../utils/signUtils");
/**
 * get OSS signature
 * @param {String} stringToSign
 * @return {String} the signature
 */
function signature(stringToSign) {
  return signUtils_1.computeSignature(this.options.accessKeySecret, stringToSign, this.options.headerEncoding);
}
exports.signature = signature;

},{"../utils/signUtils":149}],70:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var processObjectSave_1 = require("./processObjectSave");
exports.default = {
    processObjectSave: processObjectSave_1.processObjectSave
};

},{"./processObjectSave":71}],71:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processObjectSave = void 0;
var querystring_1 = __importDefault(require("querystring"));
var Base64_1 = require("js-base64/Base64");
var checkBucketName_1 = require("../utils/checkBucketName");
var objectName_1 = require("../utils/objectName");
function processObjectSave(sourceObject, targetObject, process, targetBucket) {
    var params, bucketParam, content, result;
    return _regenerator2.default.async(function processObjectSave$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkArgs(sourceObject, 'sourceObject');
                    checkArgs(targetObject, 'targetObject');
                    checkArgs(process, 'process');
                    targetObject = objectName_1.objectName(targetObject);
                    if (targetBucket) {
                        checkBucketName_1.checkBucketName(targetBucket);
                    }
                    params = this._objectRequestParams('POST', sourceObject, {
                        subres: 'x-oss-process'
                    });
                    bucketParam = targetBucket ? ",b_" + Base64_1.Base64.encode(targetBucket) : '';

                    targetObject = Base64_1.Base64.encode(targetObject);
                    content = {
                        'x-oss-process': process + "|sys/saveas,o_" + targetObject + bucketParam
                    };

                    params.content = querystring_1.default.stringify(content);
                    _context.next = 12;
                    return _regenerator2.default.awrap(this.request(params));

                case 12:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res,
                        status: result.res.status
                    });

                case 14:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.processObjectSave = processObjectSave;
function checkArgs(name, key) {
    if (!name) {
        throw new Error(key + " is required");
    }
    if (typeof name !== 'string') {
        throw new Error(key + " must be String");
    }
}

},{"../utils/checkBucketName":114,"../utils/objectName":145,"babel-runtime/regenerator":176,"js-base64/Base64":309,"querystring":322}],72:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.abortMultipartUpload = void 0;
var copy_to_1 = __importDefault(require("copy-to"));
var _stop_1 = require("../client/_stop");
/**
 * Abort a multipart upload transaction
 * @param {String} name the object name
 * @param {String} uploadId the upload id
 * @param {Object} options
 */
function abortMultipartUpload(name, uploadId) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var opt, params, result;
    return _regenerator2.default.async(function abortMultipartUpload$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _stop_1._stop.call(this);
                    opt = {};

                    copy_to_1.default(options).to(opt);
                    opt.subres = { uploadId: uploadId };
                    params = this._objectRequestParams('DELETE', name, opt);

                    params.successStatuses = [204];
                    _context.next = 8;
                    return _regenerator2.default.awrap(this.request(params));

                case 8:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res
                    });

                case 10:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.abortMultipartUpload = abortMultipartUpload;

},{"../client/_stop":58,"babel-runtime/regenerator":176,"copy-to":187}],73:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.completeMultipartUpload = void 0;
var deepCopy_1 = require("../utils/deepCopy");
var encodeCallback_1 = require("../utils/encodeCallback");
var obj2xml_1 = require("../utils/obj2xml");
/**
 * Complete a multipart upload transaction
 * @param {String} name the object name
 * @param {String} uploadId the upload id
 * @param {Array} parts the uploaded parts, each in the structure:
 *        {Integer} number partNo
 *        {String} etag  part etag  uploadPartCopy result.res.header.etag
 * @param {Object} options
 *         {Object} options.callback The callback parameter is composed of a JSON string encoded in Base64
 *         {String} options.callback.url  the OSS sends a callback request to this URL
 *         {String} options.callback.host  The host header value for initiating callback requests
 *         {String} options.callback.body  The value of the request body when a callback is initiated
 *         {String} options.callback.contentType  The Content-Type of the callback requests initiatiated
 *         {Object} options.callback.customValue  Custom parameters are a map of key-values, e.g:
 *                   customValue = {
 *                     key1: 'value1',
 *                     key2: 'value2'
 *                   }
 */
function completeMultipartUpload(name, uploadId, parts) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var completeParts, xmlParamObj, opt, params, result, ret;
    return _regenerator2.default.async(function completeMultipartUpload$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    completeParts = parts.concat().sort(function (a, b) {
                        return a.number - b.number;
                    }).filter(function (item, index, arr) {
                        return !index || item.number !== arr[index - 1].number;
                    });
                    xmlParamObj = {
                        CompleteMultipartUpload: {
                            Part: completeParts.map(function (_) {
                                return {
                                    PartNumber: _.number,
                                    ETag: _.etag
                                };
                            })
                        }
                    };
                    opt = deepCopy_1.deepCopy(options);

                    if (opt.headers) delete opt.headers['x-oss-server-side-encryption'];
                    opt.subres = { uploadId: uploadId };
                    params = this._objectRequestParams('POST', name, opt);

                    encodeCallback_1.encodeCallback(params, opt);
                    params.mime = 'xml';
                    params.content = obj2xml_1.obj2xml(xmlParamObj, { headers: true });
                    if (!(params.headers && params.headers['x-oss-callback'])) {
                        params.xmlResponse = true;
                    }
                    params.successStatuses = [200];
                    _context.next = 13;
                    return _regenerator2.default.awrap(this.request(params));

                case 13:
                    result = _context.sent;
                    ret = {
                        res: result.res,
                        bucket: params.bucket,
                        name: name,
                        etag: result.res.headers.etag
                    };

                    if (params.headers && params.headers['x-oss-callback']) {
                        ret.data = JSON.parse(result.data.toString());
                    }
                    return _context.abrupt("return", ret);

                case 17:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.completeMultipartUpload = completeMultipartUpload;

},{"../utils/deepCopy":121,"../utils/encodeCallback":124,"../utils/obj2xml":144,"babel-runtime/regenerator":176}],74:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadPart = void 0;
var copy_to_1 = __importDefault(require("copy-to"));
/**
 * Upload a part in a multipart upload transaction
 * @param {String} name the object name
 * @param {String} uploadId the upload id
 * @param {Integer} partNo the part number
 * @param {Object} data the body data
 * @param {Object} options
 */
function handleUploadPart(name, uploadId, partNo, data) {
    var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
    var opt, params, result;
    return _regenerator2.default.async(function handleUploadPart$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    opt = {};

                    copy_to_1.default(options, false).to(opt);
                    opt.headers = opt.headers || {};
                    opt.headers['Content-Length'] = data.size;
                    if (opt.headers) delete opt.headers['x-oss-server-side-encryption'];
                    opt.subres = {
                        partNumber: partNo,
                        uploadId: uploadId
                    };
                    params = this._objectRequestParams('PUT', name, opt);

                    params.mime = opt.mime;
                    params.stream = data.stream;
                    params.successStatuses = [200];
                    _context.next = 12;
                    return _regenerator2.default.awrap(this.request(params));

                case 12:
                    result = _context.sent;

                    if (result.res.headers.etag) {
                        _context.next = 15;
                        break;
                    }

                    throw new Error('Please set the etag of expose-headers in OSS \n https://help.aliyun.com/document_detail/32069.html');

                case 15:
                    data.stream = null;
                    params.stream = null;
                    return _context.abrupt("return", {
                        name: name,
                        etag: result.res.headers.etag,
                        res: result.res
                    });

                case 18:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.handleUploadPart = handleUploadPart;

},{"babel-runtime/regenerator":176,"copy-to":187}],75:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var completeMultipartUpload_1 = require("./completeMultipartUpload");
var initMultipartUpload_1 = require("./initMultipartUpload");
var listUploads_1 = require("./listUploads");
var listParts_1 = require("./listParts");
var abortMultipartUpload_1 = require("./abortMultipartUpload");
var uploadPart_1 = require("./uploadPart");
var handleUploadPart_1 = require("./handleUploadPart");
var resumeMultipart_1 = require("./resumeMultipart");
var multipartUploadCopy_1 = require("./multipartUploadCopy");
var uploadPartCopy_1 = require("./uploadPartCopy");
exports.default = {
    completeMultipartUpload: completeMultipartUpload_1.completeMultipartUpload,
    initMultipartUpload: initMultipartUpload_1.initMultipartUpload,
    listUploads: listUploads_1.listUploads,
    listParts: listParts_1.listParts,
    abortMultipartUpload: abortMultipartUpload_1.abortMultipartUpload,
    uploadPart: uploadPart_1.uploadPart,
    handleUploadPart: handleUploadPart_1.handleUploadPart,
    resumeMultipart: resumeMultipart_1.resumeMultipart,
    multipartUploadCopy: multipartUploadCopy_1.multipartUploadCopy,
    uploadPartCopy: uploadPartCopy_1.uploadPartCopy
};

},{"./abortMultipartUpload":72,"./completeMultipartUpload":73,"./handleUploadPart":74,"./initMultipartUpload":76,"./listParts":77,"./listUploads":78,"./multipartUploadCopy":79,"./resumeMultipart":80,"./uploadPart":81,"./uploadPartCopy":82}],76:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMultipartUpload = void 0;
var copy_to_1 = __importDefault(require("copy-to"));
var convertMetaToHeaders_1 = require("../utils/convertMetaToHeaders");
function initMultipartUpload(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var opt, params, result;
    return _regenerator2.default.async(function initMultipartUpload$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    opt = {};

                    copy_to_1.default(options).to(opt);
                    opt.headers = opt.headers || {};
                    convertMetaToHeaders_1.convertMetaToHeaders(options.meta, opt.headers);
                    opt.subres = 'uploads';
                    params = this._objectRequestParams('POST', name, opt);

                    params.mime = options.mime;
                    params.xmlResponse = true;
                    params.successStatuses = [200];
                    _context.next = 11;
                    return _regenerator2.default.awrap(this.request(params));

                case 11:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res,
                        bucket: result.data.Bucket,
                        name: result.data.Key,
                        uploadId: result.data.UploadId
                    });

                case 13:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.initMultipartUpload = initMultipartUpload;

},{"../utils/convertMetaToHeaders":119,"babel-runtime/regenerator":176,"copy-to":187}],77:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listParts = void 0;
var copy_to_1 = __importDefault(require("copy-to"));
/**
 * List the done uploadPart parts
 * @param {String} name object name
 * @param {String} uploadId multipart upload id
 * @param {Object} query
 * {Number} query.max-parts The maximum part number in the response of the OSS. Default value: 1000
 * {Number} query.part-number-marker Starting position of a specific list.
 * {String} query.encoding-type Specify the encoding of the returned content and the encoding type.
 * @param {Object} options
 * @return {Object} result
 */
function listParts(name, uploadId) {
    var query = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var opt, params, result;
    return _regenerator2.default.async(function listParts$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    opt = {};

                    copy_to_1.default(options).to(opt);
                    opt.subres = {
                        uploadId: uploadId
                    };
                    params = this._objectRequestParams('GET', name, opt);

                    params.query = query;
                    params.xmlResponse = true;
                    params.successStatuses = [200];
                    _context.next = 9;
                    return _regenerator2.default.awrap(this.request(params));

                case 9:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res,
                        uploadId: result.data.UploadId,
                        bucket: result.data.Bucket,
                        name: result.data.Key,
                        partNumberMarker: result.data.PartNumberMarker,
                        nextPartNumberMarker: result.data.NextPartNumberMarker,
                        maxParts: result.data.MaxParts,
                        isTruncated: result.data.IsTruncated,
                        parts: result.data.Part || []
                    });

                case 11:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.listParts = listParts;

},{"babel-runtime/regenerator":176,"copy-to":187}],78:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUploads = void 0;
var copy_to_1 = __importDefault(require("copy-to"));
/**
 * List the on-going multipart uploads
 * https://help.aliyun.com/document_detail/31997.html
 * @param {Object} options
 * @return {Array} the multipart uploads
 */
function listUploads() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var opt, params, result, uploads;
    return _regenerator2.default.async(function listUploads$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    opt = {};

                    copy_to_1.default(options).to(opt);
                    opt.subres = 'uploads';
                    params = this._objectRequestParams('GET', '', opt);

                    params.query = query;
                    params.xmlResponse = true;
                    params.successStatuses = [200];
                    _context.next = 9;
                    return _regenerator2.default.awrap(this.request(params));

                case 9:
                    result = _context.sent;
                    uploads = result.data.Upload || [];

                    if (!Array.isArray(uploads)) {
                        uploads = [uploads];
                    }
                    uploads = uploads.map(function (up) {
                        return {
                            name: up.Key,
                            uploadId: up.UploadId,
                            initiated: up.Initiated
                        };
                    });
                    return _context.abrupt("return", {
                        res: result.res,
                        uploads: uploads,
                        bucket: result.data.Bucket,
                        nextKeyMarker: result.data.NextKeyMarker,
                        nextUploadIdMarker: result.data.NextUploadIdMarker,
                        isTruncated: result.data.IsTruncated === 'true'
                    });

                case 14:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.listUploads = listUploads;

},{"babel-runtime/regenerator":176,"copy-to":187}],79:[function(require,module,exports){
"use strict";

var _from = require("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._divideMultipartCopyParts = exports._resumeMultipartCopy = exports.multipartUploadCopy = void 0;
/* eslint-disable require-atomic-updates */
var copy_to_1 = __importDefault(require("copy-to"));
var debug_1 = __importDefault(require("debug"));
var _getObjectMeta_1 = require("../utils/_getObjectMeta");
var initMultipartUpload_1 = require("./initMultipartUpload");
var getPartSize_1 = require("../utils/getPartSize");
var _makeCancelEvent_1 = require("../utils/_makeCancelEvent");
var _parallel_1 = require("../utils/_parallel");
var uploadPartCopy_1 = require("./uploadPartCopy");
var completeMultipartUpload_1 = require("./completeMultipartUpload");
var debug = debug_1.default('ali-oss:multipart-copy');
/**
 * @param {String} name copy object name
 * @param {Object} sourceData
 *        {String} sourceData.sourceKey  the source object name
 *        {String} sourceData.sourceBucketName  the source bucket name
 *        {Number} sourceData.startOffset  data copy start byte offset, e.g: 0
 *        {Number} sourceData.endOffset  data copy end byte offset, e.g: 102400
 * @param {Object} options
 *        {Number} options.partSize
 */
function multipartUploadCopy(name, sourceData) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var _options$versionId, versionId, metaOpt, objectMeta, fileSize, minPartSize, copySize, init, uploadId, partSize, checkpoint;

    return _regenerator2.default.async(function multipartUploadCopy$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    this.resetCancelFlag();
                    _options$versionId = options.versionId, versionId = _options$versionId === undefined ? null : _options$versionId;
                    metaOpt = {
                        versionId: versionId
                    };
                    _context.next = 5;
                    return _regenerator2.default.awrap(_getObjectMeta_1._getObjectMeta.call(this, sourceData.sourceBucketName, sourceData.sourceKey, metaOpt));

                case 5:
                    objectMeta = _context.sent;
                    fileSize = objectMeta.res.headers['content-length'];

                    sourceData.startOffset = sourceData.startOffset || 0;
                    sourceData.endOffset = sourceData.endOffset || fileSize;

                    if (!(options.checkpoint && options.checkpoint.uploadId)) {
                        _context.next = 13;
                        break;
                    }

                    _context.next = 12;
                    return _regenerator2.default.awrap(_resumeMultipartCopy.call(this, options.checkpoint, sourceData, options));

                case 12:
                    return _context.abrupt("return", _context.sent);

                case 13:
                    minPartSize = 100 * 1024;
                    copySize = sourceData.endOffset - sourceData.startOffset;

                    if (!(copySize < minPartSize)) {
                        _context.next = 17;
                        break;
                    }

                    throw new Error("copySize must not be smaller than " + minPartSize);

                case 17:
                    if (!(options.partSize && options.partSize < minPartSize)) {
                        _context.next = 19;
                        break;
                    }

                    throw new Error("partSize must not be smaller than " + minPartSize);

                case 19:
                    _context.next = 21;
                    return _regenerator2.default.awrap(initMultipartUpload_1.initMultipartUpload.call(this, name, options));

                case 21:
                    init = _context.sent;
                    uploadId = init.uploadId;
                    partSize = getPartSize_1.getPartSize(copySize, options.partSize);
                    checkpoint = {
                        name: name,
                        copySize: copySize,
                        partSize: partSize,
                        uploadId: uploadId,
                        doneParts: []
                    };

                    if (!(options && options.progress)) {
                        _context.next = 28;
                        break;
                    }

                    _context.next = 28;
                    return _regenerator2.default.awrap(options.progress(0, checkpoint, init.res));

                case 28:
                    _context.next = 30;
                    return _regenerator2.default.awrap(_resumeMultipartCopy.call(this, checkpoint, sourceData, options));

                case 30:
                    return _context.abrupt("return", _context.sent);

                case 31:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.multipartUploadCopy = multipartUploadCopy;
/*
 * Resume multipart copy from checkpoint. The checkpoint will be
 * updated after each successful part copy.
 * @param {Object} checkpoint the checkpoint
 * @param {Object} options
 */
function _resumeMultipartCopy(checkpoint, sourceData, options) {
    var _this = this;

    var _options$versionId2, versionId, metaOpt, copySize, partSize, uploadId, doneParts, name, partOffs, numParts, uploadPartCopyOptions, uploadPartJob, all, done, todo, defaultParallel, parallel, i, errors, err;

    return _regenerator2.default.async(function _resumeMultipartCopy$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    if (!this.isCancel()) {
                        _context3.next = 2;
                        break;
                    }

                    throw _makeCancelEvent_1._makeCancelEvent();

                case 2:
                    _options$versionId2 = options.versionId, versionId = _options$versionId2 === undefined ? null : _options$versionId2;
                    metaOpt = {
                        versionId: versionId
                    };
                    copySize = checkpoint.copySize, partSize = checkpoint.partSize, uploadId = checkpoint.uploadId, doneParts = checkpoint.doneParts, name = checkpoint.name;
                    partOffs = _divideMultipartCopyParts(copySize, partSize, sourceData.startOffset);
                    numParts = partOffs.length;
                    uploadPartCopyOptions = {
                        headers: {}
                    };

                    if (options.copyheaders) {
                        copy_to_1.default(options.copyheaders).to(uploadPartCopyOptions.headers);
                    }
                    if (versionId) {
                        copy_to_1.default(metaOpt).to(uploadPartCopyOptions);
                    }

                    uploadPartJob = function uploadPartJob(partNo, source) {
                        // eslint-disable-next-line no-async-promise-executor
                        return new _promise2.default(function _callee(resolve, reject) {
                            var pi, range, result;
                            return _regenerator2.default.async(function _callee$(_context2) {
                                while (1) {
                                    switch (_context2.prev = _context2.next) {
                                        case 0:
                                            _context2.prev = 0;

                                            if (_this.isCancel()) {
                                                _context2.next = 14;
                                                break;
                                            }

                                            pi = partOffs[partNo - 1];
                                            range = pi.start + "-" + (pi.end - 1);
                                            _context2.next = 6;
                                            return _regenerator2.default.awrap(uploadPartCopy_1.uploadPartCopy.call(_this, name, uploadId, partNo, range, source, uploadPartCopyOptions));

                                        case 6:
                                            result = _context2.sent;

                                            if (_this.isCancel()) {
                                                _context2.next = 14;
                                                break;
                                            }

                                            debug("content-range " + result.res.headers['content-range']);
                                            doneParts.push({
                                                number: partNo,
                                                etag: result.res.headers.etag
                                            });
                                            checkpoint.doneParts = doneParts;

                                            if (!(options && options.progress)) {
                                                _context2.next = 14;
                                                break;
                                            }

                                            _context2.next = 14;
                                            return _regenerator2.default.awrap(options.progress(doneParts.length / numParts, checkpoint, result.res));

                                        case 14:
                                            resolve();
                                            _context2.next = 21;
                                            break;

                                        case 17:
                                            _context2.prev = 17;
                                            _context2.t0 = _context2["catch"](0);

                                            _context2.t0.partNum = partNo;
                                            reject(_context2.t0);

                                        case 21:
                                        case "end":
                                            return _context2.stop();
                                    }
                                }
                            }, null, _this, [[0, 17]]);
                        });
                    };

                    all = (0, _from2.default)(new Array(numParts), function (_x, i) {
                        return i + 1;
                    });
                    done = doneParts.map(function (p) {
                        return p.number;
                    });
                    todo = all.filter(function (p) {
                        return done.indexOf(p) < 0;
                    });
                    defaultParallel = 5;
                    parallel = options.parallel || defaultParallel;

                    if (!(this.checkBrowserAndVersion('Internet Explorer', '10') || parallel === 1)) {
                        _context3.next = 28;
                        break;
                    }

                    i = 0;

                case 18:
                    if (!(i < todo.length)) {
                        _context3.next = 26;
                        break;
                    }

                    if (!this.isCancel()) {
                        _context3.next = 21;
                        break;
                    }

                    throw _makeCancelEvent_1._makeCancelEvent();

                case 21:
                    _context3.next = 23;
                    return _regenerator2.default.awrap(uploadPartJob(todo[i], sourceData));

                case 23:
                    i++;
                    _context3.next = 18;
                    break;

                case 26:
                    _context3.next = 37;
                    break;

                case 28:
                    _context3.next = 30;
                    return _regenerator2.default.awrap(_parallel_1._parallel.call(this, todo, parallel, uploadPartJob, sourceData));

                case 30:
                    errors = _context3.sent;

                    if (!this.isCancel()) {
                        _context3.next = 33;
                        break;
                    }

                    throw _makeCancelEvent_1._makeCancelEvent();

                case 33:
                    if (!(errors && errors.length > 0)) {
                        _context3.next = 37;
                        break;
                    }

                    err = errors[0];

                    err.message = "Failed to copy some parts with error: " + err.toString() + " part_num: " + err.partNum;
                    throw err;

                case 37:
                    _context3.next = 39;
                    return _regenerator2.default.awrap(completeMultipartUpload_1.completeMultipartUpload.call(this, name, uploadId, doneParts, options));

                case 39:
                    return _context3.abrupt("return", _context3.sent);

                case 40:
                case "end":
                    return _context3.stop();
            }
        }
    }, null, this);
}
exports._resumeMultipartCopy = _resumeMultipartCopy;
function _divideMultipartCopyParts(fileSize, partSize, startOffset) {
    var numParts = Math.ceil(fileSize / partSize);
    var partOffs = [];
    for (var i = 0; i < numParts; i++) {
        var start = partSize * i + startOffset;
        var end = Math.min(start + partSize, fileSize + startOffset);
        partOffs.push({
            start: start,
            end: end
        });
    }
    return partOffs;
}
exports._divideMultipartCopyParts = _divideMultipartCopyParts;

},{"../utils/_getObjectMeta":108,"../utils/_makeCancelEvent":109,"../utils/_parallel":110,"../utils/getPartSize":130,"./completeMultipartUpload":73,"./initMultipartUpload":76,"./uploadPartCopy":82,"babel-runtime/core-js/array/from":154,"babel-runtime/core-js/promise":163,"babel-runtime/regenerator":176,"copy-to":187,"debug":351}],80:[function(require,module,exports){
"use strict";

var _from = require("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeMultipart = void 0;
/* eslint-disable no-async-promise-executor */
var divideParts_1 = require("../../common/utils/divideParts");
var completeMultipartUpload_1 = require("./completeMultipartUpload");
var handleUploadPart_1 = require("./handleUploadPart");
var _makeCancelEvent_1 = require("../utils/_makeCancelEvent");
var _parallel_1 = require("../utils/_parallel");
var isArray_1 = require("../utils/isArray");
/*
 * Resume multipart upload from checkpoint. The checkpoint will be
 * updated after each successful part upload.
 * @param {Object} checkpoint the checkpoint
 * @param {Object} options
 */
function resumeMultipart(checkpoint) {
    var _this = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var file, fileSize, partSize, uploadId, doneParts, name, partOffs, numParts, uploadPartJob, all, done, todo, defaultParallel, parallel, i, jobErr;
    return _regenerator2.default.async(function resumeMultipart$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    if (!this.isCancel()) {
                        _context2.next = 2;
                        break;
                    }

                    throw _makeCancelEvent_1._makeCancelEvent();

                case 2:
                    file = checkpoint.file, fileSize = checkpoint.fileSize, partSize = checkpoint.partSize, uploadId = checkpoint.uploadId, doneParts = checkpoint.doneParts, name = checkpoint.name;
                    partOffs = divideParts_1.divideParts(fileSize, partSize);
                    numParts = partOffs.length;

                    uploadPartJob = function uploadPartJob(partNo) {
                        return new _promise2.default(function _callee(resolve, reject) {
                            var hasUploadPart, pi, stream, data, result;
                            return _regenerator2.default.async(function _callee$(_context) {
                                while (1) {
                                    switch (_context.prev = _context.next) {
                                        case 0:
                                            hasUploadPart = checkpoint.doneParts.find(function (_) {
                                                return _.number === partNo;
                                            });

                                            if (!hasUploadPart) {
                                                _context.next = 4;
                                                break;
                                            }

                                            resolve(hasUploadPart);
                                            return _context.abrupt("return");

                                        case 4:
                                            _context.prev = 4;

                                            if (_this.isCancel()) {
                                                _context.next = 24;
                                                break;
                                            }

                                            pi = partOffs[partNo - 1];
                                            stream = _this._createStream(file, pi.start, pi.end);
                                            data = {
                                                stream: stream,
                                                size: pi.end - pi.start
                                            };

                                            if (isArray_1.isArray(_this.multipartUploadStreams)) {
                                                _this.multipartUploadStreams.push(stream);
                                            } else {
                                                _this.multipartUploadStreams = [stream];
                                            }
                                            _context.next = 12;
                                            return _regenerator2.default.awrap(handleUploadPart_1.handleUploadPart.call(_this, name, uploadId, partNo, data, options));

                                        case 12:
                                            result = _context.sent;

                                            hasUploadPart = checkpoint.doneParts.find(function (_) {
                                                return _.number === partNo;
                                            });

                                            if (!hasUploadPart) {
                                                _context.next = 17;
                                                break;
                                            }

                                            resolve(hasUploadPart);
                                            return _context.abrupt("return");

                                        case 17:
                                            if (_this.isCancel()) {
                                                _context.next = 24;
                                                break;
                                            }

                                            doneParts.push({
                                                number: partNo,
                                                etag: result.res.headers.etag
                                            });
                                            checkpoint.doneParts = doneParts;

                                            if (!options.progress) {
                                                _context.next = 23;
                                                break;
                                            }

                                            _context.next = 23;
                                            return _regenerator2.default.awrap(options.progress(doneParts.length / numParts, checkpoint, result.res));

                                        case 23:
                                            resolve({
                                                number: partNo,
                                                etag: result.res.headers.etag
                                            });

                                        case 24:
                                            resolve();
                                            _context.next = 31;
                                            break;

                                        case 27:
                                            _context.prev = 27;
                                            _context.t0 = _context["catch"](4);

                                            _context.t0.partNum = partNo;
                                            reject(_context.t0);

                                        case 31:
                                        case "end":
                                            return _context.stop();
                                    }
                                }
                            }, null, _this, [[4, 27]]);
                        });
                    };

                    all = (0, _from2.default)(new Array(numParts), function (_x, i) {
                        return i + 1;
                    });
                    done = doneParts.map(function (p) {
                        return p.number;
                    });
                    todo = all.filter(function (p) {
                        return done.indexOf(p) < 0;
                    });
                    defaultParallel = 5;
                    parallel = options.parallel || defaultParallel;

                    if (!(this.checkBrowserAndVersion('Internet Explorer', '10') || parallel === 1)) {
                        _context2.next = 23;
                        break;
                    }

                    i = 0;

                case 13:
                    if (!(i < todo.length)) {
                        _context2.next = 21;
                        break;
                    }

                    if (!this.isCancel()) {
                        _context2.next = 16;
                        break;
                    }

                    throw _makeCancelEvent_1._makeCancelEvent();

                case 16:
                    _context2.next = 18;
                    return _regenerator2.default.awrap(uploadPartJob(todo[i]));

                case 18:
                    i++;
                    _context2.next = 13;
                    break;

                case 21:
                    _context2.next = 32;
                    break;

                case 23:
                    _context2.next = 25;
                    return _regenerator2.default.awrap(_parallel_1._parallel.call(this, todo, parallel, uploadPartJob));

                case 25:
                    jobErr = _context2.sent;

                    if (!this.isCancel()) {
                        _context2.next = 29;
                        break;
                    }

                    uploadPartJob = null;
                    throw _makeCancelEvent_1._makeCancelEvent();

                case 29:
                    if (!(jobErr && jobErr.length > 0)) {
                        _context2.next = 32;
                        break;
                    }

                    jobErr[0].message = "Failed to upload some parts with error: " + jobErr[0].toString() + " part_num: " + jobErr[0].partNum;
                    throw jobErr[0];

                case 32:
                    _context2.next = 34;
                    return _regenerator2.default.awrap(completeMultipartUpload_1.completeMultipartUpload.call(this, name, uploadId, doneParts, options));

                case 34:
                    return _context2.abrupt("return", _context2.sent);

                case 35:
                case "end":
                    return _context2.stop();
            }
        }
    }, null, this);
}
exports.resumeMultipart = resumeMultipart;

},{"../../common/utils/divideParts":123,"../utils/_makeCancelEvent":109,"../utils/_parallel":110,"../utils/isArray":137,"./completeMultipartUpload":73,"./handleUploadPart":74,"babel-runtime/core-js/array/from":154,"babel-runtime/core-js/promise":163,"babel-runtime/regenerator":176}],81:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPart = void 0;
var handleUploadPart_1 = require("./handleUploadPart");
/**
 * Upload a part in a multipart upload transaction
 * @param {String} name the object name
 * @param {String} uploadId the upload id
 * @param {Integer} partNo the part number
 * @param {File} file upload File, whole File
 * @param {Integer} start  part start bytes  e.g: 102400
 * @param {Integer} end  part end bytes  e.g: 204800
 * @param {Object} options
 */
function uploadPart(name, uploadId, partNo, file, start, end) {
    var options = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : {};
    var data;
    return _regenerator2.default.async(function uploadPart$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    data = {
                        stream: this._createStream(file, start, end),
                        size: end - start
                    };
                    _context.next = 3;
                    return _regenerator2.default.awrap(handleUploadPart_1.handleUploadPart.call(this, name, uploadId, partNo, data, options));

                case 3:
                    return _context.abrupt("return", _context.sent);

                case 4:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.uploadPart = uploadPart;

},{"./handleUploadPart":74,"babel-runtime/regenerator":176}],82:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPartCopy = void 0;
var deepCopy_1 = require("../utils/deepCopy");
/**
 * Upload a part copy in a multipart from the source bucket/object
 * used with initMultipartUpload and completeMultipartUpload.
 * @param {String} name copy object name
 * @param {String} uploadId the upload id
 * @param {Number} partNo the part number
 * @param {String} range  like 0-102400  part size need to copy
 * @param {Object} sourceData
 *        {String} sourceData.sourceKey  the source object name
 *        {String} sourceData.sourceBucketName  the source bucket name
 * @param {Object} options
 */
function uploadPartCopy(name, uploadId, partNo, range, sourceData) {
    var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
    var opt, versionId, copySource, params, result;
    return _regenerator2.default.async(function uploadPartCopy$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    opt = deepCopy_1.deepCopy(options);

                    opt.headers = opt.headers || {};
                    versionId = opt.versionId || opt.subres && opt.subres.versionId || null;
                    copySource = void 0;

                    if (versionId) {
                        copySource = "/" + sourceData.sourceBucketName + "/" + encodeURIComponent(sourceData.sourceKey) + "?versionId=" + versionId;
                    } else {
                        copySource = "/" + sourceData.sourceBucketName + "/" + encodeURIComponent(sourceData.sourceKey);
                    }
                    opt.headers['x-oss-copy-source'] = copySource;
                    if (range) opt.headers['x-oss-copy-source-range'] = "bytes=" + range;
                    if (opt.headers) delete opt.headers['x-oss-server-side-encryption'];
                    opt.subres = {
                        partNumber: partNo,
                        uploadId: uploadId
                    };
                    params = this._objectRequestParams('PUT', name, opt);

                    params.mime = opt.mime;
                    params.successStatuses = [200];
                    _context.next = 14;
                    return _regenerator2.default.awrap(this.request(params));

                case 14:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        name: name,
                        etag: result.res.headers.etag,
                        res: result.res
                    });

                case 16:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.uploadPartCopy = uploadPartCopy;

},{"../utils/deepCopy":121,"babel-runtime/regenerator":176}],83:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.append = void 0;
/**
 * append an object from String(file path)/Buffer/ReadableStream
 * @param {String} name the object key
 * @param {Mixed} file String(file path)/Buffer/ReadableStream
 * @param {Object} options
 * @return {Object}
 */
function append(name, file) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var _options$put, put, result;

    return _regenerator2.default.async(function append$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _options$put = options.put, put = _options$put === undefined ? this.put : _options$put;

                    if (!(typeof put !== 'function')) {
                        _context.next = 3;
                        break;
                    }

                    throw 'please set put in options, put path is browser/object/put';

                case 3:
                    if (options.position === undefined) options.position = '0';
                    options.subres = {
                        append: '',
                        position: options.position
                    };
                    options.method = 'POST';
                    _context.next = 8;
                    return _regenerator2.default.awrap(put.call(this, name, file, options));

                case 8:
                    result = _context.sent;

                    result.nextAppendPosition = result.res.headers['x-oss-next-append-position'];
                    return _context.abrupt("return", result);

                case 11:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.append = append;

},{"babel-runtime/regenerator":176}],84:[function(require,module,exports){
(function (Buffer){
"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePostSignature = void 0;
var policy2Str_1 = require("../utils/policy2Str");
var signUtils_1 = require("../utils/signUtils");
var isObject_1 = require("../utils/isObject");
/**
 * @param {Object or JSON} policy specifies the validity of the fields in the request.
 * @return {Object} params
 *         {String} params.OSSAccessKeyId
 *         {String} params.Signature
 *         {String} params.policy JSON text encoded with UTF-8 and Base64.
 */
function calculatePostSignature(policy) {
    if (!isObject_1.isObject(policy) && typeof policy !== 'string') {
        throw new Error('policy must be JSON string or Object');
    }
    if (!isObject_1.isObject(policy)) {
        try {
            (0, _stringify2.default)(JSON.parse(policy));
        } catch (error) {
            throw new Error('policy must be JSON string or Object');
        }
    }
    policy = Buffer.from(policy2Str_1.policy2Str(policy), 'utf8').toString('base64');
    var Signature = signUtils_1.computeSignature(this.options.accessKeySecret, policy);
    var query = {
        OSSAccessKeyId: this.options.accessKeyId,
        Signature: Signature,
        policy: policy
    };
    return query;
}
exports.calculatePostSignature = calculatePostSignature;

}).call(this,require("buffer").Buffer)
},{"../utils/isObject":142,"../utils/policy2Str":148,"../utils/signUtils":149,"babel-runtime/core-js/json/stringify":155,"buffer":184}],85:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.copy = void 0;
var getSourceName_1 = require("../utils/getSourceName");
var convertMetaToHeaders_1 = require("../utils/convertMetaToHeaders");
var REPLACE_HEDERS = ['content-type', 'content-encoding', 'content-language', 'content-disposition', 'cache-control', 'expires'];
function copy(name, sourceName, bucketName, options) {
    var params, result, data;
    return _regenerator2.default.async(function copy$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    if ((typeof bucketName === "undefined" ? "undefined" : (0, _typeof3.default)(bucketName)) === 'object') {
                        options = bucketName; // 兼容旧版本，旧版本第三个参数为options
                    }
                    options = options || {};
                    options.headers = options.headers || {};
                    (0, _keys2.default)(options.headers).forEach(function (key) {
                        options.headers["x-oss-copy-source-" + key.toLowerCase()] = options.headers[key];
                    });
                    if (options.meta || (0, _keys2.default)(options.headers).find(function (_) {
                        return REPLACE_HEDERS.includes(_.toLowerCase());
                    })) {
                        options.headers['x-oss-metadata-directive'] = 'REPLACE';
                    }
                    convertMetaToHeaders_1.convertMetaToHeaders(options.meta, options.headers);
                    sourceName = getSourceName_1.getSourceName(sourceName, bucketName, this.options.bucket);
                    if (options.versionId) {
                        sourceName = sourceName + "?versionId=" + options.versionId;
                    }
                    options.headers['x-oss-copy-source'] = sourceName;
                    params = this._objectRequestParams('PUT', name, options);

                    params.xmlResponse = true;
                    params.successStatuses = [200, 304];
                    _context.next = 14;
                    return _regenerator2.default.awrap(this.request(params));

                case 14:
                    result = _context.sent;
                    data = result.data;

                    if (data) {
                        data = {
                            etag: data.ETag,
                            lastModified: data.LastModified
                        };
                    }
                    return _context.abrupt("return", {
                        data: data,
                        res: result.res
                    });

                case 18:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.copy = copy;

},{"../utils/convertMetaToHeaders":119,"../utils/getSourceName":133,"babel-runtime/core-js/object/keys":161,"babel-runtime/helpers/typeof":173,"babel-runtime/regenerator":176}],86:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteObject = void 0;
/**
 * delete
 * @param {String} name - object name
 * @param {Object} options
 * @param {{res}}
 */
function deleteObject(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result;
    return _regenerator2.default.async(function deleteObject$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    options.subres = (0, _assign2.default)({}, options.subres);
                    if (options.versionId) {
                        options.subres.versionId = options.versionId;
                    }
                    params = this._objectRequestParams('DELETE', name, options);

                    params.successStatuses = [204];
                    _context.next = 6;
                    return _regenerator2.default.awrap(this.request(params));

                case 6:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res
                    });

                case 8:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.deleteObject = deleteObject;

},{"babel-runtime/core-js/object/assign":156,"babel-runtime/regenerator":176}],87:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMulti = void 0;
/* eslint-disable object-curly-newline */
var utility_1 = __importDefault(require("utility"));
var obj2xml_1 = require("../utils/obj2xml");
var objectName_1 = require("../utils/objectName");
function deleteMulti(names) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var objects, i, object, _names$i, key, versionId, paramXMLObj, paramXML, params, result, r, deleted;

    return _regenerator2.default.async(function deleteMulti$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    objects = [];

                    if (!(!names || !names.length)) {
                        _context.next = 3;
                        break;
                    }

                    throw new Error('names is required');

                case 3:
                    for (i = 0; i < names.length; i++) {
                        object = {};

                        if (typeof names[i] === 'string') {
                            object.Key = utility_1.default.escape(objectName_1.objectName(names[i]));
                        } else {
                            _names$i = names[i], key = _names$i.key, versionId = _names$i.versionId;

                            object.Key = utility_1.default.escape(objectName_1.objectName(key));
                            object.VersionId = versionId;
                        }
                        objects.push(object);
                    }
                    paramXMLObj = {
                        Delete: {
                            Quiet: !!options.quiet,
                            Object: objects
                        }
                    };
                    paramXML = obj2xml_1.obj2xml(paramXMLObj, {
                        headers: true
                    });

                    options.subres = (0, _assign2.default)({ delete: '' }, options.subres);
                    if (options.versionId) {
                        options.subres.versionId = options.versionId;
                    }
                    params = this._objectRequestParams('POST', '', options);

                    params.mime = 'xml';
                    params.content = paramXML;
                    params.xmlResponse = true;
                    params.successStatuses = [200];
                    _context.next = 15;
                    return _regenerator2.default.awrap(this.request(params));

                case 15:
                    result = _context.sent;
                    r = result.data;
                    deleted = r && r.Deleted || null;

                    if (deleted) {
                        if (!Array.isArray(deleted)) {
                            deleted = [deleted];
                        }
                    }
                    return _context.abrupt("return", {
                        res: result.res,
                        deleted: deleted || []
                    });

                case 20:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.deleteMulti = deleteMulti;

},{"../utils/obj2xml":144,"../utils/objectName":145,"babel-runtime/core-js/object/assign":156,"babel-runtime/regenerator":176,"utility":353}],88:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteObjectTagging = void 0;
var objectName_1 = require("../utils/objectName");
/**
 * deleteObjectTagging
 * @param {String} name - object name
 * @param {Object} options
 */
function deleteObjectTagging(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result;
    return _regenerator2.default.async(function deleteObjectTagging$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    options.subres = (0, _assign2.default)({ tagging: '' }, options.subres);
                    if (options.versionId) {
                        options.subres.versionId = options.versionId;
                    }
                    name = objectName_1.objectName(name);
                    params = this._objectRequestParams('DELETE', name, options);

                    params.successStatuses = [204];
                    _context.next = 7;
                    return _regenerator2.default.awrap(this.request(params));

                case 7:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        status: result.status,
                        res: result.res
                    });

                case 9:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.deleteObjectTagging = deleteObjectTagging;

},{"../utils/objectName":145,"babel-runtime/core-js/object/assign":156,"babel-runtime/regenerator":176}],89:[function(require,module,exports){
"use strict";

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateObjectUrl = void 0;
var url_1 = __importDefault(require("url"));
var objectName_1 = require("../utils/objectName");
var escapeName_1 = require("../utils/escapeName");
/**
 * Get Object url by name
 * @param {String} name - object name
 * @param {String} [baseUrl] - If provide `baseUrl`, will use `baseUrl` instead the default `endpoint and bucket`.
 * @return {String} object url include bucket
 */
function generateObjectUrl(name, baseUrl) {
    if (!baseUrl) {
        baseUrl = this.options.endpoint.format();
        var copyUrl = url_1.default.parse(baseUrl);
        var bucket = this.options.bucket;

        copyUrl.hostname = bucket + "." + copyUrl.hostname;
        copyUrl.host = bucket + "." + copyUrl.host;
        baseUrl = copyUrl.format();
    } else if (baseUrl[baseUrl.length - 1] !== '/') {
        baseUrl += '/';
    }
    return baseUrl + escapeName_1.escapeName(objectName_1.objectName(name));
}
exports.generateObjectUrl = generateObjectUrl;

},{"../utils/escapeName":126,"../utils/objectName":145,"url":340}],90:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = void 0;
var fs_1 = __importDefault(require("fs"));
var is_type_of_1 = __importDefault(require("is-type-of"));
var deleteFileSafe_1 = require("../utils/deleteFileSafe");
var isObject_1 = require("../utils/isObject");
/**
 * get
 * @param {String} name - object name
 * @param {String | Stream} file
 * @param {Object} options
 * @param {{res}}
 */
function get(name, file) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var writeStream, needDestroy, result, params;
    return _regenerator2.default.async(function get$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    writeStream = null;
                    needDestroy = false;

                    if (is_type_of_1.default.writableStream(file)) {
                        writeStream = file;
                    } else if (is_type_of_1.default.string(file)) {
                        writeStream = fs_1.default.createWriteStream(file);
                        needDestroy = true;
                    } else if (isObject_1.isObject(file)) {
                        options = file;
                    }
                    options.subres = (0, _assign2.default)({}, options.subres);
                    if (options.versionId) {
                        options.subres.versionId = options.versionId;
                    }
                    if (options.process) {
                        options.subres['x-oss-process'] = options.process;
                    }
                    result = void 0;
                    _context.prev = 7;
                    params = this._objectRequestParams('GET', name, options);

                    params.writeStream = writeStream;
                    params.successStatuses = [200, 206, 304];
                    _context.next = 13;
                    return _regenerator2.default.awrap(this.request(params));

                case 13:
                    result = _context.sent;

                    if (needDestroy) {
                        writeStream.destroy();
                    }
                    _context.next = 24;
                    break;

                case 17:
                    _context.prev = 17;
                    _context.t0 = _context["catch"](7);

                    if (!needDestroy) {
                        _context.next = 23;
                        break;
                    }

                    writeStream.destroy();
                    // should delete the exists file before throw error
                    _context.next = 23;
                    return _regenerator2.default.awrap(deleteFileSafe_1.deleteFileSafe(file));

                case 23:
                    throw _context.t0;

                case 24:
                    return _context.abrupt("return", {
                        res: result.res,
                        content: result.data
                    });

                case 25:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this, [[7, 17]]);
}
exports.get = get;

},{"../utils/deleteFileSafe":122,"../utils/isObject":142,"babel-runtime/core-js/object/assign":156,"babel-runtime/regenerator":176,"fs":179,"is-type-of":352}],91:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getACL = void 0;
var objectName_1 = require("../utils/objectName");
/*
 * Get object's ACL
 * @param {String} name the object key
 * @param {Object} options
 * @return {Object}
 */
function getACL(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result;
    return _regenerator2.default.async(function getACL$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    options.subres = (0, _assign2.default)({ acl: '' }, options.subres);
                    if (options.versionId) {
                        options.subres.versionId = options.versionId;
                    }
                    name = objectName_1.objectName(name);
                    params = this._objectRequestParams('GET', name, options);

                    params.successStatuses = [200];
                    params.xmlResponse = true;
                    _context.next = 8;
                    return _regenerator2.default.awrap(this.request(params));

                case 8:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        acl: result.data.AccessControlList.Grant,
                        owner: {
                            id: result.data.Owner.ID,
                            displayName: result.data.Owner.DisplayName
                        },
                        res: result.res
                    });

                case 10:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getACL = getACL;

},{"../utils/objectName":145,"babel-runtime/core-js/object/assign":156,"babel-runtime/regenerator":176}],92:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getAsyncFetch = void 0;
var formatObjKey_1 = require("../utils/formatObjKey");
/*
 * getAsyncFetch
 * @param {String} asyncFetch taskId
 * @param {Object} options
 */
function getAsyncFetch(taskId) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result, taskInfo;
    return _regenerator2.default.async(function getAsyncFetch$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    options.subres = (0, _assign2.default)({ asyncFetch: '' }, options.subres);
                    options.headers = options.headers || {};
                    params = this._objectRequestParams('GET', '', options);

                    params.headers['x-oss-task-id'] = taskId;
                    params.successStatuses = [200];
                    params.xmlResponse = true;
                    _context.next = 8;
                    return _regenerator2.default.awrap(this.request(params));

                case 8:
                    result = _context.sent;
                    taskInfo = formatObjKey_1.formatObjKey(result.data.TaskInfo, 'firstLowerCase');
                    return _context.abrupt("return", {
                        res: result.res,
                        status: result.status,
                        state: result.data.State,
                        taskInfo: taskInfo
                    });

                case 11:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getAsyncFetch = getAsyncFetch;

},{"../utils/formatObjKey":127,"babel-runtime/core-js/object/assign":156,"babel-runtime/regenerator":176}],93:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucketVersions = void 0;
var formatQuery_1 = require("../utils/formatQuery");
var isArray_1 = require("../utils/isArray");
var objectUrl_1 = require("../utils/objectUrl");
// proto.getBucketVersions = getBucketVersions;
// proto.listObjectVersions = getBucketVersions;
function getBucketVersions() {
    var _this = this;

    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result, objects, deleteMarker, prefixes;
    return _regenerator2.default.async(function getBucketVersions$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    if (!(query.versionIdMarker && query.keyMarker === undefined)) {
                        _context.next = 2;
                        break;
                    }

                    throw new Error('A version-id marker cannot be specified without a key marker');

                case 2:
                    options.subres = (0, _assign2.default)({ versions: '' }, options.subres);
                    if (options.versionId) {
                        options.subres.versionId = options.versionId;
                    }
                    params = this._objectRequestParams('GET', '', options);

                    params.xmlResponse = true;
                    params.successStatuses = [200];
                    params.query = formatQuery_1.formatQuery(query);
                    _context.next = 10;
                    return _regenerator2.default.awrap(this.request(params));

                case 10:
                    result = _context.sent;
                    objects = result.data.Version || [];
                    deleteMarker = result.data.DeleteMarker || [];

                    if (objects) {
                        if (!Array.isArray(objects)) {
                            objects = [objects];
                        }
                        objects = objects.map(function (obj) {
                            return {
                                name: obj.Key,
                                url: objectUrl_1.objectUrl(obj.Key, _this.options),
                                lastModified: obj.LastModified,
                                isLatest: obj.IsLatest === 'true',
                                versionId: obj.VersionId,
                                etag: obj.ETag,
                                type: obj.Type,
                                size: Number(obj.Size),
                                storageClass: obj.StorageClass,
                                owner: {
                                    id: obj.Owner.ID,
                                    displayName: obj.Owner.DisplayName
                                }
                            };
                        });
                    }
                    if (deleteMarker) {
                        if (!isArray_1.isArray(deleteMarker)) {
                            deleteMarker = [deleteMarker];
                        }
                        deleteMarker = deleteMarker.map(function (obj) {
                            return {
                                name: obj.Key,
                                lastModified: obj.LastModified,
                                versionId: obj.VersionId,
                                owner: {
                                    id: obj.Owner.ID,
                                    displayName: obj.Owner.DisplayName
                                }
                            };
                        });
                    }
                    prefixes = result.data.CommonPrefixes || null;

                    if (prefixes) {
                        if (!isArray_1.isArray(prefixes)) {
                            prefixes = [prefixes];
                        }
                        prefixes = prefixes.map(function (item) {
                            return item.Prefix;
                        });
                    }
                    return _context.abrupt("return", {
                        res: result.res,
                        objects: objects,
                        deleteMarker: deleteMarker,
                        prefixes: prefixes,
                        nextMarker: result.data.NextMarker || null,
                        NextVersionIdMarker: result.data.NextVersionIdMarker || null,
                        isTruncated: result.data.IsTruncated === 'true'
                    });

                case 18:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getBucketVersions = getBucketVersions;

},{"../utils/formatQuery":128,"../utils/isArray":137,"../utils/objectUrl":146,"babel-runtime/core-js/object/assign":156,"babel-runtime/regenerator":176}],94:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getObjectMeta = void 0;
var objectName_1 = require("../utils/objectName");
/**
 * getObjectMeta
 * @param {String} name - object name
 * @param {Object} options
 * @param {{res}}
 */
function getObjectMeta(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result;
    return _regenerator2.default.async(function getObjectMeta$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    name = objectName_1.objectName(name);
                    options.subres = (0, _assign2.default)({ objectMeta: '' }, options.subres);
                    if (options.versionId) {
                        options.subres.versionId = options.versionId;
                    }
                    params = this._objectRequestParams('HEAD', name, options);

                    params.successStatuses = [200];
                    _context.next = 7;
                    return _regenerator2.default.awrap(this.request(params));

                case 7:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        status: result.status,
                        res: result.res
                    });

                case 9:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getObjectMeta = getObjectMeta;

},{"../utils/objectName":145,"babel-runtime/core-js/object/assign":156,"babel-runtime/regenerator":176}],95:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getObjectTagging = void 0;
var objectName_1 = require("../utils/objectName");
var formatTag_1 = require("../utils/formatTag");
var parseXML_1 = require("../utils/parseXML");
/**
 * getObjectTagging
 * @param {String} name - object name
 * @param {Object} options
 * @return {Object}
 */
function getObjectTagging(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result, Tagging;
    return _regenerator2.default.async(function getObjectTagging$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    options.subres = (0, _assign2.default)({ tagging: '' }, options.subres);
                    if (options.versionId) {
                        options.subres.versionId = options.versionId;
                    }
                    name = objectName_1.objectName(name);
                    params = this._objectRequestParams('GET', name, options);

                    params.successStatuses = [200];
                    _context.next = 7;
                    return _regenerator2.default.awrap(this.request(params));

                case 7:
                    result = _context.sent;
                    _context.next = 10;
                    return _regenerator2.default.awrap(parseXML_1.parseXML(result.data));

                case 10:
                    Tagging = _context.sent;
                    return _context.abrupt("return", {
                        status: result.status,
                        res: result.res,
                        tag: formatTag_1.formatTag(Tagging)
                    });

                case 12:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getObjectTagging = getObjectTagging;

},{"../utils/formatTag":129,"../utils/objectName":145,"../utils/parseXML":147,"babel-runtime/core-js/object/assign":156,"babel-runtime/regenerator":176}],96:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getObjectUrl = void 0;
var objectName_1 = require("../utils/objectName");
var escapeName_1 = require("../utils/escapeName");
/**
 * Get Object url by name
 * @param {String} name - object name
 * @param {String} [baseUrl] - If provide `baseUrl`, will use `baseUrl` instead the default `endpoint`.
 * @return {String} object url
 */
function getObjectUrl(name, baseUrl) {
    if (!baseUrl) {
        baseUrl = this.options.endpoint.format();
    } else if (baseUrl[baseUrl.length - 1] !== '/') {
        baseUrl += '/';
    }
    return baseUrl + escapeName_1.escapeName(objectName_1.objectName(name));
}
exports.getObjectUrl = getObjectUrl;

},{"../utils/escapeName":126,"../utils/objectName":145}],97:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.getSymlink = void 0;
var objectName_1 = require("../utils/objectName");
/**
 * getSymlink
 * @param {String} name - object name
 * @param {Object} options
 * @param {{res}}
 */
function getSymlink(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result, target;
    return _regenerator2.default.async(function getSymlink$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    options.subres = (0, _assign2.default)({ symlink: '' }, options.subres);
                    if (options.versionId) {
                        options.subres.versionId = options.versionId;
                    }
                    name = objectName_1.objectName(name);
                    params = this._objectRequestParams('GET', name, options);

                    params.successStatuses = [200];
                    _context.next = 7;
                    return _regenerator2.default.awrap(this.request(params));

                case 7:
                    result = _context.sent;
                    target = result.res.headers['x-oss-symlink-target'];
                    return _context.abrupt("return", {
                        targetName: decodeURIComponent(target),
                        res: result.res
                    });

                case 10:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.getSymlink = getSymlink;

},{"../utils/objectName":145,"babel-runtime/core-js/object/assign":156,"babel-runtime/regenerator":176}],98:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.head = void 0;
/**
 * head
 * @param {String} name - object name
 * @param {Object} options
 * @param {{res}}
 */
function head(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result, data;
    return _regenerator2.default.async(function head$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    options.subres = (0, _assign2.default)({}, options.subres);
                    if (options.versionId) {
                        options.subres.versionId = options.versionId;
                    }
                    params = this._objectRequestParams('HEAD', name, options);

                    params.successStatuses = [200, 304];
                    _context.next = 6;
                    return _regenerator2.default.awrap(this.request(params));

                case 6:
                    result = _context.sent;
                    data = {
                        meta: null,
                        res: result.res,
                        status: result.status
                    };

                    if (result.status === 200) {
                        (0, _keys2.default)(result.headers).forEach(function (k) {
                            if (k.indexOf('x-oss-meta-') === 0) {
                                if (!data.meta) {
                                    data.meta = {};
                                }
                                data.meta[k.substring(11)] = result.headers[k];
                            }
                        });
                    }
                    return _context.abrupt("return", data);

                case 10:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.head = head;

},{"babel-runtime/core-js/object/assign":156,"babel-runtime/core-js/object/keys":161,"babel-runtime/regenerator":176}],99:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var append_1 = require("./append");
var calculatePostSignature_1 = require("./calculatePostSignature");
var copy_1 = require("./copy");
var delete_1 = require("./delete");
var deleteMulti_1 = require("./deleteMulti");
var deleteObjectTagging_1 = require("./deleteObjectTagging");
var generateObjectUrl_1 = require("./generateObjectUrl");
var get_1 = require("./get");
var getACL_1 = require("./getACL");
var getAsyncFetch_1 = require("./getAsyncFetch");
var getBucketVersions_1 = require("./getBucketVersions");
var getObjectMeta_1 = require("./getObjectMeta");
var getObjectTagging_1 = require("./getObjectTagging");
var getObjectUrl_1 = require("./getObjectUrl");
var getSymlink_1 = require("./getSymlink");
var head_1 = require("./head");
var list_1 = require("./list");
var postAsyncFetch_1 = require("./postAsyncFetch");
var putACL_1 = require("./putACL");
var putMeta_1 = require("./putMeta");
var putObjectTagging_1 = require("./putObjectTagging");
var putSymlink_1 = require("./putSymlink");
var restore_1 = require("./restore");
var signatureUrl_1 = require("./signatureUrl");
exports.default = {
    append: append_1.append,
    calculatePostSignature: calculatePostSignature_1.calculatePostSignature,
    copy: copy_1.copy,
    delete: delete_1.deleteObject,
    deleteObject: // 兼容旧版本
    delete_1.deleteObject,
    deleteMulti: deleteMulti_1.deleteMulti,
    deleteObjectTagging: deleteObjectTagging_1.deleteObjectTagging,
    generateObjectUrl: generateObjectUrl_1.generateObjectUrl,
    get: get_1.get,
    getACL: getACL_1.getACL,
    getAsyncFetch: getAsyncFetch_1.getAsyncFetch,
    getBucketVersions: getBucketVersions_1.getBucketVersions,
    listObjectVersions: getBucketVersions_1.getBucketVersions,
    getObjectMeta: // 兼容旧版本
    getObjectMeta_1.getObjectMeta,
    getObjectTagging: getObjectTagging_1.getObjectTagging,
    getObjectUrl: getObjectUrl_1.getObjectUrl,
    getSymlink: getSymlink_1.getSymlink,
    head: head_1.head,
    list: list_1.list,
    postAsyncFetch: postAsyncFetch_1.postAsyncFetch,
    putACL: putACL_1.putACL,
    putMeta: putMeta_1.putMeta,
    putObjectTagging: putObjectTagging_1.putObjectTagging,
    putSymlink: putSymlink_1.putSymlink,
    restore: restore_1.restore,
    signatureUrl: signatureUrl_1.signatureUrl
};

},{"./append":83,"./calculatePostSignature":84,"./copy":85,"./delete":86,"./deleteMulti":87,"./deleteObjectTagging":88,"./generateObjectUrl":89,"./get":90,"./getACL":91,"./getAsyncFetch":92,"./getBucketVersions":93,"./getObjectMeta":94,"./getObjectTagging":95,"./getObjectUrl":96,"./getSymlink":97,"./head":98,"./list":100,"./postAsyncFetch":101,"./putACL":102,"./putMeta":103,"./putObjectTagging":104,"./putSymlink":105,"./restore":106,"./signatureUrl":107}],100:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.list = void 0;
var objectUrl_1 = require("../utils/objectUrl");
function list() {
    var _this = this;

    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result, objects, prefixes;
    return _regenerator2.default.async(function list$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    // prefix, marker, max-keys, delimiter
                    params = this._objectRequestParams('GET', '', options);

                    params.query = query;
                    params.xmlResponse = true;
                    params.successStatuses = [200];
                    _context.next = 6;
                    return _regenerator2.default.awrap(this.request(params));

                case 6:
                    result = _context.sent;
                    objects = result.data.Contents;

                    if (objects) {
                        if (!Array.isArray(objects)) {
                            objects = [objects];
                        }
                        objects = objects.map(function (obj) {
                            return {
                                name: obj.Key,
                                url: objectUrl_1.objectUrl(obj.Key, _this.options),
                                lastModified: obj.LastModified,
                                etag: obj.ETag,
                                type: obj.Type,
                                size: Number(obj.Size),
                                storageClass: obj.StorageClass,
                                owner: {
                                    id: obj.Owner.ID,
                                    displayName: obj.Owner.DisplayName
                                }
                            };
                        });
                    }
                    prefixes = result.data.CommonPrefixes || null;

                    if (prefixes) {
                        if (!Array.isArray(prefixes)) {
                            prefixes = [prefixes];
                        }
                        prefixes = prefixes.map(function (item) {
                            return item.Prefix;
                        });
                    }
                    return _context.abrupt("return", {
                        res: result.res,
                        objects: objects,
                        prefixes: prefixes,
                        nextMarker: result.data.NextMarker || null,
                        isTruncated: result.data.IsTruncated === 'true'
                    });

                case 12:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.list = list;

},{"../utils/objectUrl":146,"babel-runtime/regenerator":176}],101:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.postAsyncFetch = void 0;
var obj2xml_1 = require("../utils/obj2xml");
var objectName_1 = require("../utils/objectName");
/*
 * postAsyncFetch
 * @param {String} name the object key
 * @param {String} url
 * @param {Object} options
 *        {String} options.host
 *        {String} options.contentMD5
 *        {String} options.callback
 *        {String} options.storageClass Standard/IA/Archive
 *        {Boolean} options.ignoreSameKey  default value true
 */
function postAsyncFetch(object, url) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var _options$host, host, _options$contentMD, contentMD5, _options$callback, callback, _options$storageClass, storageClass, _options$ignoreSameKe, ignoreSameKey, paramXMLObj, params, result;

    return _regenerator2.default.async(function postAsyncFetch$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    options.subres = (0, _assign2.default)({ asyncFetch: '' }, options.subres);
                    options.headers = options.headers || {};
                    object = objectName_1.objectName(object);
                    _options$host = options.host, host = _options$host === undefined ? '' : _options$host, _options$contentMD = options.contentMD5, contentMD5 = _options$contentMD === undefined ? '' : _options$contentMD, _options$callback = options.callback, callback = _options$callback === undefined ? '' : _options$callback, _options$storageClass = options.storageClass, storageClass = _options$storageClass === undefined ? '' : _options$storageClass, _options$ignoreSameKe = options.ignoreSameKey, ignoreSameKey = _options$ignoreSameKe === undefined ? true : _options$ignoreSameKe;
                    paramXMLObj = {
                        AsyncFetchTaskConfiguration: {
                            Url: url,
                            Object: object,
                            Host: host,
                            ContentMD5: contentMD5,
                            Callback: callback,
                            StorageClass: storageClass,
                            IgnoreSameKey: ignoreSameKey
                        }
                    };
                    params = this._objectRequestParams('POST', '', options);

                    params.mime = 'xml';
                    params.xmlResponse = true;
                    params.successStatuses = [200];
                    params.content = obj2xml_1.obj2xml(paramXMLObj);
                    _context.next = 12;
                    return _regenerator2.default.awrap(this.request(params));

                case 12:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res,
                        status: result.status,
                        taskId: result.data.TaskId
                    });

                case 14:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.postAsyncFetch = postAsyncFetch;

},{"../utils/obj2xml":144,"../utils/objectName":145,"babel-runtime/core-js/object/assign":156,"babel-runtime/regenerator":176}],102:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.putACL = void 0;
var objectName_1 = require("../utils/objectName");
/*
 * Set object's ACL
 * @param {String} name the object key
 * @param {String} acl the object ACL
 * @param {Object} options
 */
function putACL(name, acl) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var params, result;
    return _regenerator2.default.async(function putACL$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    options.subres = (0, _assign2.default)({ acl: '' }, options.subres);
                    if (options.versionId) {
                        options.subres.versionId = options.versionId;
                    }
                    options.headers = options.headers || {};
                    options.headers['x-oss-object-acl'] = acl;
                    name = objectName_1.objectName(name);
                    params = this._objectRequestParams('PUT', name, options);

                    params.successStatuses = [200];
                    _context.next = 9;
                    return _regenerator2.default.awrap(this.request(params));

                case 9:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res
                    });

                case 11:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.putACL = putACL;

},{"../utils/objectName":145,"babel-runtime/core-js/object/assign":156,"babel-runtime/regenerator":176}],103:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.putMeta = void 0;
var copy_1 = require("./copy");
function putMeta(name, meta) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var copyResult;
    return _regenerator2.default.async(function putMeta$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return _regenerator2.default.awrap(copy_1.copy.call(this, name, name, {
                        meta: meta || {},
                        timeout: options && options.timeout,
                        ctx: options && options.ctx
                    }));

                case 2:
                    copyResult = _context.sent;
                    return _context.abrupt("return", copyResult);

                case 4:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.putMeta = putMeta;

},{"./copy":85,"babel-runtime/regenerator":176}],104:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.putObjectTagging = void 0;
var obj2xml_1 = require("../utils/obj2xml");
var checkObjectTag_1 = require("../utils/checkObjectTag");
var objectName_1 = require("../utils/objectName");
/**
 * putObjectTagging
 * @param {String} name - object name
 * @param {Object} tag -  object tag, eg: `{a: "1", b: "2"}`
 * @param {Object} options
 */
function putObjectTagging(name, tag) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var params, paramXMLObj, result;
    return _regenerator2.default.async(function putObjectTagging$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    checkObjectTag_1.checkObjectTag(tag);
                    options.subres = (0, _assign2.default)({ tagging: '' }, options.subres);
                    if (options.versionId) {
                        options.subres.versionId = options.versionId;
                    }
                    name = objectName_1.objectName(name);
                    params = this._objectRequestParams('PUT', name, options);

                    params.successStatuses = [200];
                    tag = (0, _keys2.default)(tag).map(function (key) {
                        return {
                            Key: key,
                            Value: tag[key]
                        };
                    });
                    paramXMLObj = {
                        Tagging: {
                            TagSet: {
                                Tag: tag
                            }
                        }
                    };

                    params.mime = 'xml';
                    params.content = obj2xml_1.obj2xml(paramXMLObj);
                    _context.next = 12;
                    return _regenerator2.default.awrap(this.request(params));

                case 12:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res,
                        status: result.status
                    });

                case 14:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.putObjectTagging = putObjectTagging;

},{"../utils/checkObjectTag":116,"../utils/obj2xml":144,"../utils/objectName":145,"babel-runtime/core-js/object/assign":156,"babel-runtime/core-js/object/keys":161,"babel-runtime/regenerator":176}],105:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.putSymlink = void 0;
var objectName_1 = require("../utils/objectName");
var convertMetaToHeaders_1 = require("../utils/convertMetaToHeaders");
var escapeName_1 = require("../utils/escapeName");
/**
 * putSymlink
 * @param {String} name - object name
 * @param {String} targetName - target name
 * @param {Object} options
 * @param {{res}}
 */
function putSymlink(name, targetName) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var params, result;
    return _regenerator2.default.async(function putSymlink$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    options.headers = options.headers || {};
                    targetName = escapeName_1.escapeName(objectName_1.objectName(targetName));
                    convertMetaToHeaders_1.convertMetaToHeaders(options.meta, options.headers);
                    options.headers['x-oss-symlink-target'] = targetName;
                    options.subres = (0, _assign2.default)({ symlink: '' }, options.subres);
                    if (options.versionId) {
                        options.subres.versionId = options.versionId;
                    }
                    if (options.storageClass) {
                        options.headers['x-oss-storage-class'] = options.storageClass;
                    }
                    name = objectName_1.objectName(name);
                    params = this._objectRequestParams('PUT', name, options);

                    params.successStatuses = [200];
                    _context.next = 12;
                    return _regenerator2.default.awrap(this.request(params));

                case 12:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res
                    });

                case 14:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.putSymlink = putSymlink;

},{"../utils/convertMetaToHeaders":119,"../utils/escapeName":126,"../utils/objectName":145,"babel-runtime/core-js/object/assign":156,"babel-runtime/regenerator":176}],106:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.restore = void 0;
/**
 * Restore Object
 * @param {String} name the object key
 * @param {Object} options
 * @returns {{res}}
 */
function restore(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var params, result;
    return _regenerator2.default.async(function restore$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    options.subres = (0, _assign2.default)({ restore: '' }, options.subres);
                    if (options.versionId) {
                        options.subres.versionId = options.versionId;
                    }
                    params = this._objectRequestParams('POST', name, options);

                    params.successStatuses = [202];
                    _context.next = 6;
                    return _regenerator2.default.awrap(this.request(params));

                case 6:
                    result = _context.sent;
                    return _context.abrupt("return", {
                        res: result.res
                    });

                case 8:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}
exports.restore = restore;

},{"babel-runtime/core-js/object/assign":156,"babel-runtime/regenerator":176}],107:[function(require,module,exports){
"use strict";

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signatureUrl = void 0;
var utility_1 = __importDefault(require("utility"));
var copy_to_1 = __importDefault(require("copy-to"));
var url_1 = __importDefault(require("url"));
var objectName_1 = require("../../common/utils/objectName");
var getResource_1 = require("../../common/utils/getResource");
var signUtils_1 = require("../../common/utils/signUtils");
var getReqUrl_1 = require("../../common/utils/getReqUrl");
function signatureUrl(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    name = objectName_1.objectName(name);
    options.method = options.method || 'GET';
    var expires = utility_1.default.timestamp() + (options.expires || 1800);
    var params = {
        bucket: this.options.bucket,
        object: name
    };
    var resource = getResource_1.getResource(params, this.options.headerEncoding);
    if (this.options.stsToken) {
        options['security-token'] = this.options.stsToken;
    }
    var signRes = signUtils_1._signatureForURL(this.options.accessKeySecret, options, resource, expires);
    var url = url_1.default.parse(getReqUrl_1.getReqUrl(params, this.options));
    url.query = {
        OSSAccessKeyId: this.options.accessKeyId,
        Expires: expires,
        Signature: signRes.Signature
    };
    copy_to_1.default(signRes.subResource).to(url.query);
    return url.format();
}
exports.signatureUrl = signatureUrl;

},{"../../common/utils/getReqUrl":131,"../../common/utils/getResource":132,"../../common/utils/objectName":145,"../../common/utils/signUtils":149,"copy-to":187,"url":340,"utility":353}],108:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports._getObjectMeta = void 0;
var head_1 = require("../object/head");
/**
 * Get Object Meta
 * @param {String} bucket  bucket name
 * @param {String} name   object name
 * @param {Object} options
 */
function _getObjectMeta(bucket, name) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var currentBucket, data;
    return _regenerator2.default.async(function _getObjectMeta$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    currentBucket = this.options.bucket;

                    this.setBucket(bucket);
                    _context.prev = 2;
                    _context.next = 5;
                    return _regenerator2.default.awrap(head_1.head.call(this, name, options));

                case 5:
                    data = _context.sent;

                    this.setBucket(currentBucket);
                    return _context.abrupt("return", data);

                case 10:
                    _context.prev = 10;
                    _context.t0 = _context["catch"](2);

                    this.setBucket(currentBucket);
                    throw _context.t0;

                case 14:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this, [[2, 10]]);
}
exports._getObjectMeta = _getObjectMeta;

},{"../object/head":98,"babel-runtime/regenerator":176}],109:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports._makeCancelEvent = void 0;
function _makeCancelEvent() {
    var cancelEvent = {
        status: 0,
        name: 'cancel'
    };
    return cancelEvent;
}
exports._makeCancelEvent = _makeCancelEvent;

},{}],110:[function(require,module,exports){
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports._parallel = void 0;
function _parallel(todo, num, fn, sourceData) {
    var that = this;
    return new _promise2.default(function (res) {
        var jobErr = [];
        var doing = [];
        var jobs = todo.map(function (_) {
            return function () {
                return fn(_, sourceData);
            };
        });
        for (var i = 0; i < num && todo && todo.length && !that.isCancel(); i++) {
            continueFn(jobs);
        }
        function continueFn(queue) {
            if (!queue || !queue.length || that.isCancel()) {
                return;
            }
            var item = queue.pop();
            doing.push(item);
            item().then(function (_res) {
                continueFn(queue);
            }).catch(function (_err) {
                queue.length = 0;
                jobErr.push(_err);
                res(jobErr);
            }).finally(function () {
                doing.pop();
                if (!doing.length) res();
            });
        }
    });
}
exports._parallel = _parallel;

},{"babel-runtime/core-js/promise":163}],111:[function(require,module,exports){
"use strict";

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._unSupportBrowserTip = void 0;
var platform_1 = __importDefault(require("platform"));
function _unSupportBrowserTip() {
    var _platform_1$default = platform_1.default,
        name = _platform_1$default.name,
        version = _platform_1$default.version;

    if (name && name.toLowerCase && name.toLowerCase() === 'ie' && version.split('.')[0] < 10) {
        console.warn('ali-oss does not support the current browser');
    }
}
exports._unSupportBrowserTip = _unSupportBrowserTip;

},{"platform":316}],112:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = void 0;
var signUtils_1 = require("./signUtils");
function authorization(method, resource, subres, headers, config, headerEncoding) {
    var stringToSign = signUtils_1.buildCanonicalString(method.toUpperCase(), resource, {
        headers: headers,
        parameters: subres
    });
    return "OSS " + config.accessKeyId + ":" + signUtils_1.computeSignature(config.accessKeySecret, stringToSign, headerEncoding);
}
exports.authorization = authorization;

},{"./signUtils":149}],113:[function(require,module,exports){
"use strict";

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBrowserAndVersion = void 0;
var bowser_1 = __importDefault(require("bowser"));
/*
 * Check Browser And Version
 * @param {String} [name] browser name: like IE, Chrome, Firefox
 * @param {String} [version] browser major version: like 10(IE 10.x), 55(Chrome 55.x), 50(Firefox 50.x)
 * @return {Bool} true or false
 * @api private
 */
function checkBrowserAndVersion(name, version) {
    return bowser_1.default.name === name && bowser_1.default.version.split('.')[0] === version;
}
exports.checkBrowserAndVersion = checkBrowserAndVersion;

},{"bowser":178}],114:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBucketName = void 0;
exports.checkBucketName = function (name) {
    var createBucket = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var bucketRegex = createBucket ? /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/ : /^[a-z0-9_][a-z0-9-_]{1,61}[a-z0-9_]$/;
    if (!bucketRegex.test(name)) {
        throw new Error('The bucket must be conform to the specifications');
    }
};

},{}],115:[function(require,module,exports){
"use strict";

var _entries = require("babel-runtime/core-js/object/entries");

var _entries2 = _interopRequireDefault(_entries);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBucketTag = void 0;
var checkValid_1 = require("./checkValid");
var isObject_1 = require("./isObject");
var commonRules = [{
    validator: function validator(value) {
        if (typeof value !== 'string') {
            throw new Error('the key and value of the tag must be String');
        }
    }
}];
var rules = {
    key: [].concat(commonRules, [{
        pattern: /^.{1,64}$/,
        msg: 'tag key can be a maximum of 64 bytes in length'
    }, {
        pattern: /^(?!https*:\/\/|Aliyun)/,
        msg: 'tag key can not startsWith: http://, https://, Aliyun'
    }]),
    value: [].concat(commonRules, [{
        pattern: /^.{0,128}$/,
        msg: 'tag value can be a maximum of 128 bytes in length'
    }])
};
exports.checkBucketTag = function (tag) {
    if (!isObject_1.isObject(tag)) {
        throw new Error('bucket tag must be Object');
    }
    var entries = (0, _entries2.default)(tag);
    if (entries.length > 20) {
        throw new Error('maximum of 20 tags for a bucket');
    }
    var rulesIndexKey = ['key', 'value'];
    entries.forEach(function (keyValue) {
        keyValue.forEach(function (item, index) {
            checkValid_1.checkValid(item, rules[rulesIndexKey[index]]);
        });
    });
};

},{"./checkValid":118,"./isObject":142,"babel-runtime/core-js/object/entries":159}],116:[function(require,module,exports){
"use strict";

var _entries = require("babel-runtime/core-js/object/entries");

var _entries2 = _interopRequireDefault(_entries);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.checkObjectTag = void 0;
var checkValid_1 = require("./checkValid");
var isObject_1 = require("./isObject");
var commonRules = [{
    validator: function validator(value) {
        if (typeof value !== 'string') {
            throw new Error('the key and value of the tag must be String');
        }
    }
}, {
    pattern: /^[a-zA-Z0-9 +-=._:/]+$/,
    msg: 'tag can contain letters, numbers, spaces, and the following symbols: plus sign (+), hyphen (-), equal sign (=), period (.), underscore (_), colon (:), and forward slash (/)'
}];
var rules = {
    key: [].concat(commonRules, [{
        pattern: /^.{1,128}$/,
        msg: 'tag key can be a maximum of 128 bytes in length'
    }]),
    value: [].concat(commonRules, [{
        pattern: /^.{0,256}$/,
        msg: 'tag value can be a maximum of 256 bytes in length'
    }])
};
function checkObjectTag(tag) {
    if (!isObject_1.isObject(tag)) {
        throw new Error('tag must be Object');
    }
    var entries = (0, _entries2.default)(tag);
    if (entries.length > 10) {
        throw new Error('maximum of 10 tags for a object');
    }
    var rulesIndexKey = ['key', 'value'];
    entries.forEach(function (keyValue) {
        keyValue.forEach(function (item, index) {
            checkValid_1.checkValid(item, rules[rulesIndexKey[index]]);
        });
    });
}
exports.checkObjectTag = checkObjectTag;

},{"./checkValid":118,"./isObject":142,"babel-runtime/core-js/object/entries":159}],117:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserAgent = void 0;
exports.checkUserAgent = function (ua) {
    var userAgent = ua.replace(/\u03b1/, 'alpha').replace(/\u03b2/, 'beta');
    return userAgent;
};

},{}],118:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.checkValid = void 0;
function checkValid(_value, _rules) {
    _rules.forEach(function (rule) {
        if (rule.validator) {
            rule.validator(_value);
        } else if (rule.pattern && !rule.pattern.test(_value)) {
            throw new Error(rule.msg);
        }
    });
}
exports.checkValid = checkValid;

},{}],119:[function(require,module,exports){
"use strict";

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.convertMetaToHeaders = void 0;
function convertMetaToHeaders(meta, headers) {
    if (!meta) return;
    (0, _keys2.default)(meta).forEach(function (k) {
        headers["x-oss-meta-" + k] = meta[k];
    });
}
exports.convertMetaToHeaders = convertMetaToHeaders;

},{"babel-runtime/core-js/object/keys":161}],120:[function(require,module,exports){
"use strict";

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _entries = require("babel-runtime/core-js/object/entries");

var _entries2 = _interopRequireDefault(_entries);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.dataFix = void 0;
var isObject_1 = require("./isObject");
var TRUE = ['true', 'TRUE', '1', 1];
var FALSE = ['false', 'FALSE', '0', 0];
function dataFix(o, conf, finalKill) {
    if (!isObject_1.isObject(o)) return;
    var _conf$remove = conf.remove,
        remove = _conf$remove === undefined ? [] : _conf$remove,
        _conf$rename = conf.rename,
        rename = _conf$rename === undefined ? {} : _conf$rename,
        _conf$camel = conf.camel,
        camel = _conf$camel === undefined ? [] : _conf$camel,
        _conf$bool = conf.bool,
        bool = _conf$bool === undefined ? [] : _conf$bool,
        _conf$lowerFirst = conf.lowerFirst,
        lowerFirst = _conf$lowerFirst === undefined ? false : _conf$lowerFirst;
    // 删除不需要的数据

    remove.forEach(function (v) {
        return delete o[v];
    });
    // 重命名
    (0, _entries2.default)(rename).forEach(function (v) {
        if (!o[v[0]]) return;
        if (o[v[1]]) return;
        o[v[1]] = o[v[0]];
        delete o[v[0]];
    });
    // 驼峰化
    camel.forEach(function (v) {
        if (!o[v]) return;
        var afterKey = v.replace(/^(.)/, function ($0) {
            return $0.toLowerCase();
        }).replace(/-(\w)/g, function (_, $1) {
            return $1.toUpperCase();
        });
        if (o[afterKey]) return;
        o[afterKey] = o[v];
        // todo 暂时兼容以前数据，不做删除
        // delete o[v];
    });
    // 转换值为布尔值
    bool.forEach(function (v) {
        o[v] = fixBool(o[v]);
    });
    // finalKill
    if (typeof finalKill === 'function') {
        finalKill(o);
    }
    // 首字母转小写
    fixLowerFirst(o, lowerFirst);
    return dataFix;
}
exports.dataFix = dataFix;
function fixBool(value) {
    if (!value) return false;
    if (TRUE.includes(value)) return true;
    return FALSE.includes(value) ? false : value;
}
function fixLowerFirst(o, lowerFirst) {
    if (lowerFirst) {
        (0, _keys2.default)(o).forEach(function (key) {
            var lowerK = key.replace(/^\w/, function (match) {
                return match.toLowerCase();
            });
            if (typeof o[lowerK] === 'undefined') {
                o[lowerK] = o[key];
                delete o[key];
            }
        });
    }
}

},{"./isObject":142,"babel-runtime/core-js/object/entries":159,"babel-runtime/core-js/object/keys":161}],121:[function(require,module,exports){
"use strict";

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.deepCopy = void 0;
exports.deepCopy = function (obj) {
    if (obj === null || (typeof obj === "undefined" ? "undefined" : (0, _typeof3.default)(obj)) !== 'object') {
        return obj;
    }
    var copy = Array.isArray(obj) ? [] : {};
    (0, _keys2.default)(obj).forEach(function (key) {
        copy[key] = exports.deepCopy(obj[key]);
    });
    return copy;
};

},{"babel-runtime/core-js/object/keys":161,"babel-runtime/helpers/typeof":173}],122:[function(require,module,exports){
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFileSafe = void 0;
var fs_1 = __importDefault(require("fs"));
var debug_1 = __importDefault(require("debug"));
var debug = debug_1.default('ali-oss');
function deleteFileSafe(filepath) {
    return new _promise2.default(function (resolve) {
        fs_1.default.exists(filepath, function (exists) {
            if (!exists) {
                resolve();
            } else {
                fs_1.default.unlink(filepath, function (err) {
                    if (err) {
                        debug('unlink %j error: %s', filepath, err);
                    }
                    resolve();
                });
            }
        });
    });
}
exports.deleteFileSafe = deleteFileSafe;

},{"babel-runtime/core-js/promise":163,"debug":351,"fs":179}],123:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.divideParts = void 0;
function divideParts(fileSize, partSize) {
    var numParts = Math.ceil(fileSize / partSize);
    var partOffs = [];
    for (var i = 0; i < numParts; i++) {
        var start = partSize * i;
        var end = Math.min(start + partSize, fileSize);
        partOffs.push({
            start: start,
            end: end
        });
    }
    return partOffs;
}
exports.divideParts = divideParts;

},{}],124:[function(require,module,exports){
(function (Buffer){
"use strict";

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeCallback = void 0;
function encodeCallback(reqParams, options) {
    reqParams.headers = reqParams.headers || {};
    if (!Object.prototype.hasOwnProperty.call(reqParams.headers, 'x-oss-callback')) {
        if (options.callback) {
            var json = {
                callbackUrl: encodeURI(options.callback.url),
                callbackBody: options.callback.body
            };
            if (options.callback.host) {
                json.callbackHost = options.callback.host;
            }
            if (options.callback.contentType) {
                json.callbackBodyType = options.callback.contentType;
            }
            var callback = Buffer.from((0, _stringify2.default)(json)).toString('base64');
            reqParams.headers['x-oss-callback'] = callback;
            if (options.callback.customValue) {
                var callbackVar = {};
                (0, _keys2.default)(options.callback.customValue).forEach(function (key) {
                    callbackVar["x:" + key] = options.callback.customValue[key];
                });
                reqParams.headers['x-oss-callback-var'] = Buffer.from((0, _stringify2.default)(callbackVar)).toString('base64');
            }
        }
    }
}
exports.encodeCallback = encodeCallback;

}).call(this,require("buffer").Buffer)
},{"babel-runtime/core-js/json/stringify":155,"babel-runtime/core-js/object/keys":161,"buffer":184}],125:[function(require,module,exports){
(function (Buffer){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.encoder = void 0;
function encoder(str) {
    var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'utf-8';

    if (encoding === 'utf-8') return str;
    return Buffer.from(str).toString('latin1');
}
exports.encoder = encoder;

}).call(this,require("buffer").Buffer)
},{"buffer":184}],126:[function(require,module,exports){
"use strict";

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeName = void 0;
var utility_1 = __importDefault(require("utility"));
var _defaultConfig = {
    reg: /%2F/g,
    str: '/'
};
function escapeName(name) {
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _defaultConfig;
    var reg = config.reg,
        str = config.str;

    return utility_1.default.encodeURIComponent(name).replace(reg, str);
}
exports.escapeName = escapeName;

},{"utility":353}],127:[function(require,module,exports){
"use strict";

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.formatObjKey = void 0;
function formatObjKey(obj, type) {
    if (obj === null || (typeof obj === "undefined" ? "undefined" : (0, _typeof3.default)(obj)) !== 'object') {
        return obj;
    }
    var o = void 0;
    if (Array.isArray(obj)) {
        o = [];
        for (var i = 0; i < obj.length; i++) {
            o.push(formatObjKey(obj[i], type));
        }
    } else {
        o = {};
        (0, _keys2.default)(obj).forEach(function (key) {
            o[handelFormat(key, type)] = formatObjKey(obj[key], type);
        });
    }
    return o;
}
exports.formatObjKey = formatObjKey;
function handelFormat(key, type) {
    if (type === 'firstUpperCase') {
        key = key.replace(/^./, function (_) {
            return _.toUpperCase();
        });
    } else if (type === 'firstLowerCase') {
        key = key.replace(/^./, function (_) {
            return _.toLowerCase();
        });
    }
    return key;
}

},{"babel-runtime/core-js/object/keys":161,"babel-runtime/helpers/typeof":173}],128:[function(require,module,exports){
"use strict";

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.formatQuery = void 0;
var isObject_1 = require("./isObject");
function camel2Line(name) {
    return name.replace(/([A-Z])/g, '-$1').toLowerCase();
}
function formatQuery() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var obj = {};
    if (isObject_1.isObject(query)) {
        (0, _keys2.default)(query).forEach(function (key) {
            obj[camel2Line(key)] = query[key];
        });
    }
    return obj;
}
exports.formatQuery = formatQuery;

},{"./isObject":142,"babel-runtime/core-js/object/keys":161}],129:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTag = void 0;
var isObject_1 = require("./isObject");
function formatTag(obj) {
    if (obj.Tagging !== undefined) {
        obj = obj.Tagging.TagSet.Tag;
    } else if (obj.TagSet !== undefined) {
        obj = obj.TagSet.Tag;
    } else if (obj.Tag !== undefined) {
        obj = obj.Tag;
    }
    obj = obj && isObject_1.isObject(obj) ? [obj] : obj || [];
    var tag = {};
    obj.forEach(function (item) {
        tag[item.Key] = item.Value;
    });
    return tag;
}
exports.formatTag = formatTag;

},{"./isObject":142}],130:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartSize = void 0;
var defaultPartSize = 1 * 1024 * 1024;
function getPartSize(fileSize, partSize) {
    var maxNumParts = 10 * 1000;
    var safeSize = Math.ceil(fileSize / maxNumParts);
    if (!partSize) partSize = defaultPartSize;
    if (partSize < safeSize) {
        partSize = safeSize;
        console.warn("partSize has been set to " + partSize + ", because the partSize you provided causes partNumber to be greater than 10,000");
    }
    return partSize;
}
exports.getPartSize = getPartSize;

},{}],131:[function(require,module,exports){
"use strict";

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReqUrl = void 0;
var is_type_of_1 = __importDefault(require("is-type-of"));
var copy_to_1 = __importDefault(require("copy-to"));
var url_1 = __importDefault(require("url"));
var merge_descriptors_1 = __importDefault(require("merge-descriptors"));
var isIP_1 = require("./isIP");
var escapeName_1 = require("./escapeName");
function getReqUrl(params, options) {
    var ep = {};
    copy_to_1.default(options.endpoint, false).to(ep);
    var _isIP = isIP_1.isIP(ep.hostname);
    var isCname = options.cname;
    if (params.bucket && !isCname && !_isIP && !options.sldEnable) {
        ep.host = params.bucket + "." + ep.host;
    }
    var resourcePath = '/';
    if (params.bucket && (options.sldEnable || _isIP)) {
        resourcePath += params.bucket + "/";
    }
    if (params.object) {
        // Preserve '/' in result url
        resourcePath += escapeName_1.escapeName(params.object).replace(/\+/g, '%2B');
    }
    ep.pathname = resourcePath;
    var query = {};
    if (params.query) {
        merge_descriptors_1.default(query, params.query);
    }
    if (params.subres) {
        var subresAsQuery = {};
        if (is_type_of_1.default.string(params.subres)) {
            subresAsQuery[params.subres] = '';
        } else if (is_type_of_1.default.array(params.subres)) {
            params.subres.forEach(function (k) {
                subresAsQuery[k] = '';
            });
        } else {
            subresAsQuery = params.subres;
        }
        merge_descriptors_1.default(query, subresAsQuery);
    }
    ep.query = query;
    return url_1.default.format(ep);
}
exports.getReqUrl = getReqUrl;

},{"./escapeName":126,"./isIP":141,"copy-to":187,"is-type-of":352,"merge-descriptors":310,"url":340}],132:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getResource = void 0;
var encoder_1 = require("./encoder");
function getResource(params, headerEncoding) {
    var resource = '/';
    if (params.bucket) resource += params.bucket + "/";
    if (params.object) resource += encoder_1.encoder(params.object, headerEncoding);
    return resource;
}
exports.getResource = getResource;

},{"./encoder":125}],133:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getSourceName = void 0;
var checkBucketName_1 = require("./checkBucketName");
var objectName_1 = require("./objectName");
function getSourceName(sourceName, bucketName, configBucket) {
    if (typeof bucketName === 'string') {
        sourceName = objectName_1.objectName(sourceName);
    } else if (sourceName[0] !== '/') {
        bucketName = configBucket;
    } else {
        bucketName = sourceName.replace(/\/(.+?)(\/.*)/, '$1');
        sourceName = sourceName.replace(/(\/.+?\/)(.*)/, '$2');
    }
    checkBucketName_1.checkBucketName(bucketName, false);
    sourceName = encodeURI(sourceName);
    sourceName = "/" + bucketName + "/" + sourceName;
    return sourceName;
}
exports.getSourceName = getSourceName;

},{"./checkBucketName":114,"./objectName":145}],134:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getStrBytesCount = void 0;
function getStrBytesCount(str) {
    var bytesCount = 0;
    for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i);
        if (/^[\u00-\uff]$/.test(c)) {
            bytesCount += 1;
        } else {
            bytesCount += 2;
        }
    }
    return bytesCount;
}
exports.getStrBytesCount = getStrBytesCount;

},{}],135:[function(require,module,exports){
(function (process){
"use strict";

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAgent = void 0;
var platform_1 = __importDefault(require("platform"));
var version_1 = require("../../browser/version");
var checkUserAgent_1 = require("./checkUserAgent");
exports.getUserAgent = function () {
    var agent = process && process.browser ? 'js' : 'nodejs';
    var sdk = "aliyun-sdk-" + agent + "/" + version_1.version;
    var plat = platform_1.default.description;
    if (!plat && process) {
        plat = "Node.js " + process.version.slice(1) + " on " + process.platform + " " + process.arch;
    }
    return checkUserAgent_1.checkUserAgent(sdk + " " + plat);
};

}).call(this,require('_process'))
},{"../../browser/version":10,"./checkUserAgent":117,"_process":318,"platform":316}],136:[function(require,module,exports){
"use strict";

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var _getObjectMeta_1 = require("./_getObjectMeta");
var authorization_1 = require("./authorization");
var checkBrowserAndVersion_1 = require("./checkBrowserAndVersion");
var checkBucketName_1 = require("./checkBucketName");
var checkBucketTag_1 = require("./checkBucketTag");
var checkObjectTag_1 = require("./checkObjectTag");
var checkUserAgent_1 = require("./checkUserAgent");
var checkValid_1 = require("./checkValid");
var convertMetaToHeaders_1 = require("./convertMetaToHeaders");
var deepCopy_1 = require("./deepCopy");
var deleteFileSafe_1 = require("./deleteFileSafe");
var divideParts_1 = require("./divideParts");
var encodeCallback_1 = require("./encodeCallback");
var escapeName_1 = require("./escapeName");
var formatObjKey_1 = require("./formatObjKey");
var formatQuery_1 = require("./formatQuery");
var formatTag_1 = require("./formatTag");
var getPartSize_1 = require("./getPartSize");
var getReqUrl_1 = require("./getReqUrl");
var getResource_1 = require("./getResource");
var getSourceName_1 = require("./getSourceName");
var getStrBytesCount_1 = require("./getStrBytesCount");
var getUserAgent_1 = require("./getUserAgent");
var isArray_1 = require("./isArray");
var isBlob_1 = require("./isBlob");
var isFile_1 = require("./isFile");
var isIP_1 = require("./isIP");
var isObject_1 = require("./isObject");
var mergeDefault_1 = require("./mergeDefault");
var obj2xml_1 = require("./obj2xml");
var objectName_1 = require("./objectName");
var objectUrl_1 = require("./objectUrl");
var parseXML_1 = require("./parseXML");
var policy2Str_1 = require("./policy2Str");
var signUtils_1 = __importDefault(require("./signUtils"));
var webFileReadStream_1 = require("./webFileReadStream");
exports.default = {
    _getObjectMeta: _getObjectMeta_1._getObjectMeta,
    authorization: authorization_1.authorization,
    checkBrowserAndVersion: checkBrowserAndVersion_1.checkBrowserAndVersion,
    checkBucketName: checkBucketName_1.checkBucketName,
    checkBucketTag: checkBucketTag_1.checkBucketTag,
    checkObjectTag: checkObjectTag_1.checkObjectTag,
    checkUserAgent: checkUserAgent_1.checkUserAgent,
    checkValid: checkValid_1.checkValid,
    convertMetaToHeaders: convertMetaToHeaders_1.convertMetaToHeaders,
    deepCopy: deepCopy_1.deepCopy,
    deleteFileSafe: deleteFileSafe_1.deleteFileSafe,
    divideParts: divideParts_1.divideParts,
    encodeCallback: encodeCallback_1.encodeCallback,
    escapeName: escapeName_1.escapeName,
    formatObjKey: formatObjKey_1.formatObjKey,
    formatQuery: formatQuery_1.formatQuery,
    formatTag: formatTag_1.formatTag,
    getPartSize: getPartSize_1.getPartSize,
    getReqUrl: getReqUrl_1.getReqUrl,
    getResource: getResource_1.getResource,
    getSourceName: getSourceName_1.getSourceName,
    getStrBytesCount: getStrBytesCount_1.getStrBytesCount,
    getUserAgent: getUserAgent_1.getUserAgent,
    isArray: isArray_1.isArray,
    isBlob: isBlob_1.isBlob,
    isFile: isFile_1.isFile,
    isIP: isIP_1.isIP,
    isObject: isObject_1.isObject,
    mergeDefault: mergeDefault_1.mergeDefault,
    obj2xml: obj2xml_1.obj2xml,
    objectName: objectName_1.objectName,
    _objectName: objectName_1.objectName,
    objectUrl: objectUrl_1.objectUrl,
    _objectUrl: objectUrl_1.objectUrl,
    parseXML: parseXML_1.parseXML,
    policy2Str: policy2Str_1.policy2Str,
    signUtils: signUtils_1.default,
    WebFileReadStream: webFileReadStream_1.WebFileReadStream
};

},{"./_getObjectMeta":108,"./authorization":112,"./checkBrowserAndVersion":113,"./checkBucketName":114,"./checkBucketTag":115,"./checkObjectTag":116,"./checkUserAgent":117,"./checkValid":118,"./convertMetaToHeaders":119,"./deepCopy":121,"./deleteFileSafe":122,"./divideParts":123,"./encodeCallback":124,"./escapeName":126,"./formatObjKey":127,"./formatQuery":128,"./formatTag":129,"./getPartSize":130,"./getReqUrl":131,"./getResource":132,"./getSourceName":133,"./getStrBytesCount":134,"./getUserAgent":135,"./isArray":137,"./isBlob":138,"./isFile":140,"./isIP":141,"./isObject":142,"./mergeDefault":143,"./obj2xml":144,"./objectName":145,"./objectUrl":146,"./parseXML":147,"./policy2Str":148,"./signUtils":149,"./webFileReadStream":150}],137:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.isArray = void 0;
exports.isArray = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

},{}],138:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.isBlob = void 0;
function isBlob(blob) {
    return typeof Blob !== 'undefined' && blob instanceof Blob;
}
exports.isBlob = isBlob;

},{}],139:[function(require,module,exports){
(function (Buffer){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.isBuffer = void 0;
function isBuffer(obj) {
    return Buffer.isBuffer(obj);
}
exports.isBuffer = isBuffer;

}).call(this,{"isBuffer":require("../../../node_modules/is-buffer/index.js")})
},{"../../../node_modules/is-buffer/index.js":307}],140:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.isFile = void 0;
exports.isFile = function (obj) {
    return typeof File !== 'undefined' && obj instanceof File;
};

},{}],141:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.isIP = void 0;
// it provide commont methods for node and browser , we will add more solutions later in this file
/**
 * Judge isIP include ipv4 or ipv6
 * @param {String} options
 * @return {Array} the multipart uploads
 */
exports.isIP = function (host) {
  var ipv4Regex = /^(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}$/;
  var ipv6Regex = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
  return ipv4Regex.test(host) || ipv6Regex.test(host);
};

},{}],142:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.isObject = void 0;
exports.isObject = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
};

},{}],143:[function(require,module,exports){
"use strict";

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeDefault = void 0;
var merge_descriptors_1 = __importDefault(require("merge-descriptors"));
function mergeDefault(source, mod) {
    merge_descriptors_1.default(source, mod.default ? mod.default : mod);
}
exports.mergeDefault = mergeDefault;

},{"merge-descriptors":310}],144:[function(require,module,exports){
"use strict";

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.obj2xml = void 0;
var formatObjKey_1 = require("./formatObjKey");
function type(params) {
    return Object.prototype.toString.call(params).replace(/(.*? |])/g, '').toLowerCase();
}
function obj2xml(obj, options) {
    var s = '';
    if (options && options.headers) {
        s = '<?xml version="1.0" encoding="UTF-8"?>\n';
    }
    if (options && options.firstUpperCase) {
        obj = formatObjKey_1.formatObjKey(obj, 'firstUpperCase');
    }
    if (type(obj) === 'object') {
        (0, _keys2.default)(obj).forEach(function (key) {
            // filter undefined or null
            if (type(obj[key]) !== 'undefined' && type(obj[key]) !== 'null') {
                if (type(obj[key]) === 'string' || type(obj[key]) === 'number') {
                    s += "<" + key + ">" + obj[key] + "</" + key + ">";
                } else if (type(obj[key]) === 'object') {
                    s += "<" + key + ">" + obj2xml(obj[key]) + "</" + key + ">";
                } else if (type(obj[key]) === 'array') {
                    s += obj[key].map(function (keyChild) {
                        return "<" + key + ">" + obj2xml(keyChild) + "</" + key + ">";
                    }).join('');
                } else {
                    s += "<" + key + ">" + obj[key].toString() + "</" + key + ">";
                }
            }
        });
    } else {
        s += obj.toString();
    }
    return s;
}
exports.obj2xml = obj2xml;

},{"./formatObjKey":127,"babel-runtime/core-js/object/keys":161}],145:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.objectName = void 0;
function objectName(name) {
    return name.replace(/^\/+/, '');
}
exports.objectName = objectName;

},{}],146:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.objectUrl = void 0;
var getReqUrl_1 = require("./getReqUrl");
function objectUrl(name, options) {
    options = options || this.options;
    return getReqUrl_1.getReqUrl({ bucket: options.bucket, object: name }, options);
}
exports.objectUrl = objectUrl;

},{"./getReqUrl":131}],147:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var xml2js_1 = require("./xml2js");
Object.defineProperty(exports, "parseXML", { enumerable: true, get: function get() {
    return xml2js_1.xml2objPromise;
  } });

},{"./xml2js":151}],148:[function(require,module,exports){
"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.policy2Str = void 0;
function policy2Str(policy) {
    var policyStr = void 0;
    if (policy) {
        if (typeof policy === 'string') {
            try {
                policyStr = (0, _stringify2.default)(JSON.parse(policy));
            } catch (err) {
                throw new Error("Policy string is not a valid JSON: " + err.message);
            }
        } else {
            policyStr = (0, _stringify2.default)(policy);
        }
    }
    return policyStr;
}
exports.policy2Str = policy2Str;

},{"babel-runtime/core-js/json/stringify":155}],149:[function(require,module,exports){
(function (Buffer){
"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._signatureForURL = exports.authorization = exports.computeSignature = exports.buildCanonicalString = exports.buildCanonicalizedResource = void 0;
var crypto_1 = __importDefault(require('./../../../shims/crypto/crypto.js'));
var is_type_of_1 = __importDefault(require("is-type-of"));
/**
 *
 * @param {String} resourcePath
 * @param {Object} parameters
 * @return
 */
function buildCanonicalizedResource(resourcePath, parameters) {
    var canonicalizedResource = "" + resourcePath;
    var separatorString = '?';
    if (is_type_of_1.default.string(parameters) && parameters.trim() !== '') {
        canonicalizedResource += separatorString + parameters;
    } else if (is_type_of_1.default.array(parameters)) {
        parameters.sort();
        canonicalizedResource += separatorString + parameters.join('&');
    } else if (parameters) {
        var compareFunc = function compareFunc(entry1, entry2) {
            if (entry1[0] > entry2[0]) {
                return 1;
            } else if (entry1[0] < entry2[0]) {
                return -1;
            }
            return 0;
        };
        var processFunc = function processFunc(key) {
            canonicalizedResource += separatorString + key;
            if (parameters[key]) {
                canonicalizedResource += "=" + parameters[key];
            }
            separatorString = '&';
        };
        (0, _keys2.default)(parameters).sort(compareFunc).forEach(processFunc);
    }
    return canonicalizedResource;
}
exports.buildCanonicalizedResource = buildCanonicalizedResource;
/**
 * @param {String} method
 * @param {String} resourcePath
 * @param {Object} request
 * @param {String} expires
 * @return {String} canonicalString
 */
function buildCanonicalString(method, resourcePath, request, expires) {
    request = request || {};
    var headers = request.headers || {};
    var OSS_PREFIX = 'x-oss-';
    var ossHeaders = [];
    var headersToSign = {};
    var signContent = [method.toUpperCase(), headers['Content-Md5'] || '', headers['Content-Type'] || headers['Content-Type'.toLowerCase()], expires || headers['x-oss-date']];
    (0, _keys2.default)(headers).forEach(function (key) {
        var lowerKey = key.toLowerCase();
        if (lowerKey.indexOf(OSS_PREFIX) === 0) {
            headersToSign[lowerKey] = String(headers[key]).trim();
        }
    });
    (0, _keys2.default)(headersToSign).sort().forEach(function (key) {
        ossHeaders.push(key + ":" + headersToSign[key]);
    });
    signContent = signContent.concat(ossHeaders);
    signContent.push(buildCanonicalizedResource(resourcePath, request.parameters));
    return signContent.join('\n');
}
exports.buildCanonicalString = buildCanonicalString;
/**
 * @param {String} accessKeySecret
 * @param {String} canonicalString
 */
function computeSignature(accessKeySecret, canonicalString) {
    var headerEncoding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'utf-8';

    var signature = crypto_1.default.createHmac('sha1', accessKeySecret);
    return signature.update(Buffer.from(canonicalString, headerEncoding)).digest('base64');
}
exports.computeSignature = computeSignature;
/**
 * @param {String} accessKeyId
 * @param {String} accessKeySecret
 * @param {String} canonicalString
 */
function authorization(accessKeyId, accessKeySecret, canonicalString) {
    return "OSS " + accessKeyId + ":" + computeSignature(accessKeySecret, canonicalString);
}
exports.authorization = authorization;
/**
 *
 * @param {String} accessKeySecret
 * @param {Object} options
 * @param {String} resource
 * @param {Number} expires
 */
function _signatureForURL(accessKeySecret) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var resource = arguments[2];
    var expires = arguments[3];
    var headerEncoding = arguments[4];

    var headers = {};
    var _options$subResource = options.subResource,
        subResource = _options$subResource === undefined ? {} : _options$subResource;

    if (options.process) {
        var processKeyword = 'x-oss-process';
        subResource[processKeyword] = options.process;
    }
    if (options.trafficLimit) {
        var trafficLimitKey = 'x-oss-traffic-limit';
        subResource[trafficLimitKey] = options.trafficLimit;
    }
    if (options.response) {
        (0, _keys2.default)(options.response).forEach(function (k) {
            var key = "response-" + k.toLowerCase();
            subResource[key] = options.response[k];
        });
    }
    (0, _keys2.default)(options).forEach(function (key) {
        var lowerKey = key.toLowerCase();
        var value = options[key];
        if (lowerKey.indexOf('x-oss-') === 0) {
            headers[lowerKey] = value;
        } else if (lowerKey.indexOf('content-md5') === 0) {
            headers[key] = value;
        } else if (lowerKey.indexOf('content-type') === 0) {
            headers[key] = value;
        }
    });
    if (Object.prototype.hasOwnProperty.call(options, 'security-token')) {
        subResource['security-token'] = options['security-token'];
    }
    if (Object.prototype.hasOwnProperty.call(options, 'callback')) {
        var json = {
            callbackUrl: encodeURI(options.callback.url),
            callbackBody: options.callback.body
        };
        if (options.callback.host) {
            json.callbackHost = options.callback.host;
        }
        if (options.callback.contentType) {
            json.callbackBodyType = options.callback.contentType;
        }
        subResource.callback = Buffer.from((0, _stringify2.default)(json)).toString('base64');
        if (options.callback.customValue) {
            var callbackVar = {};
            (0, _keys2.default)(options.callback.customValue).forEach(function (key) {
                callbackVar["x:" + key] = options.callback.customValue[key];
            });
            subResource['callback-var'] = Buffer.from((0, _stringify2.default)(callbackVar)).toString('base64');
        }
    }
    var canonicalString = buildCanonicalString(options.method, resource, {
        headers: headers,
        parameters: subResource
    }, expires.toString());
    return {
        Signature: computeSignature(accessKeySecret, canonicalString, headerEncoding),
        subResource: subResource
    };
}
exports._signatureForURL = _signatureForURL;
exports.default = {
    buildCanonicalizedResource: buildCanonicalizedResource,
    buildCanonicalString: buildCanonicalString,
    computeSignature: computeSignature,
    authorization: authorization,
    _signatureForURL: _signatureForURL
};

}).call(this,require("buffer").Buffer)
},{"./../../../shims/crypto/crypto.js":347,"babel-runtime/core-js/json/stringify":155,"babel-runtime/core-js/object/keys":161,"buffer":184,"is-type-of":352}],150:[function(require,module,exports){
(function (Buffer){
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.WebFileReadStream = void 0;
var stream_1 = require("stream");

var WebFileReadStream = function (_stream_1$Readable) {
    (0, _inherits3.default)(WebFileReadStream, _stream_1$Readable);

    function WebFileReadStream(file) {
        var _ret;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        (0, _classCallCheck3.default)(this, WebFileReadStream);

        var _this = (0, _possibleConstructorReturn3.default)(this, (WebFileReadStream.__proto__ || (0, _getPrototypeOf2.default)(WebFileReadStream)).call(this, options));

        if (!(_this instanceof WebFileReadStream)) return _ret = new WebFileReadStream(file, options), (0, _possibleConstructorReturn3.default)(_this, _ret);
        _this.file = file;
        _this.reader = new FileReader();
        _this.start = 0;
        _this.finish = false;
        _this.fileBuffer = null;
        return _this;
    }

    (0, _createClass3.default)(WebFileReadStream, [{
        key: "readFileAndPush",
        value: function readFileAndPush(size) {
            if (this.fileBuffer) {
                var pushRet = true;
                while (pushRet && this.fileBuffer && this.start < this.fileBuffer.length) {
                    var start = this.start;

                    var end = start + size;
                    end = end > this.fileBuffer.length ? this.fileBuffer.length : end;
                    this.start = end;
                    pushRet = this.push(this.fileBuffer.slice(start, end));
                }
            }
        }
    }, {
        key: "_read",
        value: function _read(size) {
            if (this.file && this.start >= this.file.size || this.fileBuffer && this.start >= this.fileBuffer.length || this.finish || this.start === 0 && !this.file) {
                if (!this.finish) {
                    this.fileBuffer = null;
                    this.finish = true;
                }
                this.push(null);
                return;
            }
            var defaultReadSize = 16 * 1024;
            size = size || defaultReadSize;
            var that = this;
            this.reader.onload = function (e) {
                that.fileBuffer = Buffer.from(new Uint8Array(e.target.result));
                that.file = null;
                that.readFileAndPush(size);
            };
            this.reader.onerror = function onload(e) {
                var error = e.srcElement && e.srcElement.error;
                if (error) throw error;
                throw e;
            };
            if (this.start === 0) {
                this.reader.readAsArrayBuffer(this.file);
            } else {
                this.readFileAndPush(size);
            }
        }
    }]);
    return WebFileReadStream;
}(stream_1.Readable);

exports.WebFileReadStream = WebFileReadStream;

}).call(this,require("buffer").Buffer)
},{"babel-runtime/core-js/object/get-prototype-of":160,"babel-runtime/helpers/classCallCheck":168,"babel-runtime/helpers/createClass":169,"babel-runtime/helpers/inherits":171,"babel-runtime/helpers/possibleConstructorReturn":172,"buffer":184,"stream":338}],151:[function(require,module,exports){
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _entries = require("babel-runtime/core-js/object/entries");

var _entries2 = _interopRequireDefault(_entries);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
exports.parseString = exports.xml2objPromise = void 0;
var isArray_1 = require("./isArray");
var isObject_1 = require("./isObject");
var ncname = '[a-zA-Z_][\\w\\-\\.]*';
var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
var startTagOpen = new RegExp("^<" + qnameCapture);
var startTagClose = /^\s*>/;
var startTagSelfClose = /^\s*\/>/;
var endTag = new RegExp("^<\\/" + qnameCapture + "[^>]*>");
var headLine = /<?.*version=.*?>/;
var decodingMap = {
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&amp;': '&',
    '&#10;': '\n',
    '&#9;': '\t',
    '&#39;': "'"
};
var encodedAttr = /&(?:lt|gt|quot|amp|#39);/g;
var encodedAttr1 = /&#([0-9]?[0-9]?[0-9]);/g;
function decodeAttr(value) {
    return value.replace(encodedAttr, function (match) {
        return decodingMap[match];
    }).replace(encodedAttr1, function (match) {
        return String.fromCharCode(match.replace(/[^0-9]/g, ''));
    });
}
function unique(arr) {
    if (!isArray_1.isArray(arr)) {
        return arr;
    }
    var uniqueArr = [];
    arr.forEach(function (item) {
        var hasTag = uniqueArr.find(function (_) {
            return _.tag === item.tag;
        });
        if (hasTag && hasTag.children) {
            var index = (0, _keys2.default)(hasTag).filter(function (_) {
                return _.startsWith('children');
            }).length;
            hasTag["children" + index] = item.children;
        } else {
            uniqueArr.push(item);
        }
    });
    return uniqueArr;
}
function formatObj(obj) {
    if (obj === null || (typeof obj === "undefined" ? "undefined" : (0, _typeof3.default)(obj)) !== 'object') {
        return obj;
    }
    var o = {};
    if (isObject_1.isObject(obj)) {
        if (obj.children) {
            obj.children = unique(obj.children);
        }
        var children = (0, _entries2.default)(obj).filter(function (_) {
            return _[0].startsWith('children');
        }).map(function (_) {
            return _[1];
        });
        if (children.length > 1) {
            o[obj.tag] = children.map(function (_) {
                return formatObj(_);
            });
        } else {
            o[obj.tag] = formatObj(children[0]);
        }
    }
    if (isArray_1.isArray(obj)) {
        if (obj.length === 0) {
            return '';
        }
        if (obj.find(function (_) {
            return !_.tag;
        })) {
            o = [];
        }

        var _loop = function _loop(i) {
            var _ = obj[i];
            (0, _keys2.default)(_).filter(function (key) {
                return key.startsWith('children');
            }).forEach(function (key) {
                _[key] = unique(_[key]);
            });
            if (isArray_1.isArray(o)) {
                if (_.tag) {
                    o.push((0, _defineProperty3.default)({}, _.tag, formatObj(_.children)));
                } else {
                    o.push(formatObj(_));
                }
            } else {
                var _children = (0, _entries2.default)(_).filter(function (item) {
                    return item[0].startsWith('children');
                }).map(function (item) {
                    return item[1];
                });
                if (_children.length > 1) {
                    o[_.tag] = _children.map(function (item) {
                        return formatObj(item);
                    });
                } else {
                    o[_.tag] = formatObj(_children[0]);
                }
            }
        };

        for (var i = 0; i < obj.length; i++) {
            _loop(i);
        }
    }
    return o;
}
function xml2obj(html) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        explicitRoot: false,
        explicitArray: false
    };

    var stack = [];
    var stackInner = [];
    var root = void 0;
    var currentParent = void 0;
    var index = 0;
    var last = void 0;
    if (typeof html !== 'string') {
        html = html.toString();
    }
    html = html.replace(headLine, '');
    if (root === undefined && html === '') {
        return null;
    }
    while (html) {
        last = html;
        var textEnd = html.indexOf('<');
        if (textEnd === 0) {
            // End tag:
            var endTagMatch = html.match(endTag);
            if (endTagMatch) {
                advance(endTagMatch[0].length);
                parseEndTag(endTagMatch[0], endTagMatch[1], index, index);
                continue;
            }
            // Start tag:
            var startTagMatch = parseStartTag();
            if (startTagMatch) {
                handleStartTag(startTagMatch);
                continue;
            }
        }
        var text = 0;
        if (textEnd > 0) {
            text = html.substring(0, textEnd);
            advance(textEnd);
        }
        if (textEnd < 0) {
            text = html;
            html = '';
        }
        if (handleChars && text) {
            handleChars(text);
        }
        if (html === last && handleChars) {
            handleChars(html);
            break;
        }
    }
    parseEndTag();
    root = formatObj(root);
    if (!options.explicitRoot) {
        root = root[(0, _keys2.default)(root)[0]];
    }
    return root;
    function advance(n) {
        index += n;
        html = html.substring(n);
    }
    function parseStartTag() {
        var start = html.match(startTagOpen);
        if (start) {
            var match = {
                tagName: start[1],
                start: index
            };
            advance(start[0].length);
            var endSelf = html.match(startTagSelfClose);
            if (endSelf) {
                html = html.replace(startTagSelfClose, function (_) {
                    return _.replace('/>', "></" + start[1] + ">");
                });
            }
            var end = html.match(startTagClose);
            if (end) {
                advance(end[0].length);
                match.end = index;
                return match;
            }
        }
        return false;
    }
    function handleStartTag(match) {
        var tagName = match.tagName;

        stackInner.push({ tag: tagName });
        handleStart(tagName);
    }
    function parseEndTag(_tag) {
        var tagName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var end = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

        var pos = void 0;
        if (start == null) {
            start = index;
        }
        if (end == null) {
            end = index;
        }
        if (tagName) {
            var needle = tagName.toLowerCase();
            for (pos = stackInner.length - 1; pos >= 0; pos--) {
                if (stackInner[pos].tag.toLowerCase() === needle) {
                    break;
                }
            }
        } else {
            pos = 0;
        }
        if (pos >= 0) {
            for (var i = stackInner.length - 1; i >= pos; i--) {
                handleEnd();
            }
            stackInner.length = pos;
        }
    }
    function handleStart(tag) {
        var element = {
            tag: tag,
            children: []
        };
        if (!root) {
            root = element;
        }
        if (currentParent) {
            currentParent.children.push(element);
        }
        currentParent = element;
        stack.push(element);
    }
    function handleEnd() {
        stack.length -= 1;
        currentParent = stack[stack.length - 1];
    }
    function handleChars(text) {
        if (!currentParent) {
            return;
        }
        // text = text.trim();
        if (text.trim()) {
            currentParent.children = decodeAttr(text);
        }
    }
}
function xml2objPromise() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    return new _promise2.default(function (resolve, reject) {
        try {
            var result = xml2obj(args);
            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
}
exports.xml2objPromise = xml2objPromise;
function parseString(str, options, cb) {
    try {
        var result = xml2obj(str, options);
        cb(null, result);
    } catch (error) {
        cb(error, null);
    }
}
exports.parseString = parseString;
exports.default = {
    xml2obj: xml2obj,
    xml2objPromise: xml2objPromise,
    parseString: parseString
};

},{"./isArray":137,"./isObject":142,"babel-runtime/core-js/object/entries":159,"babel-runtime/core-js/object/keys":161,"babel-runtime/core-js/promise":163,"babel-runtime/helpers/defineProperty":170,"babel-runtime/helpers/typeof":173}],152:[function(require,module,exports){
"use strict";

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = exports.initClient = void 0;
var urllib_1 = __importDefault(require("urllib"));
var agentkeepalive_1 = __importDefault(require("agentkeepalive"));
var getUserAgent_1 = require("./common/utils/getUserAgent");
var initOptions_1 = require("./common/client/initOptions");
var client_1 = __importDefault(require("./common/client"));
var _unSupportBrowserTip_1 = require("./common/utils/_unSupportBrowserTip");
var HttpsAgentKeepalive = agentkeepalive_1.default.HttpsAgent;
var globalHttpAgent = new agentkeepalive_1.default();
var globalHttpsAgent = new HttpsAgentKeepalive();

var Client = function () {
    function Client(options, ctx) {
        (0, _classCallCheck3.default)(this, Client);

        if (!(this instanceof Client)) {
            return new Client(options, ctx);
        }
        _unSupportBrowserTip_1._unSupportBrowserTip();
        (0, _keys2.default)(client_1.default).forEach(function (prop) {
            Client.prototype[prop] = client_1.default[prop];
        });
        this.setConfig(options, ctx);
    }

    (0, _createClass3.default)(Client, [{
        key: "use",
        value: function use() {
            var _this = this;

            for (var _len = arguments.length, fn = Array(_len), _key = 0; _key < _len; _key++) {
                fn[_key] = arguments[_key];
            }

            if (Array.isArray(fn)) {
                fn.filter(function (_) {
                    return typeof _ === 'function';
                }).forEach(function (f) {
                    _this[f.name] = f.bind(_this);
                    Client.prototype[f.name] = f;
                });
            }
            return this;
        }
    }, {
        key: "setConfig",
        value: function setConfig(options, ctx) {
            if (options && options.inited) {
                this.options = options;
            } else {
                this.options = initOptions_1.initOptions(options);
            }
            // support custom agent and urllib client
            if (this.options.urllib) {
                this.urllib = this.options.urllib;
            } else {
                this.urllib = urllib_1.default;
                this.agent = this.options.agent || globalHttpAgent;
                this.httpsAgent = this.options.httpsAgent || globalHttpsAgent;
            }
            this.ctx = ctx;
            this.userAgent = getUserAgent_1.getUserAgent();
        }
    }]);
    return Client;
}();

exports.Client = Client;
exports.initClient = function (options, ctx) {
    return new Client(options, ctx);
};

},{"./common/client":61,"./common/client/initOptions":62,"./common/utils/_unSupportBrowserTip":111,"./common/utils/getUserAgent":135,"agentkeepalive":153,"babel-runtime/core-js/object/keys":161,"babel-runtime/helpers/classCallCheck":168,"babel-runtime/helpers/createClass":169,"urllib":354}],153:[function(require,module,exports){
module.exports = noop;
module.exports.HttpsAgent = noop;

// Noop function for browser since native api's don't use agents.
function noop () {}

},{}],154:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/array/from"), __esModule: true };
},{"core-js/library/fn/array/from":188}],155:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/json/stringify"), __esModule: true };
},{"core-js/library/fn/json/stringify":189}],156:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/assign"), __esModule: true };
},{"core-js/library/fn/object/assign":190}],157:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":191}],158:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":192}],159:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/entries"), __esModule: true };
},{"core-js/library/fn/object/entries":193}],160:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/get-prototype-of":194}],161:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/keys"), __esModule: true };
},{"core-js/library/fn/object/keys":195}],162:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":196}],163:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };
},{"core-js/library/fn/promise":197}],164:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/set-immediate"), __esModule: true };
},{"core-js/library/fn/set-immediate":198}],165:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":200}],166:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/has-instance"), __esModule: true };
},{"core-js/library/fn/symbol/has-instance":199}],167:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":201}],168:[function(require,module,exports){
"use strict";

exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
},{}],169:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("../core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
},{"../core-js/object/define-property":158}],170:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("../core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (obj, key, value) {
  if (key in obj) {
    (0, _defineProperty2.default)(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};
},{"../core-js/object/define-property":158}],171:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _setPrototypeOf = require("../core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("../core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
  }

  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
};
},{"../core-js/object/create":157,"../core-js/object/set-prototype-of":162,"../helpers/typeof":173}],172:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
};
},{"../helpers/typeof":173}],173:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _iterator = require("../core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require("../core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};
},{"../core-js/symbol":165,"../core-js/symbol/iterator":167}],174:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g = (function() { return this })() || Function("return this")();

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime &&
  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

module.exports = require("./runtime");

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  try {
    delete g.regeneratorRuntime;
  } catch(e) {
    g.regeneratorRuntime = undefined;
  }
}

},{"./runtime":175}],175:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

!(function(global) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

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
  runtime.wrap = wrap;

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
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
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
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
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
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
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
        if (delegate.iterator.return) {
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

  Gp[toStringTagSymbol] = "Generator";

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

  runtime.keys = function(object) {
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
  runtime.values = values;

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
})(
  // In sloppy mode, unbound `this` refers to the global object, fallback to
  // Function constructor if we're in global strict mode. That is sadly a form
  // of indirect eval which violates Content Security Policy.
  (function() { return this })() || Function("return this")()
);

},{}],176:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":174}],177:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],178:[function(require,module,exports){
/*!
 * Bowser - a browser detector
 * https://github.com/ded/bowser
 * MIT License | (c) Dustin Diaz 2015
 */

!function (root, name, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(name, definition)
  else root[name] = definition()
}(this, 'bowser', function () {
  /**
    * See useragents.js for examples of navigator.userAgent
    */

  var t = true

  function detect(ua) {

    function getFirstMatch(regex) {
      var match = ua.match(regex);
      return (match && match.length > 1 && match[1]) || '';
    }

    function getSecondMatch(regex) {
      var match = ua.match(regex);
      return (match && match.length > 1 && match[2]) || '';
    }

    var iosdevice = getFirstMatch(/(ipod|iphone|ipad)/i).toLowerCase()
      , likeAndroid = /like android/i.test(ua)
      , android = !likeAndroid && /android/i.test(ua)
      , nexusMobile = /nexus\s*[0-6]\s*/i.test(ua)
      , nexusTablet = !nexusMobile && /nexus\s*[0-9]+/i.test(ua)
      , chromeos = /CrOS/.test(ua)
      , silk = /silk/i.test(ua)
      , sailfish = /sailfish/i.test(ua)
      , tizen = /tizen/i.test(ua)
      , webos = /(web|hpw)(o|0)s/i.test(ua)
      , windowsphone = /windows phone/i.test(ua)
      , samsungBrowser = /SamsungBrowser/i.test(ua)
      , windows = !windowsphone && /windows/i.test(ua)
      , mac = !iosdevice && !silk && /macintosh/i.test(ua)
      , linux = !android && !sailfish && !tizen && !webos && /linux/i.test(ua)
      , edgeVersion = getSecondMatch(/edg([ea]|ios)\/(\d+(\.\d+)?)/i)
      , versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i)
      , tablet = /tablet/i.test(ua) && !/tablet pc/i.test(ua)
      , mobile = !tablet && /[^-]mobi/i.test(ua)
      , xbox = /xbox/i.test(ua)
      , result

    if (/opera/i.test(ua)) {
      //  an old Opera
      result = {
        name: 'Opera'
      , opera: t
      , version: versionIdentifier || getFirstMatch(/(?:opera|opr|opios)[\s\/](\d+(\.\d+)?)/i)
      }
    } else if (/opr\/|opios/i.test(ua)) {
      // a new Opera
      result = {
        name: 'Opera'
        , opera: t
        , version: getFirstMatch(/(?:opr|opios)[\s\/](\d+(\.\d+)?)/i) || versionIdentifier
      }
    }
    else if (/SamsungBrowser/i.test(ua)) {
      result = {
        name: 'Samsung Internet for Android'
        , samsungBrowser: t
        , version: versionIdentifier || getFirstMatch(/(?:SamsungBrowser)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/Whale/i.test(ua)) {
      result = {
        name: 'NAVER Whale browser'
        , whale: t
        , version: getFirstMatch(/(?:whale)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/MZBrowser/i.test(ua)) {
      result = {
        name: 'MZ Browser'
        , mzbrowser: t
        , version: getFirstMatch(/(?:MZBrowser)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/coast/i.test(ua)) {
      result = {
        name: 'Opera Coast'
        , coast: t
        , version: versionIdentifier || getFirstMatch(/(?:coast)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/focus/i.test(ua)) {
      result = {
        name: 'Focus'
        , focus: t
        , version: getFirstMatch(/(?:focus)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/yabrowser/i.test(ua)) {
      result = {
        name: 'Yandex Browser'
      , yandexbrowser: t
      , version: versionIdentifier || getFirstMatch(/(?:yabrowser)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/ucbrowser/i.test(ua)) {
      result = {
          name: 'UC Browser'
        , ucbrowser: t
        , version: getFirstMatch(/(?:ucbrowser)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/mxios/i.test(ua)) {
      result = {
        name: 'Maxthon'
        , maxthon: t
        , version: getFirstMatch(/(?:mxios)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/epiphany/i.test(ua)) {
      result = {
        name: 'Epiphany'
        , epiphany: t
        , version: getFirstMatch(/(?:epiphany)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/puffin/i.test(ua)) {
      result = {
        name: 'Puffin'
        , puffin: t
        , version: getFirstMatch(/(?:puffin)[\s\/](\d+(?:\.\d+)?)/i)
      }
    }
    else if (/sleipnir/i.test(ua)) {
      result = {
        name: 'Sleipnir'
        , sleipnir: t
        , version: getFirstMatch(/(?:sleipnir)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/k-meleon/i.test(ua)) {
      result = {
        name: 'K-Meleon'
        , kMeleon: t
        , version: getFirstMatch(/(?:k-meleon)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (windowsphone) {
      result = {
        name: 'Windows Phone'
      , osname: 'Windows Phone'
      , windowsphone: t
      }
      if (edgeVersion) {
        result.msedge = t
        result.version = edgeVersion
      }
      else {
        result.msie = t
        result.version = getFirstMatch(/iemobile\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/msie|trident/i.test(ua)) {
      result = {
        name: 'Internet Explorer'
      , msie: t
      , version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
      }
    } else if (chromeos) {
      result = {
        name: 'Chrome'
      , osname: 'Chrome OS'
      , chromeos: t
      , chromeBook: t
      , chrome: t
      , version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
      }
    } else if (/edg([ea]|ios)/i.test(ua)) {
      result = {
        name: 'Microsoft Edge'
      , msedge: t
      , version: edgeVersion
      }
    }
    else if (/vivaldi/i.test(ua)) {
      result = {
        name: 'Vivaldi'
        , vivaldi: t
        , version: getFirstMatch(/vivaldi\/(\d+(\.\d+)?)/i) || versionIdentifier
      }
    }
    else if (sailfish) {
      result = {
        name: 'Sailfish'
      , osname: 'Sailfish OS'
      , sailfish: t
      , version: getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/seamonkey\//i.test(ua)) {
      result = {
        name: 'SeaMonkey'
      , seamonkey: t
      , version: getFirstMatch(/seamonkey\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/firefox|iceweasel|fxios/i.test(ua)) {
      result = {
        name: 'Firefox'
      , firefox: t
      , version: getFirstMatch(/(?:firefox|iceweasel|fxios)[ \/](\d+(\.\d+)?)/i)
      }
      if (/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(ua)) {
        result.firefoxos = t
        result.osname = 'Firefox OS'
      }
    }
    else if (silk) {
      result =  {
        name: 'Amazon Silk'
      , silk: t
      , version : getFirstMatch(/silk\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/phantom/i.test(ua)) {
      result = {
        name: 'PhantomJS'
      , phantom: t
      , version: getFirstMatch(/phantomjs\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/slimerjs/i.test(ua)) {
      result = {
        name: 'SlimerJS'
        , slimer: t
        , version: getFirstMatch(/slimerjs\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/blackberry|\bbb\d+/i.test(ua) || /rim\stablet/i.test(ua)) {
      result = {
        name: 'BlackBerry'
      , osname: 'BlackBerry OS'
      , blackberry: t
      , version: versionIdentifier || getFirstMatch(/blackberry[\d]+\/(\d+(\.\d+)?)/i)
      }
    }
    else if (webos) {
      result = {
        name: 'WebOS'
      , osname: 'WebOS'
      , webos: t
      , version: versionIdentifier || getFirstMatch(/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i)
      };
      /touchpad\//i.test(ua) && (result.touchpad = t)
    }
    else if (/bada/i.test(ua)) {
      result = {
        name: 'Bada'
      , osname: 'Bada'
      , bada: t
      , version: getFirstMatch(/dolfin\/(\d+(\.\d+)?)/i)
      };
    }
    else if (tizen) {
      result = {
        name: 'Tizen'
      , osname: 'Tizen'
      , tizen: t
      , version: getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i) || versionIdentifier
      };
    }
    else if (/qupzilla/i.test(ua)) {
      result = {
        name: 'QupZilla'
        , qupzilla: t
        , version: getFirstMatch(/(?:qupzilla)[\s\/](\d+(?:\.\d+)+)/i) || versionIdentifier
      }
    }
    else if (/chromium/i.test(ua)) {
      result = {
        name: 'Chromium'
        , chromium: t
        , version: getFirstMatch(/(?:chromium)[\s\/](\d+(?:\.\d+)?)/i) || versionIdentifier
      }
    }
    else if (/chrome|crios|crmo/i.test(ua)) {
      result = {
        name: 'Chrome'
        , chrome: t
        , version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
      }
    }
    else if (android) {
      result = {
        name: 'Android'
        , version: versionIdentifier
      }
    }
    else if (/safari|applewebkit/i.test(ua)) {
      result = {
        name: 'Safari'
      , safari: t
      }
      if (versionIdentifier) {
        result.version = versionIdentifier
      }
    }
    else if (iosdevice) {
      result = {
        name : iosdevice == 'iphone' ? 'iPhone' : iosdevice == 'ipad' ? 'iPad' : 'iPod'
      }
      // WTF: version is not part of user agent in web apps
      if (versionIdentifier) {
        result.version = versionIdentifier
      }
    }
    else if(/googlebot/i.test(ua)) {
      result = {
        name: 'Googlebot'
      , googlebot: t
      , version: getFirstMatch(/googlebot\/(\d+(\.\d+))/i) || versionIdentifier
      }
    }
    else {
      result = {
        name: getFirstMatch(/^(.*)\/(.*) /),
        version: getSecondMatch(/^(.*)\/(.*) /)
     };
   }

    // set webkit or gecko flag for browsers based on these engines
    if (!result.msedge && /(apple)?webkit/i.test(ua)) {
      if (/(apple)?webkit\/537\.36/i.test(ua)) {
        result.name = result.name || "Blink"
        result.blink = t
      } else {
        result.name = result.name || "Webkit"
        result.webkit = t
      }
      if (!result.version && versionIdentifier) {
        result.version = versionIdentifier
      }
    } else if (!result.opera && /gecko\//i.test(ua)) {
      result.name = result.name || "Gecko"
      result.gecko = t
      result.version = result.version || getFirstMatch(/gecko\/(\d+(\.\d+)?)/i)
    }

    // set OS flags for platforms that have multiple browsers
    if (!result.windowsphone && (android || result.silk)) {
      result.android = t
      result.osname = 'Android'
    } else if (!result.windowsphone && iosdevice) {
      result[iosdevice] = t
      result.ios = t
      result.osname = 'iOS'
    } else if (mac) {
      result.mac = t
      result.osname = 'macOS'
    } else if (xbox) {
      result.xbox = t
      result.osname = 'Xbox'
    } else if (windows) {
      result.windows = t
      result.osname = 'Windows'
    } else if (linux) {
      result.linux = t
      result.osname = 'Linux'
    }

    function getWindowsVersion (s) {
      switch (s) {
        case 'NT': return 'NT'
        case 'XP': return 'XP'
        case 'NT 5.0': return '2000'
        case 'NT 5.1': return 'XP'
        case 'NT 5.2': return '2003'
        case 'NT 6.0': return 'Vista'
        case 'NT 6.1': return '7'
        case 'NT 6.2': return '8'
        case 'NT 6.3': return '8.1'
        case 'NT 10.0': return '10'
        default: return undefined
      }
    }

    // OS version extraction
    var osVersion = '';
    if (result.windows) {
      osVersion = getWindowsVersion(getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i))
    } else if (result.windowsphone) {
      osVersion = getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i);
    } else if (result.mac) {
      osVersion = getFirstMatch(/Mac OS X (\d+([_\.\s]\d+)*)/i);
      osVersion = osVersion.replace(/[_\s]/g, '.');
    } else if (iosdevice) {
      osVersion = getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i);
      osVersion = osVersion.replace(/[_\s]/g, '.');
    } else if (android) {
      osVersion = getFirstMatch(/android[ \/-](\d+(\.\d+)*)/i);
    } else if (result.webos) {
      osVersion = getFirstMatch(/(?:web|hpw)os\/(\d+(\.\d+)*)/i);
    } else if (result.blackberry) {
      osVersion = getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i);
    } else if (result.bada) {
      osVersion = getFirstMatch(/bada\/(\d+(\.\d+)*)/i);
    } else if (result.tizen) {
      osVersion = getFirstMatch(/tizen[\/\s](\d+(\.\d+)*)/i);
    }
    if (osVersion) {
      result.osversion = osVersion;
    }

    // device type extraction
    var osMajorVersion = !result.windows && osVersion.split('.')[0];
    if (
         tablet
      || nexusTablet
      || iosdevice == 'ipad'
      || (android && (osMajorVersion == 3 || (osMajorVersion >= 4 && !mobile)))
      || result.silk
    ) {
      result.tablet = t
    } else if (
         mobile
      || iosdevice == 'iphone'
      || iosdevice == 'ipod'
      || android
      || nexusMobile
      || result.blackberry
      || result.webos
      || result.bada
    ) {
      result.mobile = t
    }

    // Graded Browser Support
    // http://developer.yahoo.com/yui/articles/gbs
    if (result.msedge ||
        (result.msie && result.version >= 10) ||
        (result.yandexbrowser && result.version >= 15) ||
		    (result.vivaldi && result.version >= 1.0) ||
        (result.chrome && result.version >= 20) ||
        (result.samsungBrowser && result.version >= 4) ||
        (result.whale && compareVersions([result.version, '1.0']) === 1) ||
        (result.mzbrowser && compareVersions([result.version, '6.0']) === 1) ||
        (result.focus && compareVersions([result.version, '1.0']) === 1) ||
        (result.firefox && result.version >= 20.0) ||
        (result.safari && result.version >= 6) ||
        (result.opera && result.version >= 10.0) ||
        (result.ios && result.osversion && result.osversion.split(".")[0] >= 6) ||
        (result.blackberry && result.version >= 10.1)
        || (result.chromium && result.version >= 20)
        ) {
      result.a = t;
    }
    else if ((result.msie && result.version < 10) ||
        (result.chrome && result.version < 20) ||
        (result.firefox && result.version < 20.0) ||
        (result.safari && result.version < 6) ||
        (result.opera && result.version < 10.0) ||
        (result.ios && result.osversion && result.osversion.split(".")[0] < 6)
        || (result.chromium && result.version < 20)
        ) {
      result.c = t
    } else result.x = t

    return result
  }

  var bowser = detect(typeof navigator !== 'undefined' ? navigator.userAgent || '' : '')

  bowser.test = function (browserList) {
    for (var i = 0; i < browserList.length; ++i) {
      var browserItem = browserList[i];
      if (typeof browserItem=== 'string') {
        if (browserItem in bowser) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get version precisions count
   *
   * @example
   *   getVersionPrecision("1.10.3") // 3
   *
   * @param  {string} version
   * @return {number}
   */
  function getVersionPrecision(version) {
    return version.split(".").length;
  }

  /**
   * Array::map polyfill
   *
   * @param  {Array} arr
   * @param  {Function} iterator
   * @return {Array}
   */
  function map(arr, iterator) {
    var result = [], i;
    if (Array.prototype.map) {
      return Array.prototype.map.call(arr, iterator);
    }
    for (i = 0; i < arr.length; i++) {
      result.push(iterator(arr[i]));
    }
    return result;
  }

  /**
   * Calculate browser version weight
   *
   * @example
   *   compareVersions(['1.10.2.1',  '1.8.2.1.90'])    // 1
   *   compareVersions(['1.010.2.1', '1.09.2.1.90']);  // 1
   *   compareVersions(['1.10.2.1',  '1.10.2.1']);     // 0
   *   compareVersions(['1.10.2.1',  '1.0800.2']);     // -1
   *
   * @param  {Array<String>} versions versions to compare
   * @return {Number} comparison result
   */
  function compareVersions(versions) {
    // 1) get common precision for both versions, for example for "10.0" and "9" it should be 2
    var precision = Math.max(getVersionPrecision(versions[0]), getVersionPrecision(versions[1]));
    var chunks = map(versions, function (version) {
      var delta = precision - getVersionPrecision(version);

      // 2) "9" -> "9.0" (for precision = 2)
      version = version + new Array(delta + 1).join(".0");

      // 3) "9.0" -> ["000000000"", "000000009"]
      return map(version.split("."), function (chunk) {
        return new Array(20 - chunk.length).join("0") + chunk;
      }).reverse();
    });

    // iterate in reverse order by reversed chunks array
    while (--precision >= 0) {
      // 4) compare: "000000009" > "000000010" = false (but "9" > "10" = true)
      if (chunks[0][precision] > chunks[1][precision]) {
        return 1;
      }
      else if (chunks[0][precision] === chunks[1][precision]) {
        if (precision === 0) {
          // all version chunks are same
          return 0;
        }
      }
      else {
        return -1;
      }
    }
  }

  /**
   * Check if browser is unsupported
   *
   * @example
   *   bowser.isUnsupportedBrowser({
   *     msie: "10",
   *     firefox: "23",
   *     chrome: "29",
   *     safari: "5.1",
   *     opera: "16",
   *     phantom: "534"
   *   });
   *
   * @param  {Object}  minVersions map of minimal version to browser
   * @param  {Boolean} [strictMode = false] flag to return false if browser wasn't found in map
   * @param  {String}  [ua] user agent string
   * @return {Boolean}
   */
  function isUnsupportedBrowser(minVersions, strictMode, ua) {
    var _bowser = bowser;

    // make strictMode param optional with ua param usage
    if (typeof strictMode === 'string') {
      ua = strictMode;
      strictMode = void(0);
    }

    if (strictMode === void(0)) {
      strictMode = false;
    }
    if (ua) {
      _bowser = detect(ua);
    }

    var version = "" + _bowser.version;
    for (var browser in minVersions) {
      if (minVersions.hasOwnProperty(browser)) {
        if (_bowser[browser]) {
          if (typeof minVersions[browser] !== 'string') {
            throw new Error('Browser version in the minVersion map should be a string: ' + browser + ': ' + String(minVersions));
          }

          // browser version and min supported version.
          return compareVersions([version, minVersions[browser]]) < 0;
        }
      }
    }

    return strictMode; // not found
  }

  /**
   * Check if browser is supported
   *
   * @param  {Object} minVersions map of minimal version to browser
   * @param  {Boolean} [strictMode = false] flag to return false if browser wasn't found in map
   * @param  {String}  [ua] user agent string
   * @return {Boolean}
   */
  function check(minVersions, strictMode, ua) {
    return !isUnsupportedBrowser(minVersions, strictMode, ua);
  }

  bowser.isUnsupportedBrowser = isUnsupportedBrowser;
  bowser.compareVersions = compareVersions;
  bowser.check = check;

  /*
   * Set our detect method to the main bowser object so we can
   * reuse it to test other user agents.
   * This is needed to implement future tests.
   */
  bowser._detect = detect;

  /*
   * Set our detect public method to the main bowser object
   * This is needed to implement bowser in server side
   */
  bowser.detect = detect;
  return bowser
});

},{}],179:[function(require,module,exports){

},{}],180:[function(require,module,exports){
(function (global){
var ClientRequest = require('./lib/request')
var response = require('./lib/response')
var extend = require('xtend')
var statusCodes = require('builtin-status-codes')
var url = require('url')

var http = exports

http.request = function (opts, cb) {
	if (typeof opts === 'string')
		opts = url.parse(opts)
	else
		opts = extend(opts)

	// Normally, the page is loaded from http or https, so not specifying a protocol
	// will result in a (valid) protocol-relative url. However, this won't work if
	// the protocol is something else, like 'file:'
	var defaultProtocol = global.location.protocol.search(/^https?:$/) === -1 ? 'http:' : ''

	var protocol = opts.protocol || defaultProtocol
	var host = opts.hostname || opts.host
	var port = opts.port
	var path = opts.path || '/'

	// Necessary for IPv6 addresses
	if (host && host.indexOf(':') !== -1)
		host = '[' + host + ']'

	// This may be a relative url. The browser should always be able to interpret it correctly.
	opts.url = (host ? (protocol + '//' + host) : '') + (port ? ':' + port : '') + path
	opts.method = (opts.method || 'GET').toUpperCase()
	opts.headers = opts.headers || {}

	// Also valid opts.auth, opts.mode

	var req = new ClientRequest(opts)
	if (cb)
		req.on('response', cb)
	return req
}

http.get = function get (opts, cb) {
	var req = http.request(opts, cb)
	req.end()
	return req
}

http.ClientRequest = ClientRequest
http.IncomingMessage = response.IncomingMessage

http.Agent = function () {}
http.Agent.defaultMaxSockets = 4

http.globalAgent = new http.Agent()

http.STATUS_CODES = statusCodes

http.METHODS = [
	'CHECKOUT',
	'CONNECT',
	'COPY',
	'DELETE',
	'GET',
	'HEAD',
	'LOCK',
	'M-SEARCH',
	'MERGE',
	'MKACTIVITY',
	'MKCOL',
	'MOVE',
	'NOTIFY',
	'OPTIONS',
	'PATCH',
	'POST',
	'PROPFIND',
	'PROPPATCH',
	'PURGE',
	'PUT',
	'REPORT',
	'SEARCH',
	'SUBSCRIBE',
	'TRACE',
	'UNLOCK',
	'UNSUBSCRIBE'
]
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lib/request":182,"./lib/response":183,"builtin-status-codes":185,"url":340,"xtend":346}],181:[function(require,module,exports){
(function (global){
'use strict';

exports.fetch = isFunction(global.fetch) && isFunction(global.ReadableStream);

exports.writableStream = isFunction(global.WritableStream);

exports.abortController = isFunction(global.AbortController);

exports.blobConstructor = false;
try {
	new Blob([new ArrayBuffer(1)]);
	exports.blobConstructor = true;
} catch (e) {}

// The xhr request to example.com may violate some restrictive CSP configurations,
// so if we're running in a browser that supports `fetch`, avoid calling getXHR()
// and assume support for certain features below.
var xhr;
function getXHR() {
	// Cache the xhr value
	if (xhr !== undefined) return xhr;

	if (global.XMLHttpRequest) {
		xhr = new global.XMLHttpRequest();
		// If XDomainRequest is available (ie only, where xhr might not work
		// cross domain), use the page location. Otherwise use example.com
		// Note: this doesn't actually make an http request.
		try {
			xhr.open('GET', global.XDomainRequest ? '/' : 'https://example.com');
		} catch (e) {
			xhr = null;
		}
	} else {
		// Service workers don't have XHR
		xhr = null;
	}
	return xhr;
}

function checkTypeSupport(type) {
	var xhr = getXHR();
	if (!xhr) return false;
	try {
		xhr.responseType = type;
		return xhr.responseType === type;
	} catch (e) {}
	return false;
}

// For some strange reason, Safari 7.0 reports typeof global.ArrayBuffer === 'object'.
// Safari 7.1 appears to have fixed this bug.
var haveArrayBuffer = typeof global.ArrayBuffer !== 'undefined';
var haveSlice = haveArrayBuffer && isFunction(global.ArrayBuffer.prototype.slice);

// If fetch is supported, then arraybuffer will be supported too. Skip calling
// checkTypeSupport(), since that calls getXHR().
exports.arraybuffer = exports.fetch || haveArrayBuffer && checkTypeSupport('arraybuffer');

// These next two tests unavoidably show warnings in Chrome. Since fetch will always
// be used if it's available, just return false for these to avoid the warnings.
exports.msstream = !exports.fetch && haveSlice && checkTypeSupport('ms-stream');
exports.mozchunkedarraybuffer = !exports.fetch && haveArrayBuffer && checkTypeSupport('moz-chunked-arraybuffer');

// If fetch is supported, then overrideMimeType will be supported too. Skip calling
// getXHR().
exports.overrideMimeType = exports.fetch || (getXHR() ? isFunction(getXHR().overrideMimeType) : false);

exports.vbArray = isFunction(global.VBArray);

function isFunction(value) {
	return typeof value === 'function';
}

xhr = null; // Help gc

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],182:[function(require,module,exports){
(function (process,global,Buffer){
'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var capability = require('./capability');
var inherits = require('inherits');
var response = require('./response');
var stream = require('readable-stream');
var toArrayBuffer = require('to-arraybuffer');

var IncomingMessage = response.IncomingMessage;
var rStates = response.readyStates;

function decideMode(preferBinary, useFetch) {
	if (capability.fetch && useFetch) {
		return 'fetch';
	} else if (capability.mozchunkedarraybuffer) {
		return 'moz-chunked-arraybuffer';
	} else if (capability.msstream) {
		return 'ms-stream';
	} else if (capability.arraybuffer && preferBinary) {
		return 'arraybuffer';
	} else if (capability.vbArray && preferBinary) {
		return 'text:vbarray';
	} else {
		return 'text';
	}
}

var ClientRequest = module.exports = function (opts) {
	var self = this;
	stream.Writable.call(self);

	self._opts = opts;
	self._body = [];
	self._headers = {};
	if (opts.auth) self.setHeader('Authorization', 'Basic ' + new Buffer(opts.auth).toString('base64'));
	(0, _keys2.default)(opts.headers).forEach(function (name) {
		self.setHeader(name, opts.headers[name]);
	});

	var preferBinary;
	var useFetch = true;
	if (opts.mode === 'disable-fetch' || 'requestTimeout' in opts && !capability.abortController) {
		// If the use of XHR should be preferred. Not typically needed.
		useFetch = false;
		preferBinary = true;
	} else if (opts.mode === 'prefer-streaming') {
		// If streaming is a high priority but binary compatibility and
		// the accuracy of the 'content-type' header aren't
		preferBinary = false;
	} else if (opts.mode === 'allow-wrong-content-type') {
		// If streaming is more important than preserving the 'content-type' header
		preferBinary = !capability.overrideMimeType;
	} else if (!opts.mode || opts.mode === 'default' || opts.mode === 'prefer-fast') {
		// Use binary if text streaming may corrupt data or the content-type header, or for speed
		preferBinary = true;
	} else {
		throw new Error('Invalid value for opts.mode');
	}
	self._mode = decideMode(preferBinary, useFetch);
	self._fetchTimer = null;

	self.on('finish', function () {
		self._onFinish();
	});
};

inherits(ClientRequest, stream.Writable);

ClientRequest.prototype.setHeader = function (name, value) {
	var self = this;
	var lowerName = name.toLowerCase();
	// This check is not necessary, but it prevents warnings from browsers about setting unsafe
	// headers. To be honest I'm not entirely sure hiding these warnings is a good thing, but
	// http-browserify did it, so I will too.
	if (unsafeHeaders.indexOf(lowerName) !== -1) return;

	self._headers[lowerName] = {
		name: name,
		value: value
	};
};

ClientRequest.prototype.getHeader = function (name) {
	var header = this._headers[name.toLowerCase()];
	if (header) return header.value;
	return null;
};

ClientRequest.prototype.removeHeader = function (name) {
	var self = this;
	delete self._headers[name.toLowerCase()];
};

ClientRequest.prototype._onFinish = function () {
	var self = this;

	if (self._destroyed) return;
	var opts = self._opts;

	var headersObj = self._headers;
	var body = null;
	if (opts.method !== 'GET' && opts.method !== 'HEAD') {
		if (capability.arraybuffer) {
			body = toArrayBuffer(Buffer.concat(self._body));
		} else if (capability.blobConstructor) {
			body = new global.Blob(self._body.map(function (buffer) {
				return toArrayBuffer(buffer);
			}), {
				type: (headersObj['content-type'] || {}).value || ''
			});
		} else {
			// get utf8 string
			body = Buffer.concat(self._body).toString();
		}
	}

	// create flattened list of headers
	var headersList = [];
	(0, _keys2.default)(headersObj).forEach(function (keyName) {
		var name = headersObj[keyName].name;
		var value = headersObj[keyName].value;
		if (Array.isArray(value)) {
			value.forEach(function (v) {
				headersList.push([name, v]);
			});
		} else {
			headersList.push([name, value]);
		}
	});

	if (self._mode === 'fetch') {
		var signal = null;
		var fetchTimer = null;
		if (capability.abortController) {
			var controller = new AbortController();
			signal = controller.signal;
			self._fetchAbortController = controller;

			if ('requestTimeout' in opts && opts.requestTimeout !== 0) {
				self._fetchTimer = global.setTimeout(function () {
					self.emit('requestTimeout');
					if (self._fetchAbortController) self._fetchAbortController.abort();
				}, opts.requestTimeout);
			}
		}

		global.fetch(self._opts.url, {
			method: self._opts.method,
			headers: headersList,
			body: body || undefined,
			mode: 'cors',
			credentials: opts.withCredentials ? 'include' : 'same-origin',
			signal: signal
		}).then(function (response) {
			self._fetchResponse = response;
			self._connect();
		}, function (reason) {
			global.clearTimeout(self._fetchTimer);
			if (!self._destroyed) self.emit('error', reason);
		});
	} else {
		var xhr = self._xhr = new global.XMLHttpRequest();
		try {
			xhr.open(self._opts.method, self._opts.url, true);
		} catch (err) {
			process.nextTick(function () {
				self.emit('error', err);
			});
			return;
		}

		// Can't set responseType on really old browsers
		if ('responseType' in xhr) xhr.responseType = self._mode.split(':')[0];

		if ('withCredentials' in xhr) xhr.withCredentials = !!opts.withCredentials;

		if (self._mode === 'text' && 'overrideMimeType' in xhr) xhr.overrideMimeType('text/plain; charset=x-user-defined');

		if ('requestTimeout' in opts) {
			xhr.timeout = opts.requestTimeout;
			xhr.ontimeout = function () {
				self.emit('requestTimeout');
			};
		}

		headersList.forEach(function (header) {
			xhr.setRequestHeader(header[0], header[1]);
		});

		self._response = null;
		xhr.onreadystatechange = function () {
			switch (xhr.readyState) {
				case rStates.LOADING:
				case rStates.DONE:
					self._onXHRProgress();
					break;
			}
		};
		// Necessary for streaming in Firefox, since xhr.response is ONLY defined
		// in onprogress, not in onreadystatechange with xhr.readyState = 3
		if (self._mode === 'moz-chunked-arraybuffer') {
			xhr.onprogress = function () {
				self._onXHRProgress();
			};
		}

		xhr.onerror = function () {
			if (self._destroyed) return;
			self.emit('error', new Error('XHR error'));
		};

		try {
			xhr.send(body);
		} catch (err) {
			process.nextTick(function () {
				self.emit('error', err);
			});
			return;
		}
	}
};

/**
 * Checks if xhr.status is readable and non-zero, indicating no error.
 * Even though the spec says it should be available in readyState 3,
 * accessing it throws an exception in IE8
 */
function statusValid(xhr) {
	try {
		var status = xhr.status;
		return status !== null && status !== 0;
	} catch (e) {
		return false;
	}
}

ClientRequest.prototype._onXHRProgress = function () {
	var self = this;

	if (!statusValid(self._xhr) || self._destroyed) return;

	if (!self._response) self._connect();

	self._response._onXHRProgress();
};

ClientRequest.prototype._connect = function () {
	var self = this;

	if (self._destroyed) return;

	self._response = new IncomingMessage(self._xhr, self._fetchResponse, self._mode, self._fetchTimer);
	self._response.on('error', function (err) {
		self.emit('error', err);
	});

	self.emit('response', self._response);
};

ClientRequest.prototype._write = function (chunk, encoding, cb) {
	var self = this;

	self._body.push(chunk);
	cb();
};

ClientRequest.prototype.abort = ClientRequest.prototype.destroy = function () {
	var self = this;
	self._destroyed = true;
	global.clearTimeout(self._fetchTimer);
	if (self._response) self._response._destroyed = true;
	if (self._xhr) self._xhr.abort();else if (self._fetchAbortController) self._fetchAbortController.abort();
};

ClientRequest.prototype.end = function (data, encoding, cb) {
	var self = this;
	if (typeof data === 'function') {
		cb = data;
		data = undefined;
	}

	stream.Writable.prototype.end.call(self, data, encoding, cb);
};

ClientRequest.prototype.flushHeaders = function () {};
ClientRequest.prototype.setTimeout = function () {};
ClientRequest.prototype.setNoDelay = function () {};
ClientRequest.prototype.setSocketKeepAlive = function () {};

// Taken from http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader%28%29-method
var unsafeHeaders = ['accept-charset', 'accept-encoding', 'access-control-request-headers', 'access-control-request-method', 'connection', 'content-length', 'cookie', 'cookie2', 'date', 'dnt', 'expect', 'host', 'keep-alive', 'origin', 'referer', 'te', 'trailer', 'transfer-encoding', 'upgrade', 'via'];

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"./capability":181,"./response":183,"_process":318,"babel-runtime/core-js/object/keys":161,"buffer":184,"inherits":306,"readable-stream":335,"to-arraybuffer":339}],183:[function(require,module,exports){
(function (process,global,Buffer){
'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var capability = require('./capability');
var inherits = require('inherits');
var stream = require('readable-stream');

var rStates = exports.readyStates = {
	UNSENT: 0,
	OPENED: 1,
	HEADERS_RECEIVED: 2,
	LOADING: 3,
	DONE: 4
};

var IncomingMessage = exports.IncomingMessage = function (xhr, response, mode, fetchTimer) {
	var self = this;
	stream.Readable.call(self);

	self._mode = mode;
	self.headers = {};
	self.rawHeaders = [];
	self.trailers = {};
	self.rawTrailers = [];

	// Fake the 'close' event, but only once 'end' fires
	self.on('end', function () {
		// The nextTick is necessary to prevent the 'request' module from causing an infinite loop
		process.nextTick(function () {
			self.emit('close');
		});
	});

	if (mode === 'fetch') {
		var read = function read() {
			reader.read().then(function (result) {
				if (self._destroyed) return;
				if (result.done) {
					global.clearTimeout(fetchTimer);
					self.push(null);
					return;
				}
				self.push(new Buffer(result.value));
				read();
			}).catch(function (err) {
				global.clearTimeout(fetchTimer);
				if (!self._destroyed) self.emit('error', err);
			});
		};

		self._fetchResponse = response;

		self.url = response.url;
		self.statusCode = response.status;
		self.statusMessage = response.statusText;

		response.headers.forEach(function (header, key) {
			self.headers[key.toLowerCase()] = header;
			self.rawHeaders.push(key, header);
		});

		if (capability.writableStream) {
			var writable = new WritableStream({
				write: function write(chunk) {
					return new _promise2.default(function (resolve, reject) {
						if (self._destroyed) {
							reject();
						} else if (self.push(new Buffer(chunk))) {
							resolve();
						} else {
							self._resumeFetch = resolve;
						}
					});
				},
				close: function close() {
					global.clearTimeout(fetchTimer);
					if (!self._destroyed) self.push(null);
				},
				abort: function abort(err) {
					if (!self._destroyed) self.emit('error', err);
				}
			});

			try {
				response.body.pipeTo(writable).catch(function (err) {
					global.clearTimeout(fetchTimer);
					if (!self._destroyed) self.emit('error', err);
				});
				return;
			} catch (e) {} // pipeTo method isn't defined. Can't find a better way to feature test this
		}
		// fallback for when writableStream or pipeTo aren't available
		var reader = response.body.getReader();

		read();
	} else {
		self._xhr = xhr;
		self._pos = 0;

		self.url = xhr.responseURL;
		self.statusCode = xhr.status;
		self.statusMessage = xhr.statusText;
		var headers = xhr.getAllResponseHeaders().split(/\r?\n/);
		headers.forEach(function (header) {
			var matches = header.match(/^([^:]+):\s*(.*)/);
			if (matches) {
				var key = matches[1].toLowerCase();
				if (key === 'set-cookie') {
					if (self.headers[key] === undefined) {
						self.headers[key] = [];
					}
					self.headers[key].push(matches[2]);
				} else if (self.headers[key] !== undefined) {
					self.headers[key] += ', ' + matches[2];
				} else {
					self.headers[key] = matches[2];
				}
				self.rawHeaders.push(matches[1], matches[2]);
			}
		});

		self._charset = 'x-user-defined';
		if (!capability.overrideMimeType) {
			var mimeType = self.rawHeaders['mime-type'];
			if (mimeType) {
				var charsetMatch = mimeType.match(/;\s*charset=([^;])(;|$)/);
				if (charsetMatch) {
					self._charset = charsetMatch[1].toLowerCase();
				}
			}
			if (!self._charset) self._charset = 'utf-8'; // best guess
		}
	}
};

inherits(IncomingMessage, stream.Readable);

IncomingMessage.prototype._read = function () {
	var self = this;

	var resolve = self._resumeFetch;
	if (resolve) {
		self._resumeFetch = null;
		resolve();
	}
};

IncomingMessage.prototype._onXHRProgress = function () {
	var self = this;

	var xhr = self._xhr;

	var response = null;
	switch (self._mode) {
		case 'text:vbarray':
			// For IE9
			if (xhr.readyState !== rStates.DONE) break;
			try {
				// This fails in IE8
				response = new global.VBArray(xhr.responseBody).toArray();
			} catch (e) {}
			if (response !== null) {
				self.push(new Buffer(response));
				break;
			}
		// Falls through in IE8	
		case 'text':
			try {
				// This will fail when readyState = 3 in IE9. Switch mode and wait for readyState = 4
				response = xhr.responseText;
			} catch (e) {
				self._mode = 'text:vbarray';
				break;
			}
			if (response.length > self._pos) {
				var newData = response.substr(self._pos);
				if (self._charset === 'x-user-defined') {
					var buffer = new Buffer(newData.length);
					for (var i = 0; i < newData.length; i++) {
						buffer[i] = newData.charCodeAt(i) & 0xff;
					}self.push(buffer);
				} else {
					self.push(newData, self._charset);
				}
				self._pos = response.length;
			}
			break;
		case 'arraybuffer':
			if (xhr.readyState !== rStates.DONE || !xhr.response) break;
			response = xhr.response;
			self.push(new Buffer(new Uint8Array(response)));
			break;
		case 'moz-chunked-arraybuffer':
			// take whole
			response = xhr.response;
			if (xhr.readyState !== rStates.LOADING || !response) break;
			self.push(new Buffer(new Uint8Array(response)));
			break;
		case 'ms-stream':
			response = xhr.response;
			if (xhr.readyState !== rStates.LOADING) break;
			var reader = new global.MSStreamReader();
			reader.onprogress = function () {
				if (reader.result.byteLength > self._pos) {
					self.push(new Buffer(new Uint8Array(reader.result.slice(self._pos))));
					self._pos = reader.result.byteLength;
				}
			};
			reader.onload = function () {
				self.push(null);
			};
			// reader.onerror = ??? // TODO: this
			reader.readAsArrayBuffer(response);
			break;
	}

	// The ms-stream case handles end separately in reader.onload()
	if (self._xhr.readyState === rStates.DONE && self._mode !== 'ms-stream') {
		self.push(null);
	}
};

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"./capability":181,"_process":318,"babel-runtime/core-js/promise":163,"buffer":184,"inherits":306,"readable-stream":335}],184:[function(require,module,exports){
(function (global,Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"base64-js":177,"buffer":184,"ieee754":305,"isarray":308}],185:[function(require,module,exports){
module.exports = {
  "100": "Continue",
  "101": "Switching Protocols",
  "102": "Processing",
  "200": "OK",
  "201": "Created",
  "202": "Accepted",
  "203": "Non-Authoritative Information",
  "204": "No Content",
  "205": "Reset Content",
  "206": "Partial Content",
  "207": "Multi-Status",
  "208": "Already Reported",
  "226": "IM Used",
  "300": "Multiple Choices",
  "301": "Moved Permanently",
  "302": "Found",
  "303": "See Other",
  "304": "Not Modified",
  "305": "Use Proxy",
  "307": "Temporary Redirect",
  "308": "Permanent Redirect",
  "400": "Bad Request",
  "401": "Unauthorized",
  "402": "Payment Required",
  "403": "Forbidden",
  "404": "Not Found",
  "405": "Method Not Allowed",
  "406": "Not Acceptable",
  "407": "Proxy Authentication Required",
  "408": "Request Timeout",
  "409": "Conflict",
  "410": "Gone",
  "411": "Length Required",
  "412": "Precondition Failed",
  "413": "Payload Too Large",
  "414": "URI Too Long",
  "415": "Unsupported Media Type",
  "416": "Range Not Satisfiable",
  "417": "Expectation Failed",
  "418": "I'm a teapot",
  "421": "Misdirected Request",
  "422": "Unprocessable Entity",
  "423": "Locked",
  "424": "Failed Dependency",
  "425": "Unordered Collection",
  "426": "Upgrade Required",
  "428": "Precondition Required",
  "429": "Too Many Requests",
  "431": "Request Header Fields Too Large",
  "451": "Unavailable For Legal Reasons",
  "500": "Internal Server Error",
  "501": "Not Implemented",
  "502": "Bad Gateway",
  "503": "Service Unavailable",
  "504": "Gateway Timeout",
  "505": "HTTP Version Not Supported",
  "506": "Variant Also Negotiates",
  "507": "Insufficient Storage",
  "508": "Loop Detected",
  "509": "Bandwidth Limit Exceeded",
  "510": "Not Extended",
  "511": "Network Authentication Required"
}

},{}],186:[function(require,module,exports){
module.exports={
  "O_RDONLY": 0,
  "O_WRONLY": 1,
  "O_RDWR": 2,
  "S_IFMT": 61440,
  "S_IFREG": 32768,
  "S_IFDIR": 16384,
  "S_IFCHR": 8192,
  "S_IFBLK": 24576,
  "S_IFIFO": 4096,
  "S_IFLNK": 40960,
  "S_IFSOCK": 49152,
  "O_CREAT": 512,
  "O_EXCL": 2048,
  "O_NOCTTY": 131072,
  "O_TRUNC": 1024,
  "O_APPEND": 8,
  "O_DIRECTORY": 1048576,
  "O_NOFOLLOW": 256,
  "O_SYNC": 128,
  "O_SYMLINK": 2097152,
  "O_NONBLOCK": 4,
  "S_IRWXU": 448,
  "S_IRUSR": 256,
  "S_IWUSR": 128,
  "S_IXUSR": 64,
  "S_IRWXG": 56,
  "S_IRGRP": 32,
  "S_IWGRP": 16,
  "S_IXGRP": 8,
  "S_IRWXO": 7,
  "S_IROTH": 4,
  "S_IWOTH": 2,
  "S_IXOTH": 1,
  "E2BIG": 7,
  "EACCES": 13,
  "EADDRINUSE": 48,
  "EADDRNOTAVAIL": 49,
  "EAFNOSUPPORT": 47,
  "EAGAIN": 35,
  "EALREADY": 37,
  "EBADF": 9,
  "EBADMSG": 94,
  "EBUSY": 16,
  "ECANCELED": 89,
  "ECHILD": 10,
  "ECONNABORTED": 53,
  "ECONNREFUSED": 61,
  "ECONNRESET": 54,
  "EDEADLK": 11,
  "EDESTADDRREQ": 39,
  "EDOM": 33,
  "EDQUOT": 69,
  "EEXIST": 17,
  "EFAULT": 14,
  "EFBIG": 27,
  "EHOSTUNREACH": 65,
  "EIDRM": 90,
  "EILSEQ": 92,
  "EINPROGRESS": 36,
  "EINTR": 4,
  "EINVAL": 22,
  "EIO": 5,
  "EISCONN": 56,
  "EISDIR": 21,
  "ELOOP": 62,
  "EMFILE": 24,
  "EMLINK": 31,
  "EMSGSIZE": 40,
  "EMULTIHOP": 95,
  "ENAMETOOLONG": 63,
  "ENETDOWN": 50,
  "ENETRESET": 52,
  "ENETUNREACH": 51,
  "ENFILE": 23,
  "ENOBUFS": 55,
  "ENODATA": 96,
  "ENODEV": 19,
  "ENOENT": 2,
  "ENOEXEC": 8,
  "ENOLCK": 77,
  "ENOLINK": 97,
  "ENOMEM": 12,
  "ENOMSG": 91,
  "ENOPROTOOPT": 42,
  "ENOSPC": 28,
  "ENOSR": 98,
  "ENOSTR": 99,
  "ENOSYS": 78,
  "ENOTCONN": 57,
  "ENOTDIR": 20,
  "ENOTEMPTY": 66,
  "ENOTSOCK": 38,
  "ENOTSUP": 45,
  "ENOTTY": 25,
  "ENXIO": 6,
  "EOPNOTSUPP": 102,
  "EOVERFLOW": 84,
  "EPERM": 1,
  "EPIPE": 32,
  "EPROTO": 100,
  "EPROTONOSUPPORT": 43,
  "EPROTOTYPE": 41,
  "ERANGE": 34,
  "EROFS": 30,
  "ESPIPE": 29,
  "ESRCH": 3,
  "ESTALE": 70,
  "ETIME": 101,
  "ETIMEDOUT": 60,
  "ETXTBSY": 26,
  "EWOULDBLOCK": 35,
  "EXDEV": 18,
  "SIGHUP": 1,
  "SIGINT": 2,
  "SIGQUIT": 3,
  "SIGILL": 4,
  "SIGTRAP": 5,
  "SIGABRT": 6,
  "SIGIOT": 6,
  "SIGBUS": 10,
  "SIGFPE": 8,
  "SIGKILL": 9,
  "SIGUSR1": 30,
  "SIGSEGV": 11,
  "SIGUSR2": 31,
  "SIGPIPE": 13,
  "SIGALRM": 14,
  "SIGTERM": 15,
  "SIGCHLD": 20,
  "SIGCONT": 19,
  "SIGSTOP": 17,
  "SIGTSTP": 18,
  "SIGTTIN": 21,
  "SIGTTOU": 22,
  "SIGURG": 16,
  "SIGXCPU": 24,
  "SIGXFSZ": 25,
  "SIGVTALRM": 26,
  "SIGPROF": 27,
  "SIGWINCH": 28,
  "SIGIO": 23,
  "SIGSYS": 12,
  "SSL_OP_ALL": 2147486719,
  "SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION": 262144,
  "SSL_OP_CIPHER_SERVER_PREFERENCE": 4194304,
  "SSL_OP_CISCO_ANYCONNECT": 32768,
  "SSL_OP_COOKIE_EXCHANGE": 8192,
  "SSL_OP_CRYPTOPRO_TLSEXT_BUG": 2147483648,
  "SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS": 2048,
  "SSL_OP_EPHEMERAL_RSA": 0,
  "SSL_OP_LEGACY_SERVER_CONNECT": 4,
  "SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER": 32,
  "SSL_OP_MICROSOFT_SESS_ID_BUG": 1,
  "SSL_OP_MSIE_SSLV2_RSA_PADDING": 0,
  "SSL_OP_NETSCAPE_CA_DN_BUG": 536870912,
  "SSL_OP_NETSCAPE_CHALLENGE_BUG": 2,
  "SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG": 1073741824,
  "SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG": 8,
  "SSL_OP_NO_COMPRESSION": 131072,
  "SSL_OP_NO_QUERY_MTU": 4096,
  "SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION": 65536,
  "SSL_OP_NO_SSLv2": 16777216,
  "SSL_OP_NO_SSLv3": 33554432,
  "SSL_OP_NO_TICKET": 16384,
  "SSL_OP_NO_TLSv1": 67108864,
  "SSL_OP_NO_TLSv1_1": 268435456,
  "SSL_OP_NO_TLSv1_2": 134217728,
  "SSL_OP_PKCS1_CHECK_1": 0,
  "SSL_OP_PKCS1_CHECK_2": 0,
  "SSL_OP_SINGLE_DH_USE": 1048576,
  "SSL_OP_SINGLE_ECDH_USE": 524288,
  "SSL_OP_SSLEAY_080_CLIENT_DH_BUG": 128,
  "SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG": 0,
  "SSL_OP_TLS_BLOCK_PADDING_BUG": 512,
  "SSL_OP_TLS_D5_BUG": 256,
  "SSL_OP_TLS_ROLLBACK_BUG": 8388608,
  "ENGINE_METHOD_DSA": 2,
  "ENGINE_METHOD_DH": 4,
  "ENGINE_METHOD_RAND": 8,
  "ENGINE_METHOD_ECDH": 16,
  "ENGINE_METHOD_ECDSA": 32,
  "ENGINE_METHOD_CIPHERS": 64,
  "ENGINE_METHOD_DIGESTS": 128,
  "ENGINE_METHOD_STORE": 256,
  "ENGINE_METHOD_PKEY_METHS": 512,
  "ENGINE_METHOD_PKEY_ASN1_METHS": 1024,
  "ENGINE_METHOD_ALL": 65535,
  "ENGINE_METHOD_NONE": 0,
  "DH_CHECK_P_NOT_SAFE_PRIME": 2,
  "DH_CHECK_P_NOT_PRIME": 1,
  "DH_UNABLE_TO_CHECK_GENERATOR": 4,
  "DH_NOT_SUITABLE_GENERATOR": 8,
  "NPN_ENABLED": 1,
  "RSA_PKCS1_PADDING": 1,
  "RSA_SSLV23_PADDING": 2,
  "RSA_NO_PADDING": 3,
  "RSA_PKCS1_OAEP_PADDING": 4,
  "RSA_X931_PADDING": 5,
  "RSA_PKCS1_PSS_PADDING": 6,
  "POINT_CONVERSION_COMPRESSED": 2,
  "POINT_CONVERSION_UNCOMPRESSED": 4,
  "POINT_CONVERSION_HYBRID": 6,
  "F_OK": 0,
  "R_OK": 4,
  "W_OK": 2,
  "X_OK": 1,
  "UV_UDP_REUSEADDR": 4
}

},{}],187:[function(require,module,exports){
/*!
 * copy-to - index.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * slice() reference.
 */

var slice = Array.prototype.slice;

/**
 * Expose copy
 *
 * ```
 * copy({foo: 'nar', hello: 'copy'}).to({hello: 'world'});
 * copy({foo: 'nar', hello: 'copy'}).toCover({hello: 'world'});
 * ```
 *
 * @param {Object} src
 * @return {Copy}
 */

module.exports = Copy;


/**
 * Copy
 * @param {Object} src
 * @param {Boolean} withAccess
 */

function Copy(src, withAccess) {
  if (!(this instanceof Copy)) return new Copy(src, withAccess);
  this.src = src;
  this._withAccess = withAccess;
}

/**
 * copy properties include getter and setter
 * @param {[type]} val [description]
 * @return {[type]} [description]
 */

Copy.prototype.withAccess = function (w) {
  this._withAccess = w !== false;
  return this;
};

/**
 * pick keys in src
 *
 * @api: public
 */

Copy.prototype.pick = function(keys) {
  if (!Array.isArray(keys)) {
    keys = slice.call(arguments);
  }
  if (keys.length) {
    this.keys = keys;
  }
  return this;
};

/**
 * copy src to target,
 * do not cover any property target has
 * @param {Object} to
 *
 * @api: public
 */

Copy.prototype.to = function(to) {
  to = to || {};

  if (!this.src) return to;
  var keys = this.keys || Object.keys(this.src);

  if (!this._withAccess) {
    for (var i = 0; i < keys.length; i++) {
      key = keys[i];
      if (to[key] !== undefined) continue;
      to[key] = this.src[key];
    }
    return to;
  }

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!notDefined(to, key)) continue;
    var getter = this.src.__lookupGetter__(key);
    var setter = this.src.__lookupSetter__(key);
    if (getter) to.__defineGetter__(key, getter);
    if (setter) to.__defineSetter__(key, setter);

    if (!getter && !setter) {
      to[key] = this.src[key];
    }
  }
  return to;
};

/**
 * copy src to target,
 * override any property target has
 * @param {Object} to
 *
 * @api: public
 */

Copy.prototype.toCover = function(to) {
  var keys = this.keys || Object.keys(this.src);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    delete to[key];
    var getter = this.src.__lookupGetter__(key);
    var setter = this.src.__lookupSetter__(key);
    if (getter) to.__defineGetter__(key, getter);
    if (setter) to.__defineSetter__(key, setter);

    if (!getter && !setter) {
      to[key] = this.src[key];
    }
  }
};

Copy.prototype.override = Copy.prototype.toCover;

/**
 * append another object to src
 * @param {Obj} obj
 * @return {Copy}
 */

Copy.prototype.and = function (obj) {
  var src = {};
  this.to(src);
  this.src = obj;
  this.to(src);
  this.src = src;

  return this;
};

/**
 * check obj[key] if not defiend
 * @param {Object} obj
 * @param {String} key
 * @return {Boolean}
 */

function notDefined(obj, key) {
  return obj[key] === undefined
    && obj.__lookupGetter__(key) === undefined
    && obj.__lookupSetter__(key) === undefined;
}

},{}],188:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/es6.array.from');
module.exports = require('../../modules/_core').Array.from;

},{"../../modules/_core":209,"../../modules/es6.array.from":279,"../../modules/es6.string.iterator":290}],189:[function(require,module,exports){
var core = require('../../modules/_core');
var $JSON = core.JSON || (core.JSON = { stringify: JSON.stringify });
module.exports = function stringify(it) { // eslint-disable-line no-unused-vars
  return $JSON.stringify.apply($JSON, arguments);
};

},{"../../modules/_core":209}],190:[function(require,module,exports){
require('../../modules/es6.object.assign');
module.exports = require('../../modules/_core').Object.assign;

},{"../../modules/_core":209,"../../modules/es6.object.assign":282}],191:[function(require,module,exports){
require('../../modules/es6.object.create');
var $Object = require('../../modules/_core').Object;
module.exports = function create(P, D) {
  return $Object.create(P, D);
};

},{"../../modules/_core":209,"../../modules/es6.object.create":283}],192:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};

},{"../../modules/_core":209,"../../modules/es6.object.define-property":284}],193:[function(require,module,exports){
require('../../modules/es7.object.entries');
module.exports = require('../../modules/_core').Object.entries;

},{"../../modules/_core":209,"../../modules/es7.object.entries":292}],194:[function(require,module,exports){
require('../../modules/es6.object.get-prototype-of');
module.exports = require('../../modules/_core').Object.getPrototypeOf;

},{"../../modules/_core":209,"../../modules/es6.object.get-prototype-of":285}],195:[function(require,module,exports){
require('../../modules/es6.object.keys');
module.exports = require('../../modules/_core').Object.keys;

},{"../../modules/_core":209,"../../modules/es6.object.keys":286}],196:[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/_core').Object.setPrototypeOf;

},{"../../modules/_core":209,"../../modules/es6.object.set-prototype-of":287}],197:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
require('../modules/es7.promise.finally');
require('../modules/es7.promise.try');
module.exports = require('../modules/_core').Promise;

},{"../modules/_core":209,"../modules/es6.object.to-string":288,"../modules/es6.promise":289,"../modules/es6.string.iterator":290,"../modules/es7.promise.finally":293,"../modules/es7.promise.try":294,"../modules/web.dom.iterable":297}],198:[function(require,module,exports){
require('../modules/web.immediate');
module.exports = require('../modules/_core').setImmediate;

},{"../modules/_core":209,"../modules/web.immediate":298}],199:[function(require,module,exports){
require('../../modules/es6.function.has-instance');
module.exports = require('../../modules/_wks-ext').f('hasInstance');

},{"../../modules/_wks-ext":276,"../../modules/es6.function.has-instance":281}],200:[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
require('../../modules/es7.symbol.async-iterator');
require('../../modules/es7.symbol.observable');
module.exports = require('../../modules/_core').Symbol;

},{"../../modules/_core":209,"../../modules/es6.object.to-string":288,"../../modules/es6.symbol":291,"../../modules/es7.symbol.async-iterator":295,"../../modules/es7.symbol.observable":296}],201:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/_wks-ext').f('iterator');

},{"../../modules/_wks-ext":276,"../../modules/es6.string.iterator":290,"../../modules/web.dom.iterable":297}],202:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],203:[function(require,module,exports){
module.exports = function () { /* empty */ };

},{}],204:[function(require,module,exports){
module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};

},{}],205:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":229}],206:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');
var toAbsoluteIndex = require('./_to-absolute-index');
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

},{"./_to-absolute-index":267,"./_to-iobject":269,"./_to-length":270}],207:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof');
var TAG = require('./_wks')('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

},{"./_cof":208,"./_wks":277}],208:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],209:[function(require,module,exports){
var core = module.exports = { version: '2.6.11' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],210:[function(require,module,exports){
'use strict';
var $defineProperty = require('./_object-dp');
var createDesc = require('./_property-desc');

module.exports = function (object, index, value) {
  if (index in object) $defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};

},{"./_object-dp":242,"./_property-desc":256}],211:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"./_a-function":202}],212:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],213:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":218}],214:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":220,"./_is-object":229}],215:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],216:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};

},{"./_object-gops":247,"./_object-keys":250,"./_object-pie":251}],217:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var ctx = require('./_ctx');
var hide = require('./_hide');
var has = require('./_has');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":209,"./_ctx":211,"./_global":220,"./_has":221,"./_hide":222}],218:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],219:[function(require,module,exports){
var ctx = require('./_ctx');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var anObject = require('./_an-object');
var toLength = require('./_to-length');
var getIterFn = require('./core.get-iterator-method');
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;

},{"./_an-object":205,"./_ctx":211,"./_is-array-iter":227,"./_iter-call":230,"./_to-length":270,"./core.get-iterator-method":278}],220:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],221:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],222:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":213,"./_object-dp":242,"./_property-desc":256}],223:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":220}],224:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":213,"./_dom-create":214,"./_fails":218}],225:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};

},{}],226:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":208}],227:[function(require,module,exports){
// check on default Array iterator
var Iterators = require('./_iterators');
var ITERATOR = require('./_wks')('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};

},{"./_iterators":235,"./_wks":277}],228:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};

},{"./_cof":208}],229:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],230:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};

},{"./_an-object":205}],231:[function(require,module,exports){
'use strict';
var create = require('./_object-create');
var descriptor = require('./_property-desc');
var setToStringTag = require('./_set-to-string-tag');
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};

},{"./_hide":222,"./_object-create":241,"./_property-desc":256,"./_set-to-string-tag":261,"./_wks":277}],232:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var $export = require('./_export');
var redefine = require('./_redefine');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var $iterCreate = require('./_iter-create');
var setToStringTag = require('./_set-to-string-tag');
var getPrototypeOf = require('./_object-gpo');
var ITERATOR = require('./_wks')('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

},{"./_export":217,"./_hide":222,"./_iter-create":231,"./_iterators":235,"./_library":236,"./_object-gpo":248,"./_redefine":258,"./_set-to-string-tag":261,"./_wks":277}],233:[function(require,module,exports){
var ITERATOR = require('./_wks')('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};

},{"./_wks":277}],234:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],235:[function(require,module,exports){
module.exports = {};

},{}],236:[function(require,module,exports){
module.exports = true;

},{}],237:[function(require,module,exports){
var META = require('./_uid')('meta');
var isObject = require('./_is-object');
var has = require('./_has');
var setDesc = require('./_object-dp').f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !require('./_fails')(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};

},{"./_fails":218,"./_has":221,"./_is-object":229,"./_object-dp":242,"./_uid":273}],238:[function(require,module,exports){
var global = require('./_global');
var macrotask = require('./_task').set;
var Observer = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var isNode = require('./_cof')(process) == 'process';

module.exports = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
  } else if (Observer && !(global.navigator && global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    var promise = Promise.resolve(undefined);
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};

},{"./_cof":208,"./_global":220,"./_task":266}],239:[function(require,module,exports){
'use strict';
// 25.4.1.5 NewPromiseCapability(C)
var aFunction = require('./_a-function');

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
}

module.exports.f = function (C) {
  return new PromiseCapability(C);
};

},{"./_a-function":202}],240:[function(require,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var DESCRIPTORS = require('./_descriptors');
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
var toObject = require('./_to-object');
var IObject = require('./_iobject');
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || require('./_fails')(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!DESCRIPTORS || isEnum.call(S, key)) T[key] = S[key];
    }
  } return T;
} : $assign;

},{"./_descriptors":213,"./_fails":218,"./_iobject":226,"./_object-gops":247,"./_object-keys":250,"./_object-pie":251,"./_to-object":271}],241:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = require('./_an-object');
var dPs = require('./_object-dps');
var enumBugKeys = require('./_enum-bug-keys');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":205,"./_dom-create":214,"./_enum-bug-keys":215,"./_html":223,"./_object-dps":243,"./_shared-key":262}],242:[function(require,module,exports){
var anObject = require('./_an-object');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"./_an-object":205,"./_descriptors":213,"./_ie8-dom-define":224,"./_to-primitive":272}],243:[function(require,module,exports){
var dP = require('./_object-dp');
var anObject = require('./_an-object');
var getKeys = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};

},{"./_an-object":205,"./_descriptors":213,"./_object-dp":242,"./_object-keys":250}],244:[function(require,module,exports){
var pIE = require('./_object-pie');
var createDesc = require('./_property-desc');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var has = require('./_has');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};

},{"./_descriptors":213,"./_has":221,"./_ie8-dom-define":224,"./_object-pie":251,"./_property-desc":256,"./_to-iobject":269,"./_to-primitive":272}],245:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject');
var gOPN = require('./_object-gopn').f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":246,"./_to-iobject":269}],246:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = require('./_object-keys-internal');
var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};

},{"./_enum-bug-keys":215,"./_object-keys-internal":249}],247:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],248:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = require('./_has');
var toObject = require('./_to-object');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

},{"./_has":221,"./_shared-key":262,"./_to-object":271}],249:[function(require,module,exports){
var has = require('./_has');
var toIObject = require('./_to-iobject');
var arrayIndexOf = require('./_array-includes')(false);
var IE_PROTO = require('./_shared-key')('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

},{"./_array-includes":206,"./_has":221,"./_shared-key":262,"./_to-iobject":269}],250:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":215,"./_object-keys-internal":249}],251:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;

},{}],252:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export');
var core = require('./_core');
var fails = require('./_fails');
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};

},{"./_core":209,"./_export":217,"./_fails":218}],253:[function(require,module,exports){
var DESCRIPTORS = require('./_descriptors');
var getKeys = require('./_object-keys');
var toIObject = require('./_to-iobject');
var isEnum = require('./_object-pie').f;
module.exports = function (isEntries) {
  return function (it) {
    var O = toIObject(it);
    var keys = getKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) {
      key = keys[i++];
      if (!DESCRIPTORS || isEnum.call(O, key)) {
        result.push(isEntries ? [key, O[key]] : O[key]);
      }
    }
    return result;
  };
};

},{"./_descriptors":213,"./_object-keys":250,"./_object-pie":251,"./_to-iobject":269}],254:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};

},{}],255:[function(require,module,exports){
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var newPromiseCapability = require('./_new-promise-capability');

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

},{"./_an-object":205,"./_is-object":229,"./_new-promise-capability":239}],256:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],257:[function(require,module,exports){
var hide = require('./_hide');
module.exports = function (target, src, safe) {
  for (var key in src) {
    if (safe && target[key]) target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};

},{"./_hide":222}],258:[function(require,module,exports){
module.exports = require('./_hide');

},{"./_hide":222}],259:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object');
var anObject = require('./_an-object');
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};

},{"./_an-object":205,"./_ctx":211,"./_is-object":229,"./_object-gopd":244}],260:[function(require,module,exports){
'use strict';
var global = require('./_global');
var core = require('./_core');
var dP = require('./_object-dp');
var DESCRIPTORS = require('./_descriptors');
var SPECIES = require('./_wks')('species');

module.exports = function (KEY) {
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};

},{"./_core":209,"./_descriptors":213,"./_global":220,"./_object-dp":242,"./_wks":277}],261:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":221,"./_object-dp":242,"./_wks":277}],262:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":263,"./_uid":273}],263:[function(require,module,exports){
var core = require('./_core');
var global = require('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: require('./_library') ? 'pure' : 'global',
  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
});

},{"./_core":209,"./_global":220,"./_library":236}],264:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = require('./_an-object');
var aFunction = require('./_a-function');
var SPECIES = require('./_wks')('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};

},{"./_a-function":202,"./_an-object":205,"./_wks":277}],265:[function(require,module,exports){
var toInteger = require('./_to-integer');
var defined = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

},{"./_defined":212,"./_to-integer":268}],266:[function(require,module,exports){
var ctx = require('./_ctx');
var invoke = require('./_invoke');
var html = require('./_html');
var cel = require('./_dom-create');
var global = require('./_global');
var process = global.process;
var setTask = global.setImmediate;
var clearTask = global.clearImmediate;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (require('./_cof')(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
    defer = function (id) {
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};

},{"./_cof":208,"./_ctx":211,"./_dom-create":214,"./_global":220,"./_html":223,"./_invoke":225}],267:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":268}],268:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],269:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":212,"./_iobject":226}],270:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":268}],271:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":212}],272:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":229}],273:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],274:[function(require,module,exports){
var global = require('./_global');
var navigator = global.navigator;

module.exports = navigator && navigator.userAgent || '';

},{"./_global":220}],275:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var LIBRARY = require('./_library');
var wksExt = require('./_wks-ext');
var defineProperty = require('./_object-dp').f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};

},{"./_core":209,"./_global":220,"./_library":236,"./_object-dp":242,"./_wks-ext":276}],276:[function(require,module,exports){
exports.f = require('./_wks');

},{"./_wks":277}],277:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":220,"./_shared":263,"./_uid":273}],278:[function(require,module,exports){
var classof = require('./_classof');
var ITERATOR = require('./_wks')('iterator');
var Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};

},{"./_classof":207,"./_core":209,"./_iterators":235,"./_wks":277}],279:[function(require,module,exports){
'use strict';
var ctx = require('./_ctx');
var $export = require('./_export');
var toObject = require('./_to-object');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var toLength = require('./_to-length');
var createProperty = require('./_create-property');
var getIterFn = require('./core.get-iterator-method');

$export($export.S + $export.F * !require('./_iter-detect')(function (iter) { Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = getIterFn(O);
    var length, result, step, iterator;
    if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for (result = new C(length); length > index; index++) {
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"./_create-property":210,"./_ctx":211,"./_export":217,"./_is-array-iter":227,"./_iter-call":230,"./_iter-detect":233,"./_to-length":270,"./_to-object":271,"./core.get-iterator-method":278}],280:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables');
var step = require('./_iter-step');
var Iterators = require('./_iterators');
var toIObject = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

},{"./_add-to-unscopables":203,"./_iter-define":232,"./_iter-step":234,"./_iterators":235,"./_to-iobject":269}],281:[function(require,module,exports){
'use strict';
var isObject = require('./_is-object');
var getPrototypeOf = require('./_object-gpo');
var HAS_INSTANCE = require('./_wks')('hasInstance');
var FunctionProto = Function.prototype;
// 19.2.3.6 Function.prototype[@@hasInstance](V)
if (!(HAS_INSTANCE in FunctionProto)) require('./_object-dp').f(FunctionProto, HAS_INSTANCE, { value: function (O) {
  if (typeof this != 'function' || !isObject(O)) return false;
  if (!isObject(this.prototype)) return O instanceof this;
  // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
  while (O = getPrototypeOf(O)) if (this.prototype === O) return true;
  return false;
} });

},{"./_is-object":229,"./_object-dp":242,"./_object-gpo":248,"./_wks":277}],282:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./_export');

$export($export.S + $export.F, 'Object', { assign: require('./_object-assign') });

},{"./_export":217,"./_object-assign":240}],283:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', { create: require('./_object-create') });

},{"./_export":217,"./_object-create":241}],284:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperty: require('./_object-dp').f });

},{"./_descriptors":213,"./_export":217,"./_object-dp":242}],285:[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject = require('./_to-object');
var $getPrototypeOf = require('./_object-gpo');

require('./_object-sap')('getPrototypeOf', function () {
  return function getPrototypeOf(it) {
    return $getPrototypeOf(toObject(it));
  };
});

},{"./_object-gpo":248,"./_object-sap":252,"./_to-object":271}],286:[function(require,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = require('./_to-object');
var $keys = require('./_object-keys');

require('./_object-sap')('keys', function () {
  return function keys(it) {
    return $keys(toObject(it));
  };
});

},{"./_object-keys":250,"./_object-sap":252,"./_to-object":271}],287:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./_export');
$export($export.S, 'Object', { setPrototypeOf: require('./_set-proto').set });

},{"./_export":217,"./_set-proto":259}],288:[function(require,module,exports){
arguments[4][179][0].apply(exports,arguments)
},{"dup":179}],289:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var global = require('./_global');
var ctx = require('./_ctx');
var classof = require('./_classof');
var $export = require('./_export');
var isObject = require('./_is-object');
var aFunction = require('./_a-function');
var anInstance = require('./_an-instance');
var forOf = require('./_for-of');
var speciesConstructor = require('./_species-constructor');
var task = require('./_task').set;
var microtask = require('./_microtask')();
var newPromiseCapabilityModule = require('./_new-promise-capability');
var perform = require('./_perform');
var userAgent = require('./_user-agent');
var promiseResolve = require('./_promise-resolve');
var PROMISE = 'Promise';
var TypeError = global.TypeError;
var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8 || '';
var $Promise = global[PROMISE];
var isNode = classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function')
      && promise.then(empty) instanceof FakePromise
      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // we can't detect it synchronously, so just check versions
      && v8.indexOf('6.6') !== 0
      && userAgent.indexOf('Chrome/66') === -1;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // may throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else if (handler = global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};
var onHandleUnhandled = function (promise) {
  task.call(global, function () {
    var handler;
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else if (handler = global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = require('./_redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject = ctx($reject, promise, 1);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
require('./_set-to-string-tag')($Promise, PROMISE);
require('./_set-species')(PROMISE);
Wrapper = require('./_core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});

},{"./_a-function":202,"./_an-instance":204,"./_classof":207,"./_core":209,"./_ctx":211,"./_export":217,"./_for-of":219,"./_global":220,"./_is-object":229,"./_iter-detect":233,"./_library":236,"./_microtask":238,"./_new-promise-capability":239,"./_perform":254,"./_promise-resolve":255,"./_redefine-all":257,"./_set-species":260,"./_set-to-string-tag":261,"./_species-constructor":264,"./_task":266,"./_user-agent":274,"./_wks":277}],290:[function(require,module,exports){
'use strict';
var $at = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

},{"./_iter-define":232,"./_string-at":265}],291:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global = require('./_global');
var has = require('./_has');
var DESCRIPTORS = require('./_descriptors');
var $export = require('./_export');
var redefine = require('./_redefine');
var META = require('./_meta').KEY;
var $fails = require('./_fails');
var shared = require('./_shared');
var setToStringTag = require('./_set-to-string-tag');
var uid = require('./_uid');
var wks = require('./_wks');
var wksExt = require('./_wks-ext');
var wksDefine = require('./_wks-define');
var enumKeys = require('./_enum-keys');
var isArray = require('./_is-array');
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var toObject = require('./_to-object');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var createDesc = require('./_property-desc');
var _create = require('./_object-create');
var gOPNExt = require('./_object-gopn-ext');
var $GOPD = require('./_object-gopd');
var $GOPS = require('./_object-gops');
var $DP = require('./_object-dp');
var $keys = require('./_object-keys');
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function' && !!$GOPS.f;
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f = $propertyIsEnumerable;
  $GOPS.f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !require('./_library')) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
var FAILS_ON_PRIMITIVES = $fails(function () { $GOPS.f(1); });

$export($export.S + $export.F * FAILS_ON_PRIMITIVES, 'Object', {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    return $GOPS.f(toObject(it));
  }
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);

},{"./_an-object":205,"./_descriptors":213,"./_enum-keys":216,"./_export":217,"./_fails":218,"./_global":220,"./_has":221,"./_hide":222,"./_is-array":228,"./_is-object":229,"./_library":236,"./_meta":237,"./_object-create":241,"./_object-dp":242,"./_object-gopd":244,"./_object-gopn":246,"./_object-gopn-ext":245,"./_object-gops":247,"./_object-keys":250,"./_object-pie":251,"./_property-desc":256,"./_redefine":258,"./_set-to-string-tag":261,"./_shared":263,"./_to-iobject":269,"./_to-object":271,"./_to-primitive":272,"./_uid":273,"./_wks":277,"./_wks-define":275,"./_wks-ext":276}],292:[function(require,module,exports){
// https://github.com/tc39/proposal-object-values-entries
var $export = require('./_export');
var $entries = require('./_object-to-array')(true);

$export($export.S, 'Object', {
  entries: function entries(it) {
    return $entries(it);
  }
});

},{"./_export":217,"./_object-to-array":253}],293:[function(require,module,exports){
// https://github.com/tc39/proposal-promise-finally
'use strict';
var $export = require('./_export');
var core = require('./_core');
var global = require('./_global');
var speciesConstructor = require('./_species-constructor');
var promiseResolve = require('./_promise-resolve');

$export($export.P + $export.R, 'Promise', { 'finally': function (onFinally) {
  var C = speciesConstructor(this, core.Promise || global.Promise);
  var isFunction = typeof onFinally == 'function';
  return this.then(
    isFunction ? function (x) {
      return promiseResolve(C, onFinally()).then(function () { return x; });
    } : onFinally,
    isFunction ? function (e) {
      return promiseResolve(C, onFinally()).then(function () { throw e; });
    } : onFinally
  );
} });

},{"./_core":209,"./_export":217,"./_global":220,"./_promise-resolve":255,"./_species-constructor":264}],294:[function(require,module,exports){
'use strict';
// https://github.com/tc39/proposal-promise-try
var $export = require('./_export');
var newPromiseCapability = require('./_new-promise-capability');
var perform = require('./_perform');

$export($export.S, 'Promise', { 'try': function (callbackfn) {
  var promiseCapability = newPromiseCapability.f(this);
  var result = perform(callbackfn);
  (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
  return promiseCapability.promise;
} });

},{"./_export":217,"./_new-promise-capability":239,"./_perform":254}],295:[function(require,module,exports){
require('./_wks-define')('asyncIterator');

},{"./_wks-define":275}],296:[function(require,module,exports){
require('./_wks-define')('observable');

},{"./_wks-define":275}],297:[function(require,module,exports){
require('./es6.array.iterator');
var global = require('./_global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var TO_STRING_TAG = require('./_wks')('toStringTag');

var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
  'TextTrackList,TouchList').split(',');

for (var i = 0; i < DOMIterables.length; i++) {
  var NAME = DOMIterables[i];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}

},{"./_global":220,"./_hide":222,"./_iterators":235,"./_wks":277,"./es6.array.iterator":280}],298:[function(require,module,exports){
var $export = require('./_export');
var $task = require('./_task');
$export($export.G + $export.B, {
  setImmediate: $task.set,
  clearImmediate: $task.clear
});

},{"./_export":217,"./_task":266}],299:[function(require,module,exports){
(function (Buffer){
'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return (typeof arg === 'undefined' ? 'undefined' : (0, _typeof3.default)(arg)) === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return (typeof arg === 'undefined' ? 'undefined' : (0, _typeof3.default)(arg)) === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return objectToString(e) === '[object Error]' || e instanceof Error;
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null || typeof arg === 'boolean' || typeof arg === 'number' || typeof arg === 'string' || (typeof arg === 'undefined' ? 'undefined' : (0, _typeof3.default)(arg)) === 'symbol' || // ES6 symbol
  typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../is-buffer/index.js")})
},{"../../is-buffer/index.js":307,"babel-runtime/helpers/typeof":173}],300:[function(require,module,exports){
'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

(function (global) {
  'use strict';

  var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|'[^']*'|'[^']*'/g;
    var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
    var timezoneClip = /[^-+\dA-Z]/g;

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc, gmt) {

      // You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
      if (arguments.length === 1 && kindOf(date) === 'string' && !/\d/.test(date)) {
        mask = date;
        date = undefined;
      }

      date = date || new Date();

      if (!(date instanceof Date)) {
        date = new Date(date);
      }

      if (isNaN(date)) {
        throw TypeError('Invalid date');
      }

      mask = String(dateFormat.masks[mask] || mask || dateFormat.masks['default']);

      // Allow setting the utc/gmt argument via the mask
      var maskSlice = mask.slice(0, 4);
      if (maskSlice === 'UTC:' || maskSlice === 'GMT:') {
        mask = mask.slice(4);
        utc = true;
        if (maskSlice === 'GMT:') {
          gmt = true;
        }
      }

      var _ = utc ? 'getUTC' : 'get';
      var d = date[_ + 'Date']();
      var D = date[_ + 'Day']();
      var m = date[_ + 'Month']();
      var y = date[_ + 'FullYear']();
      var H = date[_ + 'Hours']();
      var M = date[_ + 'Minutes']();
      var s = date[_ + 'Seconds']();
      var L = date[_ + 'Milliseconds']();
      var o = utc ? 0 : date.getTimezoneOffset();
      var W = getWeek(date);
      var N = getDayOfWeek(date);
      var flags = {
        d: d,
        dd: pad(d),
        ddd: dateFormat.i18n.dayNames[D],
        dddd: dateFormat.i18n.dayNames[D + 7],
        m: m + 1,
        mm: pad(m + 1),
        mmm: dateFormat.i18n.monthNames[m],
        mmmm: dateFormat.i18n.monthNames[m + 12],
        yy: String(y).slice(2),
        yyyy: y,
        h: H % 12 || 12,
        hh: pad(H % 12 || 12),
        H: H,
        HH: pad(H),
        M: M,
        MM: pad(M),
        s: s,
        ss: pad(s),
        l: pad(L, 3),
        L: pad(Math.round(L / 10)),
        t: H < 12 ? 'a' : 'p',
        tt: H < 12 ? 'am' : 'pm',
        T: H < 12 ? 'A' : 'P',
        TT: H < 12 ? 'AM' : 'PM',
        Z: gmt ? 'GMT' : utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
        o: (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
        S: ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10],
        W: W,
        N: N
      };

      return mask.replace(token, function (match) {
        if (match in flags) {
          return flags[match];
        }
        return match.slice(1, match.length - 1);
      });
    };
  }();

  dateFormat.masks = {
    'default': 'ddd mmm dd yyyy HH:MM:ss',
    'shortDate': 'm/d/yy',
    'mediumDate': 'mmm d, yyyy',
    'longDate': 'mmmm d, yyyy',
    'fullDate': 'dddd, mmmm d, yyyy',
    'shortTime': 'h:MM TT',
    'mediumTime': 'h:MM:ss TT',
    'longTime': 'h:MM:ss TT Z',
    'isoDate': 'yyyy-mm-dd',
    'isoTime': 'HH:MM:ss',
    'isoDateTime': 'yyyy-mm-dd\'T\'HH:MM:sso',
    'isoUtcDateTime': 'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
    'expiresHeaderFormat': 'ddd, dd mmm yyyy HH:MM:ss Z'
  };

  // Internationalization strings
  dateFormat.i18n = {
    dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };

  function pad(val, len) {
    val = String(val);
    len = len || 2;
    while (val.length < len) {
      val = '0' + val;
    }
    return val;
  }

  /**
   * Get the ISO 8601 week number
   * Based on comments from
   * http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
   *
   * @param  {Object} `date`
   * @return {Number}
   */
  function getWeek(date) {
    // Remove time components of date
    var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // Change date to Thursday same week
    targetThursday.setDate(targetThursday.getDate() - (targetThursday.getDay() + 6) % 7 + 3);

    // Take January 4th as it is always in week 1 (see ISO 8601)
    var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);

    // Change date to Thursday same week
    firstThursday.setDate(firstThursday.getDate() - (firstThursday.getDay() + 6) % 7 + 3);

    // Check if daylight-saving-time-switch occurred and correct for it
    var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
    targetThursday.setHours(targetThursday.getHours() - ds);

    // Number of weeks between target Thursday and first Thursday
    var weekDiff = (targetThursday - firstThursday) / (86400000 * 7);
    return 1 + Math.floor(weekDiff);
  }

  /**
   * Get ISO-8601 numeric representation of the day of the week
   * 1 (for Monday) through 7 (for Sunday)
   * 
   * @param  {Object} `date`
   * @return {Number}
   */
  function getDayOfWeek(date) {
    var dow = date.getDay();
    if (dow === 0) {
      dow = 7;
    }
    return dow;
  }

  /**
   * kind-of shortcut
   * @param  {*} val
   * @return {String}
   */
  function kindOf(val) {
    if (val === null) {
      return 'null';
    }

    if (val === undefined) {
      return 'undefined';
    }

    if ((typeof val === 'undefined' ? 'undefined' : (0, _typeof3.default)(val)) !== 'object') {
      return typeof val === 'undefined' ? 'undefined' : (0, _typeof3.default)(val);
    }

    if (Array.isArray(val)) {
      return 'array';
    }

    return {}.toString.call(val).slice(8, -1).toLowerCase();
  };

  if (typeof define === 'function' && define.amd) {
    define(function () {
      return dateFormat;
    });
  } else if ((typeof exports === 'undefined' ? 'undefined' : (0, _typeof3.default)(exports)) === 'object') {
    module.exports = dateFormat;
  } else {
    global.dateFormat = dateFormat;
  }
})(undefined);

},{"babel-runtime/helpers/typeof":173}],301:[function(require,module,exports){
/*!
 * escape-html
 * Copyright(c) 2012-2013 TJ Holowaychuk
 * Copyright(c) 2015 Andreas Lubbe
 * Copyright(c) 2015 Tiancheng "Timothy" Gu
 * MIT Licensed
 */

'use strict';

/**
 * Module variables.
 * @private
 */

var matchHtmlRegExp = /["'&<>]/;

/**
 * Module exports.
 * @public
 */

module.exports = escapeHtml;

/**
 * Escape special characters in the given string of html.
 *
 * @param  {string} string The string to escape for inserting into HTML
 * @return {string}
 * @public
 */

function escapeHtml(string) {
  var str = '' + string;
  var match = matchHtmlRegExp.exec(str);

  if (!match) {
    return str;
  }

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 39: // '
        escape = '&#39;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index
    ? html + str.substring(lastIndex, index)
    : html;
}

},{}],302:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],303:[function(require,module,exports){
var http = require('http');

var https = module.exports;

for (var key in http) {
    if (http.hasOwnProperty(key)) https[key] = http[key];
};

https.request = function (params, cb) {
    if (!params) params = {};
    params.scheme = 'https';
    params.protocol = 'https:';
    return http.request.call(this, params, cb);
}

},{"http":180}],304:[function(require,module,exports){
/*!
 * humanize-ms - index.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var util = require('util');
var ms = require('ms');

module.exports = function (t) {
  if (typeof t === 'number') return t;
  var r = ms(t);
  if (r === undefined) {
    var err = new Error(util.format('humanize-ms(%j) result undefined', t));
    console.warn(err.stack);
  }
  return r;
};

},{"ms":314,"util":345}],305:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],306:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],307:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],308:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],309:[function(require,module,exports){
(function (global){
/*
 *  base64.js
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */
;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? module.exports = factory(global)
        : typeof define === 'function' && define.amd
        ? define(factory) : factory(global)
}((
    typeof self !== 'undefined' ? self
        : typeof window !== 'undefined' ? window
        : typeof global !== 'undefined' ? global
: this
), function(global) {
    'use strict';
    // existing version for noConflict()
    global = global || {};
    var _Base64 = global.Base64;
    var version = "2.6.2";
    // constants
    var b64chars
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function(bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    // encoder stuff
    var cb_utob = function(c) {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 0x80 ? c
                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
                                + fromCharCode(0x80 | (cc & 0x3f)))
                : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                    + fromCharCode(0x80 | ( cc         & 0x3f)));
        } else {
            var cc = 0x10000
                + (c.charCodeAt(0) - 0xD800) * 0x400
                + (c.charCodeAt(1) - 0xDC00);
            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
                    + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                    + fromCharCode(0x80 | ( cc         & 0x3f)));
        }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function(u) {
        return u.replace(re_utob, cb_utob);
    };
    var cb_encode = function(ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
        ord = ccc.charCodeAt(0) << 16
            | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
            | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
        chars = [
            b64chars.charAt( ord >>> 18),
            b64chars.charAt((ord >>> 12) & 63),
            padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
            padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
        ];
        return chars.join('');
    };
    var btoa = global.btoa && typeof global.btoa == 'function'
        ? function(b){ return global.btoa(b) } : function(b) {
        if (b.match(/[^\x00-\xFF]/)) throw new RangeError(
            'The string contains invalid characters.'
        );
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
    var _encode = function(u) {
        return btoa(utob(String(u)));
    };
    var mkUriSafe = function (b64) {
        return b64.replace(/[+\/]/g, function(m0) {
            return m0 == '+' ? '-' : '_';
        }).replace(/=/g, '');
    };
    var encode = function(u, urisafe) {
        return urisafe ? mkUriSafe(_encode(u)) : _encode(u);
    };
    var encodeURI = function(u) { return encode(u, true) };
    var fromUint8Array;
    if (global.Uint8Array) fromUint8Array = function(a, urisafe) {
        // return btoa(fromCharCode.apply(null, a));
        var b64 = '';
        for (var i = 0, l = a.length; i < l; i += 3) {
            var a0 = a[i], a1 = a[i+1], a2 = a[i+2];
            var ord = a0 << 16 | a1 << 8 | a2;
            b64 +=    b64chars.charAt( ord >>> 18)
                +     b64chars.charAt((ord >>> 12) & 63)
                + ( typeof a1 != 'undefined'
                    ? b64chars.charAt((ord >>>  6) & 63) : '=')
                + ( typeof a2 != 'undefined'
                    ? b64chars.charAt( ord         & 63) : '=');
        }
        return urisafe ? mkUriSafe(b64) : b64;
    };
    // decoder stuff
    var re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
    var cb_btou = function(cccc) {
        switch(cccc.length) {
        case 4:
            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                |    ((0x3f & cccc.charCodeAt(1)) << 12)
                |    ((0x3f & cccc.charCodeAt(2)) <<  6)
                |     (0x3f & cccc.charCodeAt(3)),
            offset = cp - 0x10000;
            return (fromCharCode((offset  >>> 10) + 0xD800)
                    + fromCharCode((offset & 0x3FF) + 0xDC00));
        case 3:
            return fromCharCode(
                ((0x0f & cccc.charCodeAt(0)) << 12)
                    | ((0x3f & cccc.charCodeAt(1)) << 6)
                    |  (0x3f & cccc.charCodeAt(2))
            );
        default:
            return  fromCharCode(
                ((0x1f & cccc.charCodeAt(0)) << 6)
                    |  (0x3f & cccc.charCodeAt(1))
            );
        }
    };
    var btou = function(b) {
        return b.replace(re_btou, cb_btou);
    };
    var cb_decode = function(cccc) {
        var len = cccc.length,
        padlen = len % 4,
        n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
            | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
            | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
            | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
        chars = [
            fromCharCode( n >>> 16),
            fromCharCode((n >>>  8) & 0xff),
            fromCharCode( n         & 0xff)
        ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    };
    var _atob = global.atob && typeof global.atob == 'function'
        ? function(a){ return global.atob(a) } : function(a){
        return a.replace(/\S{1,4}/g, cb_decode);
    };
    var atob = function(a) {
        return _atob(String(a).replace(/[^A-Za-z0-9\+\/]/g, ''));
    };
    var _decode = function(a) { return btou(_atob(a)) };
    var decode = function(a){
        return _decode(
            String(a).replace(/[-_]/g, function(m0) {
                return m0 == '-' ? '+' : '/'
            }).replace(/[^A-Za-z0-9\+\/]/g, '')
        );
    };
    var toUint8Array;
    if (global.Uint8Array) toUint8Array = function(a) {
        return Uint8Array.from(atob(a), function(c) {
            return c.charCodeAt(0);
        });
    };
    var noConflict = function() {
        var Base64 = global.Base64;
        global.Base64 = _Base64;
        return Base64;
    };
    // export Base64
    global.Base64 = {
        VERSION: version,
        atob: atob,
        btoa: btoa,
        fromBase64: decode,
        toBase64: encode,
        utob: utob,
        encode: encode,
        encodeURI: encodeURI,
        btou: btou,
        decode: decode,
        noConflict: noConflict,
        fromUint8Array: fromUint8Array,
        toUint8Array: toUint8Array
    };
    // if ES5 is available, make Base64.extendString() available
    if (typeof Object.defineProperty === 'function') {
        var noEnum = function(v){
            return {value:v,enumerable:false,writable:true,configurable:true};
        };
        global.Base64.extendString = function () {
            Object.defineProperty(
                String.prototype, 'fromBase64', noEnum(function () {
                    return decode(this)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64', noEnum(function (urisafe) {
                    return encode(this, urisafe)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64URI', noEnum(function () {
                    return encode(this, true)
                }));
        };
    }
    //
    // export Base64 to the namespace
    //
    if (global['Meteor']) { // Meteor.js
        Base64 = global.Base64;
    }
    // module.exports and AMD are mutually exclusive.
    // module.exports has precedence.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports.Base64 = global.Base64;
    }
    else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function(){ return global.Base64 });
    }
    // that's it!
    return {Base64: global.Base64}
}));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],310:[function(require,module,exports){
/*!
 * merge-descriptors
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict'

/**
 * Module exports.
 * @public
 */

module.exports = merge

/**
 * Module variables.
 * @private
 */

var hasOwnProperty = Object.prototype.hasOwnProperty

/**
 * Merge the property descriptors of `src` into `dest`
 *
 * @param {object} dest Object to add descriptors to
 * @param {object} src Object to clone descriptors from
 * @param {boolean} [redefine=true] Redefine `dest` properties with `src` properties
 * @returns {object} Reference to dest
 * @public
 */

function merge(dest, src, redefine) {
  if (!dest) {
    throw new TypeError('argument dest is required')
  }

  if (!src) {
    throw new TypeError('argument src is required')
  }

  if (redefine === undefined) {
    // Default to true
    redefine = true
  }

  Object.getOwnPropertyNames(src).forEach(function forEachOwnPropertyName(name) {
    if (!redefine && hasOwnProperty.call(dest, name)) {
      // Skip desriptor
      return
    }

    // Copy descriptor
    var descriptor = Object.getOwnPropertyDescriptor(src, name)
    Object.defineProperty(dest, name, descriptor)
  })

  return dest
}

},{}],311:[function(require,module,exports){
'use strict';

/**
 * @param typeMap [Object] Map of MIME type -> Array[extensions]
 * @param ...
 */
function Mime() {
  this._types = Object.create(null);
  this._extensions = Object.create(null);

  for (var i = 0; i < arguments.length; i++) {
    this.define(arguments[i]);
  }

  this.define = this.define.bind(this);
  this.getType = this.getType.bind(this);
  this.getExtension = this.getExtension.bind(this);
}

/**
 * Define mimetype -> extension mappings.  Each key is a mime-type that maps
 * to an array of extensions associated with the type.  The first extension is
 * used as the default extension for the type.
 *
 * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
 *
 * If a type declares an extension that has already been defined, an error will
 * be thrown.  To suppress this error and force the extension to be associated
 * with the new type, pass `force`=true.  Alternatively, you may prefix the
 * extension with "*" to map the type to extension, without mapping the
 * extension to the type.
 *
 * e.g. mime.define({'audio/wav', ['wav']}, {'audio/x-wav', ['*wav']});
 *
 *
 * @param map (Object) type definitions
 * @param force (Boolean) if true, force overriding of existing definitions
 */
Mime.prototype.define = function(typeMap, force) {
  for (var type in typeMap) {
    var extensions = typeMap[type].map(function(t) {return t.toLowerCase()});
    type = type.toLowerCase();

    for (var i = 0; i < extensions.length; i++) {
      var ext = extensions[i];

      // '*' prefix = not the preferred type for this extension.  So fixup the
      // extension, and skip it.
      if (ext[0] == '*') {
        continue;
      }

      if (!force && (ext in this._types)) {
        throw new Error(
          'Attempt to change mapping for "' + ext +
          '" extension from "' + this._types[ext] + '" to "' + type +
          '". Pass `force=true` to allow this, otherwise remove "' + ext +
          '" from the list of extensions for "' + type + '".'
        );
      }

      this._types[ext] = type;
    }

    // Use first extension as default
    if (force || !this._extensions[type]) {
      var ext = extensions[0];
      this._extensions[type] = (ext[0] != '*') ? ext : ext.substr(1)
    }
  }
};

/**
 * Lookup a mime type based on extension
 */
Mime.prototype.getType = function(path) {
  path = String(path);
  var last = path.replace(/^.*[/\\]/, '').toLowerCase();
  var ext = last.replace(/^.*\./, '').toLowerCase();

  var hasPath = last.length < path.length;
  var hasDot = ext.length < last.length - 1;

  return (hasDot || !hasPath) && this._types[ext] || null;
};

/**
 * Return file extension associated with a mime type
 */
Mime.prototype.getExtension = function(type) {
  type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
  return type && this._extensions[type.toLowerCase()] || null;
};

module.exports = Mime;

},{}],312:[function(require,module,exports){
'use strict';

var Mime = require('./Mime');
module.exports = new Mime(require('./types/standard'));

},{"./Mime":311,"./types/standard":313}],313:[function(require,module,exports){
module.exports = {"application/andrew-inset":["ez"],"application/applixware":["aw"],"application/atom+xml":["atom"],"application/atomcat+xml":["atomcat"],"application/atomdeleted+xml":["atomdeleted"],"application/atomsvc+xml":["atomsvc"],"application/atsc-dwd+xml":["dwd"],"application/atsc-held+xml":["held"],"application/atsc-rsat+xml":["rsat"],"application/bdoc":["bdoc"],"application/calendar+xml":["xcs"],"application/ccxml+xml":["ccxml"],"application/cdfx+xml":["cdfx"],"application/cdmi-capability":["cdmia"],"application/cdmi-container":["cdmic"],"application/cdmi-domain":["cdmid"],"application/cdmi-object":["cdmio"],"application/cdmi-queue":["cdmiq"],"application/cu-seeme":["cu"],"application/dash+xml":["mpd"],"application/davmount+xml":["davmount"],"application/docbook+xml":["dbk"],"application/dssc+der":["dssc"],"application/dssc+xml":["xdssc"],"application/ecmascript":["ecma","es"],"application/emma+xml":["emma"],"application/emotionml+xml":["emotionml"],"application/epub+zip":["epub"],"application/exi":["exi"],"application/fdt+xml":["fdt"],"application/font-tdpfr":["pfr"],"application/geo+json":["geojson"],"application/gml+xml":["gml"],"application/gpx+xml":["gpx"],"application/gxf":["gxf"],"application/gzip":["gz"],"application/hjson":["hjson"],"application/hyperstudio":["stk"],"application/inkml+xml":["ink","inkml"],"application/ipfix":["ipfix"],"application/its+xml":["its"],"application/java-archive":["jar","war","ear"],"application/java-serialized-object":["ser"],"application/java-vm":["class"],"application/javascript":["js","mjs"],"application/json":["json","map"],"application/json5":["json5"],"application/jsonml+json":["jsonml"],"application/ld+json":["jsonld"],"application/lgr+xml":["lgr"],"application/lost+xml":["lostxml"],"application/mac-binhex40":["hqx"],"application/mac-compactpro":["cpt"],"application/mads+xml":["mads"],"application/manifest+json":["webmanifest"],"application/marc":["mrc"],"application/marcxml+xml":["mrcx"],"application/mathematica":["ma","nb","mb"],"application/mathml+xml":["mathml"],"application/mbox":["mbox"],"application/mediaservercontrol+xml":["mscml"],"application/metalink+xml":["metalink"],"application/metalink4+xml":["meta4"],"application/mets+xml":["mets"],"application/mmt-aei+xml":["maei"],"application/mmt-usd+xml":["musd"],"application/mods+xml":["mods"],"application/mp21":["m21","mp21"],"application/mp4":["mp4s","m4p"],"application/mrb-consumer+xml":["*xdf"],"application/mrb-publish+xml":["*xdf"],"application/msword":["doc","dot"],"application/mxf":["mxf"],"application/n-quads":["nq"],"application/n-triples":["nt"],"application/node":["cjs"],"application/octet-stream":["bin","dms","lrf","mar","so","dist","distz","pkg","bpk","dump","elc","deploy","exe","dll","deb","dmg","iso","img","msi","msp","msm","buffer"],"application/oda":["oda"],"application/oebps-package+xml":["opf"],"application/ogg":["ogx"],"application/omdoc+xml":["omdoc"],"application/onenote":["onetoc","onetoc2","onetmp","onepkg"],"application/oxps":["oxps"],"application/p2p-overlay+xml":["relo"],"application/patch-ops-error+xml":["*xer"],"application/pdf":["pdf"],"application/pgp-encrypted":["pgp"],"application/pgp-signature":["asc","sig"],"application/pics-rules":["prf"],"application/pkcs10":["p10"],"application/pkcs7-mime":["p7m","p7c"],"application/pkcs7-signature":["p7s"],"application/pkcs8":["p8"],"application/pkix-attr-cert":["ac"],"application/pkix-cert":["cer"],"application/pkix-crl":["crl"],"application/pkix-pkipath":["pkipath"],"application/pkixcmp":["pki"],"application/pls+xml":["pls"],"application/postscript":["ai","eps","ps"],"application/provenance+xml":["provx"],"application/pskc+xml":["pskcxml"],"application/raml+yaml":["raml"],"application/rdf+xml":["rdf","owl"],"application/reginfo+xml":["rif"],"application/relax-ng-compact-syntax":["rnc"],"application/resource-lists+xml":["rl"],"application/resource-lists-diff+xml":["rld"],"application/rls-services+xml":["rs"],"application/route-apd+xml":["rapd"],"application/route-s-tsid+xml":["sls"],"application/route-usd+xml":["rusd"],"application/rpki-ghostbusters":["gbr"],"application/rpki-manifest":["mft"],"application/rpki-roa":["roa"],"application/rsd+xml":["rsd"],"application/rss+xml":["rss"],"application/rtf":["rtf"],"application/sbml+xml":["sbml"],"application/scvp-cv-request":["scq"],"application/scvp-cv-response":["scs"],"application/scvp-vp-request":["spq"],"application/scvp-vp-response":["spp"],"application/sdp":["sdp"],"application/senml+xml":["senmlx"],"application/sensml+xml":["sensmlx"],"application/set-payment-initiation":["setpay"],"application/set-registration-initiation":["setreg"],"application/shf+xml":["shf"],"application/sieve":["siv","sieve"],"application/smil+xml":["smi","smil"],"application/sparql-query":["rq"],"application/sparql-results+xml":["srx"],"application/srgs":["gram"],"application/srgs+xml":["grxml"],"application/sru+xml":["sru"],"application/ssdl+xml":["ssdl"],"application/ssml+xml":["ssml"],"application/swid+xml":["swidtag"],"application/tei+xml":["tei","teicorpus"],"application/thraud+xml":["tfi"],"application/timestamped-data":["tsd"],"application/toml":["toml"],"application/ttml+xml":["ttml"],"application/urc-ressheet+xml":["rsheet"],"application/voicexml+xml":["vxml"],"application/wasm":["wasm"],"application/widget":["wgt"],"application/winhlp":["hlp"],"application/wsdl+xml":["wsdl"],"application/wspolicy+xml":["wspolicy"],"application/xaml+xml":["xaml"],"application/xcap-att+xml":["xav"],"application/xcap-caps+xml":["xca"],"application/xcap-diff+xml":["xdf"],"application/xcap-el+xml":["xel"],"application/xcap-error+xml":["xer"],"application/xcap-ns+xml":["xns"],"application/xenc+xml":["xenc"],"application/xhtml+xml":["xhtml","xht"],"application/xliff+xml":["xlf"],"application/xml":["xml","xsl","xsd","rng"],"application/xml-dtd":["dtd"],"application/xop+xml":["xop"],"application/xproc+xml":["xpl"],"application/xslt+xml":["xslt"],"application/xspf+xml":["xspf"],"application/xv+xml":["mxml","xhvml","xvml","xvm"],"application/yang":["yang"],"application/yin+xml":["yin"],"application/zip":["zip"],"audio/3gpp":["*3gpp"],"audio/adpcm":["adp"],"audio/basic":["au","snd"],"audio/midi":["mid","midi","kar","rmi"],"audio/mobile-xmf":["mxmf"],"audio/mp3":["*mp3"],"audio/mp4":["m4a","mp4a"],"audio/mpeg":["mpga","mp2","mp2a","mp3","m2a","m3a"],"audio/ogg":["oga","ogg","spx"],"audio/s3m":["s3m"],"audio/silk":["sil"],"audio/wav":["wav"],"audio/wave":["*wav"],"audio/webm":["weba"],"audio/xm":["xm"],"font/collection":["ttc"],"font/otf":["otf"],"font/ttf":["ttf"],"font/woff":["woff"],"font/woff2":["woff2"],"image/aces":["exr"],"image/apng":["apng"],"image/bmp":["bmp"],"image/cgm":["cgm"],"image/dicom-rle":["drle"],"image/emf":["emf"],"image/fits":["fits"],"image/g3fax":["g3"],"image/gif":["gif"],"image/heic":["heic"],"image/heic-sequence":["heics"],"image/heif":["heif"],"image/heif-sequence":["heifs"],"image/hej2k":["hej2"],"image/hsj2":["hsj2"],"image/ief":["ief"],"image/jls":["jls"],"image/jp2":["jp2","jpg2"],"image/jpeg":["jpeg","jpg","jpe"],"image/jph":["jph"],"image/jphc":["jhc"],"image/jpm":["jpm"],"image/jpx":["jpx","jpf"],"image/jxr":["jxr"],"image/jxra":["jxra"],"image/jxrs":["jxrs"],"image/jxs":["jxs"],"image/jxsc":["jxsc"],"image/jxsi":["jxsi"],"image/jxss":["jxss"],"image/ktx":["ktx"],"image/png":["png"],"image/sgi":["sgi"],"image/svg+xml":["svg","svgz"],"image/t38":["t38"],"image/tiff":["tif","tiff"],"image/tiff-fx":["tfx"],"image/webp":["webp"],"image/wmf":["wmf"],"message/disposition-notification":["disposition-notification"],"message/global":["u8msg"],"message/global-delivery-status":["u8dsn"],"message/global-disposition-notification":["u8mdn"],"message/global-headers":["u8hdr"],"message/rfc822":["eml","mime"],"model/3mf":["3mf"],"model/gltf+json":["gltf"],"model/gltf-binary":["glb"],"model/iges":["igs","iges"],"model/mesh":["msh","mesh","silo"],"model/mtl":["mtl"],"model/obj":["obj"],"model/stl":["stl"],"model/vrml":["wrl","vrml"],"model/x3d+binary":["*x3db","x3dbz"],"model/x3d+fastinfoset":["x3db"],"model/x3d+vrml":["*x3dv","x3dvz"],"model/x3d+xml":["x3d","x3dz"],"model/x3d-vrml":["x3dv"],"text/cache-manifest":["appcache","manifest"],"text/calendar":["ics","ifb"],"text/coffeescript":["coffee","litcoffee"],"text/css":["css"],"text/csv":["csv"],"text/html":["html","htm","shtml"],"text/jade":["jade"],"text/jsx":["jsx"],"text/less":["less"],"text/markdown":["markdown","md"],"text/mathml":["mml"],"text/mdx":["mdx"],"text/n3":["n3"],"text/plain":["txt","text","conf","def","list","log","in","ini"],"text/richtext":["rtx"],"text/rtf":["*rtf"],"text/sgml":["sgml","sgm"],"text/shex":["shex"],"text/slim":["slim","slm"],"text/stylus":["stylus","styl"],"text/tab-separated-values":["tsv"],"text/troff":["t","tr","roff","man","me","ms"],"text/turtle":["ttl"],"text/uri-list":["uri","uris","urls"],"text/vcard":["vcard"],"text/vtt":["vtt"],"text/xml":["*xml"],"text/yaml":["yaml","yml"],"video/3gpp":["3gp","3gpp"],"video/3gpp2":["3g2"],"video/h261":["h261"],"video/h263":["h263"],"video/h264":["h264"],"video/jpeg":["jpgv"],"video/jpm":["*jpm","jpgm"],"video/mj2":["mj2","mjp2"],"video/mp2t":["ts"],"video/mp4":["mp4","mp4v","mpg4"],"video/mpeg":["mpeg","mpg","mpe","m1v","m2v"],"video/ogg":["ogv"],"video/quicktime":["qt","mov"],"video/webm":["webm"]};
},{}],314:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}

},{}],315:[function(require,module,exports){
(function (process){
// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":318}],316:[function(require,module,exports){
(function (global){
/*!
 * Platform.js v1.3.6
 * Copyright 2014-2020 Benjamin Tan
 * Copyright 2011-2013 John-David Dalton
 * Available under MIT license
 */
;(function() {
  'use strict';

  /** Used to determine if values are of the language type `Object`. */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Used as a reference to the global object. */
  var root = (objectTypes[typeof window] && window) || this;

  /** Backup possible global object. */
  var oldRoot = root;

  /** Detect free variable `exports`. */
  var freeExports = objectTypes[typeof exports] && exports;

  /** Detect free variable `module`. */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root`. */
  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }

  /**
   * Used as the maximum length of an array-like object.
   * See the [ES6 spec](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
   * for more details.
   */
  var maxSafeInteger = Math.pow(2, 53) - 1;

  /** Regular expression to detect Opera. */
  var reOpera = /\bOpera/;

  /** Possible global object. */
  var thisBinding = this;

  /** Used for native method references. */
  var objectProto = Object.prototype;

  /** Used to check for own properties of an object. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /** Used to resolve the internal `[[Class]]` of values. */
  var toString = objectProto.toString;

  /*--------------------------------------------------------------------------*/

  /**
   * Capitalizes a string value.
   *
   * @private
   * @param {string} string The string to capitalize.
   * @returns {string} The capitalized string.
   */
  function capitalize(string) {
    string = String(string);
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * A utility function to clean up the OS name.
   *
   * @private
   * @param {string} os The OS name to clean up.
   * @param {string} [pattern] A `RegExp` pattern matching the OS name.
   * @param {string} [label] A label for the OS.
   */
  function cleanupOS(os, pattern, label) {
    // Platform tokens are defined at:
    // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    // http://web.archive.org/web/20081122053950/http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    var data = {
      '10.0': '10',
      '6.4':  '10 Technical Preview',
      '6.3':  '8.1',
      '6.2':  '8',
      '6.1':  'Server 2008 R2 / 7',
      '6.0':  'Server 2008 / Vista',
      '5.2':  'Server 2003 / XP 64-bit',
      '5.1':  'XP',
      '5.01': '2000 SP1',
      '5.0':  '2000',
      '4.0':  'NT',
      '4.90': 'ME'
    };
    // Detect Windows version from platform tokens.
    if (pattern && label && /^Win/i.test(os) && !/^Windows Phone /i.test(os) &&
        (data = data[/[\d.]+$/.exec(os)])) {
      os = 'Windows ' + data;
    }
    // Correct character case and cleanup string.
    os = String(os);

    if (pattern && label) {
      os = os.replace(RegExp(pattern, 'i'), label);
    }

    os = format(
      os.replace(/ ce$/i, ' CE')
        .replace(/\bhpw/i, 'web')
        .replace(/\bMacintosh\b/, 'Mac OS')
        .replace(/_PowerPC\b/i, ' OS')
        .replace(/\b(OS X) [^ \d]+/i, '$1')
        .replace(/\bMac (OS X)\b/, '$1')
        .replace(/\/(\d)/, ' $1')
        .replace(/_/g, '.')
        .replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, '')
        .replace(/\bx86\.64\b/gi, 'x86_64')
        .replace(/\b(Windows Phone) OS\b/, '$1')
        .replace(/\b(Chrome OS \w+) [\d.]+\b/, '$1')
        .split(' on ')[0]
    );

    return os;
  }

  /**
   * An iteration utility for arrays and objects.
   *
   * @private
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   */
  function each(object, callback) {
    var index = -1,
        length = object ? object.length : 0;

    if (typeof length == 'number' && length > -1 && length <= maxSafeInteger) {
      while (++index < length) {
        callback(object[index], index, object);
      }
    } else {
      forOwn(object, callback);
    }
  }

  /**
   * Trim and conditionally capitalize string values.
   *
   * @private
   * @param {string} string The string to format.
   * @returns {string} The formatted string.
   */
  function format(string) {
    string = trim(string);
    return /^(?:webOS|i(?:OS|P))/.test(string)
      ? string
      : capitalize(string);
  }

  /**
   * Iterates over an object's own properties, executing the `callback` for each.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   */
  function forOwn(object, callback) {
    for (var key in object) {
      if (hasOwnProperty.call(object, key)) {
        callback(object[key], key, object);
      }
    }
  }

  /**
   * Gets the internal `[[Class]]` of a value.
   *
   * @private
   * @param {*} value The value.
   * @returns {string} The `[[Class]]`.
   */
  function getClassOf(value) {
    return value == null
      ? capitalize(value)
      : toString.call(value).slice(8, -1);
  }

  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of "object", "function", or "unknown".
   *
   * @private
   * @param {*} object The owner of the property.
   * @param {string} property The property to check.
   * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */
  function isHostType(object, property) {
    var type = object != null ? typeof object[property] : 'number';
    return !/^(?:boolean|number|string|undefined)$/.test(type) &&
      (type == 'object' ? !!object[property] : true);
  }

  /**
   * Prepares a string for use in a `RegExp` by making hyphens and spaces optional.
   *
   * @private
   * @param {string} string The string to qualify.
   * @returns {string} The qualified string.
   */
  function qualify(string) {
    return String(string).replace(/([ -])(?!$)/g, '$1?');
  }

  /**
   * A bare-bones `Array#reduce` like utility function.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @returns {*} The accumulated result.
   */
  function reduce(array, callback) {
    var accumulator = null;
    each(array, function(value, index) {
      accumulator = callback(accumulator, value, index, array);
    });
    return accumulator;
  }

  /**
   * Removes leading and trailing whitespace from a string.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} The trimmed string.
   */
  function trim(string) {
    return String(string).replace(/^ +| +$/g, '');
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a new platform object.
   *
   * @memberOf platform
   * @param {Object|string} [ua=navigator.userAgent] The user agent string or
   *  context object.
   * @returns {Object} A platform object.
   */
  function parse(ua) {

    /** The environment context object. */
    var context = root;

    /** Used to flag when a custom context is provided. */
    var isCustomContext = ua && typeof ua == 'object' && getClassOf(ua) != 'String';

    // Juggle arguments.
    if (isCustomContext) {
      context = ua;
      ua = null;
    }

    /** Browser navigator object. */
    var nav = context.navigator || {};

    /** Browser user agent string. */
    var userAgent = nav.userAgent || '';

    ua || (ua = userAgent);

    /** Used to flag when `thisBinding` is the [ModuleScope]. */
    var isModuleScope = isCustomContext || thisBinding == oldRoot;

    /** Used to detect if browser is like Chrome. */
    var likeChrome = isCustomContext
      ? !!nav.likeChrome
      : /\bChrome\b/.test(ua) && !/internal|\n/i.test(toString.toString());

    /** Internal `[[Class]]` value shortcuts. */
    var objectClass = 'Object',
        airRuntimeClass = isCustomContext ? objectClass : 'ScriptBridgingProxyObject',
        enviroClass = isCustomContext ? objectClass : 'Environment',
        javaClass = (isCustomContext && context.java) ? 'JavaPackage' : getClassOf(context.java),
        phantomClass = isCustomContext ? objectClass : 'RuntimeObject';

    /** Detect Java environments. */
    var java = /\bJava/.test(javaClass) && context.java;

    /** Detect Rhino. */
    var rhino = java && getClassOf(context.environment) == enviroClass;

    /** A character to represent alpha. */
    var alpha = java ? 'a' : '\u03b1';

    /** A character to represent beta. */
    var beta = java ? 'b' : '\u03b2';

    /** Browser document object. */
    var doc = context.document || {};

    /**
     * Detect Opera browser (Presto-based).
     * http://www.howtocreate.co.uk/operaStuff/operaObject.html
     * http://dev.opera.com/articles/view/opera-mini-web-content-authoring-guidelines/#operamini
     */
    var opera = context.operamini || context.opera;

    /** Opera `[[Class]]`. */
    var operaClass = reOpera.test(operaClass = (isCustomContext && opera) ? opera['[[Class]]'] : getClassOf(opera))
      ? operaClass
      : (opera = null);

    /*------------------------------------------------------------------------*/

    /** Temporary variable used over the script's lifetime. */
    var data;

    /** The CPU architecture. */
    var arch = ua;

    /** Platform description array. */
    var description = [];

    /** Platform alpha/beta indicator. */
    var prerelease = null;

    /** A flag to indicate that environment features should be used to resolve the platform. */
    var useFeatures = ua == userAgent;

    /** The browser/environment version. */
    var version = useFeatures && opera && typeof opera.version == 'function' && opera.version();

    /** A flag to indicate if the OS ends with "/ Version" */
    var isSpecialCasedOS;

    /* Detectable layout engines (order is important). */
    var layout = getLayout([
      { 'label': 'EdgeHTML', 'pattern': 'Edge' },
      'Trident',
      { 'label': 'WebKit', 'pattern': 'AppleWebKit' },
      'iCab',
      'Presto',
      'NetFront',
      'Tasman',
      'KHTML',
      'Gecko'
    ]);

    /* Detectable browser names (order is important). */
    var name = getName([
      'Adobe AIR',
      'Arora',
      'Avant Browser',
      'Breach',
      'Camino',
      'Electron',
      'Epiphany',
      'Fennec',
      'Flock',
      'Galeon',
      'GreenBrowser',
      'iCab',
      'Iceweasel',
      'K-Meleon',
      'Konqueror',
      'Lunascape',
      'Maxthon',
      { 'label': 'Microsoft Edge', 'pattern': '(?:Edge|Edg|EdgA|EdgiOS)' },
      'Midori',
      'Nook Browser',
      'PaleMoon',
      'PhantomJS',
      'Raven',
      'Rekonq',
      'RockMelt',
      { 'label': 'Samsung Internet', 'pattern': 'SamsungBrowser' },
      'SeaMonkey',
      { 'label': 'Silk', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Sleipnir',
      'SlimBrowser',
      { 'label': 'SRWare Iron', 'pattern': 'Iron' },
      'Sunrise',
      'Swiftfox',
      'Vivaldi',
      'Waterfox',
      'WebPositive',
      { 'label': 'Yandex Browser', 'pattern': 'YaBrowser' },
      { 'label': 'UC Browser', 'pattern': 'UCBrowser' },
      'Opera Mini',
      { 'label': 'Opera Mini', 'pattern': 'OPiOS' },
      'Opera',
      { 'label': 'Opera', 'pattern': 'OPR' },
      'Chromium',
      'Chrome',
      { 'label': 'Chrome', 'pattern': '(?:HeadlessChrome)' },
      { 'label': 'Chrome Mobile', 'pattern': '(?:CriOS|CrMo)' },
      { 'label': 'Firefox', 'pattern': '(?:Firefox|Minefield)' },
      { 'label': 'Firefox for iOS', 'pattern': 'FxiOS' },
      { 'label': 'IE', 'pattern': 'IEMobile' },
      { 'label': 'IE', 'pattern': 'MSIE' },
      'Safari'
    ]);

    /* Detectable products (order is important). */
    var product = getProduct([
      { 'label': 'BlackBerry', 'pattern': 'BB10' },
      'BlackBerry',
      { 'label': 'Galaxy S', 'pattern': 'GT-I9000' },
      { 'label': 'Galaxy S2', 'pattern': 'GT-I9100' },
      { 'label': 'Galaxy S3', 'pattern': 'GT-I9300' },
      { 'label': 'Galaxy S4', 'pattern': 'GT-I9500' },
      { 'label': 'Galaxy S5', 'pattern': 'SM-G900' },
      { 'label': 'Galaxy S6', 'pattern': 'SM-G920' },
      { 'label': 'Galaxy S6 Edge', 'pattern': 'SM-G925' },
      { 'label': 'Galaxy S7', 'pattern': 'SM-G930' },
      { 'label': 'Galaxy S7 Edge', 'pattern': 'SM-G935' },
      'Google TV',
      'Lumia',
      'iPad',
      'iPod',
      'iPhone',
      'Kindle',
      { 'label': 'Kindle Fire', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Nexus',
      'Nook',
      'PlayBook',
      'PlayStation Vita',
      'PlayStation',
      'TouchPad',
      'Transformer',
      { 'label': 'Wii U', 'pattern': 'WiiU' },
      'Wii',
      'Xbox One',
      { 'label': 'Xbox 360', 'pattern': 'Xbox' },
      'Xoom'
    ]);

    /* Detectable manufacturers. */
    var manufacturer = getManufacturer({
      'Apple': { 'iPad': 1, 'iPhone': 1, 'iPod': 1 },
      'Alcatel': {},
      'Archos': {},
      'Amazon': { 'Kindle': 1, 'Kindle Fire': 1 },
      'Asus': { 'Transformer': 1 },
      'Barnes & Noble': { 'Nook': 1 },
      'BlackBerry': { 'PlayBook': 1 },
      'Google': { 'Google TV': 1, 'Nexus': 1 },
      'HP': { 'TouchPad': 1 },
      'HTC': {},
      'Huawei': {},
      'Lenovo': {},
      'LG': {},
      'Microsoft': { 'Xbox': 1, 'Xbox One': 1 },
      'Motorola': { 'Xoom': 1 },
      'Nintendo': { 'Wii U': 1,  'Wii': 1 },
      'Nokia': { 'Lumia': 1 },
      'Oppo': {},
      'Samsung': { 'Galaxy S': 1, 'Galaxy S2': 1, 'Galaxy S3': 1, 'Galaxy S4': 1 },
      'Sony': { 'PlayStation': 1, 'PlayStation Vita': 1 },
      'Xiaomi': { 'Mi': 1, 'Redmi': 1 }
    });

    /* Detectable operating systems (order is important). */
    var os = getOS([
      'Windows Phone',
      'KaiOS',
      'Android',
      'CentOS',
      { 'label': 'Chrome OS', 'pattern': 'CrOS' },
      'Debian',
      { 'label': 'DragonFly BSD', 'pattern': 'DragonFly' },
      'Fedora',
      'FreeBSD',
      'Gentoo',
      'Haiku',
      'Kubuntu',
      'Linux Mint',
      'OpenBSD',
      'Red Hat',
      'SuSE',
      'Ubuntu',
      'Xubuntu',
      'Cygwin',
      'Symbian OS',
      'hpwOS',
      'webOS ',
      'webOS',
      'Tablet OS',
      'Tizen',
      'Linux',
      'Mac OS X',
      'Macintosh',
      'Mac',
      'Windows 98;',
      'Windows '
    ]);

    /*------------------------------------------------------------------------*/

    /**
     * Picks the layout engine from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected layout engine.
     */
    function getLayout(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the manufacturer from an array of guesses.
     *
     * @private
     * @param {Array} guesses An object of guesses.
     * @returns {null|string} The detected manufacturer.
     */
    function getManufacturer(guesses) {
      return reduce(guesses, function(result, value, key) {
        // Lookup the manufacturer by product or scan the UA for the manufacturer.
        return result || (
          value[product] ||
          value[/^[a-z]+(?: +[a-z]+\b)*/i.exec(product)] ||
          RegExp('\\b' + qualify(key) + '(?:\\b|\\w*\\d)', 'i').exec(ua)
        ) && key;
      });
    }

    /**
     * Picks the browser name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected browser name.
     */
    function getName(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the OS name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected OS name.
     */
    function getOS(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua)
            )) {
          result = cleanupOS(result, pattern, guess.label || guess);
        }
        return result;
      });
    }

    /**
     * Picks the product name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected product name.
     */
    function getProduct(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + ' *\\d+[.\\w_]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + ' *\\w+-[\\w]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + '(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)', 'i').exec(ua)
            )) {
          // Split by forward slash and append product version if needed.
          if ((result = String((guess.label && !RegExp(pattern, 'i').test(guess.label)) ? guess.label : result).split('/'))[1] && !/[\d.]+/.test(result[0])) {
            result[0] += ' ' + result[1];
          }
          // Correct character case and cleanup string.
          guess = guess.label || guess;
          result = format(result[0]
            .replace(RegExp(pattern, 'i'), guess)
            .replace(RegExp('; *(?:' + guess + '[_-])?', 'i'), ' ')
            .replace(RegExp('(' + guess + ')[-_.]?(\\w)', 'i'), '$1 $2'));
        }
        return result;
      });
    }

    /**
     * Resolves the version using an array of UA patterns.
     *
     * @private
     * @param {Array} patterns An array of UA patterns.
     * @returns {null|string} The detected version.
     */
    function getVersion(patterns) {
      return reduce(patterns, function(result, pattern) {
        return result || (RegExp(pattern +
          '(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)', 'i').exec(ua) || 0)[1] || null;
      });
    }

    /**
     * Returns `platform.description` when the platform object is coerced to a string.
     *
     * @name toString
     * @memberOf platform
     * @returns {string} Returns `platform.description` if available, else an empty string.
     */
    function toStringPlatform() {
      return this.description || '';
    }

    /*------------------------------------------------------------------------*/

    // Convert layout to an array so we can add extra details.
    layout && (layout = [layout]);

    // Detect Android products.
    // Browsers on Android devices typically provide their product IDS after "Android;"
    // up to "Build" or ") AppleWebKit".
    // Example:
    // "Mozilla/5.0 (Linux; Android 8.1.0; Moto G (5) Plus) AppleWebKit/537.36
    // (KHTML, like Gecko) Chrome/70.0.3538.80 Mobile Safari/537.36"
    if (/\bAndroid\b/.test(os) && !product &&
        (data = /\bAndroid[^;]*;(.*?)(?:Build|\) AppleWebKit)\b/i.exec(ua))) {
      product = trim(data[1])
        // Replace any language codes (eg. "en-US").
        .replace(/^[a-z]{2}-[a-z]{2};\s*/i, '')
        || null;
    }
    // Detect product names that contain their manufacturer's name.
    if (manufacturer && !product) {
      product = getProduct([manufacturer]);
    } else if (manufacturer && product) {
      product = product
        .replace(RegExp('^(' + qualify(manufacturer) + ')[-_.\\s]', 'i'), manufacturer + ' ')
        .replace(RegExp('^(' + qualify(manufacturer) + ')[-_.]?(\\w)', 'i'), manufacturer + ' $2');
    }
    // Clean up Google TV.
    if ((data = /\bGoogle TV\b/.exec(product))) {
      product = data[0];
    }
    // Detect simulators.
    if (/\bSimulator\b/i.test(ua)) {
      product = (product ? product + ' ' : '') + 'Simulator';
    }
    // Detect Opera Mini 8+ running in Turbo/Uncompressed mode on iOS.
    if (name == 'Opera Mini' && /\bOPiOS\b/.test(ua)) {
      description.push('running in Turbo/Uncompressed mode');
    }
    // Detect IE Mobile 11.
    if (name == 'IE' && /\blike iPhone OS\b/.test(ua)) {
      data = parse(ua.replace(/like iPhone OS/, ''));
      manufacturer = data.manufacturer;
      product = data.product;
    }
    // Detect iOS.
    else if (/^iP/.test(product)) {
      name || (name = 'Safari');
      os = 'iOS' + ((data = / OS ([\d_]+)/i.exec(ua))
        ? ' ' + data[1].replace(/_/g, '.')
        : '');
    }
    // Detect Kubuntu.
    else if (name == 'Konqueror' && /^Linux\b/i.test(os)) {
      os = 'Kubuntu';
    }
    // Detect Android browsers.
    else if ((manufacturer && manufacturer != 'Google' &&
        ((/Chrome/.test(name) && !/\bMobile Safari\b/i.test(ua)) || /\bVita\b/.test(product))) ||
        (/\bAndroid\b/.test(os) && /^Chrome/.test(name) && /\bVersion\//i.test(ua))) {
      name = 'Android Browser';
      os = /\bAndroid\b/.test(os) ? os : 'Android';
    }
    // Detect Silk desktop/accelerated modes.
    else if (name == 'Silk') {
      if (!/\bMobi/i.test(ua)) {
        os = 'Android';
        description.unshift('desktop mode');
      }
      if (/Accelerated *= *true/i.test(ua)) {
        description.unshift('accelerated');
      }
    }
    // Detect UC Browser speed mode.
    else if (name == 'UC Browser' && /\bUCWEB\b/.test(ua)) {
      description.push('speed mode');
    }
    // Detect PaleMoon identifying as Firefox.
    else if (name == 'PaleMoon' && (data = /\bFirefox\/([\d.]+)\b/.exec(ua))) {
      description.push('identifying as Firefox ' + data[1]);
    }
    // Detect Firefox OS and products running Firefox.
    else if (name == 'Firefox' && (data = /\b(Mobile|Tablet|TV)\b/i.exec(ua))) {
      os || (os = 'Firefox OS');
      product || (product = data[1]);
    }
    // Detect false positives for Firefox/Safari.
    else if (!name || (data = !/\bMinefield\b/i.test(ua) && /\b(?:Firefox|Safari)\b/.exec(name))) {
      // Escape the `/` for Firefox 1.
      if (name && !product && /[\/,]|^[^(]+?\)/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
        // Clear name of false positives.
        name = null;
      }
      // Reassign a generic name.
      if ((data = product || manufacturer || os) &&
          (product || manufacturer || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(os))) {
        name = /[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(os) ? os : data) + ' Browser';
      }
    }
    // Add Chrome version to description for Electron.
    else if (name == 'Electron' && (data = (/\bChrome\/([\d.]+)\b/.exec(ua) || 0)[1])) {
      description.push('Chromium ' + data);
    }
    // Detect non-Opera (Presto-based) versions (order is important).
    if (!version) {
      version = getVersion([
        '(?:Cloud9|CriOS|CrMo|Edge|Edg|EdgA|EdgiOS|FxiOS|HeadlessChrome|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|SamsungBrowser|Silk(?!/[\\d.]+$)|UCBrowser|YaBrowser)',
        'Version',
        qualify(name),
        '(?:Firefox|Minefield|NetFront)'
      ]);
    }
    // Detect stubborn layout engines.
    if ((data =
          layout == 'iCab' && parseFloat(version) > 3 && 'WebKit' ||
          /\bOpera\b/.test(name) && (/\bOPR\b/.test(ua) ? 'Blink' : 'Presto') ||
          /\b(?:Midori|Nook|Safari)\b/i.test(ua) && !/^(?:Trident|EdgeHTML)$/.test(layout) && 'WebKit' ||
          !layout && /\bMSIE\b/i.test(ua) && (os == 'Mac OS' ? 'Tasman' : 'Trident') ||
          layout == 'WebKit' && /\bPlayStation\b(?! Vita\b)/i.test(name) && 'NetFront'
        )) {
      layout = [data];
    }
    // Detect Windows Phone 7 desktop mode.
    if (name == 'IE' && (data = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(ua) || 0)[1])) {
      name += ' Mobile';
      os = 'Windows Phone ' + (/\+$/.test(data) ? data : data + '.x');
      description.unshift('desktop mode');
    }
    // Detect Windows Phone 8.x desktop mode.
    else if (/\bWPDesktop\b/i.test(ua)) {
      name = 'IE Mobile';
      os = 'Windows Phone 8.x';
      description.unshift('desktop mode');
      version || (version = (/\brv:([\d.]+)/.exec(ua) || 0)[1]);
    }
    // Detect IE 11 identifying as other browsers.
    else if (name != 'IE' && layout == 'Trident' && (data = /\brv:([\d.]+)/.exec(ua))) {
      if (name) {
        description.push('identifying as ' + name + (version ? ' ' + version : ''));
      }
      name = 'IE';
      version = data[1];
    }
    // Leverage environment features.
    if (useFeatures) {
      // Detect server-side environments.
      // Rhino has a global function while others have a global object.
      if (isHostType(context, 'global')) {
        if (java) {
          data = java.lang.System;
          arch = data.getProperty('os.arch');
          os = os || data.getProperty('os.name') + ' ' + data.getProperty('os.version');
        }
        if (rhino) {
          try {
            version = context.require('ringo/engine').version.join('.');
            name = 'RingoJS';
          } catch(e) {
            if ((data = context.system) && data.global.system == context.system) {
              name = 'Narwhal';
              os || (os = data[0].os || null);
            }
          }
          if (!name) {
            name = 'Rhino';
          }
        }
        else if (
          typeof context.process == 'object' && !context.process.browser &&
          (data = context.process)
        ) {
          if (typeof data.versions == 'object') {
            if (typeof data.versions.electron == 'string') {
              description.push('Node ' + data.versions.node);
              name = 'Electron';
              version = data.versions.electron;
            } else if (typeof data.versions.nw == 'string') {
              description.push('Chromium ' + version, 'Node ' + data.versions.node);
              name = 'NW.js';
              version = data.versions.nw;
            }
          }
          if (!name) {
            name = 'Node.js';
            arch = data.arch;
            os = data.platform;
            version = /[\d.]+/.exec(data.version);
            version = version ? version[0] : null;
          }
        }
      }
      // Detect Adobe AIR.
      else if (getClassOf((data = context.runtime)) == airRuntimeClass) {
        name = 'Adobe AIR';
        os = data.flash.system.Capabilities.os;
      }
      // Detect PhantomJS.
      else if (getClassOf((data = context.phantom)) == phantomClass) {
        name = 'PhantomJS';
        version = (data = data.version || null) && (data.major + '.' + data.minor + '.' + data.patch);
      }
      // Detect IE compatibility modes.
      else if (typeof doc.documentMode == 'number' && (data = /\bTrident\/(\d+)/i.exec(ua))) {
        // We're in compatibility mode when the Trident version + 4 doesn't
        // equal the document mode.
        version = [version, doc.documentMode];
        if ((data = +data[1] + 4) != version[1]) {
          description.push('IE ' + version[1] + ' mode');
          layout && (layout[1] = '');
          version[1] = data;
        }
        version = name == 'IE' ? String(version[1].toFixed(1)) : version[0];
      }
      // Detect IE 11 masking as other browsers.
      else if (typeof doc.documentMode == 'number' && /^(?:Chrome|Firefox)\b/.test(name)) {
        description.push('masking as ' + name + ' ' + version);
        name = 'IE';
        version = '11.0';
        layout = ['Trident'];
        os = 'Windows';
      }
      os = os && format(os);
    }
    // Detect prerelease phases.
    if (version && (data =
          /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) ||
          /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + (useFeatures && nav.appMinorVersion)) ||
          /\bMinefield\b/i.test(ua) && 'a'
        )) {
      prerelease = /b/i.test(data) ? 'beta' : 'alpha';
      version = version.replace(RegExp(data + '\\+?$'), '') +
        (prerelease == 'beta' ? beta : alpha) + (/\d+\+?/.exec(data) || '');
    }
    // Detect Firefox Mobile.
    if (name == 'Fennec' || name == 'Firefox' && /\b(?:Android|Firefox OS|KaiOS)\b/.test(os)) {
      name = 'Firefox Mobile';
    }
    // Obscure Maxthon's unreliable version.
    else if (name == 'Maxthon' && version) {
      version = version.replace(/\.[\d.]+/, '.x');
    }
    // Detect Xbox 360 and Xbox One.
    else if (/\bXbox\b/i.test(product)) {
      if (product == 'Xbox 360') {
        os = null;
      }
      if (product == 'Xbox 360' && /\bIEMobile\b/.test(ua)) {
        description.unshift('mobile mode');
      }
    }
    // Add mobile postfix.
    else if ((/^(?:Chrome|IE|Opera)$/.test(name) || name && !product && !/Browser|Mobi/.test(name)) &&
        (os == 'Windows CE' || /Mobi/i.test(ua))) {
      name += ' Mobile';
    }
    // Detect IE platform preview.
    else if (name == 'IE' && useFeatures) {
      try {
        if (context.external === null) {
          description.unshift('platform preview');
        }
      } catch(e) {
        description.unshift('embedded');
      }
    }
    // Detect BlackBerry OS version.
    // http://docs.blackberry.com/en/developers/deliverables/18169/HTTP_headers_sent_by_BB_Browser_1234911_11.jsp
    else if ((/\bBlackBerry\b/.test(product) || /\bBB10\b/.test(ua)) && (data =
          (RegExp(product.replace(/ +/g, ' *') + '/([.\\d]+)', 'i').exec(ua) || 0)[1] ||
          version
        )) {
      data = [data, /BB10/.test(ua)];
      os = (data[1] ? (product = null, manufacturer = 'BlackBerry') : 'Device Software') + ' ' + data[0];
      version = null;
    }
    // Detect Opera identifying/masking itself as another browser.
    // http://www.opera.com/support/kb/view/843/
    else if (this != forOwn && product != 'Wii' && (
          (useFeatures && opera) ||
          (/Opera/.test(name) && /\b(?:MSIE|Firefox)\b/i.test(ua)) ||
          (name == 'Firefox' && /\bOS X (?:\d+\.){2,}/.test(os)) ||
          (name == 'IE' && (
            (os && !/^Win/.test(os) && version > 5.5) ||
            /\bWindows XP\b/.test(os) && version > 8 ||
            version == 8 && !/\bTrident\b/.test(ua)
          ))
        ) && !reOpera.test((data = parse.call(forOwn, ua.replace(reOpera, '') + ';'))) && data.name) {
      // When "identifying", the UA contains both Opera and the other browser's name.
      data = 'ing as ' + data.name + ((data = data.version) ? ' ' + data : '');
      if (reOpera.test(name)) {
        if (/\bIE\b/.test(data) && os == 'Mac OS') {
          os = null;
        }
        data = 'identify' + data;
      }
      // When "masking", the UA contains only the other browser's name.
      else {
        data = 'mask' + data;
        if (operaClass) {
          name = format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
        } else {
          name = 'Opera';
        }
        if (/\bIE\b/.test(data)) {
          os = null;
        }
        if (!useFeatures) {
          version = null;
        }
      }
      layout = ['Presto'];
      description.push(data);
    }
    // Detect WebKit Nightly and approximate Chrome/Safari versions.
    if ((data = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
      // Correct build number for numeric comparison.
      // (e.g. "532.5" becomes "532.05")
      data = [parseFloat(data.replace(/\.(\d)$/, '.0$1')), data];
      // Nightly builds are postfixed with a "+".
      if (name == 'Safari' && data[1].slice(-1) == '+') {
        name = 'WebKit Nightly';
        prerelease = 'alpha';
        version = data[1].slice(0, -1);
      }
      // Clear incorrect browser versions.
      else if (version == data[1] ||
          version == (data[2] = (/\bSafari\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
        version = null;
      }
      // Use the full Chrome version when available.
      data[1] = (/\b(?:Headless)?Chrome\/([\d.]+)/i.exec(ua) || 0)[1];
      // Detect Blink layout engine.
      if (data[0] == 537.36 && data[2] == 537.36 && parseFloat(data[1]) >= 28 && layout == 'WebKit') {
        layout = ['Blink'];
      }
      // Detect JavaScriptCore.
      // http://stackoverflow.com/questions/6768474/how-can-i-detect-which-javascript-engine-v8-or-jsc-is-used-at-runtime-in-androi
      if (!useFeatures || (!likeChrome && !data[1])) {
        layout && (layout[1] = 'like Safari');
        data = (data = data[0], data < 400 ? 1 : data < 500 ? 2 : data < 526 ? 3 : data < 533 ? 4 : data < 534 ? '4+' : data < 535 ? 5 : data < 537 ? 6 : data < 538 ? 7 : data < 601 ? 8 : data < 602 ? 9 : data < 604 ? 10 : data < 606 ? 11 : data < 608 ? 12 : '12');
      } else {
        layout && (layout[1] = 'like Chrome');
        data = data[1] || (data = data[0], data < 530 ? 1 : data < 532 ? 2 : data < 532.05 ? 3 : data < 533 ? 4 : data < 534.03 ? 5 : data < 534.07 ? 6 : data < 534.10 ? 7 : data < 534.13 ? 8 : data < 534.16 ? 9 : data < 534.24 ? 10 : data < 534.30 ? 11 : data < 535.01 ? 12 : data < 535.02 ? '13+' : data < 535.07 ? 15 : data < 535.11 ? 16 : data < 535.19 ? 17 : data < 536.05 ? 18 : data < 536.10 ? 19 : data < 537.01 ? 20 : data < 537.11 ? '21+' : data < 537.13 ? 23 : data < 537.18 ? 24 : data < 537.24 ? 25 : data < 537.36 ? 26 : layout != 'Blink' ? '27' : '28');
      }
      // Add the postfix of ".x" or "+" for approximate versions.
      layout && (layout[1] += ' ' + (data += typeof data == 'number' ? '.x' : /[.+]/.test(data) ? '' : '+'));
      // Obscure version for some Safari 1-2 releases.
      if (name == 'Safari' && (!version || parseInt(version) > 45)) {
        version = data;
      } else if (name == 'Chrome' && /\bHeadlessChrome/i.test(ua)) {
        description.unshift('headless');
      }
    }
    // Detect Opera desktop modes.
    if (name == 'Opera' &&  (data = /\bzbov|zvav$/.exec(os))) {
      name += ' ';
      description.unshift('desktop mode');
      if (data == 'zvav') {
        name += 'Mini';
        version = null;
      } else {
        name += 'Mobile';
      }
      os = os.replace(RegExp(' *' + data + '$'), '');
    }
    // Detect Chrome desktop mode.
    else if (name == 'Safari' && /\bChrome\b/.exec(layout && layout[1])) {
      description.unshift('desktop mode');
      name = 'Chrome Mobile';
      version = null;

      if (/\bOS X\b/.test(os)) {
        manufacturer = 'Apple';
        os = 'iOS 4.3+';
      } else {
        os = null;
      }
    }
    // Newer versions of SRWare Iron uses the Chrome tag to indicate its version number.
    else if (/\bSRWare Iron\b/.test(name) && !version) {
      version = getVersion('Chrome');
    }
    // Strip incorrect OS versions.
    if (version && version.indexOf((data = /[\d.]+$/.exec(os))) == 0 &&
        ua.indexOf('/' + data + '-') > -1) {
      os = trim(os.replace(data, ''));
    }
    // Ensure OS does not include the browser name.
    if (os && os.indexOf(name) != -1 && !RegExp(name + ' OS').test(os)) {
      os = os.replace(RegExp(' *' + qualify(name) + ' *'), '');
    }
    // Add layout engine.
    if (layout && !/\b(?:Avant|Nook)\b/.test(name) && (
        /Browser|Lunascape|Maxthon/.test(name) ||
        name != 'Safari' && /^iOS/.test(os) && /\bSafari\b/.test(layout[1]) ||
        /^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Samsung Internet|Sleipnir|SRWare Iron|Vivaldi|Web)/.test(name) && layout[1])) {
      // Don't add layout details to description if they are falsey.
      (data = layout[layout.length - 1]) && description.push(data);
    }
    // Combine contextual information.
    if (description.length) {
      description = ['(' + description.join('; ') + ')'];
    }
    // Append manufacturer to description.
    if (manufacturer && product && product.indexOf(manufacturer) < 0) {
      description.push('on ' + manufacturer);
    }
    // Append product to description.
    if (product) {
      description.push((/^on /.test(description[description.length - 1]) ? '' : 'on ') + product);
    }
    // Parse the OS into an object.
    if (os) {
      data = / ([\d.+]+)$/.exec(os);
      isSpecialCasedOS = data && os.charAt(os.length - data[0].length - 1) == '/';
      os = {
        'architecture': 32,
        'family': (data && !isSpecialCasedOS) ? os.replace(data[0], '') : os,
        'version': data ? data[1] : null,
        'toString': function() {
          var version = this.version;
          return this.family + ((version && !isSpecialCasedOS) ? ' ' + version : '') + (this.architecture == 64 ? ' 64-bit' : '');
        }
      };
    }
    // Add browser/OS architecture.
    if ((data = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(arch)) && !/\bi686\b/i.test(arch)) {
      if (os) {
        os.architecture = 64;
        os.family = os.family.replace(RegExp(' *' + data), '');
      }
      if (
          name && (/\bWOW64\b/i.test(ua) ||
          (useFeatures && /\w(?:86|32)$/.test(nav.cpuClass || nav.platform) && !/\bWin64; x64\b/i.test(ua)))
      ) {
        description.unshift('32-bit');
      }
    }
    // Chrome 39 and above on OS X is always 64-bit.
    else if (
        os && /^OS X/.test(os.family) &&
        name == 'Chrome' && parseFloat(version) >= 39
    ) {
      os.architecture = 64;
    }

    ua || (ua = null);

    /*------------------------------------------------------------------------*/

    /**
     * The platform object.
     *
     * @name platform
     * @type Object
     */
    var platform = {};

    /**
     * The platform description.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.description = ua;

    /**
     * The name of the browser's layout engine.
     *
     * The list of common layout engines include:
     * "Blink", "EdgeHTML", "Gecko", "Trident" and "WebKit"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.layout = layout && layout[0];

    /**
     * The name of the product's manufacturer.
     *
     * The list of manufacturers include:
     * "Apple", "Archos", "Amazon", "Asus", "Barnes & Noble", "BlackBerry",
     * "Google", "HP", "HTC", "LG", "Microsoft", "Motorola", "Nintendo",
     * "Nokia", "Samsung" and "Sony"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.manufacturer = manufacturer;

    /**
     * The name of the browser/environment.
     *
     * The list of common browser names include:
     * "Chrome", "Electron", "Firefox", "Firefox for iOS", "IE",
     * "Microsoft Edge", "PhantomJS", "Safari", "SeaMonkey", "Silk",
     * "Opera Mini" and "Opera"
     *
     * Mobile versions of some browsers have "Mobile" appended to their name:
     * eg. "Chrome Mobile", "Firefox Mobile", "IE Mobile" and "Opera Mobile"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.name = name;

    /**
     * The alpha/beta release indicator.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.prerelease = prerelease;

    /**
     * The name of the product hosting the browser.
     *
     * The list of common products include:
     *
     * "BlackBerry", "Galaxy S4", "Lumia", "iPad", "iPod", "iPhone", "Kindle",
     * "Kindle Fire", "Nexus", "Nook", "PlayBook", "TouchPad" and "Transformer"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.product = product;

    /**
     * The browser's user agent string.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.ua = ua;

    /**
     * The browser/environment version.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.version = name && version;

    /**
     * The name of the operating system.
     *
     * @memberOf platform
     * @type Object
     */
    platform.os = os || {

      /**
       * The CPU architecture the OS is built for.
       *
       * @memberOf platform.os
       * @type number|null
       */
      'architecture': null,

      /**
       * The family of the OS.
       *
       * Common values include:
       * "Windows", "Windows Server 2008 R2 / 7", "Windows Server 2008 / Vista",
       * "Windows XP", "OS X", "Linux", "Ubuntu", "Debian", "Fedora", "Red Hat",
       * "SuSE", "Android", "iOS" and "Windows Phone"
       *
       * @memberOf platform.os
       * @type string|null
       */
      'family': null,

      /**
       * The version of the OS.
       *
       * @memberOf platform.os
       * @type string|null
       */
      'version': null,

      /**
       * Returns the OS string.
       *
       * @memberOf platform.os
       * @returns {string} The OS string.
       */
      'toString': function() { return 'null'; }
    };

    platform.parse = parse;
    platform.toString = toStringPlatform;

    if (platform.version) {
      description.unshift(version);
    }
    if (platform.name) {
      description.unshift(name);
    }
    if (os && name && !(os == String(os).split(' ')[0] && (os == name.split(' ')[0] || product))) {
      description.push(product ? '(' + os + ')' : 'on ' + os);
    }
    if (description.length) {
      platform.description = description.join(' ');
    }
    return platform;
  }

  /*--------------------------------------------------------------------------*/

  // Export platform.
  var platform = parse();

  // Some AMD build optimizers, like r.js, check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose platform on the global object to prevent errors when platform is
    // loaded by a script tag in the presence of an AMD loader.
    // See http://requirejs.org/docs/errors.html#mismatch for more details.
    root.platform = platform;

    // Define as an anonymous module so platform can be aliased through path mapping.
    define(function() {
      return platform;
    });
  }
  // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
  else if (freeExports && freeModule) {
    // Export for CommonJS support.
    forOwn(platform, function(value, key) {
      freeExports[key] = value;
    });
  }
  else {
    // Export to the global object.
    root.platform = platform;
  }
}.call(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],317:[function(require,module,exports){
(function (process){
'use strict';

if (typeof process === 'undefined' ||
    !process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = { nextTick: nextTick };
} else {
  module.exports = process
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}


}).call(this,require('_process'))
},{"_process":318}],318:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],319:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],320:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],321:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],322:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":320,"./encode":321}],323:[function(require,module,exports){
module.exports = require('./lib/_stream_duplex.js');

},{"./lib/_stream_duplex.js":324}],324:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pna = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var objectKeys = _keys2.default || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = (0, _create2.default)(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

{
  // avoid scope creep, the keys array can then be collected
  var keys = objectKeys(Writable.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  pna.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function get() {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  pna.nextTick(cb, err);
};

},{"./_stream_readable":326,"./_stream_writable":328,"babel-runtime/core-js/object/create":157,"babel-runtime/core-js/object/keys":161,"core-util-is":299,"inherits":306,"process-nextick-args":317}],325:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = (0, _create2.default)(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};

},{"./_stream_transform":327,"babel-runtime/core-js/object/create":157,"core-util-is":299,"inherits":306}],326:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pna = require('process-nextick-args');
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function EElistenerCount(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

/*<replacement>*/
var util = (0, _create2.default)(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function debug() {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var destroyImpl = require('./internal/streams/destroy');
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var readableHwm = options.readableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function get() {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && (0, _getPrototypeOf2.default)(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) pna.nextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    pna.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) pna.nextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, unpipeInfo);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        pna.nextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    pna.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;

  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  this._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.highWaterMark;
  }
});

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    pna.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_stream_duplex":324,"./internal/streams/BufferList":329,"./internal/streams/destroy":330,"./internal/streams/stream":331,"_process":318,"babel-runtime/core-js/object/create":157,"babel-runtime/core-js/object/get-prototype-of":160,"core-util-is":299,"events":302,"inherits":306,"isarray":308,"process-nextick-args":317,"safe-buffer":332,"string_decoder/":333,"util":179}],327:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = (0, _create2.default)(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return this.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);

  cb(er);

  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function') {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this2 = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this2.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');

  if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}

},{"./_stream_duplex":324,"babel-runtime/core-js/object/create":157,"core-util-is":299,"inherits":306}],328:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

/*<replacement>*/

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _hasInstance = require('babel-runtime/core-js/symbol/has-instance');

var _hasInstance2 = _interopRequireDefault(_hasInstance);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _setImmediate2 = require('babel-runtime/core-js/set-immediate');

var _setImmediate3 = _interopRequireDefault(_setImmediate2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pna = require('process-nextick-args');
/*</replacement>*/

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? _setImmediate3.default : pna.nextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = (0, _create2.default)(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

var destroyImpl = require('./internal/streams/destroy');

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var writableHwm = options.writableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof _symbol2.default === 'function' && _hasInstance2.default && typeof Function.prototype[_hasInstance2.default] === 'function') {
  realHasInstance = Function.prototype[_hasInstance2.default];
  (0, _defineProperty2.default)(Writable, _hasInstance2.default, {
    value: function value(object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function realHasInstance(object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;

    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  pna.nextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    pna.nextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    pna.nextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    pna.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      stream.emit('error', err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      pna.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) pna.nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }
  if (state.corkedRequestsFree) {
    state.corkedRequestsFree.next = corkReq;
  } else {
    state.corkedRequestsFree = corkReq;
  }
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function get() {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});

Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_stream_duplex":324,"./internal/streams/destroy":330,"./internal/streams/stream":331,"_process":318,"babel-runtime/core-js/object/create":157,"babel-runtime/core-js/object/define-property":158,"babel-runtime/core-js/set-immediate":164,"babel-runtime/core-js/symbol":165,"babel-runtime/core-js/symbol/has-instance":166,"core-util-is":299,"inherits":306,"process-nextick-args":317,"safe-buffer":332,"util-deprecate":342}],329:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Buffer = require('safe-buffer').Buffer;
var util = require('util');

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();

if (util && util.inspect && util.inspect.custom) {
  module.exports.prototype[util.inspect.custom] = function () {
    var obj = util.inspect({ length: this.length });
    return this.constructor.name + ' ' + obj;
  };
}

},{"safe-buffer":332,"util":179}],330:[function(require,module,exports){
'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      pna.nextTick(emitErrorNT, this, err);
    }
    return this;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      pna.nextTick(emitErrorNT, _this, err);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err);
    }
  });

  return this;
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};

},{"process-nextick-args":317}],331:[function(require,module,exports){
'use strict';

module.exports = require('events').EventEmitter;

},{"events":302}],332:[function(require,module,exports){
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":184}],333:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\uFFFD';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\uFFFD';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\uFFFD';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\uFFFD';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}

},{"safe-buffer":332}],334:[function(require,module,exports){
module.exports = require('./readable').PassThrough

},{"./readable":335}],335:[function(require,module,exports){
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":324,"./lib/_stream_passthrough.js":325,"./lib/_stream_readable.js":326,"./lib/_stream_transform.js":327,"./lib/_stream_writable.js":328}],336:[function(require,module,exports){
module.exports = require('./readable').Transform

},{"./readable":335}],337:[function(require,module,exports){
module.exports = require('./lib/_stream_writable.js');

},{"./lib/_stream_writable.js":328}],338:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/readable.js');
Stream.Writable = require('readable-stream/writable.js');
Stream.Duplex = require('readable-stream/duplex.js');
Stream.Transform = require('readable-stream/transform.js');
Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":302,"inherits":306,"readable-stream/duplex.js":323,"readable-stream/passthrough.js":334,"readable-stream/readable.js":335,"readable-stream/transform.js":336,"readable-stream/writable.js":337}],339:[function(require,module,exports){
var Buffer = require('buffer').Buffer

module.exports = function (buf) {
	// If the buffer is backed by a Uint8Array, a faster version will work
	if (buf instanceof Uint8Array) {
		// If the buffer isn't a subarray, return the underlying ArrayBuffer
		if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
			return buf.buffer
		} else if (typeof buf.buffer.slice === 'function') {
			// Otherwise we need to get a proper copy
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
		}
	}

	if (Buffer.isBuffer(buf)) {
		// This is the slow version that will work with any Buffer
		// implementation (even in old browsers)
		var arrayCopy = new Uint8Array(buf.length)
		var len = buf.length
		for (var i = 0; i < len; i++) {
			arrayCopy[i] = buf[i]
		}
		return arrayCopy.buffer
	} else {
		throw new Error('Argument must be a Buffer')
	}
}

},{"buffer":184}],340:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":341,"punycode":319,"querystring":322}],341:[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}],342:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],343:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],344:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],345:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":344,"_process":318,"inherits":343}],346:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],347:[function(require,module,exports){
'use strict';

var Buffer = require('buffer').Buffer;
var sha = require('./sha');
var md5 = require('./md5');

var algorithms = {
  sha1: sha,
  md5: md5
};

var blocksize = 64;
var zeroBuffer = Buffer.alloc(blocksize);
zeroBuffer.fill(0);

function hmac(fn, key, data) {
  if (!Buffer.isBuffer(key)) key = Buffer.from(key);
  if (!Buffer.isBuffer(data)) data = Buffer.from(data);

  if (key.length > blocksize) {
    key = fn(key);
  } else if (key.length < blocksize) {
    key = Buffer.concat([key, zeroBuffer], blocksize);
  }

  var ipad = Buffer.alloc(blocksize),
      opad = Buffer.alloc(blocksize);
  for (var i = 0; i < blocksize; i++) {
    ipad[i] = key[i] ^ 0x36;
    opad[i] = key[i] ^ 0x5C;
  }

  var hash = fn(Buffer.concat([ipad, data]));
  return fn(Buffer.concat([opad, hash]));
}

function hash(alg, key) {
  alg = alg || 'sha1';
  var fn = algorithms[alg];
  var bufs = [];
  var length = 0;
  if (!fn) error('algorithm:', alg, 'is not yet supported');
  return {
    update: function update(data) {
      if (!Buffer.isBuffer(data)) data = Buffer.from(data);

      bufs.push(data);
      length += data.length;
      return this;
    },
    digest: function digest(enc) {
      var buf = Buffer.concat(bufs);
      var r = key ? hmac(fn, key, buf) : fn(buf);
      bufs = null;
      return enc ? r.toString(enc) : r;
    }
  };
}

function error() {
  var m = [].slice.call(arguments).join(' ');
  throw new Error([m, 'we accept pull requests', 'http://github.com/dominictarr/crypto-browserify'].join('\n'));
}

exports.createHash = function (alg) {
  return hash(alg);
};
exports.createHmac = function (alg, key) {
  return hash(alg, key);
};

exports.createCredentials = function () {
  error('sorry,createCredentials is not implemented yet');
};
exports.createCipher = function () {
  error('sorry,createCipher is not implemented yet');
};
exports.createCipheriv = function () {
  error('sorry,createCipheriv is not implemented yet');
};
exports.createDecipher = function () {
  error('sorry,createDecipher is not implemented yet');
};
exports.createDecipheriv = function () {
  error('sorry,createDecipheriv is not implemented yet');
};
exports.createSign = function () {
  error('sorry,createSign is not implemented yet');
};
exports.createVerify = function () {
  error('sorry,createVerify is not implemented yet');
};
exports.createDiffieHellman = function () {
  error('sorry,createDiffieHellman is not implemented yet');
};
exports.pbkdf2 = function () {
  error('sorry,pbkdf2 is not implemented yet');
};

},{"./md5":349,"./sha":350,"buffer":184}],348:[function(require,module,exports){
'use strict';

var Buffer = require('buffer').Buffer;
var intSize = 4;
var zeroBuffer = Buffer.alloc(intSize);zeroBuffer.fill(0);
var chrsz = 8;

function toArray(buf, bigEndian) {
  if (buf.length % intSize !== 0) {
    var len = buf.length + (intSize - buf.length % intSize);
    buf = Buffer.concat([buf, zeroBuffer], len);
  }

  var arr = [];
  var fn = bigEndian ? buf.readInt32BE : buf.readInt32LE;
  for (var i = 0; i < buf.length; i += intSize) {
    arr.push(fn.call(buf, i));
  }
  return arr;
}

function toBuffer(arr, size, bigEndian) {
  var buf = Buffer.alloc(size);
  var fn = bigEndian ? buf.writeInt32BE : buf.writeInt32LE;
  for (var i = 0; i < arr.length; i++) {
    fn.call(buf, arr[i], i * 4, true);
  }
  return buf;
}

function hash(buf, fn, hashSize, bigEndian) {
  if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);
  var arr = fn(toArray(buf, bigEndian), buf.length * chrsz);
  return toBuffer(arr, hashSize, bigEndian);
}

module.exports = { hash: hash };

},{"buffer":184}],349:[function(require,module,exports){
"use strict";

/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

var helpers = require('./helpers');

/*
 * Perform a simple self-test to see if the VM is working
 */
function md5_vm_test() {
  return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
function core_md5(x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << len % 32;
  x[(len + 64 >>> 9 << 4) + 14] = len;

  var a = 1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d = 271733878;

  for (var i = 0; i < x.length; i += 16) {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
    d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

    a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
    d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);
}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t) {
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
}
function md5_ff(a, b, c, d, x, s, t) {
  return md5_cmn(b & c | ~b & d, a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t) {
  return md5_cmn(b & d | c & ~d, a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t) {
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t) {
  return md5_cmn(c ^ (b | ~d), a, b, x, s, t);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 0xFFFF;
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}

module.exports = function md5(buf) {
  return helpers.hash(buf, core_md5, 16);
};

},{"./helpers":348}],350:[function(require,module,exports){
'use strict';

/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

var helpers = require('./helpers');

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function core_sha1(x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << 24 - len % 32;
  x[(len + 64 >> 9 << 4) + 15] = len;

  var w = Array(80);
  var a = 1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d = 271733878;
  var e = -1009589776;

  for (var i = 0; i < x.length; i += 16) {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    var olde = e;

    for (var j = 0; j < 80; j++) {
      if (j < 16) w[j] = x[i + j];else w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
      var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = t;
    }

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }
  return Array(a, b, c, d, e);
}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d) {
  if (t < 20) return b & c | ~b & d;
  if (t < 40) return b ^ c ^ d;
  if (t < 60) return b & c | b & d | c & d;
  return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t) {
  return t < 20 ? 1518500249 : t < 40 ? 1859775393 : t < 60 ? -1894007588 : -899497514;
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 0xFFFF;
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}

module.exports = function sha1(buf) {
  return helpers.hash(buf, core_sha1, 20, true);
};

},{"./helpers":348}],351:[function(require,module,exports){
"use strict";

module.exports = function () {
  return function () {};
};

},{}],352:[function(require,module,exports){
(function (Buffer){
'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('stream'),
    Stream = _require.Stream;

var _require2 = require('../lib/common/utils/isArray'),
    isArray = _require2.isArray;

module.exports.string = function isString(obj) {
  return typeof obj === 'string';
};

module.exports.array = isArray;

module.exports.buffer = Buffer.isBuffer;

function isStream(obj) {
  return obj instanceof Stream;
}

module.exports.writableStream = function isWritableStream(obj) {
  return isStream(obj) && typeof obj._write === 'function' && (0, _typeof3.default)(obj._writableState) === 'object';
};

}).call(this,{"isBuffer":require("../node_modules/is-buffer/index.js")})
},{"../lib/common/utils/isArray":137,"../node_modules/is-buffer/index.js":307,"babel-runtime/helpers/typeof":173,"stream":338}],353:[function(require,module,exports){
'use strict';

// copy from https://github.com/node-modules/utility for browser

exports.encodeURIComponent = function (text) {
  try {
    return encodeURIComponent(text);
  } catch (e) {
    return text;
  }
};

exports.escape = require('escape-html');

exports.timestamp = function timestamp(t) {
  if (t) {
    var v = t;
    if (typeof v === 'string') {
      v = Number(v);
    }
    if (String(t).length === 10) {
      v *= 1000;
    }
    return new Date(v);
  }
  return Math.round(Date.now() / 1000);
};

},{"escape-html":301}],354:[function(require,module,exports){
(function (process,Buffer){
'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var util = require('util');
var urlutil = require('url');
var http = require('http');
var https = require('https');
var debug = require('debug')('urllib');
var ms = require('humanize-ms');

var REQUEST_ID = 0;
var MAX_VALUE = Math.pow(2, 31) - 10;
var PROTO_RE = /^https?:\/\//i;

function getAgent(agent, defaultAgent) {
  return agent === undefined ? defaultAgent : agent;
}

function makeCallback(resolve, reject) {
  return function (err, data, res) {
    if (err) {
      return reject(err);
    }
    resolve({
      data: data,
      status: res.statusCode,
      headers: res.headers,
      res: res
    });
  };
}

// exports.TIMEOUT = ms('5s');
exports.TIMEOUTS = [ms('300s'), ms('300s')];

var TEXT_DATA_TYPES = ['json', 'text'];

exports.request = function request(url, args, callback) {
  // request(url, callback)
  if (arguments.length === 2 && typeof args === 'function') {
    callback = args;
    args = null;
  }
  if (typeof callback === 'function') {
    return exports.requestWithCallback(url, args, callback);
  }

  return new _promise2.default(function (resolve, reject) {
    exports.requestWithCallback(url, args, makeCallback(resolve, reject));
  });
};

exports.requestWithCallback = function requestWithCallback(url, args, callback) {
  // requestWithCallback(url, callback)
  if (!url || typeof url !== 'string' && (typeof url === 'undefined' ? 'undefined' : (0, _typeof3.default)(url)) !== 'object') {
    var msg = util.format('expect request url to be a string or a http request options, but got %j', url);
    throw new Error(msg);
  }

  if (arguments.length === 2 && typeof args === 'function') {
    callback = args;
    args = null;
  }

  args = args || {};
  if (REQUEST_ID >= MAX_VALUE) {
    REQUEST_ID = 0;
  }
  var reqId = ++REQUEST_ID;

  args.requestUrls = args.requestUrls || [];

  var reqMeta = {
    requestId: reqId,
    url: url,
    args: args,
    ctx: args.ctx
  };
  if (args.emitter) {
    args.emitter.emit('request', reqMeta);
  }

  args.timeout = args.timeout || exports.TIMEOUTS;
  args.maxRedirects = args.maxRedirects || 10;
  args.streaming = args.streaming || args.customResponse;
  var requestStartTime = Date.now();
  var parsedUrl;

  if (typeof url === 'string') {
    if (!PROTO_RE.test(url)) {
      // Support `request('www.server.com')`
      url = 'http://' + url;
    }
    parsedUrl = urlutil.parse(url);
  } else {
    parsedUrl = url;
  }

  var method = (args.type || args.method || parsedUrl.method || 'GET').toUpperCase();
  var port = parsedUrl.port || 80;
  var httplib = http;
  var agent = getAgent(args.agent, exports.agent);
  var fixJSONCtlChars = args.fixJSONCtlChars;

  if (parsedUrl.protocol === 'https:') {
    httplib = https;
    agent = getAgent(args.httpsAgent, exports.httpsAgent);

    if (!parsedUrl.port) {
      port = 443;
    }
  }

  // request through proxy tunnel
  // var proxyTunnelAgent = detectProxyAgent(parsedUrl, args);
  // if (proxyTunnelAgent) {
  //   agent = proxyTunnelAgent;
  // }

  var options = {
    host: parsedUrl.hostname || parsedUrl.host || 'localhost',
    path: parsedUrl.path || '/',
    method: method,
    port: port,
    agent: agent,
    headers: args.headers || {},
    // default is dns.lookup
    // https://github.com/nodejs/node/blob/master/lib/net.js#L986
    // custom dnslookup require node >= 4.0.0
    // https://github.com/nodejs/node/blob/archived-io.js-v0.12/lib/net.js#L952
    lookup: args.lookup
  };

  if (Array.isArray(args.timeout)) {
    options.requestTimeout = args.timeout[args.timeout.length - 1];
  } else if (typeof args.timeout !== 'undefined') {
    options.requestTimeout = args.timeout;
  }

  var sslNames = ['pfx', 'key', 'passphrase', 'cert', 'ca', 'ciphers', 'rejectUnauthorized', 'secureProtocol', 'secureOptions'];
  for (var i = 0; i < sslNames.length; i++) {
    var name = sslNames[i];
    if (args.hasOwnProperty(name)) {
      options[name] = args[name];
    }
  }

  // don't check ssl
  if (options.rejectUnauthorized === false && !options.hasOwnProperty('secureOptions')) {
    options.secureOptions = require('constants').SSL_OP_NO_TLSv1_2;
  }

  var auth = args.auth || parsedUrl.auth;
  if (auth) {
    options.auth = auth;
  }

  var body = args.content || args.data;
  var dataAsQueryString = method === 'GET' || method === 'HEAD' || args.dataAsQueryString;
  if (!args.content) {
    if (body && !(typeof body === 'string' || Buffer.isBuffer(body))) {
      if (dataAsQueryString) {
        // read: GET, HEAD, use query string
        body = args.nestedQuerystring ? qs.stringify(body) : querystring.stringify(body);
      } else {
        var contentType = options.headers['Content-Type'] || options.headers['content-type'];
        // auto add application/x-www-form-urlencoded when using urlencode form request
        if (!contentType) {
          if (args.contentType === 'json') {
            contentType = 'application/json';
          } else {
            contentType = 'application/x-www-form-urlencoded';
          }
          options.headers['Content-Type'] = contentType;
        }

        if (parseContentType(contentType).type === 'application/json') {
          body = (0, _stringify2.default)(body);
        } else {
          // 'application/x-www-form-urlencoded'
          body = args.nestedQuerystring ? qs.stringify(body) : querystring.stringify(body);
        }
      }
    }
  }

  // if it's a GET or HEAD request, data should be sent as query string
  if (dataAsQueryString && body) {
    options.path += (parsedUrl.query ? '&' : '?') + body;
    body = null;
  }

  var requestSize = 0;
  if (body) {
    var length = body.length;
    if (!Buffer.isBuffer(body)) {
      length = Buffer.byteLength(body);
    }
    requestSize = options.headers['Content-Length'] = length;
  }

  if (args.dataType === 'json') {
    options.headers.Accept = 'application/json';
  }

  if (typeof args.beforeRequest === 'function') {
    // you can use this hook to change every thing.
    args.beforeRequest(options);
  }
  var connectTimer = null;
  var responseTimer = null;
  var __err = null;
  var connected = false; // socket connected or not
  var keepAliveSocket = false; // request with keepalive socket
  var responseSize = 0;
  var statusCode = -1;
  var responseAborted = false;
  var remoteAddress = '';
  var remotePort = '';
  var timing = null;
  if (args.timing) {
    timing = {
      // socket assigned
      queuing: 0,
      // dns lookup time
      dnslookup: 0,
      // socket connected
      connected: 0,
      // request sent
      requestSent: 0,
      // Time to first byte (TTFB)
      waiting: 0,
      contentDownload: 0
    };
  }

  function cancelConnectTimer() {
    if (connectTimer) {
      clearTimeout(connectTimer);
      connectTimer = null;
    }
  }
  function cancelResponseTimer() {
    if (responseTimer) {
      clearTimeout(responseTimer);
      responseTimer = null;
    }
  }

  function done(err, data, res) {
    cancelResponseTimer();
    if (!callback) {
      console.warn('[urllib:warn] [%s] [%s] [worker:%s] %s %s callback twice!!!', Date(), reqId, process.pid, options.method, url);
      // https://github.com/node-modules/urllib/pull/30
      if (err) {
        console.warn('[urllib:warn] [%s] [%s] [worker:%s] %s: %s\nstack: %s', Date(), reqId, process.pid, err.name, err.message, err.stack);
      }
      return;
    }
    var cb = callback;
    callback = null;
    var headers = {};
    if (res) {
      statusCode = res.statusCode;
      headers = res.headers;
    }

    // handle digest auth
    if (statusCode === 401 && headers['www-authenticate'] && (!args.headers || !args.headers.Authorization) && args.digestAuth) {
      var authenticate = headers['www-authenticate'];
      if (authenticate.indexOf('Digest ') >= 0) {
        debug('Request#%d %s: got digest auth header WWW-Authenticate: %s', reqId, url, authenticate);
        args.headers = args.headers || {};
        args.headers.Authorization = digestAuthHeader(options.method, options.path, authenticate, args.digestAuth);
        debug('Request#%d %s: auth with digest header: %s', reqId, url, args.headers.Authorization);
        if (res.headers['set-cookie']) {
          args.headers.Cookie = res.headers['set-cookie'].join(';');
        }
        return exports.requestWithCallback(url, args, cb);
      }
    }

    var requestUseTime = Date.now() - requestStartTime;
    if (timing) {
      timing.contentDownload = requestUseTime;
    }

    debug('[%sms] done, %s bytes HTTP %s %s %s %s, keepAliveSocket: %s, timing: %j', requestUseTime, responseSize, statusCode, options.method, options.host, options.path, keepAliveSocket, timing);

    var response = {
      status: statusCode,
      statusCode: statusCode,
      headers: headers,
      size: responseSize,
      aborted: responseAborted,
      rt: requestUseTime,
      keepAliveSocket: keepAliveSocket,
      data: data,
      requestUrls: args.requestUrls,
      timing: timing,
      remoteAddress: remoteAddress,
      remotePort: remotePort
    };

    if (err) {
      var agentStatus = '';
      if (agent && typeof agent.getCurrentStatus === 'function') {
        // add current agent status to error message for logging and debug
        agentStatus = ', agent status: ' + (0, _stringify2.default)(agent.getCurrentStatus());
      }
      err.message += ', ' + options.method + ' ' + url + ' ' + statusCode + ' (connected: ' + connected + ', keepalive socket: ' + keepAliveSocket + agentStatus + ')' + '\nheaders: ' + (0, _stringify2.default)(headers);
      err.data = data;
      err.path = options.path;
      err.status = statusCode;
      err.headers = headers;
      err.res = response;
    }

    cb(err, data, args.streaming ? res : response);

    if (args.emitter) {
      // keep to use the same reqMeta object on request event before
      reqMeta.url = url;
      reqMeta.socket = req && req.connection;
      reqMeta.options = options;
      reqMeta.size = requestSize;

      args.emitter.emit('response', {
        requestId: reqId,
        error: err,
        ctx: args.ctx,
        req: reqMeta,
        res: response
      });
    }
  }

  function handleRedirect(res) {
    var err = null;
    if (args.followRedirect && statuses.redirect[res.statusCode]) {
      // handle redirect
      args._followRedirectCount = (args._followRedirectCount || 0) + 1;
      var location = res.headers.location;
      if (!location) {
        err = new Error('Got statusCode ' + res.statusCode + ' but cannot resolve next location from headers');
        err.name = 'FollowRedirectError';
      } else if (args._followRedirectCount > args.maxRedirects) {
        err = new Error('Exceeded maxRedirects. Probably stuck in a redirect loop ' + url);
        err.name = 'MaxRedirectError';
      } else {
        var newUrl = args.formatRedirectUrl ? args.formatRedirectUrl(url, location) : urlutil.resolve(url, location);
        debug('Request#%d %s: `redirected` from %s to %s', reqId, options.path, url, newUrl);
        // make sure timer stop
        cancelResponseTimer();
        // should clean up headers.Host on `location: http://other-domain/url`
        if (args.headers && args.headers.Host && PROTO_RE.test(location)) {
          args.headers.Host = null;
        }
        // avoid done will be execute in the future change.
        var cb = callback;
        callback = null;
        exports.requestWithCallback(newUrl, args, cb);
        return {
          redirect: true,
          error: null
        };
      }
    }
    return {
      redirect: false,
      error: err
    };
  }

  // set user-agent
  if (!options.headers['User-Agent'] && !options.headers['user-agent']) {
    options.headers['User-Agent'] = navigator.userAgent;
  }

  if (args.gzip) {
    if (!options.headers['Accept-Encoding'] && !options.headers['accept-encoding']) {
      options.headers['Accept-Encoding'] = 'gzip';
    }
  }

  function decodeContent(res, body, cb) {
    var encoding = res.headers['content-encoding'];
    // if (body.length === 0) {
    //   return cb(null, body, encoding);
    // }

    // if (!encoding || encoding.toLowerCase() !== 'gzip') {
    return cb(null, body, encoding);
    // }

    // debug('gunzip %d length body', body.length);
    // zlib.gunzip(body, cb);
  }

  var writeStream = args.writeStream;

  debug('Request#%d %s %s with headers %j, options.path: %s', reqId, method, url, options.headers, options.path);

  args.requestUrls.push(url);

  function onResponse(res) {
    if (timing) {
      timing.waiting = Date.now() - requestStartTime;
    }
    debug('Request#%d %s `req response` event emit: status %d, headers: %j', reqId, url, res.statusCode, res.headers);

    if (args.streaming) {
      var result = handleRedirect(res);
      if (result.redirect) {
        res.resume();
        return;
      }
      if (result.error) {
        res.resume();
        return done(result.error, null, res);
      }

      return done(null, null, res);
    }

    res.on('close', function () {
      debug('Request#%d %s: `res close` event emit, total size %d', reqId, url, responseSize);
    });

    res.on('error', function () {
      debug('Request#%d %s: `res error` event emit, total size %d', reqId, url, responseSize);
    });

    res.on('aborted', function () {
      responseAborted = true;
      debug('Request#%d %s: `res aborted` event emit, total size %d', reqId, url, responseSize);
    });

    if (writeStream) {
      // If there's a writable stream to recieve the response data, just pipe the
      // response stream to that writable stream and call the callback when it has
      // finished writing.
      //
      // NOTE that when the response stream `res` emits an 'end' event it just
      // means that it has finished piping data to another stream. In the
      // meanwhile that writable stream may still writing data to the disk until
      // it emits a 'close' event.
      //
      // That means that we should not apply callback until the 'close' of the
      // writable stream is emited.
      //
      // See also:
      // - https://github.com/TBEDP/urllib/commit/959ac3365821e0e028c231a5e8efca6af410eabb
      // - http://nodejs.org/api/stream.html#stream_event_end
      // - http://nodejs.org/api/stream.html#stream_event_close_1
      var result = handleRedirect(res);
      if (result.redirect) {
        res.resume();
        return;
      }
      if (result.error) {
        res.resume();
        // end ths stream first
        writeStream.end();
        return done(result.error, null, res);
      }
      // you can set consumeWriteStream false that only wait response end
      if (args.consumeWriteStream === false) {
        res.on('end', done.bind(null, null, null, res));
      } else {
        // node 0.10, 0.12: only emit res aborted, writeStream close not fired
        if (isNode010 || isNode012) {
          first([[writeStream, 'close'], [res, 'aborted']], function (_, stream, event) {
            debug('Request#%d %s: writeStream or res %s event emitted', reqId, url, event);
            done(__err || null, null, res);
          });
        } else {
          writeStream.on('close', function () {
            debug('Request#%d %s: writeStream close event emitted', reqId, url);
            done(__err || null, null, res);
          });
        }
      }
      return res.pipe(writeStream);
    }

    // Otherwise, just concat those buffers.
    //
    // NOTE that the `chunk` is not a String but a Buffer. It means that if
    // you simply concat two chunk with `+` you're actually converting both
    // Buffers into Strings before concating them. It'll cause problems when
    // dealing with multi-byte characters.
    //
    // The solution is to store each chunk in an array and concat them with
    // 'buffer-concat' when all chunks is recieved.
    //
    // See also:
    // http://cnodejs.org/topic/4faf65852e8fb5bc65113403

    var chunks = [];

    res.on('data', function (chunk) {
      debug('Request#%d %s: `res data` event emit, size %d', reqId, url, chunk.length);
      responseSize += chunk.length;
      chunks.push(chunk);
    });

    res.on('end', function () {
      var body = Buffer.concat(chunks, responseSize);
      debug('Request#%d %s: `res end` event emit, total size %d, _dumped: %s', reqId, url, responseSize, res._dumped);

      if (__err) {
        // req.abort() after `res data` event emit.
        return done(__err, body, res);
      }

      var result = handleRedirect(res);
      if (result.error) {
        return done(result.error, body, res);
      }
      if (result.redirect) {
        return;
      }

      decodeContent(res, body, function (err, data, encoding) {
        if (err) {
          return done(err, body, res);
        }
        // if body not decode, dont touch it
        if (!encoding && TEXT_DATA_TYPES.indexOf(args.dataType) >= 0) {
          // try to decode charset
          try {
            data = decodeBodyByCharset(data, res);
          } catch (e) {
            debug('decodeBodyByCharset error: %s', e);
            // if error, dont touch it
            return done(null, data, res);
          }

          if (args.dataType === 'json') {
            if (responseSize === 0) {
              data = null;
            } else {
              var r = parseJSON(data, fixJSONCtlChars);
              if (r.error) {
                err = r.error;
              } else {
                data = r.data;
              }
            }
          }
        }

        if (responseAborted) {
          // err = new Error('Remote socket was terminated before `response.end()` was called');
          // err.name = 'RemoteSocketClosedError';
          debug('Request#%d %s: Remote socket was terminated before `response.end()` was called', reqId, url);
        }

        done(err, data, res);
      });
    });
  }

  var connectTimeout, responseTimeout;
  if (Array.isArray(args.timeout)) {
    connectTimeout = ms(args.timeout[0]);
    responseTimeout = ms(args.timeout[1]);
  } else {
    // set both timeout equal
    connectTimeout = responseTimeout = ms(args.timeout);
  }
  debug('ConnectTimeout: %d, ResponseTimeout: %d', connectTimeout, responseTimeout);

  function startConnectTimer() {
    debug('Connect timer ticking, timeout: %d', connectTimeout);
    connectTimer = setTimeout(function () {
      connectTimer = null;
      if (statusCode === -1) {
        statusCode = -2;
      }
      var msg = 'Connect timeout for ' + connectTimeout + 'ms';
      var errorName = 'ConnectionTimeoutError';
      if (!req.socket) {
        errorName = 'SocketAssignTimeoutError';
        msg += ', working sockets is full';
      }
      __err = new Error(msg);
      __err.name = errorName;
      __err.requestId = reqId;
      debug('ConnectTimeout: Request#%d %s %s: %s, connected: %s', reqId, url, __err.name, msg, connected);
      abortRequest();
    }, connectTimeout);
  }

  function startResposneTimer() {
    debug('Response timer ticking, timeout: %d', responseTimeout);
    responseTimer = setTimeout(function () {
      responseTimer = null;
      var msg = 'Response timeout for ' + responseTimeout + 'ms';
      var errorName = 'ResponseTimeoutError';
      __err = new Error(msg);
      __err.name = errorName;
      __err.requestId = reqId;
      debug('ResponseTimeout: Request#%d %s %s: %s, connected: %s', reqId, url, __err.name, msg, connected);
      abortRequest();
    }, responseTimeout);
  }

  var req;
  // request headers checker will throw error
  options.mode = args.mode ? args.mode : '';
  try {
    req = httplib.request(options, onResponse);
  } catch (err) {
    return done(err);
  }

  // environment detection: browser or nodejs
  if (typeof window === 'undefined') {
    // start connect timer just after `request` return, and just in nodejs environment
    startConnectTimer();
  } else {
    req.on('requestTimeout', function () {
      if (statusCode === -1) {
        statusCode = -2;
      }
      var msg = 'Connect timeout for ' + connectTimeout + 'ms';
      var errorName = 'ConnectionTimeoutError';
      __err = new Error(msg);
      __err.name = errorName;
      __err.requestId = reqId;
      abortRequest();
    });
  }

  function abortRequest() {
    debug('Request#%d %s abort, connected: %s', reqId, url, connected);
    // it wont case error event when req haven't been assigned a socket yet.
    if (!req.socket) {
      __err.noSocket = true;
      done(__err);
    }
    req.abort();
  }

  if (timing) {
    // request sent
    req.on('finish', function () {
      timing.requestSent = Date.now() - requestStartTime;
    });
  }

  req.once('socket', function (socket) {
    if (timing) {
      // socket queuing time
      timing.queuing = Date.now() - requestStartTime;
    }

    // https://github.com/nodejs/node/blob/master/lib/net.js#L377
    // https://github.com/nodejs/node/blob/v0.10.40-release/lib/net.js#L352
    // should use socket.socket on 0.10.x
    if (isNode010 && socket.socket) {
      socket = socket.socket;
    }

    var readyState = socket.readyState;
    if (readyState === 'opening') {
      socket.once('lookup', function (err, ip, addressType) {
        debug('Request#%d %s lookup: %s, %s, %s', reqId, url, err, ip, addressType);
        if (timing) {
          timing.dnslookup = Date.now() - requestStartTime;
        }
        if (ip) {
          remoteAddress = ip;
        }
      });
      socket.once('connect', function () {
        if (timing) {
          // socket connected
          timing.connected = Date.now() - requestStartTime;
        }

        // cancel socket timer at first and start tick for TTFB
        cancelConnectTimer();
        startResposneTimer();

        debug('Request#%d %s new socket connected', reqId, url);
        connected = true;
        if (!remoteAddress) {
          remoteAddress = socket.remoteAddress;
        }
        remotePort = socket.remotePort;
      });
      return;
    }

    debug('Request#%d %s reuse socket connected, readyState: %s', reqId, url, readyState);
    connected = true;
    keepAliveSocket = true;
    if (!remoteAddress) {
      remoteAddress = socket.remoteAddress;
    }
    remotePort = socket.remotePort;

    // reuse socket, timer should be canceled.
    cancelConnectTimer();
    startResposneTimer();
  });

  req.on('error', function (err) {
    //TypeError for browser fetch api, Error for browser xmlhttprequest api
    if (err.name === 'Error' || err.name === 'TypeError') {
      err.name = connected ? 'ResponseError' : 'RequestError';
    }
    err.message += ' (req "error")';
    debug('Request#%d %s `req error` event emit, %s: %s', reqId, url, err.name, err.message);
    done(__err || err);
  });

  if (writeStream) {
    writeStream.once('error', function (err) {
      err.message += ' (writeStream "error")';
      __err = err;
      debug('Request#%d %s `writeStream error` event emit, %s: %s', reqId, url, err.name, err.message);
      abortRequest();
    });
  }

  if (args.stream) {
    args.stream.pipe(req);
    args.stream.once('error', function (err) {
      err.message += ' (stream "error")';
      __err = err;
      debug('Request#%d %s `readStream error` event emit, %s: %s', reqId, url, err.name, err.message);
      abortRequest();
    });
  } else {
    req.end(body);
  }

  req.requestId = reqId;
  return req;
};

}).call(this,require('_process'),require("buffer").Buffer)
},{"_process":318,"babel-runtime/core-js/json/stringify":155,"babel-runtime/core-js/promise":163,"babel-runtime/helpers/typeof":173,"buffer":184,"constants":186,"debug":351,"http":180,"https":303,"humanize-ms":304,"url":340,"util":345}]},{},[3])(3)
});

