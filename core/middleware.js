'use strict'
/**
 * Created by lawrence on 4/15/16.
 */

var co = require('co');
var restify = require('restify');

var Middleware = {
    register: function (server, cwd) {
        var fs = require('fs');
        var paths = [];
        var basePath = cwd || process.cwd();

        paths.push(basePath + '/middleware');

        var modules = getConfig('app', 'modules') || [];

        for (var i = 0; i < modules.length; i++) {
            var module = modules[i];
            var path = basePath + '/modules/' + module + '/middleware';
            if (fs.existsSync(path)) {
                paths.push(path);
            }
        }

        for (i = 0; i < paths.length; i++) {
            var path = paths[i];
            var files = fs.readdirSync(path);
            for (var j = 0; j < files.length; j++) {
                var file = files[j];
                var middleware = require(path + '/' + file);
                if (!middleware) continue;
                if (!middleware instanceof Function) {
                    throw new Error('middleware:路径为[' + path + '/' + file + ']的不是有效function')
                }
                server.use(function (req, res, next) {
                    co(function *() {
                        yield middleware.call({
                            req,
                            res,
                            next,
                            route: req.route
                        }, req, res, next);
                        return next();
                    }).catch(function (err) {
                        console.error(err)
                        if (err instanceof aza.BizError) {
                            return next(err);
                        }
                        return next(new restify.InternalServerError('接口异常!'));
                    });
                });
            }
        }
    }
};

module.exports = Middleware;