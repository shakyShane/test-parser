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
    it('can render deeply nested vars', function () {
        const ast = parser.parse("hello {{a.b.c.0.a.b.c}}!");
        assert.equal(compile(ast.body, {
            a: {
                b: {
                    c: [{
                        a: {
                            b: {
                                c: 'shane'
                            }
                        }
                    }]
                }
            }
        }), 'hello shane!');
    });
    it('can render each blocks with array', function () {
        const ast = parser.parse("{{#each names}}{{this sep=oh}}{{/each}}");
        const out = compile(ast.body, {
            names: ['shane', 'sally']
        });
        assert.equal(out, 'shanesally');
    });
    it('can render each blocks with object', function () {
        const ast = parser.parse("{{#each names}}{{this}}{{/each}}");
        const out = compile(ast.body, {
            names: {
                first: 'Shane',
                last: 'Osbourne'
            }
        });
        assert.equal(out, 'ShaneOsbourne');
    });
    it('can render each blocks with siblings', function () {
        const ast = parser.parse("{{#each names}}{{this}}{{/each}}{{#each pets}}{{this}}{{/each}}");
        const out = compile(ast.body, {
            names: {
                first: 'Shane',
                last: 'Osbourne'
            },
            pets: ['dog', 'cat']
        });
        assert.equal(out, 'ShaneOsbournedogcat');
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
    it('can use context blocks', function () {
        const ast = parser.parse("{{@names}}{{shane}}-{{sally}}{{/names}}");
        assert.equal(compile(ast.body, {
            names: {
                shane: 'Shane Osbourne',
                sally: 'Sally Osbourne'
            }
        }), 'Shane Osbourne-Sally Osbourne');
    });
    it('can use nested helper blocks', function () {
        const ast = parser.parse("{{#each names}}{{#each first}}>{{.}}<{{/each}}{{/each}}");
        assert.equal(compile(ast.body, {
            names: [
                {
                    first: ['shane alan']
                },
                {
                    first: ['sally anne']
                }
            ]
        }), '>shane alan<>sally anne<');
    });
});

