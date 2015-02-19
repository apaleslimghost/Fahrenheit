exports.module = function(id, fn, args) {
	var exports = args[0];
	console.log(id);
	return fn.apply(exports, args);
};