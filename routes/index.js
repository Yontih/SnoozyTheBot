'use strict';

const route = require('koa-router')();

const Webhook = require('../controllers/Webhook');

route.all('/webhook', Webhook.handle);

module.exports = route.routes();