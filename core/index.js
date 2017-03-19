/**
 * Created by lawrence on 4/14/16.
 */
"use strict"
var path = require('path');
var FormatterManager = require('./normalization/response/FormatterManager');

module.exports = function Aza() {
    var self = this;
    self.BizError = require('./BizError').BizError;

    var formatterManager = new FormatterManager();

    self.initialize = function (options) {
        options = options || {};
        options.responseNormalization = options.responseNormalization || {};
        if (options.responseNormalization.enable) {
            options.responseNormalization.formatterManager = options.responseNormalization.formatterManager || formatterManager;
        }

        self.bootstrap(options);
        var apiDocs = self.compileApiDocs(options);
        self.registerRouter(apiDocs, options);
        self.run();
    };

    self.bootstrap = function (options) {

        //加载配置
        require('./config').build(options.cwd);
        //注册服务
        self.services = require('./service').register(options.cwd);

        require('./controllerManager').register(options.cwd);

        //创建服务器
        self.restify = require('restify');
        self.server = self.restify.createServer({
            name: getConfig('app', 'name') || 'aza-node-server',
            version: getConfig('app', 'version') || '1.0.0'
        });
        self.server.use(function (req, res, next) {
            res.send = wrapFunc(res.send, null, 'send');
            next();
        });
        self.server.use(self.restify.jsonp());

        options.bootstrap && options.bootstrap(self.restify, self.server);

        //注册中间件
        require('./middleware').register(self.server, options.cwd);


        //统一处理非BizError时,next(err)输出的格式
        self.server.on('beforeSend', function (args, sender) {
            var arg;
            if (args.length === 1) {
                arg = args[0]
            } else if (args.length === 2) {
                arg = args[1]
            }
            if (arg instanceof aza.BizError) {
                arg.body = {
                    "code": arg.code,
                    "message": arg.message
                };
                if (arg.data) {
                    arg.body.data = arg.data
                }
            } else if (arg instanceof Error) {
                console.error('beforeSend:', arg);
                if (arg.failedValidation) {
                    arg.body = {
                        code: arg.code,
                        message: arg.message,
                        paramName: arg.paramName
                    };
                } else {
                    arg.body = {
                        "code": "InternalServerError",
                        "message": "接口异常!"
                    };
                }
            }
        });

        if (process.env.NODE_ENV === 'development') {
            self.server.on('after', self.restify.auditLogger({
                log: require('bunyan').createLogger({
                    name: 'audit',
                    stream: process.stdout
                })
            }));
        }

        if (process.env.NODE_ENV === 'development') {
            require('util').log('Debug: Debugging enabled');
            var morgan = require('morgan');
            self.server.use(morgan('dev'));
        }
    };

    self.compileApiDocs = function (options) {
        var swagger = require('./swagger-ui/');
        var routes = require('./router').getRoutes(options.cwd);
        return swagger.compile(routes, options);
    };

    self.registerRouter = function (apiDocs, options) {

        var swaggerTools = require('swagger-tools');

        swaggerTools.initializeMiddleware(apiDocs, function (middleware) {
            if (middleware.results && middleware.results.errors) {
                for (var key in middleware.results.errors) {
                    console.error('swaggerTools error  :', middleware.results.errors[key]);
                }
            }

            var swaggerValidator = middleware.swaggerValidator({validateResponse: getConfig('app', 'validateResponse')});

            ['get', 'put', 'post', 'delete', 'head'].forEach(function (verb) {
                if (verb === 'delete') {
                    verb = 'del';
                }
                var basePath = __dirname.replace('/core', '');
                var swaggerUIPath = path.join(basePath, 'swagger-ui');

                self.server[verb](/\/docs(\/.*)?$/,
                    middleware.swaggerMetadata(),
                    swaggerValidator,
                    //middleware.swaggerRouter(options.router),
                    middleware.swaggerUi({swaggerUiDir: swaggerUIPath})
                );
            });

            require('./router').register(self.server, [middleware.swaggerMetadata(), swaggerValidator], options);
        });

        self.server.get('/api-docs', function (req, res, next) {
            res.send(apiDocs);
        });

        self.server.get('/docs', function (req, res, next) {
            res.redirect('/docs/', next);
        });

        self.server.get('/', function (req, res, next) {
            res.header('Location', '/docs');
            res.send(302);
            return next(false);
        });

    }

    self.addNormalizationFormatter = function (formatter) {
        formatterManager.addFormatter(formatter)
    }

    self.run = function () {
        var port = getConfig('server', 'port') || 3000;
        var host = getConfig('server', 'host');
        self.server.listen(port, function (err) {
            if (err) {
                require('util').log(err);
            } else {
                require('util').log('Your server is listening on port %d (http://%s:%d)', port, host, port);
                require('util').log('Swagger-ui is available on http://%s:%d/docs', host, port);
            }
        });
        if (process.env.NODE_ENV == 'production') {
            process.on('uncaughtException', function (err) {
                console.error(JSON.parse(JSON.stringify(err, ['stack', 'message', 'inner'], 2)))
            });
        } else {
            self.server.on('uncaughtException', function (request, response, route, error) {
                console.error(error.stack);
            });
        }
    };
}
