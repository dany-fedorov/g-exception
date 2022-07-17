import { GException } from '../../src/GException';
import {
  MOCK_BAD_HBS,
  MOCK_ERR_CAUSE_ERR,
  MOCK_ERR_CAUSE_STR,
  MOCK_ERR_CODE,
  MOCK_ERR_CODE_CTR_ARG,
  MOCK_ERR_MSG,
  MOCK_ERR_NUM_CODE,
} from '../lib/mock-values';

function initWarnSpy() {
  return jest.spyOn(console, 'warn').mockImplementation(() => {});
}

let consoleWarnSpy = initWarnSpy();
beforeEach(() => {
  consoleWarnSpy = initWarnSpy();
  GException.setConfig(GException.G_EXCEPTION_DEFAULT_CONFIG);
});

afterEach(() => {
  consoleWarnSpy.mockClear();
  GException.setConfig(GException.G_EXCEPTION_DEFAULT_CONFIG);
});

afterAll(() => {
  consoleWarnSpy.mockRestore();
});

describe('GException constructor: valid', function () {
  test('[string]', () => {
    const e = new GException(MOCK_ERR_MSG);
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`Array []`);
  });

  test('[string, {ok}]', () => {
    const e = new GException(MOCK_ERR_MSG, MOCK_ERR_CODE_CTR_ARG);
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCode()).toBe(MOCK_ERR_CODE);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`Array []`);
  });

  test('[string, number]', () => {
    const e = new GException(MOCK_ERR_MSG, MOCK_ERR_NUM_CODE);
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getNumCode()).toBe(MOCK_ERR_NUM_CODE);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`Array []`);
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
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`Array []`);
  });

  test('[Error, string]', () => {
    const e = new GException(MOCK_ERR_CAUSE_ERR, MOCK_ERR_MSG);
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCauses()).toEqual([MOCK_ERR_CAUSE_ERR]);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`Array []`);
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
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`Array []`);
  });

  test('[string, string]', () => {
    const e = new GException(MOCK_ERR_CAUSE_STR, MOCK_ERR_MSG);
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCauses()).toEqual([MOCK_ERR_CAUSE_STR]);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`Array []`);
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
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`Array []`);
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
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`Array []`);
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
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`Array []`);
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
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`Array []`);
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
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`Array []`);
  });
});

