/*
NOTE:
The tests performed here for each query are based on the AST generated
for the 'correct' version of each query, meaning the expected output
with corrections made where required. To see the expected corrected queries
and the ASTs around which these tests were written, look at
expected_results/expected_asts_groupby_error_queries.json.
*/

// to run: cls & npm test "__tests__/javascript/incorporateParsingErrors/incorporateParsingErrors_errors.test.js"

const visCode = require('../../../sqlvis/visualize');

// Effectively setup for all tests
const keywordsToFind = ['with', 'select', 'from', 'join', 'on',
                        'where', 'group by', 'having', 'order by'];
const subqueryMarkers = ['(', ')'];

let itemsToFind = Array.from(keywordsToFind);
itemsToFind.push(...subqueryMarkers);


test('GROUP BY before SELECT, WHERE with aggregation', () => {
  query = `
GROUP BY c.cName
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // First check there were errors found as expected, then incorporate them.
  expect(parseResults.foundIssues).toBeDefined();
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues,
                                   parseResults.levelTreeStructure);

  let groupByMessage = 'Your GROUP BY keyword appeared earlier than it is meant to. It is '
                       + 'meant to be used after the keyword WHERE in your query.';

  // Check if the error was incorporated as expected. Note that the
  //   aggregation in WHERE error is undetected for now: this is found
  //   during AST analysis, which happens later.
  expect(ast.groupby[0].errorInfo.message).toBe(groupByMessage);
});


test('GROUP BY between SELECT and FROM, WHERE with aggregation', () => {
  query = `
SELECT c.cName, MAX(p.price)
GROUP BY c.cName
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  let whereError = {mistakeWord: [itemsToFind.indexOf('group by'),
                                 ['group by', 29, 45]],
                    issue: 'early',
                    detectedAtKeyword: [itemsToFind.indexOf('where'),
                                       ['where', 80, 104]]
                   };

  expect(parseResults.foundIssues.level_0_0).toContainEqual(whereError);
  
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues,
                                   parseResults.levelTreeStructure);

  let groupByMessage = 'Your GROUP BY keyword appeared earlier than it is meant to. It is '
                       + 'meant to be used after the keyword WHERE in your query.';

  // Check if all errors were incorporated as expected. Note that the
  //   aggregation in WHERE error is undetected for now: this is found
  //   during AST analysis, which happens later.
  expect(ast.groupby[0].errorInfo.message).toContainEqual(groupByMessage);
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

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // First check there were errors found as expected, then incorporate them.
  expect(parseResults.foundIssues).toBeDefined();

  // The normal foundIssues were already tested, now also test for the ones
  //   that should have been merged in at the end of parseQuery.
  let doubleWhereError = {mistakeWord: [itemsToFind.indexOf('where'),
                                       ['where', 63, 82]],
                          detectedAtKeyword: [itemsToFind.indexOf('where'),
                                             ['where', 100, 124]],
                          handledBy: 'WHERE_LOC->HAVING'};

  expect(parseResults.foundIssues.level_0_0).toContainEqual(doubleWhereError);
  
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues,
                                   parseResults.levelTreeStructure);

  let havingMessage = 'You used the WHERE keyword here, but this needed to be HAVING because of '
                      + 'the GROUP BY statement in front of it.';

  // Check if all errors were incorporated as expected.
  // Keyword location issue should be gone.
  expect(ast.having.errorInfo.message).toContainEqual(havingMessage);
  expect(ast.having.errorInfo.message[1]).not.toBeDefined();
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

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // First check there were errors found as expected, then incorporate them.
  expect(parseResults.foundIssues).toBeDefined();
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues,
                                   parseResults.levelTreeStructure);

  let groupByMessage = 'Your GROUP BY keyword appeared earlier than it is meant to. It is '
                   + 'meant to be used after the keyword FROM in your query.';

  // Check if all errors were incorporated as expected.
  expect(ast.where.left.right.value[0].groupby[0].errorInfo.message).toContainEqual(groupByMessage);
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

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // First check there were errors found as expected, then incorporate them.
  expect(parseResults.foundIssues).toBeDefined();
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues,
                                   parseResults.levelTreeStructure);

  let groupByMessage = 'Your GROUP BY keyword appeared earlier than it is meant to. It is '
                   + 'meant to be used after the keyword FROM in your query.';

  // Check if all errors were incorporated as expected.
  expect(ast.where.left.right.value[0].groupby[0].errorInfo.message).toContainEqual(groupByMessage);
});


