'use strict';

const koa = require('koa');
const Router = require('koa-router');

let app = new koa();
let router = Router();

const VALIDATION_TOKEN = 'hello_world_123';

router.all('/webhook', function *() {
    let req = this.request;
    let data = req.body;

    if (data.object && data.object == 'page') {
        //this.body = data;
        console.log(data);
    } else {
        this.body = validateWebhook(req);
    }
});

function validateWebhook(req) {
    let response;
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === VALIDATION_TOKEN) {
        response = req.query['hub.challenge'];
    } else {
        this.status = 403;
        response = 'Failed validation. Make sure the validation tokens match.'
    }

    return response;
}

router.get('/', function *() {
    this.body = 'Hello from SnoozyTheBot';
});

let port = process.env.PORT || 5485;
app.use(router.routes())
    .listen(port, () => {
        console.log(`Server is up on port ${port}`);
    });
