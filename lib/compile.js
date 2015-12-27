const op           = require('object-path');
const objectAssign = require('object-assign');
const helpers      = require('./helpers');
const ctxBlock     = require('./ctx-block');
const utils        = require('./utils');
const debug        = require('debug')('compiler');

const defaults     = {
    debug: false,
    inlineWarnings: true
};

/**
 * @param {Object} opts
 * @param {String} subject
 * @constructor
 */
function Compiler (opts, subject) {
    this._state   = [];
    this._ctx     = [];
    this.opts     = objectAssign({}, defaults, opts || {});
    this._subject = subject;
}

/**
 * Map node types to Compiler methods
 * @type {{TEXT: string, TAG: string, BLOCK: string, BLOCK_END: string}}
 */
Compiler.prototype.map = {
    'TEXT':      'textVistor',
    'TAG':       'openTagVisitor',
    'BLOCK':     'blockVisitor',
    'BLOCK_END': 'blockEndVistor'
};

/**
 * Entry point for compiling only. All other helpers/fns should
 * call Compiler.prototype.process instead.
 * @param {Array} ast
 * @param {Object} [data]
 * @param {Array} ctx
 */
Compiler.prototype.compile = function (ast, data, ctx) {
    const c = this;
    c._data = data || {};
    if (ctx) {
        c._ctx = ctx;
    }
    return c.process(ast, c._ctx);
};

/**
 * Process a block of AST. For example, a helper
 * method may call this with it's own context.
 * @param {Array} ast
 * @param {Array} ctx
 * @returns {string}
 */
Compiler.prototype.process = function (ast, ctx) {
    var c = this;
    return ast.reduce(function (all, node) {
        return all + c[c.map[node.type]](node, ctx, c._data);
    }, '');
};

/**
 * Pull a value from original data given
 * a context
 * @param {Array} ctx
 * @param {*} [defaultValue]
 */
Compiler.prototype.getValueFromData = function (ctx, defaultValue) {
    return op.get(this._data, ctx, defaultValue);
};

/**
 * Text visitors only return their values
 * @param node
 * @returns {string}
 */
Compiler.prototype.textVistor = function (node) {
    return node.value;
};

/**
 * An open tag is something along the lines of
 * {{siteName}}
 * @param node
 * @param ctx
 * @param data
 */
Compiler.prototype.openTagVisitor = function(node, ctx, data) {
    const c = this;
    const currentCtx = this.createCtx(ctx, [node.value]);
    const value      = this.getValueFromData(currentCtx);

    if (c.opts.debug) {
        if (value === undefined) {
            console.log(`Warning: ${currentCtx.join('.')} not found`);
            if (c.opts.inlineWarnings) {
                return `Warning: ${currentCtx.join('.')} not found`;
            }
        }
    }

    return value;
};

/**
 * A block is something that may have it's own
 * body such as {{#each items}}{{this}}{{#each}}
 * @param {Array} node
 * @param {Array} ctx
 * @returns {string}
 */
Compiler.prototype.blockVisitor = function (node, ctx) {
    const c = this;
    if (node.blockType === '#') {
        if (helpers[node.value]) {
            return helpers[node.value](node, ctx, c._data, c);
        }
    }
    if (node.blockType === '@') {
        return ctxBlock(node, c._ctx, c._data, c);
    }
    console.log('Helper not found', node.value);
    return '';
};

Compiler.prototype.blockEndVistor = function () {
    const c = this;
    c._state.pop();
    return '';
};

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
Compiler.prototype.createCtx = function (array1, array2, array3) {

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
};

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