describe('GException constructor: invalid', function () {
  test('Backup parsing: []', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const e = new GException();
    expect(e.getMessage()).toMatchInlineSnapshot(
      `"GException problem: Initialized with 0 arguments"`,
    );
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "GException problem: Initialized with 0 arguments",
        ],
      ]
    `);
  });

  test('Backup parsing: [number, number]', () => {
    const e = new GException(1, 2);
    expect(e.getMessage()).toMatchInlineSnapshot(`
      "GException problem: Received unexpected first 2 arguments (of total 2):
      - 1. number - 1
      - 2. number - 2"
    `);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_PROBLEMS": Object {
          "firstArgsProblems": Array [
            Object {
              "args": Array [
                1,
                2,
              ],
              "problemReason": "GException problem: Received unexpected first 2 arguments (of total 2):
      - 1. number - 1
      - 2. number - 2",
            },
          ],
        },
      }
    `);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "GException problem: Received unexpected first 2 arguments (of total 2):
      - 1. number - 1
      - 2. number - 2",
        ],
      ]
    `);
  });

  test('Backup parsing: [number, number, number]', () => {
    const e = new GException(1, 2, 3);
    expect(e.getMessage()).toMatchInlineSnapshot(`
      "GException problem: Received unexpected first 3 arguments (of total 3):
      - 1. number - 1
      - 2. number - 2
      - 3. number - 3"
    `);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_PROBLEMS": Object {
          "firstArgsProblems": Array [
            Object {
              "args": Array [
                1,
                2,
                3,
              ],
              "problemReason": "GException problem: Received unexpected first 3 arguments (of total 3):
      - 1. number - 1
      - 2. number - 2
      - 3. number - 3",
            },
          ],
        },
      }
    `);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "GException problem: Received unexpected first 3 arguments (of total 3):
      - 1. number - 1
      - 2. number - 2
      - 3. number - 3",
        ],
      ]
    `);
  });

  test('Backup parsing: [number, number, number]', () => {
    const e = new GException(1, 2, 3);
    expect(e.getMessage()).toMatchInlineSnapshot(`
      "GException problem: Received unexpected first 3 arguments (of total 3):
      - 1. number - 1
      - 2. number - 2
      - 3. number - 3"
    `);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_PROBLEMS": Object {
          "firstArgsProblems": Array [
            Object {
              "args": Array [
                1,
                2,
                3,
              ],
              "problemReason": "GException problem: Received unexpected first 3 arguments (of total 3):
      - 1. number - 1
      - 2. number - 2
      - 3. number - 3",
            },
          ],
        },
      }
    `);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "GException problem: Received unexpected first 3 arguments (of total 3):
      - 1. number - 1
      - 2. number - 2
      - 3. number - 3",
        ],
      ]
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
        "G_EXCEPTION_PROBLEMS": Object {
          "restArgsProblems": Array [
            Object {
              "argumentNumber": 3,
              "argumentValue": "str3",
              "problemReason": "GException problem: Unexpected type of 3rd argument (of total 3): string - str3",
            },
          ],
        },
      }
    `);
    expect(e.getNumCode()).toBe(EXPECTED_CODE);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "GException problem: Unexpected type of 3rd argument (of total 3): string - str3",
        ],
      ]
    `);
  });

  test('Backup parsing: [{ok}, {ok}, number]', () => {
    const UNEXPECTED_CODE = 333;
    const EXPECTED_CODE = 2;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const e = new GException(
      { [GException.k.numCode]: EXPECTED_CODE },
      MOCK_ERR_CODE_CTR_ARG,
      UNEXPECTED_CODE,
    );
    expect(e.getMessage()).toMatchInlineSnapshot(`
      "GException problem: Received unexpected first 3 arguments (of total 3):
      - 1. object - [object Object]
      - 2. object - [object Object]
      - 3. number - 333"
    `);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_PROBLEMS": Object {
          "firstArgsProblems": Array [
            Object {
              "args": Array [
                Object {
                  "numCode": 2,
                },
                Object {
                  "code": "MOCK_ERR_CODE",
                },
                333,
              ],
              "problemReason": "GException problem: Received unexpected first 3 arguments (of total 3):
      - 1. object - [object Object]
      - 2. object - [object Object]
      - 3. number - 333",
            },
          ],
        },
      }
    `);
    expect(e.getNumCode()).toBe(EXPECTED_CODE);
    expect(e.getCode()).toBe(MOCK_ERR_CODE);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "GException problem: Received unexpected first 3 arguments (of total 3):
      - 1. object - [object Object]
      - 2. object - [object Object]
      - 3. number - 333",
        ],
      ]
    `);
  });

  test('Backup parsing: [{ok}, {ok}, number, {not ok}, string]', () => {
    const UNEXPECTED_CODE = 333;
    const EXPECTED_CODE = 2;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const e = GException.new(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      { unknownProp: 13 },
      MOCK_ERR_CODE_CTR_ARG,
      UNEXPECTED_CODE,
      { [GException.k.numCode]: EXPECTED_CODE },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      'heh',
    );
    expect(e.getMessage()).toMatchInlineSnapshot(`
      "GException problem: Received unexpected first 3 arguments (of total 5):
      - 1. object - [object Object]
      - 2. object - [object Object]
      - 3. number - 333"
    `);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_PROBLEMS": Object {
          "firstArgsProblems": Array [
            Object {
              "args": Array [
                Object {
                  "unknownProp": 13,
                },
                Object {
                  "code": "MOCK_ERR_CODE",
                },
                333,
              ],
              "problemReason": "GException problem: Received unexpected first 3 arguments (of total 5):
      - 1. object - [object Object]
      - 2. object - [object Object]
      - 3. number - 333",
            },
          ],
          "invalidKeyProblems": Array [
            Object {
              "argumentNumber": 2,
              "key": "unknownProp",
              "problemReason": "GException problem: Unexpected key in object argument 2 (of total 5): unknownProp = 13",
              "value": 13,
            },
          ],
          "restArgsProblems": Array [
            Object {
              "argumentNumber": 5,
              "argumentValue": "heh",
              "problemReason": "GException problem: Unexpected type of 5th argument (of total 5): string - heh",
            },
          ],
        },
      }
    `);
    expect(e.getNumCode()).toBe(EXPECTED_CODE);
    expect(e.getCode()).toBe(MOCK_ERR_CODE);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "GException problem: Unexpected key in object argument 2 (of total 5): unknownProp = 13",
        ],
        Array [
          "GException problem: Received unexpected first 3 arguments (of total 5):
      - 1. object - [object Object]
      - 2. object - [object Object]
      - 3. number - 333",
        ],
        Array [
          "GException problem: Unexpected type of 5th argument (of total 5): string - heh",
        ],
      ]
    `);
  });

  test('Backup parsing: [Array(0)]', () => {
    const e = new GException([]);
    expect(e.getMessage()).toMatchInlineSnapshot(
      `"GException problem: Received unexpected argument: array (0)"`,
    );
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_PROBLEMS": Object {
          "firstArgsProblems": Array [
            Object {
              "args": Array [
                Array [],
              ],
              "problemReason": "GException problem: Received unexpected argument: array (0)",
            },
          ],
        },
      }
    `);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "GException problem: Received unexpected argument: array (0)",
        ],
      ]
    `);
  });

  test('Backup parsing: [Array(0), Array(2)]', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const e = new GException([], ['x', 'y']);
    expect(e.getMessage()).toMatchInlineSnapshot(`
      "GException problem: Received unexpected first 2 arguments (of total 2):
      - 1. array (0)
      - 2. array (2) - x,y"
    `);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_PROBLEMS": Object {
          "firstArgsProblems": Array [
            Object {
              "args": Array [
                Array [],
                Array [
                  "x",
                  "y",
                ],
              ],
              "problemReason": "GException problem: Received unexpected first 2 arguments (of total 2):
      - 1. array (0)
      - 2. array (2) - x,y",
            },
          ],
        },
      }
    `);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "GException problem: Received unexpected first 2 arguments (of total 2):
      - 1. array (0)
      - 2. array (2) - x,y",
        ],
      ]
    `);
  });

  test('Invalid key: [{ok}, string, number, {not ok & ok}, Array(1)]', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const e = new GException(
      MOCK_ERR_CAUSE_ERR,
      MOCK_ERR_MSG,
      MOCK_ERR_NUM_CODE,
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        unknownProp1: 123,
        unknownProp2: 321,
        [GException.k.code]: MOCK_ERR_CODE,
      },
      ['x'],
    );
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCode()).toBe(MOCK_ERR_CODE);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_PROBLEMS": Object {
          "invalidKeyProblems": Array [
            Object {
              "argumentNumber": 4,
              "key": "unknownProp1",
              "problemReason": "GException problem: Unexpected key in object argument 4 (of total 5): unknownProp1 = 123",
              "value": 123,
            },
            Object {
              "argumentNumber": 4,
              "key": "unknownProp2",
              "problemReason": "GException problem: Unexpected key in object argument 4 (of total 5): unknownProp2 = 321",
              "value": 321,
            },
          ],
          "restArgsProblems": Array [
            Object {
              "argumentNumber": 5,
              "argumentValue": Array [
                "x",
              ],
              "problemReason": "GException problem: Unexpected type of 5th argument (of total 5): array (1) - x",
            },
          ],
        },
      }
    `);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "GException problem: Unexpected key in object argument 4 (of total 5): unknownProp1 = 123",
        ],
        Array [
          "GException problem: Unexpected key in object argument 4 (of total 5): unknownProp2 = 321",
        ],
        Array [
          "GException problem: Unexpected type of 5th argument (of total 5): array (1) - x",
        ],
      ]
    `);
  });
});

