/**
 * Created by lawrence on 4/19/16.
 */
var _ = require('lodash');

module.exports = [
    {
        'type': 'preroute',
        'callback': function (route, request, response) {
            response.send = wrapFunc(response.send, null, 'send');
            return true;
        }

    }
];