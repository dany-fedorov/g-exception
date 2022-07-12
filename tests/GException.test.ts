import { GException } from '../src/GException';

const MOCK_ERR_MSG = 'MOCK_ERR_MSG';
const MOCK_ERR_NUM_CODE = 123;
const MOCK_ERR_CAUSE_ERR = new Error('MOCK_ERR_CAUSE_ERR');
const MOCK_ERR_CAUSE_STR = 'MOCK_ERR_CAUSE_STR';
const MOCK_ERR_CODE = 'MOCK_ERR_CODE';
const MOCK_ERR_CODE_CTR_ARG = { code: MOCK_ERR_CODE };

beforeAll(() => {
  GException.mergeConfig({
    logConstructorProblems: false,
  });
});

afterAll(() => {
  GException.mergeConfig({
    logConstructorProblems: true,
  });
});

describe('GException constructor: valid', function () {
  test('[string]', () => {
    const e = new GException(MOCK_ERR_MSG);
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
  });

  test('[string, {ok}]', () => {
    const e = new GException(MOCK_ERR_MSG, MOCK_ERR_CODE_CTR_ARG);
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCode()).toBe(MOCK_ERR_CODE);
  });

  test('[string, number]', () => {
    const e = new GException(MOCK_ERR_MSG, MOCK_ERR_NUM_CODE);
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getNumCode()).toBe(MOCK_ERR_NUM_CODE);
  });

  test('[string, number, {ok}]', () => {
    const e = new GException(
      MOCK_ERR_MSG,
      MOCK_ERR_NUM_CODE,
      MOCK_ERR_CODE_CTR_ARG,
    );
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getNumCode()).toBe(MOCK_ERR_NUM_CODE);
    expect(e.getCode()).toBe(MOCK_ERR_CODE);
  });

  test('[Error, string]', () => {
    const e = new GException(MOCK_ERR_CAUSE_ERR, MOCK_ERR_MSG);
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCauses()).toEqual([MOCK_ERR_CAUSE_ERR]);
  });

  test('[Error, string, {ok}]', () => {
    const e = new GException(
      MOCK_ERR_CAUSE_ERR,
      MOCK_ERR_MSG,
      MOCK_ERR_CODE_CTR_ARG,
    );
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCauses()).toEqual([MOCK_ERR_CAUSE_ERR]);
    expect(e.getCode()).toBe(MOCK_ERR_CODE);
  });

  test('[string, string]', () => {
    const e = new GException(MOCK_ERR_CAUSE_STR, MOCK_ERR_MSG);
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCauses()).toEqual([MOCK_ERR_CAUSE_STR]);
  });

  test('[string, string, {ok}]', () => {
    const e = new GException(
      MOCK_ERR_CAUSE_STR,
      MOCK_ERR_MSG,
      MOCK_ERR_CODE_CTR_ARG,
    );
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCauses()).toEqual([MOCK_ERR_CAUSE_STR]);
    expect(e.getCode()).toBe(MOCK_ERR_CODE);
  });

  test('[Error, string, number]', () => {
    const e = new GException(
      MOCK_ERR_CAUSE_ERR,
      MOCK_ERR_MSG,
      MOCK_ERR_NUM_CODE,
    );
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCauses()).toEqual([MOCK_ERR_CAUSE_ERR]);
    expect(e.getNumCode()).toBe(MOCK_ERR_NUM_CODE);
  });

  test('[Error, string, number, {ok}]', () => {
    const e = new GException(
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
    const e = new GException(
      MOCK_ERR_CAUSE_STR,
      MOCK_ERR_MSG,
      MOCK_ERR_NUM_CODE,
    );
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCauses()).toEqual([MOCK_ERR_CAUSE_STR]);
    expect(e.getNumCode()).toBe(MOCK_ERR_NUM_CODE);
  });

  test('[string, string, number, {ok}]', () => {
    const e = new GException(
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
  test('Backup parsing: [number, number]', () => {
    const e = new GException(1, 2);
    expect(e.getMessage()).toMatchInlineSnapshot(`
      "GException constructor problem: Received unexpected first 3 arguments (of total 2):
      - 1. number - 1
      - 2. number - 2
      - 3. undefined - "
    `);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_CONSTRUCTOR_PROBLEMS_REPORT": Object {
          "firstBadArgs": Array [
            1,
            2,
            undefined,
          ],
        },
      }
    `);
  });

  test('Backup parsing: [number, number, number]', () => {
    const e = new GException(1, 2, 3);
    expect(e.getMessage()).toMatchInlineSnapshot(`
      "GException constructor problem: Received unexpected first 3 arguments (of total 3):
      - 1. number - 1
      - 2. number - 2
      - 3. number - 3"
    `);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_CONSTRUCTOR_PROBLEMS_REPORT": Object {
          "firstBadArgs": Array [
            1,
            2,
            3,
          ],
        },
      }
    `);
  });

  test('Backup parsing: [number, number, number]', () => {
    const e = new GException(1, 2, 3);
    expect(e.getMessage()).toMatchInlineSnapshot(`
      "GException constructor problem: Received unexpected first 3 arguments (of total 3):
      - 1. number - 1
      - 2. number - 2
      - 3. number - 3"
    `);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_CONSTRUCTOR_PROBLEMS_REPORT": Object {
          "firstBadArgs": Array [
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
    const e = new GException('str1', EXPECTED_CODE, 'str3');
    expect(e.getMessage()).toMatchInlineSnapshot(`"str1"`);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_CONSTRUCTOR_PROBLEMS_REPORT": Object {
          "restArgsProblems": Array [
            Object {
              "argumentIndex": 2,
              "argumentValue": "str3",
              "problemReason": "GException constructor problem: Unexpected 3rd argument type (of total 3): string - str3",
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
    const e = new GException(
      { numCode: EXPECTED_CODE },
      MOCK_ERR_CODE_CTR_ARG,
      UNEXPECTED_CODE,
    );
    expect(e.getMessage()).toMatchInlineSnapshot(`
      "GException constructor problem: Received unexpected first 3 arguments (of total 3):
      - 1. object - [object Object]
      - 2. object - [object Object]
      - 3. number - 333"
    `);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_CONSTRUCTOR_PROBLEMS_REPORT": Object {
          "firstBadArgs": Array [
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
    const e = new GException(
      { numCode: EXPECTED_CODE },
      MOCK_ERR_CODE_CTR_ARG,
      UNEXPECTED_CODE,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      { unknownProp: 13 },
    );
    expect(e.getMessage()).toMatchInlineSnapshot(`
      "GException constructor problem: Received unexpected first 3 arguments (of total 3):
      - 1. object - [object Object]
      - 2. object - [object Object]
      - 3. number - 333"
    `);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_CONSTRUCTOR_PROBLEMS_REPORT": Object {
          "firstBadArgs": Array [
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
});
