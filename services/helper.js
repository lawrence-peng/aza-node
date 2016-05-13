/**
 * Created by lawrence on 4/18/16.
 */
var _ = require('lodash');
var Helper = {

    init: function () {

        require('util').log('Helper: Intializing helper service...');

        global.extend = function (corefile) {

            return require(process.cwd() + '/node_modules/aza-node/core/' + corefile + '.js');

        };

        global.loadModel = function (model) {

            var fs = require('fs');

            var Model = null;

            if (typeof model == 'string') {
                Model = require(process.cwd() + '/models/' + model + '.js');
            }
            else {
                Model = require(process.cwd() + '/packages/' + model[0] + '/models/' + model[1] + '.js');
            }
            console.log(aza.services);
            return new Model(aza.services.mysql.db, aza.services.mysql.DataTypes);

        };

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
            return HmacSHA1(string, getConfig('app', 'key')).toString(EncBase64);

        };

        global.wrapFunc = function (fn, skinEventFN, name) {
            return function newFunc() {
                if (!aza.server) {
                    throw new Error('服务器上下文不存在,不能使用这个function!');
                }
                const data = Array.from(arguments);
                const getEventName = prefix => _.camelCase(`${prefix} ${name || fn.name}`);
                const skip = skinEventFN ? skinEventFN(data) : false;
                if (!skip) aza.server.emit(getEventName('before'), data, this);
                fn.apply(this, data);
                if (!skip) aza.server.emit(getEventName('after'), data, this);
            };
        };
    }

};

module.exports = Helper;