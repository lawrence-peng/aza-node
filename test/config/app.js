/**
 * Created by lawrence on 5/13/16.
 */
"use strict";
var tool = require('cloneextend'),
    conf = {};
conf.prod = {};
conf.pre = {
    api_service_url: 'http://www.example.com/api'
};
conf.dev = {
    api_service_url: 'http://www.example.com/api'
};
conf.defaults = {
    name: 'slimorderServer',
    salt: '123456789abcdefg',
    routePath: '../routes',
    title: '测试api服务',
    modules: [{name: 'order', controller: 'order'}],
    description: '测试api服务',
    api_basePath: '/node'
};

exports.get = function get(env, obj) {
    var settings = tool.cloneextend(conf.defaults, conf[env || 'dev']);
    return ('object' === typeof obj) ? tool.cloneextend(settings, obj) : settings;
}