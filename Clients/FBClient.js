'use strict';

const Promise = require('bluebird');
const FBMessenger = require('fb-messenger');
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
        this.pageId = _.get(options, 'pageId');
        this.client = new FBMessenger(this.token);
        Promise.promisifyAll(this.client);
    }

    sendTextMessage(userId, text, notificationType) {
        return this.client.sendTextMessageAsync(userId, text);
    }

    sendButtonsMessage(userId, text, buttons, notificationType) {
        return this.client.sendButtonsMessageAsync(userId, text, buttons, notificationType);
    }

    setPersistentMenu(buttons) {
        return this.client.setPersistentMenuAsync(this.pageId, buttons);
    }

    sendMessage(userId, data, notificationType) {
        return this.client.sendMessageAsync(userId, data, notificationType);
    }

    getProfile(userId) {
        return this.client.getProfileAsync(userId);
    }

    setGreetingText(text) {
        return this.client.setGreetingTextAsync(this.pageId, text);
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