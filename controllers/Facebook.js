'use strict';

const _ = require('lodash');
const moment = require('moment');

const client = require('../Clients').fb;
const model = require('../models/Model');

const VALIDATION_TOKEN = 'hello_world_123';

function generateButton(title, payload, type) {
    type = type || 'postback';
    return {
        type: type,
        title: title,
        payload: payload
    };
}

function generateTimesButtons(values) {
    return values.map((value) => {
        let payload = JSON.stringify({
            command: {
                alert: {
                    time: value,
                    unit: 'minutes'
                }
            }
        });
        return generateButton(`${value} minutes`, payload);
    });
}

function *sendTimeButtons(userId, text, values) {
    let buttons = generateTimesButtons(values);
    try {
        yield client.sendButtonsMessage(userId, text, buttons);
    } catch (err) {
        console.error(err);
    }
}

function transformEventMessage(value) {
    if (typeof value !== "object") {
        try {
            value = JSON.parse(value);
        } catch (err) {
            value = value.toLowerCase();
        }
    }

    return value;
}

function parseEvent(event, user) {
    let senderId = event.sender.id;
    let timestamp = event.timestamp;
    let value = null, type, additionalData = {};
    // extract command from message or postback events
    if (event.message) {
        value = event.message.text;
        additionalData = _.omit(event.message, 'text');
        type = 'message';
    } else if (event.postback) {
        value = event.postback.payload;
        type = 'postback';
    } else {
        throw new Error('Unknown event type');
    }

    return Object.assign(
        {},
        additionalData,
        {
            message: {
                type,
                userExternalId: senderId,
                timestamp: timestamp,
                body: transformEventMessage(value),
            },
            user: user
        }
    );
}

class Facebook {
    /**
     * @param data: facebook messanger api object
     */
    *handle(data, user) {
        if (data.object && data.object == 'page') {
            for (let pageEntry of data.entry) {
                if (pageEntry) {
                    for (let event of pageEntry.messaging) {
                        let parsedEvent = null;
                        if (event.message || event.postback) {
                            parsedEvent = parseEvent(event, user);
                        } else if (event.delivery) {
                            // Webhook._receivedDeliveryConfirmation(event);
                        } else if (event.optin) {
                            // Webhook._receivedAuthentication(event)
                        } else {
                            console.log('Unknown message');
                        }

                        if (parsedEvent) {
                            console.log(parsedEvent);
                            yield processEvent(parsedEvent);
                        }
                    }
                }
            }
        }
    }

    static validateWebhook() {
        let req = this.request;
        let res = this.response;

        console.log('GET/Webhook was triggered');

        let resMsg;
        if (req.query['hub.mode'] === 'subscribe' &&
            req.query['hub.verify_token'] === VALIDATION_TOKEN) {
            resMsg = req.query['hub.challenge'];
        } else {
            res.status = 403;
            resMsg = 'Failed validation. Make sure the validation tokens match.'
        }

        res.body = resMsg;
    }

    static *_receivedMessage(event) {
        let senderId = event.sender.id;
        let msg = event.message;
        let isEcho = msg.is_echo;
        let quickReply = msg.quick_reply;
        let msgId = msg.mid;

        if (isEcho) {
            console.log("Received echo for message %s and app %d with metadata %s",
                msgId, msg.app_id, msg.metadata);
        } else if (quickReply) {
            console.log("Quick reply for message %s with payload %s",
                msgId, quickReply.payload);

            yield client.sendTextMessage(senderId, "Quick reply tapped");
        } else {

        }
    }

    /**
     * Authorization Event
     *
     * The value for 'optin.ref' is defined in the entry point. For the "Send to
     * Messenger" plugin, it is the 'data-ref' field. Read more at
     * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
     *
     */
    static _receivedAuthentication(event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfAuth = event.timestamp;

        // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
        // The developer can set this to an arbitrary value to associate the
        // authentication callback with the 'Send to Messenger' click event. This is
        // a way to do account linking when the user clicks the 'Send to Messenger'
        // plugin.
        var passThroughParam = event.optin.ref;

        console.log("Received authentication for user %d and page %d with pass " +
            "through param '%s' at %d", senderID, recipientID, passThroughParam,
            timeOfAuth);

        // When an authentication is received, we'll send a message back to the sender
        // to let them know it was successful.
        // sendTextMessage(senderID, "Authentication successful");
    }

