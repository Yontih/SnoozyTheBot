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
router.get('/data', function *() {
    let DB = require('../utils/DB');
    let db = new DB(config.db);

    this.body = yield db.query('select * from test_table');
});

module.exports = router.routes();