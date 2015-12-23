var assert = require('chai').assert;
var parser = require('../example');

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
        assert.equal(actual[1].type, 'SINGLE');
        assert.equal(actual[1].value, 'user.name');
    });
    it('can parse single vars with pipes', function () {
        const actual = parser.parse('Hello {{user.name|kittie}}');
        assert.equal(actual[0].type, 'TEXT');
        assert.equal(actual[0].value, 'Hello ');
        assert.equal(actual[1].type, 'SINGLE');
        assert.equal(actual[1].value, 'user.name|kittie');
    });
    it('can parse single vars with attr', function () {
        const actual = parser.parse('Hello {{user.name src="as"}}');
        assert.equal(actual[0].type,      'TEXT');
        assert.equal(actual[0].value,     'Hello ');
        assert.equal(actual[1].type,      'SINGLE');
        assert.equal(actual[1].value,     'user.name');
        assert.equal(actual[1].attrs.src, 'as');
    });
    it('can parse single vars with multi attrs', function () {
        const actual = parser.parse('Hello {{user.name src="as" log debug}}');
        assert.equal(actual[0].type,      'TEXT');
        assert.equal(actual[0].value,     'Hello ');
        assert.equal(actual[1].type,      'SINGLE');
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
