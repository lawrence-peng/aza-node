/**
 * Created by lawrence on 4/15/16.
 */

module.exports = function Controller(request, response) {

    var self = this;

    self.request = request;
    self.response = response;

    self.success = function (data) {
        self.result = {code: 1, message: '执行成功', data: data};
        response.send(200, self.result);
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