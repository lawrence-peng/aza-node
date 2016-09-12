/**
 * Created by lawrence on 5/12/16.
 */
var Config = {
    build: function (configPath) {

        var fs = require('fs');
        var basePath = configPath || process.cwd();

        var paths = [];
        var path = '';

        paths.push(basePath + '/config');
        //paths.push(basePath + '/node_modules/aza-node/config');

        var config = {};

        createConfig(paths);

        function createConfig(p_paths) {
            for (i = 0; i < p_paths.length; i++) {
                path = p_paths[i];

                if (!fs.existsSync(path))break;

                var config_files = fs.readdirSync(path);

                for (var j = 0; j < config_files.length; j++) {

                    var index = config_files[j];
                    var filename = index.replace(/^.*[\\\/]/, '');
                    var arrTemp = filename.split('.');
                    var extension = arrTemp.pop();
                    if (extension == 'js') {
                        var key = arrTemp.pop();
                        config[key] = require(path + '/' + index);
                    }

                }
            }
        }

        // Create getConfig helper
        global.getConfig = function (namespace, key) {
            var conf = config[namespace];
            if (!conf) return null;
            if (!key) return conf;
            return conf.get(process.env.NODE_ENV)[key];
        };

        var modules = getConfig('app', 'modules');
        if (!modules)return;

        var packagesPaths = [];
        for (var i = 0; i < modules.length; i++) {
            var module = modules[i];
            path = basePath + '/modules/' + module + '/config';
            if (fs.existsSync(path)) {
                packagesPaths.push(path);
            }
        }

        createConfig(packagesPaths);

        return config;

    }
};

module.exports = Config;