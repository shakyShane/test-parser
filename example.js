var htmlparser = require("./tokenizer");
var fs = require('fs');
//var hb = require('handlebars');
var string = fs.readFileSync('test.html', 'utf8');

//console.log('');
//console.timeEnd('buf');

//console.time('hb');
//hb.compile(string)({});
//console.timeEnd('hb');


function parse (string) {
    var stack = [];
    var current;
    var nextattr;
    htmlparser.parse(string, {
        ontext: function (text) {

            stack.push({type: 'TEXT', value: text});
            //console.log('TEXT:', [text]);
        },
        onopentagname: function (name) {
            //if (!current) {
            current = {
                type: 'OPEN_TAG',
                value: name,
                attrs: {}
            };
            //}
            //stack.push({type: 'OPEN_TAG', value: name});
            //console.log('  OPEN :', [name]);
            //console.log('');
        },
        onopentagend: function (ee) {
            stack.push(current);
            current = undefined;
        },
        onclosetag: function (name) {

            stack.push({type: "CLOSE_TAG", value: name});
            //stack.push(current);
            current = undefined;
        },
        onselfclosingtag: function () {

        },
        onattribname: function (nae) {
            nextattr = nae;
            current.attrs[nae] = '';
        },
        onattribend: function () {

        },
        onattribdata: function (value) {
            if (!current) return;
            current.attrs[nextattr] = value;
        }
    });
    return stack;
}

module.exports.parse = parse;
