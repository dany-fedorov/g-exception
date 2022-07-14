import { GException } from '../../src/GException';
import {
  MOCK_DISPLAY_MESSAGE,
  MOCK_ERR_CODE,
  MOCK_ERR_ID,
  MOCK_ERR_MSG,
  MOCK_ERR_NUM_CODE,
} from '../lib/mock-values';

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

const TEMPLATE = [
  `double braces / code:                 ${GException.t.code}`,
  `double braces / numCode:              ${GException.t.numCode}`,
  `double braces / id:                   ${GException.t.id}`,
  `double braces / displayMessage:       ${GException.t.displayMessage}`,
  `double braces / timestamp:            ${GException.t.timestamp}`,
  `double braces / causes:               ${GException.t.causes()}`,
  `double braces / causes.json:          ${GException.t.causes.json}`,
  `double braces / cause0:               ${GException.t.causes(0)}`,
  `double braces / cause1:               ${GException.t.causes(1)}`,
  `double braces / info:                 ${GException.t.info()}`,
  `double braces / info.json:            ${GException.t.info.json}`,
  `double braces / info.prop1:           ${GException.t.info('prop1')}`,
  `double braces / info.prop2.prop22:    ${GException.t.info(
    'prop2.prop22',
  )}`,
  `double braces / info.prop3:           ${GException.t.info('prop3')}`,
  `double braces / info.prop4.prop44[0]: ${GException.t.info(
    'prop4.prop44.[0]',
  )}`,
  '---',
  `triple braces / code:                 ${GException._tt.code}`,
  `triple braces / numCode:              ${GException._tt.numCode}`,
  `triple braces / id:                   ${GException._tt.id}`,
  `triple braces / displayMessage:       ${GException._tt.displayMessage}`,
  `triple braces / timestamp:            ${GException._tt.timestamp}`,
  `triple braces / causes:               ${GException._tt.causes()}`,
  `triple braces / causes.json:          ${GException._tt.causes.json}`,
  `triple braces / cause0:               ${GException._tt.causes(0)}`,
  `triple braces / cause1:               ${GException._tt.causes(1)}`,
  `triple braces / info:                 ${GException._tt.info()}`,
  `triple braces / info.json:            ${GException._tt.info.json}`,
  `triple braces / info.prop1:           ${GException._tt.info('prop1')}`,
  `triple braces / info.prop2.prop22:    ${GException._tt.info(
    'prop2.prop22',
  )}`,
  `triple braces / info.prop3:           ${GException._tt.info('prop3')}`,
  `triple braces / info.prop4.prop44[0]: ${GException._tt.info(
    'prop4.prop44.[0]',
  )}`,
  '---',
  '---',
  'double braces / recursive / message: BEGIN',
  GException.t.message,
  'double braces / recursive / message: END',
  '---',
  '---',
  'triple braces / recursive / message: BEGIN',
  GException._tt.message,
  'triple braces / recursive / message: END',
].join('\n');

const configure = (e: GException): GException => {
  return e
    .setCode(MOCK_ERR_CODE)
    .setNumCode(MOCK_ERR_NUM_CODE)
    .setId(MOCK_ERR_ID)
    .setDisplayMessage(MOCK_DISPLAY_MESSAGE)
    .setTimestamp(new Date('2022-07-13T11:12:25.741Z').toISOString())
    .setCauses([1, 2, 3])
    .setInfo({
      prop1: 'value of info.prop1',
      prop2: { prop22: 'value of info.prop2.prop22' },
    })
    .setInfoProp('prop3', 'value of info.prop3')
    .setInfoProp('prop4', { prop44: ['value of info.prop4.prop44[0]'] });
};

function removeStacktraceEntries(s: string | undefined): string | undefined {
  if (!s) {
    return s;
  }
  return s.replace(/(\n\s*at).+/g, '$1');
}

