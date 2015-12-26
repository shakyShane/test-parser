var cb = require("./index");
var fs = require('fs');
var hb = require('handlebars');
var string = fs.readFileSync('bench/nested-loops.html', 'utf8');

//var data = {
//    tags: ['Javascript', 'Nodejs']
//};

var data = {
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
};

//console.log('');
//console.timeEnd('buf');

console.time('hb');
hb.compile(string)(data);

console.timeEnd('hb');

console.time('shane');
cb.compile(string, data);

//console.log(output);
//fs.writeFileSync('ast2.json', JSON.stringify(ast, null, 2));
console.timeEnd('shane');
//module.exports.parse = parse;
