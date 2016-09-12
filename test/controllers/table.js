/**
 * Created by lawrence on 9/9/16.
 */
module.exports = function () {
    this.getList = function *() {
        //throw new aza.restify.InternalServerError('接口异常1111111111!');
        return 'hello aza';
    }
    this.add = function *() {
        throw new aza.restify.InternalServerError('增加失败!');
    }
}