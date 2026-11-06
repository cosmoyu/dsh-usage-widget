window.__ModuleLoader__.load({
  id: 'dshcost-skill',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useEffect, useLayoutEffect, useRef, useState } = React

    const COPY = {
      zh: {
        title: '用量',
        currentRound: '本轮对话',
        todaySummary: '今日汇总',
        input: '输入',
        output: '输出',
        cost: '花费',
        cache: '缓存命中',
        lastTurns: '最近 10 轮',
        noTurns: '暂无轮次',
        peak: '高峰',
        offpeak: '低谷',
        weekend: '周末',
        holiday: '假期',
        refresh: '刷新',
        loading: '读取中',
        unpriced: '部分模型未定价',
        until: '距',
        switching: '即将切换',
      },
      en: {
        title: 'Usage',
        currentRound: 'This turn',
        todaySummary: 'Today summary',
        input: 'Input',
        output: 'Output',
        cost: 'Cost',
        cache: 'Cache',
        lastTurns: 'Last 10 turns',
        noTurns: 'No turns yet',
        peak: 'Peak',
        offpeak: 'Off-peak',
        weekend: 'Weekend',
        holiday: 'Holiday',
        refresh: 'Refresh',
        loading: 'Loading',
        unpriced: 'Some models are unpriced',
        until: 'to',
        switching: 'switching',
      },
      de: {
        title: 'Nutzung',
        currentRound: 'Aktuelle Runde',
        todaySummary: 'Heutige Zusammenfassung',
        input: 'Eingabe',
        output: 'Ausgabe',
        cost: 'Kosten',
        cache: 'Cache',
        lastTurns: 'Letzte 10 Runden',
        noTurns: 'Noch keine Runden',
        peak: 'Spitzenzeit',
        offpeak: 'Nebenzeit',
        weekend: 'Wochenende',
        holiday: 'Feiertag',
        refresh: 'Aktualisieren',
        loading: 'Wird geladen',
        unpriced: 'Einige Modelle ohne Preis',
        until: 'bis',
        switching: 'wechselt',
      },
      es: {
        title: 'Uso',
        currentRound: 'Turno actual',
        todaySummary: 'Resumen de hoy',
        input: 'Entrada',
        output: 'Salida',
        cost: 'Coste',
        cache: 'Caché',
        lastTurns: 'Últimos 10 turnos',
        noTurns: 'Sin turnos',
        peak: 'Hora punta',
        offpeak: 'Hora valle',
        weekend: 'Fin de semana',
        holiday: 'Festivo',
        refresh: 'Actualizar',
        loading: 'Cargando',
        unpriced: 'Algunos modelos sin precio',
        until: 'hasta',
        switching: 'cambiando',
      },
      fr: {
        title: 'Utilisation',
        currentRound: 'Tour actuel',
        todaySummary: 'Résumé du jour',
        input: 'Entrée',
        output: 'Sortie',
        cost: 'Coût',
        cache: 'Cache',
        lastTurns: '10 derniers tours',
        noTurns: 'Aucun tour',
        peak: 'Heure pleine',
        offpeak: 'Heure creuse',
        weekend: 'Week-end',
        holiday: 'Jour férié',
        refresh: 'Actualiser',
        loading: 'Chargement',
        unpriced: 'Certains modèles sans tarif',
        until: 'dans',
        switching: 'changement',
      },
      ja: {
        title: '使用量',
        currentRound: '今回の会話',
        todaySummary: '今日の合計',
        input: '入力',
        output: '出力',
        cost: 'コスト',
        cache: 'ヒット',
        lastTurns: '直近10ターン',
        noTurns: 'ターンなし',
        peak: 'ピーク',
        offpeak: 'オフピーク',
        weekend: '週末',
        holiday: '祝日',
        refresh: '更新',
        loading: '読み込み中',
        unpriced: '一部モデルは価格未設定',
        until: 'あと',
        switching: '切り替え中',
      },
      pt: {
        title: 'Uso',
        currentRound: 'Turno atual',
        todaySummary: 'Resumo de hoje',
        input: 'Entrada',
        output: 'Saída',
        cost: 'Custo',
        cache: 'Cache',
        lastTurns: 'Últimos 10 turnos',
        noTurns: 'Sem turnos',
        peak: 'Pico',
        offpeak: 'Fora de pico',
        weekend: 'Fim de semana',
        holiday: 'Feriado',
        refresh: 'Atualizar',
        loading: 'Carregando',
        unpriced: 'Alguns modelos sem preço',
        until: 'até',
        switching: 'mudando',
      },
      ru: {
        title: 'Использование',
        currentRound: 'Текущий ход',
        todaySummary: 'Итоги дня',
        input: 'Вход',
        output: 'Выход',
        cost: 'Цена',
        cache: 'Кэш',
        lastTurns: 'Последние 10 ходов',
        noTurns: 'Ходов пока нет',
        peak: 'Пик',
        offpeak: 'Вне пика',
        weekend: 'Выходные',
        holiday: 'Праздник',
        refresh: 'Обновить',
        loading: 'Загрузка',
        unpriced: 'Некоторые модели без цены',
        until: 'до',
        switching: 'переключение',
      },
    }

    function localeKeyOf(active) {
      const value = String(active ?? '').toLowerCase()
      if (value.startsWith('zh')) return 'zh'
      if (value.startsWith('de')) return 'de'
      if (value.startsWith('es')) return 'es'
      if (value.startsWith('fr')) return 'fr'
      if (value.startsWith('ja')) return 'ja'
      if (value.startsWith('pt')) return 'pt'
      if (value.startsWith('ru')) return 'ru'
      return 'en'
    }

    function resolveLocale(ctx) {
      try {
        const active = ctx.get('locale')?.getSnapshot?.().active
        if (typeof active === 'string' && active.length > 0) return active
      } catch { /* Fall through to the browser. */ }
      return typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'zh'
    }

    function compact(value) {
      const n = Math.max(0, Number(value) || 0)
      if (n < 1000) return String(Math.round(n))
      if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0).replace(/\.0$/, '')}K`
      return `${(n / 1_000_000).toFixed(n < 10_000_000 ? 1 : 0).replace(/\.0$/, '')}M`
    }

    function money(value, currency, digits = 2) {
      if (value === null || value === undefined || !Number.isFinite(Number(value))) return '—'
      const n = Number(value)
      const symbol = currency === 'USD' ? '$' : '¥'
      const effective = n > 0 && n < 0.01 ? 4 : digits
      return symbol + n.toFixed(effective)
    }

    function normalizeResult(result) {
      if (result && typeof result === 'object' && result.ok === true && result.value && typeof result.value === 'object') return result.value
      return result
    }

    /** One shared poller for the always-visible footer card. */
    function createUsageStore(api) {
      let snapshot = { state: null, error: '', busy: false, loaded: false }
      const listeners = new Set()
      let timer = null
      let inFlight = false
      let disposed = false

      const notify = () => {
        for (const listener of listeners) listener()
      }
      const set = patch => {
        snapshot = { ...snapshot, ...patch }
        notify()
      }
      const load = async (force = false) => {
        if (!api || disposed || inFlight) return
        inFlight = true
        if (force) set({ busy: true, error: '' })
        try {
          const result = await (force ? api.refresh() : api.getState())
          const value = normalizeResult(result)
          if (value && typeof value === 'object' && value.balance && Array.isArray(value.turns)) {
            set({ state: value, error: '', loaded: true, busy: false })
          } else {
            set({ error: '读取失败', loaded: true, busy: false })
          }
        } catch (reason) {
          set({ error: reason instanceof Error ? reason.message : String(reason), loaded: true, busy: false })
        } finally {
          inFlight = false
        }
      }
      const onVisibility = () => {
        if (!disposed && !document.hidden) load(false)
      }
      const start = () => {
        if (timer !== null) return
        load(false)
        timer = setInterval(() => {
          if (!disposed && !document.hidden) load(false)
        }, 20_000)
        document.addEventListener('visibilitychange', onVisibility)
      }
      const dispose = () => {
        disposed = true
        if (timer !== null) clearInterval(timer)
        timer = null
        document.removeEventListener('visibilitychange', onVisibility)
        listeners.clear()
      }
      return {
        start,
        dispose,
        refresh: () => load(true),
        subscribe(listener) {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
        getSnapshot: () => snapshot,
      }
    }

    const useSync = React.useSyncExternalStore ?? function fallbackSync(subscribe, getSnapshot) {
      const [value, setValue] = useState(getSnapshot)
      useEffect(() => subscribe(() => setValue(getSnapshot())), [subscribe, getSnapshot])
      return value
    }

    function useNow(intervalMs = 1000) {
      const [now, setNow] = useState(() => Date.now())
      useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), intervalMs)
        return () => clearInterval(timer)
      }, [intervalMs])
      return now
    }

    function formatDuration(ms, localeKey = 'en') {
      const total = Math.max(0, Math.floor(ms / 1000))
      const days = Math.floor(total / 86400)
      const hours = Math.floor((total % 86400) / 3600)
      const minutes = Math.floor((total % 3600) / 60)
      const seconds = total % 60
      const units = {
        zh: ['天', '小时', ''],
        ja: ['日', '時間', ''],
        ru: ['д', 'ч', ' '],
        de: ['T', 'Std', ' '],
        fr: ['j', 'h', ' '],
        es: ['d', 'h', ' '],
        pt: ['d', 'h', ' '],
        en: ['d', 'h', ' '],
      }[localeKey] ?? ['d', 'h', ' ']
      if (days > 0) return `${days}${units[0]}${units[2]}${hours}${units[1]}`
      if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      return `${minutes}:${String(seconds).padStart(2, '0')}`
    }

    const CSS = `
      .ac-card {
        box-sizing: border-box;
        width: 100%;
        margin: 0 0 6px;
        padding: 8px 6px 8px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 14px;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-primary);
        font-size: 11px;
        line-height: 1.35;
        box-shadow: 0 2px 10px rgba(0, 0, 0, .14);
        -webkit-app-region: no-drag;
      }
      .ac-card-head { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
      .ac-card-title { color: var(--dsw-alias-label-secondary); font-size: 11px; font-weight: 650; letter-spacing: .01em; }
      .ac-iconbtn {
        display: grid;
        place-items: center;
        width: 22px;
        height: 22px;
        padding: 0;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        cursor: pointer;
        flex: none;
      }
      .ac-iconbtn:hover { background: var(--dsw-alias-interactive-bg-hover, color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent)); color: var(--dsw-alias-label-primary); }
      .ac-iconbtn:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: 1px; }
      .ac-top { display: flex; align-items: center; padding: 8px 0 6px; }
      .ac-balance { flex: 1 1 auto; min-width: 0; }
      .ac-amount { overflow: hidden; min-width: 0; font-size: 27px; font-weight: 700; letter-spacing: -.04em; line-height: 1.05; font-variant-numeric: tabular-nums; text-overflow: ellipsis; white-space: nowrap; }
      .ac-currency { margin-left: 5px; color: var(--dsw-alias-label-secondary); font-size: 9px; font-weight: 500; letter-spacing: 0; }

      .ac-flip-scene { perspective: 700px; outline: none; -webkit-app-region: no-drag; }
      .ac-flip { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform .55s cubic-bezier(.2, 1.15, .3, 1); will-change: transform; }
      .ac-face {
        position: absolute;
        inset: 0;
        box-sizing: border-box;
        overflow: hidden;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 9px;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-primary);
        box-shadow: var(--ac-shadow, 0 1px 3px rgba(0,0,0,.14));
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        transition: box-shadow .2s ease;
      }
      .ac-face-front::after,
      .ac-face-back::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(110px circle at var(--mx, 50%) var(--my, 0%), color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent), transparent 62%);
        opacity: 0;
        transition: opacity .2s ease;
        pointer-events: none;
      }
      .ac-flip-scene:hover .ac-face-front::after,
      .ac-flip-scene:hover .ac-face-back::after { opacity: 1; }
      .ac-face-back {
        transform: rotateY(180deg);
        border: 0;
        background: linear-gradient(160deg, color-mix(in srgb, var(--dsw-alias-bg-layer-1) 88%, var(--dsw-alias-label-primary) 4%), var(--dsw-alias-bg-layer-1));
      }
      .ac-round-flip { height: 80px; margin-top: 6px; }
      .ac-round-flip .ac-face {
        border: 0;
        border-radius: 11px;
        padding: 6px 8px 5px;
        background: linear-gradient(160deg, color-mix(in srgb, var(--dsw-alias-bg-layer-1) 86%, var(--dsw-alias-label-primary) 5%), var(--dsw-alias-bg-layer-1));
        box-shadow: var(--ac-shadow, 0 4px 10px rgba(0,0,0,.24), inset 0 1px 0 color-mix(in srgb, var(--dsw-alias-label-primary) 9%, transparent));
      }
      .ac-round-card { display: flex; flex-direction: column; gap: 5px; height: 100%; }
      .ac-round-head { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
      .ac-round-title-wrap { display: flex; align-items: center; gap: 4px; min-width: 0; }
      .ac-round-title-wrap .ac-ico { width: 12px; height: 12px; color: var(--dsw-alias-label-secondary); flex: none; }
      .ac-round-title { color: var(--dsw-alias-label-primary); font-size: 11px; font-weight: 650; white-space: nowrap; }
      .ac-round-chevron { width: 10px; height: 10px; color: var(--dsw-alias-label-secondary); flex: none; }
      .ac-round-grid { display: grid; grid-template-columns: 1fr 1fr 1.7fr 1.1fr; align-items: stretch; flex: 1; min-height: 0; }
      .ac-round-cell { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; min-width: 0; padding: 0 3px; border-radius: 0; background: transparent; }
      .ac-round-cell + .ac-round-cell { border-left: 1px solid var(--dsw-alias-border-l1); }
      .ac-round-label { display: flex; align-items: center; justify-content: center; gap: 3px; width: 100%; color: var(--dsw-alias-label-secondary); font-size: 10px; white-space: nowrap; }
      .ac-round-label .ac-ico { width: 11px; height: 11px; flex: none; }
      .ac-round-label-text { display: block; flex: 0 1 auto; min-width: 0; max-width: calc(100% - 14px); overflow: hidden; white-space: nowrap; text-align: left; font-size: 10px; }
      .ac-round-value { display: block; overflow: hidden; width: 100%; max-width: 100%; color: var(--dsw-alias-label-primary); font-size: 18px; font-weight: 650; font-variant-numeric: tabular-nums; text-align: center; text-overflow: clip; white-space: nowrap; }
      .ac-round-unit { color: var(--dsw-alias-label-secondary); font-size: .66em; font-weight: 500; letter-spacing: 0; }
      .ac-round-unit.prefix { margin-right: 1px; }
      .ac-round-unit.suffix { margin-left: 1px; }
      .ac-round-cell.input .ac-ico { color: var(--dsw-alias-state-business-primary); }
      .ac-round-cell.output .ac-ico { color: var(--dsw-alias-state-success-primary); }
      .ac-round-cell.cache .ac-ico { color: var(--dsw-alias-state-warn-primary); }
      .ac-round-cell.cost .ac-ico { color: var(--dsw-alias-state-success-primary); }

      .ac-peak {
        margin-top: 7px;
        padding: 5px 0 0;
        border: 0;
        background: transparent;
        box-shadow: none;
      }
      .ac-peak-head { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
      .ac-peak-phase { display: inline-flex; align-items: center; gap: 4px; font-size: 9px; font-weight: 650; white-space: nowrap; }
      .ac-peak-phase i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: none; }
      .ac-peak-count { color: var(--dsw-alias-label-secondary); font-size: 8px; font-variant-numeric: tabular-nums; white-space: nowrap; }
      .ac-timeline { position: relative; margin-top: 8px; }
      .ac-timeline-bar { display: flex; height: 9px; overflow: hidden; border-radius: 999px; background: var(--dsw-alias-border-l1); }
      .ac-timeline-seg { height: 100%; flex: none; }
      .ac-timeline-seg.off { background: var(--dsw-alias-state-business-primary); }
      .ac-timeline-seg.peak { background: var(--dsw-alias-state-warn-primary); }
      .ac-cursor { position: absolute; top: 0; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 6px solid var(--dsw-alias-label-primary); transform: translateX(-50%); pointer-events: none; filter: drop-shadow(0 1px 1px rgba(0,0,0,.45)); }
      .ac-timeline-labels { display: flex; justify-content: space-between; margin-top: 2px; color: var(--dsw-alias-label-secondary); font-size: 7px; font-variant-numeric: tabular-nums; }

      .ac-section { margin-top: 8px; }
      .ac-section-head { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 2px; }
      .ac-section-title { color: var(--dsw-alias-label-secondary); font-size: 10px; font-weight: 650; letter-spacing: .02em; }
      .ac-legend { display: flex; align-items: center; gap: 6px; color: var(--dsw-alias-label-secondary); font-size: 8px; white-space: nowrap; }
      .ac-legend span { display: inline-flex; align-items: center; gap: 2px; }
      .ac-legend i { width: 6px; height: 6px; border-radius: 2px; display: inline-block; }
      .ac-legend .in { background: var(--dsw-alias-state-business-primary); }
      .ac-legend .out { background: var(--dsw-alias-state-success-primary); }
      .ac-turn-chart { display: flex; align-items: flex-end; gap: 2px; height: 58px; padding: 2px 0 0; }
      .ac-turn-group { display: flex; align-items: flex-end; justify-content: center; gap: 1px; flex: 1 1 0; min-width: 0; height: 100%; }
      .ac-turn-bar { width: 50%; max-width: 7px; min-width: 1px; border-radius: 2px 2px 1px 1px; }
      .ac-turn-bar.input { background: var(--dsw-alias-state-business-primary); }
      .ac-turn-bar.output { background: var(--dsw-alias-state-success-primary); }
      .ac-turn-group:hover .ac-turn-bar { filter: brightness(1.2); }
      .ac-turn-range { display: flex; justify-content: space-between; margin-top: 2px; color: var(--dsw-alias-label-secondary); font-size: 7px; font-variant-numeric: tabular-nums; }
      .ac-empty { display: grid; place-items: center; height: 58px; color: var(--dsw-alias-label-secondary); font-size: 10px; }
      .ac-note { margin-top: 5px; color: var(--dsw-alias-label-secondary); font-size: 9px; line-height: 1.4; }
      .ac-note.warn { color: var(--dsw-alias-state-warn-primary); }
    `

    function IconWallet() {
      return h('svg', { className: 'ac-ico', viewBox: '0 0 16 16', 'aria-hidden': true },
        h('rect', { x: 2, y: 4, width: 12, height: 9, rx: 2, fill: 'none', stroke: 'currentColor', strokeWidth: 1.3 }),
        h('path', { d: 'M2 6.2h12', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3 }),
        h('circle', { cx: 11.4, cy: 9.6, r: 1.05, fill: 'currentColor' }),
      )
    }

    function IconChat() {
      return h('svg', { className: 'ac-ico', viewBox: '0 0 16 16', 'aria-hidden': true },
        h('path', { d: 'M3 3.2h10A1.8 1.8 0 0 1 14.8 5v4.4a1.8 1.8 0 0 1-1.8 1.8H8.2L5.4 13v-1.8H3A1.8 1.8 0 0 1 1.2 9.4V5A1.8 1.8 0 0 1 3 3.2z', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinejoin: 'round' }),
        h('path', { d: 'M4.2 6.3h7.6M4.2 8.7h5.4', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' }),
      )
    }

    function IconChevron() {
      return h('svg', { className: 'ac-round-chevron', viewBox: '0 0 16 16', 'aria-hidden': true },
        h('path', { d: 'M6 3.5 10.5 8 6 12.5', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      )
    }

    function IconInput() {
      return h('svg', { className: 'ac-ico', viewBox: '0 0 16 16', 'aria-hidden': true },
        h('path', { d: 'M8 2.2v6.6M5.5 6.4 8 8.9l2.5-2.5', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('path', { d: 'M2.6 12.6h10.8', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }),
      )
    }

    function IconOutput() {
      return h('svg', { className: 'ac-ico', viewBox: '0 0 16 16', 'aria-hidden': true },
        h('path', { d: 'M8 13.4V6.8M5.5 9.2 8 6.7l2.5 2.5', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('path', { d: 'M2.6 3.4h10.8', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }),
      )
    }

    function IconCache() {
      return h('svg', { className: 'ac-ico', viewBox: '0 0 16 16', 'aria-hidden': true },
        h('path', { d: 'M8.8 1.4 3.6 9h3.3l-.7 5.6L12.4 7H9.1z', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinejoin: 'round' }),
      )
    }

    function RefreshIcon() {
      return h('svg', { width: 13, height: 13, viewBox: '0 0 16 16', 'aria-hidden': true },
        h('path', { d: 'M13.4 6.2A5.6 5.6 0 1 0 14 8', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }),
        h('path', { d: 'M13.5 2.7v3.8H9.7', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      )
    }

    /** Only the round card flips; it keeps the same hover tilt. */
    function FlipCard({ className, label, front, back }) {
      const [flipped, setFlipped] = useState(false)
      const [hovering, setHovering] = useState(false)
      useEffect(() => { setFlipped(false) }, [])
      const [tilt, setTilt] = useState({ x: 0, y: 0 })
      const [glare, setGlare] = useState({ x: 50, y: 0 })
      const onPointerMove = event => {
        if (event.pointerType !== 'mouse') return
        const rect = event.currentTarget.getBoundingClientRect()
        const px = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
        const py = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
        setHovering(true)
        setTilt({ x: (0.5 - py) * 10, y: (px - 0.5) * 10 })
        setGlare({ x: px * 100, y: py * 100 })
      }
      const onPointerLeave = () => {
        setHovering(false)
        setTilt({ x: 0, y: 0 })
        setGlare({ x: 50, y: 0 })
      }
      const onClick = event => {
        if (event.target?.closest?.('button')) return
        setFlipped(value => !value)
      }
      const onKeyDown = event => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          setFlipped(value => !value)
        }
      }
      const shadow = hovering
        ? `${(-tilt.y * 1.1).toFixed(1)}px ${(7 + tilt.x * 1.1).toFixed(1)}px 16px rgba(0,0,0,.36), 0 2px 5px rgba(0,0,0,.2)`
        : '0 4px 10px rgba(0,0,0,.24)'
      const rotationY = (flipped ? 180 : 0) + tilt.y
      const transform = `translateY(${hovering ? -3 : 0}px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${rotationY.toFixed(2)}deg)`
      return h('div', {
        className: 'ac-flip-scene ' + className,
        onPointerMove,
        onPointerEnter: () => setHovering(true),
        onPointerLeave,
        onClick,
        onKeyDown,
        tabIndex: 0,
        role: 'button',
        'aria-label': label,
        'aria-pressed': flipped,
        style: {
          '--mx': `${glare.x}%`,
          '--my': `${glare.y}%`,
          '--ac-shadow': shadow,
        },
      },
        h('div', { className: 'ac-flip', style: { transform } },
          h('div', { className: 'ac-face ac-face-front' }, front),
          h('div', { className: 'ac-face ac-face-back' }, back),
        ),
      )
    }

    function PeakTimeline({ peak, t, localeKey }) {
      const now = useNow(1000)
      if (!peak || !Array.isArray(peak.timeline) || peak.timeline.length === 0) return null
      const dayStart = Number(peak.dayStart)
      const dayEnd = Number(peak.dayEnd)
      if (!Number.isFinite(dayStart) || !Number.isFinite(dayEnd) || dayEnd <= dayStart) return null
      const span = dayEnd - dayStart
      const current = peak.timeline.find(segment => now >= segment.startAt && now < segment.endAt)
      const phase = current?.phase ?? peak.phase
      const phaseLabel = phase === 'peak' ? t.peak : t.offpeak
      const suffix = peak.holiday ? ` · ${t.holiday}` : peak.weekend ? ` · ${t.weekend}` : ''
      const nextLabel = peak.nextPhase === 'peak' ? t.peak : t.offpeak
      const remaining = Math.max(0, Number(peak.nextAt) - now)
      const countdown = remaining <= 0
        ? t.switching
        : `${t.until} ${nextLabel} ${formatDuration(remaining, localeKey)}`
      const color = phase === 'peak' ? 'var(--dsw-alias-state-warn-primary)' : 'var(--dsw-alias-state-business-primary)'
      const cursorPct = Math.max(1, Math.min(99, (now - dayStart) / span * 100))
      return h('div', { className: 'ac-peak', 'aria-label': `${phaseLabel}${suffix} · ${countdown}` },
        h('div', { className: 'ac-peak-head' },
          h('span', { className: 'ac-peak-phase', style: { color } }, h('i'), `${phaseLabel}${suffix}`),
          h('span', { className: 'ac-peak-count' }, countdown),
        ),
        h('div', { className: 'ac-timeline' },
          h('div', { className: 'ac-timeline-bar' },
            peak.timeline.map((segment, index) => h('span', {
              key: index,
              className: 'ac-timeline-seg ' + (segment.phase === 'peak' ? 'peak' : 'off'),
              style: { width: `${(segment.endAt - segment.startAt) / span * 100}%` },
            })),
          ),
          h('span', { className: 'ac-cursor', style: { left: `${cursorPct}%` } }),
        ),
        h('div', { className: 'ac-timeline-labels' },
          ['00', '06', '12', '18', '24'].map(label => h('span', { key: label }, label)),
        ),
      )
    }

    function TurnChart({ turns, t, currency }) {
      const list = Array.isArray(turns) ? turns : []
      if (list.length === 0) return h('div', { className: 'ac-empty' }, t.noTurns)
      const max = Math.max(...list.flatMap(turn => [Number(turn.input) || 0, Number(turn.output) || 0]), 1)
      return h(React.Fragment, null,
        h('div', { className: 'ac-turn-chart', role: 'img', 'aria-label': t.lastTurns },
          list.map(turn => {
            const input = Number(turn.input) || 0
            const output = Number(turn.output) || 0
            const inputHeight = input > 0 ? Math.max(2, Math.round(input / max * 44)) : 0
            const outputHeight = output > 0 ? Math.max(2, Math.round(output / max * 44)) : 0
            const title = `T${turn.turn} · ${t.input} ${compact(input)} · ${t.output} ${compact(output)} · ${money(turn.cost, currency)}`
            return h('div', { className: 'ac-turn-group', key: turn.turn, title },
              h('i', { className: 'ac-turn-bar input', style: { height: `${inputHeight}px` } }),
              h('i', { className: 'ac-turn-bar output', style: { height: `${outputHeight}px` } }),
            )
          }),
        ),
        h('div', { className: 'ac-turn-range' },
          h('span', null, `T${list[0].turn}`),
          h('span', null, `T${list[list.length - 1].turn}`),
        ),
      )
    }

    function FitLabel({ icon, children, max = 10, min = 7 }) {
      const ref = useRef(null)
      useLayoutEffect(() => {
        const el = ref.current
        if (!el) return
        const fit = () => {
          if (el.clientWidth <= 0) return
          let size = max
          el.style.fontSize = `${size}px`
          while (size > min && el.scrollWidth > el.clientWidth + 0.5) {
            size -= 1
            el.style.fontSize = `${size}px`
          }
        }
        fit()
        const parent = el.parentElement
        if (!parent || typeof ResizeObserver === 'undefined') return
        const observer = new ResizeObserver(fit)
        observer.observe(parent)
        return () => observer.disconnect()
      }, [children, max, min])
      return h('div', { className: 'ac-round-label' }, icon, h('span', { ref, className: 'ac-round-label-text' }, children))
    }

    function FitText({ children, className, max = 18, min = 9 }) {
      const ref = useRef(null)
      const text = String(children)
      const match = text.match(/^([^\d]*)([\d.,]+)(.*)$/)
      const prefix = match ? match[1] : ''
      const number = match ? match[2] : text
      const suffix = match ? match[3] : ''
      useLayoutEffect(() => {
        const el = ref.current
        if (!el) return
        const fit = () => {
          if (el.clientWidth <= 0) return
          let size = max
          el.style.fontSize = `${size}px`
          while (size > min && el.scrollWidth > el.clientWidth + 0.5) {
            size -= 1
            el.style.fontSize = `${size}px`
          }
        }
        fit()
        const parent = el.parentElement
        if (!parent || typeof ResizeObserver === 'undefined') return
        const observer = new ResizeObserver(fit)
        observer.observe(parent)
        return () => observer.disconnect()
      }, [children, max, min])
      return h('b', { ref, className },
        prefix ? h('small', { className: 'ac-round-unit prefix' }, prefix) : null,
        h('span', null, number),
        suffix ? h('small', { className: 'ac-round-unit suffix' }, suffix) : null,
      )
    }

    function UsageCard({ store, wide, localeFace }) {
      const localeSnapshot = useSync(localeFace.subscribe, localeFace.getSnapshot)
      const activeLocale = String(localeSnapshot?.active ?? 'zh')
      const localeKey = localeKeyOf(activeLocale)
      const t = COPY[localeKey]
      const snapshot = useSync(store.subscribe, store.getSnapshot)
      if (wide === false) return null
      const state = snapshot.state
      const balance = state?.balance
      const today = state?.today
      const currency = balance?.currency ?? 'CNY'
      const cachePct = today?.cacheHitPct ?? null
      const cacheText = cachePct === null || cachePct === undefined ? '—' : `${Math.round(cachePct)}%`
      const turns = (state?.turns ?? []).slice(-10)

      const current = turns.length > 0 ? turns[turns.length - 1] : null
      const currentCachePct = current?.cacheHitPct ?? null
      const currentCacheText = currentCachePct === null || currentCachePct === undefined
        ? '—'
        : `${Math.round(currentCachePct)}%`
      const metricCell = (kind, icon, label, value) => h('div', { className: 'ac-round-cell ' + kind },
        h(FitLabel, { icon }, label),
        h(FitText, { className: 'ac-round-value' }, value),
      )
      const cacheCell = (pct, text) => h('div', { className: 'ac-round-cell cache' },
        h(FitLabel, { icon: h(IconCache) }, t.cache),
        h(FitText, { className: 'ac-round-value' }, text),
      )
      const roundHead = title => h('div', { className: 'ac-round-head' },
        h('div', { className: 'ac-round-title-wrap' }, h(IconChat), h('span', { className: 'ac-round-title' }, title)),
        h(IconChevron),
      )
      const roundFront = h('div', { className: 'ac-round-card' },
        roundHead(t.currentRound),
        h('div', { className: 'ac-round-grid' },
          metricCell('input', h(IconInput), t.input, compact(current?.input ?? 0)),
          metricCell('output', h(IconOutput), t.output, compact(current?.output ?? 0)),
          cacheCell(currentCachePct, currentCacheText),
          metricCell('cost', h(IconWallet), t.cost, money(current?.cost, currency)),
        ),
      )
      const roundBack = h('div', { className: 'ac-round-card' },
        roundHead(t.todaySummary),
        h('div', { className: 'ac-round-grid' },
          metricCell('input', h(IconInput), t.input, compact(today?.input ?? 0)),
          metricCell('output', h(IconOutput), t.output, compact(today?.output ?? 0)),
          cacheCell(cachePct, cacheText),
          metricCell('cost', h(IconWallet), t.cost, money(today?.cost, currency)),
        ),
      )

      return h('section', { className: 'ac-card', 'aria-label': t.title },
        h('style', null, CSS),
        h('div', { className: 'ac-card-head' },
          h('span', { className: 'ac-card-title' }, t.title),
          h('button', {
            className: 'ac-iconbtn', type: 'button',
            onClick: () => store.refresh(),
            disabled: snapshot.busy,
            title: t.refresh,
            'aria-label': t.refresh,
          }, h(RefreshIcon)),
        ),
        h('div', { className: 'ac-top' },
          h('div', { className: 'ac-balance' },
            h('div', { className: 'ac-amount' }, money(balance?.total, currency), h('small', { className: 'ac-currency' }, currency)),
          ),
        ),
        balance?.error ? h('div', { className: 'ac-note warn' }, balance.error) : null,

        h(FlipCard, {
          className: 'ac-round-flip',
          label: `${t.currentRound} / ${t.todaySummary}`,
          front: roundFront,
          back: roundBack,
        }),

        h(PeakTimeline, { peak: state?.peak, t, localeKey }),

        h('div', { className: 'ac-section' },
          h('div', { className: 'ac-section-head' },
            h('span', { className: 'ac-section-title' }, t.lastTurns),
            h('span', { className: 'ac-legend' },
              h('span', null, h('i', { className: 'in' }), t.input),
              h('span', null, h('i', { className: 'out' }), t.output),
            ),
          ),
          h(TurnChart, { turns, t, currency }),
        ),
        (today?.unpricedCalls ?? 0) > 0 ? h('div', { className: 'ac-note warn' }, t.unpriced) : null,
        snapshot.error ? h('div', { className: 'ac-note warn' }, snapshot.error) : null,
        !snapshot.loaded ? h('div', { className: 'ac-note' }, t.loading) : null,
      )
    }

    function parseIdentity(value) { return value }
    function codec(name, schema) {
      return { mode: 'strict', typeSymbol: 'dshcost-skill#' + name, schema, create: () => schema }
    }

    const stateCodec = codec('State', { parse: parseIdentity })
    const descriptors = {
      package: 'dshcost-skill',
      descriptors: [
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
    }

    async function apply(ctx) {
      const remote = ctx.remote
      if (!remote || typeof remote.$mount !== 'function') return
      let unmount
      try { unmount = await remote.$mount(descriptors) } catch (reason) {
        console.error('[dshcost-skill] remote mount failed', reason)
        return
      }
      if (typeof unmount === 'function') ctx.effect(() => () => unmount(), 'dshcost: remote contribution')
      const api = ctx.get('remote.avatarCost')
      if (api === undefined) {
        console.error('[dshcost-skill] remote.avatarCost is unavailable')
        return
      }
      const localeService = ctx.get('locale')
      const fallbackLocale = resolveLocale(ctx)
      const fallbackSnapshot = { active: fallbackLocale, locales: [], revision: 0 }
      const localeFace = {
        subscribe(listener) {
          try {
            if (localeService && typeof localeService.subscribe === 'function') return localeService.subscribe(listener)
          } catch { /* Fall back to a static locale. */ }
          return () => {}
        },
        getSnapshot() {
          try {
            const snapshot = localeService?.getSnapshot?.()
            if (snapshot && typeof snapshot.active === 'string' && snapshot.active.length > 0) return snapshot
          } catch { /* Fall back to the initial locale. */ }
          return fallbackSnapshot
        },
      }
      const titleOf = snapshot => COPY[localeKeyOf(snapshot?.active ?? fallbackLocale)].title
      const slots = ctx.get('slots')
      if (slots === undefined || typeof slots.inject !== 'function') return
      const store = createUsageStore(api)
      ctx.effect(() => () => store.dispose(), 'dshcost: usage polling')
      store.start()
      slots.inject('sidebar.footer.action', () => slots.register({
        name: 'sidebar.footer.action',
        id: 'dshcost-card',
        order: -10,
        label: () => titleOf(localeFace.getSnapshot()),
        inject: () => ({ store, localeFace }),
      }, UsageCard))
    }

    return { inject: ['remote'], apply }
  },
})