describe('Message templating', () => {
  test('Valid', () => {
    const message = `<message>\n${TEMPLATE}\n</message>`;
    const e1 = configure(GException.new(message));
    expect(e1.getMessage()).toMatchSnapshot('message:message');
    expect(removeStacktraceEntries(e1.getStack())).toMatchSnapshot(
      'message:stack',
    );
    const displayMessage = `<displayMessage>\n${TEMPLATE}\n</displayMessage>`;
    const e2 = configure(GException.new(MOCK_ERR_MSG)).setDisplayMessage(
      displayMessage,
    );
    expect(e2.getDisplayMessage()).toMatchSnapshot(
      'displayMessage:displayMessage',
    );
    expect(removeStacktraceEntries(e2.getStack())).toMatchSnapshot(
      'displayMessage:stack',
    );
  });

  test('Invalid template: message', () => {
    const BAD_TEMPLATE = 'heh{{h}';
    const e = GException.from({
      message: BAD_TEMPLATE,
    });
    expect(e.getMessage()).toBe(BAD_TEMPLATE);
    expect(e.getMessage()).toBe(BAD_TEMPLATE);
    expect(e.getMessage()).toBe(BAD_TEMPLATE);
    expect(e.getProblems()).toMatchInlineSnapshot(`
      Object {
        "handlebarsProblems": Array [
          Object {
            "caught": [Error: Parse error on line 1:
      heh{{h}
      ------^
      Expecting 'CLOSE_RAW_BLOCK', 'CLOSE', 'CLOSE_UNESCAPED', 'OPEN_SEXPR', 'CLOSE_SEXPR', 'ID', 'OPEN_BLOCK_PARAMS', 'STRING', 'NUMBER', 'BOOLEAN', 'UNDEFINED', 'NULL', 'DATA', 'SEP', got 'INVALID'],
            "template": "heh{{h}",
            "templatePropName": "message",
          },
        ],
      }
    `);
  });

  test('Invalid template: displayMessage', () => {
    const BAD_TEMPLATE = 'heh{{h}';
    const e = GException.from({
      message: MOCK_ERR_MSG,
      displayMessage: BAD_TEMPLATE,
    });
    expect(e.getDisplayMessage()).toBe(BAD_TEMPLATE);
    expect(e.getDisplayMessage()).toBe(BAD_TEMPLATE);
    expect(e.getDisplayMessage()).toBe(BAD_TEMPLATE);
    expect(e.getProblems()).toMatchInlineSnapshot(`
      Object {
        "handlebarsProblems": Array [
          Object {
            "caught": [Error: Parse error on line 1:
      heh{{h}
      ------^
      Expecting 'CLOSE_RAW_BLOCK', 'CLOSE', 'CLOSE_UNESCAPED', 'OPEN_SEXPR', 'CLOSE_SEXPR', 'ID', 'OPEN_BLOCK_PARAMS', 'STRING', 'NUMBER', 'BOOLEAN', 'UNDEFINED', 'NULL', 'DATA', 'SEP', got 'INVALID'],
            "template": "heh{{h}",
            "templatePropName": "displayMessage",
          },
        ],
      }
    `);
  });

  test('Invalid template: stack', () => {
    const BAD_TEMPLATE = 'heh{{h}';
    const e = GException.from({
      message: BAD_TEMPLATE,
    });
    expect(removeStacktraceEntries(e.getStack())).toMatchInlineSnapshot(`
      "Error: heh{{h}
          at
          at
          at
          at
          at
          at
          at
          at
          at
          at"
    `);
    expect(removeStacktraceEntries(e.getStack())).toMatchInlineSnapshot(`
      "Error: heh{{h}
          at
          at
          at
          at
          at
          at
          at
          at
          at
          at"
    `);
    expect(removeStacktraceEntries(e.getStack())).toMatchInlineSnapshot(`
      "Error: heh{{h}
          at
          at
          at
          at
          at
          at
          at
          at
          at
          at"
    `);
    expect({
      ...e.getProblems(),
      handlebarsProblems: e.getProblems()?.handlebarsProblems?.map((p) => ({
        ...p,
        template: removeStacktraceEntries(p.template),
      })),
    }).toMatchInlineSnapshot(`
      Object {
        "handlebarsProblems": Array [
          Object {
            "caught": [Error: Parse error on line 1:
      Error: heh{{h}    at Function.fr
      -------------^
      Expecting 'CLOSE_RAW_BLOCK', 'CLOSE', 'CLOSE_UNESCAPED', 'OPEN_SEXPR', 'CLOSE_SEXPR', 'ID', 'OPEN_BLOCK_PARAMS', 'STRING', 'NUMBER', 'BOOLEAN', 'UNDEFINED', 'NULL', 'DATA', 'SEP', got 'INVALID'],
            "template": "Error: heh{{h}
          at
          at
          at
          at
          at
          at
          at
          at
          at
          at",
            "templatePropName": "stack",
          },
        ],
      }
    `);
  });
});
