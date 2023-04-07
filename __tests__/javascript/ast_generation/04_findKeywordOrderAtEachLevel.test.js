
// to run: cls & npm test "__tests__/javascript/ast_generation/04_findKeywordOrderAtEachLevel.test.js"

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


test('findKeywordOrderAtEachLevel - GROUP BY before SELECT, WHERE with aggregation', () => {
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
  let returnObject = visCode.handleImproperGroupByPlacement(query, keywordArray);
  keywordArray = returnObject.updatedKeywordStatus;
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);
  returnObject = visCode.findKeywordOrderAtEachLevel(keywordArray);
  let keywordsPerLevel = returnObject.keywordsPerLevel;
  let levelTreeStructure = returnObject.levelTreeStructure;

  // First check that all expected attributes are indeed there.
  expect(keywordsPerLevel.level_0_0.keywordArray).toBeDefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;

  // Then check the contents.
  expect(levelZeroKeywords[0]).toStrictEqual(['group by', 1, 17]);
  expect(levelZeroKeywords[1]).toStrictEqual(['select', 18, 46]);
  expect(levelZeroKeywords[2]).toStrictEqual(['from', 47, 80]);
  expect(levelZeroKeywords[3]).toStrictEqual(['where', 81, 104]);

  expect(levelTreeStructure.level_0_0).toStrictEqual([]);
  expect(levelTreeStructure.level_1_0).not.toBeDefined();
});


test('findKeywordOrderAtEachLevel - GROUP BY between SELECT and FROM, WHERE with aggregation', () => {
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
  let returnObject = visCode.handleImproperGroupByPlacement(query, keywordArray);
  keywordArray = returnObject.updatedKeywordStatus;
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);
  returnObject = visCode.findKeywordOrderAtEachLevel(keywordArray);
  let keywordsPerLevel = returnObject.keywordsPerLevel;
  let levelTreeStructure = returnObject.levelTreeStructure;

  // First check that all expected attributes are indeed there.
  expect(keywordsPerLevel.level_0_0.keywordArray).toBeDefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;

  // Then check the contents.
  expect(levelZeroKeywords[0]).toStrictEqual(['select', 1, 29]);
  expect(levelZeroKeywords[1]).toStrictEqual(['group by', 30, 46]);
  expect(levelZeroKeywords[2]).toStrictEqual(['from', 47, 80]);
  expect(levelZeroKeywords[3]).toStrictEqual(['where', 81, 104]);

  expect(levelTreeStructure.level_0_0).toStrictEqual([]);
  expect(levelTreeStructure.level_1_0).not.toBeDefined();
});


test('findKeywordOrderAtEachLevel - Agg in SELECT & WHERE, correct GROUP BY present', () => {
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
  let returnObject = visCode.handleImproperGroupByPlacement(query, keywordArray);
  keywordArray = returnObject.updatedKeywordStatus;
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);
  returnObject = visCode.findKeywordOrderAtEachLevel(keywordArray);
  let keywordsPerLevel = returnObject.keywordsPerLevel;
  let levelTreeStructure = returnObject.levelTreeStructure;

  // First check that all expected attributes are indeed there.
  expect(keywordsPerLevel.level_0_0.keywordArray).toBeDefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;

  // Then check the contents.
  expect(levelZeroKeywords[0]).toStrictEqual(['select', 1, 29]);
  expect(levelZeroKeywords[1]).toStrictEqual(['from', 30, 63]);
  expect(levelZeroKeywords[2]).toStrictEqual(['group by', 64, 80]);
  expect(levelZeroKeywords[3]).toStrictEqual(['where', 81, 104]);

  expect(levelTreeStructure.level_0_0).toStrictEqual([]);
  expect(levelTreeStructure.level_1_0).not.toBeDefined();
});


