import * as hbs from 'handlebars';
import * as crypto from 'node:crypto';
import { jsonStringifySafe } from './json-stringify-safe';
import { toArray } from './to-array';

const G_EXCEPTION_CLASS_NAME = Symbol('CLASS_NAME');
const G_EXCEPTION_OWN_PUBLIC_PROPS = Symbol('OWN_PUBLIC_PROPS');
const G_EXCEPTION_OWN_PRIVATE_PROPS = Symbol('OWN_PRIVATE_PROPS');
const G_EXCEPTION_DERIVED_PROPS = Symbol('DERIVED_PROPS');
const G_EXCEPTION_EXTENSION_PROPS = Symbol('EXTENSION_PROPS');
const G_EXCEPTION_STATIC_CONFIG = Symbol('STATIC_CONFIG');
const G_EXCEPTION_HAD_PROBLEMS = Symbol('HAD_PROBLEMS');
const G_EXCEPTION_PROBLEMS_INFO_PROP_KEY = Symbol('PROBLEMS_INFO_PROP_KEY');

type GExceptionMessage = string;

type GExceptionDisplayMessage = string;

type GExceptionDisplayMessageInput = GExceptionDisplayMessage | boolean;

type GExceptionDisplayMessageResult = GExceptionDisplayMessage | undefined;

type GExceptionInfo = Record<string | symbol, unknown>;

type GExceptionInfoResult = GExceptionInfo | undefined;

type GExceptionCode = string;

type GExceptionCodeResult = GExceptionCode | undefined;

type GExceptionId = string;

type GExceptionIdResult = GExceptionId | undefined;

type GExceptionCauses = unknown[];

type GExceptionNumCode = number;

type GExceptionCausesResult = GExceptionCauses | undefined;

type GExceptionTimestamp = string;

type GExceptionTimestampResult = GExceptionTimestamp | undefined;

const MESSAGE_KEY = 'message';
const DISPLAY_MESSAGE_KEY = 'displayMessage';
const INFO_KEY = 'info';
const CODE_KEY = 'code';
const ID_KEY = 'id';
const CAUSES_KEY = 'causes';
const NUM_CODE_KEY = 'numCode';
const TIMESTAMP_KEY = 'timestamp';

interface GExceptionOwnPublicProps {
  [MESSAGE_KEY]: GExceptionMessage;
  [DISPLAY_MESSAGE_KEY]?: GExceptionDisplayMessageInput;
  [INFO_KEY]?: GExceptionInfo;
  [CODE_KEY]?: GExceptionCode;
  [ID_KEY]?: GExceptionId;
  [CAUSES_KEY]?: GExceptionCauses;
  [NUM_CODE_KEY]?: GExceptionNumCode;
  [TIMESTAMP_KEY]?: GExceptionTimestamp;
}

const OWN_PUBLIC_PROPS_KEYS_LIST = [
  MESSAGE_KEY,
  DISPLAY_MESSAGE_KEY,
  INFO_KEY,
  CODE_KEY,
  ID_KEY,
  CAUSES_KEY,
  NUM_CODE_KEY,
  TIMESTAMP_KEY,
] as unknown as Array<keyof GExceptionOwnPublicProps>;

const OWN_PUBLIC_PROPS_KEYS_MAP = Object.fromEntries(
  OWN_PUBLIC_PROPS_KEYS_LIST.map((k) => [k, k]),
) as {
  [MESSAGE_KEY]: typeof MESSAGE_KEY;
  [DISPLAY_MESSAGE_KEY]: typeof DISPLAY_MESSAGE_KEY;
  [INFO_KEY]: typeof INFO_KEY;
  [CODE_KEY]: typeof CODE_KEY;
  [ID_KEY]: typeof ID_KEY;
  [CAUSES_KEY]: typeof CAUSES_KEY;
  [NUM_CODE_KEY]: typeof NUM_CODE_KEY;
  [TIMESTAMP_KEY]: typeof TIMESTAMP_KEY;
};

const CONFIG_KEY = 'config';

interface GExceptionOwnPrivateProps {
  [CONFIG_KEY]?: Partial<GExceptionConfig>;
}

const OWN_PRIVATE_PROPS_KEYS_LIST = [CONFIG_KEY] as unknown as Array<
  keyof GExceptionOwnPrivateProps
>;

const OWN_PRIVATE_PROPS_KEYS_MAP = Object.fromEntries(
  OWN_PRIVATE_PROPS_KEYS_LIST.map((k) => [k, k]),
) as {
  [CONFIG_KEY]: typeof CONFIG_KEY;
};

type GExceptionOwnProps = GExceptionOwnPublicProps & GExceptionOwnPrivateProps;

type GExceptionTemplateHelpers_JSONHelperFn = (indent?: number) => string;

type GExceptionTemplateHelpers_CausesKey = {
  (index?: number): string;
  json: GExceptionTemplateHelpers_JSONHelperFn;
};

