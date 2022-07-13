import * as hbs from 'handlebars';
import * as crypto from 'node:crypto';

export function toArray<T>(x: T | T[]): T[] {
  if (Array.isArray(x)) {
    return x;
  }
  return [x];
}

const G_EXCEPTION_CLASS_NAME = Symbol('CLASS_NAME');
const G_EXCEPTION_OWN_PROPS = Symbol('OWN_PROPS');
const G_EXCEPTION_DERIVED_PROPS = Symbol('DERIVED_PROPS');
const G_EXCEPTION_EXTENSION_PROPS = Symbol('EXTENSION_PROPS');
const G_EXCEPTION_STATIC_CONFIG = Symbol('STATIC_CONFIG');
const G_EXCEPTION_HAD_CONSTRUCTOR_PROBLEMS = Symbol('HAD_CONSTRUCTOR_PROBLEMS');
const G_EXCEPTION_CONSTRUCTOR_PROBLEMS_INFO_PROP_KEY = Symbol(
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

interface GExceptionOwnProps {
  [MESSAGE_KEY]: GExceptionMessage;
  [DISPLAY_MESSAGE_KEY]?: GExceptionDisplayMessageInput;
  [INFO_KEY]?: GExceptionInfo;
  [CODE_KEY]?: GExceptionCode;
  [ID_KEY]?: GExceptionId;
  [CAUSES_KEY]?: GExceptionCauses;
  [NUM_CODE_KEY]?: GExceptionNumCode;
  [TIMESTAMP_KEY]?: GExceptionTimestamp;
}

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

interface GExceptionConstructorProblemsReport {
  firstArgsProblems?: unknown[];
  restArgsProblems?: GExceptionConstructorArgumentProblem[];
  invalidKeyProblems?: GExceptionConstructorArgumentInvalidKeyProblem[];
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
  if (GExceptionV0.getConfig().logConstructorProblems) {
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
  logConstructorProblems: boolean;
  recordConstructorProblems: boolean;
  recordConstructorProblemsInfoPropKey: string;
}

const G_EXCEPTION_CONSTRUCTOR_PROBLEMS_INFO_PROP_KEY_DEFAULT =
  'G_EXCEPTION_CONSTRUCTOR_PROBLEMS';
const G_EXCEPTION_DEFAULT_CONFIG: GExceptionConfig = {
  logConstructorProblems: true,
  recordConstructorProblems: true,
  recordConstructorProblemsInfoPropKey:
    G_EXCEPTION_CONSTRUCTOR_PROBLEMS_INFO_PROP_KEY_DEFAULT,
};

interface GExceptionConstructorArgumentProblem {
  argumentValue: unknown;
  problemReason: unknown;
  argumentNumber: number;
}

interface GExceptionConstructorArgumentInvalidKeyProblem {
  key: unknown;
  value: unknown;
  problemReason: unknown;
  argumentNumber: number;
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

  static readonly OWN_PROPS_KEYS = [
    GExceptionV0.MESSAGE_KEY,
    GExceptionV0.DISPLAY_MESSAGE_KEY,
    GExceptionV0.INFO_KEY,
    GExceptionV0.CODE_KEY,
    GExceptionV0.ID_KEY,
    GExceptionV0.CAUSES_KEY,
    GExceptionV0.NUM_CODE_KEY,
    GExceptionV0.TIMESTAMP_KEY,
  ] as unknown as Array<keyof GExceptionOwnProps>;

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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private readonly [G_EXCEPTION_CLASS_NAME]: string;
  private readonly [G_EXCEPTION_OWN_PROPS]: GExceptionOwnProps;
  private readonly [G_EXCEPTION_DERIVED_PROPS]: GExceptionDerivedProps;
  private [G_EXCEPTION_EXTENSION_PROPS]: ExtensionProps | null;
  private [G_EXCEPTION_CONSTRUCTOR_PROBLEMS_INFO_PROP_KEY]: string | null =
    null;
  private [G_EXCEPTION_HAD_CONSTRUCTOR_PROBLEMS] = false;

  /**
   * Constructor
   */

  private _initCauses(causes?: GExceptionCauses) {
    if (causes !== undefined) {
      this.setCauses(causes);
    }
  }

  private _initNumCode(numCode?: number) {
    if (numCode !== undefined) {
      this.setNumCode(numCode);
    }
  }

  private _initFromArguments(
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
          const message = mkConstructorProblemMessage(
            `Unexpected type of ${n}${sfx} argument (of total ${totalArgsN}): ${mkArgTypeReport(
              arg,
            )}`,
          );
          if (GExceptionV0.getConfig().logConstructorProblems) {
            console.warn(message);
          }
          problems.push({
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
            this.mergeIntoInfo(v as GExceptionInfo);
          } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this._setErrPropForConstructor(k, v, n, totalArgsN);
          }
        }
      } catch (err) {
        if (GExceptionV0.getConfig().logConstructorProblems) {
          const message = mkConstructorProblemMessage(
            `Caught error processing ${n}${sfx} argument (of total ${totalArgsN}): ${err}`,
          );
          console.warn(message);
        }
        problems.push({
          argumentNumber: i + argsTaken,
          argumentValue: arg,
          problemReason: err,
        });
      }
    });
    return problems;
  }

  private _getProblemsPropKey(): string | null {
    if (this[G_EXCEPTION_CONSTRUCTOR_PROBLEMS_INFO_PROP_KEY] == null) {
      const problemsPropKey =
        GExceptionV0.getConfig().recordConstructorProblemsInfoPropKey;
      if (typeof problemsPropKey !== 'string') {
        return this[G_EXCEPTION_CONSTRUCTOR_PROBLEMS_INFO_PROP_KEY];
      }
      this[G_EXCEPTION_CONSTRUCTOR_PROBLEMS_INFO_PROP_KEY] = problemsPropKey;
    }
    return this[G_EXCEPTION_CONSTRUCTOR_PROBLEMS_INFO_PROP_KEY];
  }

  private _recordConstructorProblems(
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
    this[G_EXCEPTION_HAD_CONSTRUCTOR_PROBLEMS] = hadProblems;
    if (!GExceptionV0.getConfig().recordConstructorProblems) {
      return;
    }
    const problemsPropKey = this._getProblemsPropKey();
    if (typeof problemsPropKey !== 'string') {
      return;
    }
    const problemsReport = (this.getConstructorProblems() ||
      {}) as GExceptionConstructorProblemsReport;
    const newProblemsReport: GExceptionConstructorProblemsReport = {
      ...problemsReport,
      ...(firstArgsProblems.length === 0 ? {} : { firstArgsProblems }),
      ...(restArgsProblems.length === 0 ? {} : { restArgsProblems }),
    };
    this.setInfoProp(problemsPropKey, newProblemsReport);
  }

  private _initTimestamp(nowDate: Date) {
    if (this.getTimestamp() === undefined) {
      this.setTimestamp(nowDate.toISOString());
    }
  }

  private _initId(nowDate: Date) {
    if (this.getId() === undefined) {
      this.setId(mkGEID(nowDate));
    }
  }

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
    this[G_EXCEPTION_OWN_PROPS] = { message };
    this[G_EXCEPTION_DERIVED_PROPS] = {};
    this[G_EXCEPTION_EXTENSION_PROPS] = null;
    this._initCauses(causes);
    this._initNumCode(numCode);
    this._initTimestamp(nowDate);
    this._initId(nowDate);
    const restArgsProblems = this._initFromArguments(restArgs, argsTaken);
    this._recordConstructorProblems(
      hadConstructorFirstArgsProblems,
      problematicFirstArgs,
      restArgsProblems,
    );
  }

  static from(exceptionProperties: GExceptionOwnProps): GExceptionV0 {
    return new GExceptionV0(exceptionProperties.message, exceptionProperties);
  }

  static new(
    arg1: GExceptionConstructorFirstArgument,
    arg2?: GExceptionConstructorSecondArgument,
    arg3?: GExceptionConstructorThirdArgument,
  ): GExceptionV0 {
    return new GExceptionV0(arg1, arg2, arg3);
  }

  /**
   * Template Compilation
   */

  protected getTemplateCompilationContext(): Record<string, unknown> {
    return {
      ...(this[G_EXCEPTION_EXTENSION_PROPS] === null
        ? {}
        : this[G_EXCEPTION_EXTENSION_PROPS]),
      ...this[G_EXCEPTION_OWN_PROPS],
    };
  }

  protected compileTemplate(template: string): string {
    return hbs.compile(template)(this.getTemplateCompilationContext());
  }

  /**
   * Type Predicates
   */

  static is(obj: unknown): obj is GExceptionV0 {
    return (
      typeof obj === 'object' &&
      obj != null &&
      (obj as any)?.[G_EXCEPTION_CLASS_NAME]
    );
  }

  static isExactly(obj: unknown): obj is GExceptionV0 {
    return (
      GExceptionV0.is(obj) &&
      (obj as any)?.[G_EXCEPTION_CLASS_NAME] === GExceptionV0.name
    );
  }

  /**
   * Getters & Setters
   */

  private _setErrPropForConstructor<K extends keyof GExceptionOwnProps>(
    propName: K,
    propValue: GExceptionOwnProps[K],
    argumentNumber: number,
    totalArgsNumber: number,
  ): this {
    if (!GExceptionV0.OWN_PROPS_KEYS.includes(propName)) {
      this[G_EXCEPTION_HAD_CONSTRUCTOR_PROBLEMS] = true;
      const problemsPropKey = this._getProblemsPropKey();
      if (typeof problemsPropKey !== 'string') {
        return this;
      }
      const problemsReport = (this.getConstructorProblems() ||
        {}) as GExceptionConstructorProblemsReport;
      const problemReason = mkConstructorProblemMessage(
        `Unexpected key in object argument ${argumentNumber} (of total ${totalArgsNumber}): ${propName} = ${propValue}`,
      );
      if (GExceptionV0.getConfig().logConstructorProblems) {
        console.warn(problemReason);
      }
      const newProblemsReport: GExceptionConstructorProblemsReport = {
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
      this.setInfoProp(problemsPropKey, newProblemsReport);
      return this;
    }
    this[G_EXCEPTION_OWN_PROPS][propName] = propValue;
    return this;
  }

  protected setErrProp<K extends keyof GExceptionOwnProps>(
    propName: K,
    propValue: GExceptionOwnProps[K],
  ): this {
    if (!GExceptionV0.OWN_PROPS_KEYS.includes(propName)) {
      return this;
    }
    this[G_EXCEPTION_OWN_PROPS][propName] = propValue;
    return this;
  }

  setInfoProp<T = unknown>(k: string, v: T): this {
    if (this.getInfo() === undefined) {
      this.setInfo({ [k]: v });
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this[G_EXCEPTION_OWN_PROPS].info[k] = v;
    }
    return this;
  }

  mergeIntoInfo(info: GExceptionInfo): this {
    this[G_EXCEPTION_OWN_PROPS][GExceptionV0.INFO_KEY] = this.getInfo() || {};
    Object.assign(
      this[G_EXCEPTION_OWN_PROPS][GExceptionV0.INFO_KEY] as object,
      info,
    );
    return this;
  }

  getInfoProp(k: string): undefined | unknown {
    return this.getInfo()?.[k];
  }

  setMessage(message: GExceptionMessage): this {
    return this.setErrProp(GExceptionV0.MESSAGE_KEY, message);
  }

  getMessage(): GExceptionMessage {
    if (this[G_EXCEPTION_DERIVED_PROPS].compiledMessage === undefined) {
      this[G_EXCEPTION_DERIVED_PROPS].compiledMessage = this.compileTemplate(
        this[G_EXCEPTION_OWN_PROPS].message,
      );
    }
    return this[G_EXCEPTION_DERIVED_PROPS].compiledMessage;
  }

  getStack(): string {
    if (this[G_EXCEPTION_DERIVED_PROPS].compiledStack === undefined) {
      this[G_EXCEPTION_DERIVED_PROPS].compiledStack = hbs.compile(this.stack)(
        this[G_EXCEPTION_OWN_PROPS],
      );
    }
    return this[G_EXCEPTION_DERIVED_PROPS].compiledStack;
  }

  setDisplayMessage(
    displayMessage: GExceptionDisplayMessageInput = true,
  ): this {
    return this.setErrProp(GExceptionV0.DISPLAY_MESSAGE_KEY, displayMessage);
  }

  getDisplayMessage(): GExceptionDisplayMessageResult {
    if (
      typeof this[G_EXCEPTION_OWN_PROPS].displayMessage !== 'string' &&
      [undefined, false].includes(this[G_EXCEPTION_OWN_PROPS].displayMessage)
    ) {
      return undefined;
    } else if (this[G_EXCEPTION_OWN_PROPS].displayMessage === true) {
      return this.getMessage();
    }
    if (this[G_EXCEPTION_DERIVED_PROPS].compiledDisplayMessage === undefined) {
      this[G_EXCEPTION_DERIVED_PROPS].compiledDisplayMessage =
        this.compileTemplate(
          this[G_EXCEPTION_OWN_PROPS].displayMessage as string,
        );
    }
    return this[G_EXCEPTION_DERIVED_PROPS].compiledMessage;
  }

  setInfo(info: GExceptionInfo): this {
    return this.setErrProp(INFO_KEY, info);
  }

  getInfo(): GExceptionInfoResult {
    return this[G_EXCEPTION_OWN_PROPS][GExceptionV0.INFO_KEY];
  }

  setCode(code: GExceptionCode): this {
    return this.setErrProp(GExceptionV0.CODE_KEY, code);
  }

  getCode(): GExceptionCodeResult {
    return this[G_EXCEPTION_OWN_PROPS][GExceptionV0.CODE_KEY];
  }

  setId(id: GExceptionId) {
    return this.setErrProp(GExceptionV0.ID_KEY, id);
  }

  getId(): GExceptionIdResult {
    return this[G_EXCEPTION_OWN_PROPS][GExceptionV0.ID_KEY];
  }

  setCauses(causes: GExceptionCauses) {
    return this.setErrProp(GExceptionV0.CAUSES_KEY, causes);
  }

  getCauses(): GExceptionCausesResult {
    return this[G_EXCEPTION_OWN_PROPS][GExceptionV0.CAUSES_KEY];
  }

  setNumCode(numCode: number) {
    return this.setErrProp(GExceptionV0.NUM_CODE_KEY, numCode);
  }

  getNumCode() {
    return this[G_EXCEPTION_OWN_PROPS][GExceptionV0.NUM_CODE_KEY];
  }

  setTimestamp(timestamp?: string): this {
    return this.setErrProp(
      GExceptionV0.TIMESTAMP_KEY,
      timestamp || new Date().toISOString(),
    );
  }

  getTimestamp(): GExceptionTimestampResult {
    return this[G_EXCEPTION_OWN_PROPS][GExceptionV0.TIMESTAMP_KEY];
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
    return this[G_EXCEPTION_HAD_CONSTRUCTOR_PROBLEMS];
  }

  getConstructorProblems(): GExceptionConstructorProblemsReport | undefined {
    if (
      !this.hadConstructorFirstArgsProblems() ||
      typeof this._getProblemsPropKey() !== 'string'
    ) {
      return undefined;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.getInfo()?.[this._getProblemsPropKey()];
  }

  /**
   * Error API overrride
   */

  override get message(): string {
    return this.getMessage();
  }
}
