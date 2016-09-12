/**
 * Created by lawrence on 4/18/16.
 */
'use strict';

var _ = require('lodash');
var convert = require('./joi-to-json-schema');

var Definition = {

    getDefinitions: function (cwd) {
        var out = {};
        var fs = require('fs');
        var basePath = cwd || process.cwd();
        var path = basePath + '/definitions';
        var files = fs.readdirSync(path);

        buildDefinition(files);

        var modules = getConfig('app', 'modules');
        if (!modules)return out;


        for (var i = 0; i < modules.length; i++) {
            var module = modules[i];
            path = basePath + '/modules/' + module + '/definitions';
            if (fs.existsSync(path)) {
                files = fs.readdirSync(path);
                buildDefinition(files);
            }
        }

        function buildDefinition(definition_files) {
            for (var i = 0; i < definition_files.length; i++) {
                var file = definition_files[i];
                var filename = file.replace(/^.*[\\\/]/, '');
                var extension = filename.split('.').pop();

                if (extension == 'js') {
                    var org_def = require(path + '/' + file);
                    var new_def = {};
                    _(org_def).forEach(function (val, key) {
                        if (val.isJoi) {
                            new_def[key] = convert(val);
                        }
                        else {
                            var t = _.assign({}, val);
                            new_def[key] = convert(t.validator);
                            delete t.validator;

                            _.assign(new_def[key].properties, t);

                        }
                        new_def[key].xml = {
                            name: key
                        };
                    });

                    out = _.assign(out, new_def);

                }
            }
        }


        return out;

    }

};

module.exports = Definition;