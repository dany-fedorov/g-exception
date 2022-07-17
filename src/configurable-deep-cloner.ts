import { GProblem } from './g-problem';

class ConDCContext {}

interface ConDCCloneInput<T> {
  src: T;
  cloner: ConfigurableDeepCloner;
  rule: ConDCRule;
  ctx: ConDCContext;
}

interface ConDCRule<T = any> {
  id: string | symbol;
  priority: number;
  test: (src: T, ctx: ConDCContext) => src is T;
  clone: (input: ConDCCloneInput<T>) => ConDCResult<T>;
}

export enum GCDPrototypeBehavior {
  CLONE_PROTOTYPE = 'CLONE_PROTOTYPE',
  REFERENCE_PROTOTYPE = 'REFERENCE_PROTOTYPE',
  EXCLUDE_PROTOTYPE = 'EXCLUDE_PROTOTYPE',
}

interface ConDCConfig {
  fallbackRuleId: string | symbol;
  prototypeBehavior: GCDPrototypeBehavior;
  rules: Record<string | symbol, ConDCRule>;
}

type ConDCJSPrimitive =
  | number
  | string
  | symbol
  | boolean
  | bigint
  | null
  | undefined;

const CONDC_DEFAULT_RULE_PREFIX = '$conDC$>defaultRule.';

function conDCDefaultRuleId(ruleName: string): symbol {
  return Symbol([CONDC_DEFAULT_RULE_PREFIX, ruleName].join(''));
}

function isPrimitive(obj: unknown): obj is ConDCJSPrimitive {
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
}: ConDCCloneInput<ConDCJSPrimitive>): ConDCResult<ConDCJSPrimitive> {
  return {
    couldNotClone: false,
    cloned: src,
    problems: [],
  };
}

const CONDC_DEFAULT_RULE_FOR_PRIMITIVE: ConDCRule<ConDCJSPrimitive> = {
  id: conDCDefaultRuleId('primitive'),
  priority: 0,
  test: isPrimitive,
  clone: clonePrimitive,
};

function isPlainObject(obj: unknown): obj is object {
  const res =
    !!obj &&
    typeof obj === 'object' &&
    Object.getPrototypeOf(obj)?.constructor?.name === 'Object';
  return res;
}

