'use strict';

const FBMessenger = require('fb-messenger');
const Promise = require('bluebird');
const _ = require('lodash');

const Client = require('./Client');

class FBClient extends Client {

    /**
     * @param options
     * @param options.token: messenger access token
     */
    constructor(options) {
        super();

        this.token = _.get(options, 'token');
        this.client = new FBMessenger(this.token);
    }

    sendTextMessage(userId, text, notificationType) {
        return new Promise((resolve, reject) => {
            this.client.sendTextMessage(userId, text, (err, body) => {
                if (err) {
                    return reject(err);
                }

                return resolve(body);
            });
        });
    }

    sendMessage(userId, data, notificationType) {
        return new Promise((resolve, reject) => {
            this.client.sendMessage(userId, data, notificationType, (err, body) => {
                if (err) {
                    return reject(err);
                }

                return resolve(body);
            });
        });
    }

    getProfile(userId) {
        return new Promise((resolve, reject) => {
            this.client.getProfile(userId, (err, body) => {
                if (err) {
                    return reject(err);
                }

                return resolve(body);
            });
        });
    }

    static get NOTIFICATION_TYPE() {
        return {
            REGULAR: 'REGULAR',
            SILENT_PUSH: 'SILENT_PUSH',
            NO_PUSH: 'NO_PUSH'
        };
    }
}

module.exports = FBClient;