test('Agg in SELECT but no GROUP BY', () => {
  // Expected: This should be parseable just fine actually.
  //   Check that the aggregation is made as intended.
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID;
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // As this should be parsed okay, check that indeed no errors are found.
  // No error incorporation to run, and nothing to test in that regard.
  // When there were no issues, an empty dictionary is returned so that
  //   no iteration over the "issues" would break.
  expect(parseResults.foundIssues).toStrictEqual({});
});


test('Agg in WHERE but no GROUP BY', () => {
  // Expected: is parsed normally, so should be recognised and fixed later.
  query = `
SELECT c.cName, p.price
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // As this should be parsed okay, check that indeed no errors are found.
  // No error incorporation to run, and nothing to test in that regard.
  // When there were no issues, an empty dictionary is returned so that
  //   no iteration over the "issues" would break.
  expect(parseResults.foundIssues).toStrictEqual({});
});


test('SELECT GROUP BY, no table mentioned in next term', () => {
  // Expected: GROUP BY interpreted like function, should later
  //   be rewritten into an agg_func like format for visualization
  //   (that way the visualization would remain similar-ish)
  query = `
SELECT GROUP BY cName, SUM(purchase.price)
FROM customer, purchase
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // First check there were errors found as expected, then incorporate them.
  expect(parseResults.foundIssues).toBeDefined();

  // The normal foundIssues were already tested, now also test for the ones
  //   that should have been merged in at the end of parseQuery.
  let groupByError = {mistakeWord: [itemsToFind.indexOf('group by'),
                                   ['group by', 7]],
                      detectedAtKeyword: [itemsToFind.indexOf('group by'),
                                         ['group by', 7]],
                      handledBy: 'GROUP BY ->GROUP_BY_'};

  expect(parseResults.foundIssues.level_0_0).toContainEqual(groupByError);

  visCode.incorporateParsingErrors(ast, parseResults.foundIssues,
                                   parseResults.levelTreeStructure);

  let groupByMessage = 'GROUP BY can only be used as a keyword like e.g. SELECT and FROM, '
                       + 'and should not be within any keyword/function.';

  // Check if all errors were incorporated as expected.
  expect(ast.columns[0].expr.errorInfo.message).toContainEqual(groupByMessage);
});


test('SELECT GROUP BY, table to attach to', () => {
  // Expected: GROUP BY interpreted like function, should later
  //   be rewritten into an agg_func like format for visualization
  //   (that way the visualization would remain similar-ish)
  query = `
SELECT GROUP BY customer.cName, SUM(purchase.price)
FROM customer, purchase
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // First check there were errors found as expected, then incorporate them.
  expect(parseResults.foundIssues).toBeDefined();

  // The normal foundIssues were already tested, now also test for the ones
  //   that should have been merged in at the end of parseQuery.
  let groupByError = {mistakeWord: [itemsToFind.indexOf('group by'),
                                   ['group by', 7]],
                      detectedAtKeyword: [itemsToFind.indexOf('group by'),
                                         ['group by', 7]],
                      handledBy: 'GROUP BY ->GROUP_BY_'};

  expect(parseResults.foundIssues.level_0_0).toContainEqual(groupByError);

  visCode.incorporateParsingErrors(ast, parseResults.foundIssues,
                                   parseResults.levelTreeStructure);

  let groupByMessage = 'GROUP BY can only be used as a keyword like e.g. SELECT and FROM, '
                       + 'and should not be within any keyword/function.';

  // Check if all errors were incorporated as expected.
  expect(ast.columns[0].expr.errorInfo.message).toContainEqual(groupByMessage);
});


test('SELECT GROUP BY with aggregations', () => {
  // Expected: Attach the GROUP BY to the aggregation for one big "agg_func",
  //   later rewrite into two agg_funcs on this col for visualization (?)
  //   (that way the visualization would remain similar-ish)
  query = `
SELECT GROUP BY SUM(price)
FROM purchase
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // First check there were errors found as expected, then incorporate them.
  expect(parseResults.foundIssues).toBeDefined();

  // The normal foundIssues were already tested, now also test for the ones
  //   that should have been merged in at the end of parseQuery.
  let groupByError = {mistakeWord: [itemsToFind.indexOf('group by'),
                                   ['group by', 7]],
                      detectedAtKeyword: [itemsToFind.indexOf('group by'),
                                         ['group by', 7]],
                      handledBy: 'GROUP BY ->GROUP_BY_'};

  expect(parseResults.foundIssues.level_0_0).toContainEqual(groupByError);

  visCode.incorporateParsingErrors(ast, parseResults.foundIssues,
                                   parseResults.levelTreeStructure);

  let groupByMessage = 'GROUP BY can only be used as a keyword like e.g. SELECT and FROM, '
                       + 'and should not be within any keyword/function.';

  // Check if all errors were incorporated as expected.
  expect(ast.columns[0].expr.errorInfo.message).toContainEqual(groupByMessage);
});