test('findKeywordOrderAtEachLevel - Agg in SELECT & WHERE, no GROUP BY present', () => {
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                    sortOrderOfAppearance=true);
  let returnObject = visCode.handleImproperGroupByPlacement(query, keywordArray);
  keywordArray = returnObject.updatedKeywordStatus;
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);
  returnObject = visCode.findKeywordOrderAtEachLevel(keywordArray);
  let keywordsPerLevel = returnObject.keywordsPerLevel;
  let levelTreeStructure = returnObject.levelTreeStructure;

  // First check that all expected attributes are indeed there.
  expect(keywordsPerLevel.level_0_0.keywordArray).toBeDefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;

  // Then check the contents.
  expect(levelZeroKeywords[0]).toStrictEqual(['select', 1, 29]);
  expect(levelZeroKeywords[1]).toStrictEqual(['from', 30, 63]);
  expect(levelZeroKeywords[2]).toStrictEqual(['where', 64, 87]);

  expect(levelTreeStructure.level_0_0).toStrictEqual([]);
  expect(levelTreeStructure.level_1_0).not.toBeDefined();
});


test('findKeywordOrderAtEachLevel - Second WHERE clause, should be HAVING', () => {
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
  let returnObject = visCode.handleImproperGroupByPlacement(query, keywordArray);
  keywordArray = returnObject.updatedKeywordStatus;
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);
  returnObject = visCode.findKeywordOrderAtEachLevel(keywordArray);
  let keywordsPerLevel = returnObject.keywordsPerLevel;
  let levelTreeStructure = returnObject.levelTreeStructure;

  // First check that all expected attributes are indeed there.
  expect(keywordsPerLevel.level_0_0.keywordArray).toBeDefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;

  // Then check the contents.
  expect(levelZeroKeywords[0]).toStrictEqual(['select', 1, 29]);
  expect(levelZeroKeywords[1]).toStrictEqual(['from', 30, 63]);
  expect(levelZeroKeywords[2]).toStrictEqual(['where', 64, 83]);
  expect(levelZeroKeywords[3]).toStrictEqual(['group by', 84, 100]);
  expect(levelZeroKeywords[4]).toStrictEqual(['where', 101, 124]);

  expect(levelTreeStructure.level_0_0).toStrictEqual([]);
  expect(levelTreeStructure.level_1_0).not.toBeDefined();
});


test('findKeywordOrderAtEachLevel - GROUP BY before SELECT but in subquery', () => {
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
  let returnObject = visCode.handleImproperGroupByPlacement(query, keywordArray);
  keywordArray = returnObject.updatedKeywordStatus;
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);
  returnObject = visCode.findKeywordOrderAtEachLevel(keywordArray);
  let keywordsPerLevel = returnObject.keywordsPerLevel;
  let levelTreeStructure = returnObject.levelTreeStructure;

  // First check that all expected attributes are indeed there.
  expect(keywordsPerLevel.level_0_0.keywordArray).toBeDefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;

  expect(keywordsPerLevel.level_1_0.keywordArray).toBeDefined();
  let levelOneKeywords = keywordsPerLevel.level_1_0.keywordArray;

  // Then check the contents.
  expect(levelZeroKeywords[0]).toStrictEqual(['select', 1, 29]);
  expect(levelZeroKeywords[1]).toStrictEqual(['from', 30, 63]);
  expect(levelZeroKeywords[2]).toStrictEqual(['where', 64, 222]);
  expect(levelZeroKeywords[3]).toStrictEqual(['group by', 223, 238]);

  expect(levelOneKeywords[0]).toStrictEqual(['group by', 80, 111]);
  expect(levelOneKeywords[1]).toStrictEqual(['select', 112, 141]);
  expect(levelOneKeywords[2]).toStrictEqual(['from', 142, 177]);
  expect(levelOneKeywords[3]).toStrictEqual(['having', 178, 202]);

  expect(levelTreeStructure.level_0_0).toStrictEqual([]);
  expect(levelTreeStructure.level_1_0).toStrictEqual(['where']);
  expect(levelTreeStructure.level_1_1).not.toBeDefined();
  expect(levelTreeStructure.level_2_0).not.toBeDefined();
});


