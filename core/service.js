/**
 * Created by lawrence on 4/14/16.
 */
module.exports = {
    register: function () {
        var fs = require('fs');
        var basePath = process.cwd();

        var services = {};
        var paths = [];
        var path = '';
        paths.push(basePath + '/services');
        paths.push(basePath + '/node_modules/services');
        for (var i = 0; i < paths.length; i++) {
            path = paths[i];
            if (fs.existsSync(path)) {
                files = fs.readdirSync(path);
                initService(path, files);
            }
        }

        var modules = getConfig('app', 'modules');

        for (var i = 0; i < modules.length; i++) {
            var module = modules[i];
            path = basePath + '/modules/' + module + '/services';
            if (fs.existsSync(path)) {
                files = fs.readdirSync(path);
                initService(path, files);
            }
        }

        function initService(service_path, service_files) {

            for (var j = 0; j < service_files.length; j++) {

                var index = service_files[j];
                var filename = index.replace(/^.*[\\\/]/, '');
                var extension = filename.split('.').pop();

                if (extension == 'js') {
                    index = index.substring(index.lastIndexOf('/') + 1, index.lastIndexOf('.'));
                    services[index] = require(service_path + '/' + service_files[j]);
                    services[index].init();
                }

            }
        }

        return services;
    }
}