import { GException } from '../../src';

function mkCombinations(values: string[]): string[][] {
  return values.flatMap((v0) => {
    return values.flatMap((v1) => {
      return values.map((v2) => {
        return [v0, v1, v2];
      });
    });
  });
}

enum TypeClass {
  STRING = 'string',
  NUMBER = 'number',
  UNKNOWN = 'unknown',
  NOT_NUMBER = '!number',
  NOT_NUMBER_NOT_STRING = '!number & !string',
}

type TranslateConfig = {
  [TypeClass.STRING]?: string;
  [TypeClass.NUMBER]?: number;
  [TypeClass.UNKNOWN]: unknown;
  [TypeClass.NOT_NUMBER]: unknown;
  [TypeClass.NOT_NUMBER_NOT_STRING]: unknown;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function translate(tc: TypeClass, config: TranslateConfig): unknown {
  switch (tc) {
    case TypeClass.STRING:
      return config[tc] || 'mock_str';
    case TypeClass.NUMBER:
      return config[tc] || 123;
    case TypeClass.UNKNOWN:
      return config[tc] || {};
    case TypeClass.NOT_NUMBER:
      return config[tc] || {};
    case TypeClass.NOT_NUMBER_NOT_STRING:
      return config[tc] || {};
  }
}

const COL_WIDTH = 20;
const COL_SEP = ' | ';

export function evalConstructorArgumentsCombinations(
  config: TranslateConfig,
): string {
  const combinations = mkCombinations(Object.values(TypeClass)).map((combo) => {
    GException.mergeConfig({ logConstructorProblems: false });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const e = new GException(...combo.map((c) => translate(c, config)));
    return { combo, hadConstructorProblems: e.hadConstructorProblems() };
  });
  const valid: string[] = [];
  const invalid: string[] = [];
  combinations.forEach((r) => {
    const row = [r.hadConstructorProblems ? 'invalid' : 'valid', ...r.combo]
      .map((a) => a.padEnd(COL_WIDTH, ' '))
      .join(COL_SEP);
    if (r.hadConstructorProblems) {
      invalid.push(row);
    } else {
      valid.push(row);
    }
  });
  const delim = Array.from({ length: COL_WIDTH * 4 + COL_SEP.length * 3 })
    .map((_x) => '-')
    .join('');
  const resTable = [
    delim,
    ...invalid,
    delim,
    ...valid,
    delim,
    `valid:   ${valid.length} / ${combinations.length}`,
    `invalid: ${invalid.length} / ${combinations.length}`,
  ].join('\n');
  return resTable;
}
