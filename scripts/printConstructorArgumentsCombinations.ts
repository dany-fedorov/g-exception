import { evalConstructorArgumentsCombinations } from '../tests/lib/evalConstructorArgumentsCombinations';

console.log(
  evalConstructorArgumentsCombinations({
    'unknown': {},
    '!number': {},
    '!number & !string': {},
  }),
);
