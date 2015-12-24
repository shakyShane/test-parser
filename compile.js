const op          = require('object-path');
const objectAssign = require('object-assign');
const defaults = {
    debug: false
};
const helpers = {
    'each': function (node, data, c) {
        var data = c.getData(c._state, data);
        if (Array.isArray(data)) {
            return data.reduce((a, x) => a + x, '');
        }

        if (data === undefined) {
            if (c.opts.debug) {
                return `Warning: \`${c._state.join('.')}\` not found.`;
            }
            return '';
        }
    }
};

function Compiler (opts) {
    this._state = [];
    this.opts = objectAssign({}, defaults, opts || {});
}

Compiler.prototype.map = {
    'TEXT': 'textVistor',
    'TAG': 'openTagVisitor',
    'BLOCK': 'blockVisitor',
    'BLOCK_END': 'blockEndVistor'
};

Compiler.prototype.getData = function (path, data, defaultValue) {
    return op.get(data, path);
};

Compiler.prototype.compile = function (ast, data) {
    const c = this;
    return ast.reduce(function (all, item) {
        return all + c[c.map[item.type]](item, data);
    }, '');
};

Compiler.prototype.textVistor = function (node) {
    return node.value;
};

Compiler.prototype.openTagVisitor = function(node, data) {
    return op.get(data, node.value, '');
};

Compiler.prototype.blockVisitor = function (node, data) {
    const c = this;
    c._state.push.apply(c._state, node.ctx);
    if (helpers[node.value]) {
        return helpers[node.value](node, data, c);
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
