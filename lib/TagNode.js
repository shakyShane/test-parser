'use strict';

class TagNode {
    constructor (obj, subject) {
        this.subject   = subject;
        this.type      = obj.type;
        this.value     = obj.value;
        this.attrs     = obj.attrs;
        this.loc       = obj.loc;
        this.body      = [];
    }
    toString () {
        //return this.subject.substring(this.loc.start, this.loc.end);
    }
}

module.exports = TagNode;
