var assert = require('chai').assert;
var parser = require('../index');

function validateSubString(string, subject, node) {
    return string === subject.substring(node.loc.start, node.loc.end);
}

describe('parsing', function () {
    it('can parse simple content', function () {
        const actual = parser.parse('shane').body;
        assert.equal(actual[0].type, 'TEXT');
        assert.equal(actual[0].value, 'shane');
    });
    it('can parse simple content with whitespace', function () {
        const actual = parser.parse(' shane   ').body;
        assert.equal(actual[0].type, 'TEXT');
        assert.equal(actual[0].value, ' shane   ');
    });
    it('can parse single vars', function () {
        const actual = parser.parse('Hello {{user.name}}').body;
        assert.equal(actual[0].type, 'TEXT');
        assert.equal(actual[0].value, 'Hello ');
        assert.equal(actual[1].type, 'TAG');
        assert.equal(actual[1].value, 'user.name');
    });
    it('can parse single vars with pipes', function () {
        const actual = parser.parse('Hello {{user.name|kittie}}').body;
        assert.equal(actual[0].type, 'TEXT');
        assert.equal(actual[0].value, 'Hello ');
        assert.equal(actual[1].type, 'TAG');
        assert.equal(actual[1].value, 'user.name|kittie');
    });
    it('can parse single vars with attr', function () {
        const actual = parser.parse('Hello {{user.name src="as"}}').body;
        assert.equal(actual[0].type,      'TEXT');
        assert.equal(actual[0].value,     'Hello ');
        assert.equal(actual[1].type,      'TAG');
        assert.equal(actual[1].value,     'user.name');
        assert.equal(actual[1].attrs.src, 'as');
    });
    it('can parse single vars with multi attrs', function () {
        const actual = parser.parse('Hello {{user.name src="as" log debug}}').body;

        assert.equal(actual[0].type,      'TEXT');
        assert.equal(actual[0].value,     'Hello ');
        assert.equal(actual[1].type,      'TAG');
        assert.equal(actual[1].value,     'user.name');
        assert.equal(actual[1].attrs.src,   'as');
        assert.equal(actual[1].attrs.log,   '');
        assert.equal(actual[1].attrs.debug, '');
    });
    it('can parse nested blocks (depth 1)', function () {
        const actual = parser.parse('{{#each posts}}before{{.}}after{{/each}}last').body;

        assert.equal(actual[0].type, 'BLOCK');
        assert.equal(actual[0].body[0].type, 'TEXT');
        assert.equal(actual[0].body[0].value, 'before');

        assert.equal(actual[0].body[1].type, 'TAG');
        assert.equal(actual[0].body[1].value, '.');

        assert.equal(actual[0].body[2].type, 'TEXT');
        assert.equal(actual[0].body[2].value, 'after');

        assert.equal(actual[1].type, 'TEXT');
        assert.equal(actual[1].value, 'last');

    });
    it('can parse nested blocks (depth 2)', function () {
        const actual = parser.parse('{{#each posts}}{{#shane this.tags}}{{. filter=md}}{{/shane}}{{/each}}').body;

        assert.equal(actual[0].type,                 'BLOCK');
        assert.equal(actual[0].body[0].type,         'BLOCK');
        assert.equal(actual[0].body[0].body[0].type, 'TAG');
        assert.equal(actual[0].body[0].body[0].value, '.');
        assert.equal(actual[0].body[0].body[0].attrs.filter, 'md');

    });
    it('can parse nested blocks (depth 2) with siblings', function () {

        const actual = parser.parse('here {{. this=ohno}}');
        assert.equal(
            actual.subject.substring(actual.body[0].loc.start, actual.body[0].loc.end),
            'here '
        );
        assert.equal(
            actual.subject.substring(actual.body[1].loc.start, actual.body[1].loc.end),
            '{{. this=ohno}}'
        );
    });
});

describe('Passing loc info to parser', function () {
    it('can pass loc info with string only', function () {
        const input = 'hey';
        const actual = parser.parse(input).body;

        assert.deepEqual(actual[0], {
            type:  'TEXT',
            value: 'hey',
            loc: {
                start: 0,
                end: 3
            }
        });
    });
    it('can pass loc info with string + var', function () {
        const input = 'hey {{greeting}}';
        const actual = parser.parse(input).body;

        assert.deepEqual(actual[0], {
            type:  'TEXT',
            value: 'hey ',
            loc: {
                start: 0,
                end: 4
            }
        });
        assert.deepEqual(actual[1].loc, {
            start: 4,
            end: 16
        });
        assert.deepEqual(actual[1].type, 'TAG');
        assert.deepEqual(actual[1].value, 'greeting');
    });
    it('can pass loc info with string + var with whitespace', function () {
        const input = 'hey {{greeting  }}';
        const actual = parser.parse(input).body;

        assert.deepEqual(actual[1].loc, {
            start: 4,
            end: 18
        });

        assert.isTrue(validateSubString('{{greeting  }}', input, actual[1]));

        assert.deepEqual(actual[1].type, 'TAG');
        assert.deepEqual(actual[1].value, 'greeting');
    });
    it('can pass loc info with string + var + params', function () {
        const input = 'hey {{greeting src="shane|awwyeah" }}';
        const actual = parser.parse(input).body;

        assert.deepEqual(actual[1].loc, { start: 4, end: 37 });
        assert.deepEqual(actual[1].attrs.src, 'shane|awwyeah');

        assert.isTrue(validateSubString('{{greeting src="shane|awwyeah" }}', input, actual[1]));
    });
    it('can pass loc info for block ends', function () {
        const input = '{{#each}}shane\nwas here {{this.info|md}} {{/each}}';
        const actual = parser.parse(input).body;
        console.log(actual);

        //assert.isTrue(validateSubString('{{#each}}', input, actual[0]));
        //assert.isTrue(validateSubString('shane\nwas here ', input, actual[1]));
        //assert.isTrue(validateSubString('{{this.info|md}}', input, actual[2]));
        //assert.isTrue(validateSubString(' ', input, actual[3]));
        //assert.isTrue(validateSubString('{{/each}}', input, actual[4]));

        //assert.equal(actual[0].value, 'each');
        //assert.equal(actual[1].value, 'shane\nwas here ');
        //assert.equal(actual[2].value, 'this.info|md');
        //assert.equal(actual[3].value, ' ');
        //assert.equal(actual[4].value, 'each');
    });
});
