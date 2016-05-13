/**
 * Created by lawrence on 4/14/16.
 */
"use strict"


module.exports = function Aza() {
    var self = this;

    self.initialize = function () {
        self.bootstrap();
        self.compile();
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
            name: getConfig('app', 'name') || 'aza-node-server'
        });

        self.server.use(self.restify.CORS());
        self.server.use(self.restify.authorizationParser());
        self.server.use(self.restify.queryParser());
        self.server.use(self.restify.jsonp());
        self.server.use(self.restify.bodyParser());

        if (process.env.NODE_ENV === 'dev') {
            require('util').log('Debug: Debugging enabled');
            var morgan = require('morgan');
            self.server.use(morgan('dev'));
        }
        //注册路由
        self.routes = require('./router').register(self.server);

    };

    self.compile = function () {

        var swagger = require('./swagger-ui/');

        swagger.configure(self.restify, self.server, {
            router: {
                swaggerUi: '/swagger.json',
                controllers: './controllers',
                useStubs: process.env.NODE_ENV === 'dev' ? true : false //Conditionally turn on stubs (mock mode)
            },
            validateResponse: getConfig('app', 'validateResponse') || true,
            host: (getConfig('server', 'host') || 'localhost') + ':' + (getConfig('server', 'port') || '3000'),
            basePath: '/',
            info: {
                contact: {
                    email: getConfig('app', 'contactEmail') || '26221792@qq.com'
                },
                description: getConfig('app', 'description'),
                title: getConfig('app', 'title') || 'aza-node',
                version: getConfig('app', 'version') || '0.1'
            },
        });
    };

    self.run = function () {
        var port = getConfig('server', 'port') || 3000;
        self.server.listen(port, function (err) {
            if (err) {
                require('util').log(err);
            } else {
                require('util').log('Your server is listening on port %d (http://localhost:%d)', port, port);
                require('util').log('Swagger-ui is available on http://localhost:%d/docs', port);
            }
        });
        if (process.env.NODE_ENV == 'prod') {
            process.on('uncaughtException', function (err) {
                console.error(JSON.parse(JSON.stringify(err, ['stack', 'message', 'inner'], 2)))
            });
        } else {
            self.server.on('uncaughtException', function (request, response, route, error) {
                console.log(error.stack);
            });
        }
    };
}