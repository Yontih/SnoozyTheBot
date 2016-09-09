'use strict';

const koa = require('koa');
const Router = require('koa-router');

let app = new koa();
let router = Router();

const VALIDATION_TOKEN = 'hello_world_123';

router.all('/webhook', function *() {
    let req = this.request;
    let resValue;
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === VALIDATION_TOKEN) {
        resValue = req.query['hub.challenge'];
    } else {
        this.status = 403;
        resValue = 'Failed validation. Make sure the validation tokens match.'
    }

    this.body = resValue;
});

router.get('/', function *() {
    this.body = 'Hello from SnoozyTheBot';
});

let port = process.env.PORT || 5485;
app.use(router.routes())
    .listen(port, () => {
        console.log(`Server is up on port ${port}`);
    });
