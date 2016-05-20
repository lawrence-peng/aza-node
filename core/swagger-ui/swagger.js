/**
 * Created by lawrence on 4/16/16.
 */
'use strict';

var assert = require('assert');
var _ = require('lodash');
var convert = require('joi-to-json-schema');

module.exports.create = function (routes, options) {
    var swagger = new SwaggerDoc();
    var result = swagger.createResponse(options);
    var paths = swagger.loadRestifyRoutes(routes);
    result.paths = paths;
    return result;
};

function SwaggerDoc() {
    var swaggerDoc = this;

    var SWAGGER_METHODS = ['get', 'patch', 'post', 'put', 'delete'],
        SWAGGER_VERSION = '2.0';

    swaggerDoc.createResponse = function (options) {
        assert.ok(options.host, 'Swagger not initialized! Host of configure required!');

        swaggerDoc.definitions = require('./definition').getDefinitions(options.conf);
        return {
            swagger: SWAGGER_VERSION,
            info: options.info,
            host: options.host,
            basePath: options.basePath,
            schemes: options.schemes || ['http'],
            securityDefinitions: options.securityDefinitions || {},
            definitions: swaggerDoc.definitions
        };
    };

    swaggerDoc.convertToSwagger = function (path) {
        return path.replace(/:([^/]+)/g, '{$1}');
    };

    swaggerDoc.loadRestifyRoutes = function (routes) {
        var paths = {};
        _(routes).forEach(function (route) {
            var spec = route;
            if (!paths[spec.path]) {
                var operation = {};
                var parameters = [];
                for (var item in spec.parameters) {
                    var content = spec.parameters[item];
                    if (item === 'body') {
                        swaggerDoc.definitions[content.name] = convert(content.schema);
                        var p = {
                            name: content.name,
                            in: item,
                            description: content.description,
                            required: content.required || true
                        };
                        if (content.type === 'array') {
                            p.schema = {
                                type: 'array',
                                items: {$ref: '#/definitions/' + content.name}
                            };
                        } else {
                            p.schema = {$ref: '#/definitions/' + content.name};
                        }
                        parameters.push(p);
                    } else {
                        var schema = convert(content);
                        for (var key in schema.properties) {
                            var obj = schema.properties[key];
                            obj.in = item;
                            obj.name = key;
                            obj.required = _.indexOf(schema.required, key) >= 0;
                            parameters.push(obj);
                        }
                    }

                }

                if (spec.meta.auth) {
                    parameters.push({
                        name: 'Authorization',
                        type: 'string',
                        required: true,
                        in: 'header',
                        description: 'access token or refresh token'
                    });
                }

                operation[spec.method.toLowerCase()] = {
                    tags: spec.swagger.tags,
                    summary: spec.swagger.summary,
                    description: spec.swagger.description,
                    consumes: spec.swagger.consumes || [],
                    produces: spec.swagger.produces || [],
                    operationId: spec.controller.action,
                    "x-swagger-router-controller": spec.controller.name,
                    parameters: parameters,
                    responses: spec.responses
                };
                var pathName = swaggerDoc.convertToSwagger(spec.path);
                paths[pathName] = operation;
            }
        });

        return paths;
    };

    return swaggerDoc;
}