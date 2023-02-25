console.log('WARN: This test setup assumes that the part of visualize.js that ' +
            'must be uncommented to run locally is indeed uncommented. If ' +
            'not, you will receive "x not defined" style many error messages, ' +
            'likely all similar. Ctrl-f for "UNCOMMENT FROM HERE" in ' +
            'visualize.js to find the part that must be uncommented.');

const visCode = require('../sqlvis/visualize')

test('getAST_v2 does not return "test"', () => {
  var return_val = visCode.getAST_v2('a', 'b', 'c');
  expect(return_val).not.toBe('test');
});

test('AAAAAA', () => {
  expect(visCode.returnsAAAAAA()).toBe('AAAAAA');
});

test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3);
});
