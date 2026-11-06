import { z } from 'zod'

const num = z.number()
const nullableNum = z.number().nullable()

const daySchema = z.object({
  date: z.string(),
  input: num,
  output: num,
  cacheRead: num,
  cacheWrite: num,
  reasoning: num,
  tokens: num,
  calls: num,
  costUsd: num,
  cost: num,
  unpricedCalls: num,
  cacheHitPct: nullableNum,
})

const balanceSchema = z.object({
  currency: z.enum(['CNY', 'USD']),
  total: nullableNum,
  granted: nullableNum,
  toppedUp: nullableNum,
  remainingPct: nullableNum,
  dayStart: nullableNum,
  source: z.enum(['account', 'api', 'none']),
  error: z.string(),
})

const turnSchema = z.object({
  turn: num,
  input: num,
  output: num,
  cacheRead: num,
  cacheWrite: num,
  cacheHitPct: nullableNum,
  tokens: num,
  calls: num,
  costUsd: num,
  cost: num,
})

const peakSchema = z.object({
  phase: z.enum(['peak', 'offpeak']),
  nextPhase: z.enum(['peak', 'offpeak']),
  startAt: num,
  endAt: num,
  nextAt: num,
  progress: num,
  weekend: z.boolean(),
  holiday: z.boolean(),
  dayStart: num,
  dayEnd: num,
  timeline: z.array(z.object({
    startAt: num,
    endAt: num,
    phase: z.enum(['peak', 'offpeak']),
  })),
})

const stateSchema = z.object({
  generatedAt: num,
  balance: balanceSchema,
  today: daySchema,
  days: z.array(daySchema).length(7),
  totals: daySchema.omit({ date: true }),
  turns: z.array(turnSchema),
  peak: peakSchema,
  meta: z.object({
    dayKey: z.string(),
    timezone: z.string(),
    fxRate: num,
    files: num,
    parsedFiles: num,
    scanMs: num,
    account: z.object({
      name: z.string(),
      avatarUrl: z.string(),
    }).nullable(),
  }),
})

const strictCodec = (name, schema) => ({
  mode: 'strict',
  typeSymbol: 'dshcost-skill#' + name,
  schema,
  create: () => schema,
})

const stateCodec = strictCodec('State', stateSchema)

export const TYPERT = {
  package: 'dshcost-skill',
  face: 'host',
  schemas: [],
  invocations: [
    {
      id: 'dshcost-skill#avatarCost/getState',
      service: 'avatarCost',
      namespace: 'avatarCost',
      method: 'getState',
      invocation: { kind: 'direct' },
      parameters: [],
      result: stateCodec,
    },
    {
      id: 'dshcost-skill#avatarCost/refresh',
      service: 'avatarCost',
      namespace: 'avatarCost',
      method: 'refresh',
      invocation: { kind: 'direct' },
      parameters: [],
      result: stateCodec,
    },
  ],
  model: {
    services: [
      {
        description: 'Compact balance and usage snapshot for the sidebar avatar.',
        summary: 'Balance ring, seven-day usage, and today\'s token/call/cost/cache-hit summary.',
        tags: ['usage', 'balance'],
        key: 'avatarCost',
        exportName: 'default',
        members: [
          { kind: 'method', name: 'getState', signature: 'getState(): Promise<AvatarCostState>', summary: 'Read the current cached snapshot.' },
          { kind: 'method', name: 'refresh', signature: 'refresh(): Promise<AvatarCostState>', summary: 'Re-read the wallet and session logs.' },
        ],
        types: [],
      },
    ],
    events: [],
    objects: [],
  },
}

export default TYPERT
