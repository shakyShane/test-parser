var htmlparser = require("./tokenizer");
var fs = require('fs');
var hb = require('handlebars');
var string = fs.readFileSync('test.html', 'utf8');

console.time('buf');
htmlparser.parse("{@hl src='post/shane.hbs|md|autoheadings'} Here's another block", {
//htmlparser.parse(string, {
    ontext: function (text) {
    	console.log('text', [text]);
    },
    onopentagname: function (name) {
    	console.log('onopentagname', [name]);
    },
    onopentagend: function () {
        //console.log('onopentagend', arguments);
    },
    onclosetag: function () {
        //console.log('close', arguments);
    },
    onselfclosingtag: function () {

    },
    onattribname: function (nae) {
        console.log('attrib', nae);
    },
    onattribend: function () {

    },
    onattribdata: function () {
        console.log('attrib d', arguments);
    }
});
console.timeEnd('buf');
console.time('hb');
hb.compile(string)({});
console.timeEnd('hb');
