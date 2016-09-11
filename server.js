'use strict';

const koa = require('koa');
const bodyParser = require('koa-bodyparser');

const config = require('./config');

let app = new koa();
let port = process.env.PORT || config.server.port;

/*const fbClient = require('./Clients').fb;
fbClient.setGreetingText('Welcome to SnoozyTheBot')
    .then(() => {
        console.log('set');
    });*/

app.use(bodyParser())
    .use(require('./routes'))
    .listen(port, () => {
        console.log(`Server is up on port ${port}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
