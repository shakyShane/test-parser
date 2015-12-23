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
        ontext: function (text, loc) {

            //console.log('sub', [string.substring(loc.startIndex, loc.endIndex)]);

            stack.push({
                type: 'TEXT',
                value: text,
                loc: {
                    start: loc.startIndex,
                    end: loc.endIndex
                }
            });
            //console.log('TEXT:', [text]);
        },
        onopentagname: function (name, loc) {
            //console.log('open tag', [string.substring(loc.startIndex-2, loc.endIndex+2)]);
            current = {
                type: 'OPEN_TAG',
                value: name,
                attrs: {},
                loc: {
                    start: loc.startIndex - 2,
                    end: loc.endIndex + 2
                }
            };
        },
        onopentagend: function (loc) {
            current.loc.end = loc.endIndex + 2;
            stack.push(current);
            current = undefined;
        },
        onclosetag: function (name, loc) {

            stack.push({
                type: "CLOSE_TAG",
                value: name,
                loc: {
                    start: loc.startIndex - 3,
                    end: loc.endIndex + 2
                }
            });
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
