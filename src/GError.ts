import * as hbs from 'handlebars';
import * as crypto from 'node:crypto';

export function toArray<T>(x: T | T[]): T[] {
  if (Array.isArray(x)) {
    return x;
  }
  return [x];
}

const G_ERR_CLASS_NAME = Symbol('G_ERR_CLASS_NAME');
const G_ERR_OWN_PROPS = Symbol('G_ERR_OWN_PROPS');
const G_ERR_DERIVED_PROPS = Symbol('G_ERR_DERIVED_PROPS');
const G_ERR_EXTENSION_PROPS = Symbol('G_ERR_EXTENSION_PROPS');

type GErrorMessage = string;

type GErrorDisplayMessage = string;

type GErrorDisplayMessageInput = GErrorDisplayMessage | boolean;

type GErrorDisplayMessageResult = GErrorDisplayMessage | undefined;

type GErrorInfo = Record<string, unknown>;

type GErrorInfoResult = GErrorInfo | undefined;

type GErrorCode = string;

type GErrorCodeResult = GErrorCode | undefined;

type GErrorId = string;

type GErrorIdResult = GErrorId | undefined;

type GErrorCauses = unknown[];

type GErrorCausesResult = GErrorCauses | undefined;

type GErrorTimestamp = string;

type GErrorTimestampResult = GErrorTimestamp | undefined;

interface GErrorProps extends Record<string, unknown> {
  message: GErrorMessage;
  displayMessage?: GErrorDisplayMessageInput;
  info?: GErrorInfo;
  code?: GErrorCode;
  id?: GErrorId;
  causes?: GErrorCauses;
  timestamp?: GErrorTimestamp;
}

type GErrorConstructorNthArgument = Partial<GErrorProps>;

type GErrorConstructorFirstArgument = unknown[] | unknown | string;

type GErrorConstructorSecondArgument = string | GErrorConstructorNthArgument;

