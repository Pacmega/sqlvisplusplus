
// to run: cls & npm test "__tests__/javascript/ast_generation/05_findKeywordIssues.test.js"

/*
Note 1: as every usage of this function in the main code includes conversion
of the query to lower case, this is done here too for consistency's sake.
This is not actually needed for this function.

Note 2: instead of checking for every smaller error as well, we focus on the
big ones. These are the ones that should also persist through
onlyKeepBiggestMistakes, so that function can be tested here immediately too.
*/

const visCode = require('../../../sqlvis/visualize');

// Effectively setup for all tests
const keywordsToFind = ['with', 'select', 'from', 'join', 'on',
                        'where', 'group by', 'having', 'order by'];
const subqueryMarkers = ['(', ')'];

let itemsToFind = Array.from(keywordsToFind);
itemsToFind.push(...subqueryMarkers);


test('findKeywordIssues - GROUP BY before SELECT, WHERE with aggregation', () => {
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // Step 1: check if the biggest error(s) was (were) found correctly.
  expect(foundIssues.level_0_0).toBeDefined();
  
  let groupByError = {mistakeWord: [itemsToFind.indexOf('group by'),
                                   ['group by', 1, 17]],
                      issue: 'early',
                      detectedAtKeyword: [itemsToFind.indexOf('where'),
                                         ['where', 81, 104]]};

  expect(foundIssues.level_0_0).toContainEqual(groupByError);

  // Step 2: onlyKeepBiggestMistakes, and check that exactly only the
  //   biggest mistakes are kept. This step is why it is currently
  //   unnecessary to check for every detected item in the previous step.
  for (levelName in foundIssues) {
    let mistakes = foundIssues[levelName];
    visCode.onlyKeepBiggestMistakes(mistakes);
  };

  let expectedFullLevelZeroErrorList = [groupByError];
  
  expect(foundIssues.level_0_0).toStrictEqual(expectedFullLevelZeroErrorList);
});


test('findKeywordIssues - GROUP BY between SELECT and FROM, WHERE with aggregation', () => {
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // Step 1: check if the biggest error(s) was (were) found correctly.
  expect(foundIssues.level_0_0).toBeDefined();
  
  let groupByError = {mistakeWord: [itemsToFind.indexOf('group by'),
                                   ['group by', 30, 46]],
                      issue: 'early',
                      detectedAtKeyword: [itemsToFind.indexOf('where'),
                                         ['where', 81, 104]]};

  expect(foundIssues.level_0_0).toContainEqual(groupByError);
  
  // Step 2: onlyKeepBiggestMistakes, and check that exactly only the
  //   biggest mistakes are kept. This step is why it is currently
  //   unnecessary to check for every detected item in the previous step.
  for (levelName in foundIssues) {
    let mistakes = foundIssues[levelName];
    visCode.onlyKeepBiggestMistakes(mistakes);
  };

  let expectedFullLevelZeroErrorList = [groupByError];
  
  expect(foundIssues.level_0_0).toStrictEqual(expectedFullLevelZeroErrorList);
});


test('findKeywordIssues - Agg in SELECT & WHERE, correct GROUP BY present', () => {
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // Step 1: check if the biggest error(s) was (were) found correctly.
  expect(foundIssues.level_0_0).toBeDefined();
  
  let groupByError = {mistakeWord: [itemsToFind.indexOf('group by'),
                                   ['group by', 64, 80]],
                      issue: 'early',
                      detectedAtKeyword: [itemsToFind.indexOf('where'),
                                         ['where', 81, 104]]};

  expect(foundIssues.level_0_0).toContainEqual(groupByError);
  
  // Step 2: onlyKeepBiggestMistakes, and check that exactly only the
  //   biggest mistakes are kept. This step is why it is currently
  //   unnecessary to check for every detected item in the previous step.
  for (levelName in foundIssues) {
    let mistakes = foundIssues[levelName];
    visCode.onlyKeepBiggestMistakes(mistakes);
  };

  let expectedFullLevelZeroErrorList = [groupByError];
  
  expect(foundIssues.level_0_0).toStrictEqual(expectedFullLevelZeroErrorList);
});


test('findKeywordIssues - Agg in SELECT & WHERE, no GROUP BY present', () => {
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // Step 1: as this query does not contain errors in the keywords, confirm
  //   that none of the levels appear in foundIssues.
  expect(foundIssues.level_0_0).toBeUndefined();
});


