/**
 * Created by lawrence on 4/14/16.
 */
'use strict'

var restify = require('restify');
var fs = require('fs');
var co = require('co');
var controllerManager = require('./controllerManager');
var NormalizationRes = require('./NormalizationRes');

var Router = {
    routes: [],
    register: function (server, middlewares, options) {
        this.middlewares = middlewares;
        this.options = options;
        var routes = this.getRoutes();
        for (var i = 0; i < routes.length; i++) {
            if (routes[i].meta.use) {
                this.create(server, routes[i]);
            }
        }
        return routes;
    },

    create: function (server, route) {
        var self = this;
        if (route.method == 'delete') {
            route.method = 'del';
        }
        var path_prefix = getConfig('app', 'api_basePath');
        if (path_prefix) {
            route.path = path_prefix + route.path;
        }

        server[route.method](route, this.middlewares, function (request, response, next) {
            co(function*() {
                var controller = controllerManager.getControllers()[route.controller.name];
                if (!controller) {
                    throw new Error('请求路径:' + route.path + '中的controller:[' + route.controller.name + ']不存在!')
                }
                var actionFunc = controller[route.controller.action];
                if (!actionFunc) {
                    throw new Error('请求路径:' + route.path + '中的controller:[' + route.controller.name + ']不存在[' + route.controller.action + ']的action!')
                }
                controller.request = request;
                controller.response = response;
                controller.next = next;
                controller.requestParams = request.swagger.params;

                var data = yield actionFunc.call(controller);

                var globalResponseNormalization = self.options.responseNormalization || {};
                if (globalResponseNormalization.enable && (data !== null || data !== undefined)) {
                    route.responseNormalization = route.responseNormalization || {};
                    var enableNormalization = route.responseNormalization.enable || true;
                    if (enableNormalization) {
                        var mapping = route.responseNormalization.adapterMapping;
                        var formatters = route.responseNormalization.formatters;
                        var formatterManager = globalResponseNormalization.formatterManager;
                        if (formatters) {
                            for (var i = 0; i < formatters.length; i++) {
                                formatterManager.addFormatter(formatters[i]);
                            }
                        }
                        var normalization = new NormalizationRes({
                            caseType: globalResponseNormalization.caseType || route.responseNormalization.caseType,
                            adapterMapping: mapping,
                            formatterManager: formatterManager
                        });
                        normalization.process(data);
                    }
                }

                var result = {code: 1, message: '执行成功', data: data};
                response.send(200, result);
                return next();
            }).catch(function (err) {
                if (err instanceof aza.BizError) {
                    return next(err);
                } else {
                    console.error('request router ' + route.path, err)
                }
                return next(new restify.InternalServerError('接口异常!'));
            });
        });
    },

    getRoutes: function (cwd) {
        if (this.routes && this.routes.length > 0) return this.routes;
        var routes = [];
        var basePath = cwd || process.cwd();

        var paths = [];
        var path = '';
        paths.push(basePath + '/routes');
        paths.push(basePath + '/node_modules/routes');

        for (var i = 0; i < paths.length; i++) {
            path = paths[i];
            if (fs.existsSync(path)) {
                var files = fs.readdirSync(path);
                buildRoutes(files);
            }
        }

        var modules = getConfig('app', 'modules');
        if (!modules) return routes;

        for (var i = 0; i < modules.length; i++) {
            var module = modules[i];
            path = basePath + '/modules/' + module + '/routes';
            if (fs.existsSync(path)) {
                var files = fs.readdirSync(path);
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
