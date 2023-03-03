const visCode = require('../../../sqlvis/visualize');

test('Subset of top level, no subquery', () => {
  let query = `
SELECT something
FROM somewhere
WHERE otherthing > 5;
`;

  // Arbitrary index
  let indexForSubset = 3;
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);

  expect(subset).toBe(query);
});


test('Subset of top level, subquery present', () => {
  let query = `
SELECT something
FROM aTable AS alias
WHERE something IN (SELECT testvar
                    FROM other_table
                    WHERE testvar > 15);
`;

  // Arbitrary index
  let indexForSubset = 3;
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);

  expect(subset).toBe(query);
});


test('Subset within subquery, but called in agg_func', () => {
  let query = `
SELECT something
FROM aTable AS alias
WHERE something IN (SELECT SUM(testvar)
                    FROM other_table
                    WHERE testvar > 15);
`;

  // This index: the t of testvar
  let indexForSubset = query.indexOf('testvar');
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);
  let expected_output = 'testvar'

  expect(subset).toBe(expected_output);
});


test('Subset within normal subquery, search from opening bracket', () => {
    let query = `
SELECT something
FROM aTable AS alias
WHERE something IN (SELECT SUM(testvar)
                    FROM other_table
                    WHERE testvar > 15);
`;

  // This index: the first opening bracket
  let indexForSubset = 58;
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);

  // The spaces look messy here, but these spaces should be kept.
  let expected_output = `SELECT SUM(testvar)
                    FROM other_table
                    WHERE testvar > 15`;

  expect(subset).toBe(expected_output);
});


test('Subset within normal subquery, search from within query', () => {
  let query = `
SELECT something
FROM aTable AS alias
WHERE something IN (SELECT SUM(testvar)
                    FROM other_table
                    WHERE testvar > 15);
`;

  // This index: the first E of SELECT within the subquery
  let indexForSubset = 60;
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);

  // The spaces look messy here, but these spaces should be kept.
  let expected_output = `SELECT SUM(testvar)
                    FROM other_table
                    WHERE testvar > 15`;

  expect(subset).toBe(expected_output);
});


test('Subset within normal subquery, search from closing bracket', () => {
  let query = `
SELECT something
FROM aTable AS alias
WHERE something IN (SELECT SUM(testvar)
                    FROM other_table
                    WHERE testvar > 15);
`;

  // This index: the closing ) of the subquery
  let indexForSubset = 154;
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);

  // The spaces look messy here, but these spaces should be kept.
  let expected_output = `SELECT SUM(testvar)
                    FROM other_table
                    WHERE testvar > 15`;

  expect(subset).toBe(expected_output);
});


test('Subset on top level, subquery present, with agg_funcs everywhere', () => {
  let query = `
SELECT COUNT(something)
FROM aTable AS alias
WHERE something IN (SELECT SUM(testvar)
                    FROM other_table
                    WHERE testvar > 15);
`;

  // This index: arbitrary index
  let indexForSubset = 3;
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);

  expect(subset).toBe(query);
});


test('Subset within normal subquery, with agg_funcs everywhere', () => {
  let query = `
SELECT COUNT(something)
FROM aTable AS alias
WHERE something IN (SELECT SUM(testvar)
                    FROM other_table
                    WHERE testvar > 15);
`;

  // This index: the S of SUM (in the subquery)
  let indexForSubset = 73;
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);

  // The spaces look messy here, but these spaces should be kept.
  let expected_output = `SELECT SUM(testvar)
                    FROM other_table
                    WHERE testvar > 15`;

  expect(subset).toBe(expected_output);
});


test('Two same-level subqueries, subset called on top level', () => {
  // Query source: the user study of QueryVis
  // Source URL: https://osf.io/bke5r
  query = `
SELECT A.ArtistId, A.Name
FROM Artist A, Album AL1, Album AL2
WHERE A.ArtistId = AL1.ArtistId
AND A.ArtistId = AL2.ArtistId 
AND AL1.AlbumId <> AL2.AlbumId
AND NOT EXISTS (SELECT * 
                FROM Track T1, Genre G1
                WHERE AL1.AlbumId = T1.AlbumId
                AND T1.GenreId = G1.GenreId
                AND G1.Name = 'Rock'
               )
AND NOT EXISTS (SELECT * 
                FROM Track T2
                WHERE AL2.AlbumId = T2.AlbumId
                AND T2.Milliseconds < 27000
               );
`;

  // This index: arbitrary index
  let indexForSubset = 3;
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);

  expect(subset).toBe(query);
});


