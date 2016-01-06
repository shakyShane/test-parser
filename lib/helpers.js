const utils = require('./utils');
const debug = require('debug')('helper:each');

const helpers = {

    /**
     * @param {BlockNode} node
     * @param ctx
     * @param data
     * @param c
     * @returns {*}
     */
    'each': function (node, ctx, data, c) {

        var currentCtx  = c.createContext(ctx, node.ctx);
        var currentData = c.getValueFromData(currentCtx);
        const hash      = c.getHashValues(node, ctx);
        const separator = hash.sep || '';

        if (utils.isPlainObj(currentData)) {
            return processObj(node, currentData, currentCtx, separator, c);
        }

        if (Array.isArray(currentData)) {
            return processArray(node, currentData, currentCtx, separator, c);
        }

        if (currentData === undefined) {
            return c.notFoundError(currentCtx);
        }
    }
};

module.exports = helpers;

function processObj (node, data, ctx, sep, c) {
    const keys = Object.keys(data);
    const len  = keys.length;
    return keys.reduce((a, key, i) => {
        return a + c.process(node.body, ctx.concat(key)) + (i < len-1 ? sep : '');
    }, '');
}

function processArray (node, data, ctx, sep, c) {
    const len = data.length;
    return data.reduce((a, x, i) => {
        return a + c.process(node.body, ctx.concat(i)) + (i < len-1 ? sep : '');
    }, '');
}
