/**
 * Created by lawrence on 28/02/2017.
 */

module.exports = function () {

    var formatters = {"date": require('./formatters/dateFormatter')};

    this.addFormatter = function (formatter) {
        var type = formatter.type;
        if (!type) {
            throw new Error('type不能为空!')
        }
        formatters[type.toLowerCase()] = formatter;
    };

    this.removeFormatter = function (key) {
        if (formatters[key]) {
            delete formatters[key];
        }
    };

    this.format = function (val) {
        var type = val.constructor.name.toLowerCase();
        var formatter = formatters[type];
        if (formatter) {
            val = formatter.format(val)
        }
        return val;
    };
}