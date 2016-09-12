/**
 * Created by lawrence on 4/18/16.
 */
var joi = require('joi');

module.exports = {
    ApiResponse: joi.object({
        code: joi.number().integer().required(),
        message: joi.string(),
        data: joi.any().description('返回数据')
    }),
    ExecuteCase: joi.object({
        flag: joi.boolean().description('返回值')
    }),
    TableArea: {
        validator: joi.object({
            areaID: joi.number().required().description('区域ID'),
            areaName: joi.string().required().description('区域名称'),
        }), tableList: {
            type: 'array',
            items: {
                $ref: "#/definitions/TableList"
            }
        }
    },
    TableList: joi.object({
        tableID: joi.number().required().description('桌台ID'),
        tableName: joi.string().required().description('桌台名称'),
        status: joi.number().required().description('桌台状态,0禁用 1空闲  2占用  3预定 4结帐'),
        isLogic: joi.boolean().description('是否为虚拟桌台,1为虚拟桌台'),
        fatherTableID: joi.number().description('父桌台ID'),
        tableGroupNumber: joi.number().description('分组号'),
        peopleNum: joi.number().description('餐位'),
        dinningPeople: joi.number().description('就餐人数'),
        openTime: joi.date().description('开台时间'),
        remark: joi.string().description('备注')
    })
};