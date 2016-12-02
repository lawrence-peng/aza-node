/**
 * Created by lawrence on 4/16/16.
 */
'use strict';

var _ = require('lodash');
var fs = require('fs');
var swaggerDoc = require('./swagger');

module.exports.compile = function (routes, options) {
  var defaultOpt = {
    /*
     router: {
     swaggerUi: '/swagger.json',
     controllers: './controllers',
     useStubs: getConfig('app', 'enableMock') || false //Conditionally turn on stubs (mock mode)
     },*/
    validateResponse: getConfig('app', 'validateResponse') || true,
    host: (getConfig('server', 'host') || 'localhost') + ':' + (getConfig('server', 'api_port') || getConfig('server', 'port') || '3000'),
    basePath: getConfig('app', 'api_basePath') || '/',
    info: {
      contact: {
        email: getConfig('app', 'contactEmail') || '26221792@qq.com'
      },
      description: getConfig('app', 'description'),
      title: getConfig('app', 'title') || 'aza-node',
      version: getConfig('app', 'version') || '1.0.0'
    }
  };

  options = _.assign(defaultOpt, options);

  var doc = swaggerDoc.create(routes, options);

  if (process.env.NODE_ENV === 'dev') {
    fs.writeFileSync('./api-docs.json', JSON.stringify(doc));
  }

  return doc;
};
