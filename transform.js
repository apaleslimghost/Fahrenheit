var tools = require('browserify-transform-tools');
var runtimePath = __dirname + '/runtime.js';

module.exports = tools.makeFalafelTransform("fahrenheitify", function (node, transformOptions, done) {
	if(!node.parent && transformOptions.file !== runtimePath) {
		node.update(
			'require("' + runtimePath + '").module("' +
				transformOptions.file +
				'", function () { ' + node.source() + '\n}, arguments);');
	}
	done();
});
