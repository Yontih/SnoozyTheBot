'use strict';

const router = require('koa-router')();

const config = require('../config');
const Webhook = require('../controllers/Webhook');

router.all('/webhook', Webhook.handle);

router.get('/env', function *() {
    this.body = process.env;
});
router.get('/config', function *() {
    this.body = config;
});

module.exports = router.routes();