var htmlparser = require("./tokenizer");
//var fs = require('fs');
//var hb = require('handlebars');
//var string = fs.readFileSync('test.html', 'utf8');

//console.log('');
//console.timeEnd('buf');

//console.time('hb');
//hb.compile(string)({});
//console.timeEnd('hb');


function parse (string) {
    var stack      = [];
    var blockStack = [];
    var ctx;
    var upcoming;
    var nextattr;
    var depth = 0;
    var current;

    htmlparser.parse(string, {
        ontext: function (text, loc) {

            //console.log('sub', [string.substring(loc.startIndex, loc.endIndex)]);

            //var tmp;
            //
            //if (depth) {
            //    tmp = blockStack[blockStack.length-1];
            //    console.log('here');
            //    tmp.body.push({
            //        type: 'TEXT',
            //        value: text,
            //        loc: {
            //            start: loc.startIndex,
            //            end: loc.endIndex
            //        }
            //    });
            //} else {
            //    stack.push({
            //        type: 'TEXT',
            //        value: text,
            //        loc: {
            //            start: loc.startIndex,
            //            end: loc.endIndex
            //        }
            //    });
            //}
        },
        onopentagname: function (name, loc) {
            var isBlock = name.match(/^[#@-]/);
            //console.log('open tag', [string.substring(loc.startIndex-2, loc.endIndex+2)]);
            if (isBlock) {

               var upcoming = {
                    type: 'BLOCK',
                    value: name.slice(1),
                    attrs: {},
                    body:  [],
                    ctx:   [],
                    loc: {
                        start: loc.startIndex - 2,
                        end: loc.endIndex + 2
                    }
                };

                if (blockStack.length) {
                    blockStack[blockStack.length-1].body.push(upcoming);
                }

                blockStack.push(upcoming);

                //console.log(stack);

                //if (depth) {
                //} else {
                //}
                //
                //if (blockStack.length) {
                //    console.log(blockStack);
                //}

                depth++;

            } else {
                var tmptag = {
                    type:  'TAG',
                    value: name,
                    attrs: {},
                    loc: {
                        start: loc.startIndex - 2,
                        end: loc.endIndex + 2
                    }
                };
                //console.log('name', '.');
                //console.log(blockStack[blockStack.length-1]);
                if (blockStack.length) {
                    blockStack[blockStack.length-1].body.push(tmptag);
                } else {
                    blockStack.push(tmptag);
                }

            }
        },
        onopentagend: function (loc) {

            //if (!upcoming) return;
            var cu = blockStack[blockStack.length-1];

            //console.log('cu', cu);

            //console.log('cur', cu);

            //console.log('upcoming', upcoming);
            //upcoming.loc.end = loc.endIndex + 2;


            //if (upcoming.type === 'BLOCK') {
            //    //upcoming.body.push();
            //    //if (blockStack.length) {
            //        //console.log(upcoming);
            //        //blockStack[blockStack.length-1].body.push(upcoming);
            //    //}
            //} else if(upcoming.type === 'TAG') {
            //    console.log('ere');
            //    if (depth) {
            //        blockStack[blockStack.length-1].body.push(upcoming);
            //    }
            //    //console.log('tag', upcoming.value);
            //}

            //console.log('ere');
            //
            //if (blockStack.length) {
            //    blockStack[blockStack.length - 1].body.push(current);
            //}
            //
            //stack.push(current);
            //current = undefined;

        },
        onclosetag: function (name, loc) {
            var tmp;
            if (depth) {
                tmp = blockStack[depth-1];
                depth--;
            }
            //
            ////console.log('CALLED');
            ////console.log('');
            ////console.log(blockStack);
            //
            //if (tmp) {
            //    stack.push(tmp);
            //}
            //console.log('----');
            //console.log(blockStack);
            //console.log('----');
            //stack.push.apply(stack, blockStack);



            //if (blockStack.length) {
            //    stack.push(blockStack.pop());
            //    stack.push({
            //        type: "BLOCK_END",
            //        value: name,
            //        loc: {
            //            start: loc.startIndex - 3,
            //            end: loc.endIndex + 2
            //        }
            //    });
            //}

            //stack.push({
            //    type: "BLOCK_END",
            //    value: name,
            //    loc: {
            //        start: loc.startIndex - 3,
            //        end: loc.endIndex + 2
            //    }
            //});
            ////stack.push(current);
            //current = undefined;
        },
        onselfclosingtag: function () {

        },
        onattribname: function (nae) {
            //if (!current) return;
            //if (current.type === 'BLOCK') {
            //    current.ctx.push(nae);
            //}
            //nextattr = nae;
            //current.attrs[nae] = '';
        },
        onattribend: function () {

        },
        onattribdata: function (value) {
            //if (!current) return;
            //current.attrs[nextattr] = value;
        }
    });
    return {
        subject: string,
        body: stack
    };
}

module.exports.parse = parse;
