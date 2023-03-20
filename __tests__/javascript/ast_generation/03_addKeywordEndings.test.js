
// to run: cls & npm test "__tests__/javascript/ast_generation/03_addKeywordEndings.test.js"



/*
Note: as every usage of this function in the main code includes conversion
of the query to lower case, this is done here too for consistency's sake.
This is not actually needed for this function.
*/

const visCode = require('../../../sqlvis/visualize');

// Effectively setup for all tests
const keywordsToFind = ['with', 'select', 'from', 'join', 'on',
                        'where', 'group by', 'having', 'order by'];
const subqueryMarkers = ['(', ')'];

let itemsToFind = Array.from(keywordsToFind);
itemsToFind.push(...subqueryMarkers);



test('addKeywordEndings - GROUP BY before SELECT, WHERE with aggregation', () => {
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
  visCode.addKeywordEndings(keywordArray, clean_query.length);

  // First check that all expected keywords are indeed there.
  expect(keywordArray[0][0]).toBe('group by');
  expect(keywordArray[1][0]).toBe('select');
  expect(keywordArray[2][0]).toBe('from');
  expect(keywordArray[3][0]).toBe('where');

  // Then check all their locations.
  expect(keywordArray[0][2]).toBe(17);
  expect(keywordArray[1][2]).toBe(46);
  expect(keywordArray[2][2]).toBe(80);
  expect(keywordArray[3][2]).toBe(104);
});


test('addKeywordEndings - GROUP BY between SELECT and FROM, WHERE with aggregation', () => {
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
  visCode.addKeywordEndings(keywordArray, clean_query.length);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('group by');
  expect(keywordArray[2][0]).toBe('from');
  expect(keywordArray[3][0]).toBe('where');

  // Then check all their locations
  expect(keywordArray[0][2]).toBe(29);
  expect(keywordArray[1][2]).toBe(46);
  expect(keywordArray[2][2]).toBe(80);
  expect(keywordArray[3][2]).toBe(104);
});


test('addKeywordEndings - Agg in SELECT & WHERE, correct GROUP BY present', () => {
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
  visCode.addKeywordEndings(keywordArray, clean_query.length);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('group by');
  expect(keywordArray[3][0]).toBe('where');

  // Then check all their locations
  expect(keywordArray[0][2]).toBe(29);
  expect(keywordArray[1][2]).toBe(63);
  expect(keywordArray[2][2]).toBe(80);
  expect(keywordArray[3][2]).toBe(104);
});


test('addKeywordEndings - Agg in SELECT & WHERE, no GROUP BY present', () => {
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
  visCode.addKeywordEndings(keywordArray, clean_query.length);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('where');

  // Then check all their locations
  expect(keywordArray[0][2]).toBe(29);
  expect(keywordArray[1][2]).toBe(63);
  expect(keywordArray[2][2]).toBe(87);
});


test('addKeywordEndings - Second WHERE clause, should be HAVING', () => {
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
  visCode.addKeywordEndings(keywordArray, clean_query.length);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('where');
  expect(keywordArray[3][0]).toBe('group by');
  expect(keywordArray[4][0]).toBe('where');

  // Then check all their locations
  expect(keywordArray[0][2]).toBe(29);
  expect(keywordArray[1][2]).toBe(63);
  expect(keywordArray[2][2]).toBe(83);
  expect(keywordArray[3][2]).toBe(100);
  expect(keywordArray[4][2]).toBe(124);
});


test('addKeywordEndings - GROUP BY before SELECT but in subquery', () => {
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
  visCode.addKeywordEndings(keywordArray, clean_query.length);

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
  expect(keywordArray[0][2]).toBe(29);
  expect(keywordArray[1][2]).toBe(63);
  expect(keywordArray[2][2]).toBe(222);
  expect(keywordArray[3][2]).toBe(203);
  expect(keywordArray[4][2]).toBe(111);
  expect(keywordArray[5][2]).toBe(141);
  expect(keywordArray[6][2]).toBe(177);
  expect(keywordArray[7][2]).toBe(202);
  expect(keywordArray[8][2]).toBe(203);
  expect(keywordArray[9][2]).toBe(238);
});


