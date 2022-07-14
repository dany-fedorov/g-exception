import { GException } from '../../src';

const NO_ARG = Symbol('NO_ARG');

function mkCombinations(
  valuesInput: string[],
): ((string | symbol)[] | string[])[] {
  const values = [...valuesInput, NO_ARG];
  return values
    .flatMap((v0) => {
      return values.flatMap((v1) => {
        return values.map((v2) => {
          return [v0, v1, v2];
        });
      });
    })
    .filter((combo) => {
      const [a1, a2, a3] = combo;
      return (
        (a1 !== NO_ARG && a2 !== NO_ARG && a3 !== NO_ARG) ||
        (a1 !== NO_ARG && a2 !== NO_ARG && a3 === NO_ARG) ||
        (a1 !== NO_ARG && a2 === NO_ARG && a3 === NO_ARG) ||
        (a1 === NO_ARG && a2 === NO_ARG && a3 === NO_ARG)
      );
    });
}

enum TypeClass {
  STRING = 'string',
  NUMBER = 'number',
  OBJECT = 'object',
  NOT_NUMBER_NOT_STRING_NOT_OBJECT = 'else',
}

type TranslateConfig = {
  [TypeClass.STRING]: string;
  [TypeClass.NUMBER]: number;
  [TypeClass.OBJECT]: object;
  [TypeClass.NOT_NUMBER_NOT_STRING_NOT_OBJECT]: unknown;
};

function translate(tc: TypeClass, config: TranslateConfig): unknown {
  return config[tc];
}

const COL_WIDTH = 20;
const COL_SEP = ' | ';

const TABLE_DELIM = Array.from({ length: COL_WIDTH * 5 + COL_SEP.length * 4 })
  .map((_x) => '-')
  .join('');

const NO_ARG_TEXT_REPRESENTATION = '--';

export function evalConstructorArgumentsCombinations(config: TranslateConfig): {
  tableString: string;
} {
  const combinations = mkCombinations(Object.values(TypeClass)).map((combo) => {
    const e = new GException(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ...combo.filter((c) => c !== NO_ARG).map((c) => translate(c, config)),
    );
    return {
      combo,
      hadConstructorFirstArgsProblems: e.hadProblems(),
    };
  });
  const validRows: string[] = [];
  const invalidRows: string[] = [];
  combinations.forEach((r, combinationIndex) => {
    const row1 = [
      r.hadConstructorFirstArgsProblems ? 'invalid' : 'valid',
      combinationIndex,
      ...r.combo,
    ]
      .map((a) =>
        String(a === NO_ARG ? NO_ARG_TEXT_REPRESENTATION : a).padEnd(
          COL_WIDTH,
          ' ',
        ),
      )
      .join(COL_SEP);
    const row2 = [
      r.hadConstructorFirstArgsProblems ? 'invalid' : 'valid',
      combinationIndex,
      ...r.combo.map((c) =>
        c === NO_ARG
          ? NO_ARG_TEXT_REPRESENTATION
          : translate(c as TypeClass, config),
      ),
    ]
      .map((a) => String(a).padEnd(COL_WIDTH, ' '))
      .join(COL_SEP);
    if (r.hadConstructorFirstArgsProblems) {
      invalidRows.push(row1);
      invalidRows.push(row2);
      invalidRows.push(TABLE_DELIM);
    } else {
      validRows.push(row1);
      validRows.push(row2);
      validRows.push(TABLE_DELIM);
    }
  });
  const invalidReport = `invalid: ${invalidRows.length / 3} / ${
    combinations.length
  }`;
  const validReport = `valid:   ${validRows.length / 3} / ${
    combinations.length
  }`;
  const tableString = [
    'Translate Config:',
    JSON.stringify(config),
    TABLE_DELIM,
    invalidReport,
    validReport,
    TABLE_DELIM,
    ...invalidRows,
    TABLE_DELIM,
    ...validRows,
    TABLE_DELIM,
    invalidReport,
    validReport + '|',
  ].join('|\n');
  return { tableString };
}
