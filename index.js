var htmlparser = require("./lib/tokenizer");
var compiler = require("./lib/compile");

function parse (string) {
    const stack      = [];
    const tagStack   = [];
    const blockStack = [];

    var nextattr;
    var current;
    var lastAdded;

    function addElement(element) {
        var parent   = tagStack[tagStack.length - 1];
        var siblings = parent ? parent.body : stack;
        siblings.push(element);
        lastAdded = element;
    }

    htmlparser.parse(string, {
        ontext: function (text, loc) {
            addElement({
                type: 'TEXT',
                value: text,
                loc: {
                    start: loc.startIndex,
                    end: loc.endIndex
                }
            });
        },
        onopentagname: function (name, loc) {


            var isBlock = name.match(/^[#@-]/);
            var element;

            if (isBlock) {
                element = {
                    type: 'BLOCK',
                    blockType: name[0],
                    value: name.slice(1),
                    attrs: {},
                    ctx:   [],
                    loc: {
                        start: loc.startIndex - 2,
                        end: loc.endIndex + 2,
                        openTag: {
                            line: loc.line,
                            start: loc.startIndex - 2
                        },
                        closeTag: {}
                    },
                    body:  []
                };
                blockStack.push(element);
            } else {
                element = {
                    type:  'TAG',
                    value: name,
                    attrs: {},
                    loc: {
                        line:  loc.line,
                        start: loc.startIndex - 2,
                        end:   loc.endIndex + 2
                    },
                    body: []
                };
            }

            current = element;
            addElement(element);

            if (isBlock) {
                tagStack.push(element);
            }
        },
        onopentagend: function (loc) {
            //console.log(lastAdded.value);
            if (!lastAdded) return;

            if (lastAdded.type === 'TAG') {
                lastAdded.loc.end = loc.endIndex + 2;
            }
            if (lastAdded.type === 'BLOCK') {
                lastAdded.loc.openTag.end = loc.endIndex + 2;
                var size = lastAdded.loc.openTag.end - lastAdded.loc.openTag.start;
                lastAdded.loc.openTag.columnStart = (loc.column - size);
                lastAdded.loc.openTag.columnEnd = (lastAdded.loc.openTag.columnStart + size - 1); // todo: remove this 1?
            }
        },
        onclosetag: function (name, loc) {

            var elem = tagStack.pop();
            var block = blockStack.pop();

            if (block.type === 'BLOCK') {

                block.loc.closeTag = {
                    line: loc.line,
                    start: loc.startIndex - 3,
                    end: loc.endIndex + 2
                };
                var size = block.loc.closeTag.end - block.loc.closeTag.start;
                block.loc.closeTag.columnStart = (loc.column) - size;
                block.loc.closeTag.columnEnd = block.loc.closeTag.columnStart + size - 1;
            }

            if (name === block.value) {
                block.loc.end = loc.endIndex + 2;
            }
        },
        onselfclosingtag: function () {

        },
        onattribname: function (nae) {
            if (!current) return;
            if (current.type === 'BLOCK') {
                current.ctx.push(nae);
            }
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

    //cache[string] = stack;

    return {
        subject: string,
        body: stack
    };
}

module.exports.parse = parse;
module.exports.compile = function compile (string, data, opts) {
    return compiler(parse(string).body, data, opts);
};
