'use strict';

class TextNode {
    constructor (obj, subject) {
        /**
         * @type string
         */
        this.subject  = subject;
        /**
         * @type string
         */
        this.type     = obj.type;
        /**
         * @type string
         */
        this.value    = obj.value;
        /**
         * @type object
         */
        this.loc      = obj.loc;
    }
    toString () {
        return this.subject.substring(this.loc.start, this.loc.end);
    }
}

module.exports = TextNode;
