/**
 * Created by lawrence on 4/14/16.
 */
var logger = require('util');
var fs = require('fs');
var co = require('co');
var Exception = extend('exception');

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

        var controllerCache = {};

        server[route.method](route, this.middlewares, function (request, response, next) {

            var router = function () {

                var key = route.method + '_' + route.path;
                var Controller = controllerCache[key];
                if (!Controller) {
                    if (!route.controller) {
                        Controller = require('./controller.js');
                    }
                    else {

                        if (typeof route.controller.name == 'string') {
                            Controller = require(process.cwd() + '/controllers/' + route.controller.name + '.js');
                        }
                        else {
                            Controller = require(process.cwd() + '/modules/' + route.controller.name[0] + '/controllers/' + route.controller.name[1] + '.js');
                        }
                    }
                    controllerCache[key] = Controller;
                }


                var controller = new Controller(request, response);
                aza.currentContext = controller;
                controller._construct(route.controller);

                co(function *() {
                    var result = yield controller[route.controller.action].call(this);
                    controller.success(result);
                }).catch(function (err) {
                    if (err instanceof Exception) {
                        response.send(200, {code: err.number, message: err.message});
                    } else {
                        logger.log(err);
                        var body = {};
                        if (err instanceof Error) {
                            body.code = err.number;
                            body.message = err.message;
                        }
                        else {
                            body.code = -1;
                            body.message = err;
                        }
                        response.send(500, body);
                    }
                });

                next();
            };

            var hook = require('./hook.js');
            var preRouteHooks = hook.getHooks('preroute');
            var valid = true;

            for (var i = 0; i < preRouteHooks.length; i++) {
                hook = preRouteHooks[i];
                if (!hook.call(this, route, request, response)) {
                    valid = false;
                    next();
                }
            }

            if (valid) {

                router();
            }

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