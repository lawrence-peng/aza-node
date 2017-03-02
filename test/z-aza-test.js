/**
 * Created by lawrence on 9/10/16.
 */
var assert = require("assert");
var Aza = require('../core/index');
var request = require('request');

describe('Aza Framework', function () {
    before(function () {
        var a = new Aza({cwd: __dirname});
        a.initialize({responseNormalization: {enable: false}});
        a.addNormalizationFormatter(require('./formatters/numberFormatter'))
        global.aza = a;
    })
    describe('#Table Request', function () {
        it('get table list', function (done) {
            request.get('http://127.0.0.1:3000/node/table/getList?shopID=122', {json: true}, function (err, response, body) {
                if (err) {
                    console.error(err)
                }
                assert.equal(body.data, 'hello aza')
                done();
            });
        });
        it('add table', function (done) {
            request.post({
                url: 'http://127.0.0.1:3000/node/table/add',
                json: true,
                form: {sid: '21221', name: 'test'}
            }, function (err, response, body) {
                if (err) {
                    //console.error(err);
                }
                assert.equal(body.message, '增加失败!')
                done()
            });
        });
    });
});