test('Query with WHERE COUNT(GROUP BY [col]) statement', () => {
  // Expected: WHERE statement moved to HAVING, GROUP BY affixed to [col]
  // NOTE: I may end up revising this idea and test at some point.
  query = `
SELECT c.cName, p.price
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID
AND COUNT(GROUP BY p.pID) < 5;`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // First check there were errors found as expected, then incorporate them.
  expect(parseResults.foundIssues).toBeDefined();
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues,
                                   parseResults.levelTreeStructure);

  // The normal foundIssues were already tested, now also test for the ones
  //   that should have been merged in at the end of parseQuery.
  let groupByError = {mistakeWord: [itemsToFind.indexOf('group by'),
                                   ['group by', 88]],
                      detectedAtKeyword: [itemsToFind.indexOf('group by'),
                                         ['group by', 88]],
                      handledBy: 'GROUP BY ->GROUP_BY_'};

  expect(parseResults.foundIssues.level_0_0).toContainEqual(groupByError);

  let groupByMessage = 'GROUP BY can only be used as a keyword like e.g. SELECT and FROM, '
                       + 'and should not be within any keyword/function.';

  // Check if all errors were incorporated as expected.
  expect(ast.where.right.left.args.expr.errorInfo.message).toContainEqual(groupByMessage);
});


test('Trying to GROUP BY on a table that is not being joined in', () => {
  // Expected: This should execute fine, it's just a bad idea.
  query = `
SELECT cName, SUM(purchase.price)
FROM customer, purchase
GROUP BY purchase.price;
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // As this should be parsed okay, check that indeed no errors are found.
  // No error incorporation to run, and nothing to test in that regard.
  // When there were no issues, an empty dictionary is returned so that
  //   no iteration over the "issues" would break.
  expect(parseResults.foundIssues).toStrictEqual({});
});


test('GROUP BY on table that is not aggregated on', () => {
  // Expected: Should parse fine so focus on checking AST matches expectation
  query = query = `
SELECT cName
FROM customer, purchase
WHERE customer.cID = purchase.cID
GROUP BY purchase.price;
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // As this should be parsed okay, check that indeed no errors are found.
  // No error incorporation to run, and nothing to test in that regard.
  // When there were no issues, an empty dictionary is returned so that
  //   no iteration over the "issues" would break.
  expect(parseResults.foundIssues).toStrictEqual({});
});


