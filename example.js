var c = require('./');
var f = require('fs');

var output = f.readFileSync('test/fixtures/loop.html', 'utf8');

//console.log('input->\n' + output);

console.log('output->\n' + c.compile(output, {
    site: {
        title: "Shane's example page"
    },
    pages: [
        {
            url: 'http://www.bbc.co.uk',
            title: 'Homepage'
        },
        {
            url: 'http://www.bbc.co.uk/about',
            title: 'About'
        }
    ]
}, {debug: true}));

//console.log('---output 1----\n' + c.compile(`shane
//{{#each tags sep=this.sepa}}{{this}}{{/each}}
//`, {
//    tags: [
//        1, 2
//    ],
//    sepa: '~'
//}, {debug: true}) + '---  END 1 ----');
//console.log('');
//console.log('---output 2----\n' + c.compile(`shane
//{{#each tags sep="---"}}{{this}}{{/each}}
//`, {
//    tags: [
//        1, 2
//    ],
//    sepa: '~'
//}, {debug: true}) + '---  END 2 ----');
//console.log('');
//console.log('---output 3----\n' + c.compile(`shane
//{{#each tags sep="--{{this.sepa}}--"}}{{this}}{{/each}}
//`, {
//    tags: [
//        1, 2
//    ],
//    sepa: '~'
//}, {debug: true}) + '---  END 3 ----');
