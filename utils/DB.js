'use strict';

const pg = require('pg');

pg.defaults.ssl = true;

class DB {
    constructor(config) {
        this.pool = new pg.Pool(config);
    }

    startTransaction() {
        return this._getClient()
            .then((client) => {
                return client.query('BEGIN;').return(client);
            })
            .then((client) => {
                return new Transaction(client);
            });
    }

    query(sql, args) {
        return this.pool.query(sql, args)
            .then((result) => result.rows);
    }

    _getClient() {
        return this.pool.connect();
    }
}

class Transaction {
    /**
     * @param client: pg connection client
     */
    constructor(client) {
        this.client = clinet;
    }

    query(sql, args) {
        return this.client.query(sql, args)
            .then((result) => result.rows)
    }

    commit() {
        return this.query('COMMIT;')
            .then(() => {
                return this._end();
            });
    }

    rollback() {
        return this.query('ROLLBACK;')
            .then(() => {
                return this._end();
            });
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