test('GROUP BY on table that is not aggregated on and also not joined in', () => {
  // Expected: Should parse fine (but makes no sense, don't bother correcting)
  //   so focus on checking AST matches expectation
  query = `
SELECT cName
FROM customer, purchase
GROUP BY purchase.price;
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // As this should be parsed okay, check that indeed no errors are found.
  // No error incorporation to run, and nothing to test in that regard.
  // When there were no issues, an empty dictionary is returned so that
  //   no iteration over the "issues" would break.
  expect(parseResults.foundIssues).toStrictEqual({});
});


test('Finding biggest mistakes test #n', () => {
  query = `
SELECT MAX(p.price) as highest_purchase, MIN(p.price)
GROUP BY c.cID
WHERE c.cID = p.cID
FROM customer AS c, purchase AS p
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // First check there were errors found as expected, then incorporate them.
  expect(parseResults.foundIssues).toBeDefined();

  // The normal foundIssues were already tested, now also test for the ones
  //   that should have been merged in at the end of parseQuery.
  let groupByError = {mistakeWord: [itemsToFind.indexOf('group by'),
                                   ['group by', 54, 68]],
                      issue: 'early',
                      detectedAtKeyword: [itemsToFind.indexOf('where'),
                                         ['where', 69, 88]]};

  let fromError = {mistakeWord: [itemsToFind.indexOf('where'),
                                ['where', 69, 88]],
                   issue: 'early',
                   detectedAtKeyword: [itemsToFind.indexOf('from'),
                                      ['from', 89, 122]]};

  expect(parseResults.foundIssues.level_0_0).toContainEqual(groupByError);
  expect(parseResults.foundIssues.level_0_0).toContainEqual(fromError);

  visCode.incorporateParsingErrors(ast, parseResults.foundIssues,
                                   parseResults.levelTreeStructure);

  let groupByMessage = 'Your GROUP BY keyword appeared earlier than it is meant to. It is '
                     + 'meant to be used after the keyword WHERE in your query.';
  let whereMessage = 'Your WHERE keyword appeared earlier than it is meant to. It is '
                     + 'meant to be used after the keyword FROM in your query.';

  // Check if all errors were incorporated as expected.
  expect(ast.groupby[0].errorInfo.message).toContainEqual(groupByMessage);
  expect(ast.where.errorInfo.message).toContainEqual(whereMessage);
});


test('Repeated WHERE instead of using AND', () => {
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID IN (SELECT p2.cID
                FROM purchase AS p2
                GROUP BY p2.cID
                HAVING SUM(p2.price) > 20)
WHERE c.cID = p.cID
GROUP BY c.cName;`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // First check there were errors found as expected, then incorporate them.
  expect(parseResults.foundIssues).toBeDefined();

  // The normal foundIssues were already tested, now also test for the ones
  //   that should have been merged in at the end of parseQuery.
  let whereError = {mistakeWord: [itemsToFind.indexOf('where'),
                                 ['where', 63, 203]],
                    detectedAtKeyword: [itemsToFind.indexOf('where'),
                                       ['where', 204, 223]],
                    handledBy: 'WHERE->AND'};

  expect(parseResults.foundIssues.level_0_0).toContainEqual(whereError);

  visCode.incorporateParsingErrors(ast, parseResults.foundIssues,
                                   parseResults.levelTreeStructure);

  let whereMessage = 'You used WHERE here, but this was incorrect. You can only '
                      + 'use the keyword WHERE once per query.';

  // Check if all errors were incorporated as expected.
  expect(ast.where.right.left.errorInfo.message).toContainEqual(whereMessage);
  expect(ast.where.right.right.errorInfo.message).toContainEqual(whereMessage);
});


test('Directly subsequent WHERE, includes aggregation, no GROUP BY', () => {
  // This query doesn't really make sense without GROUP BY, but anyway.
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID
WHERE MIN(p.price) > 7.5
ORDER BY c.cName ASC;
`
  
  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // First check there were errors found as expected, then incorporate them.
  expect(parseResults.foundIssues).toBeDefined();

  // The normal foundIssues were already tested, now also test for the ones
  //   that should have been merged in at the end of parseQuery.
  let whereError = {mistakeWord: [itemsToFind.indexOf('where'),
                                 ['where', 63, 82]],
                    detectedAtKeyword: [itemsToFind.indexOf('where'),
                                       ['where', 83, 107]],
                    handledBy: 'WHERE->AND'};

  expect(parseResults.foundIssues.level_0_0).toContainEqual(whereError);

  visCode.incorporateParsingErrors(ast, parseResults.foundIssues,
                                   parseResults.levelTreeStructure);

  let whereMessage = 'You used WHERE here, but this was incorrect. You can only '
                      + 'use the keyword WHERE once per query.';

  // Check if all errors were incorporated as expected.
  expect(ast.where.right.left.errorInfo.message).toContainEqual(whereMessage);
  expect(ast.where.right.right.errorInfo.message).toContainEqual(whereMessage);
});


