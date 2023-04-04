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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).toBeNull();
  expect(ast.groupby).not.toBeNull();
  expect(ast.having).not.toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBe('c');
  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[1].expr.name).toBe('MAX');
  expect(ast.columns[1].expr.args.expr.column).toBe('price');
  expect(ast.columns[1].expr.args.expr.table).toBe('p');

  expect(ast.from[0].as).toBe('c');
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBe('p');
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.groupby[0].column).toBe('cName');
  expect(ast.groupby[0].table).toBe('c');

  expect(ast.having.left.column).toBe('cID');
  expect(ast.having.left.table).toBe('c');
  expect(ast.having.operator).toBe('=');
  expect(ast.having.right.type).toBe('aggr_func');
  expect(ast.having.right.name).toBe('SUM');
  expect(ast.having.right.args.expr.column).toBe('cID');
  expect(ast.having.right.args.expr.table).toBe('p');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).toBeNull();
  expect(ast.groupby).not.toBeNull();
  expect(ast.having).not.toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBe('c');
  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[1].expr.name).toBe('MAX');
  expect(ast.columns[1].expr.args.expr.column).toBe('price');
  expect(ast.columns[1].expr.args.expr.table).toBe('p');

  expect(ast.from[0].as).toBe('c');
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBe('p');
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.groupby[0].column).toBe('cName');
  expect(ast.groupby[0].table).toBe('c');

  expect(ast.having.left.column).toBe('cID');
  expect(ast.having.left.table).toBe('c');
  expect(ast.having.operator).toBe('=');
  expect(ast.having.right.type).toBe('aggr_func');
  expect(ast.having.right.name).toBe('SUM');
  expect(ast.having.right.args.expr.column).toBe('cID');
  expect(ast.having.right.args.expr.table).toBe('p');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).toBeNull();
  expect(ast.groupby).not.toBeNull();
  expect(ast.having).not.toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBe('c');
  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[1].expr.name).toBe('MAX');
  expect(ast.columns[1].expr.args.expr.column).toBe('price');
  expect(ast.columns[1].expr.args.expr.table).toBe('p');

  expect(ast.from[0].as).toBe('c');
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBe('p');
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.groupby[0].column).toBe('cName');
  expect(ast.groupby[0].table).toBe('c');

  expect(ast.having.left.column).toBe('cID');
  expect(ast.having.left.table).toBe('c');
  expect(ast.having.operator).toBe('=');
  expect(ast.having.right.type).toBe('aggr_func');
  expect(ast.having.right.name).toBe('SUM');
  expect(ast.having.right.args.expr.column).toBe('cID');
  expect(ast.having.right.args.expr.table).toBe('p');
});


