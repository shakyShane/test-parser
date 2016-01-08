'use strict';

const op           = require('object-path');
const objectAssign = require('object-assign');
const helpers      = require('./helpers');
const ctxBlock     = require('./ctx-block');
const utils        = require('./utils');
const parser       = require('../index');
const debug        = require('debug')('compiler');

const maybeTag = /\{\{(.+)}}/;

const defaults     = {
    debug: false,
    inlineWarnings: true
};

/**
 * @param {Object} opts
 * @param {String} subject
 * @constructor
 */
class Compiler {
    constructor (opts, subject) {
        this._state   = [];
        this._ctx     = [];
        this.opts     = objectAssign({}, defaults, opts || {});
        this._subject = subject;

        /**
         * @type {createContext}
         */
        this.createContext = createContext;

        /**
         * Map node types to Compiler methods
         * @type {{TEXT: string, TAG: string, BLOCK: string, BLOCK_END: string}}
         */
        this.map = {
            'TEXT':      'textVistor',
            'TAG':       'openTagVisitor',
            'BLOCK':     'blockVisitor'
        }
        this.errors = {
            'DOUBLE_OPEN': (node) => {
                return [
                    `------~~-----`,
                    `New tag opened inside existing tag on LINE: ${node.error.loc.line}`,
                    `------~~-----`
                ].join('\n');
            },
            'NOT_CLOSED': (node) => {
                return [
                    `------~~-----`,
                    `Tag not closed correctly on LINE: ${node.error.loc.line}`,
                    `------~~-----`,
                ].join('\n');
            }
        }
    }

    /**
     * Entry point for compiling only. All other helpers/fns should
     * call Compiler.prototype.process instead.
     * @param {Array} ast
     * @param {Object} [data]
     * @param {Array} ctx
     */
    compile (ast, data, ctx) {
        this._data = data || {};
        if (ctx) {
            this._ctx = ctx;
        }
        return this.process(ast, this._ctx);
    }
    /**
     * Process a block of AST. For example, a helper
     * method may call this with it's own context.
     * @param {Array} ast
     * @param {Array} ctx
     * @returns {string}
     */
    process (ast, ctx) {
        const c = this;
        return ast.reduce(function (all, node) {
            return all + c[c.map[node.type]](node, ctx, c._data);
        }, '');
    }
    /**
     * Pull a value from original data given
     * a context
     * @param {Array} ctx
     * @param {*} [defaultValue]
     */
    getValueFromData (ctx, defaultValue) {
        return op.get(this._data, ctx, defaultValue);
    }

    /**
     * Text visitors only return their values
     * @param {TextNode} node
     * @returns {string}
     */
    textVistor (node) {
        return node.value;
    }

    /**
     * An open tag is something along the lines of
     * {{siteName}}
     * @param {TagNode} node
     * @param ctx
     * @param data
     */
    openTagVisitor (node, ctx, data) {
        const currentCtx = this.createContext(ctx, [node.value]);
        const value      = this.getValueFromData(currentCtx);

        if (value === undefined) {
            if (this.opts.debug) {
                const warning = `Warning: \`${currentCtx.join('.')}\` not found`;
                console.error(warning);
                if (this.opts.inlineWarnings) {
                    return warning;
                }
            } else {
                return '';
            }
        }
        return value;
    }

    /**
     * A block is something that may have it's own
     * body such as {{#each items}}{{this}}{{#each}}
     * @param {BlockNode} node
     * @param {Array} ctx
     * @returns {string}
     */
    blockVisitor (node, ctx) {
        if (node.error) {
            return this.nodeError(node);
        }
        if (node.blockType === '#') {
            if (helpers[node.value]) {
                return helpers[node.value](node, ctx, this._data, this);
            }
        }
        if (node.blockType === '@') {
            return ctxBlock(node, this._ctx, this._data, this);
        }
        console.log('Helper not found', node.value);
        return '';
    }

