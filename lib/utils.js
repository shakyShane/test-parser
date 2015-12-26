const utils   = exports;
const typeMap = {
    'object': '[object Object]',
    'string': '[object String]'
};

function isType (val, type) {
    return Object.prototype.toString.call(val) === typeMap[type];
}

utils.isPlainObj = (val) => isType(val, 'object');
utils.isString   = (val) => isType(val, 'string');