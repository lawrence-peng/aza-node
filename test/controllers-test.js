/**
 * Created by lawrence on 9/9/16.
 */
var assert = require("assert");
var manager = require('../core/controllerManager');

describe('Controllers', function () {
    before(function () {
        manager.register(__dirname);
    })
    describe('#Controller Manager', function () {
        it('get all controllers', function (done) {
            assert.notDeepEqual(manager.getControllers(), null);
            done();
        });
    });
});