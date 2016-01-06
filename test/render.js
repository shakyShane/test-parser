const assert  = require('chai').assert;
const compile = require('../index').compile;

describe('render', function () {
    it('can render var', function () {
        const input = "hello {{greeting}}";
        assert.equal(compile(input, {greeting: 'world!'}), 'hello world!');
    });
    it('can render nested var', function () {
        const input = "hello {{greetings.eng}}";
        assert.equal(compile(input, {
            greetings: {
                eng: 'world!'
            }
        }), 'hello world!');
    });
    it('can render deeply nested vars', function () {
        const input = "hello {{a.b.c.0.a.b.c}}!";
        assert.equal(compile(input, {
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
    it.skip('strips lines that only include tags/block openers/closes', function () {
    	const input = `<ul>
    {{#each tags}}
        <li>{{this}}</li>
    {{/each}}
</ul>`;

        //console.log(split.splice(1, 1));
        //console.log(split.splice(2, 1));
        //console.log([split[1]]);
        //console.log(split.join('\n'));
        //const output = compile(input, {
        //    tags: ['JS', 'NODE']
        //});
        //console.log('     '.match(/\s/));
        //console.log(output);
        console.log(require('handlebars').compile(input)({
            tags: ['JS', 'NODE']
        }));
    });
});

