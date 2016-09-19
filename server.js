'use strict';

const koa = require('koa');
const bodyParser = require('koa-bodyparser');

const config = require('./config');

let app = new koa();
let port = process.env.PORT || config.server.port;

// const fbClient = require('./Clients').fb;
/*fbClient.setPersistentMenu([
    {
        type: 'postback',
        title: '10 minutes',
        payload: JSON.stringify({command: {alert: {time: 10, unit: 'm'}}})
    },
    {
        type: 'postback',
        title: '7 minutes',
        payload: JSON.stringify({command: {alert: {time: 7, unit: 'm'}}})
    },
    {
        type: 'postback',
        title: '5 minutes',
        payload: JSON.stringify({command: {alert: {time: 5, unit: 'm'}}})
    },
    {
        type: 'postback',
        title: 'More',
        payload: JSON.stringify({request: {value: 'more'}})
    },
    {
        type: 'postback',
        title: 'Less',
        payload: JSON.stringify({request: {value: 'less'}})
    }
]).then((data) => {
    console.log('res:', data);
});*/

/*let model = require('./models/Model');
model.getUserAlert(5)
    .then((result) => {
        console.log(result);
    }).catch((err) => {
    console.log(err);
});*/

app.use(bodyParser())
    .use(require('./routes'))
    .listen(port, () => {
        console.log(`Server is up on port ${port}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });