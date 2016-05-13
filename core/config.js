/**
 * Created by lawrence on 5/12/16.
 */
var Config = {

    build: function () {
        
        var fs = require('fs');
        var basePath = process.cwd();

        var paths = [];
        var path = '';

        paths.push(basePath + '/config');
        paths.push(basePath + '/node_modules/config');

        aza.config = {};

        createConfig(paths);

        function createConfig(p_paths) {
            for (i = 0; i < p_paths.length; i++) {
                path = p_paths[i];

                if (!fs.existsSync(path))break;

                var config_files = fs.readdirSync(path);

                for (var j = 0; j < config_files.length; j++) {

                    var index = config_files[j];
                    var filename = index.replace(/^.*[\\\/]/, '');
                    var extension = filename.split('.').pop();

                    if (extension == 'js') {
                        index = index.substring(index.lastIndexOf('/') + 1, index.lastIndexOf('.'));
                        aza.config[index] = require(path + '/' + config_files[j]);
                    }

                }
            }
        }

        // Create getConfig helper
        global.getConfig = function (namespace, key) {
            return aza.config[namespace].get(process.env.NODE_ENV)[key];
        };

        var modules = getConfig('app', 'modules');
        var packagesPaths = [];
        for (var i = 0; i < modules.length; i++) {
            var module = modules[i];
            require('util').log('Package enabled: ' + module);
            path = basePath + '/modules/' + module + '/config';
            if (fs.existsSync(path)) {
                packagesPaths.push(path);
            }
        }

        createConfig(packagesPaths);

    }
};

module.exports = Config;