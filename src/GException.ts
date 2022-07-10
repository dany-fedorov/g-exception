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

interface GExceptionProps extends Record<string, unknown> {
  message: GExceptionMessage;
  displayMessage?: GExceptionDisplayMessageInput;
  info?: GExceptionInfo;
  code?: GExceptionCode;
  id?: GExceptionId;
  causes?: GExceptionCauses;
  timestamp?: GExceptionTimestamp;
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
  firstArgs: GExceptionConstructorNthArgument[];
} {
  let causes: GExceptionCauses | undefined;
  let message: GExceptionMessage;
  let firstArgs: GExceptionConstructorNthArgument[];

  const isMessageFirst =
    typeof messageOrCauses === 'string' &&
    (argOrMessage === undefined || typeof argOrMessage === 'object');
  if (isMessageFirst) {
    message = messageOrCauses;
    firstArgs = [argOrMessage as GExceptionConstructorNthArgument];
  } else {
    causes = toArray(messageOrCauses);
    message = argOrMessage as string;
    firstArgs = [];
  }
  return {
    causes,
    message,
    firstArgs,
  };
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

export class GException extends Error {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private readonly [G_EXCEPTION_CLASS_NAME]: string;
  private readonly [G_EXCEPTION_OWN_PROPS]: GExceptionProps;
  private readonly [G_EXCEPTION_DERIVED_PROPS]: GExceptionDerivedProps;
  private readonly [G_EXCEPTION_EXTENSION_PROPS]: GExceptionExtensions;

  private _initCauses(causes?: GExceptionCauses) {
    if (causes !== undefined) {
      this.setCauses(causes);
    }
  }

  private _initFromArguments(args: GExceptionConstructorNthArgument[]) {
    args.forEach((arg) => {
      for (const k in arg) {
        const v = arg[k];
        if (k === 'info') {
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
      this.setId(
        ['GEID', nowDate.getTime(), crypto.randomBytes(5).toString('hex')].join(
          '_',
        ),
      );
    }
  }

  constructor(...constructorArgs: GExceptionConstructorArguments) {
    const nowDate = new Date();
    const [messageOrCauses, argOrMessage, ...args] = constructorArgs;
    const { causes, message, firstArgs } = parseFirstTwoConstructorArguments(
      messageOrCauses,
      argOrMessage,
    );
    super(message);
    this[G_EXCEPTION_CLASS_NAME] = Object.getPrototypeOf(this).constructor.name;
    this[G_EXCEPTION_OWN_PROPS] = { message };
    this[G_EXCEPTION_DERIVED_PROPS] = {};
    this[G_EXCEPTION_EXTENSION_PROPS] = {};
    this._initCauses(causes);
    this._initFromArguments([...firstArgs, ...args]);
    this._initTimestamp(nowDate);
    this._initId(nowDate);
  }

  protected getTemplateCompilationContext(): Record<string, unknown> {
    return {
      ...this[G_EXCEPTION_EXTENSION_PROPS],
      ...this[G_EXCEPTION_OWN_PROPS],
    };
  }

  protected compileTemplate(template: string): string {
    return hbs.compile(template)(this.getTemplateCompilationContext());
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

  static is(obj: unknown): obj is GException {
    return (
      typeof obj === 'object' &&
      obj != null &&
      (obj as any)?.[G_EXCEPTION_CLASS_NAME]
    );
  }

  static isExact(obj: unknown): obj is GException {
    return (
      GException.is(obj) &&
      (obj as any)?.[G_EXCEPTION_CLASS_NAME] === GException.name
    );
  }

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
    return this.setErrProp('message', message);
  }

  getMessage(): GExceptionMessage {
    if (this[G_EXCEPTION_DERIVED_PROPS].compiledMessage === undefined) {
      this[G_EXCEPTION_DERIVED_PROPS].compiledMessage = this.compileTemplate(
        this[G_EXCEPTION_OWN_PROPS].message,
      );
    }
    return this[G_EXCEPTION_DERIVED_PROPS].compiledMessage;
  }

  override get message(): string {
    return this.getMessage();
  }

  getStack(): string {
    console.log('get', this.stack, this[G_EXCEPTION_OWN_PROPS]);
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
    return this.setErrProp('displayMessage', displayMessage);
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
    return this.setErrProp('info', info);
  }

  getInfo(): GExceptionInfoResult {
    return this[G_EXCEPTION_OWN_PROPS].info;
  }

  setCode(code: GExceptionCode): this {
    return this.setErrProp('code', code);
  }

  getCode(): GExceptionCodeResult {
    return this[G_EXCEPTION_OWN_PROPS].code;
  }

  setId(id: GExceptionId) {
    return this.setErrProp('id', id);
  }

  getId(): GExceptionIdResult {
    return this[G_EXCEPTION_OWN_PROPS].id;
  }

  setCauses(causes: GExceptionCauses) {
    return this.setErrProp('causes', causes);
  }

  getCauses(): GExceptionCausesResult {
    return this[G_EXCEPTION_OWN_PROPS].causes;
  }

  setTimestamp(timestamp?: string): this {
    return this.setErrProp('timestamp', timestamp || new Date().toISOString());
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
}
