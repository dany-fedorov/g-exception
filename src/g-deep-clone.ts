import { GException } from './GException';

class GDCContext {}

interface CloneInput<T> {
  src: T;
  cloner: GDeepCloner;
  rule: GDCRule;
  ctx: GDCContext;
}

interface GDCRule<T = any> {
  id: string | symbol;
  priority: number;
  test: (src: T, ctx: GDCContext) => src is T;
  clone: (input: CloneInput<T>) => GDCResult<T>;
}

export enum GCDPrototypeBehavior {
  CLONE_PROTOTYPE = 'CLONE_PROTOTYPE',
  REFERENCE_PROTOTYPE = 'REFERENCE_PROTOTYPE',
  EXCLUDE_PROTOTYPE = 'EXCLUDE_PROTOTYPE',
}

interface GDCConfig {
  fallbackRuleId: string | symbol;
  prototypeBehavior: GCDPrototypeBehavior;
  rules: Record<string | symbol, GDCRule>;
}

type GDCJSPrimitive =
  | number
  | string
  | symbol
  | boolean
  | bigint
  | null
  | undefined;

const GDC_DEFAULT_RULE_PREFIX = '$gdc$>defaultRule.';

function gdcDefaultRuleId(ruleName: string): symbol {
  return Symbol([GDC_DEFAULT_RULE_PREFIX, ruleName].join(''));
}

function isPrimitive(obj: unknown): obj is GDCJSPrimitive {
  const t = typeof obj;
  const res = [
    'number',
    'string',
    'symbol',
    'boolean',
    'bigint',
    'null',
    'undefined',
  ].includes(t);
  return res;
}

function clonePrimitive({
  src,
}: CloneInput<GDCJSPrimitive>): GDCResult<GDCJSPrimitive> {
  return {
    couldNotClone: false,
    cloned: src,
    problems: [],
  };
}

const GDC_DEFAULT_RULE_FOR_PRIMITIVE: GDCRule<GDCJSPrimitive> = {
  id: gdcDefaultRuleId('primitive'),
  priority: 0,
  test: isPrimitive,
  clone: clonePrimitive,
};

function isPlainObject(obj: unknown): obj is object {
  const res =
    !!obj && typeof obj === 'object' && obj.constructor.name === 'Object';
  return res;
}

function cloneObjectOwnProperties(
  src: any,
  cloner: GDeepCloner,
  ctx: GDCContext,
): GDCResult<any> {
  const names = Object.getOwnPropertyNames(src);
  const symbols = Object.getOwnPropertySymbols(src);
  const newObj: any = {};
  const allProblems: GException[] = [];
  names.forEach((n) => {
    const { cloned, problems } = cloner.cloneInContext(src[n], ctx);
    allProblems.push(...problems);
    newObj[n] = cloned;
  });
  symbols.forEach((s) => {
    const { cloned, problems } = cloner.cloneInContext(src[s], ctx);
    allProblems.push(...problems);
    newObj[s] = cloned;
  });
  return { cloned: newObj, problems: [], couldNotClone: false };
}

function clonePrototypeChainOf(
  src: any,
  cloner: GDeepCloner,
  ctx: GDCContext,
): GDCResult<any> {
  const proto = Object.getPrototypeOf(src);
  if (proto === Object.prototype) {
    return { cloned: Object.prototype, problems: [], couldNotClone: false };
  }
  const { cloned: protoClone, problems: ownCloningProblems } =
    cloneObjectOwnProperties(proto, cloner, ctx);
  const { cloned: protoCloneProtoClone, problems: protoCloningProblems } =
    clonePrototypeChainOf(proto, cloner, ctx);
  return {
    cloned: Object.setPrototypeOf(protoClone, protoCloneProtoClone),
    problems: [...ownCloningProblems, ...protoCloningProblems],
    couldNotClone: false,
  };
}

