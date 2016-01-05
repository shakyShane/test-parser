var assert = require('chai').assert;
var parser = require('../index');

function validateSubString(string, subject, node) {
    return string === subject.substring(node.loc.start, node.loc.end);
}

describe('parsing blocks', function () {
    it('can parse block and return raw content', function () {
        const actual = parser.parse('{{#each tags}}{{.}}{{/each}}').body;
        assert.equal(actual[0].type, 'BLOCK');
        assert.equal(actual[0].raw(), '{{.}}');
    });
    it('can parse block and return raw content outer', function () {
        const actual = parser.parse('{{#each tags}}{{.}}{{/each}}').body;
        assert.equal(actual[0].type, 'BLOCK');
        assert.equal(actual[0].outer(), '{{#each tags}}{{.}}{{/each}}');
    });
});
