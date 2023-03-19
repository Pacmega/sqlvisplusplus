/* Yes, this is basically a glorified bin stored on GitHub servers. */

// UNUSED!
function findThisLevelEnd(query) {
  // TODO: currently unused function, also working on its calling func.

  // Receives: a subset of a query, cut after at least one opening bracket.
  // Returns: the index within this subset where the closing bracket is found.

  // TODO: untested function! Need to test this.
  const bracketOpenedAt = query.indexOf('(');
  let bracketClosedAt = query.indexOf(')');

  if (bracketClosedAt === -1) {
    // There is no closing bracket, this level does not appear to end.
    return -1;
  }
  
  if (bracketOpenedAt !== -1 && bracketOpenedAt < bracketClosedAt) {
    // At least one extra set of brackets is opened and closed within
    //   this level. Our closing bracket must occur after that.
    let endOfBracketSet = findThisLevelEnd(query.slice(bracketOpenedAt + 1));
    if (endOfBracketSet === -1) {
      // The deeper layer of brackets is never closed. That means this level 
      //   cannot possibly be closed either, and this query has a problem.
      return -1;
    }
    // We know where that set of brackets ends, now continue looking from
    //   past that end to find the closing bracket.
    bracketClosedAt = findThisLevelEnd(query.slice(endOfBracketSet + 1));
  }
  
  // If/when this point is reached (at any level of recursion), either a
  //   closing bracket was found without an opening bracket in front of it,
  //   which means this closing bracket ends this query level, or no closing
  //   bracket was found for this level at all which means we found a problem.
  return bracketClosedAt;
}

// UNUSED!
function subsetQueryToLevelAtIndex(query, index) {
  // Find the level of this index
  const queryUpToIndex = query.slice(0, index);
  const openingBracketsBefore = allIndicesOf(queryUpToIndex, '(')
  const closingBracketsBefore = allIndicesOf(queryUpToIndex, ')')

  const queryFromIndex = query.slice(index);
  const openingBracketsAfter = allIndicesOf(queryFromIndex, '(')
  const closingBracketsAfter = allIndicesOf(queryFromIndex, ')')

  // If the start of queryFromIndex is not the opening bracket we are trying
  //   to find the closing bracket for, behavior is slightly different.
  const charAtIndex = query[index];
  const levelStartsAtIndex = (charAtIndex === '(' ? true : false);

  const currentLevel = openingBracketsBefore.length - closingBracketsBefore.length;

  // Context checking for query subsetting
  if (currentLevel === 0 && !levelStartsAtIndex) {
    // We are at the top level here. There is no subsetting to perform.
    return query;
  }

  let locationOfOpeningBracket;
  // Find the start of this level, so that we can slice from there.
  if (levelStartsAtIndex) {
    locationOfOpeningBracket = index;
  } else {
    locationOfOpeningBracket = queryUpToIndex.lastIndexOf('(');
  }
  
  // Find the end of this level, so that we can slice until there.
  const bracketEndingLevelIndex = closingBracketsAfter.length - openingBracketsAfter.length
                                  - Number(levelStartsAtIndex);
  
  let locationOfClosingBracket = closingBracketsAfter[bracketEndingLevelIndex];
  if (typeof locationOfClosingBracket === 'undefined') {
    throw Error('No closing bracket found for query level subsetting of query for level at '
                + 'char index ' + index + '! Query: \n' + query);
  }

  // Since this location is based on a string slice, add the number of chars
  //   that were before the slice to find the index in the original string.
  locationOfClosingBracket += index;
  
  // const endOfThisLevel = locationOfOpeningBracket + findLevelEnd(query.slice(index));

  // Slice is inclusive at the start, +1 to avoid bringing the opening bracket.
  // It is exclusive at the end, so the closing bracket is left out automatically.
  const subquery = query.slice(locationOfOpeningBracket+1, locationOfClosingBracket);
  return subquery
}



