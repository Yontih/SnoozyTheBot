'use strict';

const VALIDATION_TOKEN = 'hello_world_123';
const request = require('request');

const token = 'EAAK2MzqoLPIBAAEBj0q3sBaHVAavdeqbfZAL5m4LZCeBBx4t4ZCcNPlEvw9DUSeJxPMlBr3zTyIBkWoN2NecNCYwoivIHXGA7UPsA3phEYZBz5qww4vRrjcyLtcZACYO9SZAPF0ZCs1iOmigYOl3urXpyDpZBwjjPovLf88ccXW90QZDZD';

function sendTextMessage(sender, text) {
    let messageData = {text: text}
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: token},
        method: 'POST',
        json: {
            recipient: {id: sender},
            message: messageData,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}


class Webhook {
    static *handle() {
        let req = this.request;
        let res = this.response;
        let data = req.body;

        console.log('webhook was triggered');
        console.log(data);

        if (data.object && data.object == 'page') {
            let pageEntry = data.entry[0];

            if (pageEntry) {
                for (let event of pageEntry.messaging) {
                    let sender = event.sender.id;
                    let msg = event.message.text;

                    console.log(`${sender}: ${msg}`);
                    sendTextMessage(sender, msg);
                }
            }

            this.status = 200;

            /*let entries = data.entry;

             for (let entry of entries) {
             console.log(`${new Date(entry.time)}: id ${entry.id}`);
             let messaging = entry.messaging;
             for (let msg of messaging) {
             let sender = msg.sender;
             }
             }*/

            //this.body = data;
            // console.log(JSON.stringify(data));
        } else {
            this.body = Webhook._validateWebhook(req, res);
        }
    }

    static _validateWebhook(req, res) {
        let response;
        if (req.query['hub.mode'] === 'subscribe' &&
            req.query['hub.verify_token'] === VALIDATION_TOKEN) {
            response = req.query['hub.challenge'];
        } else {
            res.status = 403;
            response = 'Failed validation. Make sure the validation tokens match.'
        }

        return response;
    }

}

module.exports = Webhook;