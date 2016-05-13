/**
 * Created by lawrence on 4/16/16.
 */
'use strict';

var _ = require('lodash');
var swaggerTools = require('swagger-tools');
var fs = require('fs');
var swaggerDoc = require('./swagger');

module.exports.configure = function (restify, server, options) {
    var self = this;
    self.options = _.assign({}, options);
    self.server = server;
    var doc = swaggerDoc.create(server, this.options);

    aza.Doc = doc;

    fs.writeFileSync('./api-doc.json', JSON.stringify(doc));

    swaggerTools.initializeMiddleware(doc, function (middleware) {
        if (middleware.results && middleware.results.errors) {
            for (var key in middleware.results.errors) {
                console.log('swaggerTools error  :', middleware.results.errors[key]);
            }
        }
        var middlewares = [
            middleware.swaggerMetadata(),
            middleware.swaggerValidator(),
            middleware.swaggerRouter(options.router),
        ];


        // Fix issue with swagger-ui redirect not working with Restify (Not sure who is to blame here)
        server.get('/docs', function (req, res, next) {
            res.redirect('/docs/', next);
        });

        server.get('/', function (req, res, next) {
            res.header('Location', '/docs');
            res.send(302);
            return next(false);
        });

        // Supported Swagger HTTP verbs (options and patch are not Restify server APIs)
        // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#path-item-object
        ['get', 'put', 'post', 'delete', 'head'].forEach(function (verb) {
            if (verb === 'delete') {
                verb = 'del';
            }

            // Register the middlewares with Restify
            server[verb](/.*/,
                middleware.swaggerMetadata(),
                middleware.swaggerValidator({validateResponse: options.validateResponse}),
                middleware.swaggerRouter(options.router),
                middleware.swaggerUi({swaggerUiDir: process.cwd() + '/swagger-ui'}));
        });
    });
};