import { GException } from './GException';

interface GSConfig {
  maxDepth: number;
  format: GSFormat;
}

export enum GSFormat {
  JSON_V0 = 'jsonv0',
  // INLINE_V0 = 'inlinev0' // TODO
}

const GS_DEFAULT_CONFIG: GSConfig = {
  maxDepth: 20,
  format: GSFormat.JSON_V0,
};

const GS_FORMAT_KEY = '$gs$>format';
const GS_CONTENT_KEY = '$gs$>content';

const GS_TYPE_KEY = '$gs$>type';

const GS_CONSTRUCTOR_NAME_KEY = '$gs$>constructorName';

enum GSType {
  gsPlainObject = 'gsPlainObject',
  gsCustomObject = 'gsCustomObject',
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

interface GSObject {
  [GS_TYPE_KEY]: Omit<GSType, GSType.gsCustomObject>;
  [GS_CONTENT_KEY]: GSObjectContent;
}

interface GSCustomObject {
  [GS_TYPE_KEY]: GSType.gsCustomObject;
  [GS_CONSTRUCTOR_NAME_KEY]: string;
  [GS_CONTENT_KEY]: GSObjectContent;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type GSContent =
  | string
  | number
  | boolean
  | null
  | GSObject
  | GSCustomObject
  | GSArray;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type GSObjectContent = Record<string, GSContent>;

type GSArray = Array<GSContent>;

interface GSSerializedJsonV0Conatiner {
  [GS_FORMAT_KEY]: GSFormat;
  [GS_CONTENT_KEY]: GSContent;
}

interface GSSerializeResult<Serialized> {
  appliedConfig: GSConfig;
  serialized: Serialized | null;
  problems: GException[];
}

function mkProblemReason(reason: string): string {
  return `${GSerializer.name} problem: ${reason}`;
}

interface GSJsonV0Context {
  depth: number;
  objId: number;
  objToObjId: WeakMap<object, string>;
}

function serializeObjectToJsonV0(
  obj: unknown,
  config: GSConfig,
  ctx: GSJsonV0Context,
): GSContent {}

function serializeToJsonV0(
  obj: unknown,
  config: GSConfig,
): GSSerializeResult<GSSerializedJsonV0Conatiner> {
  const ctx: GSJsonV0Context = {
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
      [GS_FORMAT_KEY]: GSFormat.JSON_V0,
      [GS_CONTENT_KEY]: serializedObject,
    },
    problems,
  };
}

export class GSerializer {
  private readonly config: GSConfig;

  constructor(config: GSConfig = GS_DEFAULT_CONFIG) {
    this.config = config;
  }

  serialize(obj: unknown): GSSerializeResult<GSSerializedJsonV0Conatiner> {
    switch (this.config.format) {
      case GSFormat.JSON_V0:
        return serializeToJsonV0(obj, this.config);
      default:
        return {
          appliedConfig: this.config,
          serialized: null,
          problems: [
            new GException(
              mkProblemReason(`Unknown format - {{info.format}}`),
              {
                info: { format: this.config.format },
              },
            ),
          ],
        };
    }
  }
}
