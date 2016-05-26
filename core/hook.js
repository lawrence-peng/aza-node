/**
 * Created by lawrence on 4/15/16.
 */

var Hook = {
    Items: {},
    getHooks: function (identifier) {

        if (this.Items[identifier]) {
            return this.Items[identifier];
        }

        var fs = require('fs');
        var out = [];
        var paths = [];
        var basePath = process.cwd();
        var path = basePath + '/node_modules/aza-node/hooks.js';

        if (fs.existsSync(path)) {
            paths.push(path);
        }

        path = basePath + '/hooks.js';
        if (fs.existsSync(path)) {
            paths.push(path);
        }

        var modules = getConfig('app', 'modules') || [];

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
        this.Items[identifier] = out;
        return out;

    },
    execute: function *(identifier, route, request, response) {
        var hooks = this.getHooks(identifier);
        var valid = true;
        for (var i = 0; i < hooks.length; i++) {
            var hook = hooks[i];
            var flag = yield hook.call(this, route, request, response)
            if (!flag) {
                valid = false;
                break;
            }
        }
        return valid;
    }
};

module.exports = Hook;