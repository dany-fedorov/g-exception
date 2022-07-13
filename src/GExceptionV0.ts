import * as hbs from 'handlebars';
import * as crypto from 'node:crypto';
import { jsonStringifySafe } from './json-stringify-safe';

export function toArray<T>(x: T | T[]): T[] {
  if (Array.isArray(x)) {
    return x;
  }
  return [x];
}

const G_EXCEPTION_CLASS_NAME = Symbol('CLASS_NAME');
const G_EXCEPTION_OWN_PUBLIC_PROPS = Symbol('OWN_PUBLIC_PROPS');
const G_EXCEPTION_OWN_PRIVATE_PROPS = Symbol('OWN_PRIVATE_PROPS');
const G_EXCEPTION_DERIVED_PROPS = Symbol('DERIVED_PROPS');
const G_EXCEPTION_EXTENSION_PROPS = Symbol('EXTENSION_PROPS');
const G_EXCEPTION_STATIC_CONFIG = Symbol('STATIC_CONFIG');
const G_EXCEPTION_HAD_PROBLEMS = Symbol('HAD_PROBLEMS');
const G_EXCEPTION_PROBLEMS_INFO_PROP_KEY = Symbol(
  'CONSTRUCTOR_PROBLEMS_INFO_PROP_KEY',
);

type GExceptionMessage = string;

type GExceptionDisplayMessage = string;

type GExceptionDisplayMessageInput = GExceptionDisplayMessage | boolean;

type GExceptionDisplayMessageResult = GExceptionDisplayMessage | undefined;

type GExceptionInfo = Record<string, unknown>;

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

const OWN_PUBLIC_PROPS_KEYS = [
  MESSAGE_KEY,
  DISPLAY_MESSAGE_KEY,
  INFO_KEY,
  CODE_KEY,
  ID_KEY,
  CAUSES_KEY,
  NUM_CODE_KEY,
  TIMESTAMP_KEY,
] as unknown as Array<keyof GExceptionOwnPublicProps>;

const CONFIG_KEY = 'config';

interface GExceptionOwnPrivateProps {
  [CONFIG_KEY]?: Partial<GExceptionConfig>;
}

const OWN_PRIVATE_PROPS_KEYS = [CONFIG_KEY] as unknown as Array<
  keyof GExceptionOwnPrivateProps
>;

type GExceptionOwnProps = GExceptionOwnPublicProps & GExceptionOwnPrivateProps;

type GExceptionTemplateHelpers_CausesKey = {
  (index?: number): string;
  json: string;
};

