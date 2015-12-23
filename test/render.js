var assert = require('chai').assert;
var parser = require('../index');
var compile = require('../compile');

describe.only('render', function () {
    it('can render from ast', function () {
        const ast = parser.parse("hello {{greeting}}");
        console.log(compile(ast, {greeting: 'world!'}));
    });
});
