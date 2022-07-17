import { GProblem } from './g-problem';

interface ConSConfig {
  maxDepth: number;
  format: ConSFormat;
}

export enum ConSFormat {
  JSON_V0 = 'jsonv0',
  // INLINE_V0 = 'inlinev0' // TODO
}

const CONS_DEFAULT_CONFIG: ConSConfig = {
  maxDepth: 20,
  format: ConSFormat.JSON_V0,
};

const ConS_FORMAT_KEY = '$conS$>format';
const ConS_CONTENT_KEY = '$conS$>content';

const ConS_TYPE_KEY = '$conS$>type';

const ConS_CONSTRUCTOR_NAME_KEY = '$conS$>constructorName';

enum ConSType {
  conSPlainObject = 'conSPlainObject',
  conSCustomObject = 'conSCustomObject',
  Date = 'Date',
  RegExp = 'RegExp',
  Buffer = 'Buffer',
  Error = 'Error',
  BigInt = 'BigInt',
  undefined = 'undefined',
  Map = 'Map',
  Set = 'Set',
  Function = 'Function',
  ArrayBuffer = 'ArrayBuffer',
  Int8Array = 'Int8Array',
  Uint8Array = 'Uint8Array',
  Uint8ClampedArray = 'Uint8ClampedArray',
  Int16Array = 'Int16Array',
  Uint16Array = 'Uint16Array',
  Int32Array = 'Int32Array',
  Uint32Array = 'Uint32Array',
  Float32Array = 'Float32Array',
  Float64Array = 'Float64Array',
  BigInt64Array = 'BigInt64Array',
  BigUint64Array = 'BigUint64Array',
}

interface ConSObject {
  [ConS_TYPE_KEY]: Omit<ConSType, ConSType.conSCustomObject>;
  [ConS_CONTENT_KEY]: ConSObjectContent;
}

interface ConSCustomObject {
  [ConS_TYPE_KEY]: ConSType.conSCustomObject;
  [ConS_CONSTRUCTOR_NAME_KEY]: string;
  [ConS_CONTENT_KEY]: ConSObjectContent;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type ConSContent =
  | string
  | number
  | boolean
  | null
  | ConSObject
  | ConSCustomObject
  | ConSArray;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type ConSObjectContent = Record<string, ConSContent>;

type ConSArray = Array<ConSContent>;

interface ConSSerializedJsonV0Conatiner {
  [ConS_FORMAT_KEY]: ConSFormat;
  [ConS_CONTENT_KEY]: ConSContent;
}

interface ConSSerializeResult<Serialized> {
  appliedConfig: ConSConfig;
  serialized: Serialized | null;
  problems: GProblem[];
}

function mkProblemReason(reason: string): string {
  return `${ConfigurableSerializer.name} problem: ${reason}`;
}

interface ConSJsonV0Context {
  depth: number;
  objId: number;
  objToObjId: WeakMap<object, string>;
}

function serializeObjectToJsonV0(
  obj: unknown,
  config: ConSConfig,
  ctx: ConSJsonV0Context,
): ConSContent {}

function serializeToJsonV0(
  obj: unknown,
  config: ConSConfig,
): ConSSerializeResult<ConSSerializedJsonV0Conatiner> {
  const ctx: ConSJsonV0Context = {
    depth: 0,
    objId: 0,
    objToObjId: new WeakMap(),
  };
  const { serializedObject, problems } = serializeObjectToJsonV0(
    obj,
    config,
    ctx,
  );
  return {
    appliedConfig: config,
    serialized: {
      [ConS_FORMAT_KEY]: ConSFormat.JSON_V0,
      [ConS_CONTENT_KEY]: serializedObject,
    },
    problems,
  };
}

export class ConfigurableSerializer {
  private readonly config: ConSConfig;

  constructor(config: ConSConfig = CONS_DEFAULT_CONFIG) {
    this.config = config;
  }

  serialize(obj: unknown): ConSSerializeResult<ConSSerializedJsonV0Conatiner> {
    switch (this.config.format) {
      case ConSFormat.JSON_V0:
        return serializeToJsonV0(obj, this.config);
      default:
        return {
          appliedConfig: this.config,
          serialized: null,
          problems: [
            new GProblem(mkProblemReason(`Unknown format - {{format}}`), {
              format: this.config.format,
            }),
          ],
        };
    }
  }
}
