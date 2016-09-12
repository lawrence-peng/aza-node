/**
 * Created by lawrence on 4/14/16.
 */
"use strict"
var path = require('path');
module.exports = function Aza(options) {
    var self = this;
    options = options || {};
    self.initialize = function () {
        self.bootstrap(options);
        let apiDocs = self.compileApiDocs(options);
        self.registerRouter(apiDocs);
        self.run();
    };

    self.bootstrap = function (options) {

        //加载配置
        require('./config').build(options.cwd);
        //注册服务
        require('./service').register(options.cwd);

        require('./controllerManager').register(options.cwd);

        //创建服务器
        self.restify = require('restify');
        self.server = self.restify.createServer({
            name: getConfig('app', 'name') || 'aza-node-server',
            version: getConfig('app', 'version') || '1.0.0'
        });

        self.server.use(self.restify.CORS());
        self.server.use(self.restify.jsonp());

        options.bootstrap && options.bootstrap()

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

    self.registerRouter = function (apiDocs) {

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

                self.server[verb](/\/docs(\/.*)?$/,
                    middleware.swaggerMetadata(),
                    swaggerValidator,
                    //middleware.swaggerRouter(options.router),
                    middleware.swaggerUi({swaggerUiDir: path.join(__dirname, 'swagger-ui')})
                );
            });
            require('./router').register(self.server, [middleware.swaggerMetadata(), swaggerValidator]);
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