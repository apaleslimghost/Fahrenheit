/* jshint esnext:true, indent:1 */
var fetch  = require('ponyfetch');
var unpack = require('browser-unpack');

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

	return dependents.concat(flatMap(dependents, function(dep) {
		return getDependents(modules, dep);
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
			var me = modules.filter(function(module) {
				return module.id === id;
			})[0];

			return getDependents(modules, id).concat(me);
		});
}

getCurrentDependents("/Users/matt/Projects/Fahrenheit/a.js").then(console.log.bind(console)).catch(console.error.bind(console));