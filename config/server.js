/**
 * Created by lawrence on 5/13/16.
 */
"use strict";
var tool = require('cloneextend'),
    conf = {};
conf.prod = {
    port: '50000'
};
conf.dev = {
    host: '192.168.199.215',
    port: 5000,
};
conf.defaults = {
    host: '192.168.199.215',
    port: 5000,
};

exports.get = function get(env, obj) {
    var settings = tool.cloneextend(conf.defaults, conf[env || 'dev']);
    return ('object' === typeof obj) ? tool.cloneextend(settings, obj) : settings;
}