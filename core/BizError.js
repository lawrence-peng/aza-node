'use strict';
/**
 * Created by lawrence on 9/12/16.
 */

var util = require('util');
var error = module.exports = {};
error.BaseError = function () {
  var tmp = Error.apply(this, arguments);
  tmp.name = this.name = 'AzaBaseError';

  this.message = tmp.message;
  if (Error.captureStackTrace)
    Error.captureStackTrace(this, this.constructor);
};
util.inherits(error.BaseError, Error);

error.BizError = function (message, status) {
  error.BaseError.apply(this, arguments);
  this.name = 'AzaBizError';
  this.statusCode = status || 200;
  this.message = message;
};
util.inherits(error.BizError, error.BaseError);
