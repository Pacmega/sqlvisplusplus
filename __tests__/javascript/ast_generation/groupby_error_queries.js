const visCode = require('../../../sqlvis/visualize');

test('GROUP BY before SELECT, WHERE with aggregation', () => {
  // Expected: Move the GROUP BY, where -> having
  query = `
GROUP BY c.cName
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');
});

test('GROUP BY between SELECT and FROM, WHERE with aggregation', () => {
  // Expected: Move the GROUP BY, where -> having
  query = `
SELECT c.cName, MAX(p.price)
GROUP BY c.cName
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');
});

test('Agg in SELECT & WHERE, correct GROUP BY present', () => {
  // Expected: where -> having
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
GROUP BY c.cName
WHERE c.cID = SUM(p.cID)
`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');
});

test('Agg in SELECT & WHERE, no GROUP BY present', () => {
  // Expected: check that the SUM is indeed parsed as an agg
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');
});

test('Second WHERE clause, should be HAVING', () => {
  // Expected: see test title
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID
GROUP BY c.cName
WHERE c.cName LIKE '%a%';
`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');
});

test('GROUP BY before SELECT but in subquery', () => {
  // Expected: reorder within subquery, leave main query untouched
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID IN (GROUP BY p2.cID
                SELECT p2.cID
                FROM purchase AS p2
                HAVING SUM(p2.price) > 20)
AND c.cID = p.cID
GROUP BY c.cName;`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');
});

test('GROUP BY before FROM but in subquery', () => {
  // Expected: reorder within subquery, leave main query untouched
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID IN (SELECT p2.cID
                GROUP BY p2.cID
                FROM purchase AS p2
                HAVING SUM(p2.price) > 20)
AND c.cID = p.cID
GROUP BY c.cName;`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');
});

test('Agg in SELECT but no GROUP BY', () => {
  // Expected: This should be parseable just fine actually.
  //   Check that the aggregation is made as intended.
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID;
`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');
});

test('Agg in WHERE but no GROUP BY', () => {
  // Expected: make the agg(col) get interpreted as a column name, then later
  //   during analysis notice and fix that
  query = `
SELECT c.cName, p.price
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');
});

test('SELECT GROUP BY, no table mentioned in next term', () => {
  // Expected: GROUP BY interpreted like aggregation function
  // (that way the visualization would remain similar-ish)
  query = `
SELECT GROUP BY cName, SUM(purchase.price)
FROM customer, purchase`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');
});

test('SELECT GROUP BY, table to attach to', () => {
  // Expected: GROUP BY getting affixed to the table's as
  query = `
SELECT GROUP BY customer.cName, SUM(purchase.price)
FROM customer, purchase
`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');
});

test('SELECT GROUP BY with aggregations', () => {
  // Expected: Attach the GROUP BY to the aggregation for one big "agg_func"
  query = `
SELECT GROUP BY SUM(price)
FROM purchase`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');
});

test('Query with WHERE COUNT(GROUP BY [col]) statement', () => {
  // Expected: WHERE statement moved to HAVING, GROUP BY affixed to [col]
  query = `
SELECT c.cName, p.price
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID
AND COUNT(GROUP BY p.pID) < 5;`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');
});

test('Trying to GROUP BY on a table that is not being joined in', () => {
  // Expected: This should execute fine, it's just a bad idea.
  query = `
SELECT cName, SUM(purchase.price)
FROM customer, purchase
GROUP BY purchase.price;
`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');
});

test('GROUP BY on table that is not aggregated on', () => {
  // Expected: Should parse fine so focus on checking AST matches expectation
  query = query = `
SELECT cName
FROM customer, purchase
WHERE customer.cID = purchase.cID
GROUP BY purchase.price;
`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');
});

test('GROUP BY on table that is not aggregated on and also not joined in', () => {
  // Expected: Should parse fine (but makes no sense, don't bother correcting)
  //   so focus on checking AST matches expectation
  query = `
SELECT cName
FROM customer, purchase
GROUP BY purchase.price;
`

  var clean_query = visCode.queryTextAdjustments(query);
  var ast = visCode.parseQuery(clean_query);

  expect('Work in progress').toBe('Done');
});