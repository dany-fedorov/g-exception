import * as hbs from 'handlebars';

type GProblemInfo = Record<string, any>;

export class GProblem {
  private readonly message: string;
  private readonly info: GProblemInfo | null = null;
  private type: string | null = null;

  constructor(message: string, info?: GProblemInfo) {
    if (info) {
      this.info = info;
    }
    try {
      this.message = hbs.compile(message)(info);
    } catch (caught: unknown) {
      console.warn(`GProblem error compiling a message: ${caught}`);
      this.message = message;
    }
  }

  static new(message: string, info?: GProblemInfo): GProblem {
    return new GProblem(message, info);
  }

  getInfo(): GProblemInfo | null {
    return this.info;
  }

  getMessage(): string {
    return this.message;
  }

  setType(type: string): this {
    this.type = type;
    return this;
  }

  getType(): string | null {
    return this.type;
  }
}
