/**
 * Created by lawrence on 8/26/16.
 */
var assert = require("assert");
var Config = require('../core/config');

describe('Config', function () {
    before(function () {
        Config.build(__dirname);
    })
    describe('#getConfig() for dev', function () {
        it('get [server] config not null', function (done) {
            assert.notDeepEqual(getConfig('app').get(), null);
            done();
        });
        it('get [server] config prop:[host]', function (done) {
            assert.equal(getConfig('server').get().host, 'localhost');
            done();
        })
        it('get [server] config prop:[port]', function (done) {
            assert.equal(getConfig('server').get().port, 3000);
            done();
        })
        it('get [app] config not null', function (done) {
            assert.notDeepEqual(getConfig('app').get(), null);
            done();
        });
        it('get [app] config prop:[name]', function (done) {
            assert.equal(getConfig('app').get().name, 'slimorderServer');
            done();
        })
        it('get [db] config not null', function (done) {
            assert.notDeepEqual(getConfig('db').get(), null);
            done();
        });
        it('get [db] config prop:[mysql] not null', function (done) {
            assert.notDeepEqual(getConfig('db').get().mysql, null);
            done();
        })
        it('get [db] config prop:[mysql.host]', function (done) {
            assert.equal(getConfig('db').get().mysql.host, '192.168.199.20');
            done();
        })
    });
});