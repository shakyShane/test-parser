const op           = require('object-path');
const objectAssign = require('object-assign');
const helpers      = require('./helpers');
const ctxBlock     = require('./ctx-block');
const utils        = require('./utils');
const debug        = require('debug')('compiler');
const defaults     = {
    debug: false
};

function Compiler (opts) {
    this._state = [];
    this._ctx   = [];
    this.opts   = objectAssign({}, defaults, opts || {});
}

Compiler.prototype.map = {
    'TEXT': 'textVistor',
    'TAG': 'openTagVisitor',
    'BLOCK': 'blockVisitor',
    'BLOCK_END': 'blockEndVistor'
};

Compiler.prototype.compile = function (ast, data, ctx) {
    const c = this;
    c._data = data;
    if (ctx) {
        c._ctx = ctx;
    }
    return c.process(ast, c._ctx);
};

Compiler.prototype.process = function (ast, ctx) {
    var c = this;
    return ast.reduce(function (all, node) {
        return all + c[c.map[node.type]](node, ctx, c._data);
    }, '');
};

Compiler.prototype.getValueFromData = function (ctx, defaultValue) {
    return op.get(this._data, ctx, defaultValue);
};

Compiler.prototype.textVistor = function (node) {
    return node.value;
};

/**
 * @param node
 * @param ctx
 * @param data
 */
Compiler.prototype.openTagVisitor = function(node, ctx, data) {
    const c = this;
    const currentCtx = this.createCtx(ctx, [node.value]);
    const value = op.get(data, currentCtx);

    if (c.opts.debug) {
        if (value === undefined) {
            console.log(`Warning: ${currentCtx.join('.')} not found`);
        }
    }

    return value;

    //console.log('ctx', this.createCtx(ctx, [node.value]));
    //if (node.value.match(/^(this|\.)/)) {
    //    return op.get(data, ctx, '');
    //}
    //return op.get(data, ctx.concat(node.value.split('.')), '');
};

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
 * @param {Array} array1
 * @param {Array} [array2]
 * @param {Array} [array3]
 * @returns {Array}
 */
Compiler.prototype.createCtx = function (array1, array2, array3) {
    return Array.from(arguments)
        .reduce(function (a, x) {
            return a.concat(cleanVar(x));
        }, []);
};

function cleanVar (array) {
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

module.exports = function (ast, data, opts) {
	const c = new Compiler(opts);
    data = data || {};
    return c.compile(ast, data);
};
