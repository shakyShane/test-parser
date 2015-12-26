module.exports = function (node, ctx, data, c) {
    return c.process(node.body, ctx.concat(node.value.split('.')));
};