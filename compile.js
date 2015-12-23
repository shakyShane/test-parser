const map = {
    'TEXT': textVistor,
    'OPEN_TAG': openTagVisitor
};

function compile (ast, data) {
    return ast.reduce(function (all, item) {
        return all + map[item.type](item, data);
    }, '');
}

function textVistor (node) {
    return node.value;
}

function openTagVisitor (node, data) {
    if (data[node.value]) {
        return data[node.value];
    }
    return '';
}

module.exports = compile;
