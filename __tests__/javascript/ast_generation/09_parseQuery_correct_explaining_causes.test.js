console.log('WARN: This test setup assumes that the part of visualize.js that ' +
            'must be uncommented to run locally is indeed uncommented. If ' +
            'not, you will receive "x not defined" style many error messages, ' +
            'likely all similar. Ctrl-f for "UNCOMMENT FROM HERE" in ' +
            'visualize.js to find the part that must be uncommented.');

/* Note to self: order of AST entries:
- as
- column
- table
- (type)
*/

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

  // Check different expected AST attributes
  expect(ast.type).toBe('select');
  expect(ast.columns[0].expr.column).toBe('name');
  expect(ast.columns[0].expr.table).toBe('c');
  
  expect(ast.from[0].as).toBe('c');
  expect(ast.from[0].table).toBe('customer');
  expect(ast.from[1].as).toBe('o');
  expect(ast.from[1].table).toBe('ordered');

  expect(ast.where.left.column).toBe('customerid');
  expect(ast.where.left.table).toBe('c');
  expect(ast.where.operator).toBe('=');
  expect(ast.where.right.column).toBe('customerid');
  expect(ast.where.right.table).toBe('o');
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

  // Check different expected AST attributes
  expect(ast.type).toBe('select');
  expect(ast.columns[0].expr.column).toBe('name');
  expect(ast.columns[0].expr.table).toBe('c');
  
  expect(ast.from[0].as).toBe('c');
  expect(ast.from[0].table).toBe('customer');

  // Expect there to be a JOIN, then check contents
  expect(ast.from[1].join).toBeDefined();
  expect(ast.from[1].as).toBe('o');
  expect(ast.from[1].table).toBe('ordered');
  expect(ast.from[1].join).toBe('INNER JOIN');
  expect(ast.from[1].on.left.column).toBe('customerid');
  expect(ast.from[1].on.left.table).toBe('c');
  expect(ast.from[1].on.operator).toBe('=');
  expect(ast.from[1].on.right.column).toBe('customerid');
  expect(ast.from[1].on.right.table).toBe('o');
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

  // Check different expected AST attributes
  expect(ast.type).toBe('select');
  expect(ast.columns[0].expr.column).toBe('productid');
  expect(ast.columns[0].expr.table).toBe('p');
  expect(ast.columns[1].expr.column).toBe('description');
  expect(ast.columns[1].expr.table).toBe('p');
  
  expect(ast.from[0].as).toBe('p');
  expect(ast.from[0].table).toBe('product');

  // First, the NOT EXISTS subquery.
  expect(ast.where.left.expr).toBeDefined();
  expect(ast.where.left.operator).toBe('NOT EXISTS');
  expect(ast.where.left.expr.type).toBe('select');
  expect(ast.where.left.expr.columns).toBe('*');

  expect(ast.where.left.expr.from[0].as).toBe('o');
  expect(ast.where.left.expr.from[0].table).toBe('ordered');
  expect(ast.where.left.expr.where.left.column).toBe('productid');
  expect(ast.where.left.expr.where.left.table).toBe('p');
  expect(ast.where.left.expr.where.operator).toBe('=');
  expect(ast.where.left.expr.where.right.column).toBe('productid');
  expect(ast.where.left.expr.where.right.table).toBe('o');
  
  // Second, the EXISTS subquery.
  expect(ast.where.operator).toBe('AND');
  expect(ast.where.right.expr).toBeDefined();
  expect(ast.where.right.operator).toBe('EXISTS');
  expect(ast.where.right.expr.type).toBe('select');
  expect(ast.where.right.expr.columns).toBe('*');

  expect(ast.where.right.expr.from[0].as).toBe('s');
  expect(ast.where.right.expr.from[0].table).toBe('supplies');
  expect(ast.where.right.expr.where.left.column).toBe('productid');
  expect(ast.where.right.expr.where.left.table).toBe('p');
  expect(ast.where.right.expr.where.operator).toBe('=');
  expect(ast.where.right.expr.where.right.column).toBe('productid');
  expect(ast.where.right.expr.where.right.table).toBe('s');
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

  expect(ast.type).toBe('select');
  expect(ast.columns[0].expr.column).toBe('productid');
  expect(ast.columns[0].expr.table).toBe('p');
  expect(ast.columns[1].expr.column).toBe('description');
  expect(ast.columns[1].expr.table).toBe('p');
  
  expect(ast.from[0].as).toBe('p');
  expect(ast.from[0].table).toBe('product');

  // Subquery level 1
  expect(ast.where.expr).toBeDefined();
  expect(ast.where.operator).toBe('NOT EXISTS');
  expect(ast.where.expr.type).toBe('select');
  expect(ast.where.expr.columns).toBe('*');

  expect(ast.where.expr.from[0].as).toBe('o');
  expect(ast.where.expr.from[0].table).toBe('ordered');
  expect(ast.where.expr.where.left.left.column).toBe('productid');
  expect(ast.where.expr.where.left.left.table).toBe('p');
  expect(ast.where.expr.where.left.operator).toBe('=');
  expect(ast.where.expr.where.left.right.column).toBe('productid');
  expect(ast.where.expr.where.left.right.table).toBe('o');

  // Subquery level 2
  expect(ast.where.expr.where.operator).toBe('AND');
  expect(ast.where.expr.where.right.expr).toBeDefined();
  expect(ast.where.expr.where.right.operator).toBe('EXISTS');
  expect(ast.where.expr.where.right.expr.type).toBe('select');
  expect(ast.where.expr.where.right.expr.columns).toBe('*');

  expect(ast.where.expr.where.right.expr.from[0].as).toBe('s');
  expect(ast.where.expr.where.right.expr.from[0].table).toBe('supplies');
  expect(ast.where.expr.where.right.expr.where.left.column).toBe('productid');
  expect(ast.where.expr.where.right.expr.where.left.table).toBe('p');
  expect(ast.where.expr.where.right.expr.where.operator).toBe('=');
  expect(ast.where.expr.where.right.expr.where.right.column).toBe('productid');
  expect(ast.where.expr.where.right.expr.where.right.table).toBe('s');
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

  expect(ast.type).toBe('select');
  expect(ast.columns[0].expr.column).toBe('name');
  expect(ast.columns[0].expr.table).toBe('c1');

  expect(ast.from[0].as).toBe('c1');
  expect(ast.from[0].table).toBe('customer');

  expect(ast.from[1].join).toBeDefined();
  expect(ast.from[1].as).toBe('c2');
  expect(ast.from[1].table).toBe('customer');
  expect(ast.from[1].join).toBe('INNER JOIN');
  expect(ast.from[1].on.left.column).toBe('address');
  expect(ast.from[1].on.left.table).toBe('c1');
  expect(ast.from[1].on.operator).toBe('=');
  expect(ast.from[1].on.right.column).toBe('address');
  expect(ast.from[1].on.right.table).toBe('c2');

  expect(ast.where.left.left.column).toBe('customerid');
  expect(ast.where.left.left.table).toBe('c1');
  expect(ast.where.left.operator).toBe('<>');
  expect(ast.where.left.right.value).toBe(47);

  expect(ast.where.right.left.column).toBe('customerid');
  expect(ast.where.right.left.table).toBe('c2');
  expect(ast.where.right.operator).toBe('=');
  expect(ast.where.right.right.value).toBe(47);
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

  expect(ast.type).toBe('select');
  expect(ast.columns[0].expr.column).toBe('productid');
  expect(ast.columns[1].expr.column).toBe('onhand');

  expect(ast.from[0].table).toBe('product');

  expect(ast.where.left.left.column).toBe('description');
  expect(ast.where.left.operator).toBe('=');
  expect(ast.where.left.right.value).toBe('used');

  expect(ast.where.operator).toBe('AND');

  expect(ast.where.right.left.column).toBe('onhand');
  expect(ast.where.right.operator).toBe('=');

  // This is a subquery
  expect(ast.where.right.right).toBeDefined();
  expect(ast.where.right.right.type).toBe('select');

  expect(ast.where.right.right.columns[0].expr.name).toBe('MAX');
  expect(ast.where.right.right.columns[0].expr.type).toBe('aggr_func');
  expect(ast.where.right.right.columns[0].expr.args.expr.column).toBe('onhand');

  expect(ast.where.right.right.from[0].table).toBe('product');

  expect(ast.where.right.right.where.left.column).toBe('description');
  expect(ast.where.right.right.where.operator).toBe('=');
  expect(ast.where.right.right.where.right.value).toBe('used');
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

  expect(ast.type).toBe('select');

  expect(ast.columns[0].expr.column).toBe('productid');
  expect(ast.columns[0].expr.table).toBe('o');
  expect(ast.columns[1].expr.column).toBe('name');
  expect(ast.columns[1].expr.table).toBe('c');
  expect(ast.columns[2].expr.column).toBe('address');
  expect(ast.columns[2].expr.table).toBe('c');

  expect(ast.from[0].as).toBe('o');
  expect(ast.from[0].table).toBe('ordered');
  expect(ast.from[1].as).toBe('c');
  expect(ast.from[1].table).toBe('customer');
  expect(ast.from[1].join).toBe('INNER JOIN');
  expect(ast.from[1].on.left.column).toBe('customerid');
  expect(ast.from[1].on.left.table).toBe('o');
  expect(ast.from[1].on.operator).toBe('=');
  expect(ast.from[1].on.right.column).toBe('customerid');
  expect(ast.from[1].on.right.table).toBe('c');
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

  expect(ast.type).toBe('select');

  expect(ast.columns[0].expr.column).toBe('productid');
  expect(ast.columns[1].expr.name).toBe('SUM');
  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[1].expr.args.expr.column).toBe('quantity');

  expect(ast.from[0].table).toBe('ordered');

  expect(ast.groupby[0].column).toBe('productid');

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

  expect(ast.type).toBe('select');

  expect(ast.columns[0].expr.column).toBe('productid');
  expect(ast.columns[0].expr.table).toBe('p');
  expect(ast.columns[1].expr.name).toBe('SUM');
  expect(ast.columns[1].expr.type).toBe('aggr_func');
  expect(ast.columns[2].expr.name).toBe('COUNT');
  expect(ast.columns[2].expr.type).toBe('aggr_func');
  expect(ast.columns[2].expr.args.distinct).toBe('DISTINCT');
  expect(ast.columns[2].expr.args.expr.column).toBe('customerid');
  expect(ast.columns[2].expr.args.expr.table).toBe('o');

  expect(ast.from[0].as).toBe('p');
  expect(ast.from[0].table).toBe('product');
  expect(ast.from[1].as).toBe('o');
  expect(ast.from[1].table).toBe('ordered');

  expect(ast.where.left.column).toBe('productid');
  expect(ast.where.left.table).toBe('p');
  expect(ast.where.operator).toBe('=');
  expect(ast.where.right.column).toBe('productid');
  expect(ast.where.right.table).toBe('o');

  expect(ast.groupby[0].column).toBe('productid');
  expect(ast.groupby[0].table).toBe('p');
});
