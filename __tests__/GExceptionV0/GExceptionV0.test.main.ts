import { GExceptionV0 } from '../../src/GExceptionV0';
import {
  MOCK_ERR_CAUSE_ERR,
  MOCK_ERR_CAUSE_STR,
  MOCK_ERR_CODE,
  MOCK_ERR_CODE_CTR_ARG,
  MOCK_ERR_MSG,
  MOCK_ERR_NUM_CODE,
} from '../lib/mock-values';

beforeAll(() => {
  GExceptionV0.mergeConfig({
    logConstructorProblems: false,
  });
});

afterAll(() => {
  GExceptionV0.mergeConfig({
    logConstructorProblems: true,
  });
});

describe('GException constructor: valid', function () {
  test('[string]', () => {
    const e = new GExceptionV0(MOCK_ERR_MSG);
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
  });

  test('[string, {ok}]', () => {
    const e = new GExceptionV0(MOCK_ERR_MSG, MOCK_ERR_CODE_CTR_ARG);
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCode()).toBe(MOCK_ERR_CODE);
  });

  test('[string, number]', () => {
    const e = new GExceptionV0(MOCK_ERR_MSG, MOCK_ERR_NUM_CODE);
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getNumCode()).toBe(MOCK_ERR_NUM_CODE);
  });

  test('[string, number, {ok}]', () => {
    const e = new GExceptionV0(
      MOCK_ERR_MSG,
      MOCK_ERR_NUM_CODE,
      MOCK_ERR_CODE_CTR_ARG,
    );
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getNumCode()).toBe(MOCK_ERR_NUM_CODE);
    expect(e.getCode()).toBe(MOCK_ERR_CODE);
  });

  test('[Error, string]', () => {
    const e = new GExceptionV0(MOCK_ERR_CAUSE_ERR, MOCK_ERR_MSG);
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCauses()).toEqual([MOCK_ERR_CAUSE_ERR]);
  });

  test('[Error, string, {ok}]', () => {
    const e = new GExceptionV0(
      MOCK_ERR_CAUSE_ERR,
      MOCK_ERR_MSG,
      MOCK_ERR_CODE_CTR_ARG,
    );
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCauses()).toEqual([MOCK_ERR_CAUSE_ERR]);
    expect(e.getCode()).toBe(MOCK_ERR_CODE);
  });

  test('[string, string]', () => {
    const e = new GExceptionV0(MOCK_ERR_CAUSE_STR, MOCK_ERR_MSG);
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCauses()).toEqual([MOCK_ERR_CAUSE_STR]);
  });

  test('[string, string, {ok}]', () => {
    const e = new GExceptionV0(
      MOCK_ERR_CAUSE_STR,
      MOCK_ERR_MSG,
      MOCK_ERR_CODE_CTR_ARG,
    );
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCauses()).toEqual([MOCK_ERR_CAUSE_STR]);
    expect(e.getCode()).toBe(MOCK_ERR_CODE);
  });

  test('[Error, string, number]', () => {
    const e = new GExceptionV0(
      MOCK_ERR_CAUSE_ERR,
      MOCK_ERR_MSG,
      MOCK_ERR_NUM_CODE,
    );
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCauses()).toEqual([MOCK_ERR_CAUSE_ERR]);
    expect(e.getNumCode()).toBe(MOCK_ERR_NUM_CODE);
  });

  test('[Error, string, number, {ok}]', () => {
    const e = new GExceptionV0(
      MOCK_ERR_CAUSE_ERR,
      MOCK_ERR_MSG,
      MOCK_ERR_NUM_CODE,
      MOCK_ERR_CODE_CTR_ARG,
    );
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCauses()).toEqual([MOCK_ERR_CAUSE_ERR]);
    expect(e.getNumCode()).toBe(MOCK_ERR_NUM_CODE);
    expect(e.getCode()).toBe(MOCK_ERR_CODE);
  });

  test('[string, string, number]', () => {
    const e = new GExceptionV0(
      MOCK_ERR_CAUSE_STR,
      MOCK_ERR_MSG,
      MOCK_ERR_NUM_CODE,
    );
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCauses()).toEqual([MOCK_ERR_CAUSE_STR]);
    expect(e.getNumCode()).toBe(MOCK_ERR_NUM_CODE);
  });

  test('[string, string, number, {ok}]', () => {
    const e = new GExceptionV0(
      MOCK_ERR_CAUSE_STR,
      MOCK_ERR_MSG,
      MOCK_ERR_NUM_CODE,
      MOCK_ERR_CODE_CTR_ARG,
    );
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCauses()).toEqual([MOCK_ERR_CAUSE_STR]);
    expect(e.getNumCode()).toBe(MOCK_ERR_NUM_CODE);
    expect(e.getCode()).toBe(MOCK_ERR_CODE);
  });
});

