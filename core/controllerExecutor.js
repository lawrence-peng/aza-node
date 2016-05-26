/**
 * Created by lawrence on 5/25/16.
 */

module.exports = function ControllerExecutor() {
    const controllerCache = {};
    var self = this;
    self._getController = function (route, req, res) {
        var key = route.method + '_' + route.path;
        var Controller = controllerCache[key];
        if (!Controller) {
            if (!route.controller) {
                Controller = require('./controller.js');
            }
            else {
                if (typeof route.controller.name == 'string') {
                    Controller = require(process.cwd() + '/controllers/' + route.controller.name + '.js');
                }
                else {
                    Controller = require(process.cwd() + '/modules/' + route.controller.name[0] + '/controllers/' + route.controller.name[1] + '.js');
                }
            }
            controllerCache[key] = Controller;
        }
        return new Controller(req, res);
    };
    self.execute = function *(route, req, res) {
        var controller = self._getController(route, req, res);
        controller._construct(route.controller);
        var result = yield controller[route.controller.action].call(this);
        return result;
    }
};