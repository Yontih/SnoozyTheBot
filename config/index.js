'use strict';

const _ = require('lodash');
const fs = require('fs');

let env = process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : 'development';
env = __dirname + '/' + env + '.js';

if (!fs.existsSync(env)) {
    env = __dirname + '/development.js';
}

let config = _.merge(require('./defaults'), require(env));

module.exports = config;