    /**
     * Delivery Confirmation Event
     *
     * This event is sent to confirm the delivery of a message. Read more about
     * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
     *
     */
    static _receivedDeliveryConfirmation(event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var delivery = event.delivery;
        var messageIDs = delivery.mids;
        var watermark = delivery.watermark;
        var sequenceNumber = delivery.seq;

        if (messageIDs) {
            messageIDs.forEach(function (messageID) {
                console.log("Received delivery confirmation for message ID: %s",
                    messageID);
            });
        }

        console.log("All message before %d were delivered.", watermark);
    }

    /**
     * Postback Event
     *
     * This event is called when a postback is tapped on a Structured Message.
     * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
     *
     */
    static *_receivedPostback(event) {
        var senderId = event.sender.id;
        var recipientId = event.recipient.id;
        var timeOfPostback = event.timestamp;

        // The 'payload' param is a developer-defined field which is set in a postback
        // button for Structured Messages.
        let payload = event.postback.payload;

        let text = payload.toLowerCase();
        if (text == 'more') {
            yield sendButtons(senderId, 'When should I notify you?', [15, 20, 30]);
        } else if (text == 'less') {
            yield sendButtons(senderId, 'When should I notify you?', [1, 2, 4]);
        } else {
            yield client.sendTextMessage(senderId, 'Unsupported command');
        }
    }
}

function *processEvent(event) {
    let body = event.message.body;
    let senderId = event.user.external_id;
    // value can be command (value.command) or request (value.request) or a string

    if (body.command) {
        event.message.body = body.command;
        yield processCommand(event);
    } else if (body.request) {
        event.message.body = body.request;
        yield processRequest(event)
    } else if (typeof body === 'string') {
        event.message.body = {value: body};
        yield processRequest(event)
    } else {
        yield client.sendTextMessage(senderId, 'Unsupported command');
    }
}


const greetings = ['greetings', 'hi', 'hello', 'greeting'];
function *processRequest(event) {
    let request = event.message.body;
    let userExternalId = event.user.external_id;
    let alert = event.user.alert;

    if (request.value === 'more') {
        yield sendTimeButtons(userExternalId, 'When should I notify you?', [15, 20, 30]);
    } else if (request.value === 'less') {
        yield sendTimeButtons(userExternalId, 'When should I notify you?', [1, 2, 4]);
    } else if (greetings.indexOf(request.value) > -1) {
        yield client.sendTextMessage(userExternalId, `Hi ${event.user.first_name}`);
    } else if (alert && request.value === 'when') {
        return yield client.sendTextMessage(userExternalId, `See you ${moment().to(alert.alert_time)}`);
    } else {
        yield client.sendTextMessage(userExternalId, 'Unsupported request');
    }
}

function *processCommand(event) {
    let userExternalId = event.user.external_id;
    let command = event.message.body;

    if (command.alert) {
        yield handleAlert(event.user, command);
    } else if (command.delete) {
        yield handleDelete(event.user, command);
    } else {
        yield client.sendTextMessage(userExternalId, 'What...??');
    }
}

function *handleAlert(user, command) {
    let time = Number(command.alert.time);
    let timeUnit = command.alert.unit;
    let userExternalId = user.external_id;
    let alert = user.alert;

    if (alert) {
        return yield client.sendTextMessage(userExternalId, `Alert is already activated (end ${moment().to(alert.alert_time)})`);
    } else if (!time) {
        console.log('Invalid time value: ', time);
        return;
    }

    let alertTime = moment().add(time, timeUnit);
    let alertTimeUtc = alertTime.toISOString();
    yield model.insertAlert(user.id_user, alertTime.toDate(), alertTimeUtc, 'facebook');
    yield client.sendTextMessage(userExternalId, `See you in ${time} ${timeUnit}`);
}

function *handleDelete(user, command) {
    let alert = user.alert;

    if (alert) {
        yield model.deleteAlert(alert.id_alert);
        yield client.sendTextMessage(user.external_id, 'Your alert has been deleted');
    } else {
        // send no alert message
    }
}

module.exports = Facebook;