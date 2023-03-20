/*
Note: as every usage of this function in the main code includes conversion
of the query to lower case, this is done here too for consistency's sake.
This is not actually needed for this function.
*/

// to run: cls & npm test "__tests__/javascript/ast_generation/02_onlyKeepSubqueryBrackets.test.js"

const visCode = require('../../../sqlvis/visualize');

// Effectively setup for all tests
const keywordsToFind = ['with', 'select', 'from', 'join', 'on',
                        'where', 'group by', 'having', 'order by'];
const subqueryMarkers = ['(', ')'];

let itemsToFind = Array.from(keywordsToFind);
itemsToFind.push(...subqueryMarkers);



test('onlyKeepSubqueryBrackets - GROUP BY before SELECT, WHERE with aggregation', () => {
  query = `
GROUP BY c.cName
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);

  // First check that all expected keywords are indeed there.
  expect(keywordArray[0][0]).toBe('group by');
  expect(keywordArray[1][0]).toBe('select');
  expect(keywordArray[2][0]).toBe('from');
  expect(keywordArray[3][0]).toBe('where');

  // Then check all their locations.
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(18);
  expect(keywordArray[2][1]).toBe(47);
  expect(keywordArray[3][1]).toBe(81);
});


test('onlyKeepSubqueryBrackets - GROUP BY between SELECT and FROM, WHERE with aggregation', () => {
  query = `
SELECT c.cName, MAX(p.price)
GROUP BY c.cName
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('group by');
  expect(keywordArray[2][0]).toBe('from');
  expect(keywordArray[3][0]).toBe('where');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(30);
  expect(keywordArray[2][1]).toBe(47);
  expect(keywordArray[3][1]).toBe(81);
});


test('onlyKeepSubqueryBrackets - Agg in SELECT & WHERE, correct GROUP BY present', () => {
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
GROUP BY c.cName
WHERE c.cID = SUM(p.cID)
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('group by');
  expect(keywordArray[3][0]).toBe('where');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(30);
  expect(keywordArray[2][1]).toBe(64);
  expect(keywordArray[3][1]).toBe(81);
});


test('onlyKeepSubqueryBrackets - Agg in SELECT & WHERE, no GROUP BY present', () => {
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('where');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(30);
  expect(keywordArray[2][1]).toBe(64);
});


test('onlyKeepSubqueryBrackets - Second WHERE clause, should be HAVING', () => {
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID
GROUP BY c.cName
WHERE c.cName LIKE '%a%';
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('where');
  expect(keywordArray[3][0]).toBe('group by');
  expect(keywordArray[4][0]).toBe('where');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(30);
  expect(keywordArray[2][1]).toBe(64);
  expect(keywordArray[3][1]).toBe(84);
  expect(keywordArray[4][1]).toBe(101);
});


test('onlyKeepSubqueryBrackets - GROUP BY before SELECT but in subquery', () => {
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID IN (GROUP BY p2.cID
                SELECT p2.cID
                FROM purchase AS p2
                HAVING SUM(p2.price) > 20)
AND c.cID = p.cID
GROUP BY c.cName;`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('where');
  expect(keywordArray[3][0]).toBe('(');
  expect(keywordArray[4][0]).toBe('group by');
  expect(keywordArray[5][0]).toBe('select');
  expect(keywordArray[6][0]).toBe('from');
  expect(keywordArray[7][0]).toBe('having');
  expect(keywordArray[8][0]).toBe(')');
  expect(keywordArray[9][0]).toBe('group by');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(30);
  expect(keywordArray[2][1]).toBe(64);
  expect(keywordArray[3][1]).toBe(79);
  expect(keywordArray[4][1]).toBe(80);
  expect(keywordArray[5][1]).toBe(112);
  expect(keywordArray[6][1]).toBe(142);
  expect(keywordArray[7][1]).toBe(178);
  expect(keywordArray[8][1]).toBe(203);
  expect(keywordArray[9][1]).toBe(223);
});


test('onlyKeepSubqueryBrackets - GROUP BY before FROM but in subquery', () => {
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID IN (SELECT p2.cID
                GROUP BY p2.cID
                FROM purchase AS p2
                HAVING SUM(p2.price) > 20)
AND c.cID = p.cID
GROUP BY c.cName;`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('where');
  expect(keywordArray[3][0]).toBe('(');
  expect(keywordArray[4][0]).toBe('select');
  expect(keywordArray[5][0]).toBe('group by');
  expect(keywordArray[6][0]).toBe('from');
  expect(keywordArray[7][0]).toBe('having');
  expect(keywordArray[8][0]).toBe(')');
  expect(keywordArray[9][0]).toBe('group by');
  

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(30);
  expect(keywordArray[2][1]).toBe(64);
  expect(keywordArray[3][1]).toBe(79);
  expect(keywordArray[4][1]).toBe(80);
  expect(keywordArray[5][1]).toBe(110);
  expect(keywordArray[6][1]).toBe(142);
  expect(keywordArray[7][1]).toBe(178);
  expect(keywordArray[8][1]).toBe(203);
  expect(keywordArray[9][1]).toBe(223);
});


