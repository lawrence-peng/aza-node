/**
 * Created by lawrence on 5/25/16.
 */

module.exports = {
    getControllers: function () {
        return this.controllers;
    },
    register: function (controllerBasePath) {
        var fs = require('fs');
        var basePath = controllerBasePath || process.cwd();
        var paths = [];
        var controllerPathConfig = getConfig('app', 'controllers');
        var tmpPath;
        if (controllerPathConfig) {
            tmpPath = basePath + controllerPathConfig;
            if (fs.existsSync(tmpPath)) {
                paths.push(tmpPath);
            } else {
                throw new Error('app配置controllers不正确')
            }
        } else {
            tmpPath = basePath + '/controllers';
            if (fs.existsSync(tmpPath)) {
                paths.push(tmpPath);
            }
        }
        var modules = getConfig('app', 'modules');
        if (modules) {
            for (var i = 0; i < modules.length; i++) {
                var module = modules[i];
                if (!module.name) throw new Error('app module的name未设置');
                if (module.controller) {
                    tmpPath = basePath + '/modules/' + module.name + '/' + module.controller;
                    if (fs.existsSync(tmpPath)) {
                        paths.push(tmpPath);
                    }
                } else {
                    tmpPath = basePath + '/modules/' + module.name + '/controllers';
                    if (fs.existsSync(tmpPath)) {
                        paths.push(tmpPath);
                    }
                }
            }
        }
        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];
            var files = fs.readdirSync(path);
            this._create(path, files);
        }
    },
    _create: function (path, files) {
        this.controllers = this.controllers || {};
        for (var j = 0; j < files.length; j++) {
            var file = files[j];
            var filename = file.replace(/^.*[\\\/]/, '');
            var arrTemp = filename.split('.');
            var extension = arrTemp.pop();

            if (extension == 'js') {
                var key = arrTemp.pop();
                Controller = require(path + '/' + file);
                var obj = new Controller();
                obj._construct && obj._construct();
                var mIndex = path.indexOf('modules');
                if (mIndex > -1) {
                    path = path.replace(/.+\/modules\//, '');
                    key += path.replace(/\/controllers+.*/, '');
                }
                this.controllers[key] = obj;
            }
        }
    }
};