/**
 * Created by lawrence on 25/02/2017.
 */
var moment = require("moment");

module.exports = {
    type: 'date',
    format: function (val) {
        return moment(val).format('X');
    }
}