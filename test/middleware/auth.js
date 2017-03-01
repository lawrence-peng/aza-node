'use strict'
/**
 * Created by lawrence on 9/12/16.
 */

var jwt = require('jsonwebtoken')

var getToken = function (request) {
    var token
    if (request.headers && request.headers.authorization) {
        var parts = request.headers.authorization.split(' ')
        if (parts.length == 2) {
            var scheme = parts[0]
            var credentials = parts[1]

            if (/^Bearer$/i.test(scheme)) {
                token = credentials
            }
        }
    }
    return token
}

module.exports = function*() {

    var Cache = aza.services.cache || {};
    var route = this.route
    if (!route.meta || !route.meta.auth) return

    var token = getToken(this.req)
    if (!token) {
        throw new aza.BizError('授权失败,请检查token值。');
    }
    var expToken = yield Cache.get(token) // 如果在缓存里查找到丢弃的token,调用返回
    if (expToken) {
        throw new aza.BizError('授权失败,token已无效。');
    }

    var decoded

    try {
        decoded = jwt.verify(token, getConfig('jwt', 'salt'))
    } catch (err) {
        throw new aza.BizError('授权失败,token已失效。')
    }

    if (route.meta.admin && decoded.usertype !== 1) {
        throw new aza.BizError('您无权限操作此资源')
    }

    this.req.user = decoded
    this.req.user.token = token
};
