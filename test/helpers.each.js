var assert = require('chai').assert;
var compile = require('../index').compile;

describe('#each block helper', function () {
    it('can render each blocks with array', function () {
        const input = "{{#each names}}{{this sep=oh}}{{/each}}";
        const out = compile(input, {
            names: ['shane', 'sally']
        });
        assert.equal(out, 'shanesally');
    });
    it('can render each blocks with object', function () {
        const input = "{{#each names}}{{this}}{{/each}}";
        const out = compile(input, {
            names: {
                first: 'Shane',
                last: 'Osbourne'
            }
        });
        assert.equal(out, 'ShaneOsbourne');
    });
    it('can render each blocks with siblings', function () {
        const input = "{{#each names}}{{this}}{{/each}}{{#each pets}}{{this}}{{/each}}";
        const out = compile(input, {
            names: {
                first: 'Shane',
                last: 'Osbourne'
            },
            pets: ['dog', 'cat']
        });
        assert.equal(out, 'ShaneOsbournedogcat');
    });
    it('can return empty string not found', function () {
        const input = "{{#each names}}{{.}}{{/each}}";
        assert.equal(compile(input, {
            namez: ['shane', '-', 'sally']
        }), '');
    });
    it('can place error message inline if data not found', function () {
        const input = "{{#each names}}{{.}}{{/each}}";
        assert.equal(compile(input, {
            namez: ['shane', '-', 'sally']
        }, {debug: true}), 'Warning: `names` not found.');
    });
    it('can use context blocks', function () {
        const input = "{{@names}}{{shane}}-{{sally}}{{/names}}";
        assert.equal(compile(input, {
            names: {
                shane: 'Shane Osbourne',
                sally: 'Sally Osbourne'
            }
        }), 'Shane Osbourne-Sally Osbourne');
    });
    it('can use nested helper blocks', function () {
        const input = "{{#each names}}{{#each first}}>{{.}}<{{/each}}{{/each}}";
        assert.equal(compile(input, {
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
    it('can use nested helper blocks with `this`', function () {
        const input  = "{{#each posts}}\n<h1>{{this.title}}</h1>\n{{#each this.tags}}\n{{.}}{{/each}}\n{{/each}}";
        const output = compile(input, {
            posts: [
                {
                    title: 'Post 1',
                    tags: ['Javascript', 'Nodejs']
                },
                {
                    title: 'Post 2',
                    tags: ['Javascript', 'Nodejs']
                },
                {
                    title: 'Post 3',
                    tags: ['Javascript', 'Nodejs']
                }
            ]
        }, {debug: true});
        assert.include(output, '<h1>Post 1</h1>\n');
        assert.include(output, '<h1>Post 2</h1>\n');
        assert.include(output, '<h1>Post 3</h1>\n');
        assert.include(output, '\nJavascript\nNodejs');
    });
    it('can always access root ctx via $', function () {
        const input  = "{{#each posts}}{{$.site.title}}\n{{this.title}}{{/each}}";
        const output = compile(input, {
            site: {
                title: 'My blog'
            },
            posts: [
                {
                    title: 'Post 1',
                    tags: ['Javascript', 'Nodejs']
                }
            ]
        }, {debug: true});
        assert.include(output, 'My blog\nPost 1');
    });
    it('can use the `sep` attr with string', function () {
        const input  = "{{#each nums sep='-'}}{{.}}{{/each}}";
        const output = compile(input, {
            nums: [1, 2]
        }, {debug: true});
        assert.equal(output, '1-2');
    });
    it('can use the `sep` attr with prop', function () {
        const input  = "{{#each nums sep=$.site.separator}}{{.}}{{/each}}";
        const output = compile(input, {
            nums: [1, 2],
            site: {
                separator: '\n'
            }
        }, {debug: true});

        assert.equal(output, '1\n2');
    });
    it('can handle syntax errors when tag is not closed', function () {
        const input = "{{#each nums {{someother}}}} {{/each}}"
        const output = compile(input, {
            nums: [1, 2],
            site: {
                separator: '\n'
            }
        }, {debug: true});
        assert.include(output, 'Syntax Error:');
    });
    it('can handle syntax errors when end tag is not closed from a block', function () {
        const input = "{{#each nums}}{{.}}some other stuff";
        const output = compile(input, {
            nums: [1, 2]
        }, {debug: true});

        assert.include(output, '`each` Tag not closed correctly');
    });
});
