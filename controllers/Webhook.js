'use strict';

const VALIDATION_TOKEN = 'hello_world_123';

class Webhook {
    static *handle() {
        let req = this.request;
        let res = this.response;
        let data = req.body;

        console.log('webhook was triggered');

        if (data.object && data.object == 'page') {
            //this.body = data;
            console.log(JSON.stringify(data));
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