test('findKeywordOrderAtEachLevel - GROUP BY before FROM but in subquery', () => {
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
  let returnObject = visCode.handleImproperGroupByPlacement(query, keywordArray);
  keywordArray = returnObject.updatedKeywordStatus;
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);
  returnObject = visCode.findKeywordOrderAtEachLevel(keywordArray);
  let keywordsPerLevel = returnObject.keywordsPerLevel;
  let levelTreeStructure = returnObject.levelTreeStructure;

  // First check that all expected attributes are indeed there.
  expect(keywordsPerLevel.level_0_0.keywordArray).toBeDefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;

  expect(keywordsPerLevel.level_1_0.keywordArray).toBeDefined();
  let levelOneKeywords = keywordsPerLevel.level_1_0.keywordArray;

  // Then check the contents.
  expect(levelZeroKeywords[0]).toStrictEqual(['select', 1, 29]);
  expect(levelZeroKeywords[1]).toStrictEqual(['from', 30, 63]);
  expect(levelZeroKeywords[2]).toStrictEqual(['where', 64, 222]);
  expect(levelZeroKeywords[3]).toStrictEqual(['group by', 223, 238]);

  expect(levelOneKeywords[0]).toStrictEqual(['select', 80, 109]);
  expect(levelOneKeywords[1]).toStrictEqual(['group by', 110, 141]);
  expect(levelOneKeywords[2]).toStrictEqual(['from', 142, 177]);
  expect(levelOneKeywords[3]).toStrictEqual(['having', 178, 202]);

  expect(levelTreeStructure.level_0_0).toStrictEqual([]);
  expect(levelTreeStructure.level_1_0).toStrictEqual(['where']);
  expect(levelTreeStructure.level_1_1).not.toBeDefined();
  expect(levelTreeStructure.level_2_0).not.toBeDefined();
});


test('findKeywordOrderAtEachLevel - Agg in SELECT but no GROUP BY', () => {
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID;
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                    sortOrderOfAppearance=true);
  let returnObject = visCode.handleImproperGroupByPlacement(query, keywordArray);
  keywordArray = returnObject.updatedKeywordStatus;
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);
  returnObject = visCode.findKeywordOrderAtEachLevel(keywordArray);
  let keywordsPerLevel = returnObject.keywordsPerLevel;
  let levelTreeStructure = returnObject.levelTreeStructure;

  // First check that all expected attributes are indeed there.
  expect(keywordsPerLevel.level_0_0.keywordArray).toBeDefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;

  // Then check the contents.
  expect(levelZeroKeywords[0]).toStrictEqual(['select', 1, 29]);
  expect(levelZeroKeywords[1]).toStrictEqual(['from', 30, 63]);
  expect(levelZeroKeywords[2]).toStrictEqual(['where', 64, 82]);

  expect(levelTreeStructure.level_0_0).toStrictEqual([]);
  expect(levelTreeStructure.level_1_0).not.toBeDefined();
});


test('findKeywordOrderAtEachLevel - Agg in WHERE but no GROUP BY', () => {
  query = `
SELECT c.cName, p.price
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                    sortOrderOfAppearance=true);
  let returnObject = visCode.handleImproperGroupByPlacement(query, keywordArray);
  keywordArray = returnObject.updatedKeywordStatus;
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);
  returnObject = visCode.findKeywordOrderAtEachLevel(keywordArray);
  let keywordsPerLevel = returnObject.keywordsPerLevel;
  let levelTreeStructure = returnObject.levelTreeStructure;

  // First check that all expected attributes are indeed there.
  expect(keywordsPerLevel.level_0_0.keywordArray).toBeDefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;

  // Then check the contents.
  expect(levelZeroKeywords[0]).toStrictEqual(['select', 1, 24]);
  expect(levelZeroKeywords[1]).toStrictEqual(['from', 25, 58]);
  expect(levelZeroKeywords[2]).toStrictEqual(['where', 59, 82]);

  expect(levelTreeStructure.level_0_0).toStrictEqual([]);
  expect(levelTreeStructure.level_1_0).not.toBeDefined();
});


test('findKeywordOrderAtEachLevel - SELECT GROUP BY, no table mentioned in next term', () => {
  query = `
SELECT GROUP BY cName, SUM(purchase.price)
FROM customer, purchase
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                    sortOrderOfAppearance=true);
  let returnObject = visCode.handleImproperGroupByPlacement(query, keywordArray);
  keywordArray = returnObject.updatedKeywordStatus;
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);
  returnObject = visCode.findKeywordOrderAtEachLevel(keywordArray);
  let keywordsPerLevel = returnObject.keywordsPerLevel;
  let levelTreeStructure = returnObject.levelTreeStructure;

  // First check that all expected attributes are indeed there.
  expect(keywordsPerLevel.level_0_0.keywordArray).toBeDefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;

  // Then check the contents. If GROUP BY was not correctly solved,
  //   it should be displayed as ['group by', 8, 43].
  expect(levelZeroKeywords[0]).toStrictEqual(['select', 1, 43]);
  expect(levelZeroKeywords[2]).toBeUndefined(); // If false, GROUP BY exists.
  expect(levelZeroKeywords[1]).toStrictEqual(['from', 44, 66]);

  expect(levelTreeStructure.level_0_0).toStrictEqual([]);
  expect(levelTreeStructure.level_1_0).not.toBeDefined();
});


