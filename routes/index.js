'use strict';

const router = require('koa-router')();

const config = require('../config');
const Webhook = require('../controllers/Webhook');

router.get('/webhook', Webhook.validateWebhook);
router.post('/webhook', Webhook.handle);

router.get('/env', function *() {
    this.body = process.env;
});
router.get('/config', function *() {
    this.body = config;
});
router.get('/data', function *() {
    let db = require('../utils/DB').instance;
    this.body = yield db.query('select * from test_table');
});

module.exports = router.routes();