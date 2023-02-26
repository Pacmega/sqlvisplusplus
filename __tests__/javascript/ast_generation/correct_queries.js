console.log('WARN: This test setup assumes that the part of visualize.js that ' +
            'must be uncommented to run locally is indeed uncommented. If ' +
            'not, you will receive "x not defined" style many error messages, ' +
            'likely all similar. Ctrl-f for "UNCOMMENT FROM HERE" in ' +
            'visualize.js to find the part that must be uncommented.');

const visCode = require('../../../sqlvis/visualize');

test('First test query', () => {
  var query = `
SELECT c.name
FROM customer c, ordered o
WHERE c.customerid = o.customerid;
`

  expect(visCode.queryTextAdjustments(query)).toBe('SELECT c.name FROM customer c, ordered o WHERE c.customerid = o.customerid');
});

