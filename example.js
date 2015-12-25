var htmlparser = require("./index");
var fs = require('fs');
var hb = require('handlebars');
var string = fs.readFileSync('test.html', 'utf8');

//console.log('');
//console.timeEnd('buf');

console.time('hb');
hb.compile(string)({});
console.timeEnd('hb');

console.time('shane');
var ast = htmlparser.parse(string);
//fs.writeFileSync('ast2.json', JSON.stringify(ast, null, 2));
console.timeEnd('shane');
//module.exports.parse = parse;
