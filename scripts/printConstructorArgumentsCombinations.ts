import { evalConstructorArgumentsCombinations } from '../tests/lib/evalConstructorArgumentsCombinations';

console.log(
  evalConstructorArgumentsCombinations({
    'number': 123,
    'string': 'mock_str',
    'object': {},
    'else': [],
  }).tableString,
);