function clonePlainObject({
  src,
  cloner,
  ctx,
}: CloneInput<object>): GDCResult<object> {
  const { cloned: objectOwnPropertiesClone, problems: ownCloningProblems } =
    cloneObjectOwnProperties(src, cloner, ctx);
  const prototypeBehavior = cloner.getConfig().prototypeBehavior;
  switch (prototypeBehavior) {
    case GCDPrototypeBehavior.CLONE_PROTOTYPE: {
      const { cloned: clonedPrototype, problems: protoCloningProblems } =
        clonePrototypeChainOf(src, cloner, ctx);
      return {
        couldNotClone: false,
        cloned: Object.setPrototypeOf(
          objectOwnPropertiesClone,
          clonedPrototype,
        ),
        problems: [...ownCloningProblems, ...protoCloningProblems],
      };
    }
    case GCDPrototypeBehavior.REFERENCE_PROTOTYPE: {
      return {
        couldNotClone: false,
        cloned: Object.setPrototypeOf(
          objectOwnPropertiesClone,
          Object.getPrototypeOf(src),
        ),
        problems: ownCloningProblems,
      };
    }
    case GCDPrototypeBehavior.EXCLUDE_PROTOTYPE: {
      return {
        couldNotClone: false,
        cloned: objectOwnPropertiesClone,
        problems: [],
      };
    }
    default: {
      const badPrototypeBehaviorProblem = GException.new(
        'Unknown prototype behavior configured - {{info.prototypeBehavior}}, falling back to {{info.fallbackPrototypeBehavior}}',
        {
          info: {
            prototypeBehavior,
            fallbackPrototypeBehavior: GCDPrototypeBehavior.REFERENCE_PROTOTYPE,
          },
        },
      );
      return {
        couldNotClone: false,
        cloned: Object.setPrototypeOf(
          objectOwnPropertiesClone,
          Object.getPrototypeOf(src),
        ),
        problems: [...ownCloningProblems, badPrototypeBehaviorProblem],
      };
    }
  }
}

const GDC_DEFAULT_RULE_FOR_PLAIN_OBJECT: GDCRule<object> = {
  id: gdcDefaultRuleId('object'),
  priority: 0,
  test: isPlainObject,
  clone: clonePlainObject,
};

const GDC_DEFAULT_RULES_MAP: Record<string | symbol, GDCRule> =
  Object.fromEntries(
    [GDC_DEFAULT_RULE_FOR_PRIMITIVE, GDC_DEFAULT_RULE_FOR_PLAIN_OBJECT].map(
      (r) => [r.id, r],
    ),
  );

const GDC_DEFAULT_CONFIG: GDCConfig = {
  fallbackRuleId: GDC_DEFAULT_RULE_FOR_PLAIN_OBJECT.id,
  prototypeBehavior: GCDPrototypeBehavior.REFERENCE_PROTOTYPE,
  rules: GDC_DEFAULT_RULES_MAP,
};

function mergeTwoConfigs(
  cfg0: GDCConfig,
  cfg1?: Partial<GDCConfig>,
): GDCConfig {
  if (cfg0 === cfg1 || cfg1 === undefined) {
    return cfg0;
  }
  return {
    ...cfg0,
    ...cfg1,
    rules: { ...cfg0.rules, ...(cfg1?.rules || {}) },
  };
}

interface GDCResult<T> {
  couldNotClone: boolean;
  cloned: T | null;
  problems: GException[];
}

function applyFallbackRule<T>(
  self: GDeepCloner,
  src: unknown,
  ctx: GDCContext,
): GDCResult<T> {
  const fallbackRuleId = self.getConfig().fallbackRuleId;
  if (!fallbackRuleId) {
    return {
      couldNotClone: true,
      cloned: null,
      problems: [
        GException.new(`Fallback rule id is falsy - {{info.fallbackRuleId}}`, {
          info: { fallbackRuleId },
        }),
      ],
    };
  }
  const fallbackRule = self.getConfig().rules[fallbackRuleId];
  if (!fallbackRule) {
    return {
      couldNotClone: true,
      cloned: null,
      problems: [
        GException.new(
          'Fallback rule not found by id {{info.fallbackRuleId}}',
          {
            info: { fallbackRuleId },
          },
        ),
      ],
    };
  }
  return fallbackRule.clone({
    src,
    cloner: self,
    rule: fallbackRule,
    ctx,
  });
}

interface GDCSelectedRuleResult {
  rule: GDCRule | null;
  problems: GException[];
}

function selectMaxPriorityRules(rules: GDCRule[]): GDCRule[] {
  let maxPriorityRules: GDCRule[] = [];
  let maxPriority = 0;
  for (const rule of rules) {
    if (rule.priority === maxPriority) {
      maxPriorityRules.push(rule);
    } else if (rule.priority > maxPriority) {
      maxPriority = rule.priority;
      maxPriorityRules = [rule];
    }
  }
  return maxPriorityRules;
}

