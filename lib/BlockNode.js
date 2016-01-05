'use strict';

class BlockNode {
    constructor (obj, subject) {
        this.subject   = subject;
        this.type      = obj.type;
        this.blockType = obj.blockType;
        this.value     = obj.value;
        this.attrs     = obj.attrs;
        this.ctx       = obj.ctx;
        this.loc       = obj.loc;
        this.body      = [];
    }
    toString () {
        //return this.subject.substring(this.loc.start, this.loc.end);
    }
}

module.exports = BlockNode;