test('Two same-level subqueries, subset called on subquery 1', () => {
  // Query source: the user study of QueryVis
  // Source URL: https://osf.io/bke5r
  query = `
SELECT A.ArtistId, A.Name
FROM Artist A, Album AL1, Album AL2
WHERE A.ArtistId = AL1.ArtistId
AND A.ArtistId = AL2.ArtistId 
AND AL1.AlbumId <> AL2.AlbumId
AND NOT EXISTS (SELECT * 
                FROM Track T1, Genre G1
                WHERE AL1.AlbumId = T1.AlbumId
                AND T1.GenreId = G1.GenreId
                AND G1.Name = 'Rock'
               )
AND NOT EXISTS (SELECT * 
                FROM Track T2
                WHERE AL2.AlbumId = T2.AlbumId
                AND T2.Milliseconds < 27000
               );
`;

  // This index: the S of the first SELECT *
  let indexForSubset = query.indexOf('SELECT *');
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);

  // The spaces look messy here, but these spaces should be kept.
  let expected_output = `SELECT * 
                FROM Track T1, Genre G1
                WHERE AL1.AlbumId = T1.AlbumId
                AND T1.GenreId = G1.GenreId
                AND G1.Name = 'Rock'
               `;

  expect(subset).toBe(expected_output);
});


test('Two same-level subqueries, subset called on subquery 2', () => {
  // Query source: the user study of QueryVis
  // Source URL: https://osf.io/bke5r
  query = `
SELECT A.ArtistId, A.Name
FROM Artist A, Album AL1, Album AL2
WHERE A.ArtistId = AL1.ArtistId
AND A.ArtistId = AL2.ArtistId 
AND AL1.AlbumId <> AL2.AlbumId
AND NOT EXISTS (SELECT * 
                FROM Track T1, Genre G1
                WHERE AL1.AlbumId = T1.AlbumId
                AND T1.GenreId = G1.GenreId
                AND G1.Name = 'Rock'
               )
AND NOT EXISTS (SELECT * 
                FROM Track T2
                WHERE AL2.AlbumId = T2.AlbumId
                AND T2.Milliseconds < 27000
               );
`;

  // This index: the * of the last SELECT *
  let indexForSubset = query.lastIndexOf('SELECT *'); 
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);

  // The spaces look messy here, but these spaces should be kept.
  let expected_output = `SELECT * 
                FROM Track T2
                WHERE AL2.AlbumId = T2.AlbumId
                AND T2.Milliseconds < 27000
               `;

  expect(subset).toBe(expected_output);
});


test('Two nested subqueries, subset called on top level', () => {
  // Query source: the user study of QueryVis
  // Source URL: https://osf.io/bke5r
  let query = `
SELECT A.ArtistId, A.Name
FROM Artist A, Album AL
WHERE A.ArtistId = AL.ArtistId
AND NOT EXISTS (SELECT *
                FROM Track T, Genre G
                WHERE AL.AlbumId = T.AlbumId
                AND T.GenreId = G.GenreId
                AND G.Name = 'Jazz'
                AND NOT EXISTS (SELECT *
                                FROM Playlist P, PlaylistTrack PT
                                WHERE P.PlaylistId = PT.PlaylistId
                                AND PT.TrackId = T.TrackId
                               )
               );
`;

  // This index: arbitrary index
  let indexForSubset = 3;
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);

  expect(subset).toBe(query);
});


test('Two nested subqueries, subset called on subquery 1', () => {
  // Query source: the user study of QueryVis
  // Source URL: https://osf.io/bke5r
  let query = `
SELECT A.ArtistId, A.Name
FROM Artist A, Album AL
WHERE A.ArtistId = AL.ArtistId
AND NOT EXISTS (SELECT *
                FROM Track T, Genre G
                WHERE AL.AlbumId = T.AlbumId
                AND T.GenreId = G.GenreId
                AND G.Name = 'Jazz'
                AND NOT EXISTS (SELECT *
                                FROM Playlist P, PlaylistTrack PT
                                WHERE P.PlaylistId = PT.PlaylistId
                                AND PT.TrackId = T.TrackId
                               )
               );
`;

  // This index: the S of the first SELECT *
  let indexForSubset = query.indexOf('SELECT *');
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);

  // The spaces look messy here, but these spaces should be kept.
  let expected_output = `SELECT *
                FROM Track T, Genre G
                WHERE AL.AlbumId = T.AlbumId
                AND T.GenreId = G.GenreId
                AND G.Name = 'Jazz'
                AND NOT EXISTS (SELECT *
                                FROM Playlist P, PlaylistTrack PT
                                WHERE P.PlaylistId = PT.PlaylistId
                                AND PT.TrackId = T.TrackId
                               )
               `;

  expect(subset).toBe(expected_output);
});


