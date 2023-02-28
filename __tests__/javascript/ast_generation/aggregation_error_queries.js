const visCode = require('../../../sqlvis/visualize');

test('Aggregation in WHERE before GROUP BY', () => {
  // Expected: Reorder, WHERE -> HAVING
  query = `
SELECT c.cName, p.price
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
GROUP BY c.cName;`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');
});

test('Aggregation in WHERE->AND before GROUP BY', () => {
  // Expected: AND part becomes separate HAVING
  query = `
SELECT c.cName, p.price
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID
AND p.price > AVG(p.price)
GROUP BY c.cName`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');
});

test('Aggregation in both WHERE and HAVING', () => {
  // Expected: WHERE added to HAVING as AND component
  query = `
SELECT c.cName, SUM(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = AVG(p.cID)
GROUP BY c.cName
HAVING p.price > AVG(p.price)`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');
});

test('Aggregation in WHERE meant as filtering (no GROUP BY desired)', () => {
  // Expected: Check that the WHERE is properly parsed as aggregation < value
  query = `
SELECT c.cName AS smallSpender
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID
AND SUM(p.price) < 10`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');

});
