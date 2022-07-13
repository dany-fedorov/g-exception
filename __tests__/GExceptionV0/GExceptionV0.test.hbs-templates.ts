import { GExceptionV0 } from '../../src/GExceptionV0';
import {
  MOCK_DISPLAY_MESSAGE,
  MOCK_ERR_CODE,
  MOCK_ERR_ID,
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
const TEMPLATE = [
  `double braces / code:                 ${GExceptionV0.t.code}`,
  `double braces / numCode:              ${GExceptionV0.t.numCode}`,
  `double braces / id:                   ${GExceptionV0.t.id}`,
  `double braces / displayMessage:       ${GExceptionV0.t.displayMessage}`,
  `double braces / timestamp:            ${GExceptionV0.t.timestamp}`,
  `double braces / causes:               ${GExceptionV0.t.causes()}`,
  `double braces / causes.json:          ${GExceptionV0.t.causes.json}`,
  `double braces / cause0:               ${GExceptionV0.t.causes(0)}`,
  `double braces / cause1:               ${GExceptionV0.t.causes(1)}`,
  `double braces / info:                 ${GExceptionV0.t.info()}`,
  `double braces / info.json:            ${GExceptionV0.t.info.json}`,
  `double braces / info.prop1:           ${GExceptionV0.t.info('prop1')}`,
  `double braces / info.prop2.prop22:    ${GExceptionV0.t.info(
    'prop2.prop22',
  )}`,
  `double braces / info.prop3:           ${GExceptionV0.t.info('prop3')}`,
  `double braces / info.prop4.prop44[0]: ${GExceptionV0.t.info(
    'prop4.prop44.[0]',
  )}`,
  '---',
  `triple braces / code:                 ${GExceptionV0._tt.code}`,
  `triple braces / numCode:              ${GExceptionV0._tt.numCode}`,
  `triple braces / id:                   ${GExceptionV0._tt.id}`,
  `triple braces / displayMessage:       ${GExceptionV0._tt.displayMessage}`,
  `triple braces / timestamp:            ${GExceptionV0._tt.timestamp}`,
  `triple braces / causes:               ${GExceptionV0._tt.causes()}`,
  `triple braces / causes.json:          ${GExceptionV0._tt.causes.json}`,
  `triple braces / cause0:               ${GExceptionV0._tt.causes(0)}`,
  `triple braces / cause1:               ${GExceptionV0._tt.causes(1)}`,
  `triple braces / info:                 ${GExceptionV0._tt.info()}`,
  `triple braces / info.json:            ${GExceptionV0._tt.info.json}`,
  `triple braces / info.prop1:           ${GExceptionV0._tt.info('prop1')}`,
  `triple braces / info.prop2.prop22:    ${GExceptionV0._tt.info(
    'prop2.prop22',
  )}`,
  `triple braces / info.prop3:           ${GExceptionV0._tt.info('prop3')}`,
  `triple braces / info.prop4.prop44[0]: ${GExceptionV0._tt.info(
    'prop4.prop44.[0]',
  )}`,
  '---',
  '---',
  'double braces / recursive / message: BEGIN',
  GExceptionV0.t.message,
  'double braces / recursive / message: END',
  '---',
  '---',
  'triple braces / recursive / message: BEGIN',
  GExceptionV0._tt.message,
  'triple braces / recursive / message: END',
].join('\n');

const configure = (e: GExceptionV0): GExceptionV0 => {
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

function removeStackEntries(s: string | undefined): string | undefined {
  if (!s) {
    return s;
  }
  return s.replace(/(\n\s*at).+/g, '$1');
}

describe('Message templating', () => {
  test('Valid', () => {
    const message = `<message>\n${TEMPLATE}\n</message>`;
    const e1 = configure(GExceptionV0.new(message));
    expect(e1.getMessage()).toMatchSnapshot('message:message');
    expect(removeStackEntries(e1.getStack())).toMatchSnapshot('message:stack');
    const displayMessage = `<displayMessage>\n${TEMPLATE}\n</displayMessage>`;
    const e2 = configure(GExceptionV0.new(MOCK_ERR_MSG)).setDisplayMessage(
      displayMessage,
    );
    expect(e2.getDisplayMessage()).toMatchSnapshot(
      'displayMessage:displayMessage',
    );
    expect(removeStackEntries(e2.getStack())).toMatchSnapshot(
      'displayMessage:stack',
    );
  });

  test('Invalid template', () => {
    GExceptionV0.from({ message: 'heh{{h}' });
  });
});