    /**
     * Turn 'hash' and 'attrs' into a single object,
     * where 'hash' takes precedence. Hash is processed
     * as a pathlookup, where attrs is processed as a
     * a Node
     *
     * eg: {{#each tags sep="---"}}{{this}}{{/each}}
     *  -> ctx:   ['tags']
     *  -> attrs: {sep: '---'}
     *
     * eg:   {{#each tags sep=this.sepa}}{{this}}{{/each}}
     * data: {tags: [1, 2], sepa: '~'}
     *   -> ctx:  ['tags']
     *   -> hash: {sep: '~'}
     * @param {BlockNode|TagNode} node
     * @param {Array} ctx
     * @returns {object}
     */
    getHashValues (node, ctx) {

        const c     = this;
        const hash  = node.getHash();
        const attrs = node.getAttrs();

        /**
         * convert name=var into the value of the var
         */
        const pass1 = Object.keys(hash).reduce(function (a, key) {
            a[key] = c.getValueFromPath(hash[key], ctx);
            return a;
        }, {});

        /**
         * process string attrs by re-parsing and passing context
         */
        return Object.keys(attrs).reduce(function (a, key) {
            if (!a[key]) {
                if (maybeTag.test(attrs[key])) {
                    a[key] = c.process(parser.parse(attrs[key]).body, ctx);
                } else {
                    a[key] = attrs[key];
                }
            }
            return a;
        }, pass1);
    }

    /**
     * @param {String} path
     * @param {Array} ctx
     * @returns {*}
     */
    getValueFromPath (path, ctx) {

        const currentCtx = createContext(ctx, path.split('.'));
        const value      = this.getValueFromData(currentCtx);

        if (value === undefined) {
            return this.notFoundError(currentCtx);
        }

        return value;
    }

    notFoundError (ctx) {
        if (this.opts.debug) {
            return `Warning: \`${ctx.join('.')}\` not found.`;
        }
        return '';
    }

    nodeError (node) {
        const error = this.errors[node.error.type](node);
        console.log(node.error)
        return `Syntax Error:
    ${error}
`
    }
}

/**
 * Create a lookup context from any number of arrays
 * always starting at root.
 * eg: if starting point is ['posts']
 * 1: [0, 'title']
 * 2: ['lowercase']
 * => ['posts', 0, 'title', 'lowercase']
 *
 * Note, `this` and `.` mean the current item.
 *  eg: ['posts', 0, 'this.title']
 *  =>  ['posts', 0, 'title']
 *
 *  eg: ['posts', 0, 'this.tags', 0, '.']
 *  => ['posts', 0, 'tags', 0]
 *
 * @param {Array} array1
 * @param {Array} [array2]
 * @param {Array} [array3]
 * @returns {Array}
 */
function createContext (array1, array2, array3) {
    const ctx = Array.from(arguments)
        .reduce(function (a, x) {
            return a.concat(removeThisAndSingleDots(x));
        }, []);

    /**
     * If the lookup array contains a $, reset to that point.
     *    EG: ['posts', 0, '$', 'site']
     *    =>  ['site']
     * @type {Number|number|*}
     */
    const root = ctx.indexOf('$');

    if (root > -1) {
        return ctx.slice(root+1);
    }

    return ctx;
}

/**
 * Strip `this` and `.` from incoming arrays
 * @param {Array} array
 * @returns {Array}
 */
function removeThisAndSingleDots (array) {
    return array
        .filter(x => x !== 'this' && x !== '.')
        .reduce((all, x) => {
            if (utils.isString(x)) {
                return all.concat(x.split('.')
                    .filter(x => x !== 'this'));
            }
            return all.concat(x);
        }, []);
}

/**
 * Public api helper for a single fn call.
 *    compile('string', {}, {});
 * @param parsed
 * @param data
 * @param opts
 * @public
 */
module.exports = function (parsed, data, opts) {
	const c = new Compiler(opts, parsed.subject);
    data = data || {};
    return c.compile(parsed.body, data);
};
