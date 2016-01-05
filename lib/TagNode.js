'use strict';

class TagNode {
    constructor (obj, subject) {
        /**
         * @type string
         */
        this.subject   = subject;
        /**
         * @type string
         */
        this.type      = obj.type;
        /**
         * @type string
         */
        this.value     = obj.value;
        /**
         * @type object
         */
        this.attrs     = obj.attrs;
        /**
         * @type object
         */
        this.loc       = obj.loc;
        /**
         * @type array
         */
        this.body      = [];
    }
    toString () {
        //return this.subject.substring(this.loc.start, this.loc.end);
    }
}

module.exports = TagNode;