test('Second WHERE includes aggregation, with GROUP BY', () => {
  // Should give the same results as the query above, except now there is a
  //   GROUP BY present as well.
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID
GROUP BY c.cName
WHERE MIN(p.price) > 7.5
ORDER BY c.cName ASC;
`
  
  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // First check there were errors found as expected, then incorporate them.
  expect(parseResults.foundIssues).toBeDefined();

  // The normal foundIssues were already tested, now also test for the ones
  //   that should have been merged in at the end of parseQuery.
  let whereError = {mistakeWord: [itemsToFind.indexOf('where'),
                                 ['where', 63, 82]],
                    detectedAtKeyword: [itemsToFind.indexOf('where'),
                                       ['where', 100, 124]],
                    handledBy: 'WHERE_LOC->HAVING'};

  expect(parseResults.foundIssues.level_0_0).toContainEqual(whereError);

  visCode.incorporateParsingErrors(ast, parseResults.foundIssues,
                                   parseResults.levelTreeStructure);

  let havingMessage = 'You used the WHERE keyword here, but this was incorrect because '
                      + 'of the placement of this part of your query.';

  // Check if all errors were incorporated as expected.
  expect(ast.having.errorInfo.message).toContainEqual(havingMessage);
});


test('Second WHERE should be HAVING, with existing HAVING', () => {
  // Should give the same results as the query above, except now there is a
  //   GROUP BY present as well.
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID
WHERE MIN(p.price) > 7.5
GROUP BY c.cName
HAVING COUNT(c.cID) > 5
ORDER BY c.cName ASC;
`
  
  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // First check there were errors found as expected, then incorporate them.
  expect(parseResults.foundIssues).toBeDefined();

  // The normal foundIssues were already tested, now also test for the ones
  //   that should have been merged in at the end of parseQuery.
  let whereError = {mistakeWord: [itemsToFind.indexOf('where'),
                                 ['where', 63, 82]],
                    detectedAtKeyword: [itemsToFind.indexOf('where'),
                                       ['where', 83, 107]],
                    handledBy: 'WHERE->AND'};

  expect(parseResults.foundIssues.level_0_0).toContainEqual(whereError);

  visCode.incorporateParsingErrors(ast, parseResults.foundIssues,
                                   parseResults.levelTreeStructure);

  let whereMessage = 'You used WHERE here, but this was incorrect. You can only '
                      + 'use the keyword WHERE once per query.';

  // Check if all errors were incorporated as expected.
  expect(ast.where.right.left.errorInfo.message).toContainEqual(whereMessage);
  expect(ast.where.right.right.errorInfo.message).toContainEqual(whereMessage);
});


test('Second WHERE after HAVING', () => {
  // An interesting mistake to make.
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = p.cID
GROUP BY c.cName
HAVING COUNT(c.cID) > 5
WHERE MIN(p.price) > 7.5
ORDER BY c.cName ASC;
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // These are the exact same checks as the test just above, because the
  //   rebuilt query is the exact same.

  // First check there were errors found as expected, then incorporate them.
  expect(parseResults.foundIssues).toBeDefined();

  // The normal foundIssues were already tested, now also test for the ones
  //   that should have been merged in at the end of parseQuery.
  let whereError = {mistakeWord: [itemsToFind.indexOf('where'),
                                 ['where', 63, 82]],
                    detectedAtKeyword: [itemsToFind.indexOf('where'),
                                       ['where', 124, 148]],
                    handledBy: 'WHERE_LOC->HAVING_AND'};

  expect(parseResults.foundIssues.level_0_0).toContainEqual(whereError);

  visCode.incorporateParsingErrors(ast, parseResults.foundIssues,
                                   parseResults.levelTreeStructure);

  let havingMessage = 'You used the WHERE keyword here, but this was incorrect because '
                      + 'of the placement of this part of your query.';

  // Check if all errors were incorporated as expected.
  expect(ast.having.right.errorInfo.message).toContainEqual(havingMessage);
});


