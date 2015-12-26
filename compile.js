const op           = require('object-path');
const objectAssign = require('object-assign');
const helpers      = require('./helpers');
const ctxBlock     = require('./ctx-block');
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

Compiler.prototype.openTagVisitor = function(node, ctx, data) {
    if (node.value.match(/^(this|\.)/)) {
        return op.get(data, ctx, '');
    }

    return op.get(data, ctx.concat(node.value.split('.')), '');
};

Compiler.prototype.blockVisitor = function (node, data) {
    const c = this;
    if (node.blockType === '#') {
        if (helpers[node.value]) {
            return helpers[node.value](node, c._ctx, c._data, c);
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

module.exports = function (ast, data, opts) {
	const c = new Compiler(opts);
    return c.compile(ast, data);
};
