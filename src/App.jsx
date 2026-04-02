import { useEffect, useMemo, useState } from 'react'
import { fetchDashboardPrices, MARKET_CONFIG, REFRESH_INTERVAL_MS } from './marketData'

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return 'Waiting for data'
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(timestamp)
}

function GlobalFinanceLogo() {
  return (
    <svg
      viewBox="0 0 80 80"
      className="h-14 w-14 drop-shadow-[0_0_24px_rgba(59,130,246,0.35)]"
      role="img"
      aria-label="Global Finance logo"
    >
      <defs>
        <linearGradient id="hub-glow" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="30" fill="none" stroke="url(#hub-glow)" strokeWidth="3.5" opacity="0.95" />
      <path
        d="M16 40h48M22 26c8 5 28 5 36 0M22 54c8-5 28-5 36 0M40 10c-8 8-12 18-12 30s4 22 12 30c8-8 12-18 12-30s-4-22-12-30Z"
        fill="none"
        stroke="url(#hub-glow)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 43.5 36.5 35l8 6.5L55 29"
        fill="none"
        stroke="#f8fafc"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PriceCard({ market }) {
  const isPositive = market.price >= market.open
  const movement = market.price - market.open
  const movementLabel = `${isPositive ? '+' : ''}${market.formatter(Math.abs(movement))}`

  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-white/12 bg-white/8 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-white/20">
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${market.accent}`} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{market.symbol}</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{market.label}</h3>
        </div>
        <div
          className={`rounded-full border px-3 py-1 text-xs font-medium tracking-[0.24em] ${
            isPositive
              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
              : 'border-rose-400/30 bg-rose-400/10 text-rose-300'
          }`}
        >
          {isPositive ? 'UP' : 'DOWN'}
        </div>
      </div>

      <div className="mt-10 flex items-end justify-between gap-4">
        <div>
          <p className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{market.formatter(market.price)}</p>
          <p className="mt-3 text-sm text-slate-400">Open {market.formatter(market.open)}</p>
        </div>
        <div className="text-right">
          <p
            className={`text-sm font-medium ${
              isPositive ? 'text-emerald-300' : 'text-rose-300'
            }`}
          >
            {isPositive ? '+' : '-'}
            {movementLabel.replace('-', '')}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">Session move</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-slate-300">
        <div className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
          <p className="text-slate-500">High</p>
          <p className="mt-2 font-medium text-white">{market.formatter(market.high)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
          <p className="text-slate-500">Low</p>
          <p className="mt-2 font-medium text-white">{market.formatter(market.low)}</p>
        </div>
      </div>
    </article>
  )
}

function App() {
  const [markets, setMarkets] = useState({})
  const [isLive, setIsLive] = useState(false)
  const [isSimulated, setIsSimulated] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadPrices = async () => {
      try {
        const nextMarkets = await fetchDashboardPrices()

        if (!isMounted) {
          return
        }

        const marketArray = Object.values(nextMarkets)
        const allSimulated = marketArray.every(m => m.isSimulated)
        
        setMarkets(nextMarkets)
        setLastUpdated(new Date())
        setIsLive(!allSimulated)
        setIsSimulated(allSimulated)
      } catch {
        if (!isMounted) {
          return
        }
        setIsLive(false)
        setIsSimulated(true)
      }
    }

    loadPrices()
    const intervalId = window.setInterval(loadPrices, REFRESH_INTERVAL_MS)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  const marketCards = useMemo(
    () =>
      MARKET_CONFIG.map((market) => markets[market.key]).filter(Boolean),
    [markets],
  )

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_34%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10 sm:px-8 lg:px-10">
        <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/45 px-8 py-8 shadow-[0_40px_120px_rgba(2,6,23,0.65)] backdrop-blur-2xl sm:px-10 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_right_top,_rgba(59,130,246,0.14),_transparent_30%),radial-gradient(circle_at_left_bottom,_rgba(14,165,233,0.10),_transparent_32%)]" />
          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-4">
                <GlobalFinanceLogo />
                <div>
                  <p className="text-sm uppercase tracking-[0.4em] text-sky-300">Market Intelligence</p>
                  <p className="mt-2 text-sm text-slate-400">Professional multi-asset monitoring workspace</p>
                </div>
              </div>

              <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Market Intelligence Hub
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Track precious metals and major FX pairs in a dark, glassmorphism dashboard designed for fast visual scanning and continuous price awareness.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/8 px-5 py-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Engine Status</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full animate-pulse ${isLive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-amber-400'}`} />
                  <p className={`text-lg font-medium ${isLive ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isLive ? 'LIVE' : isSimulated ? 'Simulated Live Feed' : 'Connecting...'}
                  </p>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/8 px-5 py-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Last Refresh</p>
                <p className="mt-3 text-lg font-medium text-white">{formatTimestamp(lastUpdated)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {marketCards.length > 0 ? (
            marketCards.map((market) => <PriceCard key={market.key} market={market} />)
          ) : (
            MARKET_CONFIG.map((market) => (
              <article
                key={market.key}
                className="rounded-[28px] border border-white/10 bg-white/8 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl"
              >
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{market.symbol}</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">{market.label}</h3>
                <div className="mt-10 h-12 animate-pulse rounded-2xl bg-white/8" />
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="h-20 animate-pulse rounded-2xl bg-slate-950/35" />
                  <div className="h-20 animate-pulse rounded-2xl bg-slate-950/35" />
                </div>
              </article>
            ))
          )}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <article className="rounded-[32px] border border-white/10 bg-white/8 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Financial Engine</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Automated quote refresh every 5 seconds</h2>
            <div className="mt-6 space-y-4 text-slate-300">
              <p>
                The dashboard uses a dedicated JavaScript data engine to request live Binance API quotes for PAXG (Gold), EUR/USDT, and GBP/USDT, providing real-time liquidity insights without page reloads.
              </p>
              <p>
                Includes a built-in fallback mechanism that triggers a 'Simulated Live Feed' if the primary data source is unreachable, ensuring the portfolio experience remains interactive and dynamic at all times.
              </p>
            </div>
          </article>

          <article className="rounded-[32px] border border-white/10 bg-white/8 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Coverage</p>
            <div className="mt-6 space-y-5">
              {MARKET_CONFIG.map((market) => (
                <div
                  key={market.key}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{market.symbol}</p>
                    <p className="text-sm text-slate-500">{market.label}</p>
                  </div>
                  <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${market.accent}`} />
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  )
}

export default App