test('onlyKeepSubqueryBrackets - Agg in SELECT but no GROUP BY', () => {
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID;
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('where');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(30);
  expect(keywordArray[2][1]).toBe(64);
});


test('onlyKeepSubqueryBrackets - Agg in WHERE but no GROUP BY', () => {
  query = `
SELECT c.cName, p.price
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('where');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(25);
  expect(keywordArray[2][1]).toBe(59);
});


test('onlyKeepSubqueryBrackets - SELECT GROUP BY, no table mentioned in next term', () => {
  query = `
SELECT GROUP BY cName, SUM(purchase.price)
FROM customer, purchase
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('group by');
  expect(keywordArray[2][0]).toBe('from');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(8);
  expect(keywordArray[2][1]).toBe(44);
});


test('onlyKeepSubqueryBrackets - SELECT GROUP BY, table to attach to', () => {
  query = `
SELECT GROUP BY customer.cName, SUM(purchase.price)
FROM customer, purchase
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('group by');
  expect(keywordArray[2][0]).toBe('from');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(8);
  expect(keywordArray[2][1]).toBe(53);
});


test('onlyKeepSubqueryBrackets - SELECT GROUP BY with aggregations', () => {
  query = `
SELECT GROUP BY SUM(price)
FROM purchase
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('group by');
  expect(keywordArray[2][0]).toBe('from');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(8);
  expect(keywordArray[2][1]).toBe(28);
});


test('onlyKeepSubqueryBrackets - Query with WHERE COUNT(GROUP BY [col]) statement', () => {
  query = `
SELECT c.cName, p.price
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID
AND COUNT(GROUP BY p.pID) < 5;`

  console.log('NOTE @ onlyKeepSubqueryBrackets: for "COUNT(GROUP BY ...", it is expected that '
              + 'improper subqueries are already handled at this point and the GROUP BY is '
              + 'already attached to the column (attachment method intentionally breaks '
              + 'detection for this).');

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('where');
  // Expect there to be no third item at all, no bracket nor group by.
  expect(keywordArray[3][0]).toBeUndefined();

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(25);
  expect(keywordArray[2][1]).toBe(59);
  // Expect there to be no third item at all, no bracket nor group by.
  expect(keywordArray[3][1]).toBeUndefined();
});


test('onlyKeepSubqueryBrackets - Trying to GROUP BY on a table that is not being joined in', () => {
  query = `
SELECT cName, SUM(purchase.price)
FROM customer, purchase
GROUP BY purchase.price;
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('group by');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(35);
  expect(keywordArray[2][1]).toBe(59);
  
});


test('onlyKeepSubqueryBrackets - GROUP BY on table that is not aggregated on', () => {
  query = query = `
SELECT cName
FROM customer, purchase
WHERE customer.cID = purchase.cID
GROUP BY purchase.price;
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('where');
  expect(keywordArray[3][0]).toBe('group by');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(14);
  expect(keywordArray[2][1]).toBe(38);
  expect(keywordArray[3][1]).toBe(72);
});


test('onlyKeepSubqueryBrackets - GROUP BY on table that is not aggregated on and also not joined in', () => {
  query = `
SELECT cName
FROM customer, purchase
GROUP BY purchase.price;
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('group by');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(14);
  expect(keywordArray[2][1]).toBe(38);
});
