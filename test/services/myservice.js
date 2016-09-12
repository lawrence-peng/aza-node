/**
 * Created by lawrence on 8/27/16.
 */
module.exports = {
    init: function () {

    },
    format: function (val) {
        return require('util').format('%s,你好', val);
    }
};