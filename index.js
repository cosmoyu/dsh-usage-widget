import { readFileSync, readdirSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import * as zlib from 'node:zlib'

/**
 * Host half of dsh-usage-widget.
 *
 * The session log is the source of truth: every committed assistant message carries
 * a usage block, so the service can derive today's tokens/calls/cost and the recent
 * seven days without maintaining a second ledger. The official account wallet is
 * read through the public deepseekAccount service; a DEEPSEEK_API_KEY balance query
 * is used only as a fallback.
 */

const SERVICE_KEY = 'usageCost'
const DAY_MS = 86_400_000
const HKT_OFFSET_MS = 8 * 3_600_000
const PEAK_WINDOWS = [[1, 4], [6, 10]]
const WEEKEND_OFFPEAK_SINCE = Date.parse('2026-08-22T16:00:00Z')
const FLASH_PRICE_BOUNDARY = Date.parse('2026-09-10T04:00:00Z')
/** Beijing dates DeepSeek treats as off-peak; extend this list every year. */
const HOLIDAYS = new Set([
  '2026-09-25', '2026-09-26', '2026-09-27',
  '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04',
  '2026-10-05', '2026-10-06', '2026-10-07',
])

const FLASH = { cacheHit: 0.003, cacheMiss: 0.15, output: 0.6 }
const FLASH_OLD = { cacheHit: 0.007, cacheMiss: 0.22, output: 0.66 }
const PRO = { cacheHit: 0.022, cacheMiss: 0.66, output: 1.98 }

let fileCache = new Map()
let lastScan = { at: 0, value: null }
let balanceCache = { at: 0, value: null }
let profileCache = { at: 0, value: null }

function number(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function dayKey(date) {
  const pad = value => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function emptyDay(key = '') {
  return {
    date: key,
    input: 0,
    output: 0,
    cacheRead: 0,
    cacheWrite: 0,
    reasoning: 0,
    tokens: 0,
    calls: 0,
    costUsd: 0,
    unpricedCalls: 0,
    cacheHitPct: null,
  }
}

function beijingDayInfo(atMs) {
  const day = Math.floor((atMs + HKT_OFFSET_MS) / DAY_MS)
  return {
    weekday: (day + 4) % 7,
    key: new Date(day * DAY_MS).toISOString().slice(0, 10),
  }
}

function isWeekend(atMs) {
  const { weekday } = beijingDayInfo(atMs)
  return weekday === 0 || weekday === 6
}

function isHoliday(atMs) {
  return HOLIDAYS.has(beijingDayInfo(atMs).key)
}

/** Beijing weekend / holiday rule used by DeepSeek's published peak schedule. */
function isPeak(atMs) {
  if (!Number.isFinite(atMs) || atMs < Date.parse('2026-08-16T16:00:00Z')) return false
  const { weekday } = beijingDayInfo(atMs)
  if (atMs >= WEEKEND_OFFPEAK_SINCE && (weekday === 0 || weekday === 6)) return false
  if (isHoliday(atMs)) return false
  const hour = new Date(atMs).getUTCHours()
  return PEAK_WINDOWS.some(([start, end]) => hour >= start && hour < end)
}

/** Current phase, the complete phase interval, and the next transition. */
function peakPhaseAt(atMs) {
  const phase = isPeak(atMs)
  const minute = Math.floor(atMs / 60_000) * 60_000
  let start = minute
  let end = minute

  const lower = atMs - 8 * DAY_MS
  for (let cursor = minute; cursor > lower; cursor -= 60_000) {
    if (isPeak(cursor - 60_000) !== isPeak(cursor)) { start = cursor; break }
    start = cursor - 60_000
  }

  const upper = atMs + 8 * DAY_MS
  for (let cursor = minute; cursor < upper; cursor += 60_000) {
    if (isPeak(cursor) !== isPeak(cursor + 60_000)) { end = cursor + 60_000; break }
    end = cursor + 60_000
  }

  if (end <= atMs) end = atMs + 60_000
  if (start >= end) start = end - 60_000
  const duration = Math.max(1, end - start)
  const day = new Date(atMs)
  day.setHours(0, 0, 0, 0)
  const dayStart = day.getTime()
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1).getTime()
  const timeline = []
  let cursor = dayStart
  while (cursor < dayEnd) {
    const segmentPhase = isPeak(cursor)
    let next = cursor + 60_000
    while (next < dayEnd && isPeak(next) === segmentPhase) next += 60_000
    timeline.push({
      startAt: cursor,
      endAt: Math.min(next, dayEnd),
      phase: segmentPhase ? 'peak' : 'offpeak',
    })
    cursor = next
  }
  return {
    phase: phase ? 'peak' : 'offpeak',
    nextPhase: isPeak(end) ? 'peak' : 'offpeak',
    startAt: start,
    endAt: end,
    nextAt: end,
    progress: Math.max(0, Math.min(100, Math.round((atMs - start) / duration * 1000) / 10)),
    weekend: isWeekend(atMs),
    holiday: isHoliday(atMs),
    dayStart,
    dayEnd,
    timeline,
  }
}

function rateFor(provider, model, atMs) {
  const p = String(provider ?? '').toLowerCase()
  const m = String(model ?? '').toLowerCase()
  if (!p.includes('deepseek') && !m.includes('deepseek')) return null
  if (m.includes('pro')) return PRO
  return atMs < FLASH_PRICE_BOUNDARY ? FLASH_OLD : FLASH
}

function callCost(usage, provider, model, atMs) {
  const rate = rateFor(provider, model, atMs)
  if (rate === null) return { usd: 0, priced: false }
  const multiplier = isPeak(atMs) ? 2 : 1
  const usd = (usage.input * rate.cacheMiss
    + usage.output * rate.output
    + usage.cacheRead * rate.cacheHit
    + usage.cacheWrite * rate.cacheHit) / 1_000_000 * multiplier
  return { usd: Number.isFinite(usd) && usd > 0 ? usd : 0, priced: true }
}

function dshHome() {
  const configured = process.env.DSH_HOME?.trim()
  return configured && configured.length > 0 ? configured : join(homedir(), '.dsh')
}

function sessionFiles(root) {
  const found = []
  const stack = [root]
  while (stack.length > 0) {
    const current = stack.pop()
    let entries
    try { entries = readdirSync(current, { withFileTypes: true }) } catch { continue }
    for (const entry of entries) {
      const full = join(current, entry.name)
      if (entry.isDirectory()) { stack.push(full); continue }
      if (!entry.isFile()) continue
      if (/^session\..+\.jsonl(\.zstd)?$/.test(entry.name)) found.push(full)
    }
  }
  return found
}

function decompressFrames(buffer) {
  const zstd = zlib.zstdDecompressSync
  if (typeof zstd !== 'function') return ''
  const magic = Buffer.from([0x28, 0xb5, 0x2f, 0xfd])
  const starts = []
  for (let i = 0; i <= buffer.length - 4; i += 1) {
    if (buffer[i] === magic[0] && buffer[i + 1] === magic[1] && buffer[i + 2] === magic[2] && buffer[i + 3] === magic[3]) starts.push(i)
  }
  if (starts.length === 0) return zstd(buffer).toString('utf8')
  const chunks = []
  for (let i = 0; i < starts.length; i += 1) {
    const start = starts[i]
    const end = i + 1 < starts.length ? starts[i + 1] : buffer.length
    try { chunks.push(zstd(buffer.subarray(start, end))) } catch { /* Ignore a damaged frame, keep the rest. */ }
  }
  return Buffer.concat(chunks).toString('utf8')
}

function parseSession(path) {
  let text
  try {
    const bytes = readFileSync(path)
    text = path.endsWith('.zstd') ? decompressFrames(bytes) : bytes.toString('utf8')
  } catch { return [] }
  const sessionId = basename(dirname(path))
  const events = []
  for (const line of text.split(/\r?\n/)) {
    if (!line) continue
    if (!line.includes('"assistant/message"') && !line.includes('"compaction/summary"')) continue
    let event
    try { event = JSON.parse(line) } catch { continue }
    const data = event?.data
    const usage = data?.usage
    if (usage === null || typeof usage !== 'object') continue
    const source = data?.message?.source ?? data?.source ?? {}
    const time = Number(event.time)
    const turn = Number(data?.turn)
    events.push({
      sessionId,
      turn: Number.isFinite(turn) && turn > 0 ? turn : null,
      time: Number.isFinite(time) && time > 0 ? time : Date.now(),
      provider: typeof source.provider === 'string' ? source.provider : (typeof data.provider === 'string' ? data.provider : ''),
      model: typeof source.model === 'string' ? source.model : (typeof data.model === 'string' ? data.model : ''),
      input: number(usage.inputTokens),
      output: number(usage.outputTokens),
      cacheRead: number(usage.cacheReadTokens),
      cacheWrite: number(usage.cacheWriteTokens),
      reasoning: number(usage.reasoningTokens),
    })
  }
  return events
}

function scanSessions(force) {
  const now = Date.now()
  if (!force && lastScan.value !== null && now - lastScan.at < 1500) return lastScan.value
  const started = Date.now()
  const files = sessionFiles(join(dshHome(), 'sessions'))
  const events = []
  const seen = new Set()
  let parsedFiles = 0
  for (const file of files) {
    let stat
    try { stat = statSync(file) } catch { continue }
    const cached = fileCache.get(file)
    let list
    if (!force && cached !== undefined && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
      list = cached.events
    } else {
      list = parseSession(file)
      parsedFiles += 1
      fileCache.set(file, { mtimeMs: stat.mtimeMs, size: stat.size, events: list })
    }
    for (const event of list) {
      // Forked sessions repeat their parent's log; count each identical event once.
      const fingerprint = `${event.time}|${event.provider}|${event.model}|${event.input}|${event.output}|${event.cacheRead}|${event.cacheWrite}|${event.reasoning}`
      if (seen.has(fingerprint)) continue
      seen.add(fingerprint)
      events.push(event)
    }
  }
  const alive = new Set(files)
  for (const file of fileCache.keys()) if (!alive.has(file)) fileCache.delete(file)

  const days = new Map()
  const turns = new Map()
  const sessionLatest = new Map()
  for (const event of events) {
    const key = dayKey(new Date(event.time))
    let day = days.get(key)
    if (day === undefined) { day = emptyDay(key); days.set(key, day) }
    day.input += event.input
    day.output += event.output
    day.cacheRead += event.cacheRead
    day.cacheWrite += event.cacheWrite
    day.reasoning += event.reasoning
    day.calls += 1
    const cost = callCost(event, event.provider, event.model, event.time)
    day.costUsd += cost.usd
    if (!cost.priced) day.unpricedCalls += 1

    if (event.turn !== null && event.sessionId) {
      const turnKey = `${event.sessionId}:${event.turn}`
      let row = turns.get(turnKey)
      if (row === undefined) {
        row = {
          sessionId: event.sessionId,
          turn: event.turn,
          input: 0,
          output: 0,
          cacheRead: 0,
          cacheWrite: 0,
          tokens: 0,
          calls: 0,
          costUsd: 0,
          cacheHitPct: null,
        }
        turns.set(turnKey, row)
      }
      row.input += event.input
      row.output += event.output
      row.cacheRead += event.cacheRead
      row.cacheWrite += event.cacheWrite
      row.tokens = row.input + row.output
      row.calls += 1
      row.costUsd += cost.usd
      const turnCacheDenom = row.input + row.cacheRead + row.cacheWrite
      row.cacheHitPct = turnCacheDenom > 0 ? Math.round(row.cacheRead / turnCacheDenom * 1000) / 10 : null
      const previous = sessionLatest.get(event.sessionId) ?? 0
      if (event.time > previous) sessionLatest.set(event.sessionId, event.time)
    }
  }

  const todayDate = new Date()
  const keys = []
  for (let offset = 6; offset >= 0; offset -= 1) {
    keys.push(dayKey(new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - offset)))
  }
  const zero = key => emptyDay(key)
  const daysOut = keys.map(key => {
    const day = days.get(key) ?? zero(key)
    const totalTokens = day.input + day.output + day.cacheRead + day.cacheWrite
    const denom = day.input + day.cacheRead + day.cacheWrite
    return {
      date: key,
      input: day.input,
      output: day.output,
      cacheRead: day.cacheRead,
      cacheWrite: day.cacheWrite,
      reasoning: day.reasoning,
      tokens: totalTokens,
      calls: day.calls,
      costUsd: day.costUsd,
      unpricedCalls: day.unpricedCalls,
      cacheHitPct: denom > 0 ? Math.round(day.cacheRead / denom * 1000) / 10 : null,
    }
  })
  const today = daysOut[daysOut.length - 1]
  const totals = daysOut.reduce((acc, day) => {
    acc.input += day.input
    acc.output += day.output
    acc.cacheRead += day.cacheRead
    acc.cacheWrite += day.cacheWrite
    acc.reasoning += day.reasoning
    acc.tokens += day.tokens
    acc.calls += day.calls
    acc.costUsd += day.costUsd
    acc.unpricedCalls += day.unpricedCalls
    return acc
  }, { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, reasoning: 0, tokens: 0, calls: 0, costUsd: 0, unpricedCalls: 0 })
  const cacheDenom = totals.input + totals.cacheRead + totals.cacheWrite
  totals.cacheHitPct = cacheDenom > 0 ? Math.round(totals.cacheRead / cacheDenom * 1000) / 10 : null
  totals.cost = 0

  let latestSession = null
  let latestTime = 0
  for (const [sessionId, time] of sessionLatest) {
    if (time >= latestTime) {
      latestTime = time
      latestSession = sessionId
    }
  }
  const turnsOut = latestSession === null ? [] : [...turns.values()]
    .filter(row => row.sessionId === latestSession)
    .sort((a, b) => a.turn - b.turn)
    .slice(-10)
    .map(({ sessionId: _sessionId, ...row }) => row)

  const value = {
    days: daysOut,
    today,
    totals,
    turns: turnsOut,
    files: files.length,
    parsedFiles,
    scanMs: Date.now() - started,
  }
  lastScan = { at: now, value }
  return value
}

function walletTotals(details) {
  const normal = Array.isArray(details?.value) ? details.value : []
  const bonus = Array.isArray(details?.bonusWallets) ? details.bonusWallets : []
  const totals = new Map()
  for (const wallet of [...normal, ...bonus]) {
    const currency = String(wallet?.currency ?? '').toUpperCase()
    if (currency !== 'CNY' && currency !== 'USD') continue
    const amount = Number(wallet?.balance)
    if (!Number.isFinite(amount)) return null
    const entry = totals.get(currency) ?? { currency, total: 0, granted: 0, toppedUp: 0 }
    entry.total += amount
    if (bonus.includes(wallet)) entry.granted += amount
    else entry.toppedUp += amount
    totals.set(currency, entry)
  }
  const picked = totals.get('CNY') ?? totals.get('USD') ?? null
  return picked
}

async function accountBalance(ctx) {
  const account = ctx?.get?.('deepseekAccount')
  if (account === undefined || typeof account.getBalance !== 'function') return null
  try {
    const details = await account.getBalance({
      version: '',
      locale: 'zh',
      timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
    })
    if (details === null || details === undefined) return null
    if (details.status !== 'ready') return null
    const picked = walletTotals(details)
    if (picked === null) return null
    return { ...picked, source: 'account' }
  } catch {
    return null
  }
}

async function apiKeyBalance() {
  const key = (process.env.DEEPSEEK_BALANCE_API_KEY || process.env.DEEPSEEK_API_KEY || '').trim()
  if (!key) return null
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8_000)
  try {
    const response = await fetch('https://api.deepseek.com/user/balance', {
      headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
      signal: controller.signal,
    })
    if (!response.ok) return null
    const data = await response.json()
    const infos = Array.isArray(data?.balance_infos) ? data.balance_infos : []
    const info = infos.find(item => item?.currency === 'CNY') ?? infos[0]
    if (info === undefined) return null
    const total = Number(info.total_balance)
    const granted = Number(info.granted_balance)
    const toppedUp = Number(info.topped_up_balance)
    if (![total, granted, toppedUp].every(Number.isFinite)) return null
    return {
      currency: info.currency === 'USD' ? 'USD' : 'CNY',
      total,
      granted,
      toppedUp,
      source: 'api',
    }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function accountProfile(ctx) {
  const now = Date.now()
  if (now - profileCache.at < 300_000) return profileCache.value
  const account = ctx?.get?.('deepseekAccount')
  let value = null
  if (account !== undefined && typeof account.getProfile === 'function') {
    try {
      const details = await account.getProfile({
        version: '',
        locale: 'zh',
        timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
      })
      if (details?.status === 'ready') {
        value = {
          name: typeof details.value?.name === 'string' ? details.value.name : (typeof details.value?.contact === 'string' ? details.value.contact : ''),
        }
      }
    } catch { value = null }
  }
  profileCache = { at: now, value }
  return value
}

function displayCurrencyOf(balance) {
  return balance?.currency === 'USD' ? 'USD' : 'CNY'
}

function fxRateOf(currency) {
  if (currency === 'USD') return 1
  const configured = Number(process.env.DSH_USAGE_COST_FX)
  return Number.isFinite(configured) && configured > 0 ? configured : 7.2
}

async function readBalance(ctx, force) {
  const now = Date.now()
  if (!force && balanceCache.value !== null && now - balanceCache.at < 45_000) return balanceCache.value
  let value = await accountBalance(ctx)
  if (value === null) value = await apiKeyBalance()
  balanceCache = { at: now, value }
  return value
}

async function getState(ctx, force) {
  const now = Date.now()
  const scan = scanSessions(force)
  const balance = await readBalance(ctx, force)

  const currency = displayCurrencyOf(balance)
  const fxRate = fxRateOf(currency)
  const toDisplay = usd => Math.round(usd * fxRate * 10_000) / 10_000
  const today = { ...scan.today, cost: toDisplay(scan.today.costUsd) }
  const days = scan.days.map(day => ({ ...day, cost: toDisplay(day.costUsd) }))
  const totals = { ...scan.totals, cost: toDisplay(scan.totals.costUsd) }
  const turns = scan.turns.map(row => ({ ...row, cost: toDisplay(row.costUsd) }))
  const peak = peakPhaseAt(now)
  const todayCost = today.cost
  const total = balance !== null && Number.isFinite(balance.total) ? balance.total : null
  const dayStart = total !== null ? total + todayCost : null
  const remainingPct = total !== null && dayStart !== null && dayStart > 0
    ? Math.max(0, Math.min(100, Math.round(total / dayStart * 1000) / 10))
    : null
  const profile = await accountProfile(ctx)
  return {
    generatedAt: now,
    balance: {
      currency,
      total,
      granted: balance !== null && Number.isFinite(balance.granted) ? balance.granted : null,
      toppedUp: balance !== null && Number.isFinite(balance.toppedUp) ? balance.toppedUp : null,
      remainingPct,
      dayStart,
      source: balance?.source ?? 'none',
      error: balance === null ? 'unavailable' : '',
    },
    today,
    days,
    totals,
    turns,
    peak,
    meta: {
      dayKey: today.date,
      timezone: (() => {
        try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' } catch { return 'UTC' }
      })(),
      fxRate,
      files: scan.files,
      parsedFiles: scan.parsedFiles,
      scanMs: scan.scanMs,
      account: profile === null ? null : {
        name: typeof profile.name === 'string' ? profile.name.slice(0, 120) : '',
      },
    },
  }
}

/**
 * The Gateway discovers Remote methods from the @Remote marker descriptor on the
 * Service prototype. This plugin is hand-written JavaScript, so write the same
 * versioned descriptor the Typert decorator writes instead of importing it.
 */
const REMOTE_METHOD_DESCRIPTOR = '@deepseek-ai/dsh-typert-protocol/remote-methods'

function markRemoteMethods(prototype, names) {
  Object.defineProperty(prototype, REMOTE_METHOD_DESCRIPTOR, {
    configurable: true,
    value: Object.freeze({
      version: 1,
      methods: Object.freeze(names.map(name => Object.freeze({
        method: name,
        invocation: Object.freeze({ kind: 'direct' }),
      }))),
    }),
  })
}

class UsageCostService {
  constructor(ctx) { this.ctx = ctx }
  async getState() { return getState(this.ctx, false) }
  async refresh() { return getState(this.ctx, true) }
}

markRemoteMethods(UsageCostService.prototype, ['getState', 'refresh'])

function createService(ctx) {
  const service = new UsageCostService(ctx)
  Object.defineProperty(service, 'typertRemote', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: { service, serviceKey: SERVICE_KEY, namespace: SERVICE_KEY },
  })
  return service
}

export function apply(ctx) {
  ctx.provide(SERVICE_KEY, createService(ctx))
}