describe('Instance config overrides global config', () => {
  test('Global config base case', () => {
    GException.mergeConfig({
      recordProblemsConfig: {
        handlebarsProblems: true,
      },
    });
    const BAD_HBS = '{{bad hbs}';
    const e = new GException(BAD_HBS);
    expect(e.getMessage()).toBe(BAD_HBS);
    expect(e.getProblems()).toMatchInlineSnapshot(`
      Object {
        "handlebarsProblems": Array [
          Object {
            "caught": [Error: Parse error on line 1:
      {{bad hbs}
      ---------^
      Expecting 'CLOSE_RAW_BLOCK', 'CLOSE', 'CLOSE_UNESCAPED', 'OPEN_SEXPR', 'CLOSE_SEXPR', 'ID', 'EQUALS', 'OPEN_BLOCK_PARAMS', 'STRING', 'NUMBER', 'BOOLEAN', 'UNDEFINED', 'NULL', 'DATA', 'SEP', got 'INVALID'],
            "problemReason": "GException problem: Problem during handlebars compilation of template \\"message\\"
      - template: {{bad hbs}
      - caught: Error: Parse error on line 1:
      {{bad hbs}
      ---------^
      Expecting 'CLOSE_RAW_BLOCK', 'CLOSE', 'CLOSE_UNESCAPED', 'OPEN_SEXPR', 'CLOSE_SEXPR', 'ID', 'EQUALS', 'OPEN_BLOCK_PARAMS', 'STRING', 'NUMBER', 'BOOLEAN', 'UNDEFINED', 'NULL', 'DATA', 'SEP', got 'INVALID'",
            "template": "{{bad hbs}",
            "templatePropName": "message",
          },
        ],
      }
    `);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "GException problem: Problem during handlebars compilation of template \\"message\\"
      - template: {{bad hbs}
      - caught: Error: Parse error on line 1:
      {{bad hbs}
      ---------^
      Expecting 'CLOSE_RAW_BLOCK', 'CLOSE', 'CLOSE_UNESCAPED', 'OPEN_SEXPR', 'CLOSE_SEXPR', 'ID', 'EQUALS', 'OPEN_BLOCK_PARAMS', 'STRING', 'NUMBER', 'BOOLEAN', 'UNDEFINED', 'NULL', 'DATA', 'SEP', got 'INVALID'",
        ],
      ]
    `);
  });

  test('Instance config overrides 1', () => {
    GException.mergeConfig({
      recordProblemsConfig: {
        handlebarsProblems: true,
      },
    });
    const e = new GException(MOCK_BAD_HBS, {
      [GException._k.config]: {
        recordProblemsConfig: { handlebarsProblems: false },
      },
    });
    expect(e.getMessage()).toBe(MOCK_BAD_HBS);
    expect(e.getProblems()).toMatchInlineSnapshot(`undefined`);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "GException problem: Problem during handlebars compilation of template \\"message\\"
      - template: {{MOCK_BAD_HBS}
      - caught: Error: Parse error on line 1:
      {{MOCK_BAD_HBS}
      --------------^
      Expecting 'CLOSE_RAW_BLOCK', 'CLOSE', 'CLOSE_UNESCAPED', 'OPEN_SEXPR', 'CLOSE_SEXPR', 'ID', 'OPEN_BLOCK_PARAMS', 'STRING', 'NUMBER', 'BOOLEAN', 'UNDEFINED', 'NULL', 'DATA', 'SEP', got 'INVALID'",
        ],
      ]
    `);
  });

  test('Instance config overrides 2', () => {
    GException.mergeConfig({
      recordProblemsConfig: {
        handlebarsProblems: true,
      },
    });
    const e = GException.new(MOCK_BAD_HBS).setConfig({
      recordProblemsConfig: {
        handlebarsProblems: false,
      },
    });
    expect(e.getMessage()).toBe(MOCK_BAD_HBS);
    expect(e.getProblems()).toMatchInlineSnapshot(`undefined`);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "GException problem: Problem during handlebars compilation of template \\"message\\"
      - template: {{MOCK_BAD_HBS}
      - caught: Error: Parse error on line 1:
      {{MOCK_BAD_HBS}
      --------------^
      Expecting 'CLOSE_RAW_BLOCK', 'CLOSE', 'CLOSE_UNESCAPED', 'OPEN_SEXPR', 'CLOSE_SEXPR', 'ID', 'OPEN_BLOCK_PARAMS', 'STRING', 'NUMBER', 'BOOLEAN', 'UNDEFINED', 'NULL', 'DATA', 'SEP', got 'INVALID'",
        ],
      ]
    `);
  });

  test('Instance config overrides 3', () => {
    GException.setConfig(GException.G_EXCEPTION_DEFAULT_CONFIG);
    const e = GException.new(MOCK_BAD_HBS).setConfig({
      recordProblemsConfig: {
        handlebarsProblems: true,
      },
    });
    e.mergeConfig({
      recordProblemsConfig: {
        handlebarsProblems: false,
      },
    });
    expect(e.getMessage()).toBe(MOCK_BAD_HBS);
    expect(e.getProblems()).toMatchInlineSnapshot(`undefined`);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "GException problem: Problem during handlebars compilation of template \\"message\\"
      - template: {{MOCK_BAD_HBS}
      - caught: Error: Parse error on line 1:
      {{MOCK_BAD_HBS}
      --------------^
      Expecting 'CLOSE_RAW_BLOCK', 'CLOSE', 'CLOSE_UNESCAPED', 'OPEN_SEXPR', 'CLOSE_SEXPR', 'ID', 'OPEN_BLOCK_PARAMS', 'STRING', 'NUMBER', 'BOOLEAN', 'UNDEFINED', 'NULL', 'DATA', 'SEP', got 'INVALID'",
        ],
      ]
    `);
  });
});