function parseFirstTwoConstructorArguments(
  messageOrCauses: GErrorConstructorFirstArgument,
  argOrMessage?: GErrorConstructorSecondArgument,
): {
  causes: GErrorCauses | undefined;
  message: GErrorMessage;
  firstArgs: GErrorConstructorNthArgument[];
} {
  let causes: GErrorCauses | undefined;
  let message: GErrorMessage;
  let firstArgs: GErrorConstructorNthArgument[];

  const isMessageFirst =
    typeof messageOrCauses === 'string' &&
    (argOrMessage === undefined || typeof argOrMessage === 'object');
  if (isMessageFirst) {
    message = messageOrCauses;
    firstArgs = [argOrMessage as GErrorConstructorNthArgument];
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

export type GErrorConstructorArguments = [
  GErrorConstructorFirstArgument,
  GErrorConstructorSecondArgument?,
  ...GErrorConstructorNthArgument[],
];

interface GErrorDerivedProps {
  compiledMessage?: string;
  compiledDisplayMessage?: string;
  compiledStack?: string;
}

type GErrorExtensions = Record<string, unknown>;

export class GError extends Error {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private readonly [G_ERR_CLASS_NAME]: string;
  private readonly [G_ERR_OWN_PROPS]: GErrorProps;
  private readonly [G_ERR_DERIVED_PROPS]: GErrorDerivedProps;
  private readonly [G_ERR_EXTENSION_PROPS]: GErrorExtensions;

  private _initCauses(causes?: GErrorCauses) {
    if (causes !== undefined) {
      this.setCauses(causes);
    }
  }

  private _initFromArguments(args: GErrorConstructorNthArgument[]) {
    args.forEach((arg) => {
      for (const k in arg) {
        const v = arg[k];
        if (k === 'info') {
          this.mergeIntoInfo(v as GErrorInfo);
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

  constructor(...constructorArgs: GErrorConstructorArguments) {
    const nowDate = new Date();
    const [messageOrCauses, argOrMessage, ...args] = constructorArgs;
    const { causes, message, firstArgs } = parseFirstTwoConstructorArguments(
      messageOrCauses,
      argOrMessage,
    );
    super(message);
    this[G_ERR_CLASS_NAME] = Object.getPrototypeOf(this).constructor.name;
    this[G_ERR_OWN_PROPS] = { message };
    this[G_ERR_DERIVED_PROPS] = {};
    this[G_ERR_EXTENSION_PROPS] = {};
    this._initCauses(causes);
    this._initFromArguments([...firstArgs, ...args]);
    this._initTimestamp(nowDate);
    this._initId(nowDate);
  }

  protected getTemplateCompilationContext(): Record<string, unknown> {
    return { ...this[G_ERR_EXTENSION_PROPS], ...this[G_ERR_OWN_PROPS] };
  }

  protected compileTemplate(template: string): string {
    return hbs.compile(template)(this.getTemplateCompilationContext());
  }

  static from(exceptionProperties: GErrorProps): GError {
    return new GError(exceptionProperties.message, exceptionProperties);
  }

  static new(
    messageOrCauses: GErrorConstructorFirstArgument,
    argOrMessage?: GErrorConstructorSecondArgument,
  ): GError {
    return new GError(messageOrCauses, argOrMessage);
  }

  static is(obj: unknown): obj is GError {
    return (
      typeof obj === 'object' && obj != null && (obj as any)?.[G_ERR_CLASS_NAME]
    );
  }

  static isExact(obj: unknown): obj is GError {
    return GError.is(obj) && (obj as any)?.[G_ERR_CLASS_NAME] === GError.name;
  }

  protected setErrProp<K extends keyof GErrorProps>(
    propName: K,
    propValue: GErrorProps[K],
  ): this {
    this[G_ERR_OWN_PROPS][propName] = propValue;
    return this;
  }

  setInfoProp<T = unknown>(k: string, v: T): this {
    if (this.getInfo() === undefined) {
      this.setInfo({ [k]: v });
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this[G_ERR_OWN_PROPS].info[k] = v;
    }
    return this;
  }

  mergeIntoInfo(info: GErrorInfo): this {
    this[G_ERR_OWN_PROPS].info = this.getInfo() || {};
    Object.assign(this[G_ERR_OWN_PROPS].info, info);
    return this;
  }

  getInfoProp(k: string): undefined | unknown {
    return this.getInfo()?.[k];
  }

  setMessage(message: GErrorMessage): this {
    return this.setErrProp('message', message);
  }

  getMessage(): GErrorMessage {
    if (this[G_ERR_DERIVED_PROPS].compiledMessage === undefined) {
      this[G_ERR_DERIVED_PROPS].compiledMessage = this.compileTemplate(
        this[G_ERR_OWN_PROPS].message,
      );
    }
    return this[G_ERR_DERIVED_PROPS].compiledMessage;
  }

  override get message(): string {
    return this.getMessage();
  }

  getStack(): string {
    console.log('get', this.stack, this[G_ERR_OWN_PROPS]);
    if (this[G_ERR_DERIVED_PROPS].compiledStack === undefined) {
      this[G_ERR_DERIVED_PROPS].compiledStack = hbs.compile(this.stack)(
        this[G_ERR_OWN_PROPS],
      );
    }
    return this[G_ERR_DERIVED_PROPS].compiledStack;
  }

  setDisplayMessage(displayMessage: GErrorDisplayMessageInput = true): this {
    return this.setErrProp('displayMessage', displayMessage);
  }

  getDisplayMessage(): GErrorDisplayMessageResult {
    if (
      typeof this[G_ERR_OWN_PROPS].displayMessage !== 'string' &&
      [undefined, false].includes(this[G_ERR_OWN_PROPS].displayMessage)
    ) {
      return undefined;
    } else if (this[G_ERR_OWN_PROPS].displayMessage === true) {
      return this.getMessage();
    }
    if (this[G_ERR_DERIVED_PROPS].compiledDisplayMessage === undefined) {
      this[G_ERR_DERIVED_PROPS].compiledDisplayMessage = this.compileTemplate(
        this[G_ERR_OWN_PROPS].displayMessage as string,
      );
    }
    return this[G_ERR_DERIVED_PROPS].compiledMessage;
  }

  setInfo(info: GErrorInfo): this {
    return this.setErrProp('info', info);
  }

  getInfo(): GErrorInfoResult {
    return this[G_ERR_OWN_PROPS].info;
  }

  setCode(code: GErrorCode): this {
    return this.setErrProp('code', code);
  }

  getCode(): GErrorCodeResult {
    return this[G_ERR_OWN_PROPS].code;
  }

  setId(id: GErrorId) {
    return this.setErrProp('id', id);
  }

  getId(): GErrorIdResult {
    return this[G_ERR_OWN_PROPS].id;
  }

  setCauses(causes: GErrorCauses) {
    return this.setErrProp('causes', causes);
  }

  getCauses(): GErrorCausesResult {
    return this[G_ERR_OWN_PROPS].causes;
  }

  setTimestamp(timestamp?: string): this {
    return this.setErrProp('timestamp', timestamp || new Date().toISOString());
  }

  getTimestamp(): GErrorTimestampResult {
    return this[G_ERR_OWN_PROPS].timestamp;
  }

  protected setExtensionProp(k: string, v: unknown): this {
    this[G_ERR_EXTENSION_PROPS][k] = v;
    return this;
  }

  protected getExtensionProp(k: string): undefined | unknown {
    return this[G_ERR_EXTENSION_PROPS][k];
  }
}
