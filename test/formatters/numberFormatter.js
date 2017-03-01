/**
 * Created by lawrence on 01/03/2017.
 */
var moment = require("moment");

module.exports = {
    type: 'number',
    format: function (val) {
        return moment(val).format('YYYY-MM-DD HH:mm:ss');
    }
}