function cloneObjectOwnProperties(
  src: any,
  cloner: ConfigurableDeepCloner,
  ctx: ConDCContext,
): ConDCResult<any> {
  const names = Object.getOwnPropertyNames(src);
  const symbols = Object.getOwnPropertySymbols(src);
  const newObj: any = {};
  const allProblems: GProblem[] = [];
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
  cloner: ConfigurableDeepCloner,
  ctx: ConDCContext,
): ConDCResult<any> {
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
}: ConDCCloneInput<object>): ConDCResult<object> {
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
      const badPrototypeBehaviorProblem = GProblem.new(
        'Unknown prototype behavior configured - {{prototypeBehavior}}, falling back to {{fallbackPrototypeBehavior}}',
        {
          prototypeBehavior,
          fallbackPrototypeBehavior: GCDPrototypeBehavior.REFERENCE_PROTOTYPE,
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

const CONDC_DEFAULT_RULE_FOR_PLAIN_OBJECT: ConDCRule<object> = {
  id: conDCDefaultRuleId('object'),
  priority: 0,
  test: isPlainObject,
  clone: clonePlainObject,
};

function isPlainArray(obj: unknown): obj is unknown[] {
  return (
    !!obj &&
    Array.isArray(obj) &&
    Object.getPrototypeOf(obj)?.constructor?.name === 'Array'
  );
}

function clonePlainArray({
  src,
  cloner,
  ctx,
}: ConDCCloneInput<unknown[]>): ConDCResult<unknown[]> {
  
}

const CONDC_DEFAULT_RULE_FOR_ARRAY: ConDCRule<unknown[]> = {
  id: conDCDefaultRuleId('array'),
  priority: 0,
  test: isPlainArray,
  clone: clonePlainArray,
};

const CONDC_DEFAULT_RULES_MAP: Record<string | symbol, ConDCRule> =
  Object.fromEntries(
    [
      CONDC_DEFAULT_RULE_FOR_PRIMITIVE,
      CONDC_DEFAULT_RULE_FOR_PLAIN_OBJECT,
      CONDC_DEFAULT_RULE_FOR_ARRAY,
    ].map((r) => [r.id, r]),
  );

const CONDC_DEFAULT_CONFIG: ConDCConfig = {
  fallbackRuleId: CONDC_DEFAULT_RULE_FOR_PLAIN_OBJECT.id,
  prototypeBehavior: GCDPrototypeBehavior.REFERENCE_PROTOTYPE,
  rules: CONDC_DEFAULT_RULES_MAP,
};

function mergeTwoConfigs(
  cfg0: ConDCConfig,
  cfg1?: Partial<ConDCConfig>,
): ConDCConfig {
  if (cfg0 === cfg1 || cfg1 === undefined) {
    return cfg0;
  }
  return {
    ...cfg0,
    ...cfg1,
    rules: { ...cfg0.rules, ...(cfg1?.rules || {}) },
  };
}

interface ConDCResult<T> {
  couldNotClone: boolean;
  cloned: T | null;
  problems: GProblem[];
}

function applyFallbackRule<T>(
  self: ConfigurableDeepCloner,
  src: unknown,
  ctx: ConDCContext,
): ConDCResult<T> {
  const fallbackRuleId = self.getConfig().fallbackRuleId;
  if (!fallbackRuleId) {
    return {
      couldNotClone: true,
      cloned: null,
      problems: [
        GProblem.new(`Fallback rule id is falsy - {{fallbackRuleId}}`, {
          fallbackRuleId: String(fallbackRuleId),
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
        GProblem.new('Fallback rule not found by id {{fallbackRuleId}}', {
          fallbackRuleId: String(fallbackRuleId),
        }),
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

interface ConDCSelectedRuleResult {
  rule: ConDCRule | null;
  problems: GProblem[];
}

function selectMaxPriorityRules(rules: ConDCRule[]): ConDCRule[] {
  let maxPriorityRules: ConDCRule[] = [];
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

function selectRuleToApply(rules: ConDCRule[]): ConDCSelectedRuleResult {
  const maxPriorityRules = selectMaxPriorityRules(rules);
  const problems: GProblem[] = [];
  if (maxPriorityRules.length === 1) {
    return {
      rule: maxPriorityRules[0] as ConDCRule,
      problems,
    };
  }
  problems.push(
    GProblem.new('Several rules match with same priority {{ruleIds}}', {
      ruleIds: rules.map((r) => String(r.id)),
    }),
  );
  // try to find a default rule among them
  const defaultRules = maxPriorityRules.filter(
    (r) => !!CONDC_DEFAULT_RULES_MAP[r.id],
  );
  if (defaultRules.length === 0) {
    return {
      rule: null,
      problems,
    };
  }
  if (defaultRules.length === 1) {
    return {
      rule: defaultRules[0] as ConDCRule,
      problems,
    };
  }
  problems.push(
    GProblem.new(`CRITICAL! Several matching default rules - {{ruleIds}}`, {
      ruleIds: defaultRules.map((r) => String(r.id)),
    }),
  );
  return {
    rule: null,
    problems,
  };
}

function withProblems<T>(
  problems: GProblem[],
  result: ConDCResult<T>,
): ConDCResult<T> {
  return {
    ...result,
    problems: [...problems, ...result.problems],
  };
}

function applyOneOfSeveralRules<T>(
  self: ConfigurableDeepCloner,
  src: unknown,
  ctx: ConDCContext,
  rules: ConDCRule[],
): ConDCResult<T> {
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

export class ConfigurableDeepCloner {
  private config: ConDCConfig;

  constructor(config?: Partial<ConDCConfig>) {
    this.config = mergeTwoConfigs(CONDC_DEFAULT_CONFIG, config);
  }

  static new(config?: Partial<ConDCConfig>): ConfigurableDeepCloner {
    return new ConfigurableDeepCloner(config);
  }

  setConfig(config: ConDCConfig): this {
    this.config = config;
    return this;
  }

  getConfig(): ConDCConfig {
    return this.config;
  }

  findMatchingRules<T>(src: T, ctx?: ConDCContext): ConDCRule<T>[] {
    const ctxEffective = ctx || new ConDCContext();
    const names = Object.getOwnPropertyNames(this.config.rules);
    const symbols = Object.getOwnPropertySymbols(this.config.rules);
    const rules: ConDCRule<T>[] = [];
    names.forEach((n) => {
      const r = this.config.rules[n] as ConDCRule;
      if (r.test(src, ctxEffective)) {
        rules.push(r);
      }
    });
    symbols.forEach((s) => {
      const r = this.config.rules[s] as ConDCRule;
      if (r.test(src, ctxEffective)) {
        rules.push(r);
      }
    });
    return rules;
  }

  cloneInContext<T>(src: T, ctx: ConDCContext): ConDCResult<T> {
    const allFound: ConDCRule<T>[] = this.findMatchingRules(src, ctx);
    if (allFound.length === 0) {
      return withProblems(
        [
          GProblem.new(
            'Could not find matching rule, falling back to rule id {{fallbackRuleId}}',
            {
              fallbackRuleId: String(this.getConfig().fallbackRuleId),
            },
          ),
        ],
        applyFallbackRule(this, src, ctx),
      );
    }
    if (allFound.length === 1) {
      const rule = allFound[0] as ConDCRule<T>;
      return rule.clone({
        src,
        cloner: this,
        rule,
        ctx,
      });
    }
    return withProblems(
      [
        GProblem.new('Multiple matching rules - {{ruleIds}}', {
          ruleIds: allFound.map((rule) => rule.id),
        }),
      ],
      applyOneOfSeveralRules(this, src, ctx, allFound),
    );
  }

  clone<T>(src: T, config?: Partial<ConDCConfig>): ConDCResult<T> {
    const effectiveConfig = mergeTwoConfigs(this.config, config);
    const effectiveCloner =
      ConfigurableDeepCloner.new().setConfig(effectiveConfig);
    const ctx = new ConDCContext();
    return effectiveCloner.cloneInContext(src, ctx);
  }
}