test('findKeywordOrderAtEachLevel - SELECT GROUP BY, table to attach to', () => {
  query = `
SELECT GROUP BY customer.cName, SUM(purchase.price)
FROM customer, purchase
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                    sortOrderOfAppearance=true);
  let returnObject = visCode.handleImproperGroupByPlacement(query, keywordArray);
  keywordArray = returnObject.updatedKeywordStatus;
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);
  returnObject = visCode.findKeywordOrderAtEachLevel(keywordArray);
  let keywordsPerLevel = returnObject.keywordsPerLevel;
  let levelTreeStructure = returnObject.levelTreeStructure;

  // First check that all expected attributes are indeed there.
  expect(keywordsPerLevel.level_0_0.keywordArray).toBeDefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;

  // Then check the contents. If GROUP BY was not correctly solved,
  //   it should be displayed as ['group by', 8, 52]
  expect(levelZeroKeywords[0]).toStrictEqual(['select', 1, 52]);
  expect(levelZeroKeywords[2]).toBeUndefined(); // If false, GROUP BY exists.
  expect(levelZeroKeywords[1]).toStrictEqual(['from', 53, 75]);

  expect(levelTreeStructure.level_0_0).toStrictEqual([]);
  expect(levelTreeStructure.level_1_0).not.toBeDefined();
});


test('findKeywordOrderAtEachLevel - SELECT GROUP BY with aggregations', () => {
  query = `
SELECT GROUP BY SUM(price)
FROM purchase
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                    sortOrderOfAppearance=true);
  let returnObject = visCode.handleImproperGroupByPlacement(query, keywordArray);
  keywordArray = returnObject.updatedKeywordStatus;
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);
  returnObject = visCode.findKeywordOrderAtEachLevel(keywordArray);
  let keywordsPerLevel = returnObject.keywordsPerLevel;
  let levelTreeStructure = returnObject.levelTreeStructure;

  // First check that all expected attributes are indeed there.
  expect(keywordsPerLevel.level_0_0.keywordArray).toBeDefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;

  // Then check the contents. If GROUP BY was not correctly solved,
  //   it should be displayed as ['group by', 8, 27]
  expect(levelZeroKeywords[0]).toStrictEqual(['select', 1, 27]);
  expect(levelZeroKeywords[2]).toBeUndefined(); // If false, GROUP BY exists.
  expect(levelZeroKeywords[1]).toStrictEqual(['from', 28, 40]);

  expect(levelTreeStructure.level_0_0).toStrictEqual([]);
  expect(levelTreeStructure.level_1_0).not.toBeDefined();
});


test('findKeywordOrderAtEachLevel - Query with WHERE COUNT(GROUP BY [col]) statement', () => {
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
  let returnObject = visCode.handleImproperGroupByPlacement(query, keywordArray);
  keywordArray = returnObject.updatedKeywordStatus;
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);
  returnObject = visCode.findKeywordOrderAtEachLevel(keywordArray);
  let keywordsPerLevel = returnObject.keywordsPerLevel;
  let levelTreeStructure = returnObject.levelTreeStructure;

  // First check that all expected attributes are indeed there.
  expect(keywordsPerLevel.level_0_0.keywordArray).toBeDefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;

  // Then check the contents.
  expect(levelZeroKeywords[0]).toStrictEqual(['select', 1, 24]);
  expect(levelZeroKeywords[1]).toStrictEqual(['from', 25, 58]);
  expect(levelZeroKeywords[2]).toStrictEqual(['where', 59, 107]);
  expect(levelZeroKeywords[3]).toBeUndefined();

  expect(levelTreeStructure.level_0_0).toStrictEqual([]);
  expect(levelTreeStructure.level_1_0).not.toBeDefined();
});


