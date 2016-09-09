'use strict';

const route = require('koa-router')();

const config = require('../config');
const Webhook = require('../controllers/Webhook');

route.all('/webhook', Webhook.handle);

router.get('/env', function *() {
    this.body = process.env;
});
route.get('/config', function *() {
    this.body = config;
});

module.exports = route.routes();