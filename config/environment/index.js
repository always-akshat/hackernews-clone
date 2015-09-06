/**
 * Created by akshat on 5/9/15.
 */

/**
 * Created by akshat on 5/9/15.
 */

'use strict';
var path = require('path');
var _ = require('lodash');
var request = require('request');
var envConfig = require('./' + process.env.NODE_ENV + '.js') || {}


var all = {
    env: process.env.NODE_ENV,
    root: path.normalize(__dirname + '/../..'),
    port: process.env.PORT || 9000,
    secrets: {
        session: 'hacker-news'
    }
};

module.exports = _.merge(
    all,envConfig);
