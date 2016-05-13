/**
 * Created by lawrence on 4/14/16.
 */
var logger = require('util');
var fs = require('fs');
var co = require('co');
var Exception = extend('exception');

var Router = {

    register: function (server) {
        var routes = this.getRoutes();
        for (var i = 0; i < routes.length; i++) {
            if (routes[i].meta.use) {
                this.create(server, routes[i]);
            }
        }

        server.on('beforeSend', function () {
            console.log('before send !')
        });

        server.on('afterSend', function (result, sender) {
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

        server[route.method](route, function (request, response, next) {

            var router = function () {

                var Controller = null;
                if (!route.controller) {
                    Controller = require('./controller.js');
                }
                else {

                    if (typeof route.controller.name == 'string') {
                        Controller = require('../controllers/' + route.controller.name + '.js');
                    }
                    else {
                        Controller = require(process.cwd() + '/modules/' + route.controller.name[0] + '/controllers/' + route.controller.name[1] + '.js');
                    }
                }

                var controller = new Controller(request, response);
                aza.currentContext = controller;
                controller._construct(route.controller);

                co(function *() {
                    yield controller[route.controller.action].call(this);

                }).catch(function (err) {
                    if (err instanceof Exception) {
                        response.send(200, {code: err.number, message: err.message});
                    } else {
                        logger.log(err);
                        response.send(500, {code: err.number, message: err.message});
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

        return routes;

    }

};

module.exports = Router;