var http = require('http');
var chokidar = require('chokidar');
var unpack = require('browser-unpack');
var fs = require('fs');

function watchBundle(bundle, callback) {
	fs.readFile(bundle, 'utf8', function(e, r) {
		if(e) return callback(e);
		var files = unpack(r).map(function(m) {
			return m.id;
		});

		callback(null, chokidar.watch(files, {persistent: true}));
	});
}

watchBundle('./bundle.js', function(e, watcher) {
	if(e) return console.error(e);

	http.createServer(function(req, res) {
		res.writeHead(200, {
			'content-type': 'text/event-stream',
			'access-control-allow-origin': '*'
		});
		res.write('\n');

		watcher.on('change', function(path) {
			fs.readFile(path, 'utf8', function(e, src) {
				res.write('id: ' + Date.now() + '\n');
				res.write('data: ' + JSON.stringify({
					file: path,
					src: src
				}) + '\n\n');
			});
		});
	}).listen(8001);
});