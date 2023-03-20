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



test('findKeywordAppearances - GROUP BY before SELECT, WHERE with aggregation', () => {
  query = `
GROUP BY c.cName
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  const keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);

  // First check that all expected keywords are indeed there.
  expect(keywordArray[0][0]).toBe('group by');
  expect(keywordArray[1][0]).toBe('select');
  expect(keywordArray[2][0]).toBe('(');
  expect(keywordArray[3][0]).toBe(')');
  expect(keywordArray[4][0]).toBe('from');
  expect(keywordArray[5][0]).toBe('where');
  expect(keywordArray[6][0]).toBe('(');
  expect(keywordArray[7][0]).toBe(')');

  // Then check all their locations.
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(18);
  expect(keywordArray[2][1]).toBe(37);
  expect(keywordArray[3][1]).toBe(45);
  expect(keywordArray[4][1]).toBe(47);
  expect(keywordArray[5][1]).toBe(81);
  expect(keywordArray[6][1]).toBe(98);
  expect(keywordArray[7][1]).toBe(104);
});


test('findKeywordAppearances - GROUP BY between SELECT and FROM, WHERE with aggregation', () => {
  query = `
SELECT c.cName, MAX(p.price)
GROUP BY c.cName
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  const keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('(');
  expect(keywordArray[2][0]).toBe(')');
  expect(keywordArray[3][0]).toBe('group by');
  expect(keywordArray[4][0]).toBe('from');
  expect(keywordArray[5][0]).toBe('where');
  expect(keywordArray[6][0]).toBe('(');
  expect(keywordArray[7][0]).toBe(')');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(20);
  expect(keywordArray[2][1]).toBe(28);
  expect(keywordArray[3][1]).toBe(30);
  expect(keywordArray[4][1]).toBe(47);
  expect(keywordArray[5][1]).toBe(81);
  expect(keywordArray[6][1]).toBe(98);
  expect(keywordArray[7][1]).toBe(104);
});


test('findKeywordAppearances - Agg in SELECT & WHERE, correct GROUP BY present', () => {
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
GROUP BY c.cName
WHERE c.cID = SUM(p.cID)
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  const keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('(');
  expect(keywordArray[2][0]).toBe(')');
  expect(keywordArray[3][0]).toBe('from');
  expect(keywordArray[4][0]).toBe('group by');
  expect(keywordArray[5][0]).toBe('where');
  expect(keywordArray[6][0]).toBe('(');
  expect(keywordArray[7][0]).toBe(')');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(20);
  expect(keywordArray[2][1]).toBe(28);
  expect(keywordArray[3][1]).toBe(30);
  expect(keywordArray[4][1]).toBe(64);
  expect(keywordArray[5][1]).toBe(81);
  expect(keywordArray[6][1]).toBe(98);
  expect(keywordArray[7][1]).toBe(104);
});


test('findKeywordAppearances - Agg in SELECT & WHERE, no GROUP BY present', () => {
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  const keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('(');
  expect(keywordArray[2][0]).toBe(')');
  expect(keywordArray[3][0]).toBe('from');
  expect(keywordArray[4][0]).toBe('where');
  expect(keywordArray[5][0]).toBe('(');
  expect(keywordArray[6][0]).toBe(')');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(20);
  expect(keywordArray[2][1]).toBe(28);
  expect(keywordArray[3][1]).toBe(30);
  expect(keywordArray[4][1]).toBe(64);
  expect(keywordArray[5][1]).toBe(81);
  expect(keywordArray[6][1]).toBe(87);
});


test('findKeywordAppearances - Second WHERE clause, should be HAVING', () => {
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID
GROUP BY c.cName
WHERE c.cName LIKE '%a%';
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  const keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('(');
  expect(keywordArray[2][0]).toBe(')');
  expect(keywordArray[3][0]).toBe('from');
  expect(keywordArray[4][0]).toBe('where');
  expect(keywordArray[5][0]).toBe('group by');
  expect(keywordArray[6][0]).toBe('where');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(20);
  expect(keywordArray[2][1]).toBe(28);
  expect(keywordArray[3][1]).toBe(30);
  expect(keywordArray[4][1]).toBe(64);
  expect(keywordArray[5][1]).toBe(84);
  expect(keywordArray[6][1]).toBe(101);
});