describe('Type predicates', () => {
  test('isSubtype / isExactly', () => {
    const gException = new GException(MOCK_ERR_MSG);

    class HException extends GException {}

    const eException = new HException(MOCK_ERR_MSG);

    expect(GException.isSubtype(gException)).toBe(true);
    expect(GException.isSubtype(eException)).toBe(true);

    expect(GException.isExactly(gException)).toBe(true);
    expect(GException.isExactly(eException)).toBe(false);

    expect(HException.isSubtype(gException)).toBe(false);
    expect(HException.isSubtype(eException)).toBe(true);

    expect(HException.isExactly(gException)).toBe(false);
    expect(HException.isExactly(eException)).toBe(true);

    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`Array []`);
  });
});

describe('Misc', () => {
  test('Display message can be set to message: control case', () => {
    const e = GException.new(MOCK_ERR_MSG);
    expect(e.getDisplayMessage()).toBe(undefined);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`Array []`);
  });

  test('Display message can be set to message', () => {
    const e = GException.new(MOCK_ERR_MSG).setDisplayMessage(true);
    expect(e.getDisplayMessage()).toBe(MOCK_ERR_MSG);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`Array []`);
  });

  test('Info keys are merged', () => {
    const e = GException.new(
      MOCK_ERR_MSG,
      { [GException.k.info]: { a: 1 } },
      { [GException.k.info]: { b: 2 } },
    );
    e.mergeInfo({ c: 3 });
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "a": 1,
        "b": 2,
        "c": 3,
      }
    `);
    expect(e.getInfoProp('a')).toBe(1);
    expect(e.getInfoProp('b')).toBe(2);
    expect(e.getInfoProp('c')).toBe(3);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`Array []`);
  });

  test('problemsPropKey is not string', () => {
    const INFO_BAD_KEY = 'INFO_BAD_KEY';
    const INFO_GOOD_KEY = 'INFO_GOOD_KEY';

    const infoObject = {
      [INFO_BAD_KEY]: `value of ${INFO_BAD_KEY}`,
      [INFO_GOOD_KEY]: `value of ${INFO_GOOD_KEY}`,
    };

    const badHandler = {
      get(target: any, prop: any, _receiver: any) {
        if (prop === INFO_BAD_KEY) {
          throw new Error(`badHandler: Error accessing ${prop} on infoObject`);
        }
        return target[prop];
      },
    };

    const badInfoObject = new Proxy(infoObject, badHandler);

    const e = GException.new(MOCK_BAD_HBS, {
      config: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        problemsInfoPropKey: null,
      },
      info: badInfoObject,
    }).mergeInfo(badInfoObject);
    expect(e.getMessage()).toBe(MOCK_BAD_HBS);
    expect(e.getProblems()).toBe(undefined);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "INFO_GOOD_KEY": "value of INFO_GOOD_KEY",
      }
    `);

    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "GException problem: Problem accessing key INFO_BAD_KEY in \\"info\\" during processing argument 2 (of total 2): Error: badHandler: Error accessing INFO_BAD_KEY on infoObject",
        ],
        Array [
          "GException problem: Problem accessing key INFO_BAD_KEY in \\"info\\" during mergeInfo: Error: badHandler: Error accessing INFO_BAD_KEY on infoObject",
        ],
        Array [
          "GException problem: Problem during handlebars compilation of template \\"message\\"
      - template: {{MOCK_BAD_HBS}
      - caught: Error: Parse error on line 1:
      {{MOCK_BAD_HBS}
      --------------^
      Expecting 'CLOSE_RAW_BLOCK', 'CLOSE', 'CLOSE_UNESCAPED', 'OPEN_SEXPR', 'CLOSE_SEXPR', 'ID', 'OPEN_BLOCK_PARAMS', 'STRING', 'NUMBER', 'BOOLEAN', 'UNDEFINED', 'NULL', 'DATA', 'SEP', got 'INVALID'",
        ],
      ]
    `);
  });

  test('Extensions api', () => {
    class HException extends GException<{ special: string }> {
      setSpecialProp(v: string): this {
        return this.setExtensionProp('special', v);
      }

      getSpecialProp(): string | undefined {
        return this.getExtensionProp('special');
      }
    }

    const h = new HException(MOCK_ERR_MSG);
    expect(h.getSpecialProp()).toBe(undefined);
    const SPECIAL_PROP_VAL = 'SPECIAL_PROP_VAL';
    expect(h.setSpecialProp(SPECIAL_PROP_VAL).getSpecialProp()).toBe(
      SPECIAL_PROP_VAL,
    );
    const SPECIAL_PROP_VAL_2 = 'SPECIAL_PROP_VAL_2';
    expect(h.setSpecialProp(SPECIAL_PROP_VAL_2).getSpecialProp()).toBe(
      SPECIAL_PROP_VAL_2,
    );

    const h2 = new HException('special::{{special}}');
    h2.setSpecialProp(SPECIAL_PROP_VAL_2);
    expect(h2.getMessage()).toBe(`special::${SPECIAL_PROP_VAL_2}`);

    const h3 = (
      HException.new('special::{{special}}') as HException
    ).setSpecialProp(SPECIAL_PROP_VAL_2);
    expect(h3.getMessage()).toBe(`special::${SPECIAL_PROP_VAL_2}`);
    expect(h3.getMessage()).toBe(h2.getMessage());

    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`Array []`);
  });

  test('Handlebars compilation is disabled', () => {
    const GOOD_HBS = '{{json info}}';
    const e = GException.new(GOOD_HBS).setConfig({
      handlebarsCompilation: false,
    });
    expect(e.getMessage()).toBe(GOOD_HBS);
    const e2 = GException.new(GOOD_HBS).setConfig({
      handlebarsCompilation: true,
    });
    expect(e2.getMessage()).toMatchInlineSnapshot(`""`);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`Array []`);
  });
});

describe('Errors', () => {
  test('Error during construction', () => {
    const configObj = {
      [GException.k.info]: { a: 'b' },
      [GException.k.code]: MOCK_ERR_CODE,
    };

    const badHandler = {
      get(target: any, prop: any, _receiver: any) {
        if (prop === GException.INFO_KEY) {
          throw new Error(`badHandler: Error accessing ${prop}`);
        }
        return target[prop];
      },
    };

    const badArgumentObject = new Proxy(configObj, badHandler);

    const e = new GException(MOCK_ERR_MSG, badArgumentObject);
    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getCode()).toBe(MOCK_ERR_CODE);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_PROBLEMS": Object {
          "restArgsProblems": Array [
            Object {
              "argumentNumber": 2,
              "caught": [Error: badHandler: Error accessing info],
              "keyInArgument": "info",
              "problemReason": "GException problem: Problem accessing key info in 2nd argument (of total 2): Error: badHandler: Error accessing info",
            },
          ],
        },
      }
    `);
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "GException problem: Problem accessing key info in 2nd argument (of total 2): Error: badHandler: Error accessing info",
        ],
      ]
    `);
  });

  interface Cyclic {
    key1: string;
    key2: string;
    self: this | null;
  }

  test('Error during json helper in handlebars due to cyclic obj', () => {
    const cyclicObject: Cyclic = { key1: 'def', key2: 'abc', self: null };
    cyclicObject.self = cyclicObject;
    const e = new GException('{{{json info}}}', {
      [GException.k.info]: cyclicObject as Record<string, any>,
    });
    expect(e.getProblems()).toBe(undefined);
    expect(e.getMessage()).toMatchInlineSnapshot(
      `"{\\"key1\\":\\"def\\",\\"key2\\":\\"abc\\",\\"self\\":{\\"key1\\":\\"def\\",\\"key2\\":\\"abc\\"}}"`,
    );
    expect(consoleWarnSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "GException problem: Handlebars tried to stringify a cyclic object
      - cyclic reference on key: self
      - template location: 1:0 - 1:15",
        ],
      ]
    `);
  });

  test('Bad mergeInfo 1', () => {
    const INFO_BAD_KEY = 'INFO_BAD_KEY';
    const INFO_GOOD_KEY = 'INFO_GOOD_KEY';

    const infoObject = {
      [INFO_BAD_KEY]: `value of ${INFO_BAD_KEY}`,
      [INFO_GOOD_KEY]: `value of ${INFO_GOOD_KEY}`,
    };

    const badHandler = {
      get(target: any, prop: any, _receiver: any) {
        if (prop === INFO_BAD_KEY) {
          throw new Error(`badHandler: Error accessing ${prop} on infoObject`);
        }
        return target[prop];
      },
    };

    const badInfoObject = new Proxy(infoObject, badHandler);

    const e = new GException(MOCK_ERR_MSG, { info: badInfoObject });

    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_PROBLEMS": Object {
          "restArgsProblems": Array [
            Object {
              "argumentNumber": 2,
              "problemReason": "GException problem: Problem accessing key INFO_BAD_KEY in \\"info\\" during processing argument 2 (of total 2): Error: badHandler: Error accessing INFO_BAD_KEY on infoObject",
            },
          ],
        },
        "INFO_GOOD_KEY": "value of INFO_GOOD_KEY",
      }
    `);
    expect(e.getProblems()).toMatchInlineSnapshot(`
      Object {
        "restArgsProblems": Array [
          Object {
            "argumentNumber": 2,
            "problemReason": "GException problem: Problem accessing key INFO_BAD_KEY in \\"info\\" during processing argument 2 (of total 2): Error: badHandler: Error accessing INFO_BAD_KEY on infoObject",
          },
        ],
      }
    `);
  });

  test('Bad mergeInfo 2', () => {
    const INFO_BAD_KEY = 'INFO_BAD_KEY';
    const INFO_GOOD_KEY = 'INFO_GOOD_KEY';
    const infoObject = {
      [INFO_BAD_KEY]: `value of ${INFO_BAD_KEY}`,
      [INFO_GOOD_KEY]: `value of ${INFO_GOOD_KEY}`,
    };

    const badHandler = {
      get(target: any, prop: any, _receiver: any) {
        if (prop === INFO_BAD_KEY) {
          throw new Error(`badHandler: Error accessing ${prop} on infoObject`);
        }
        return target[prop];
      },
    };

    const badInfoObject = new Proxy(infoObject, badHandler);

    const e = GException.new(MOCK_ERR_MSG).mergeInfo(badInfoObject);

    expect(e.getMessage()).toBe(MOCK_ERR_MSG);
    expect(e.getInfo()).toMatchInlineSnapshot(`
      Object {
        "G_EXCEPTION_PROBLEMS": Object {
          "mergeInfoProblems": Array [
            Object {
              "caught": [Error: badHandler: Error accessing INFO_BAD_KEY on infoObject],
              "keyInInfo": "INFO_BAD_KEY",
              "problemReason": "GException problem: Problem accessing key INFO_BAD_KEY in \\"info\\" during mergeInfo: Error: badHandler: Error accessing INFO_BAD_KEY on infoObject",
            },
          ],
        },
        "INFO_GOOD_KEY": "value of INFO_GOOD_KEY",
      }
    `);
    expect(e.getProblems()).toMatchInlineSnapshot(`
      Object {
        "mergeInfoProblems": Array [
          Object {
            "caught": [Error: badHandler: Error accessing INFO_BAD_KEY on infoObject],
            "keyInInfo": "INFO_BAD_KEY",
            "problemReason": "GException problem: Problem accessing key INFO_BAD_KEY in \\"info\\" during mergeInfo: Error: badHandler: Error accessing INFO_BAD_KEY on infoObject",
          },
        ],
      }
    `);
  });
});
