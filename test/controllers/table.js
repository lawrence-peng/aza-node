/**
 * Created by lawrence on 9/9/16.
 */
module.exports = function () {
    this.getList = function *() {
        console.log(this.requestParams)
        //throw new aza.restify.InternalServerError('接口异常1111111111!');
        return {createdAt: new Date(),address:{city:'22',area:'ptz'}};
    }
    this.add = function *() {
        throw new aza.BizError('增加失败!');
    }
}