describe('GException constructor: invalid', function () {
  test('Backup parsing: []', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const e = new GExceptionV0();
    expect(e.getMessage()).toMatchInlineSnapshot(
      `"GExceptionV0 constructor problem: Initialized with 0 arguments"`,
    );
  });

  test('Backup parsing: [number, number]', () => {
    const e = new GExceptionV0(1, 2);
    expect(e.getMessage()).toMatchInlineSnapshot(`
      "GExceptionV0 constructor problem: Received unexpected first 2 arguments (of total 2):
      - 1. number - 1
      - 2. number - 2"
    `);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_CONSTRUCTOR_PROBLEMS": Object {
          "firstArgsProblems": Array [
            1,
            2,
          ],
        },
      }
    `);
  });

  test('Backup parsing: [number, number, number]', () => {
    const e = new GExceptionV0(1, 2, 3);
    expect(e.getMessage()).toMatchInlineSnapshot(`
      "GExceptionV0 constructor problem: Received unexpected first 3 arguments (of total 3):
      - 1. number - 1
      - 2. number - 2
      - 3. number - 3"
    `);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_CONSTRUCTOR_PROBLEMS": Object {
          "firstArgsProblems": Array [
            1,
            2,
            3,
          ],
        },
      }
    `);
  });

  test('Backup parsing: [number, number, number]', () => {
    const e = new GExceptionV0(1, 2, 3);
    expect(e.getMessage()).toMatchInlineSnapshot(`
      "GExceptionV0 constructor problem: Received unexpected first 3 arguments (of total 3):
      - 1. number - 1
      - 2. number - 2
      - 3. number - 3"
    `);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_CONSTRUCTOR_PROBLEMS": Object {
          "firstArgsProblems": Array [
            1,
            2,
            3,
          ],
        },
      }
    `);
  });

  test('Backup parsing: [string, number, string]', () => {
    const EXPECTED_CODE = 2;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const e = new GExceptionV0('str1', EXPECTED_CODE, 'str3');
    expect(e.getMessage()).toMatchInlineSnapshot(`"str1"`);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_CONSTRUCTOR_PROBLEMS": Object {
          "restArgsProblems": Array [
            Object {
              "argumentNumber": 3,
              "argumentValue": "str3",
              "problemReason": "GExceptionV0 constructor problem: Unexpected type of 3rd argument (of total 3): string - str3",
            },
          ],
        },
      }
    `);
    expect(e.getNumCode()).toBe(EXPECTED_CODE);
  });

  test('Backup parsing: [{ok}, {ok}, number]', () => {
    const UNEXPECTED_CODE = 333;
    const EXPECTED_CODE = 2;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const e = new GExceptionV0(
      { numCode: EXPECTED_CODE },
      MOCK_ERR_CODE_CTR_ARG,
      UNEXPECTED_CODE,
    );
    expect(e.getMessage()).toMatchInlineSnapshot(`
      "GExceptionV0 constructor problem: Received unexpected first 3 arguments (of total 3):
      - 1. object - [object Object]
      - 2. object - [object Object]
      - 3. number - 333"
    `);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_CONSTRUCTOR_PROBLEMS": Object {
          "firstArgsProblems": Array [
            Object {
              "numCode": 2,
            },
            Object {
              "code": "MOCK_ERR_CODE",
            },
            333,
          ],
        },
      }
    `);
    expect(e.getNumCode()).toBe(EXPECTED_CODE);
    expect(e.getCode()).toBe(MOCK_ERR_CODE);
  });

  test('Backup parsing: [{ok}, {ok}, number, {not ok}, string]', () => {
    const UNEXPECTED_CODE = 333;
    const EXPECTED_CODE = 2;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const e = GExceptionV0.new(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      { unknownProp: 13 },
      MOCK_ERR_CODE_CTR_ARG,
      UNEXPECTED_CODE,
      { numCode: EXPECTED_CODE },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      'heh',
    );
    expect(e.getMessage()).toMatchInlineSnapshot(`
      "GExceptionV0 constructor problem: Received unexpected first 3 arguments (of total 5):
      - 1. object - [object Object]
      - 2. object - [object Object]
      - 3. number - 333"
    `);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_CONSTRUCTOR_PROBLEMS": Object {
          "firstArgsProblems": Array [
            Object {
              "unknownProp": 13,
            },
            Object {
              "code": "MOCK_ERR_CODE",
            },
            333,
          ],
          "invalidKeyProblems": Array [
            Object {
              "argumentNumber": 2,
              "key": "unknownProp",
              "problemReason": "GExceptionV0 constructor problem: Unexpected key in object argument 2 (of total 5): unknownProp = 13",
              "value": 13,
            },
          ],
          "restArgsProblems": Array [
            Object {
              "argumentNumber": 5,
              "argumentValue": "heh",
              "problemReason": "GExceptionV0 constructor problem: Unexpected type of 5th argument (of total 5): string - heh",
            },
          ],
        },
      }
    `);
    expect(e.getNumCode()).toBe(EXPECTED_CODE);
    expect(e.getCode()).toBe(MOCK_ERR_CODE);
  });

  test('Backup parsing: [Array(0)]', () => {
    const e = new GExceptionV0([]);
    expect(e.getMessage()).toMatchInlineSnapshot(
      `"GExceptionV0 constructor problem: Received unexpected argument: array (0)"`,
    );
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_CONSTRUCTOR_PROBLEMS": Object {
          "firstArgsProblems": Array [
            Array [],
          ],
        },
      }
    `);
  });

  test('Backup parsing: [Array(0), Array(2)]', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const e = new GExceptionV0([], ['x', 'y']);
    expect(e.getMessage()).toMatchInlineSnapshot(`
      "GExceptionV0 constructor problem: Received unexpected first 2 arguments (of total 2):
      - 1. array (0)
      - 2. array (2) - x,y"
    `);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_CONSTRUCTOR_PROBLEMS": Object {
          "firstArgsProblems": Array [
            Array [],
            Array [
              "x",
              "y",
            ],
          ],
        },
      }
    `);
  });

  test('Invalid key: [{ok}, string, number, {not ok & ok}, Array(1)]', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const e = new GExceptionV0(
      MOCK_ERR_CAUSE_ERR,
      MOCK_ERR_MSG,
      MOCK_ERR_NUM_CODE,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      { unknownProp1: 123, unknownProp2: 321, code: MOCK_ERR_CODE },
      ['x'],
    );
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCode()).toBe(MOCK_ERR_CODE);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_CONSTRUCTOR_PROBLEMS": Object {
          "invalidKeyProblems": Array [
            Object {
              "argumentNumber": 4,
              "key": "unknownProp1",
              "problemReason": "GExceptionV0 constructor problem: Unexpected key in object argument 4 (of total 5): unknownProp1 = 123",
              "value": 123,
            },
            Object {
              "argumentNumber": 4,
              "key": "unknownProp2",
              "problemReason": "GExceptionV0 constructor problem: Unexpected key in object argument 4 (of total 5): unknownProp2 = 321",
              "value": 321,
            },
          ],
          "restArgsProblems": Array [
            Object {
              "argumentNumber": 5,
              "argumentValue": Array [
                "x",
              ],
              "problemReason": "GExceptionV0 constructor problem: Unexpected type of 5th argument (of total 5): array (1) - x",
            },
          ],
        },
      }
    `);
  });
});