test('findKeywordIssues - Second WHERE clause, should be HAVING', () => {
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // Step 1: check if the biggest error(s) was (were) found correctly.
  expect(foundIssues.level_0_0).toBeDefined();
  
  let doubleWhereError = {mistakeWord: [itemsToFind.indexOf('where'),
                                      ['where', 64, 83]],
                          issue: 'early',
                          detectedAtKeyword: [itemsToFind.indexOf('where'),
                                             ['where', 101, 124]]};

  // Check the console log above.
  let whereAfterGroupBy = {mistakeWord: [itemsToFind.indexOf('group by'),
                                        ['group by', 84, 100]],
                           issue: 'early',
                           detectedAtKeyword: [itemsToFind.indexOf('where'),
                                              ['where', 101, 124]]};

  expect(foundIssues.level_0_0).toContainEqual(doubleWhereError);
  expect(foundIssues.level_0_0).toContainEqual(whereAfterGroupBy);

  // Step 2: onlyKeepBiggestMistakes, and check that exactly only the
  //   biggest mistakes are kept. This step is why it is currently
  //   unnecessary to check for every detected item in the previous step.
  for (levelName in foundIssues) {
    let mistakes = foundIssues[levelName];
    visCode.onlyKeepBiggestMistakes(mistakes);
  };

  let expectedFullLevelZeroErrorList = [doubleWhereError, whereAfterGroupBy];
  
  expect(foundIssues.level_0_0).toStrictEqual(expectedFullLevelZeroErrorList);
});


test('findKeywordIssues - GROUP BY before SELECT but in subquery', () => {
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // Step 1: check if the biggest error(s) was (were) found correctly.
  expect(foundIssues.level_0_0).toBeUndefined();
  expect(foundIssues.level_1_0).toBeDefined();

  let groupByError = {mistakeWord: [itemsToFind.indexOf('group by'),
                                   ['group by', 80, 111]],
                      issue: 'early',
                      detectedAtKeyword: [itemsToFind.indexOf('from'),
                                         ['from', 142, 177]]};

  expect(foundIssues.level_1_0).toContainEqual(groupByError);

  // Step 2: onlyKeepBiggestMistakes, and check that exactly only the
  //   biggest mistakes are kept. This step is why it is currently
  //   unnecessary to check for every detected item in the previous step.
  for (levelName in foundIssues) {
    let mistakes = foundIssues[levelName];
    visCode.onlyKeepBiggestMistakes(mistakes);
  };

  let expectedFullLevelOneErrorList = [groupByError];
  
  expect(foundIssues.level_1_0).toStrictEqual(expectedFullLevelOneErrorList);
});


test('findKeywordIssues - GROUP BY before FROM but in subquery', () => {
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // Step 1: check if the biggest error(s) was (were) found correctly.
  expect(foundIssues.level_0_0).toBeUndefined();
  expect(foundIssues.level_1_0).toBeDefined();

  let groupByError = {mistakeWord: [itemsToFind.indexOf('group by'),
                                   ['group by', 110, 141]],
                      issue: 'early',
                      detectedAtKeyword: [itemsToFind.indexOf('from'),
                                         ['from', 142, 177]]};

  expect(foundIssues.level_1_0).toContainEqual(groupByError);

  // Step 2: onlyKeepBiggestMistakes, and check that exactly only the
  //   biggest mistakes are kept. This step is why it is currently
  //   unnecessary to check for every detected item in the previous step.
  for (levelName in foundIssues) {
    let mistakes = foundIssues[levelName];
    visCode.onlyKeepBiggestMistakes(mistakes);
  };

  let expectedFullLevelOneErrorList = [groupByError];
  
  expect(foundIssues.level_1_0).toStrictEqual(expectedFullLevelOneErrorList);
});


test('findKeywordIssues - Agg in SELECT but no GROUP BY', () => {
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // Step 1: as this query does not contain errors in the keywords, confirm
  //   that none of the levels appear in foundIssues.
  expect(foundIssues.level_0_0).toBeUndefined();
});


test('findKeywordIssues - Agg in WHERE but no GROUP BY', () => {
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // Step 1: as this query does not contain errors in the keywords, confirm
  //   that none of the levels appear in foundIssues.
  expect(foundIssues.level_0_0).toBeUndefined();
});


test('findKeywordIssues - SELECT GROUP BY, no table mentioned in next term', () => {
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  console.log('NOTE @ findKeywordIssues: SELECT GROUP BY - As GROUP BY should not appear as a '
              + 'keyword anymore at this point, there should be no issues regarding it.');
  
  // As this query does not contain errors in the keywords that should be
  //   detected at this location, confirm that none of the levels appear.
  expect(foundIssues.level_0_0).toBeUndefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;
});


test('findKeywordIssues - SELECT GROUP BY, table to attach to', () => {
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // As this query does not contain errors in the keywords that should be
  //   detected at this location, confirm that none of the levels appear.
  expect(foundIssues.level_0_0).toBeUndefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;
});


test('findKeywordIssues - SELECT GROUP BY with aggregations', () => {
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // As this query does not contain errors in the keywords that should be
  //   detected at this location, confirm that none of the levels appear.
  expect(foundIssues.level_0_0).toBeUndefined();
  let levelZeroKeywords = keywordsPerLevel.level_0_0.keywordArray;
});


test('findKeywordIssues - Query with WHERE COUNT(GROUP BY [col]) statement', () => {
  query = `
SELECT c.cName, p.price
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID
AND COUNT(GROUP BY p.pID) < 5;`

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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // Step 1: as this query does not contain errors in the keywords, confirm
  //   that none of the levels appear in foundIssues (COUNT(GROUP BY) was
  //   handled before already).
  expect(foundIssues.level_0_0).toBeUndefined();
});


