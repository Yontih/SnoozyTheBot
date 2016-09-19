'use strict';

const _ = require('lodash');
const memoize = require('memoizee');

const model = require('../models/Model');

module.exports = function *(next) {
    let userId = _.get(this.user, 'id_user');

    if (userId) {
        this.user.alert = yield getAlert(userId);
    }

    yield next;
};

const getAlert = memoize((userId) => model.getUserAlert(userId), {
    length: 1,
    promise: 'then',
    maxAge: 1000 * 60 * 5 // 5 minutes
});

