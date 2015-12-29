var cb    = require("./index");
var fs    = require('fs');
var hb    = require('handlebars');

var files = [
    'bench/large.txt',
    'bench/large-empty.txt',
    'bench/simple-loop.html',
    'bench/nested-loops.html'
].map(x => ({name: x, content: fs.readFileSync(x, 'utf8')}));

var timesEach = 10;

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


console.time('hb');

files.forEach(function (item) {
    //var bef = mt.now();
    for (var i = 0; i < timesEach; i++) {
        runhb(item.content, data);
    }
});

console.timeEnd('hb');

console.time('cb');

files.forEach(function (item) {
    //var bef = mt.now();
    for (var i = 0; i < timesEach; i++) {
        runcb(item.content, data, {ws:true});
        //runcb(item.content, data);
        //runcb(item.content, data);
    }
});

console.timeEnd('cb');

function runhb (string, data) {
    hb.compile(string)(data);
}

function runcb (string, data, opts) {
    cb.compile(string, data, opts);
}
