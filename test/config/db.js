/**
 * Created by lawrence on 5/13/16.
 */
"use strict";
var tool = require('cloneextend'),
    conf = {};
conf.prod = {
    mysql: {
        host: '192.168.199.18',
        user: 'root',
        password: '123456',
        database: 'test',
        port: 3306
    },
    redis: {
        host: '127.0.0.1',
        port: 6379,
        password: '123456'
    },
    mongodb:{
        host: '127.0.0.1',
        user: 'sq_message',
        password: 'sq_message',
        database: 'sq_message',
        port:29019
    }
};
conf.pre = {
    mysql: {
        host: '192.168.199.19',
        user: 'root',
        password: '123',
        database: 'test',
        port: 3306
    },
    redis: {},
    mongodb:{
        host: '127.0.0.1',
        database: 'sq_message',
        port:27017
    }
};
conf.dev = {
    mysql: {
        host: '192.168.199.20',
        user: 'root',
        password: '123456',
        database: 'test',
        port: 3306
    },
    redis: {},
    mongodb:{
        host: '127.0.0.1',
        database: 'sq_message',
        port:27017
    }
};
conf.defaults = {};

exports.get = function get(env, obj) {
    var settings = tool.cloneextend(conf.defaults, conf[env || 'dev']);
    return ('object' === typeof obj) ? tool.cloneextend(settings, obj) : settings;
}