var fahr = require('./runtime.js');
var EventSource = require('event-source');

new EventSource('http://localhost:8001').onmessage = function(e) {
	var data = JSON.parse(e.data);
	fahr.update(data.file, data.src);
};