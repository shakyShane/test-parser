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
        assert.equal(actual[1].attrs.log,   undefined);
        assert.equal(actual[1].attrs.debug, undefined);
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
        const actual = parser.parse('{{#each posts}}{{#shane this.tags}}{{. filter="md"}}{{/shane}}{{/each}}').body;

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

        assert.equal(actual[0].type, 'TEXT');
        assert.equal(actual[0].value, 'hey');
        assert.equal(actual[0].loc.start, 0);
        assert.equal(actual[0].loc.end, 3);
    });
    it('can pass loc info with string + var', function () {
        const input = 'hey {{greeting}}';
        const actual = parser.parse(input).body;

        assert.equal(actual[0].type, 'TEXT');
        assert.equal(actual[0].value, 'hey ');
        assert.equal(actual[0].loc.start, 0);
        assert.equal(actual[0].loc.end, 4);

        assert.deepEqual(actual[1].loc, {
            line: 1,
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
            line: 1,
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

        assert.deepEqual(actual[1].loc, {
            line: 1,
            start: 4,
            end: 37
        });
        assert.deepEqual(actual[1].attrs.src, 'shane|awwyeah');

        assert.isTrue(validateSubString('{{greeting src="shane|awwyeah" }}', input, actual[1]));
    });
    it('can pass loc info for block ends', function () {
        const input = '{{#each}}shane{{info}}Here\'s\n andother line{{/each}}';
        const actual = parser.parse(input).body;

        assert.equal(
            input.substring(actual[0].loc.openTag.end, actual[0].loc.closeTag.start),
            'shane{{info}}Here\'s\n andother line'
        );
        assert.equal(
            input.substring(actual[0].loc.start, actual[0].loc.end),
            '{{#each}}shane{{info}}Here\'s\n andother line{{/each}}'
        );
        assert.equal(
            input.substring(actual[0].body[0].loc.start, actual[0].body[0].loc.end),
            'shane'
        );
        assert.equal(
            input.substring(actual[0].body[1].loc.start, actual[0].body[1].loc.end),
            '{{info}}'
        );
    });
    it('can pass loc info for blocks with params', function () {
        const input = '{{#each this.kittie src="oh fuck"}}{{.}}{{/each}}';
        const actual = parser.parse(input).body;

        assert.equal(
            input.substring(actual[0].loc.openTag.end, actual[0].loc.closeTag.start),
            '{{.}}'
        );
        assert.equal(
            input.substring(actual[0].loc.start, actual[0].loc.end),
            input
        );
    });
    it('can pass loc info for blocks with params and pipes', function () {

        const input = '{{#each this.kittie src="oh fuck"}}{{.|md hl=js}}{{/each}}';
        const actual = parser.parse(input).body;

        assert.equal(
            input.substring(actual[0].loc.openTag.end, actual[0].loc.closeTag.start),
            '{{.|md hl=js}}'
        );
        assert.equal(
            input.substring(actual[0].loc.closeTag.start, actual[0].loc.closeTag.end),
            '{{/each}}'
        );
    });
    it('can pass info about newlines with vars', function () {
        const input = 'shane\nosbourne {{var1}}';
        const actual = parser.parse(input);
        assert.equal(actual.body[0].type, 'TEXT');
        assert.equal(actual.body[0].value, 'shane\nosbourne ');
        assert.equal(actual.body[1].type, 'TAG');
        assert.equal(actual.body[1].loc.line, 2);
    });
    it('can pass info about newlines with blocks', function () {
        const input = '{{#each posts}}{{.}}{{/each}}';
        const actual = parser.parse(input);

        assert.equal(actual.body[0].loc.openTag.columnStart, 0);
        assert.equal(actual.body[0].loc.openTag.columnEnd, 14);
        assert.equal(actual.body[0].loc.closeTag.columnStart, 20);
        assert.equal(actual.body[0].loc.closeTag.columnEnd, 28);
    });
});
