import * as hbs from 'handlebars';
import * as crypto from 'node:crypto';

export function toArray<T>(x: T | T[]): T[] {
  if (Array.isArray(x)) {
    return x;
  }
  return [x];
}

const G_EXCEPTION_CLASS_NAME = Symbol('G_EXCEPTION_CLASS_NAME');
const G_EXCEPTION_OWN_PROPS = Symbol('G_EXCEPTION_OWN_PROPS');
const G_EXCEPTION_DERIVED_PROPS = Symbol('G_EXCEPTION_DERIVED_PROPS');
const G_EXCEPTION_EXTENSION_PROPS = Symbol('G_EXCEPTION_EXTENSION_PROPS');

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

type GExceptionCausesResult = GExceptionCauses | undefined;

type GExceptionTimestamp = string;

type GExceptionTimestampResult = GExceptionTimestamp | undefined;

const MESSAGE_KEY = 'message';
const DISPLAY_MESSAGE_KEY = 'displayMessage';
const INFO_KEY = 'info';
const CODE_KEY = 'code';
const ID_KEY = 'id';
const CAUSES_KEY = 'causes';
const TIMESTAMP_KEY = 'timestamp';

interface GExceptionProps extends Record<string, unknown> {
  [MESSAGE_KEY]: GExceptionMessage;
  [DISPLAY_MESSAGE_KEY]?: GExceptionDisplayMessageInput;
  [INFO_KEY]?: GExceptionInfo;
  [CODE_KEY]?: GExceptionCode;
  [ID_KEY]?: GExceptionId;
  [CAUSES_KEY]?: GExceptionCauses;
  [TIMESTAMP_KEY]?: GExceptionTimestamp;
}

type GExceptionConstructorNthArgument = Partial<GExceptionProps>;

type GExceptionConstructorFirstArgument = unknown[] | unknown | string;

type GExceptionConstructorSecondArgument =
  | string
  | GExceptionConstructorNthArgument;

function parseFirstTwoConstructorArguments(
  messageOrCauses: GExceptionConstructorFirstArgument,
  argOrMessage?: GExceptionConstructorSecondArgument,
): {
  causes: GExceptionCauses | undefined;
  message: GExceptionMessage;
  prependArgs: GExceptionConstructorNthArgument[];
} {
  const isMessageFirst =
    typeof messageOrCauses === 'string' &&
    (argOrMessage === undefined || typeof argOrMessage === 'object');
  if (isMessageFirst) {
    return {
      causes: undefined,
      message: messageOrCauses as GExceptionMessage,
      prependArgs: [argOrMessage as GExceptionConstructorNthArgument],
    };
  } else {
    return {
      causes: toArray(messageOrCauses),
      message: argOrMessage as GExceptionMessage,
      prependArgs: [],
    };
  }
}

export type GExceptionConstructorArguments = [
  GExceptionConstructorFirstArgument,
  GExceptionConstructorSecondArgument?,
  ...GExceptionConstructorNthArgument[],
];

interface GExceptionDerivedProps {
  compiledMessage?: string;
  compiledDisplayMessage?: string;
  compiledStack?: string;
}

type GExceptionExtensions = Record<string, unknown>;

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

export class GException extends Error {
  static readonly MESSAGE_KEY = MESSAGE_KEY;
  static readonly DISPLAY_MESSAGE_KEY = DISPLAY_MESSAGE_KEY;
  static readonly INFO_KEY = INFO_KEY;
  static readonly CODE_KEY = CODE_KEY;
  static readonly ID_KEY = ID_KEY;
  static readonly CAUSES_KEY = CAUSES_KEY;
  static readonly TIMESTAMP_KEY = TIMESTAMP_KEY;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private readonly [G_EXCEPTION_CLASS_NAME]: string;
  private readonly [G_EXCEPTION_OWN_PROPS]: GExceptionProps;
  private readonly [G_EXCEPTION_DERIVED_PROPS]: GExceptionDerivedProps;
  private readonly [G_EXCEPTION_EXTENSION_PROPS]: GExceptionExtensions;

  /**
   * Constructor
   */

  private _initCauses(causes?: GExceptionCauses) {
    if (causes !== undefined) {
      this.setCauses(causes);
    }
  }

  private _initFromArguments(args: GExceptionConstructorNthArgument[]) {
    args.forEach((arg) => {
      for (const k in arg) {
        const v = arg[k];
        if (k === GException.INFO_KEY) {
          this.mergeIntoInfo(v as GExceptionInfo);
        } else {
          this.setErrProp(k, v);
        }
      }
    });
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
    const [messageOrCauses, argOrMessage, ...args] = constructorArgs;
    const { causes, message, prependArgs } = parseFirstTwoConstructorArguments(
      messageOrCauses,
      argOrMessage,
    );
    super(message);
    this[G_EXCEPTION_CLASS_NAME] = Object.getPrototypeOf(this).constructor.name;
    this[G_EXCEPTION_OWN_PROPS] = { message };
    this[G_EXCEPTION_DERIVED_PROPS] = {};
    this[G_EXCEPTION_EXTENSION_PROPS] = {};
    this._initCauses(causes);
    this._initFromArguments([...prependArgs, ...args]);
    this._initTimestamp(nowDate);
    this._initId(nowDate);
  }

  static from(exceptionProperties: GExceptionProps): GException {
    return new GException(exceptionProperties.message, exceptionProperties);
  }

  static new(
    messageOrCauses: GExceptionConstructorFirstArgument,
    argOrMessage?: GExceptionConstructorSecondArgument,
  ): GException {
    return new GException(messageOrCauses, argOrMessage);
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

  protected setErrProp<K extends keyof GExceptionProps>(
    propName: K,
    propValue: GExceptionProps[K],
  ): this {
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
    this[G_EXCEPTION_OWN_PROPS].info = this.getInfo() || {};
    Object.assign(this[G_EXCEPTION_OWN_PROPS].info, info);
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
    return this[G_EXCEPTION_OWN_PROPS].info;
  }

  setCode(code: GExceptionCode): this {
    return this.setErrProp(GException.CODE_KEY, code);
  }

  getCode(): GExceptionCodeResult {
    return this[G_EXCEPTION_OWN_PROPS].code;
  }

  setId(id: GExceptionId) {
    return this.setErrProp(GException.ID_KEY, id);
  }

  getId(): GExceptionIdResult {
    return this[G_EXCEPTION_OWN_PROPS].id;
  }

  setCauses(causes: GExceptionCauses) {
    return this.setErrProp(GException.CAUSES_KEY, causes);
  }

  getCauses(): GExceptionCausesResult {
    return this[G_EXCEPTION_OWN_PROPS].causes;
  }

  setTimestamp(timestamp?: string): this {
    return this.setErrProp(
      GException.TIMESTAMP_KEY,
      timestamp || new Date().toISOString(),
    );
  }

  getTimestamp(): GExceptionTimestampResult {
    return this[G_EXCEPTION_OWN_PROPS].timestamp;
  }

  protected setExtensionProp(k: string, v: unknown): this {
    this[G_EXCEPTION_EXTENSION_PROPS][k] = v;
    return this;
  }

  protected getExtensionProp(k: string): undefined | unknown {
    return this[G_EXCEPTION_EXTENSION_PROPS][k];
  }

  /**
   * Error API overrride
   */

  override get message(): string {
    return this.getMessage();
  }
}
