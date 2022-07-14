import { GException } from '../../src/GException';
import { evalConstructorArgumentsCombinations } from '../lib/evalConstructorArgumentsCombinations';

beforeAll(() => {
  GException.mergeConfig({
    logProblemsToStdout: false,
  });
});

afterAll(() => {
  GException.mergeConfig({
    logProblemsToStdout: true,
  });
});

describe('GException constructor: generated tables', () => {
  test('Table 1', () => {
    const { tableString } = evalConstructorArgumentsCombinations({
      'number': 123,
      'string': 'mock_str',
      'object': {},
      'else': [],
    });
    expect(tableString).toMatchSnapshot('object:{},else:[]');
  });

  test('Table 2', () => {
    const { tableString } = evalConstructorArgumentsCombinations({
      'number': 123,
      'string': 'mock_str',
      'object': new Date('2022-07-13T11:12:25.741Z'),
      'else': true,
    });
    expect(tableString).toMatchSnapshot('object:Date,else:true');
  });

  test('Table 3', () => {
    const { tableString } = evalConstructorArgumentsCombinations({
      'number': 123,
      'string': 'mock_str',
      'object': new Error(),
      'else': null,
    });
    expect(tableString).toMatchSnapshot('object:Error,else:null');
  });

  test('Table 4', () => {
    const { tableString } = evalConstructorArgumentsCombinations({
      'number': 123,
      'string': 'mock_str',
      'object': new GException('test'),
      'else': undefined,
    });
    expect(tableString).toMatchSnapshot('object:GExceptionV0,else:undefined');
  });
});
