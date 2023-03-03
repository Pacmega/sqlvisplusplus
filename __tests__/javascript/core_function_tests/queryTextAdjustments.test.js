const visCode = require('../../../sqlvis/visualize');

test('Normal query', () => {
  var query = `
SELECT this
FROM that
WHERE things;`

  var expectedResult = 'SELECT this FROM that WHERE things';
  expect(visCode.queryTextAdjustments(query)).toBe(expectedResult);
})

console.log('WARN: Tests here assume one backslash to be the right way to escape, '
            + 'but this is not yet fully tested in actual visualizations!');

test('Leave single quotes untouched', () => {
  var query = `
SELECT this
FROM that
WHERE things LIKE '%this is a string%';`

  var expectedResult = 'SELECT this FROM that WHERE things LIKE \'%this is a string%\''
  expect(visCode.queryTextAdjustments(query)).toBe(expectedResult);
})


test('Leave double quotes untouched', () => {
  var query = `
SELECT "long column with spaces"
FROM "multiword table name" AS ezname;`

  var expectedResult = 'SELECT \"long column with spaces\" FROM \"multiword table name\" AS ezname';
  expect(visCode.queryTextAdjustments(query)).toBe(expectedResult);
})


test('Leave backticks untouched', () => {
  var query = 'SELECT `this query uses backticks` '
              + 'FROM `this table name has spaces`;'

  var expectedResult = 'SELECT \`this query uses backticks\` FROM \`this table name has spaces\`';
  expect(visCode.queryTextAdjustments(query)).toBe(expectedResult);
})

test('Text case left unchanged', () => {
  var query = `
sElEcT cOlUmN
from sometable
WHERE SOMETHING;`

  var expectedResult = 'sElEcT cOlUmN from sometable WHERE SOMETHING';
  expect(visCode.queryTextAdjustments(query)).toBe(expectedResult);
})

test('Remove (extra) semicolons', () => {
  var query = `
SELECT; this;
FROM; that;
WHERE; things;`

  var expectedResult = 'SELECT this FROM that WHERE things';
  expect(visCode.queryTextAdjustments(query)).toBe(expectedResult);
})


test('No input given', () => {
  var expectedError = 'Input was not a query in text form (i.e. string).';
  expect(() => visCode.queryTextAdjustments()).toThrow(expectedError);
});


test('Empty string left unchanged', () => {
  expect(visCode.queryTextAdjustments('')).toBe('');
});


test('Weirdly formatted string', () => {
  var weirdString = `      one

five
blurb
      end    

`;

  var expectedResult = 'one  five blurb       end';
  expect(visCode.queryTextAdjustments(weirdString)).toBe(expectedResult);
});
