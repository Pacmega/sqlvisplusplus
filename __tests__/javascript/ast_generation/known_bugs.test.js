// Note to self: doubleWhereDetection is also done now, so queries with
//   double WHERE are expected to be fine at this point too.

// to run: cls & npm test "__tests__/javascript/ast_generation/known_bugs.test.js"

/*
Note 1: doubleWhereDetection is also done now, so queries with
  double WHERE are expected to be fine at this point too.

Note 2: As testing forcedReordering requires doing every step
  to get to that point and then running it, its setup is literally
  the entire contents of attemptOrderingFix. As such, these tests
  also test forcedReordering.
*/

const visCode = require('../../../sqlvis/visualize');

// Effectively setup for all tests
const keywordsToFind = ['with', 'select', 'from', 'join', 'on',
                        'where', 'group by', 'having', 'order by'];
const subqueryMarkers = ['(', ')'];

let itemsToFind = Array.from(keywordsToFind);
itemsToFind.push(...subqueryMarkers);


test('At least one unclear bug in finding biggest mistakes', () => {
  query = `
SELECT MAX(p.price) as highest_purchase, MIN(p.price)
GROUP BY c.cID
WHERE c.cID = p.cID
FROM customer AS c, purchase AS p
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  expect(ast).toBe('ast');
});


test('Bug in handleImproperGroupByPlacement - GROUP BY before SELECT but in subquery', () => {
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
  let keywordsPerLevel = visCode.findKeywordOrderAtEachLevel(keywordArray);
  
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



  let foundIssues = visCode.findKeywordIssuesPerLevel(keywordsPerLevel);

  // Step 1: check if the biggest error(s) was (were) found correctly.
  expect(foundIssues.level_0_0).toBeUndefined();
  expect(foundIssues.level_1_0).toBeDefined();

  let groupByError = {mistakeWord: [itemsToFind.indexOf('group by'),
                                   ['group by', 80, 111]],
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
