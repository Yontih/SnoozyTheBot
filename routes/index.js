'use strict';

const router = require('koa-router')();

const config = require('../config');
const Facebook = require('../controllers/Facebook');

// midlewares
const fbRegister = require('../middlewares/fbRegister');
const getAlert = require('../middlewares/alert');


const fb = new Facebook();


router.get('/webhook', Facebook.validateWebhook);
router.post('/webhook', fbRegister, getAlert, function *() {

    console.log('POST/Webhook was triggered');

    let data = this.request.body;
    let user = this.user;

    yield fb.handle(data, user);

    this.response.status = 200;
    this.response.body = 'ok;'
});

router.get('/env', function *() {
    this.body = process.env;
});
router.get('/config', function *() {
    this.body = config;
});


module.exports = router.routes();