function selectRuleToApply(rules: GDCRule[]): GDCSelectedRuleResult {
  const maxPriorityRules = selectMaxPriorityRules(rules);
  const problems: GException[] = [];
  if (maxPriorityRules.length === 1) {
    return {
      rule: maxPriorityRules[0] as GDCRule,
      problems,
    };
  }
  problems.push(
    GException.new('Several rules match with same priority {{info.ruleIds}}'),
  );
  // try to find a default rule among them
  const defaultRules = maxPriorityRules.filter(
    (r) => !!GDC_DEFAULT_RULES_MAP[r.id],
  );
  if (defaultRules.length === 0) {
    return {
      rule: null,
      problems,
    };
  }
  if (defaultRules.length === 1) {
    return {
      rule: defaultRules[0] as GDCRule,
      problems,
    };
  }
  problems.push(
    GException.new(
      `CRITICAL! Several matching default rules - {{info.ruleIds}}`,
      { info: { ruleIds: defaultRules.map((r) => r.id) } },
    ),
  );
  return {
    rule: null,
    problems,
  };
}

function withProblems<T>(
  problems: GException[],
  result: GDCResult<T>,
): GDCResult<T> {
  return {
    ...result,
    problems: [...problems, ...result.problems],
  };
}

function applyOneOfSeveralRules<T>(
  self: GDeepCloner,
  src: unknown,
  ctx: GDCContext,
  rules: GDCRule[],
): GDCResult<T> {
  // const rules = selectMaxPriorityRules
  const { rule, problems: selectingProblems } = selectRuleToApply(rules);
  if (rule !== null) {
    return withProblems(
      selectingProblems,
      rule.clone({
        src,
        cloner: self,
        rule,
        ctx,
      }),
    );
  }
  return withProblems(selectingProblems, applyFallbackRule<T>(self, src, ctx));
}

export class GDeepCloner {
  private config: GDCConfig;

  constructor(config?: Partial<GDCConfig>) {
    this.config = mergeTwoConfigs(GDC_DEFAULT_CONFIG, config);
  }

  static new(config?: Partial<GDCConfig>): GDeepCloner {
    return new GDeepCloner(config);
  }

  setConfig(config: GDCConfig): this {
    this.config = config;
    return this;
  }

  getConfig(): GDCConfig {
    return this.config;
  }

  findMatchingRules<T>(src: T, ctx?: GDCContext): GDCRule<T>[] {
    const ctxEffective = ctx || new GDCContext();
    const names = Object.getOwnPropertyNames(this.config.rules);
    const symbols = Object.getOwnPropertySymbols(this.config.rules);
    const rules: GDCRule<T>[] = [];
    names.forEach((n) => {
      const r = this.config.rules[n] as GDCRule;
      if (r.test(src, ctxEffective)) {
        rules.push(r);
      }
    });
    symbols.forEach((s) => {
      const r = this.config.rules[s] as GDCRule;
      if (r.test(src, ctxEffective)) {
        rules.push(r);
      }
    });
    return rules;
  }

  cloneInContext<T>(src: T, ctx: GDCContext): GDCResult<T> {
    const allFound: GDCRule<T>[] = this.findMatchingRules(src, ctx);
    if (allFound.length === 0) {
      return withProblems(
        [
          GException.new(
            'Could not find matching rule, falling back to rule id {{info.fallbackRuleId}}',
          ).setInfo({
            fallbackRuleId: this.getConfig().fallbackRuleId,
          }),
        ],
        applyFallbackRule(this, src, ctx),
      );
    }
    if (allFound.length === 1) {
      const rule = allFound[0] as GDCRule<T>;
      return rule.clone({
        src,
        cloner: this,
        rule,
        ctx,
      });
    }
    return withProblems(
      [
        GException.new('Multiple matching rules - {{info.ruleIds}}', {
          info: {
            ruleIds: allFound.map((rule) => rule.id),
          },
        }),
      ],
      applyOneOfSeveralRules(this, src, ctx, allFound),
    );
  }

  clone<T>(src: T, config?: Partial<GDCConfig>): GDCResult<T> {
    const effectiveConfig = mergeTwoConfigs(this.config, config);
    const effectiveCloner = GDeepCloner.new().setConfig(effectiveConfig);
    const ctx = new GDCContext();
    return effectiveCloner.cloneInContext(src, ctx);
  }
}
