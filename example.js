var c = require('./');

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
console.log('---output 3----\n' + c.compile(`shane
{{#each tags sep="--{{this.sepa}}--"}}{{this}}{{/each}}
`, {
    tags: [
        1, 2
    ],
    sepa: '~'
}, {debug: true}) + '---  END 3 ----');