type GExceptionTemplateHelpers_InfoKey = {
  (keyPath?: string): string;
  json: string;
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
    OWN_PUBLIC_PROPS_KEYS.flatMap((k) => {
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

  templateHelper_causes.json = wrapInHbsBraces(`json ${CAUSES_KEY}`, triple);
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

  templateHelper_info.json = wrapInHbsBraces(`json ${INFO_KEY}`, triple);
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
  problematicFirstArgs: unknown[];
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
}

interface GExceptionProblemsReport {
  firstArgsProblems?: unknown[];
  restArgsProblems?: GExceptionConstructorArgumentProblem[];
  invalidKeyProblems?: GExceptionConstructorArgumentInvalidKeyProblem[];
  handlebarsProblems?: GExceptionHandlebarsProblem[];
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
    return {
      hadConstructorFirstArgsProblems: true,
      problematicFirstArgs: [],
      argsTaken: 0,
      message: mkConstructorProblemMessage(`Initialized with 0 arguments`),
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
  const message = mkConstructorProblemMessage(
    [`Received unexpected ${unexpectedNArguments}`, badArgsReport].join(':'),
  );
  if (GExceptionV0.getConfig().logProblemsToStdout) {
    console.warn(message);
  }
  const prependToRest = badArgsToProcess.filter((a) =>
    isPotentialNthArgument(a),
  );
  return {
    hadConstructorFirstArgsProblems: true,
    problematicFirstArgs: badArgsToProcess,
    argsTaken: badArgsToProcess.length - prependToRest.length,
    message,
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
    problematicFirstArgs: [],
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

interface GExceptionConfig {
  handlebarsCompilation: boolean;
  logProblemsToStdout: boolean;
  problemsInfoPropKey: string;
  recordConstructorProblems: boolean;
  recordHandlebarsCompilationProblems: boolean;
}

const G_EXCEPTION_PROBLEMS_INFO_PROP_KEY_DEFAULT = 'G_EXCEPTION_PROBLEMS';
const G_EXCEPTION_DEFAULT_CONFIG: GExceptionConfig = {
  handlebarsCompilation: true,
  logProblemsToStdout: true,
  problemsInfoPropKey: G_EXCEPTION_PROBLEMS_INFO_PROP_KEY_DEFAULT,
  recordConstructorProblems: true,
  recordHandlebarsCompilationProblems: true,
};

interface GExceptionConstructorArgumentProblem {
  argumentNumber: number;
  problemReason: unknown;
  caught?: unknown;
  argumentValue: unknown;
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

function mkConstructorProblemMessage(s: string): string {
  return `${GExceptionV0.name} constructor problem: ${s}`;
}

function wrapInHbsBraces(s: string, triple: boolean): string {
  return triple ? `{{{${s}}}}` : `{{${s}}}`;
}

const HBS_HELPERS = {
  json: function hbsJsonHelper(context: unknown): string {
    return jsonStringifySafe(context);
  },
};

function logProblem(self: GExceptionV0, message: string) {
  if (self.getEffectiveConfig().logProblemsToStdout) {
    console.warn(message);
  }
}

function isAllowedOwnPublicPropName(propName: string): boolean {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return GExceptionV0.OWN_PUBLIC_PROPS_KEYS.includes(propName);
}

function isAllowedOwnPrivatePropName(propName: string): boolean {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return GExceptionV0.OWN_PRIVATE_PROPS_KEYS.includes(propName);
}

function initCauses(self: GExceptionV0, causes?: GExceptionCauses) {
  if (causes !== undefined) {
    self.setCauses(causes);
  }
}

function initNumCode(self: GExceptionV0, numCode?: number) {
  if (numCode !== undefined) {
    self.setNumCode(numCode);
  }
}

function handleInvalidKeyForExceptionPropDuringConstructor<
  K extends keyof GExceptionOwnProps,
>(
  self: GExceptionV0,
  propName: K,
  propValue: GExceptionOwnProps[K],
  argumentNumber: number,
  totalArgsNumber: number,
): GExceptionV0 {
  self[G_EXCEPTION_HAD_PROBLEMS] = true;
  const problemsPropKey = getProblemsInfoPropKey(self);
  if (typeof problemsPropKey !== 'string') {
    return self;
  }
  const problemsReport = (self.getProblems() || {}) as GExceptionProblemsReport;
  const problemReason = mkConstructorProblemMessage(
    `Unexpected key in object argument ${argumentNumber} (of total ${totalArgsNumber}): ${propName} = ${propValue}`,
  );
  logProblem(self, problemReason);
  const newProblemsReport: GExceptionProblemsReport = {
    ...problemsReport,
    invalidKeyProblems: [
      ...(!problemsReport.invalidKeyProblems
        ? []
        : (problemsReport.invalidKeyProblems as GExceptionConstructorArgumentInvalidKeyProblem[])),
      {
        key: propName,
        value: propValue,
        argumentNumber,
        problemReason,
      },
    ],
  };
  self.setInfoProp(problemsPropKey, newProblemsReport);
  return self;
}

function setExceptionPropForConstructor<K extends keyof GExceptionOwnProps>(
  self: GExceptionV0,
  propName: K,
  propValue: GExceptionOwnProps[K],
  argumentNumber: number,
  totalArgsNumber: number,
): GExceptionV0 {
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

function initFromArguments(
  self: GExceptionV0,
  restArgs: GExceptionConstructorNthArgument[],
  argsTaken: number,
): GExceptionConstructorArgumentProblem[] {
  const problems: GExceptionConstructorArgumentProblem[] = [];

  function pushProblem(
    message: string,
    p: GExceptionConstructorArgumentProblem,
  ) {
    logProblem(self, message);
    problems.push(p);
  }

  restArgs.forEach((arg, i) => {
    const n = i + argsTaken + 1;
    const sfx = getSfx(n);
    const totalArgsN = restArgs.length + argsTaken;
    try {
      if (!isPotentialNthArgument(arg)) {
        const argType = mkArgTypeReport(arg);
        const message = mkConstructorProblemMessage(
          `Unexpected type of ${n}${sfx} argument (of total ${totalArgsN}): ${argType}`,
        );
        pushProblem(message, {
          argumentNumber: n,
          argumentValue: arg,
          problemReason: message,
        });
        return;
      }

      for (const k in arg) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const v = arg[k];
        if (k === GExceptionV0.INFO_KEY) {
          self.mergeIntoInfo(v as GExceptionInfo);
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          setExceptionPropForConstructor(self, k, v, n, totalArgsN);
        }
      }
    } catch (caught) {
      const message = mkConstructorProblemMessage(
        `Problem processing ${n}${sfx} argument (of total ${totalArgsN}): ${caught}`,
      );
      pushProblem(message, {
        argumentNumber: n,
        argumentValue: arg,
        problemReason: message,
        caught,
      });
    }
  });
  return problems;
}

function getProblemsInfoPropKey(self: GExceptionV0): string | null {
  if (self[G_EXCEPTION_PROBLEMS_INFO_PROP_KEY] == null) {
    const problemsPropKey = self.getEffectiveConfig().problemsInfoPropKey;
    if (typeof problemsPropKey !== 'string') {
      return self[G_EXCEPTION_PROBLEMS_INFO_PROP_KEY];
    }
    self[G_EXCEPTION_PROBLEMS_INFO_PROP_KEY] = problemsPropKey;
  }
  return self[G_EXCEPTION_PROBLEMS_INFO_PROP_KEY];
}

function recordConstructorProblems(
  self: GExceptionV0,
  hadConstructorFirstArgsProblems: boolean,
  firstArgsProblems: unknown[],
  restArgsProblems: GExceptionConstructorArgumentProblem[],
) {
  const hadProblems =
    hadConstructorFirstArgsProblems ||
    firstArgsProblems.length !== 0 ||
    restArgsProblems.length !== 0;
  if (!hadProblems) {
    return;
  }
  self[G_EXCEPTION_HAD_PROBLEMS] = hadProblems;
  if (!self.getEffectiveConfig().recordConstructorProblems) {
    return;
  }
  const problemsPropKey = getProblemsInfoPropKey(self);
  if (typeof problemsPropKey !== 'string') {
    return;
  }
  const problemsReport = (self.getProblems() || {}) as GExceptionProblemsReport;
  const newProblemsReport: GExceptionProblemsReport = {
    ...problemsReport,
    ...(firstArgsProblems.length === 0 ? {} : { firstArgsProblems }),
    ...(restArgsProblems.length === 0 ? {} : { restArgsProblems }),
  };
  self.setInfoProp(problemsPropKey, newProblemsReport);
}

function initTimestamp(self: GExceptionV0, nowDate: Date) {
  if (self.getTimestamp() === undefined) {
    self.setTimestamp(nowDate.toISOString());
  }
}

function initId(self: GExceptionV0, nowDate: Date) {
  if (self.getId() === undefined) {
    self.setId(mkGEID(nowDate));
  }
}

function getTemplateCompilationContext(
  self: GExceptionV0,
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
  self: GExceptionV0,
  template: string,
  templatePropName: string,
): string {
  try {
    if (!self.getEffectiveConfig().handlebarsCompilation) {
      return template;
    }
    return hbs.compile(template)(getTemplateCompilationContext(self), {
      helpers: HBS_HELPERS,
    });
  } catch (caught) {
    self[G_EXCEPTION_HAD_PROBLEMS] = true;
    const message = mkConstructorProblemMessage(
      [
        `Problem during handlebars compilation of template "${templatePropName}"`,
        `- template: ${template}`,
        `- caught: ${caught}`,
      ].join('\n'),
    );
    logProblem(self, message);
    if (self.getEffectiveConfig().recordHandlebarsCompilationProblems) {
      const problemsPropKey = getProblemsInfoPropKey(self);
      if (typeof problemsPropKey === 'string') {
        const problemsReport = (self.getProblems() ||
          {}) as GExceptionProblemsReport;
        const newProblemsReport: GExceptionProblemsReport = {
          ...problemsReport,
          handlebarsProblems: [
            ...(!problemsReport.handlebarsProblems
              ? []
              : problemsReport.handlebarsProblems),
            {
              templatePropName,
              template,
              caught,
            },
          ],
        };
        self.setInfoProp(problemsPropKey, newProblemsReport);
      }
    }
    return template;
  }
}

function getObjForPropName<K extends keyof GExceptionOwnProps>(
  self: GExceptionV0,
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

export class GExceptionV0<
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

  static readonly OWN_PUBLIC_PROPS_KEYS = OWN_PUBLIC_PROPS_KEYS;

  static readonly CONFIG_KEY = CONFIG_KEY;

  static readonly OWN_PRIVATE_PROPS_KEYS = OWN_PRIVATE_PROPS_KEYS;

  /**
   * Templating helpers
   */

  static t = mkTemplateHelpers(false);
  static _tt = mkTemplateHelpers(true);

  /**
   * Static Config
   */

  static [G_EXCEPTION_STATIC_CONFIG]: GExceptionConfig =
    G_EXCEPTION_DEFAULT_CONFIG;

  static setConfig(config: GExceptionConfig): void {
    GExceptionV0[G_EXCEPTION_STATIC_CONFIG] = config;
  }

  static mergeConfig(config: Partial<GExceptionConfig>): void {
    Object.assign(GExceptionV0[G_EXCEPTION_STATIC_CONFIG], config);
  }

  static getConfig(): GExceptionConfig {
    return GExceptionV0[G_EXCEPTION_STATIC_CONFIG];
  }

  /**
   * Private Fields
   */

  private readonly [G_EXCEPTION_CLASS_NAME]: string;
  private readonly [G_EXCEPTION_OWN_PUBLIC_PROPS]: GExceptionOwnPublicProps;
  private readonly [G_EXCEPTION_OWN_PRIVATE_PROPS]: GExceptionOwnPrivateProps;
  private readonly [G_EXCEPTION_DERIVED_PROPS]: GExceptionDerivedProps;
  private [G_EXCEPTION_EXTENSION_PROPS]: ExtensionProps | null;
  private [G_EXCEPTION_PROBLEMS_INFO_PROP_KEY]: string | null = null;
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
      problematicFirstArgs,
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
      problematicFirstArgs,
      restArgsProblems,
    );
  }

  static from(exceptionProperties: GExceptionOwnProps): GExceptionV0 {
    return new GExceptionV0(exceptionProperties.message, exceptionProperties);
  }

  static new(...constructorArgs: GExceptionConstructorArguments): GExceptionV0 {
    return new GExceptionV0(...constructorArgs);
  }

  /**
   * Type Predicates
   */

  static is(obj: unknown): obj is GExceptionV0 {
    return (
      typeof obj === 'object' &&
      obj != null &&
      typeof (obj as GExceptionV0)?.[G_EXCEPTION_CLASS_NAME] === 'string'
    );
  }

  static isExactly(obj: unknown): obj is GExceptionV0 {
    return (
      GExceptionV0.is(obj) &&
      (obj as GExceptionV0)?.[G_EXCEPTION_CLASS_NAME] === GExceptionV0.name
    );
  }

  /**
   * Getters & Setters
   */

  protected setExceptionProp<K extends keyof GExceptionOwnProps>(
    propName: K,
    propValue: K extends keyof GExceptionOwnProps
      ? GExceptionOwnProps[K]
      : K extends keyof GExceptionOwnPrivateProps
      ? GExceptionOwnPrivateProps[K]
      : unknown,
  ): this {
    const obj = getObjForPropName(this, propName);
    if (obj === undefined) {
      return this;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    obj[propName] = propValue;
    return this;
  }

  setInfoProp<T = unknown>(k: string, v: T): this {
    if (this.getInfo() === undefined) {
      this.setInfo({ [k]: v });
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this[G_EXCEPTION_OWN_PUBLIC_PROPS].info[k] = v;
    }
    return this;
  }

  mergeIntoInfo(info: GExceptionInfo): this {
    this[G_EXCEPTION_OWN_PUBLIC_PROPS][GExceptionV0.INFO_KEY] =
      this.getInfo() || {};
    Object.assign(
      this[G_EXCEPTION_OWN_PUBLIC_PROPS][GExceptionV0.INFO_KEY] as object,
      info,
    );
    return this;
  }

  getInfoProp(k: string): undefined | unknown {
    return this.getInfo()?.[k];
  }

  getMessage(): GExceptionMessage {
    if (this[G_EXCEPTION_DERIVED_PROPS].compiledMessage === undefined) {
      this[G_EXCEPTION_DERIVED_PROPS].compiledMessage = compileTemplate(
        this,
        this[G_EXCEPTION_OWN_PUBLIC_PROPS][GExceptionV0.MESSAGE_KEY],
        GExceptionV0.MESSAGE_KEY,
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
    return this.setExceptionProp(
      GExceptionV0.DISPLAY_MESSAGE_KEY,
      displayMessage,
    );
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
          GExceptionV0.DISPLAY_MESSAGE_KEY
        ] as string,
        GExceptionV0.DISPLAY_MESSAGE_KEY,
      );
    }
    return this[G_EXCEPTION_DERIVED_PROPS].compiledDisplayMessage;
  }

  setInfo(info: GExceptionInfo): this {
    return this.setExceptionProp(INFO_KEY, info);
  }

  getInfo(): GExceptionInfoResult {
    return this[G_EXCEPTION_OWN_PUBLIC_PROPS][GExceptionV0.INFO_KEY];
  }

  setCode(code: GExceptionCode): this {
    return this.setExceptionProp(GExceptionV0.CODE_KEY, code);
  }

  getCode(): GExceptionCodeResult {
    return this[G_EXCEPTION_OWN_PUBLIC_PROPS][GExceptionV0.CODE_KEY];
  }

  setId(id: GExceptionId) {
    return this.setExceptionProp(GExceptionV0.ID_KEY, id);
  }

  getId(): GExceptionIdResult {
    return this[G_EXCEPTION_OWN_PUBLIC_PROPS][GExceptionV0.ID_KEY];
  }

  setCauses(causes: GExceptionCauses) {
    return this.setExceptionProp(GExceptionV0.CAUSES_KEY, causes);
  }

  getCauses(): GExceptionCausesResult {
    return this[G_EXCEPTION_OWN_PUBLIC_PROPS][GExceptionV0.CAUSES_KEY];
  }

  setNumCode(numCode: number) {
    return this.setExceptionProp(GExceptionV0.NUM_CODE_KEY, numCode);
  }

  getNumCode() {
    return this[G_EXCEPTION_OWN_PUBLIC_PROPS][GExceptionV0.NUM_CODE_KEY];
  }

  setTimestamp(timestamp?: string): this {
    return this.setExceptionProp(
      GExceptionV0.TIMESTAMP_KEY,
      timestamp || new Date().toISOString(),
    );
  }

  getTimestamp(): GExceptionTimestampResult {
    return this[G_EXCEPTION_OWN_PUBLIC_PROPS][GExceptionV0.TIMESTAMP_KEY];
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

  hadConstructorFirstArgsProblems(): boolean {
    return this[G_EXCEPTION_HAD_PROBLEMS];
  }

  getProblems(): GExceptionProblemsReport | undefined {
    if (
      !this.hadConstructorFirstArgsProblems() ||
      typeof getProblemsInfoPropKey(this) !== 'string'
    ) {
      return undefined;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.getInfo()?.[getProblemsInfoPropKey(this)];
  }

  getEffectiveConfig(): GExceptionConfig {
    return {
      ...GExceptionV0.getConfig(),
      ...(this[G_EXCEPTION_OWN_PRIVATE_PROPS]?.[GExceptionV0.CONFIG_KEY] || {}),
    };
  }

  /**
   * Error API overrride
   */

  override get message(): string {
    return this.getMessage();
  }
}
