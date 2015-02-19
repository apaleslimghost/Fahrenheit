var fahr = require('./runtime.js');

setTimeout(function() {
	fahr.update(
		"/Users/matt/Projects/Fahrenheit/a.js",
		"module.exports = 'goodbye world';"
	);
}, 1000);

setTimeout(function() {
	fahr.update(
		"/Users/matt/Projects/Fahrenheit/a.js",
		"module.exports = 'hello again world';"
	);
}, 2000);