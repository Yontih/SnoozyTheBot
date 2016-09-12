'use strict';

const _ = require('lodash');
const client = require('../Clients').fb;

const VALIDATION_TOKEN = 'hello_world_123';

function generateButtons(values) {
    return values.map((value) => {
        let payload = JSON.stringify({command: `${value}m`});
        return {
            type: 'postback',
            title: `${value} minutes`,
            payload: payload
        };
    });
}

function *sendButtons(userId, text, values) {
    let buttons = generateButtons(values);
    try {
        yield client.sendButtonsMessage(userId, text, buttons);
    } catch (err) {
        console.error(err);
    }
}

function tryParseJson(value) {
    try {
        return JSON.parse(value);
    } catch (err) {
        return value;
    }
}

function parseEvent(event) {
    let senderId = event.sender.id;
    let timestamp = event.timestamp;
    let value = null, type, additonalData = {};
    // extract command from message or postback events
    if (event.message) {
        value = event.message.text;
        additonalData = _.omit(event.message, 'text');
        type = 'message';
    } else if (event.postback) {
        value = event.postback.payload;
        type = 'postback';
    } else {
        throw new Error('Unknown event type');
    }

    return Object.assign(
        {},
        additonalData,
        {
            type,
            userPageId: senderId,
            timestamp: timestamp,
            value: value.toLowerCase()
        }
    );
}

class Webhook {
    static *handle() {
        let req = this.request;
        let res = this.response;
        let data = req.body;

        console.log('POST/Webhook was triggered');
        console.log('body:', JSON.stringify(data));

        if (data.object && data.object == 'page') {
            for (let pageEntry of data.entry) {
                if (pageEntry) {
                    let parsedEvent = null;
                    for (let event of pageEntry.messaging) {
                        if (event.message || event.postback) {
                            parsedEvent = parseEvent(event);
                        } else if (event.delivery) {
                            // Webhook._receivedDeliveryConfirmation(event);
                        } else if (event.optin) {
                            // Webhook._receivedAuthentication(event)
                        } else {
                            console.log('Unknown message');
                        }
                    }

                    if (parsedEvent) {
                        yield processParsedEvent(parsedEvent);
                    }
                }
            }
        }

        res.status = 200;
        res.body = 'ok;'
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

            let text = msg.text.toLowerCase();
            if (text == 'more') {
                yield sendButtons(senderId, 'More', [15, 20, 30]);
            } else if (text == 'less') {
                yield sendButtons(senderId, 'More', [1, 2, 4]);
            } else {
                yield client.sendTextMessage(senderId, 'Unsupported command');
            }
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

    /*
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

function *processParsedEvent(event) {
    let value = event.value;
    // value can be command (value.command) or request (value.request) or a string

    if (value.command) {
        event.value = value.command;
        yield processCommand(event);
    } else if (value.request) {
        event.value = value.request;
        yield processRequest(event)
    } else if (typeof value === 'string') {
        yield processRequest(event)
    } else {
        yield client.sendTextMessage(senderId, 'Unsupported command');
    }
}

function *processCommand(event) {
    yield client.sendTextMessage(event.userPageId, `Processing ${event.value}`);
}

function *processRequest(event) {
    let value = event.value;

    if (value === 'more') {
        yield sendButtons(senderId, 'When should I notify you?', [15, 20, 30]);
    } else if (value === 'less') {
        yield sendButtons(senderId, 'When should I notify you?', [1, 2, 4]);
    } else {
        yield client.sendTextMessage(senderId, 'Unsupported request');
    }
}

module.exports = Webhook;