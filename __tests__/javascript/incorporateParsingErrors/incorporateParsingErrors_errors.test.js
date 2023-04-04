/*
NOTE:
The tests performed here for each query are based on the AST generated
for the 'correct' version of each query, meaning the expected output
with corrections made where required. To see the expected corrected queries
and the ASTs around which these tests were written, look at
expected_results/expected_asts_groupby_error_queries.json.
*/

// to run: cls & npm test "__tests__/javascript/ast_generation/09_parseQuery_groupby_error_queries.test.js"

const visCode = require('../../../sqlvis/visualize');

test('GROUP BY before SELECT, WHERE with aggregation', () => {
  // Expected: Move the GROUP BY, where -> having
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
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues);

  // Check if all errors were incorporated as expected.
  expect(ast).toBe('AST');
});


test('GROUP BY between SELECT and FROM, WHERE with aggregation', () => {
  // Expected: Move the GROUP BY, where -> having
  query = `
SELECT c.cName, MAX(p.price)
GROUP BY c.cName
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // First check there were errors found as expected, then incorporate them.
  expect(parseResults.foundIssues).toBeDefined();
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues);

  // Check if all errors were incorporated as expected.
  expect(ast).toBe('AST');
});


test('Agg in SELECT & WHERE, correct GROUP BY present', () => {
  // Expected: where -> having
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
GROUP BY c.cName
WHERE c.cID = SUM(p.cID)
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // First check there were errors found as expected, then incorporate them.
  expect(parseResults.foundIssues).toBeDefined();
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues);

  // Check if all errors were incorporated as expected.
  expect(ast).toBe('AST');
});


test('Agg in SELECT & WHERE, no GROUP BY present', () => {
  // Expected: WHERE -> HAVING
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // This query is parsed normally, even though the WHERE incorrectly contains
  //   aggregation. That is not yet found and incorporated here.
  expect(parseResults.foundIssues).not.toBeDefined();
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
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues);

  // Check if all errors were incorporated as expected.
  expect(ast).toBe('AST');
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
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues);

  // Check if all errors were incorporated as expected.
  expect(ast).toBe('AST');
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
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues);

  // Check if all errors were incorporated as expected.
  expect(ast).toBe('AST');
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
  expect(parseResults.foundIssues).not.toBeDefined();
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
  expect(parseResults.foundIssues).not.toBeDefined();
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
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues);

  // Check if all errors were incorporated as expected.
  expect(ast).toBe('AST');
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
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues);

  // Check if all errors were incorporated as expected.
  expect(ast).toBe('AST');
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
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues);

  // Check if all errors were incorporated as expected.
  expect(ast).toBe('AST');
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
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues);

  // Check if all errors were incorporated as expected.
  expect(ast).toBe('AST');
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
  expect(parseResults.foundIssues).not.toBeDefined();
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
  expect(parseResults.foundIssues).not.toBeDefined();
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
  expect(parseResults.foundIssues).not.toBeDefined();
});


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

  // First check there were errors found as expected, then incorporate them.
  expect(parseResults.foundIssues).toBeDefined();
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues);

  // Check if all errors were incorporated as expected.
  expect(ast).toBe('AST');
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
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues);

  // Check if all errors were incorporated as expected.
  expect(ast).toBe('AST');
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
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues);

  // Check if all errors were incorporated as expected.
  expect(ast).toBe('AST');
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
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues);

  // Check if all errors were incorporated as expected.
  expect(ast).toBe('AST');
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
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues);

  // Check if all errors were incorporated as expected.
  expect(ast).toBe('AST');
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
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues);

  // Check if all errors were incorporated as expected.
  expect(ast).toBe('AST');
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
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues);

  // Check if all errors were incorporated as expected.
  expect(ast).toBe('AST');
});
