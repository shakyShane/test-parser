const utils = require('./utils');
const debug = require('debug')('helper:each');

const helpers = {

    'each': function (node, ctx, data, c) {

        var currentCtx  = ctx.concat(node.ctx);
        var currentData = c.getValueFromData(currentCtx);

        //debug('value', node.value);
        //debug('ctx',   currentCtx);

        if (utils.isPlainObj(currentData)) {
            return Object.keys(currentData).reduce((a, key, i) => {
                return a + c.process(node.body, currentCtx.concat(key));
            }, '');
        }

        if (Array.isArray(currentData)) {
            return currentData.reduce((a, x, i) => {
                return a + c.process(node.body, currentCtx.concat(i));
            }, '');
        }

        if (currentData === undefined) {
            if (c.opts.debug) {
                return `Warning: \`${currentCtx.join('.')}\` not found.`;
            }
            return '';
        }
    }
};

module.exports = helpers;