test('findKeywordAppearances - GROUP BY before SELECT but in subquery', () => {
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
  const keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('(');
  expect(keywordArray[2][0]).toBe(')');
  expect(keywordArray[3][0]).toBe('from');
  expect(keywordArray[4][0]).toBe('where');
  expect(keywordArray[5][0]).toBe('(');
  expect(keywordArray[6][0]).toBe('group by');
  expect(keywordArray[7][0]).toBe('select');
  expect(keywordArray[8][0]).toBe('from');
  expect(keywordArray[9][0]).toBe('having');
  expect(keywordArray[10][0]).toBe('(');
  expect(keywordArray[11][0]).toBe(')');
  expect(keywordArray[12][0]).toBe(')');
  expect(keywordArray[13][0]).toBe('group by');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(20);
  expect(keywordArray[2][1]).toBe(28);
  expect(keywordArray[3][1]).toBe(30);
  expect(keywordArray[4][1]).toBe(64);
  expect(keywordArray[5][1]).toBe(79);
  expect(keywordArray[6][1]).toBe(80);
  expect(keywordArray[7][1]).toBe(112);
  expect(keywordArray[8][1]).toBe(142);
  expect(keywordArray[9][1]).toBe(178);
  expect(keywordArray[10][1]).toBe(188);
  expect(keywordArray[11][1]).toBe(197);
  expect(keywordArray[12][1]).toBe(203);
  expect(keywordArray[13][1]).toBe(223);
});


test('findKeywordAppearances - GROUP BY before FROM but in subquery', () => {
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
  const keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('(');
  expect(keywordArray[2][0]).toBe(')');
  expect(keywordArray[3][0]).toBe('from');
  expect(keywordArray[4][0]).toBe('where');
  expect(keywordArray[5][0]).toBe('(');
  expect(keywordArray[6][0]).toBe('select');
  expect(keywordArray[7][0]).toBe('group by');
  expect(keywordArray[8][0]).toBe('from');
  expect(keywordArray[9][0]).toBe('having');
  expect(keywordArray[10][0]).toBe('(');
  expect(keywordArray[11][0]).toBe(')');
  expect(keywordArray[12][0]).toBe(')');
  expect(keywordArray[13][0]).toBe('group by');
  

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(20);
  expect(keywordArray[2][1]).toBe(28);
  expect(keywordArray[3][1]).toBe(30);
  expect(keywordArray[4][1]).toBe(64);
  expect(keywordArray[5][1]).toBe(79);
  expect(keywordArray[6][1]).toBe(80);
  expect(keywordArray[7][1]).toBe(110);
  expect(keywordArray[8][1]).toBe(142);
  expect(keywordArray[9][1]).toBe(178);
  expect(keywordArray[10][1]).toBe(188);
  expect(keywordArray[11][1]).toBe(197);
  expect(keywordArray[12][1]).toBe(203);
  expect(keywordArray[13][1]).toBe(223);
});


test('findKeywordAppearances - Agg in SELECT but no GROUP BY', () => {
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID;
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  const keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('(');
  expect(keywordArray[2][0]).toBe(')');
  expect(keywordArray[3][0]).toBe('from');
  expect(keywordArray[4][0]).toBe('where');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(20);
  expect(keywordArray[2][1]).toBe(28);
  expect(keywordArray[3][1]).toBe(30);
  expect(keywordArray[4][1]).toBe(64);
});


