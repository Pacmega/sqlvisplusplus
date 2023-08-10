/*
NOTE:
The tests performed here for each query are based on the AST generated
for the 'correct' version of each query, meaning the expected output
with corrections made where required. To see the expected corrected queries
and the ASTs around which these tests were written, look at
expected_results/expected_asts_groupby_error_queries.json.
*/

// to run: cls & npm test "__tests__/javascript/incorporateParsingErrors/incorporateParsingErrors_correct_queries.test.js"

const visCode = require('../../../sqlvis/visualize');

test('Listing 1. A multi-table query with an explicit join condition', () => {
  var query = `
SELECT c.name
FROM customer c, ordered o
WHERE c.customerid = o.customerid;
`;

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // When there were no issues, an empty dictionary is returned so that
  //   no iteration over the "issues" would break.
  expect(parseResults.foundIssues).toStrictEqual({});
});


test('Listing 2. ANSI SQL-92 join in a multi-table query', () => {
  var query = `
SELECT c.name
FROM customer c
JOIN ordered o
ON (c.customerid = o.customerid);
`;

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // When there were no issues, an empty dictionary is returned so that
  //   no iteration over the "issues" would break.
  expect(parseResults.foundIssues).toStrictEqual({});
});


test('Listing 3. A query with equal subqueries', () => {
  var query = `
SELECT p.productid, p.description
FROM product p
WHERE NOT EXISTS
    (SELECT *
    FROM ordered o
    WHERE p.productid = o.productid)
AND EXISTS
    (SELECT *
    FROM supplies s
    WHERE p.productid = s.productid);
`;

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // When there were no issues, an empty dictionary is returned so that
  //   no iteration over the "issues" would break.
  expect(parseResults.foundIssues).toStrictEqual({});
});


test('Listing 4. A query with nested subqueries', () => {
  var query = `
SELECT p.productid, p.description
FROM product p
WHERE NOT EXISTS
    (SELECT *
    FROM ordered o
    WHERE p.productid = o.productid
    AND EXISTS
        (SELECT *
         FROM supplies s
         WHERE p.productid = s.productid)
    );
`;

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // When there were no issues, an empty dictionary is returned so that
  //   no iteration over the "issues" would break.
  expect(parseResults.foundIssues).toStrictEqual({});
});


test('Listing 5. A typical, simple self-join', () => {
  var query = `
SELECT c1.name
FROM customer c1
JOIN customer c2
ON (c1.address = c2.address)
WHERE c1.customerid <> 47
AND c2.customerid = 47;
`;

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // When there were no issues, an empty dictionary is returned so that
  //   no iteration over the "issues" would break.
  expect(parseResults.foundIssues).toStrictEqual({});
});


test('Listing 6. A self-join with an uncorrelated subquery formed by '+
     'evaluating an aggregate function against a column value', () => {
  query = `
SELECT productid, onhand
FROM product
WHERE description = 'used'
AND onhand =
    (SELECT MAX(onhand)
    FROM product
    WHERE description = 'used');
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // When there were no issues, an empty dictionary is returned so that
  //   no iteration over the "issues" would break.
  expect(parseResults.foundIssues).toStrictEqual({});
});


test('Listing 7. An example of a query with multiple source tables', () => {
  query = `
SELECT o.productid, c.name, c.address
FROM ordered o
JOIN customer c
ON (o.customerid = c.customerid);
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // When there were no issues, an empty dictionary is returned so that
  //   no iteration over the "issues" would break.
  expect(parseResults.foundIssues).toStrictEqual({});
});


test('Listing 8. A query with an aggregate function and grouping', () => {
  query = `
SELECT productid, SUM(quantity)
FROM ordered
GROUP BY productid;
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // When there were no issues, an empty dictionary is returned so that
  //   no iteration over the "issues" would break.
  expect(parseResults.foundIssues).toStrictEqual({});

});


test('Listing 9. A query with aggregate functions, parameter distinct, ' +
     'multiple source tables and grouping', () => {
  query = `
SELECT p.productid
       , SUM(o.quantity)
       , COUNT(DISTINCT o.customerid)
FROM product p, ordered o
WHERE p.productid = o.productid
GROUP BY p.productid;
`

  let clean_query = visCode.queryTextAdjustments(query);
  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  // When there were no issues, an empty dictionary is returned so that
  //   no iteration over the "issues" would break.
  expect(parseResults.foundIssues).toStrictEqual({});
});
