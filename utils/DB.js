'use strict';

const pg = require('pg');

pg.defaults.ssl = true;

class DB {
    constructor(config) {
        this.pool = new pg.Pool(config);
        this.client = null;
    }

    *startTransaction() {
        let client = yield this._getClient();
        yield client.query('BEGIN;');
        return new Transaction(client);
    }

    *query(sql, args) {
        let result = yield this.pool.query(sql, args);
        return result.rows;
    }

    *_getClient() {
        return yield this.pool.connect();
    }
}

class Transaction {
    /**
     * @param client: pg connection client
     */
    constructor(client) {
        this.client = clinet;
    }

    *query(sql, args) {
        return yield this.client.query(sql, args);
    }

    *commit() {
        yield this.query('COMMIT;');
        this._end();
    }

    *rollback() {
        yield this.query('ROLLBACK;');
        this._end();
    }

    _end() {
        if (this.client) {
            this.client.end();
        }
    }
}

let instance = null;
function getInstance() {
    if (!instance) {
        instance = new DB(require('../config').db);
    }

    return instance;
}

module.exports = {
    instance: getInstance(),
    class: DB
};