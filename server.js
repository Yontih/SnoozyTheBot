'use strict';

const koa = require('koa');
const Router = require('koa-router');

let app = new koa();
let router = Router();

router.all('/webhook', function *() {
    this.body = 33204178;
});

router.get('/', function *() {
    this.body = 'Hello from SnoozyTheBot';
});

let port = process.env.PORT || 5485;
app.use(router.routes())
    .listen(port, () => {
        console.log(`Server is up on port ${port}`);
    });
