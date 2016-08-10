/**
 * Created by lawrence on 4/14/16.
 */
"use strict"


module.exports = function Aza() {
    var self = this;

    self.initialize = function () {
        self.bootstrap();
        self.compileApiDocs();
        self.registerRouter();
        self.run();
    };

    self.bootstrap = function () {

        //加载配置
        require('./config').build();
        //注册服务
        self.services = require('./service.js').register();

        //创建服务器
        self.restify = require('restify');
        self.server = self.restify.createServer({
            name: getConfig('app', 'name') || 'aza-node-server',
            version: getConfig('app', 'version') || '1.0.0'
        });

        self.server.use(self.restify.CORS());
        self.server.use(self.restify.authorizationParser());
        self.server.use(self.restify.queryParser());
        self.server.use(self.restify.acceptParser(self.server.acceptable));
        self.server.use(self.restify.jsonp());
        self.server.use(self.restify.bodyParser({mapParams: false}));
        self.server.use(self.restify.gzipResponse());
        self.server.use(self.restify.dateParser());
        self.server.use(self.restify.requestExpiry());

        self.server.use(function (req, res, next) {
            res.send = wrapFunc(res.send, null, 'send');
            res.end = wrapFunc(res.end, null, 'end');
            next();
        });

        self.server.use(self.restify.conditionalRequest());

        if(getConfig('app','auditLogger')) {
            self.server.on('after', self.restify.auditLogger({
                log: bunyan.createLogger({
                    name: 'audit',
                    stream: process.stdout
                })
            }));
        }

        if (process.env.NODE_ENV === 'dev') {
            require('util').log('Debug: Debugging enabled');
            var morgan = require('morgan');
            self.server.use(morgan('dev'));
        }

        self.routerService = require('./router');

        //获取系统路由
        self.routes = self.routerService.getRoutes();
    };

    self.compileApiDocs = function () {
        var swagger = require('./swagger-ui/');
        self.apiDocs = swagger.compile(self.routes);
    };

    self.registerRouter = function () {

        var swaggerTools = require('swagger-tools');

        swaggerTools.initializeMiddleware(self.apiDocs, function (middleware) {
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

                self.server[verb](/\/docs(\/.*)?$/,
                    middleware.swaggerMetadata(),
                    swaggerValidator,
                    //middleware.swaggerRouter(options.router),
                    middleware.swaggerUi({swaggerUiDir: process.cwd() + '/node_modules/aza-node/swagger-ui'})
                );
            });
            self.routerService.register(self.server, [middleware.swaggerMetadata(), swaggerValidator]);
        });

        self.server.get('/api-docs', function (req, res, next) {
            res.send(self.apiDocs);
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

    self.run = function () {
        var port = getConfig('server', 'port') || 3000;
        var host = getConfig('server', 'host');
        self.server.listen(port, function (err) {
            if (err) {
                require('util').log(err);
            } else {
                require('util').log('Your server is listening on port %d (http://%s:%d)', port,host, port);
                require('util').log('Swagger-ui is available on http://%s:%d/docs',host, port);
            }
        });
        if (process.env.NODE_ENV == 'prod') {
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