test('addKeywordEndings - GROUP BY before FROM but in subquery', () => {
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
  visCode.addKeywordEndings(keywordArray, clean_query.length);

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
  expect(keywordArray[0][2]).toBe(29);
  expect(keywordArray[1][2]).toBe(63);
  expect(keywordArray[2][2]).toBe(222);
  expect(keywordArray[3][2]).toBe(203);
  expect(keywordArray[4][2]).toBe(109);
  expect(keywordArray[5][2]).toBe(141);
  expect(keywordArray[6][2]).toBe(177);
  expect(keywordArray[7][2]).toBe(202);
  expect(keywordArray[8][2]).toBe(203);
  expect(keywordArray[9][2]).toBe(238);
});


test('addKeywordEndings - Agg in SELECT but no GROUP BY', () => {
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
  visCode.addKeywordEndings(keywordArray, clean_query.length);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('where');

  // Then check all their locations
  expect(keywordArray[0][2]).toBe(29);
  expect(keywordArray[1][2]).toBe(63);
  expect(keywordArray[2][2]).toBe(82);
});


test('addKeywordEndings - Agg in WHERE but no GROUP BY', () => {
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
  visCode.addKeywordEndings(keywordArray, clean_query.length);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('where');

  // Then check all their locations
  expect(keywordArray[0][2]).toBe(24);
  expect(keywordArray[1][2]).toBe(58);
  expect(keywordArray[2][2]).toBe(82);
});


test('addKeywordEndings - SELECT GROUP BY, no table mentioned in next term', () => {
  query = `
SELECT GROUP BY cName, SUM(purchase.price)
FROM customer, purchase
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                    sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('group by');
  expect(keywordArray[2][0]).toBe('from');

  // Then check all their locations
  expect(keywordArray[0][2]).toBe(7);
  expect(keywordArray[1][2]).toBe(43);
  expect(keywordArray[2][2]).toBe(66);
});


test('addKeywordEndings - SELECT GROUP BY, table to attach to', () => {
  query = `
SELECT GROUP BY customer.cName, SUM(purchase.price)
FROM customer, purchase
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                    sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('group by');
  expect(keywordArray[2][0]).toBe('from');

  // Then check all their locations
  expect(keywordArray[0][2]).toBe(7);
  expect(keywordArray[1][2]).toBe(52);
  expect(keywordArray[2][2]).toBe(75);
});


test('addKeywordEndings - SELECT GROUP BY with aggregations', () => {
  query = `
SELECT GROUP BY SUM(price)
FROM purchase
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                    sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('group by');
  expect(keywordArray[2][0]).toBe('from');

  // Then check all their locations
  expect(keywordArray[0][2]).toBe(7);
  expect(keywordArray[1][2]).toBe(27);
  expect(keywordArray[2][2]).toBe(40);
});


test('addKeywordEndings - Query with WHERE COUNT(GROUP BY [col]) statement', () => {
  query = `
SELECT c.cName, p.price
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID
AND COUNT(GROUP BY p.pID) < 5;`

  console.log('NOTE @ addKeywordEndings: COUNT(GROUP BY) is just assumed to be gone '
              + 'now and is no longer tested for.');

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                    sortOrderOfAppearance=true);
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('where');

  // Then check all their locations
  expect(keywordArray[0][2]).toBe(24);
  expect(keywordArray[1][2]).toBe(58);
  expect(keywordArray[2][2]).toBe(107);
});


test('addKeywordEndings - Trying to GROUP BY on a table that is not being joined in', () => {
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
  visCode.addKeywordEndings(keywordArray, clean_query.length);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('group by');

  // Then check all their locations
  expect(keywordArray[0][2]).toBe(34);
  expect(keywordArray[1][2]).toBe(58);
  expect(keywordArray[2][2]).toBe(81);
  
});


test('addKeywordEndings - GROUP BY on table that is not aggregated on', () => {
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
  visCode.addKeywordEndings(keywordArray, clean_query.length);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('where');
  expect(keywordArray[3][0]).toBe('group by');

  // Then check all their locations
  expect(keywordArray[0][2]).toBe(13);
  expect(keywordArray[1][2]).toBe(37);
  expect(keywordArray[2][2]).toBe(71);
  expect(keywordArray[3][2]).toBe(94);
});


test('addKeywordEndings - GROUP BY on table that is not aggregated on and also not joined in', () => {
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
  visCode.addKeywordEndings(keywordArray, clean_query.length);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('group by');

  // Then check all their locations
  expect(keywordArray[0][2]).toBe(13);
  expect(keywordArray[1][2]).toBe(37);
  expect(keywordArray[2][2]).toBe(60);
});