test('findKeywordOrderAtEachLevel - Trying to GROUP BY on a table that is not being joined in', () => {
  query = `
SELECT cName, SUM(purchase.price)
FROM customer, purchase
GROUP BY purchase.price;
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                    sortOrderOfAppearance=true);
  let returnObject = visCode.handleImproperGroupByPlacement(query, keywordArray);
  keywordArray = returnObject.updatedKeywordStatus;
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);
  returnObject = visCode.findKeywordOrderAtEachLevel(keywordArray);
  let keywordsPerLevel = returnObject.keywordsPerLevel;
  let levelTreeStructure = returnObject.levelTreeStructure;

  // First check that all expected attributes are indeed there.
  expect(keywordsPerLevel.level_0_0.keywordArray).toBeDefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;

  // Then check the contents.
  expect(levelZeroKeywords[0]).toStrictEqual(['select', 1, 34]);
  expect(levelZeroKeywords[1]).toStrictEqual(['from', 35, 58]);
  expect(levelZeroKeywords[2]).toStrictEqual(['group by', 59, 81]); 

  expect(levelTreeStructure.level_0_0).toStrictEqual([]);
  expect(levelTreeStructure.level_1_0).not.toBeDefined(); 
});


test('findKeywordOrderAtEachLevel - GROUP BY on table that is not aggregated on', () => {
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
  let returnObject = visCode.handleImproperGroupByPlacement(query, keywordArray);
  keywordArray = returnObject.updatedKeywordStatus;
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);
  returnObject = visCode.findKeywordOrderAtEachLevel(keywordArray);
  let keywordsPerLevel = returnObject.keywordsPerLevel;
  let levelTreeStructure = returnObject.levelTreeStructure;

  // First check that all expected attributes are indeed there.
  expect(keywordsPerLevel.level_0_0.keywordArray).toBeDefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;

  // Then check the contents.
  expect(levelZeroKeywords[0]).toStrictEqual(['select', 1, 13]);
  expect(levelZeroKeywords[1]).toStrictEqual(['from', 14, 37]);
  expect(levelZeroKeywords[2]).toStrictEqual(['where', 38, 71]);
  expect(levelZeroKeywords[3]).toStrictEqual(['group by', 72, 94]);

  expect(levelTreeStructure.level_0_0).toStrictEqual([]);
  expect(levelTreeStructure.level_1_0).not.toBeDefined();
});


test('findKeywordOrderAtEachLevel - GROUP BY on table that is not aggregated on and also not joined in', () => {
  query = `
SELECT cName
FROM customer, purchase
GROUP BY purchase.price;
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                    sortOrderOfAppearance=true);
  let returnObject = visCode.handleImproperGroupByPlacement(query, keywordArray);
  keywordArray = returnObject.updatedKeywordStatus;
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);
  returnObject = visCode.findKeywordOrderAtEachLevel(keywordArray);
  let keywordsPerLevel = returnObject.keywordsPerLevel;
  let levelTreeStructure = returnObject.levelTreeStructure;

  // First check that all expected attributes are indeed there.
  expect(keywordsPerLevel.level_0_0.keywordArray).toBeDefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;

  // Then check the contents.
  expect(levelZeroKeywords[0]).toStrictEqual(['select', 1, 13]);
  expect(levelZeroKeywords[1]).toStrictEqual(['from', 14, 37]);
  expect(levelZeroKeywords[2]).toStrictEqual(['group by', 38, 60]);

  expect(levelTreeStructure.level_0_0).toStrictEqual([]);
  expect(levelTreeStructure.level_1_0).not.toBeDefined();
});


