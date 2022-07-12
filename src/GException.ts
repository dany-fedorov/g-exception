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
  badArgs: unknown[];
  causes: GExceptionCauses;
  numCode: GExceptionNumCode | undefined;
  message: GExceptionMessage;
  restArgs: GExceptionConstructorNthArgument[];
  argsTaken: number;
}

interface GExceptionConstructorProblemsReport {
  firstBadArgs?: unknown[];
  restArgsProblems?: GExceptionConstructorArgumentProblem[];
}

function mkArgTypeReport(x: unknown): string {
  return [Array.isArray(x) ? 'array' : typeof x, x].join(' - ');
}

function isPotentialNthArgument(x: unknown): boolean {
  return !!x && typeof x === 'object' && !Array.isArray(x);
}

function parseConstructorArgumentsBackup(
  constructorArgs: GExceptionConstructorArguments,
): GExceptionConstructorArgumentsParsed {
  const [a1, a2, a3] = constructorArgs;
  const badArgsToProcess = [a1, a2, a3];
  let numCode: number | undefined = undefined;
  const badArgsReport = badArgsToProcess
    .map((a, i) => {
      const t = typeof a;
      if (t === 'number') {
        numCode = a as number;
      }
      return ['-', `${i + 1}.`, mkArgTypeReport(a)].join(' ');
    })
    .join('\n');
  const message = mkConstructorProblemMessage(
    [
      `Received unexpected first ${badArgsToProcess.length} arguments (of total ${constructorArgs.length})`,
      badArgsReport,
    ].join(':\n'),
  );
  if (GException.getConfig().logConstructorProblems) {
    console.warn(message);
  }
  const prependToRest = badArgsToProcess.filter((a) =>
    isPotentialNthArgument(a),
  );
  return {
    badArgs: badArgsToProcess,
    argsTaken: badArgsToProcess.length,
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
 * valid combinations
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
  if (t1 === 'string' && !['string', 'number'].includes(t2)) {
    const argsTaken = 1;
    return {
      badArgs: [],
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
      badArgs: [],
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
      badArgs: [],
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
      badArgs: [],
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
  'G_EXCEPTION_CONSTRUCTOR_PROBLEMS_REPORT';
const G_EXCEPTION_DEFAULT_CONFIG: GExceptionConfig = {
  logConstructorProblems: true,
  recordConstructorProblems: true,
  recordConstructorProblemsInfoPropKey:
    G_EXCEPTION_CONSTRUCTOR_PROBLEMS_INFO_PROP_KEY_DEFAULT,
};

interface GExceptionConstructorArgumentProblem {
  argumentValue: unknown;
  problemReason: unknown;
  argumentIndex: number;
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
  return `${GException.name} constructor problem: ${s}`;
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

  static readonly OWN_PROPS_KEYS = [
    GException.MESSAGE_KEY,
    GException.DISPLAY_MESSAGE_KEY,
    GException.INFO_KEY,
    GException.CODE_KEY,
    GException.ID_KEY,
    GException.CAUSES_KEY,
    GException.NUM_CODE_KEY,
    GException.TIMESTAMP_KEY,
  ] as unknown as Array<keyof GExceptionOwnProps>;

  /**
   * Static Config
   */

  static [G_EXCEPTION_STATIC_CONFIG]: GExceptionConfig =
    G_EXCEPTION_DEFAULT_CONFIG;

  static setConfig(config: GExceptionConfig): void {
    GException[G_EXCEPTION_STATIC_CONFIG] = config;
  }

  static mergeConfig(config: Partial<GExceptionConfig>): void {
    Object.assign(GException[G_EXCEPTION_STATIC_CONFIG], config);
  }

  static getConfig(): GExceptionConfig {
    return GException[G_EXCEPTION_STATIC_CONFIG];
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
            `Unexpected ${n}${sfx} argument type (of total ${totalArgsN}): ${mkArgTypeReport(
              arg,
            )}`,
          );
          if (GException.getConfig().logConstructorProblems) {
            console.warn(message);
          }
          problems.push({
            argumentIndex: i + argsTaken,
            argumentValue: arg,
            problemReason: message,
          });
          return;
        }

        for (const k in arg) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const v = arg[k];
          if (k === GException.INFO_KEY) {
            this.mergeIntoInfo(v as GExceptionInfo);
          } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.setErrProp(k, v);
          }
        }
      } catch (err) {
        if (GException.getConfig().logConstructorProblems) {
          const message = mkConstructorProblemMessage(
            `Caught error processing ${n}${sfx} argument (of total ${totalArgsN}): ${err}`,
          );
          console.warn(message);
        }
        problems.push({
          argumentIndex: i + argsTaken,
          argumentValue: arg,
          problemReason: err,
        });
      }
    });
    return problems;
  }

  private _recordConstructorProblems(
    firstBadArgs: unknown[],
    restArgsProblems: GExceptionConstructorArgumentProblem[],
  ) {
    if (firstBadArgs.length === 0 && restArgsProblems.length === 0) {
      return;
    }
    this[G_EXCEPTION_HAD_CONSTRUCTOR_PROBLEMS] = true;
    if (!GException.getConfig().recordConstructorProblems) {
      return;
    }
    const propKey = GException.getConfig().recordConstructorProblemsInfoPropKey;
    if (typeof propKey !== 'string') {
      return;
    }
    this[G_EXCEPTION_CONSTRUCTOR_PROBLEMS_INFO_PROP_KEY] = propKey;
    const problemsReport: GExceptionConstructorProblemsReport = {
      ...(firstBadArgs.length === 0 ? {} : { firstBadArgs }),
      ...(restArgsProblems.length === 0 ? {} : { restArgsProblems }),
    };
    this.setInfoProp(propKey, problemsReport);
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
    const { causes, message, numCode, badArgs, restArgs, argsTaken } =
      parseConstructorArguments(constructorArgs);
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
    this._recordConstructorProblems(badArgs, restArgsProblems);
  }

  static from(exceptionProperties: GExceptionOwnProps): GException {
    return new GException(exceptionProperties.message, exceptionProperties);
  }

  static new(
    arg1: GExceptionConstructorFirstArgument,
    arg2?: GExceptionConstructorSecondArgument,
    arg3?: GExceptionConstructorThirdArgument,
  ): GException {
    return new GException(arg1, arg2, arg3);
  }

  /**
   * Template Compilation
   */

  protected getTemplateCompilationContext(): Record<string, unknown> {
    return {
      ...this[G_EXCEPTION_EXTENSION_PROPS],
      ...this[G_EXCEPTION_OWN_PROPS],
    };
  }

  protected compileTemplate(template: string): string {
    return hbs.compile(template)(this.getTemplateCompilationContext());
  }

  /**
   * Type Predicates
   */

  static is(obj: unknown): obj is GException {
    return (
      typeof obj === 'object' &&
      obj != null &&
      (obj as any)?.[G_EXCEPTION_CLASS_NAME]
    );
  }

  static isExactly(obj: unknown): obj is GException {
    return (
      GException.is(obj) &&
      (obj as any)?.[G_EXCEPTION_CLASS_NAME] === GException.name
    );
  }

  /**
   * Getters & Setters
   */

  protected setErrProp<K extends keyof GExceptionOwnProps>(
    propName: K,
    propValue: GExceptionOwnProps[K],
  ): this {
    if (!GException.OWN_PROPS_KEYS.includes(propName)) {
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
    this[G_EXCEPTION_OWN_PROPS][GException.INFO_KEY] = this.getInfo() || {};
    Object.assign(
      this[G_EXCEPTION_OWN_PROPS][GException.INFO_KEY] as object,
      info,
    );
    return this;
  }

  getInfoProp(k: string): undefined | unknown {
    return this.getInfo()?.[k];
  }

  setMessage(message: GExceptionMessage): this {
    return this.setErrProp(GException.MESSAGE_KEY, message);
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
    return this.setErrProp(GException.DISPLAY_MESSAGE_KEY, displayMessage);
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
    return this[G_EXCEPTION_OWN_PROPS][GException.INFO_KEY];
  }

  setCode(code: GExceptionCode): this {
    return this.setErrProp(GException.CODE_KEY, code);
  }

  getCode(): GExceptionCodeResult {
    return this[G_EXCEPTION_OWN_PROPS][GException.CODE_KEY];
  }

  setId(id: GExceptionId) {
    return this.setErrProp(GException.ID_KEY, id);
  }

  getId(): GExceptionIdResult {
    return this[G_EXCEPTION_OWN_PROPS][GException.ID_KEY];
  }

  setCauses(causes: GExceptionCauses) {
    return this.setErrProp(GException.CAUSES_KEY, causes);
  }

  getCauses(): GExceptionCausesResult {
    return this[G_EXCEPTION_OWN_PROPS][GException.CAUSES_KEY];
  }

  setNumCode(numCode: number) {
    return this.setErrProp(GException.NUM_CODE_KEY, numCode);
  }

  getNumCode() {
    return this[G_EXCEPTION_OWN_PROPS][GException.NUM_CODE_KEY];
  }

  setTimestamp(timestamp?: string): this {
    return this.setErrProp(
      GException.TIMESTAMP_KEY,
      timestamp || new Date().toISOString(),
    );
  }

  getTimestamp(): GExceptionTimestampResult {
    return this[G_EXCEPTION_OWN_PROPS][GException.TIMESTAMP_KEY];
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

  hadConstructorProblems(): boolean {
    return this[G_EXCEPTION_HAD_CONSTRUCTOR_PROBLEMS];
  }

  getConstructorProblems(): GExceptionConstructorProblemsReport | undefined {
    if (
      !this.hadConstructorProblems() ||
      typeof this[G_EXCEPTION_CONSTRUCTOR_PROBLEMS_INFO_PROP_KEY] !== 'string'
    ) {
      return undefined;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.getInfo()[this[G_EXCEPTION_CONSTRUCTOR_PROBLEMS_INFO_PROP_KEY]];
  }

  /**
   * Error API overrride
   */

  override get message(): string {
    return this.getMessage();
  }
}
