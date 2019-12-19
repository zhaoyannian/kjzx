/*
 * @Descripttion: 
 * @version: 
 * @Author: ZhaoYanNian
 * @Date: 2019-07-24 15:14:26
 * @LastEditors: ZhaoYanNian
 * @LastEditTime: 2019-12-19 10:03:21
 */
var chalk = require("chalk");
var fs = require('fs');
var path = require('path');
var useDefaultConfig = require('@ionic/app-scripts/config/webpack.config.js');

var env = process.env.NODE_ENV || 'dev';
var IONIC_ENV = process.env.IONIC_ENV

if (env === 'dev') {
    if (IONIC_ENV == 'dev') {
        useDefaultConfig.dev.resolve.alias = {
            "@env/environment": path.resolve(environmentPath('dev'))
        };
    };
    if (IONIC_ENV == 'prod') {
        useDefaultConfig.prod.resolve.alias = {
            "@env/environment": path.resolve(environmentPath('dev'))
        };
    };
}

if (env === 'uat') {
    if (IONIC_ENV == 'dev') {
        useDefaultConfig.dev.resolve.alias = {
            "@env/environment": path.resolve(environmentPath('uat'))
        };
    };
    if (IONIC_ENV == 'prod') {
        useDefaultConfig.prod.resolve.alias = {
            "@env/environment": path.resolve(environmentPath('uat'))
        };
    };
}

if (env === 'prod') {
    if (IONIC_ENV == 'dev') {
        useDefaultConfig.dev.resolve.alias = {
            "@env/environment": path.resolve(environmentPath('prod'))
        };
    };
    if (IONIC_ENV == 'prod') {
        useDefaultConfig.prod.resolve.alias = {
            "@env/environment": path.resolve(environmentPath('prod'))
        };
    };
}

function environmentPath(env) {
    var filePath = 'src/environments/environment.' + env + '.ts';
    console.log("use env file:" + filePath);
    if (!fs.existsSync(filePath)) {} else {
        return filePath;
    }
}

module.exports = function() {
    return useDefaultConfig;
};