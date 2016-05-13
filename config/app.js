/**
 * Created by lawrence on 5/13/16.
 */
/**
 * Created by lawrence on 4/14/16.
 */
"use strict";
var tool = require('cloneextend'),
    conf = {};
conf.prod = {
    errorHandler: {},
    username: 'eatjoys',
    password: 'MVecH/daAnjTLACPSt5JDA==' //eatjoys
};
conf.dev = {
    errorHandler: {dumpExceptions: true, showStack: true}
};
conf.defaults = {
    name: 'notifyServer',
    salt: '1234567890TIANZI',
    modules: ['auth', 'mysql'],
    routePath: '../routes',
    title: '消息通知中心服务',
    description: '消息通知中心服务'
};

exports.get = function get(env, obj) {
    var settings = tool.cloneextend(conf.defaults, conf[env || 'dev']);
    return ('object' === typeof obj) ? tool.cloneextend(settings, obj) : settings;
}