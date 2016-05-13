/**
 * Created by lawrence on 4/19/16.
 */
var _ = require('lodash');
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
module.exports = [
    {
        'type': 'preroute',
        'callback': function (route, request, response) {
            response.send = wrapFunc(response.send, null, 'send');
            return true;

        }

    }
];