var exp = require('./visualize.js');

console.log();
console.log('='.repeat(50));
console.log('Currently, the only purpose of this script is to test whether ' +
			'calling exported functions from visualize.js in a local node.js ' +
			'environment works. If you are reading this, it probably works.');
console.log('='.repeat(50));
console.log();

var return_val = exp.getAST_v2('a', 'b', 'c');
console.log(return_val);

console.log('?????');
