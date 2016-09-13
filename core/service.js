/**
 * Created by lawrence on 4/14/16.
 */
module.exports = {
    register: function (servicePath) {
        var fs = require('fs');
        var basePath = servicePath || process.cwd();

        var services = {};
        var paths = [];
        var path = '';
        paths.push(basePath + '/services');
        paths.push(basePath + '/node_modules/aza-node/services');
        for (var i = 0; i < paths.length; i++) {
            path = paths[i];
            if (fs.existsSync(path)) {
                var files = fs.readdirSync(path);
                initService(path, files);
            }
        }

        var modules = getConfig('app', 'modules');
        if (!modules)return services;

        for (var i = 0; i < modules.length; i++) {
            var module = modules[i];
            path = basePath + '/modules/' + module + '/services';
            if (fs.existsSync(path)) {
                var files = fs.readdirSync(path);
                initService(path, files);
            }
        }

        function initService(service_path, service_files) {

            for (var j = 0; j < service_files.length; j++) {

                var index = service_files[j];
                var filename = index.replace(/^.*[\\\/]/, '');
                var arrTemp = filename.split('.');
                var extension = arrTemp.pop();

                if (extension == 'js') {
                    var key = arrTemp.pop();
                    services[key] = require(service_path + '/' + index);
                    services[key].init();
                }

            }
        }

        return services;
    }
}