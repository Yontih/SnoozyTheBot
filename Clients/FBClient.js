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
        /*return new Promise((resolve, reject) => {
         this.client.sendTextMessage(userId, text, (err, body) => {
         if (err) {
         return reject(err);
         }

         return resolve(body);
         });
         });*/
    }

    sendMessage(userId, data, notificationType) {
        return this.client.sendMessageAsync(userId, data, notificationType);
        /*return new Promise((resolve, reject) => {
         this.client.sendMessage(userId, data, notificationType, (err, body) => {
         if (err) {
         return reject(err);
         }

         return resolve(body);
         });
         });*/
    }

    getProfile(userId) {
        return this.client.getProfileAsync(userId);
        /*        return new Promise((resolve, reject) => {
         this.client.getProfile(userId, (err, body) => {
         if (err) {
         return reject(err);
         }

         return resolve(body);
         });
         });*/
    }

    setGreetingText(text) {
        return this.client.setGreetingTextAsync(this.pageId, text);
        /*return new Promise((resolve, reject) => {
         this.client.setGreetingText(this.pageId, text, (err, body) => {
         if (err) {
         return reject(err);
         }

         return resolve(body);
         });
         });*/
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