type GExceptionTemplateHelpers_InfoKey = {
  (keyPath?: string): string;
  json: GExceptionTemplateHelpers_JSONHelperFn;
};

interface GExceptionTemplateHelpers {
  [MESSAGE_KEY]: string;
  [DISPLAY_MESSAGE_KEY]: string;
  [INFO_KEY]: GExceptionTemplateHelpers_InfoKey;
  [CODE_KEY]: string;
  [ID_KEY]: string;
  [CAUSES_KEY]: GExceptionTemplateHelpers_CausesKey;
  [NUM_CODE_KEY]: string;
  [TIMESTAMP_KEY]: string;
}

function mkTemplateHelpersConstant(triple: boolean) {
  return Object.fromEntries(
    OWN_PUBLIC_PROPS_KEYS_LIST.flatMap((k) => {
      if ([INFO_KEY, CAUSES_KEY].includes(k)) {
        return [];
      }
      return [[k, wrapInHbsBraces(k, triple)]];
    }),
  ) as Omit<GExceptionTemplateHelpers, typeof INFO_KEY | typeof CAUSES_KEY>;
}

function mkTemplateHelpers_causes(
  triple: boolean,
): GExceptionTemplateHelpers_CausesKey {
  function templateHelper_causes(index?: number) {
    return wrapInHbsBraces(
      index === undefined ? CAUSES_KEY : `${CAUSES_KEY}.[${index}]`,
      triple,
    );
  }

  templateHelper_causes.json = (indent?: number) => {
    const ind = indent === undefined ? 0 : indent;
    return wrapInHbsBraces(`json ${CAUSES_KEY} ${ind}`, triple);
  };
  return templateHelper_causes;
}

function mkTemplateHelpers_info(
  triple: boolean,
): GExceptionTemplateHelpers_InfoKey {
  function templateHelper_info(keyPath?: string) {
    return wrapInHbsBraces(
      keyPath === undefined ? INFO_KEY : `${INFO_KEY}.${keyPath}`,
      triple,
    );
  }

  templateHelper_info.json = (indent?: number) => {
    const ind = indent === undefined ? 0 : indent;
    return wrapInHbsBraces(`json ${INFO_KEY} ${ind}`, triple);
  };
  return templateHelper_info;
}

const mkTemplateHelpers = (triple: boolean): GExceptionTemplateHelpers => {
  return {
    ...mkTemplateHelpersConstant(triple),
    [CAUSES_KEY]: mkTemplateHelpers_causes(triple),
    [INFO_KEY]: mkTemplateHelpers_info(triple),
  };
};

type GExceptionConstructorNthArgument = Partial<GExceptionOwnProps>;

type GExceptionConstructorFirstArgument = unknown[] | unknown | string;

type GExceptionConstructorSecondArgument =
  | string
  | number
  | GExceptionConstructorNthArgument;

type GExceptionConstructorThirdArgument =
  | number
  | GExceptionConstructorNthArgument;

interface GExceptionConstructorArgumentsParsed {
  hadConstructorFirstArgsProblems: boolean;
  firstArgsProblems: GExceptionConstructorFirstArgumentsProblem[];
  causes: GExceptionCauses;
  numCode: GExceptionNumCode | undefined;
  message: GExceptionMessage;
  restArgs: GExceptionConstructorNthArgument[];
  argsTaken: number;
}

interface GExceptionHandlebarsProblem {
  templatePropName: string;
  template: string;
  caught: unknown;
  problemReason: string;
}

interface GExceptionMergeInfoProblem {
  keyInInfo: string;
  problemReason: string;
  caught: unknown;
}

interface GExceptionConstructorFirstArgumentsProblem {
  problemReason: string;
  args: unknown[];
}

interface GExceptionProblemsReport {
  firstArgsProblems?: GExceptionConstructorFirstArgumentsProblem[];
  restArgsProblems?: GExceptionConstructorArgumentProblem[];
  invalidKeyProblems?: GExceptionConstructorArgumentInvalidKeyProblem[];
  handlebarsProblems?: GExceptionHandlebarsProblem[];
  mergeInfoProblems?: GExceptionMergeInfoProblem[];
}

function mkArgTypeReport(x: unknown): string {
  return [Array.isArray(x) ? `array (${x.length})` : typeof x, String(x)]
    .filter(Boolean)
    .join(' - ');
}

function isPotentialNthArgument(x: unknown): boolean {
  return !!x && typeof x === 'object' && !Array.isArray(x);
}

