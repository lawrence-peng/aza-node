/**
 * Created by lawrence on 4/15/16.
 */

var Hook = {

    getHooks: function (identifier) {

        var fs = require('fs');
        var out = [];
        var paths = [];
        var basePath = process.cwd();
        var path = basePath + '/hooks.js';

        if (fs.existsSync(path)) {
            paths.push(path);
        }

        var modules = getConfig('app', 'modules');
        if (!modules) return out;

        for (var i = 0; i < modules.length; i++) {
            var module = modules[i];
            path = basePath + '/modules/' + module + '/hooks.js';
            if (fs.existsSync(path)) {
                paths.push(path);
            }
        }

        for (i = 0; i < paths.length; i++) {

            path = paths[i];

            var hooks = require(path);

            for (var j = 0; j < hooks.length; j++) {
                var hook = hooks[j];
                if (hook.type == identifier) {
                    out.push(hook.callback);
                }
            }

        }

        return out;

    }

};

module.exports = Hook;