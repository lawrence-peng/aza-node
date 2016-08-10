/**
 * Created by lawrence on 4/15/16.
 */

var Exception = extend('exception');
module.exports = function Controller(request, response) {

    var self = this;

    self.request = request;
    self.response = response;

    self.json = function (data, encoding) {
        var result = {code: 1, message: '执行成功', data: data};
        response.charSet(encoding || 'utf-8');
        response.contentType = 'json';
        return result;
    };

    self.handleError = function (err) {
        if (err instanceof Exception) {
            response.send(200, {code: err.number, message: err.message});
        } else {
            console.error(JSON.parse(JSON.stringify(err, ['stack', 'message', 'inner'], 2)))
            //console.error(err);
            var body = {};
            if (err instanceof Error) {
                body.code = err.number;
                body.message = err.message;
            }
            else {
                body.code = -1;
                body.message = err;
            }
            response.send(500, body);
        }
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