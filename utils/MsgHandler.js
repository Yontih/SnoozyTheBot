'use strict';

class MsgHandler {

    process(msg) {
        if (typeof msg == 'string') {
            return this.processString(msg);
        } else if (typeof msg == 'object') {
            return this.processObject(msg);
        } else {
            throw new Error(`Unsupported msg type ${typeof msg}`);
        }
    }

    processString(msg) {

    }

    processObject(json) {

    }

}


module.exports = new MsgHandler();