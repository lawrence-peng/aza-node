/**
 * Created by lawrence on 4/18/16.
 */
var _ = require('lodash');
var Helper = {

    init: function () {

        global.getUTCStamp = function () {
            return Math.floor((new Date()).getTime() / 1000);
        };

        global.toHttpDateTime = function (utcStamp) {
            // RFC 2616 = Day (small word), Date Month(small word) Year(full) Hours:Minutes:Seconds GMT
            var moment = require('moment');
            return moment.utc(utcStamp * 1000).format('ddd, DD MMM YYYY HH:mm:ss') + ' GMT';
        };

        global.isEmpty = function (obj) {
            if (typeof obj === 'undefined') return true;
            if (obj === null) return true;
            if (obj.length > 0) return false;
            if (obj.length === 0) return true;

            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
            }

            return true;
        };

        global.hash = function (string) {
            var HmacSHA1 = require('crypto-js/hmac-sha1');
            var EncBase64 = require('crypto-js/enc-base64');
            var key = getConfig('app', 'key') || 'aza-node-restapi'
            return HmacSHA1(string, key).toString(EncBase64);
        };

        global.wrapFunc = function (fn, skinEventFN, name) {
            return function newFunc() {
                if (!aza.server) {
                    throw new Error('服务器上下文不存在,不能使用这个function!');
                }
                const params = Array.from(arguments);
                const getEventName = prefix => _.camelCase(`${prefix} ${name || fn.name}`);
                const skip = skinEventFN ? skinEventFN(params) : false;
                if (!skip) aza.server.emit(getEventName('before'), params, this);
                fn.apply(this, params);
                if (!skip) aza.server.emit(getEventName('after'), params, this);
            };
        };
    }

};

module.exports = Helper;