test('findKeywordOrderAtEachLevel - Double FROM subqueries', () => {
  // Yes, this is indeed not the most sensible query.
  query = `
SELECT COUNT(a.this)
FROM (SELECT this, that
      FROM there
      WHERE this > 7
     ) as a,
     (SELECT alsothis, alsothat
      FROM otherplace
      WHERE alsothis < 8
     ) as b
WHERE a.this = b.alsothis
GROUP BY that;
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                    sortOrderOfAppearance=true);
  let returnObject = visCode.handleImproperGroupByPlacement(query, keywordArray);
  keywordArray = returnObject.updatedKeywordStatus;
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);
  returnObject = visCode.findKeywordOrderAtEachLevel(keywordArray);
  let keywordsPerLevel = returnObject.keywordsPerLevel;
  let levelTreeStructure = returnObject.levelTreeStructure;

  // First check that all expected attributes are indeed there.
  expect(keywordsPerLevel.level_0_0.keywordArray).toBeDefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;

  expect(keywordsPerLevel.level_1_0.keywordArray).toBeDefined();
  let levelOneZeroKeywords = keywordsPerLevel.level_1_0.keywordArray;

  expect(keywordsPerLevel.level_1_1.keywordArray).toBeDefined();
  let levelOneOneKeywords = keywordsPerLevel.level_1_1.keywordArray;

  // Then check the contents.
  expect(levelZeroKeywords[0]).toStrictEqual(['select', 1, 21]);
  expect(levelZeroKeywords[1]).toStrictEqual(['from', 22, 187]);
  expect(levelZeroKeywords[2]).toStrictEqual(['where', 188, 213]);
  expect(levelZeroKeywords[3]).toStrictEqual(['group by', 214, 226]);

  expect(levelOneZeroKeywords[0]).toStrictEqual(['select', 28, 51]);
  expect(levelOneZeroKeywords[1]).toStrictEqual(['from', 52, 68]);
  expect(levelOneZeroKeywords[2]).toStrictEqual(['where', 69, 88]);

  expect(levelOneOneKeywords[0]).toStrictEqual(['select', 103, 134]);
  expect(levelOneOneKeywords[1]).toStrictEqual(['from', 135, 156]); // test receives 135, 143
  expect(levelOneOneKeywords[2]).toStrictEqual(['where', 157, 180]); // test receives 144, 155

  expect(levelTreeStructure.level_0_0).toStrictEqual([]);
  expect(levelTreeStructure.level_1_0).toStrictEqual(['from']);
  expect(levelTreeStructure.level_1_1).toStrictEqual(['from']);
});


test('findKeywordOrderAtEachLevel - Level 2 subquery', () => {
  // Yes, this is indeed not the most sensible query.
  query = `
SELECT a.this
FROM sometable AS a
WHERE a.that in (SELECT alsothat
                 FROM otherplace
                 WHERE NOT EXISTS (SELECT that
                                   FROM there
                                   WHERE that LIKE '%a%'
                                  )
                );
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                    sortOrderOfAppearance=true);
  let returnObject = visCode.handleImproperGroupByPlacement(query, keywordArray);
  keywordArray = returnObject.updatedKeywordStatus;
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);
  returnObject = visCode.findKeywordOrderAtEachLevel(keywordArray);
  let keywordsPerLevel = returnObject.keywordsPerLevel;
  let levelTreeStructure = returnObject.levelTreeStructure;

  // First check that all expected attributes are indeed there.
  expect(keywordsPerLevel.level_0_0.keywordArray).toBeDefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;

  expect(keywordsPerLevel.level_1_0.keywordArray).toBeDefined();
  let levelOneZeroKeywords = keywordsPerLevel.level_1_0.keywordArray;

  expect(keywordsPerLevel.level_2_0.keywordArray).toBeDefined();
  let levelTwoZeroKeywords = keywordsPerLevel.level_2_0.keywordArray;

  // Then check the contents.
  expect(levelZeroKeywords[0]).toStrictEqual(['select', 1, 14]);
  expect(levelZeroKeywords[1]).toStrictEqual(['from', 15, 34]);
  expect(levelZeroKeywords[2]).toStrictEqual(['where', 35, 303]);

  expect(levelOneZeroKeywords[0]).toStrictEqual(['select', 52, 84]);
  expect(levelOneZeroKeywords[1]).toStrictEqual(['from', 85, 117]);
  expect(levelOneZeroKeywords[2]).toStrictEqual(['where', 118, 302]);

  expect(levelTwoZeroKeywords[0]).toStrictEqual(['select', 136, 182]);
  expect(levelTwoZeroKeywords[1]).toStrictEqual(['from', 183, 228]);
  expect(levelTwoZeroKeywords[2]).toStrictEqual(['where', 229, 284]);

  expect(levelTreeStructure.level_0_0).toStrictEqual([]);
  expect(levelTreeStructure.level_1_0).toStrictEqual(['where']);
  expect(levelTreeStructure.level_2_0).toStrictEqual(['where', 'where']);
});


