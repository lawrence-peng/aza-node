/**
 * Created by lawrence on 4/14/16.
 */
var logger = require('util');
var fs = require('fs');
var co = require('co');
var hook = extend('hook');
var ControllerManager = extend('controllerManager');

var Router = {
    routes: [],
    register: function (server, middlewares) {
        this.middlewares = middlewares;
        var routes = this.getRoutes();
        for (var i = 0; i < routes.length; i++) {
            if (routes[i].meta.use) {
                this.create(server, routes[i]);
            }
        }

        server.on('beforeSend', function (args, sender) {
            if (args.length === 1) {
                var arg = args[0]
                if (arg instanceof Error) {
                    arg.body = {
                        code: arg.code, message: arg.message
                    }
                }
            } else if (args.length === 2) {
                var arg = args[1]
                if (arg instanceof Error) {
                    arg.body = {
                        code: arg.code, message: arg.message
                    }
                }
            }
        });

        server.on('afterSend', function (args, sender) {
            console.log('after send !');
        });

        return routes;

    },

    create: function (server, route) {

        self = this;

        logger.log('Router: Registering route [' + route.method.toUpperCase() + ' ' + route.path + ']');

        if (route.method == 'delete') {
            route.method = 'del';
        }
        var path_prefix = getConfig('app', 'api_basePath');
        if (path_prefix) {
            route.path = path_prefix + route.path;
        }

        var controllerManager = new ControllerManager();

        server[route.method](route, this.middlewares, function (request, response, next) {

            var controller = controllerManager.getController(route, request, response);

            co(function *() {
                var valid = yield hook.execute('preroute', route, request, response);
                if (!valid) {
                    return next();
                }
                if (valid) {
                    if (route.controller.executing) {
                        var executingFunc = controller[route.controller.executing];
                        if (executingFunc) {
                            throw new Error(route.path + '中的[' + route.controller.executing + ']不存在!')
                        }
                        yield executingFunc.call(this);
                    }

                    var actionFunc = controller[route.controller.action];
                    if (actionFunc) {
                        throw new Error(route.path + '中的[' + route.controller.action + ']不存在!')
                    }
                    var data = yield actionFunc.call(this);
                    var result = controller.json(data);

                    if (route.controller.executed) {
                        var executedFunc = controller[route.controller.executed];
                        if (executedFunc) {
                            throw new Error(route.path + '中的[' + route.controller.executed + ']不存在!')
                        }
                        yield executedFunc.call(this);
                    }
                    response.send(200, result);
                }
            }).catch(function (err) {
                controller.handleError(err);
            });
        });

    },

    getRoutes: function () {
        if (this.routes && this.routes.length > 0)return this.routes;
        var routes = [];
        var basePath = process.cwd();

        var paths = [];
        var path = '';
        paths.push(basePath + '/routes');
        paths.push(basePath + '/node_modules/routes');

        for (var i = 0; i < paths.length; i++) {
            path = paths[i];
            if (fs.existsSync(path)) {
                files = fs.readdirSync(path);
                buildRoutes(files);
            }
        }

        var modules = getConfig('app', 'modules');
        if (!modules)return routes;

        for (var i = 0; i < modules.length; i++) {
            var module = modules[i];
            path = basePath + '/modules/' + module + '/routes';
            if (fs.existsSync(path)) {
                files = fs.readdirSync(path);
                buildRoutes(files);
            }
        }

        function buildRoutes(route_files) {
            for (var i = 0; i < route_files.length; i++) {
                var index = route_files[i];
                var filename = index.replace(/^.*[\\\/]/, '');
                var extension = filename.split('.').pop();

                if (extension == 'js') {
                    var routeFile = require(path + '/' + index);
                    for (var j = 0; j < routeFile.length; j++) {
                        routes.push(routeFile[j]);
                    }
                }

            }
        }

        this.routes = routes;

        return routes;

    }

};

module.exports = Router;