test('findKeywordIssues - Trying to GROUP BY on a table that is not being joined in', () => {
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // Step 1: as this query does not contain errors in the keywords, confirm
  //   that none of the levels appear in foundIssues.
  expect(foundIssues.level_0_0).toBeUndefined();
});


test('findKeywordIssues - GROUP BY on table that is not aggregated on', () => {
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // Step 1: as this query does not contain errors in the keywords, confirm
  //   that none of the levels appear in foundIssues.
  expect(foundIssues.level_0_0).toBeUndefined();
});


test('findKeywordIssues - GROUP BY on table that is not aggregated on and also not joined in', () => {
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // Step 1: as this query does not contain errors in the keywords, confirm
  //   that none of the levels appear in foundIssues.
  expect(foundIssues.level_0_0).toBeUndefined();
});


test('findKeywordIssues - Double FROM subqueries', () => {
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // Step 1: check if the biggest error(s) was (were) found correctly.
  expect(foundIssues.level_0_0).toBeUndefined();
  expect(foundIssues.level_1_0).toBeUndefined();
  expect(foundIssues.level_1_1).toBeUndefined();
});


test('findKeywordIssues - Level 2 subquery', () => {
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // Step 1: as this query does not contain errors, confirm that none of the
  //   levels appear in foundIssues.
  expect(foundIssues.level_0_0).toBeUndefined();
  expect(foundIssues.level_1_0).toBeUndefined();
  expect(foundIssues.level_2_0).toBeUndefined();
});


test('findKeywordIssues - Four subqueries', () => {
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // Step 1: as this query does not contain errors, confirm that none of the
  //   levels appear in foundIssues.
  expect(foundIssues.level_0_0).toBeUndefined();
  expect(foundIssues.level_1_0).toBeUndefined();
  expect(foundIssues.level_1_1).toBeUndefined();
  expect(foundIssues.level_1_2).toBeUndefined();
  expect(foundIssues.level_2_0).toBeUndefined();
});


test('findKeywordIssues - SELECT appearing too late', () => {
query = `
  FROM atable AS a, btable AS b
  WHERE a.id = b.id
  GROUP BY a.id
  SELECT a.id, b.price
  HAVING SUM(b.price) > 10;
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);
  for (let levelName in foundIssues) {
    let levelMistakes = foundIssues[levelName];
    visCode.onlyKeepBiggestMistakes(levelMistakes);
  }

  // Step 1: check if the biggest error(s) was (were) found correctly.
  expect(foundIssues.level_0_0).toBeDefined();

  let lateSelectError = {mistakeWord: [itemsToFind.indexOf('from'),
                                      ["from", 3, 34]],
                         issue: 'late',
                         detectedAtKeyword: [itemsToFind.indexOf('select'),
                                            ["select", 71, 93]]};

  expect(foundIssues.level_0_0).toContainEqual(lateSelectError);

  // Step 2: onlyKeepBiggestMistakes, and check that exactly only the
  //   biggest mistakes are kept. This step is why it is currently
  //   unnecessary to check for every detected item in the previous step.
  for (levelName in foundIssues) {
    let mistakes = foundIssues[levelName];
    visCode.onlyKeepBiggestMistakes(mistakes);
  };

  let expectedFullLevelZeroErrorList = [lateSelectError];
  
  expect(foundIssues.level_0_0).toStrictEqual(expectedFullLevelZeroErrorList);
});


test('findKeywordIssues - Very messed up ordering', () => {
  query = `
GROUP BY a.id
FROM atable AS a, btable AS b
WHERE a.id = b.id
SELECT a.id, b.price
HAVING SUM(b.price) > 10;
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
  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // Step 1: check if the biggest error(s) was (were) found correctly.
  expect(foundIssues.level_0_0).toBeDefined();

  // Special-ish case: FROM is seen as late once and early once,
  //   and as such is registered as being early.
  let lateSelectError = {mistakeWord: [itemsToFind.indexOf('from'),
                                      ["from", 15, 44]],
                         issue: 'early',
                         detectedAtKeyword: [itemsToFind.indexOf('select'),
                                            ["select", 63, 83]]};
  
  let groupByError = {mistakeWord: [itemsToFind.indexOf('group by'),
                                      ["group by", 1, 14]],
                      issue: 'early',
                      detectedAtKeyword: [itemsToFind.indexOf('where'),
                                         ["where", 45, 62]]};


  expect(foundIssues.level_0_0).toContainEqual(lateSelectError);
  expect(foundIssues.level_0_0).toContainEqual(groupByError);

  // Step 2: onlyKeepBiggestMistakes, and check that exactly only the
  //   biggest mistakes are kept. This step is why it is currently
  //   unnecessary to check for every detected item in the previous step.
  // Also, onlyKeepBiggestMistakes flips the lateSelectError to being late
  //   as it figures out what the real problems are.
  for (levelName in foundIssues) {
    let mistakes = foundIssues[levelName];
    visCode.onlyKeepBiggestMistakes(mistakes);
  };
  lateSelectError.issue = 'late';

  let expectedFullLevelZeroErrorList = [groupByError, lateSelectError];
  
  expect(foundIssues.level_0_0).toStrictEqual(expectedFullLevelZeroErrorList);
});