test('findKeywordOrderAtEachLevel - Four subqueries', () => {
  // Yes, this is indeed not the most sensible query.
  query = `
SELECT a.this
FROM (SELECT this, that
      FROM there
      WHERE this > 7
     ) as a,
     (SELECT alsothis, alsothat
      FROM otherplace
      WHERE alsothis < 8
     ) as b
WHERE b.alsothat in (SELECT alsothat
                     FROM otherplace
                     WHERE NOT EXISTS (SELECT that
                                       FROM there
                                       WHERE that LIKE '%a%'
                                      )
                    );
`

  const clean_query = visCode.queryTextAdjustments(query);
  const lowercaseQuery = query.toLowerCase();
  let keywordArray = visCode.findKeywordAppearances(lowercaseQuery, itemsToFind,
                                                    sortOrderOfAppearance=true);
  let returnObject = visCode.handleImproperGroupByPlacement(query, keywordArray);
  keywordArray = returnObject.updatedKeywordStatus;
  visCode.onlyKeepSubqueryBrackets(keywordArray);
  visCode.addKeywordEndings(keywordArray, clean_query.length);
  returnObject = visCode.findKeywordOrderAtEachLevel(keywordArray);
  let keywordsPerLevel = returnObject.keywordsPerLevel;
  let levelTreeStructure = returnObject.levelTreeStructure;

  // First check that all expected attributes are indeed there.
  expect(keywordsPerLevel.level_0_0.keywordArray).toBeDefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;

  expect(keywordsPerLevel.level_1_0.keywordArray).toBeDefined();
  let levelOneZeroKeywords = keywordsPerLevel.level_1_0.keywordArray;

  expect(keywordsPerLevel.level_1_1.keywordArray).toBeDefined();
  let levelOneOneKeywords = keywordsPerLevel.level_1_1.keywordArray;

  expect(keywordsPerLevel.level_1_2.keywordArray).toBeDefined();
  let levelOneTwoKeywords = keywordsPerLevel.level_1_2.keywordArray;

  expect(keywordsPerLevel.level_2_0.keywordArray).toBeDefined();
  let levelTwoZeroKeywords = keywordsPerLevel.level_2_0.keywordArray;

  // Then check the contents.
  expect(levelZeroKeywords[0]).toStrictEqual(['select', 1, 14]);
  expect(levelZeroKeywords[1]).toStrictEqual(['from', 15, 180]);
  expect(levelZeroKeywords[2]).toStrictEqual(['where', 181, 477]);

  expect(levelOneZeroKeywords[0]).toStrictEqual(['select', 21, 44]);
  expect(levelOneZeroKeywords[1]).toStrictEqual(['from', 45, 61]);
  expect(levelOneZeroKeywords[2]).toStrictEqual(['where', 62, 81]);

  expect(levelOneOneKeywords[0]).toStrictEqual(['select', 96, 127]);
  expect(levelOneOneKeywords[1]).toStrictEqual(['from', 128, 149]);
  expect(levelOneOneKeywords[2]).toStrictEqual(['where', 150, 173]);

  expect(levelOneTwoKeywords[0]).toStrictEqual(['select', 202, 238]);
  expect(levelOneTwoKeywords[1]).toStrictEqual(['from', 239, 275]);
  expect(levelOneTwoKeywords[2]).toStrictEqual(['where', 276, 476]);

  expect(levelTwoZeroKeywords[0]).toStrictEqual(['select', 294, 344]);
  expect(levelTwoZeroKeywords[1]).toStrictEqual(['from', 345, 394]);
  expect(levelTwoZeroKeywords[2]).toStrictEqual(['where', 395, 454]);

  expect(levelTreeStructure.level_0_0).toStrictEqual([]);
  expect(levelTreeStructure.level_1_0).toStrictEqual(['from']);
  expect(levelTreeStructure.level_1_1).toStrictEqual(['from']);
  expect(levelTreeStructure.level_1_2).toStrictEqual(['where']);
  expect(levelTreeStructure.level_2_0).toStrictEqual(['where', 'where']);
});
