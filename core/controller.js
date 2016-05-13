/**
 * Created by lawrence on 4/15/16.
 */

module.exports = function Controller(request, response) {

    var self = this;

    self.request = request;
    self.response = response;

    self.success = function (data) {
        var result = {code: 0, message: '执行成功', data: data};
        response.send(200, result);
    };

    self._construct = function (controller) {

        if (!isEmpty(controller.model)) {
            self.model = loadModel(controller.model);
        }

    };

    self.create = function () {

    };

    self.update = function () {

    };

    self.delete = function () {

    };

};