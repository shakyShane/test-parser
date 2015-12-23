var assert = require('chai').assert;
var parser = require('../index');
function validateSubString(string, subject, node) {
    return string === subject.substring(node.loc.start, node.loc.end);
}

describe('parsing', function () {
    it('can parse simple content', function () {
        const actual = parser.parse('shane');
        assert.equal(actual[0].type, 'TEXT');
        assert.equal(actual[0].value, 'shane');
    });
    it('can parse simple content with whitespace', function () {
        const actual = parser.parse(' shane   ');
        assert.equal(actual[0].type, 'TEXT');
        assert.equal(actual[0].value, ' shane   ');
    });
    it('can parse single vars', function () {
        const actual = parser.parse('Hello {{user.name}}');
        assert.equal(actual[0].type, 'TEXT');
        assert.equal(actual[0].value, 'Hello ');
        assert.equal(actual[1].type, 'OPEN_TAG');
        assert.equal(actual[1].value, 'user.name');
    });
    it('can parse single vars with pipes', function () {
        const actual = parser.parse('Hello {{user.name|kittie}}');
        assert.equal(actual[0].type, 'TEXT');
        assert.equal(actual[0].value, 'Hello ');
        assert.equal(actual[1].type, 'OPEN_TAG');
        assert.equal(actual[1].value, 'user.name|kittie');
    });
    it('can parse single vars with attr', function () {
        const actual = parser.parse('Hello {{user.name src="as"}}');
        assert.equal(actual[0].type,      'TEXT');
        assert.equal(actual[0].value,     'Hello ');
        assert.equal(actual[1].type,      'OPEN_TAG');
        assert.equal(actual[1].value,     'user.name');
        assert.equal(actual[1].attrs.src, 'as');
    });
    it('can parse single vars with multi attrs', function () {
        const actual = parser.parse('Hello {{user.name src="as" log debug}}');
        assert.equal(actual[0].type,      'TEXT');
        assert.equal(actual[0].value,     'Hello ');
        assert.equal(actual[1].type,      'OPEN_TAG');
        assert.equal(actual[1].value,     'user.name');
        assert.equal(actual[1].attrs.src,   'as');
        assert.equal(actual[1].attrs.log,   '');
        assert.equal(actual[1].attrs.debug, '');
    });
});

describe('parsing blocks', function () {
    it('can parse blocks', function () {
        const actual = parser.parse('before{{#each this.pipe}} here {{/each}}after');
        assert.deepEqual(actual, [
            { type: 'TEXT', value: 'before' },
            { type: 'OPEN_TAG', value: '#each', attrs: { 'this.pipe': '' } },
            { type: 'TEXT', value: ' here ' },
            { type: 'CLOSE_TAG', value: 'each' },
            { type: 'TEXT', value: 'after' }
        ]);
    });
    it('can parse blocks + single tags', function () {
        const actual = parser.parse('<p>{{list.name}}<p><ul>{{#each list}}<li>{{this.name}}</li>{{/each}}</ul>');
        assert.deepEqual(actual, [
            { type: 'TEXT', value: '<p>' },
            { type: 'OPEN_TAG', value: 'list.name', attrs: {} },
            { type: 'TEXT', value: '<p><ul>' },
            { type: 'OPEN_TAG', value: '#each', attrs: { list: '' } },
            { type: 'TEXT', value: '<li>' },
            { type: 'OPEN_TAG', value: 'this.name', attrs: {} },
            { type: 'TEXT', value: '</li>' },
            { type: 'CLOSE_TAG', value: 'each' },
            { type: 'TEXT', value: '</ul>' }
        ]);
    });
});

describe.only('Passing loc info to parser', function () {
    it('can pass loc info with string only', function () {
        const input = 'hey';
        const actual = parser.parse(input);

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
        const actual = parser.parse(input);

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
        assert.deepEqual(actual[1].type, 'OPEN_TAG');
        assert.deepEqual(actual[1].value, 'greeting');
    });
    it('can pass loc info with string + var with whitespace', function () {
        const input = 'hey {{greeting  }}';
        const actual = parser.parse(input);

        assert.deepEqual(actual[1].loc, {
            start: 4,
            end: 18
        });

        assert.isTrue(validateSubString('{{greeting  }}', input, actual[1]));

        assert.deepEqual(actual[1].type, 'OPEN_TAG');
        assert.deepEqual(actual[1].value, 'greeting');
    });
    it('can pass loc info with string + var + params', function () {
        const input = 'hey {{greeting src="shane|awwyeah" }}';
        const actual = parser.parse(input);

        assert.deepEqual(actual[1].loc, { start: 4, end: 37 });
        assert.deepEqual(actual[1].attrs.src, 'shane|awwyeah');

        assert.isTrue(validateSubString('{{greeting src="shane|awwyeah" }}', input, actual[1]));
    });
    it('can pass loc info for block ends', function () {
        const input = '{{#each}}shane\nwas here {{this.info|md}} {{/each }}';
        const actual = parser.parse(input);

        assert.isTrue(validateSubString('{{#each}}', input, actual[0]));
        assert.isTrue(validateSubString('shane\nwas here ', input, actual[1]));
        assert.isTrue(validateSubString('{{this.info|md}}', input, actual[2]));
        assert.isTrue(validateSubString(' ', input, actual[3]));
        assert.isTrue(validateSubString('{{/each }}', input, actual[4]));
    });
});