test('findKeywordAppearances - Agg in WHERE but no GROUP BY', () => {
  query = `
SELECT c.cName, p.price
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  const keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('where');
  expect(keywordArray[3][0]).toBe('(');
  expect(keywordArray[4][0]).toBe(')');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(25);
  expect(keywordArray[2][1]).toBe(59);
  expect(keywordArray[3][1]).toBe(76);
  expect(keywordArray[4][1]).toBe(82);
});


test('findKeywordAppearances - SELECT GROUP BY, no table mentioned in next term', () => {
  query = `
SELECT GROUP BY cName, SUM(purchase.price)
FROM customer, purchase
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  const keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('group by');
  expect(keywordArray[2][0]).toBe('(');
  expect(keywordArray[3][0]).toBe(')');
  expect(keywordArray[4][0]).toBe('from');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(8);
  expect(keywordArray[2][1]).toBe(27);
  expect(keywordArray[3][1]).toBe(42);
  expect(keywordArray[4][1]).toBe(44);
});


test('findKeywordAppearances - SELECT GROUP BY, table to attach to', () => {
  query = `
SELECT GROUP BY customer.cName, SUM(purchase.price)
FROM customer, purchase
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  const keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('group by');
  expect(keywordArray[2][0]).toBe('(');
  expect(keywordArray[3][0]).toBe(')');
  expect(keywordArray[4][0]).toBe('from');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(8);
  expect(keywordArray[2][1]).toBe(36);
  expect(keywordArray[3][1]).toBe(51);
  expect(keywordArray[4][1]).toBe(53);
});


test('findKeywordAppearances - SELECT GROUP BY with aggregations', () => {
  query = `
SELECT GROUP BY SUM(price)
FROM purchase
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  const keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('group by');
  expect(keywordArray[2][0]).toBe('(');
  expect(keywordArray[3][0]).toBe(')');
  expect(keywordArray[4][0]).toBe('from');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(8);
  expect(keywordArray[2][1]).toBe(20);
  expect(keywordArray[3][1]).toBe(26);
  expect(keywordArray[4][1]).toBe(28);
});


test('findKeywordAppearances - Query with WHERE COUNT(GROUP BY [col]) statement', () => {
  query = `
SELECT c.cName, p.price
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID
AND COUNT(GROUP BY p.pID) < 5;`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  const keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('where');
  expect(keywordArray[3][0]).toBe('(');
  expect(keywordArray[4][0]).toBe('group by');
  expect(keywordArray[5][0]).toBe(')');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(25);
  expect(keywordArray[2][1]).toBe(59);
  expect(keywordArray[3][1]).toBe(88);
  expect(keywordArray[4][1]).toBe(89);
  expect(keywordArray[5][1]).toBe(103);
});


test('findKeywordAppearances - Trying to GROUP BY on a table that is not being joined in', () => {
  query = `
SELECT cName, SUM(purchase.price)
FROM customer, purchase
GROUP BY purchase.price;
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  const keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('(');
  expect(keywordArray[2][0]).toBe(')');
  expect(keywordArray[3][0]).toBe('from');
  expect(keywordArray[4][0]).toBe('group by');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(18);
  expect(keywordArray[2][1]).toBe(33);
  expect(keywordArray[3][1]).toBe(35);
  expect(keywordArray[4][1]).toBe(59);
  
});


test('findKeywordAppearances - GROUP BY on table that is not aggregated on', () => {
  query = query = `
SELECT cName
FROM customer, purchase
WHERE customer.cID = purchase.cID
GROUP BY purchase.price;
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  const keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);

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


test('findKeywordAppearances - GROUP BY on table that is not aggregated on and also not joined in', () => {
  query = `
SELECT cName
FROM customer, purchase
GROUP BY purchase.price;
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  const keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                      sortOrderOfAppearance=true);

  // First check that all expected keywords are indeed there
  expect(keywordArray[0][0]).toBe('select');
  expect(keywordArray[1][0]).toBe('from');
  expect(keywordArray[2][0]).toBe('group by');

  // Then check all their locations
  expect(keywordArray[0][1]).toBe(1);
  expect(keywordArray[1][1]).toBe(14);
  expect(keywordArray[2][1]).toBe(38);
});