function parseConstructorArgumentsBackup(
  constructorArgs: GExceptionConstructorArguments,
): GExceptionConstructorArgumentsParsed {
  if (constructorArgs.length === 0) {
    const problemReason = mkProblemMessage(`Initialized with 0 arguments`);
    return {
      hadConstructorFirstArgsProblems: true,
      firstArgsProblems: [{ problemReason, args: [] }],
      argsTaken: 0,
      message: problemReason,
      numCode: undefined,
      causes: [],
      restArgs: [],
    };
  }
  const [a1, a2, a3] = constructorArgs;
  const badArgsToProcess = [a1, a2, a3].slice(0, constructorArgs.length);
  let numCode: number | undefined = undefined;
  const badArgsReport =
    badArgsToProcess.length === 1
      ? ` ${mkArgTypeReport(badArgsToProcess[0])}`
      : '\n' +
        badArgsToProcess
          .map((a, i) => {
            const t = typeof a;
            if (t === 'number') {
              numCode = a as number;
            }
            return ['-', `${i + 1}.`, mkArgTypeReport(a)].join(' ');
          })
          .join('\n');
  const unexpectedNArguments =
    badArgsToProcess.length === 1
      ? 'argument'
      : `first ${badArgsToProcess.length} arguments (of total ${constructorArgs.length})`;
  const problemReason = mkProblemMessage(
    [`Received unexpected ${unexpectedNArguments}`, badArgsReport].join(':'),
  );
  const prependToRest = badArgsToProcess.filter((a) =>
    isPotentialNthArgument(a),
  );
  return {
    hadConstructorFirstArgsProblems: true,
    firstArgsProblems: [{ problemReason, args: badArgsToProcess }],
    argsTaken: badArgsToProcess.length - prependToRest.length,
    message: problemReason,
    numCode,
    causes: [],
    restArgs: [
      ...prependToRest,
      ...constructorArgs.slice(3),
    ] as GExceptionConstructorNthArgument[],
  };
}

/**
 * valid combinations for first 3 parsing
 * [string,  !number & !string, unknown ]
 * [string,  number,            unknown ]
 * [unknown, string,            !number ]
 * [unknown, string,            number  ]
 */
function parseConstructorArguments(
  constructorArgs: GExceptionConstructorArguments,
): GExceptionConstructorArgumentsParsed {
  const [a1, a2, a3] = constructorArgs;
  const t1 = typeof a1;
  const t2 = typeof a2;
  const t3 = typeof a3;
  const noProblems = {
    firstArgsProblems: [],
    hadConstructorFirstArgsProblems: false,
  };
  if (t1 === 'string' && !['string', 'number'].includes(t2)) {
    const argsTaken = 1;
    return {
      ...noProblems,
      message: a1 as string,
      numCode: undefined,
      causes: [],
      restArgs: constructorArgs.slice(
        argsTaken,
      ) as GExceptionConstructorNthArgument[],
      argsTaken,
    };
  } else if (t1 === 'string' && t2 === 'number') {
    const argsTaken = 2;
    return {
      ...noProblems,
      message: a1 as string,
      numCode: a2 as number,
      causes: [],
      restArgs: constructorArgs.slice(
        argsTaken,
      ) as GExceptionConstructorNthArgument[],
      argsTaken,
    };
  } else if (t2 === 'string' && t3 !== 'number') {
    const argsTaken = 2;
    return {
      ...noProblems,
      message: a2 as string,
      numCode: undefined,
      causes: toArray(a1),
      restArgs: constructorArgs.slice(
        argsTaken,
      ) as GExceptionConstructorNthArgument[],
      argsTaken,
    };
  } else if (t2 === 'string' && t3 === 'number') {
    const argsTaken = 3;
    return {
      ...noProblems,
      message: a2 as string,
      numCode: a3 as number,
      causes: toArray(a1),
      restArgs: constructorArgs.slice(
        argsTaken,
      ) as GExceptionConstructorNthArgument[],
      argsTaken,
    };
  } else {
    return parseConstructorArgumentsBackup(constructorArgs);
  }
}

export type GExceptionConstructorArguments = [
  GExceptionConstructorFirstArgument,
  GExceptionConstructorSecondArgument?,
  GExceptionConstructorThirdArgument?,
  ...GExceptionConstructorNthArgument[],
];

interface GExceptionDerivedProps {
  compiledMessage?: string;
  compiledDisplayMessage?: string;
  compiledStack?: string;
}

type GExceptionDefaultExtensionProps = Record<string, unknown>;

const GEID_DELIMITER = '_';
const GEID_PREFIX = 'GEID';
const GEID_RANDOM_BYTES_NUM = 6;
const GEID_RANDOM_BYTES_ENCODING = 'hex';

function mkGEID(nowDate: Date): string {
  return [
    GEID_PREFIX,
    nowDate.getTime(),
    crypto
      .randomBytes(GEID_RANDOM_BYTES_NUM)
      .toString(GEID_RANDOM_BYTES_ENCODING),
  ].join(GEID_DELIMITER);
}

type GExceptionRecordProblemsConfig = {
  [k in keyof GExceptionProblemsReport]: boolean;
};