test('Agg in SELECT & WHERE, no GROUP BY present', () => {
  // Expected: check that the SUM is indeed parsed as an agg
  query = `
SELECT c.cName, MAX(p.price)
FROM customer AS c, purchase AS p
WHERE c.cID = SUM(p.cID)
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).not.toBeNull();
  expect(ast.groupby).toBeNull();
  expect(ast.having).toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBe('c');
  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[1].expr.name).toBe('MAX');
  expect(ast.columns[1].expr.args.expr.column).toBe('price');
  expect(ast.columns[1].expr.args.expr.table).toBe('p');

  expect(ast.from[0].as).toBe('c');
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBe('p');
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.where.left.column).toBe('cID');
  expect(ast.where.left.table).toBe('c');
  expect(ast.where.operator).toBe('=');
  expect(ast.where.right.type).toBe('aggr_func');
  expect(ast.where.right.name).toBe('SUM');
  expect(ast.where.right.args.expr.column).toBe('cID');
  expect(ast.where.right.args.expr.table).toBe('p');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).not.toBeNull();
  expect(ast.groupby).not.toBeNull();
  expect(ast.having).not.toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBe('c');
  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[1].expr.name).toBe('MAX');
  expect(ast.columns[1].expr.args.expr.column).toBe('price');
  expect(ast.columns[1].expr.args.expr.table).toBe('p');

  expect(ast.from[0].as).toBe('c');
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBe('p');
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.groupby[0].column).toBe('cName');
  expect(ast.groupby[0].table).toBe('c');

  expect(ast.having.left.column).toBe('cName');
  expect(ast.having.left.table).toBe('c');
  expect(ast.having.operator).toBe('LIKE');
  expect(ast.having.right.value).toBe('%a%');

  expect(ast.where.left.column).toBe('cID');
  expect(ast.where.left.table).toBe('c');
  expect(ast.where.operator).toBe('=');
  expect(ast.where.right.column).toBe('cID');
  expect(ast.where.right.table).toBe('p');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).not.toBeNull();
  expect(ast.groupby).not.toBeNull();
  expect(ast.having).toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBe('c');
  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[1].expr.name).toBe('MAX');
  expect(ast.columns[1].expr.args.expr.column).toBe('price');
  expect(ast.columns[1].expr.args.expr.table).toBe('p');

  expect(ast.from[0].as).toBe('c');
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBe('p');
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.groupby[0].column).toBe('cName');
  expect(ast.groupby[0].table).toBe('c');

  expect(ast.where.left.left.column).toBe('cID');
  expect(ast.where.left.left.table).toBe('c');
  expect(ast.where.left.operator).toBe('IN');
  
  // Subquery happens here
  expect(ast.where.left.right.value[0].type).toBe('select');
  expect(ast.where.left.right.type).toBe('expr_list');
  expect(ast.where.left.right.value[0].columns[0].expr.column).toBe('cID');
  expect(ast.where.left.right.value[0].columns[0].expr.table).toBe('p2');

  expect(ast.where.left.right.value[0].from[0].as).toBe('p2');
  expect(ast.where.left.right.value[0].from[0].table).toBe('purchase');

  expect(ast.where.left.right.value[0].groupby[0].column).toBe('cID');
  expect(ast.where.left.right.value[0].groupby[0].table).toBe('p2');

  expect(ast.where.left.right.value[0].having.left.name).toBe('SUM');
  expect(ast.where.left.right.value[0].having.left.type).toBe('aggr_func');
  expect(ast.where.left.right.value[0].having.left.args.expr.column).toBe('price');
  expect(ast.where.left.right.value[0].having.left.args.expr.table).toBe('p2');
  expect(ast.where.left.right.value[0].having.operator).toBe('>');
  expect(ast.where.left.right.value[0].having.right.value).toBe(20);
  // End of subquery

  expect(ast.where.operator).toBe('AND');
  expect(ast.where.right.left.column).toBe('cID');
  expect(ast.where.right.left.table).toBe('c');
  expect(ast.where.right.operator).toBe('=');
  expect(ast.where.right.right.column).toBe('cID');
  expect(ast.where.right.right.table).toBe('p');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).not.toBeNull();
  expect(ast.groupby).not.toBeNull();
  expect(ast.having).toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBe('c');
  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[1].expr.name).toBe('MAX');
  expect(ast.columns[1].expr.args.expr.column).toBe('price');
  expect(ast.columns[1].expr.args.expr.table).toBe('p');

  expect(ast.from[0].as).toBe('c');
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBe('p');
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.groupby[0].column).toBe('cName');
  expect(ast.groupby[0].table).toBe('c');

  expect(ast.where.left.left.column).toBe('cID');
  expect(ast.where.left.left.table).toBe('c');
  expect(ast.where.left.operator).toBe('IN');
  
  // Subquery happens here
  expect(ast.where.left.right.value[0].type).toBe('select');
  expect(ast.where.left.right.type).toBe('expr_list');
  expect(ast.where.left.right.value[0].columns[0].expr.column).toBe('cID');
  expect(ast.where.left.right.value[0].columns[0].expr.table).toBe('p2');

  expect(ast.where.left.right.value[0].from[0].as).toBe('p2');
  expect(ast.where.left.right.value[0].from[0].table).toBe('purchase');

  expect(ast.where.left.right.value[0].groupby[0].column).toBe('cID');
  expect(ast.where.left.right.value[0].groupby[0].table).toBe('p2');

  expect(ast.where.left.right.value[0].having.left.name).toBe('SUM');
  expect(ast.where.left.right.value[0].having.left.type).toBe('aggr_func');
  expect(ast.where.left.right.value[0].having.left.args.expr.column).toBe('price');
  expect(ast.where.left.right.value[0].having.left.args.expr.table).toBe('p2');
  expect(ast.where.left.right.value[0].having.operator).toBe('>');
  expect(ast.where.left.right.value[0].having.right.value).toBe(20);
  // End of subquery

  expect(ast.where.operator).toBe('AND');
  expect(ast.where.right.left.column).toBe('cID');
  expect(ast.where.right.left.table).toBe('c');
  expect(ast.where.right.operator).toBe('=');
  expect(ast.where.right.right.column).toBe('cID');
  expect(ast.where.right.right.table).toBe('p');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).not.toBeNull();
  expect(ast.groupby).toBeNull();
  expect(ast.having).toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBe('c');
  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[1].expr.name).toBe('MAX');
  expect(ast.columns[1].expr.args.expr.column).toBe('price');
  expect(ast.columns[1].expr.args.expr.table).toBe('p');

  expect(ast.from[0].as).toBe('c');
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBe('p');
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.where.left.column).toBe('cID');
  expect(ast.where.left.table).toBe('c');
  expect(ast.where.operator).toBe('=');
  expect(ast.where.right.column).toBe('cID');
  expect(ast.where.right.table).toBe('p');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).not.toBeNull();
  expect(ast.groupby).toBeNull();
  expect(ast.having).toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBe('c');
  expect(ast.columns[1].expr.column).toBe('price');
  expect(ast.columns[1].expr.table).toBe('p');

  expect(ast.from[0].as).toBe('c');
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBe('p');
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.where.left.column).toBe('cID');
  expect(ast.where.left.table).toBe('c');
  expect(ast.where.operator).toBe('=');
  expect(ast.where.right.type).toBe('aggr_func');
  expect(ast.where.right.name).toBe('SUM');
  expect(ast.where.right.args.expr.column).toBe('cID');
  expect(ast.where.right.args.expr.table).toBe('p');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).toBeNull();
  expect(ast.groupby).toBeNull();
  expect(ast.having).toBeNull();

  // Then check contents.
  // Notice the recognition as a function, not as an aggr_func.
  // This will be relevant later, in analysis.
  expect(ast.columns[0].expr.column).toBe('GROUP_BY_cName');
  // expect(ast.columns[0].expr.name).toBe('GROUPBY');
  // expect(ast.columns[0].expr.type).toBe('function');
  // expect(ast.columns[0].expr.args.type).toBe('expr_list');
  // expect(ast.columns[0].expr.args.value[0].table).toBeNull();
  // expect(ast.columns[0].expr.args.value[0].column).toBe('cName');
  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[1].expr.name).toBe('SUM');
  expect(ast.columns[1].expr.args.expr.column).toBe('price');
  expect(ast.columns[1].expr.args.expr.table).toBe('purchase');

  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].table).toBe('purchase');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).toBeNull();
  expect(ast.groupby).toBeNull();
  expect(ast.having).toBeNull();

  // Then check contents.
  // Notice the recognition as a function, not as an aggr_func.
  // This will be relevant later, in analysis.
  // expect(ast.columns[0].expr.name).toBe('GROUPBY');
  // expect(ast.columns[0].expr.type).toBe('function');
  // expect(ast.columns[0].expr.args.type).toBe('expr_list');
  // expect(ast.columns[0].expr.args.value[0].table).toBe('customer');
  // expect(ast.columns[0].expr.args.value[0].column).toBe('cName');
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBe('GROUP_BY_customer');

  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[1].expr.name).toBe('SUM');
  expect(ast.columns[1].expr.args.expr.column).toBe('price');
  expect(ast.columns[1].expr.args.expr.table).toBe('purchase');

  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].table).toBe('purchase');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).toBeNull();
  expect(ast.groupby).toBeNull();
  expect(ast.having).toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.name).toBe('GROUP_BY_SUM');
  expect(ast.columns[0].expr.type).toBe('function');
  expect(ast.columns[0].expr.args.value[0].column).toBe('price');
  expect(ast.columns[0].expr.args.value[0].table).toBeNull();

  expect(ast.from[0].as).toBeNull();
  expect(ast.from[0].table).toBe('purchase');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).toBeNull();
  expect(ast.groupby).toBeNull();
  expect(ast.having).not.toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBe('c');
  expect(ast.columns[1].expr.column).toBe('price');
  expect(ast.columns[1].expr.table).toBe('p');

  expect(ast.from[0].as).toBe('c');
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBe('p');
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.having.left.left.column).toBe('cID');
  expect(ast.having.left.left.table).toBe('c');
  expect(ast.having.left.operator).toBe('=');
  expect(ast.having.left.right.column).toBe('cID');
  expect(ast.having.left.right.table).toBe('p');
  expect(ast.having.operator).toBe('AND');
  expect(ast.having.right.left.name).toBe('COUNT');
  expect(ast.having.right.left.type).toBe('aggr_func');
  expect(ast.having.right.left.args.expr.column).toBe('pID');
  expect(ast.having.right.left.args.expr.table).toBe('GROUP_BY_p');
  expect(ast.having.right.operator).toBe('<');
  expect(ast.having.right.right.value).toBe(5);
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).toBeNull();
  expect(ast.groupby).not.toBeNull();
  expect(ast.having).toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBeNull();
  expect(ast.columns[1].expr.name).toBe('SUM');
  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[1].expr.args.expr.column).toBe('price');
  expect(ast.columns[1].expr.args.expr.table).toBe('purchase');

  expect(ast.from[0].as).toBeNull();
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBeNull();
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.groupby[0].column).toBe('price');
  expect(ast.groupby[0].table).toBe('purchase');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).not.toBeNull();
  expect(ast.groupby).not.toBeNull();
  expect(ast.having).toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBeNull();

  expect(ast.from[0].as).toBeNull();
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBeNull();
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.groupby[0].column).toBe('price');
  expect(ast.groupby[0].table).toBe('purchase');

  expect(ast.where.left.column).toBe('cID');
  expect(ast.where.left.table).toBe('customer');
  expect(ast.where.operator).toBe('=');
  expect(ast.where.right.column).toBe('cID');
  expect(ast.where.right.table).toBe('purchase');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).toBeNull();
  expect(ast.groupby).not.toBeNull();
  expect(ast.having).toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBeNull();

  expect(ast.from[0].as).toBeNull();
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBeNull();
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.groupby[0].column).toBe('price');
  expect(ast.groupby[0].table).toBe('purchase');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).not.toBeNull();
  expect(ast.groupby).not.toBeNull();
  expect(ast.having).toBeNull();

  expect(ast.columns[0].as).toBe('highest_purchase');
  expect(ast.columns[0].expr.type).toBe('aggr_func');
  expect(ast.columns[0].expr.name).toBe('MAX');
  expect(ast.columns[0].expr.args.expr.column).toBe('price');
  expect(ast.columns[0].expr.args.expr.table).toBe('p');
  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[1].expr.name).toBe('MIN');
  expect(ast.columns[1].expr.args.expr.column).toBe('price');
  expect(ast.columns[1].expr.args.expr.table).toBe('p');

  expect(ast.from[0].as).toBe('c');
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBe('p');
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.where.left.column).toBe('cID');
  expect(ast.where.left.table).toBe('c');
  expect(ast.where.operator).toBe('=');
  expect(ast.where.right.column).toBe('cID');
  expect(ast.where.right.table).toBe('p');

  expect(ast.groupby[0].column).toBe('cID');
  expect(ast.groupby[0].table).toBe('c');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).not.toBeNull();
  expect(ast.groupby).not.toBeNull();
  expect(ast.having).toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBe('c');
  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[1].expr.name).toBe('MAX');
  expect(ast.columns[1].expr.args.expr.column).toBe('price');
  expect(ast.columns[1].expr.args.expr.table).toBe('p');

  expect(ast.from[0].as).toBe('c');
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBe('p');
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.groupby[0].column).toBe('cName');
  expect(ast.groupby[0].table).toBe('c');

  expect(ast.where.left.left.column).toBe('cID');
  expect(ast.where.left.left.table).toBe('c');
  expect(ast.where.left.operator).toBe('IN');
  
  // Subquery happens here
  expect(ast.where.left.right.value[0].type).toBe('select');
  expect(ast.where.left.right.type).toBe('expr_list');
  expect(ast.where.left.right.value[0].columns[0].expr.column).toBe('cID');
  expect(ast.where.left.right.value[0].columns[0].expr.table).toBe('p2');

  expect(ast.where.left.right.value[0].from[0].as).toBe('p2');
  expect(ast.where.left.right.value[0].from[0].table).toBe('purchase');

  expect(ast.where.left.right.value[0].groupby[0].column).toBe('cID');
  expect(ast.where.left.right.value[0].groupby[0].table).toBe('p2');

  expect(ast.where.left.right.value[0].having.left.name).toBe('SUM');
  expect(ast.where.left.right.value[0].having.left.type).toBe('aggr_func');
  expect(ast.where.left.right.value[0].having.left.args.expr.column).toBe('price');
  expect(ast.where.left.right.value[0].having.left.args.expr.table).toBe('p2');
  expect(ast.where.left.right.value[0].having.operator).toBe('>');
  expect(ast.where.left.right.value[0].having.right.value).toBe(20);
  // End of subquery

  expect(ast.where.operator).toBe('AND');
  expect(ast.where.right.left.column).toBe('cID');
  expect(ast.where.right.left.table).toBe('c');
  expect(ast.where.right.operator).toBe('=');
  expect(ast.where.right.right.column).toBe('cID');
  expect(ast.where.right.right.table).toBe('p');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).not.toBeNull();
  expect(ast.groupby).toBeNull();
  expect(ast.having).not.toBeNull();
  expect(ast.orderby).not.toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBe('c');
  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[1].expr.name).toBe('MAX');
  expect(ast.columns[1].expr.args.expr.column).toBe('price');
  expect(ast.columns[1].expr.args.expr.table).toBe('p');

  expect(ast.from[0].as).toBe('c');
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBe('p');
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.where.left.column).toBe('cID');
  expect(ast.where.left.table).toBe('c');
  expect(ast.where.operator).toBe('=');
  expect(ast.where.right.column).toBe('cID');
  expect(ast.where.right.table).toBe('p');

  expect(ast.having.left.type).toBe('aggr_func');
  expect(ast.having.left.name).toBe('MIN');
  expect(ast.having.left.args.expr.column).toBe('price');
  expect(ast.having.left.args.expr.table).toBe('p');
  expect(ast.having.operator).toBe('>');
  expect(ast.having.right.value).toBe(7.5);

  expect(ast.orderby[0].type).toBe('ASC');
  expect(ast.orderby[0].expr.column).toBe('cName');
  expect(ast.orderby[0].expr.table).toBe('c');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).not.toBeNull();
  expect(ast.groupby).not.toBeNull();
  expect(ast.having).not.toBeNull();
  expect(ast.orderby).not.toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBe('c');
  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[1].expr.name).toBe('MAX');
  expect(ast.columns[1].expr.args.expr.column).toBe('price');
  expect(ast.columns[1].expr.args.expr.table).toBe('p');

  expect(ast.from[0].as).toBe('c');
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBe('p');
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.where.left.column).toBe('cID');
  expect(ast.where.left.table).toBe('c');
  expect(ast.where.operator).toBe('=');
  expect(ast.where.right.column).toBe('cID');
  expect(ast.where.right.table).toBe('p');

  expect(ast.groupby[0].column).toBe('cName');
  expect(ast.groupby[0].table).toBe('c');

  expect(ast.having.left.type).toBe('aggr_func');
  expect(ast.having.left.name).toBe('MIN');
  expect(ast.having.left.args.expr.column).toBe('price');
  expect(ast.having.left.args.expr.table).toBe('p');
  expect(ast.having.operator).toBe('>');
  expect(ast.having.right.value).toBe(7.5);

  expect(ast.orderby[0].type).toBe('ASC');
  expect(ast.orderby[0].expr.column).toBe('cName');
  expect(ast.orderby[0].expr.table).toBe('c');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).not.toBeNull();
  expect(ast.groupby).not.toBeNull();
  expect(ast.having).not.toBeNull();
  expect(ast.orderby).not.toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBe('c');
  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[1].expr.name).toBe('MAX');
  expect(ast.columns[1].expr.args.expr.column).toBe('price');
  expect(ast.columns[1].expr.args.expr.table).toBe('p');

  expect(ast.from[0].as).toBe('c');
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBe('p');
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.where.left.column).toBe('cID');
  expect(ast.where.left.table).toBe('c');
  expect(ast.where.operator).toBe('=');
  expect(ast.where.right.column).toBe('cID');
  expect(ast.where.right.table).toBe('p');

  expect(ast.groupby[0].column).toBe('cName');
  expect(ast.groupby[0].table).toBe('c');

  expect(ast.having.left.left.type).toBe('aggr_func');
  expect(ast.having.left.left.name).toBe('COUNT');
  expect(ast.having.left.left.args.expr.column).toBe('cID');
  expect(ast.having.left.left.args.expr.table).toBe('c');
  expect(ast.having.left.operator).toBe('>');
  expect(ast.having.left.right.value).toBe(5);
  expect(ast.having.operator).toBe('AND');
  expect(ast.having.right.left.type).toBe('aggr_func');
  expect(ast.having.right.left.name).toBe('MIN');
  expect(ast.having.right.left.args.expr.column).toBe('price');
  expect(ast.having.right.left.args.expr.table).toBe('p');
  expect(ast.having.right.operator).toBe('>');
  expect(ast.having.right.right.value).toBe(7.5);

  expect(ast.orderby[0].type).toBe('ASC');
  expect(ast.orderby[0].expr.column).toBe('cName');
  expect(ast.orderby[0].expr.table).toBe('c');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).not.toBeNull();
  expect(ast.groupby).not.toBeNull();
  expect(ast.having).not.toBeNull();
  expect(ast.orderby).not.toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBe('c');
  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[1].expr.name).toBe('MAX');
  expect(ast.columns[1].expr.args.expr.column).toBe('price');
  expect(ast.columns[1].expr.args.expr.table).toBe('p');

  expect(ast.from[0].as).toBe('c');
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBe('p');
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.where.left.column).toBe('cID');
  expect(ast.where.left.table).toBe('c');
  expect(ast.where.operator).toBe('=');
  expect(ast.where.right.column).toBe('cID');
  expect(ast.where.right.table).toBe('p');

  expect(ast.groupby[0].column).toBe('cName');
  expect(ast.groupby[0].table).toBe('c');

  expect(ast.having.left.left.type).toBe('aggr_func');
  expect(ast.having.left.left.name).toBe('COUNT');
  expect(ast.having.left.left.args.expr.column).toBe('cID');
  expect(ast.having.left.left.args.expr.table).toBe('c');
  expect(ast.having.left.operator).toBe('>');
  expect(ast.having.left.right.value).toBe(5);
  expect(ast.having.operator).toBe('AND');
  expect(ast.having.right.left.type).toBe('aggr_func');
  expect(ast.having.right.left.name).toBe('MIN');
  expect(ast.having.right.left.args.expr.column).toBe('price');
  expect(ast.having.right.left.args.expr.table).toBe('p');
  expect(ast.having.right.operator).toBe('>');
  expect(ast.having.right.right.value).toBe(7.5);

  expect(ast.orderby[0].type).toBe('ASC');
  expect(ast.orderby[0].expr.column).toBe('cName');
  expect(ast.orderby[0].expr.table).toBe('c');
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

  // First check if everything exists as expected.
  expect(ast.type).toBe('select');
  expect(ast.columns).not.toBeNull();
  expect(ast.from).not.toBeNull();
  expect(ast.where).not.toBeNull();
  expect(ast.groupby).not.toBeNull();
  expect(ast.having).toBeNull();
  expect(ast.orderby).not.toBeNull();

  // Then check contents.
  expect(ast.columns[0].expr.column).toBe('cName');
  expect(ast.columns[0].expr.table).toBe('c');
  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[1].expr.name).toBe('MAX');
  expect(ast.columns[1].expr.args.expr.column).toBe('price');
  expect(ast.columns[1].expr.args.expr.table).toBe('p');

  expect(ast.from[0].as).toBe('c');
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBe('p');
  expect(ast.from[1].table).toBe('purchase');

  expect(ast.where.left.left.column).toBe('cID');
  expect(ast.where.left.left.table).toBe('c');
  expect(ast.where.left.operator).toBe('IN');

  // Subquery happens here
  expect(ast.where.left.right.value[0].type).toBe('select');
  expect(ast.where.left.right.type).toBe('expr_list');
  expect(ast.where.left.right.value[0].columns[0].expr.column).toBe('cID');
  expect(ast.where.left.right.value[0].columns[0].expr.table).toBe('p2');

  expect(ast.where.left.right.value[0].from[0].as).toBe('p2');
  expect(ast.where.left.right.value[0].from[0].table).toBe('purchase');

  expect(ast.where.left.right.value[0].where.left.column).toBe('cID');
  expect(ast.where.left.right.value[0].where.left.table).toBe('p2');
  expect(ast.where.left.right.value[0].where.operator).toBe('LIKE');
  expect(ast.where.left.right.value[0].where.right.value).toBe('%a%');

  expect(ast.where.left.right.value[0].groupby[0].column).toBe('cID');
  expect(ast.where.left.right.value[0].groupby[0].table).toBe('p2');

  expect(ast.where.left.right.value[0].having.left.left.name).toBe('SUM');
  expect(ast.where.left.right.value[0].having.left.left.type).toBe('aggr_func');
  expect(ast.where.left.right.value[0].having.left.left.args.expr.column).toBe('price');
  expect(ast.where.left.right.value[0].having.left.left.args.expr.table).toBe('p2');
  expect(ast.where.left.right.value[0].having.left.operator).toBe('>');
  expect(ast.where.left.right.value[0].having.left.right.value).toBe(20);
  
  expect(ast.where.left.right.value[0].having.operator).toBe('AND');

  expect(ast.where.left.right.value[0].having.right.left.name).toBe('COUNT');
  expect(ast.where.left.right.value[0].having.right.left.type).toBe('aggr_func');
  expect(ast.where.left.right.value[0].having.right.left.args.expr.column).toBe('cID');
  expect(ast.where.left.right.value[0].having.right.left.args.expr.table).toBe('p2');
  expect(ast.where.left.right.value[0].having.right.operator).toBe('<');
  expect(ast.where.left.right.value[0].having.right.right.value).toBe(5);
  // End of subquery

  expect(ast.where.operator).toBe('AND');
  expect(ast.where.right.left.column).toBe('cID');
  expect(ast.where.right.left.table).toBe('c');
  expect(ast.where.right.operator).toBe('=');
  expect(ast.where.right.right.column).toBe('cID');
  expect(ast.where.right.right.table).toBe('p');

  expect(ast.groupby[0].column).toBe('cName');
  expect(ast.groupby[0].table).toBe('c');

  expect(ast.orderby[0].type).toBe('ASC');
  expect(ast.orderby[0].expr.column).toBe('cName');
  expect(ast.orderby[0].expr.table).toBe('c');
});