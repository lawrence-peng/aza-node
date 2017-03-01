/**
 * Created by lawrence on 27/02/2017.
 */
var _ = require('lodash');

module.exports = function (opts) {
    opts = opts || {};
    var mapping = opts.adapterMapping;
    var formatterManager = opts.formatterManager;
    var caseType = opts.caseType || 'none' // none;snakeCase;camelCase

    function adapter(item, key, val) {

        var keyValueItem = {key: key, val: val, formatted: false};

        if (mapping instanceof Function) {
            var mappingResult = mapping(key, val);
            Object.assign(keyValueItem, mappingResult);
        } else {
            if (mapping) {
                var newKey = mapping[key];
                keyValueItem.key = newKey;
                keyValueItem.val = val;
            }
        }
        if(mapping){
            delete item[key];
        }
        switch (caseType) {
            case 'snakeCase':
                keyValueItem.key = _.snakeCase(keyValueItem.key)
                break;
            case 'camelCase':
                keyValueItem.key = _.camelCase(keyValueItem.key)
                break;
        }
        if (!keyValueItem.formatted) {
            keyValueItem.val = formatterManager.format(keyValueItem.val);
        }
        item[keyValueItem.key] = keyValueItem.val;
    }

    function isObject(o) {
        return toString.call(o) === '[object Object]' && Object.prototype.isPrototypeOf(o);
    }

    function _doProcess(item) {
        if (isObject(item)) {
            var keys = Object.keys(item);
            for (var i = 0; i < keys.length; i++) {
                var val = item[keys[i]];
                if (val === null || val == undefined)continue;
                if (isObject(val)) {
                    this.process(val);
                }
                adapter(item, keys[i], val);
            }
        } else {
            formatterManager.format(item);
        }
    }

    this.process = function (data) {
        if (Array.isArray(data)) {
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                _doProcess(item)
            }
        } else {
            _doProcess(data)
        }
        return data;
    }

}