interface GExceptionConfig {
  handlebarsCompilation: boolean;
  logProblemsToStdout: boolean;
  problemsInfoPropKey: string | symbol;
  recordProblemsConfig: GExceptionRecordProblemsConfig;
}

const G_EXCEPTION_PROBLEMS_INFO_PROP_KEY_DEFAULT = 'G_EXCEPTION_PROBLEMS';
const G_EXCEPTION_DEFAULT_CONFIG: GExceptionConfig = {
  handlebarsCompilation: true,
  logProblemsToStdout: true,
  problemsInfoPropKey: G_EXCEPTION_PROBLEMS_INFO_PROP_KEY_DEFAULT,
  recordProblemsConfig: {
    firstArgsProblems: true,
    restArgsProblems: true,
    invalidKeyProblems: true,
    handlebarsProblems: true,
    mergeInfoProblems: true,
  },
};

interface GExceptionConstructorArgumentProblem {
  argumentNumber: number;
  problemReason: unknown;
  caught?: unknown;
  argumentValue?: unknown;
  keyInArgument?: string;
}

interface GExceptionConstructorArgumentInvalidKeyProblem {
  argumentNumber: number;
  problemReason: unknown;
  key: unknown;
  value: unknown;
}

function getSfx(n: number): string {
  switch (n) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function mkProblemMessage(s: string): string {
  return `${GException.name} problem: ${s}`;
}

function wrapInHbsBraces(s: string, triple: boolean): string {
  return triple ? `{{{${s}}}}` : `{{${s}}}`;
}

interface JsonHelperArgsParsed {
  options: any;
  indent: number;
  value: unknown;
}

function parseJsonHelperArgs(args: unknown[]): JsonHelperArgsParsed {
  const [value, maybeIndent] = args;
  const options = args[args.length - 1];
  return {
    value,
    indent: typeof maybeIndent === 'number' ? maybeIndent : 0,
    options,
  };
}

function mkHbsHelpers(self: GException) {
  return {
    json: function hbsJsonHelper(...args: unknown[]): string {
      try {
        const { value, indent, options } = parseJsonHelperArgs(args);
        return jsonStringifySafe(value, indent, {
          onCyclicReference: (key) => {
            try {
              const message = mkProblemMessage(
                [
                  `Handlebars tried to stringify a cyclic object`,
                  `- cyclic reference on key: ${key}`,
                  `- template location: ${options?.loc?.start?.line}:${options?.loc?.start?.column} - ${options?.loc?.end?.line}:${options?.loc?.end?.column}`,
                ].join('\n'),
              );
              logProblem(self, message);
            } catch (caught: unknown) {
              logProblem(self, (caught as any)?.stack || caught);
            }
          },
        });
      } catch (caught: unknown) {
        logProblem(self, (caught as any)?.stack || caught);
        return '';
      }
    },
  };
}

function logProblem(self: GException, message: string) {
  if (self.getConfig().logProblemsToStdout) {
    console.warn(message);
  }
}

function isAllowedOwnPublicPropName(propName: string): boolean {
  return propName in GException.k;
}

function isAllowedOwnPrivatePropName(propName: string): boolean {
  return propName in GException._k;
}

function initCauses(self: GException, causes?: GExceptionCauses) {
  if (causes !== undefined) {
    self.setCauses(causes);
  }
}

function initNumCode(self: GException, numCode?: number) {
  if (numCode !== undefined) {
    self.setNumCode(numCode);
  }
}

function handleInvalidKeyForExceptionPropDuringConstructor<
  K extends keyof GExceptionOwnProps,
>(
  self: GException,
  propName: K,
  propValue: GExceptionOwnProps[K],
  argumentNumber: number,
  totalArgsNumber: number,
): GException {
  const problemReason = mkProblemMessage(
    `Unexpected key in object argument ${argumentNumber} (of total ${totalArgsNumber}): ${propName} = ${propValue}`,
  );
  tryRecordProblems(self, 'invalidKeyProblems', [
    {
      key: propName,
      value: propValue,
      argumentNumber,
      problemReason,
    },
  ]);
  return self;
}

function setExceptionPropForConstructor<K extends keyof GExceptionOwnProps>(
  self: GException,
  propName: K,
  propValue: GExceptionOwnProps[K],
  argumentNumber: number,
  totalArgsNumber: number,
): GException {
  const obj = getObjForPropName(self, propName);
  if (obj === undefined) {
    handleInvalidKeyForExceptionPropDuringConstructor<K>(
      self,
      propName,
      propValue,
      argumentNumber,
      totalArgsNumber,
    );
    return self;
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  obj[propName] = propValue;
  return self;
}

function mergeInfoForConstructor(
  self: GException,
  info: GExceptionInfo,
  argumentNumber: number,
  totalArgsNumber: number,
): GException {
  const newInfo = {} as GExceptionInfo;
  for (const k in info) {
    let v;
    try {
      v = info[k];
    } catch (caught: unknown) {
      self[G_EXCEPTION_HAD_PROBLEMS] = true;
      const message = mkProblemMessage(
        `Problem accessing key ${k} in "${GException.k.info}" during processing argument ${argumentNumber} (of total ${totalArgsNumber}): ${caught}`,
      );
      tryRecordProblems(self, 'restArgsProblems', [
        {
          argumentNumber,
          problemReason: message,
        },
      ]);
      continue;
    }
    newInfo[k] = v;
  }
  const curInfo = self.getInfo() || {};
  return self.setInfo({ ...curInfo, ...newInfo });
}

function initFromArguments(
  self: GException,
  restArgs: GExceptionConstructorNthArgument[],
  argsTaken: number,
): GExceptionConstructorArgumentProblem[] {
  const problems: GExceptionConstructorArgumentProblem[] = [];

  restArgs.forEach((arg, i) => {
    const n = i + argsTaken + 1;
    const sfx = getSfx(n);
    const totalArgsN = restArgs.length + argsTaken;
    try {
      if (!isPotentialNthArgument(arg)) {
        const argType = mkArgTypeReport(arg);
        const problemReason = mkProblemMessage(
          `Unexpected type of ${n}${sfx} argument (of total ${totalArgsN}): ${argType}`,
        );

        problems.push({
          argumentNumber: n,
          argumentValue: arg,
          problemReason,
        });
        return;
      }

      for (const k in arg) {
        let v;
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          v = arg[k];
        } catch (caught: unknown) {
          const problemReason = mkProblemMessage(
            `Problem accessing key ${k} in ${n}${sfx} argument (of total ${totalArgsN}): ${caught}`,
          );
          problems.push({
            argumentNumber: n,
            problemReason,
            caught,
            keyInArgument: k,
          });
          continue;
        }
        if (k === GException.INFO_KEY) {
          mergeInfoForConstructor(self, v as GExceptionInfo, n, totalArgsN);
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          setExceptionPropForConstructor(self, k, v, n, totalArgsN);
        }
      }
    } catch (caught: unknown) {
      const problemReason = mkProblemMessage(
        `Problem processing ${n}${sfx} argument (of total ${totalArgsN}): ${caught}`,
      );
      problems.push({
        argumentNumber: n,
        argumentValue: arg,
        problemReason,
        caught,
      });
    }
  });
  return problems;
}

function getProblemsInfoPropKey(self: GException): string | symbol | null {
  if (self[G_EXCEPTION_PROBLEMS_INFO_PROP_KEY] == null) {
    const problemsPropKey = self.getConfig().problemsInfoPropKey;
    if (
      typeof problemsPropKey !== 'string' &&
      typeof problemsPropKey !== 'symbol'
    ) {
      return self[G_EXCEPTION_PROBLEMS_INFO_PROP_KEY];
    }
    self[G_EXCEPTION_PROBLEMS_INFO_PROP_KEY] = problemsPropKey;
  }
  return self[G_EXCEPTION_PROBLEMS_INFO_PROP_KEY];
}

function recordConstructorProblems(
  self: GException,
  hadConstructorFirstArgsProblems: boolean,
  firstArgsProblems: GExceptionConstructorFirstArgumentsProblem[],
  restArgsProblems: GExceptionConstructorArgumentProblem[],
) {
  const hadProblems =
    hadConstructorFirstArgsProblems ||
    firstArgsProblems.length !== 0 ||
    restArgsProblems.length !== 0;
  if (!hadProblems) {
    return;
  }
  tryRecordProblems(self, 'firstArgsProblems', firstArgsProblems);
  tryRecordProblems(self, 'restArgsProblems', restArgsProblems);
}

function initTimestamp(self: GException, nowDate: Date) {
  if (self.getTimestamp() === undefined) {
    self.setTimestamp(nowDate.toISOString());
  }
}

function initId(self: GException, nowDate: Date) {
  if (self.getId() === undefined) {
    self.setId(mkGEID(nowDate));
  }
}

function getTemplateCompilationContext(
  self: GException,
): Record<string, unknown> {
  const extensionProps =
    self[G_EXCEPTION_EXTENSION_PROPS] === null
      ? {}
      : self[G_EXCEPTION_EXTENSION_PROPS];
  return {
    ...extensionProps,
    ...self[G_EXCEPTION_OWN_PUBLIC_PROPS],
  };
}

function compileTemplate(
  self: GException,
  template: string,
  templatePropName: string,
): string {
  try {
    if (!self.getConfig().handlebarsCompilation) {
      return template;
    }
    return hbs.compile(template)(getTemplateCompilationContext(self), {
      helpers: mkHbsHelpers(self),
    });
  } catch (caught: unknown) {
    const problemReason = mkProblemMessage(
      [
        `Problem during handlebars compilation of template "${templatePropName}"`,
        `- template: ${template}`,
        `- caught: ${caught}`,
      ].join('\n'),
    );
    tryRecordProblems(self, 'handlebarsProblems', [
      {
        problemReason,
        templatePropName,
        template,
        caught,
      },
    ]);
    return template;
  }
}

function getObjForPropName<K extends keyof GExceptionOwnProps>(
  self: GException,
  propName: K,
): K extends keyof GExceptionOwnProps
  ? GExceptionOwnProps
  : K extends keyof GExceptionOwnPrivateProps
  ? GExceptionOwnPrivateProps
  : undefined {
  if (isAllowedOwnPublicPropName(propName)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return self[G_EXCEPTION_OWN_PUBLIC_PROPS];
  } else if (isAllowedOwnPrivatePropName(propName)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return self[G_EXCEPTION_OWN_PRIVATE_PROPS];
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return undefined;
}

function setExceptionProp<K extends keyof GExceptionOwnProps>(
  self: GException,
  propName: K,
  propValue: K extends keyof GExceptionOwnProps
    ? GExceptionOwnProps[K]
    : K extends keyof GExceptionOwnPrivateProps
    ? GExceptionOwnPrivateProps[K]
    : unknown,
): GException {
  const obj = getObjForPropName(self, propName);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  obj[propName] = propValue;
  return self;
}

function tryRecordProblems<K extends keyof GExceptionProblemsReport>(
  self: GException,
  problemCategory: K,
  problems: GExceptionProblemsReport[K],
): GException {
  problems?.forEach((p: any) => {
    if (p?.problemReason) {
      logProblem(self, p?.problemReason);
    }
  });
  self[G_EXCEPTION_HAD_PROBLEMS] = true;
  if (
    !self.getConfig().recordProblemsConfig[problemCategory] ||
    !problems ||
    problems.length === 0
  ) {
    return self;
  }
  const problemsPropKey = getProblemsInfoPropKey(self);
  if (problemsPropKey === null) {
    return self;
  }
  const curProblems = (self.getProblems() || {}) as GExceptionProblemsReport;
  const problemsArray = (curProblems[problemCategory] ||
    []) as GExceptionProblemsReport[K];
  const newProblems = {
    ...curProblems,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    [problemCategory]: [...problemsArray, ...problems],
  };
  self.setInfoProp(problemsPropKey, newProblems);
  return self;
}

export class GException<
  ExtensionProps extends GExceptionDefaultExtensionProps = GExceptionDefaultExtensionProps,
> extends Error {
  /**
   * Own Props Keys
   */

  static readonly MESSAGE_KEY = MESSAGE_KEY;
  static readonly DISPLAY_MESSAGE_KEY = DISPLAY_MESSAGE_KEY;
  static readonly INFO_KEY = INFO_KEY;
  static readonly CODE_KEY = CODE_KEY;
  static readonly ID_KEY = ID_KEY;
  static readonly CAUSES_KEY = CAUSES_KEY;
  static readonly NUM_CODE_KEY = NUM_CODE_KEY;
  static readonly TIMESTAMP_KEY = TIMESTAMP_KEY;

  static readonly k = OWN_PUBLIC_PROPS_KEYS_MAP;

  static readonly CONFIG_KEY = CONFIG_KEY;

  static readonly _k = OWN_PRIVATE_PROPS_KEYS_MAP;

  /**
   * Templating helpers
   */

  static t = mkTemplateHelpers(false);
  static _tt = mkTemplateHelpers(true);

  /**
   * Static Config
   */

  static readonly G_EXCEPTION_DEFAULT_CONFIG = G_EXCEPTION_DEFAULT_CONFIG;
  static [G_EXCEPTION_STATIC_CONFIG]: GExceptionConfig =
    GException.G_EXCEPTION_DEFAULT_CONFIG;

  static setConfig(config: GExceptionConfig): void {
    GException[G_EXCEPTION_STATIC_CONFIG] = {
      ...config,
      recordProblemsConfig: { ...config.recordProblemsConfig },
    };
  }

  static mergeConfig(config: Partial<GExceptionConfig>): void {
    const curConfig = GException[G_EXCEPTION_STATIC_CONFIG];
    GException[G_EXCEPTION_STATIC_CONFIG] = Object.assign(curConfig, config, {
      recordProblems: Object.assign(
        curConfig.recordProblemsConfig,
        config.recordProblemsConfig,
      ),
    });
  }

  static getConfig(): GExceptionConfig {
    return GException[G_EXCEPTION_STATIC_CONFIG];
  }

  /**
   * Private Fields
   */

  private readonly [G_EXCEPTION_CLASS_NAME]: string;
  private readonly [G_EXCEPTION_OWN_PUBLIC_PROPS]: GExceptionOwnPublicProps;
  private readonly [G_EXCEPTION_OWN_PRIVATE_PROPS]: GExceptionOwnPrivateProps;
  private readonly [G_EXCEPTION_DERIVED_PROPS]: GExceptionDerivedProps;
  private [G_EXCEPTION_EXTENSION_PROPS]: ExtensionProps | null;
  private [G_EXCEPTION_PROBLEMS_INFO_PROP_KEY]: string | symbol | null = null;
  private [G_EXCEPTION_HAD_PROBLEMS] = false;

  /**
   * Constructor Variants
   */

  constructor(...constructorArgs: GExceptionConstructorArguments) {
    const nowDate = new Date();
    const {
      causes,
      message,
      numCode,
      firstArgsProblems,
      restArgs,
      argsTaken,
      hadConstructorFirstArgsProblems,
    } = parseConstructorArguments(constructorArgs);
    super(message);
    this[G_EXCEPTION_CLASS_NAME] = Object.getPrototypeOf(this).constructor.name;
    this[G_EXCEPTION_OWN_PRIVATE_PROPS] = {};
    this[G_EXCEPTION_OWN_PUBLIC_PROPS] = { message };
    this[G_EXCEPTION_DERIVED_PROPS] = {};
    this[G_EXCEPTION_EXTENSION_PROPS] = null;
    initCauses(this, causes);
    initNumCode(this, numCode);
    initTimestamp(this, nowDate);
    initId(this, nowDate);
    const restArgsProblems = initFromArguments(this, restArgs, argsTaken);
    recordConstructorProblems(
      this,
      hadConstructorFirstArgsProblems,
      firstArgsProblems,
      restArgsProblems,
    );
  }

  static from(exceptionProperties: GExceptionOwnProps): GException {
    return new this(exceptionProperties.message, exceptionProperties);
  }

  // Might want to override this in extended types for proper typing
  static new(...constructorArgs: GExceptionConstructorArguments): GException {
    return new this(...constructorArgs);
  }

  /**
   * Type Predicates
   */

  // at the very least obj is GException
  static isSubtype(obj: unknown): obj is GException {
    return (
      typeof obj === 'object' &&
      obj != null &&
      typeof (obj as GException)?.[G_EXCEPTION_CLASS_NAME] === 'string' &&
      obj instanceof this
    );
  }

  // at the very least obj is GException
  static isExactly(obj: unknown): obj is GException {
    return (
      this.isSubtype(obj) &&
      (obj as GException)?.[G_EXCEPTION_CLASS_NAME] === this.name
    );
  }

  /**
   * Getters & Setters
   */

  setInfoProp<T = unknown>(k: string | symbol, v: T): this {
    if (this.getInfo() === undefined) {
      this.setInfo({ [k]: v });
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this[G_EXCEPTION_OWN_PUBLIC_PROPS].info[k] = v;
    }
    return this;
  }

  getInfoProp(k: string): undefined | unknown {
    return this.getInfo()?.[k];
  }

  getMessage(): GExceptionMessage {
    if (this[G_EXCEPTION_DERIVED_PROPS].compiledMessage === undefined) {
      this[G_EXCEPTION_DERIVED_PROPS].compiledMessage = compileTemplate(
        this,
        this[G_EXCEPTION_OWN_PUBLIC_PROPS][GException.MESSAGE_KEY],
        GException.MESSAGE_KEY,
      );
    }
    return this[G_EXCEPTION_DERIVED_PROPS].compiledMessage;
  }

  getStack(): string | undefined {
    if (!this.stack) {
      return this.stack;
    }
    if (this[G_EXCEPTION_DERIVED_PROPS].compiledStack === undefined) {
      this[G_EXCEPTION_DERIVED_PROPS].compiledStack = compileTemplate(
        this,
        this.stack,
        'stack',
      );
    }
    return this[G_EXCEPTION_DERIVED_PROPS].compiledStack;
  }

  setDisplayMessage(
    displayMessage: GExceptionDisplayMessageInput = true,
  ): this {
    return setExceptionProp(
      this,
      GException.DISPLAY_MESSAGE_KEY,
      displayMessage,
    ) as this;
  }

  getDisplayMessage(): GExceptionDisplayMessageResult {
    if (
      typeof this[G_EXCEPTION_OWN_PUBLIC_PROPS].displayMessage !== 'string' &&
      [undefined, false].includes(
        this[G_EXCEPTION_OWN_PUBLIC_PROPS].displayMessage,
      )
    ) {
      return undefined;
    } else if (this[G_EXCEPTION_OWN_PUBLIC_PROPS].displayMessage === true) {
      return this.getMessage();
    }
    if (this[G_EXCEPTION_DERIVED_PROPS].compiledDisplayMessage === undefined) {
      this[G_EXCEPTION_DERIVED_PROPS].compiledDisplayMessage = compileTemplate(
        this,
        this[G_EXCEPTION_OWN_PUBLIC_PROPS][
          GException.DISPLAY_MESSAGE_KEY
        ] as string,
        GException.DISPLAY_MESSAGE_KEY,
      );
    }
    return this[G_EXCEPTION_DERIVED_PROPS].compiledDisplayMessage;
  }

  setInfo(info: GExceptionInfo): this {
    return setExceptionProp(this, INFO_KEY, info) as this;
  }

  mergeInfo(info: Partial<GExceptionInfo>): this {
    const newInfo = {} as GExceptionInfo;
    for (const k in info) {
      let v;
      try {
        v = info[k];
      } catch (caught: unknown) {
        const problemReason = mkProblemMessage(
          `Problem accessing key ${k} in "${GException.k.info}" during mergeInfo: ${caught}`,
        );
        tryRecordProblems(this, 'mergeInfoProblems', [
          {
            keyInInfo: k,
            caught,
            problemReason,
          },
        ]);
        continue;
      }
      newInfo[k] = v;
    }
    const curInfo = this.getInfo() || {};
    return this.setInfo({ ...curInfo, ...newInfo });
  }

  getInfo(): GExceptionInfoResult {
    return this[G_EXCEPTION_OWN_PUBLIC_PROPS][GException.INFO_KEY];
  }

  setCode(code: GExceptionCode): this {
    return setExceptionProp(this, GException.CODE_KEY, code) as this;
  }

  getCode(): GExceptionCodeResult {
    return this[G_EXCEPTION_OWN_PUBLIC_PROPS][GException.CODE_KEY];
  }

  setId(id: GExceptionId): this {
    return setExceptionProp(this, GException.ID_KEY, id) as this;
  }

  getId(): GExceptionIdResult {
    return this[G_EXCEPTION_OWN_PUBLIC_PROPS][GException.ID_KEY];
  }

  setCauses(causes: GExceptionCauses): this {
    return setExceptionProp(this, GException.CAUSES_KEY, causes) as this;
  }

  getCauses(): GExceptionCausesResult {
    return this[G_EXCEPTION_OWN_PUBLIC_PROPS][GException.CAUSES_KEY];
  }

  setNumCode(numCode: number): this {
    return setExceptionProp(this, GException.NUM_CODE_KEY, numCode) as this;
  }

  getNumCode() {
    return this[G_EXCEPTION_OWN_PUBLIC_PROPS][GException.NUM_CODE_KEY];
  }

  setTimestamp(timestamp?: string): this {
    return setExceptionProp(
      this,
      GException.TIMESTAMP_KEY,
      timestamp || new Date().toISOString(),
    ) as this;
  }

  getTimestamp(): GExceptionTimestampResult {
    return this[G_EXCEPTION_OWN_PUBLIC_PROPS][GException.TIMESTAMP_KEY];
  }

  protected setExtensionProp<K extends keyof ExtensionProps>(
    k: K,
    v: ExtensionProps[K],
  ): this {
    if (this[G_EXCEPTION_EXTENSION_PROPS] === null) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this[G_EXCEPTION_EXTENSION_PROPS] = { [k]: v };
    } else {
      this[G_EXCEPTION_EXTENSION_PROPS][k] = v;
    }
    return this;
  }

  protected getExtensionProp<K extends keyof ExtensionProps>(
    k: K,
  ): undefined | ExtensionProps[K] {
    if (this[G_EXCEPTION_EXTENSION_PROPS] === null) {
      return undefined;
    }
    return this[G_EXCEPTION_EXTENSION_PROPS][k];
  }

  hadProblems(): boolean {
    return this[G_EXCEPTION_HAD_PROBLEMS];
  }

  getProblems(): GExceptionProblemsReport | undefined {
    if (
      !this.hadProblems() ||
      typeof getProblemsInfoPropKey(this) !== 'string'
    ) {
      return undefined;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.getInfo()?.[getProblemsInfoPropKey(this)];
  }

  setConfig(config: Partial<GExceptionConfig>): this {
    return setExceptionProp(this, GException.CONFIG_KEY, config) as this;
  }

  mergeConfig(config: Partial<GExceptionConfig>): this {
    const curConfig =
      this[G_EXCEPTION_OWN_PRIVATE_PROPS]?.[GException.CONFIG_KEY] || {};
    this[G_EXCEPTION_OWN_PRIVATE_PROPS][GException.CONFIG_KEY] = curConfig;
    Object.assign(curConfig, config, {
      recordProblems: Object.assign(
        {},
        curConfig.recordProblemsConfig || {},
        config.recordProblemsConfig,
      ),
    });
    return this;
  }

  getConfig(): GExceptionConfig {
    const thisConfig =
      this[G_EXCEPTION_OWN_PRIVATE_PROPS]?.[GException.CONFIG_KEY] || {};
    return {
      ...GException.getConfig(),
      ...thisConfig,
      recordProblemsConfig: {
        ...GException.getConfig().recordProblemsConfig,
        ...thisConfig.recordProblemsConfig,
      },
    };
  }
}
