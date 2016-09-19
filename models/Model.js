'use strict';

const _ = require('lodash');

class Model {
    constructor() {
        this.db = require('../utils/DB').instance;
    }

    /**
     * @param source
     * @param user:
     * @param user.first_name
     * @param user.last_name
     * @param user.gender
     * @param user.external_id
     * @param user.additional_data: json
     * @param user.profile_pic: user profile picture
     */
    upsertUser(source, user) {
        return this.db.query('SELECT "id_user" FROM "public"."snoozy_users" WHERE "external_id" = $1', [user.external_id])
            .then((result) => {
                result = _.head(result);
                let promise = null;
                if (result) {
                    // update user
                    promise = this.db.query('UPDATE "public"."snoozy_users" SET "first_name"=$1, "last_name"=$2, "profile_pic"=$3 WHERE "id_user"=$4 ' +
                        'RETURNING "external_id", "first_name", "last_name", "gender", "join_date", "id_user", "source", "additional_data", "profile_pic"',
                        [user.first_name, user.last_name, user.profile_pic, result.id_user]);

                } else {
                    // insert user
                    promise = this.db.query('INSERT INTO "public"."snoozy_users"("external_id", "first_name", "last_name", "gender", "source", "additional_data", "profile_pic") VALUES($1, $2, $3, $4, $5, $6, $7) ' +
                        'RETURNING "external_id", "first_name", "last_name", "gender", "join_date", "id_user", "source", "additional_data", "profile_pic"',
                        [user.external_id, user.first_name, user.last_name, user.gender, source, user.additional_data, user.profile_pic]);

                }

                return this._oneResult(promise);
            });
    }

    getUserById(userId) {
        return this._oneResult(
            this.db.query('SELECT * FROM "public"."snoozy_users" WHERE "id_user" = $1', [userId])
        );
    }

    getUserAlert(userId) {
        return this._oneResult(
            this.db.query('SELECT *, ' +
                'date_trunc($1, (alert_time - now()))::text as "interval_text", ' +
                '(alert_time - now()) as "interval" ' +
                'FROM "public"."snoozy_alerts" where "id_user" = $2',
                ['seconds', userId])
        );
    }

    /**
     * @param userId: user id
     * @param date:
     * @param dateUtc: date as utc
     * @param additionalData
     * @param source: who should the
     * @returns {*}
     */
    insertAlert(userId, date, dateUtc, source, additionalData) {
        return this.db.query(
            `INSERT INTO "public"."snoozy_alerts"("id_user", "alert_time_utc", "alert_time", "source", "additional_data") 
            VALUES($1, $2, $3, $4, $5) RETURNING "id_alert"`,
            [userId, dateUtc, date, source, additionalData]
        );
    }

    deleteAlertByUser(userId) {
        return this.db.query('DELETE FROM "public"."snoozy_alerts" WHERE "id_user" = $1', [userId]);
    }

    deleteAlert(alertId) {
        return this.db.query('DELETE FROM "public"."snoozy_alerts" WHERE "id_alert" = $1', [alertId]);
    }

    _oneResult(promise) {
        return promise
            .then((result) => {
                return Promise.resolve(_.head(result));
            });
    }
}

module.exports = new Model();