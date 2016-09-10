'use strict';

const Promise = require('bluebird');
const _ = require('lodash');

const MSG_URL = 'https://graph.facebook.com/v2.6/me/messages';

class FBMessenger {

    constructor(options) {
        this.token = _.get(options, 'token');
    }

    sendMessage(userId, data, notificationType) {
        let req = {
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: this.token },
            method: 'POST',
            json: {
                recipient: {
                    id: id
                },
                message: data,
                notification_type: notificationType
            }
        }
    }

    _sendRequest(req) {
        return new Promise((resolve, reject) => {
            request(req, function (err, res, body) {
                if (err) {
                    return reject(err);
                } else if (res.body.error) {
                    return reject(res.body.error);
                }

                return resolve(body);
            })
        });
    }
}

module.exports = FBMessenger;