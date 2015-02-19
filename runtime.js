/* jshint esnext:true, indent:1 */
var fetch  = require('ponyfetch');
var unpack = require('browser-unpack');
var topo   = require('toposort');

function currentScript() {
	var scripts = document.getElementsByTagName('script');
	return scripts[scripts.length-1].src;
}

function flatMap(xs, f) {
	return xs.reduce((ys, x) => ys.concat(f(x)), []);
}

function modulesToMap(modules) {
	return modules.reduce(
		(obj, module) => (obj[module.id] = module, obj), {}
	);
}

function contains(xs, x) {
	return xs.indexOf(x) >= 0;
}

var get = (obj) => (k) => obj[k];

function values(obj) {
	return Object.keys(obj).map(get(obj));
}

function getDependents(modules, id) {
	var dependents = modules.filter(function(module) {
		return contains(values(module.deps), id);
	});

	var dependentPairs = dependents.map(function(dep) {
		return [id, dep.id];
	});

	return dependentPairs.concat(flatMap(dependents, function(dep) {
		return getDependents(modules, dep.id);
	}));
}

function currentBundle() {
	return fetch(currentScript())
	.then((resp) => resp.text())
	.then(unpack);
}

function getCurrentDependents(id) {
	return currentBundle()
		.then((modules) => {
			return topo(getDependents(modules, id));
		});
}

exports.getCurrentDependents = getCurrentDependents;

var outer   = function() {};
var modules = {};
var cache   = {};
var entry   = [];
var loaders = {};

exports.module = function(id, fn, args) {
	var exports = args[0];
	outer   = args[3];
	modules = args[4];
	cache   = args[5];
	entry   = args[6];
	loaders[id] = fn;
	return fn.apply(exports, args);
};

exports.update = function(id, src) {
	/*jshint evil:true*/
	var fn = new Function('require', 'module', 'exports', src);
	modules[id][0] = fn;

	getCurrentDependents(id).then(function(deps) {
		deps.forEach(function(name) {
			var m = cache[name] = {exports:{}};
			modules[name][0].call(m.exports, function(x){
				var id = modules[name][1][x];
				return require(id ? id : x);
			}, m, m.exports, outer, modules, cache, entry);
		});
	}).catch(console.error.bind(console));
};