test('Second WHERE should be HAVING, but in subquery', () => {
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID IN (GROUP BY p2.cID
                SELECT p2.cID
                FROM purchase AS p2
                WHERE p2.cID LIKE '%a%'
                WHERE COUNT(p2.cID) < 5
                HAVING SUM(p2.price) > 20)
AND c.cID = p.cID
GROUP BY c.cName
ORDER BY c.cName ASC;`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // First check there were errors found as expected, then incorporate them.
  expect(parseResults.foundIssues).toBeDefined();

  // The normal foundIssues were already tested, now also test for the ones
  //   that should have been merged in at the end of parseQuery.
  let whereError = {mistakeWord: [itemsToFind.indexOf('where'),
                                 ['where', 177, 216]],
                    detectedAtKeyword: [itemsToFind.indexOf('where'),
                                       ['where', 217, 256]],
                    handledBy: 'WHERE_LOC->HAVING_AND'};

  expect(parseResults.foundIssues.level_1_0).toContainEqual(whereError);

  visCode.incorporateParsingErrors(ast, parseResults.foundIssues,
                                   parseResults.levelTreeStructure);

  let havingMessage = 'You used the WHERE keyword here, but this was incorrect because '
                      + 'of the placement of this part of your query.';

  // Check if all errors were incorporated as expected.
  expect(ast.where.left.right.value[0].having.right.errorInfo.message).toContainEqual(havingMessage);
});


test('Finding and marking errors at many levels at once', () => {
  // Depths in depths, mainly for checking different depth functionalities.
  query = `
SELECT a.this
FROM (SELECT this, that
      FROM there
      WHERE this > 7
     ) as a,
     (SELECT alsothis, alsothat
      FROM otherplace
      WHERE alsothis < 8
      AND alsothat IN (SELECT alsothat
                       WHERE alsothat > 4
                       FROM otherplace)
     ) as b
WHERE b.alsothat in (SELECT alsothat
                     FROM otherplace
                     WHERE NOT EXISTS (FROM there
                                       WHERE that LIKE '%a%'
                                       SELECT that
                                      )
                     WHERE EXISTS (FROM otherplace
                                   SELECT alsothat
                                   WHERE alsothat LIKE '%b%') 
                    );
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // First check there were errors found as expected, then incorporate them.
  expect(parseResults.foundIssues).toBeDefined();

  // The normal foundIssues were already tested, now also test for the ones
  //   that should have been merged in at the end of parseQuery.
  let twoZeroError = {mistakeWord: [itemsToFind.indexOf('where'),
                                   ['where', 230, 271]],
                      issue: 'early',
                      detectedAtKeyword: [itemsToFind.indexOf('from'),
                                         ['from', 272, 286]]};

  let oneTwoError = {mistakeWord: [itemsToFind.indexOf('where'),
                                   ['where', 396, 597]],
                      detectedAtKeyword: [itemsToFind.indexOf('where'),
                                         ['where', 598, 761]],
                      handledBy: 'WHERE->AND'};

  let twoOneError = {mistakeWord: [itemsToFind.indexOf('from'),
                                   ['from', 414, 463]],
                     issue: 'late',
                     detectedAtKeyword: [itemsToFind.indexOf('select'),
                                        ['select', 525, 574]]};

  let twoTwoError = {mistakeWord: [itemsToFind.indexOf('from'),
                                   ['from', 612, 662]],
                     issue: 'early',
                     detectedAtKeyword: [itemsToFind.indexOf('select'),
                                        ['select', 663, 713]]};

  expect(parseResults.foundIssues.level_2_0).toContainEqual(twoZeroError);
  expect(parseResults.foundIssues.level_1_2).toContainEqual(oneTwoError);
  expect(parseResults.foundIssues.level_2_1).toContainEqual(twoOneError);
  expect(parseResults.foundIssues.level_2_2).toContainEqual(twoTwoError);

  visCode.incorporateParsingErrors(ast, parseResults.foundIssues,
                                   parseResults.levelTreeStructure);

  let twoZeroMessage = 'Your WHERE keyword appeared earlier than it is meant to. It is '
                       + 'meant to be used after the keyword FROM in your query.';

  let oneTwoMessage = 'You used the WHERE keyword here, but this needed to be AND. You should only '
                      + 'use WHERE once per query.';

  let twoOneMessage = 'Your SELECT keyword appeared later than it is meant to. It is '
                      + 'meant to be used before the keyword FROM in your query.';

  let twoTwoMessage = 'Your FROM keyword appeared earlier than it is meant to. It is '
                      + 'meant to be used after the keyword SELECT in your query.';

  // Check if all errors were incorporated as expected.
  expect(ast.from[1].expr.where.right.right.value[0].where.errorInfo.message).toContainEqual(
    twoZeroMessage);
  expect(ast.where.right.value[0].where.right.errorInfo.message).toContainEqual(
    oneTwoMessage);
  expect(ast.where.right.value[0].where.left.expr.columns[0].errorInfo.message).toContainEqual(
    twoOneMessage);
  expect(ast.where.right.value[0].where.right.expr.from[0].errorInfo.message).toContainEqual(
    twoTwoMessage);
});
