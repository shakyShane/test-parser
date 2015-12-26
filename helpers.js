const helpers = {
    'each': function (node, ctx, data, c) {

        var cuCtx = ctx.concat(node.ctx);
        var d     = c.getValueFromData(cuCtx);

        if (Array.isArray(d)) {
            return d.reduce((a, x, i) => {
                return a + c.process(node.body, cuCtx.concat(i));
            }, '');
        }

        if (d === undefined) {
            if (c.opts.debug) {
                return `Warning: \`${cuCtx.join('.')}\` not found.`;
            }
            return '';
        }
    }
};

module.exports = helpers;