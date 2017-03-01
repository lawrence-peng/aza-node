/**
 * Created by lawrence on 4/15/16.
 */
var joi = require('joi');
var routes = [
    {
        path: '/table/getList',
        method: 'get',
        meta: {
            use: true,
            auth: false
        },
        controller: {
            name: 'table',
            action: 'getList'
        },
        swagger: {
            tags: ['Table'],
            summary: '获取桌台区域和桌台信息',
            description: '获取当前门店下的全部桌台区域信息及桌台信息',
            produces: [
                "application/json"
            ]
        },
        parameters: {
            query: joi.object({
                shopID: joi.number().integer().required().description('店铺ID')
            })
        },
        responseNormalization: {
            enable: true,
            caseType: 'snakeCase',
            adapterMapping: {
                createdAt: 'addDate'
            }
        },
        responses: {
            200: {
                description: "操作成功",
                schema: {
                    type: "array",
                    items: {
                        $ref: "#/definitions/TableArea"
                    }
                }
            }
            ,
            404: {
                "description": "Api not found"
            }
        }
    },
    {
        path: '/table/add',
        method: 'post',
        meta: {
            use: true,
            auth: false
        },
        controller: {
            name: 'table',
            action: 'add'
        },
        swagger: {
            tags: ['Table'],
            summary: '增加桌台信息',
            description: '增加桌台信息',
            produces: [
                "application/json"
            ]
        },
        parameters: {
            formData: joi.object({
                sid: joi.string().required().description('SID'),
                name: joi.string().required().description('名称'),
            })
        },
        responses: {
            200: {
                description: "操作成功",
                schema: {
                    type: "array",
                    items: {
                        $ref: "#/definitions/TableArea"
                    }
                }
            }
            ,
            404: {
                "description": "Api not found"
            }
        }
    }
];


module.exports = routes;