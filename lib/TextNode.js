'use strict';

class TextNode {
    constructor (obj, subject) {
        this.subject  = subject;
        this.type     = obj.type;
        this.value    = obj.value;
        this.loc      = obj.loc;
    }
    toString () {
        return this.subject.substring(this.loc.start, this.loc.end);
    }
}

module.exports = TextNode;