test('Two nested subqueries, subset called on subquery 2', () => {
  // Query source: the user study of QueryVis
  // Source URL: https://osf.io/bke5r
  let query = `
SELECT A.ArtistId, A.Name
FROM Artist A, Album AL
WHERE A.ArtistId = AL.ArtistId
AND NOT EXISTS (SELECT *
                FROM Track T, Genre G
                WHERE AL.AlbumId = T.AlbumId
                AND T.GenreId = G.GenreId
                AND G.Name = 'Jazz'
                AND NOT EXISTS (SELECT *
                                FROM Playlist P, PlaylistTrack PT
                                WHERE P.PlaylistId = PT.PlaylistId
                                AND PT.TrackId = T.TrackId
                               )
               );
`;

  // This index: the S of the first SELECT *
  let indexForSubset = query.lastIndexOf('SELECT *');
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);

  // The spaces look messy here, but these spaces should be kept.
  let expected_output = `SELECT *
                                FROM Playlist P, PlaylistTrack PT
                                WHERE P.PlaylistId = PT.PlaylistId
                                AND PT.TrackId = T.TrackId
                               `;

  expect(subset).toBe(expected_output);
});


test('Subset within not properly closed subquery', () => {
  let query = `
SELECT COUNT(something)
FROM aTable AS alias
WHERE something IN (SELECT SUM(testvar)
                    FROM other_table
                    WHERE testvar > 15
`;

  // This index: the S of the subquery's SELECT
  let indexForSubset = query.indexOf('SELECT SUM(testvar)');
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);

  // Expect the error to contain this text.
  let expected_error = 'closing bracket'

  expect(() => {
           visCode.subsetQueryToLevelAtIndex(query, indexForSubset);
         }).toThrow(expected_error);
});


test('Subset on top level, called before not properly closed subquery', () => {
  let query = `
SELECT COUNT(something)
FROM aTable AS alias
WHERE something IN (SELECT SUM(testvar)
                    FROM other_table
                    WHERE testvar > 15
`;

  // This index: arbitrary location
  let indexForSubset = 3;
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);

  // Expect the error to contain this text.
  let expected_error = 'closing bracket'

  expect(() => {
           visCode.subsetQueryToLevelAtIndex(query, indexForSubset);
         }).toThrow(expected_error);
});


test('Subset on top level, called after not properly closed subquery', () => {
  let query = `
SELECT COUNT(something)
FROM (SELECT nothing
      FROM nowhere
      WHERE nothing < 0 AS alias
WHERE something IN (SELECT SUM(testvar)
                    FROM other_table
                    WHERE testvar > 15);
`;

  // This index: the I of IN
  let indexForSubset = 114;
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);

  // Expect the error to contain this text.
  let expected_error = 'closing bracket'

  expect(() => {
           visCode.subsetQueryToLevelAtIndex(query, indexForSubset);
         }).toThrow(expected_error);
});


test('Subset on top level, with not properly opened aggr_func in top level', () => {
  let query = `
SELECT COUNT something)
FROM (SELECT nothing
      FROM nowhere
      WHERE nothing < 0 AS alias)
WHERE something IN (SELECT SUM(testvar)
                    FROM other_table
                    WHERE testvar > 15);
`;

  // This index: the I of IN
  let indexForSubset = 114;
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);

  // Expect the error to contain this text.
  let expected_error = 'closing bracket'

  expect(() => {
           visCode.subsetQueryToLevelAtIndex(query, indexForSubset);
         }).toThrow(expected_error);
});

test('Subset on top level, with not properly closed aggr_func in top level', () => {
  let query = `
SELECT COUNT(something 
FROM (SELECT nothing
      FROM nowhere
      WHERE nothing < 0 AS alias)
WHERE something IN (SELECT SUM(testvar)
                    FROM other_table
                    WHERE testvar > 15);
`;

  // This index: the I of IN (there is a space after 'COUNT(something' )
  let indexForSubset = 114;
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);

  // Expect the error to contain this text.
  let expected_error = 'closing bracket'

  expect(() => {
           visCode.subsetQueryToLevelAtIndex(query, indexForSubset);
         }).toThrow(expected_error);
});


test('Subset on top level, with not properly closed aggr_func in subquery', () => {
  let query = `
SELECT COUNT(something)
FROM (SELECT nothing
      FROM nowhere
      WHERE nothing < 0 AS alias)
WHERE something IN (SELECT SUM(testvar
                    FROM other_table
                    WHERE testvar > 15);
`;

  // This index: the I of IN
  let indexForSubset = 114;
  let subset = visCode.subsetQueryToLevelAtIndex(query, indexForSubset);

  // Expect the error to contain this text.
  let expected_error = 'closing bracket'

  expect(() => {
           visCode.subsetQueryToLevelAtIndex(query, indexForSubset);
         }).toThrow(expected_error);
});
