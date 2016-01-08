var bs = require('browser-sync').create();
var c = require('./');
var fs = require('fs');

bs.watch(
    [
        'test/fixtures/loop.html',
        'test/fixtures/data.json'
    ]
).on('change', function () {
    fs.writeFileSync('test/fixtures/index.html', c.compile(
        fs.readFileSync('test/fixtures/loop.html', 'utf8'),
        JSON.parse(fs.readFileSync('test/fixtures/data.json', 'utf8')),
        {debug:true}
    ));
});

bs.watch([
    'test/fixtures/index.html',
]).on('change', bs.reload);

bs.init({
    server: 'test/fixtures'
});
