"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var loader_utils_1 = require("loader-utils");
var crypto_1 = __importDefault(require("crypto"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var imgUploadLoader = function (source) {
    return __awaiter(this, void 0, void 0, function () {
        var callback, options, data, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    callback = this.async();
                    options = loader_utils_1.getOptions(this);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4, Process(source, options, this)];
                case 2:
                    data = _a.sent();
                    callback(null, "module.exports = '" + data.url + "'");
                    return [3, 4];
                case 3:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [3, 4];
                case 4: return [2];
            }
        });
    });
};
function upload(url, file) {
    return new Promise(function (res, rej) {
        axios_1.default({
            method: 'POST',
            url: url,
            data: file,
        })
            .then(function (response) {
            res(response.data);
        })
            .catch(function (err) {
            rej(err);
        });
    });
}
function mkdirsSync(dirname) {
    if (fs_1.default.existsSync(dirname)) {
        return true;
    }
    else {
        if (mkdirsSync(path_1.default.dirname(dirname))) {
            fs_1.default.mkdirSync(dirname);
            return true;
        }
    }
}
function genMd5(file) {
    var hash = crypto_1.default.createHash('md5');
    hash.update(file);
    var md5 = hash.digest('hex');
    return md5;
}
function checkUrlMap(hash, cachePath, context) {
    var filePath = cachePath;
    var key = context.resourcePath.replace(context.options.context, '');
    try {
        var file = fs_1.default.readFileSync(filePath, 'utf-8');
        var result = JSON.parse(file);
        return result[key] && result[key].hash === hash && result[key].url;
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            return '';
        }
        else {
            throw err;
        }
    }
}
function genUrlMap(hash, url, cachePath, context) {
    var _a;
    var filePath = cachePath;
    var key = context.resourcePath.replace(context.options.context, '');
    var result;
    try {
        var file = fs_1.default.readFileSync(filePath, 'utf-8');
        result = JSON.parse(file);
        result[key] = {
            hash: hash,
            url: url,
        };
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            mkdirsSync(filePath);
            result = (_a = {},
                _a[key] = {
                    hash: hash,
                    url: url,
                },
                _a);
        }
        else {
            throw err;
        }
    }
    var Str_ans = JSON.stringify(result, null, 4);
    fs_1.default.writeFile(filePath, Str_ans, 'utf8', function (err) {
        if (err)
            throw err;
    });
}
function Process(file, options, context) {
    return __awaiter(this, void 0, void 0, function () {
        var md5, cachePath, url, isUpload, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    md5 = genMd5(file);
                    cachePath = options.cachePath
                        ? options.cachePath
                        : path_1.default.join(context.output.path.replace('__dist', 'dist'), 'img-url-map.json');
                    url = checkUrlMap(md5, cachePath, context);
                    isUpload = !!url;
                    if (!!isUpload) return [3, 2];
                    return [4, upload(options.url, file)];
                case 1:
                    data = _a.sent();
                    genUrlMap(md5, data.url, cachePath, context);
                    return [2, data];
                case 2: return [2, {
                        url: url,
                    }];
            }
        });
    });
}
imgUploadLoader.raw = true;
module.exports = imgUploadLoader;
