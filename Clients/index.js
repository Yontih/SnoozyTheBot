'use strict';

const config = require('../config');
const FBClient = require('./FBClient');

let instances = {
    fb: null
};

function getFBInstance() {
    if (!instances.fb) {
        instances.fb = new FBClient({
            token: config.fb.token,
            pageId: config.fb.pageId
        });
    }

    return instances.fb;
}

module.exports = {
    fb: getFBInstance()
};