/**
 * Created by lawrence on 5/13/16.
 */

"use strict";
var tool = require('cloneextend'),
    conf = {};
conf.prod = {
    host: 'www.example.com',
    port: 30000
};
conf.pre = {
    host: 'www.example.com',
    port: 30000
}
conf.dev = {
    host: 'localhost',
    port: 3000
};
conf.defaults = {
    host: 'localhost',
    port: 3000
};

exports.get = function get(env, obj) {
    var settings = tool.cloneextend(conf.defaults, conf[env || 'dev']);
    return ('object' === typeof obj) ? tool.cloneextend(settings, obj) : settings;
}