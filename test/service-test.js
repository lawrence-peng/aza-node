/**
 * Created by lawrence on 8/27/16.
 */
var assert = require("assert");
var Service = require('../core/service');

describe('Service', function () {
    var services ;
    before(function () {
        var path = process.cwd() + '/test'
        services = Service.register(__dirname);
    })
    describe('#Helper Service', function () {
        it('get helper service not null', function (done) {
            assert.notDeepEqual(services.helper, null);
            done();
        });
        it('get [isEmpty] function', function (done) {
            assert.notDeepEqual(isEmpty, null);
            done();
        });
        it('get [myservice] service format function',function (done) {
            var str = services.myservice.format('ptz');
            assert.equal(str,'ptz,你好');
            done()
        })
    });
});