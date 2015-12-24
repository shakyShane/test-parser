var assert = require('chai').assert;
var parser = require('../index');
var compile = require('../compile');

describe('render', function () {
    it('can render var', function () {
        const ast = parser.parse("hello {{greeting}}");
        assert.equal(compile(ast.body, {greeting: 'world!'}), 'hello world!');
    });
    it('can render nested var', function () {
        const ast = parser.parse("hello {{greetings.eng}}");
        assert.equal(compile(ast.body, {
            greetings: {
                eng: 'world!'
            }
        }), 'hello world!');
    });
    it('can render each blocks with array', function () {
        const ast = parser.parse("{{#each names}}{{.}}{{/each}}");
        assert.equal(compile(ast.body, {
            names: ['shane', '-', 'sally']
        }), 'shane-sally');
    });
    it('can return empty string not found', function () {
        const ast = parser.parse("{{#each names}}{{.}}{{/each}}");
        assert.equal(compile(ast.body, {
            namez: ['shane', '-', 'sally']
        }), '');
    });
    it('can place error message inline if data not found', function () {
        const ast = parser.parse("{{#each names}}{{.}}{{/each}}");
        assert.equal(compile(ast.body, {
            namez: ['shane', '-', 'sally']
        }, {debug: true}), 'Warning: `names` not found.');
    });
});
