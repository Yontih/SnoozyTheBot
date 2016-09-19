'use strict';

const _ = require('lodash');
const memoize = require('memoizee');

const model = require('../models/Model');
const fbClient = require('../Clients').fb;

module.exports = function *(next) {
    let body = this.request.body;
    let userExternalId = _.get(body, 'entry[0].messaging[0].sender.id');

    if (userExternalId) {
        let userDetails = yield getProfile(userExternalId);
        userDetails = _.merge(userDetails, {
            external_id: userExternalId
        });
        this.user = yield upsertUser(userExternalId, userDetails);
    } else {
        console.log('Cant find user external id for: ', body);
    }

    yield next;
};

const DAY = 1000 * 60 * 60 * 24;
const getProfile = memoize((userExternalId) => fbClient.getProfile(userExternalId), {
    length: 1,
    promise: 'then',
    maxAge: DAY
});

const upsertUser = memoize((userExternalId, userDetails) => model.upsertUser('facebook', userDetails), {
    length: 1,
    promise: 'then',
    maxAge: DAY
});