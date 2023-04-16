// This likely does some weird things and/or just breaks.

// to run: cls & npm test "__tests__/javascript/graphBuilding/experimentalTests.test.js"

const visCode = require('../../../sqlvis/visualize');

const standardInputs = {
  'element': 'This is supposed to be a D3 element, but seemingly not actively used.',
  'aliases': {},
  'level': 0,
  'parent': -1
}

// Also used as general example for other schemas
const shopSchema = {'customer': ['cID', 'cName', 'street', 'city'],
                    'store': ['sID', 'sName', 'street', 'city'],
                    'product': ['pID', 'pName', 'suffix'],
                    'purchase': ['tID', 'cID', 'sID', 'pID', 'date', 'quantity', 'price']}


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
  visCode.incorporateParsingErrors(ast, parseResults.foundIssues,
                                   parseResults.levelTreeStructure);

  visCode.referenceChecks(standardInputs.element, ast, standardInputs.aliases,
                             shopSchema, standardInputs.level, standardInputs.parent);
  // console.log("Augmented AST: ", ast);
  // visCode.analyzeReferences(standardInputs.element, ast, standardInputs.aliases,
  //                           shopSchema, standardInputs.level, standardInputs.parent);
  // console.log("AST with errors: ", ast);

  let [nodes, links] = visCode.generateGraphTopLevel(standardInputs.element,
                                                     ast,
                                                     standardInputs.aliases,
                                                     shopSchema,
                                                     standardInputs.level,
                                                     standardInputs.parent);

  console.log("Generated nodes: ", nodes);
  console.log("Generated links: ", links);

  expect(nodes).toBe('intentional crash');
});


test('scratchpad copy paste', () => {
  query = `
SELECT random_thing
FROM store
WHERE store.price = product.street
`

  let clean_query = visCode.queryTextAdjustments(query);

  let parseResults = visCode.parseQuery(clean_query);
  let ast = parseResults.ast;

  visCode.referenceChecks(standardInputs.element, ast, standardInputs.aliases,
                             shopSchema, standardInputs.level, standardInputs.parent);

  let [nodes, links] = visCode.generateGraphTopLevel(standardInputs.element,
                                                     ast,
                                                     standardInputs.aliases,
                                                     shopSchema,
                                                     standardInputs.level,
                                                     standardInputs.parent);

  console.log("Generated nodes: ", nodes);
  console.log("Generated links: ", links);

  expect(nodes).toBe('intentional crash');
});
