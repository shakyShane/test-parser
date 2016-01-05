'use strict';

class BlockNode {
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
        this.blockType = obj.blockType;
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
        this.hash     = obj.hash;
        /**
         * @type array
         */
        this.ctx       = obj.ctx;
        /**
         * @type object
         */
        this.loc       = obj.loc;
        /**
         * @type array
         */
        this.body      = [];
    }

    /**
     * @returns {object}
     */
    getHash () {
        return this.excludeCtx('hash');
    }
    /**
     * @returns {object}
     */
    getAttrs () {
        return this.excludeCtx('attrs');
    }

    /**
     * Iterate over hash/attrs and remove anything matched in initial
     * ctx array
     * eg: {{#each this.tags sep="\n" other=this.name}}
     * ->  ctx: ['this.tags']
     *     attrs: {sep: '\n'}
     *     hash:  {other: value}
     * @param key
     * @returns {*}
     */
    excludeCtx (key) {
        const n = this;
        return Object.keys(this[key]).reduce((a, _key) => {
            if (n.ctx.indexOf(_key) === -1) {
                a[_key] = n[key][_key];
            }
            return a;
        }, {});
    }

    raw () {
        return this
            .subject
            .substring(this.loc.openTag.end, this.loc.closeTag.start);
    }
    outer () {
        return this
            .subject
            .substring(this.loc.start, this.loc.end);
    }
}

module.exports = BlockNode;
