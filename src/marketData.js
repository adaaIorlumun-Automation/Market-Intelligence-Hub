export const REFRESH_INTERVAL_MS = 5000
const BINANCE_API_URL = 'https://api.binance.com/api/v3/ticker/24hr'

export const MARKET_CONFIG = [
  {
    key: 'PAXGUSDT',
    symbol: 'XAU/USD',
    label: 'Gold (PAXG)',
    accent: 'from-amber-300/70 via-yellow-200/50 to-orange-300/70',
    binanceSymbol: 'PAXGUSDT',
    formatter: (value) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }).format(value),
  },
  {
    key: 'EURUSDT',
    symbol: 'EUR/USD',
    label: 'Euro',
    accent: 'from-sky-300/70 via-blue-200/45 to-cyan-300/70',
    binanceSymbol: 'EURUSDT',
    formatter: (value) => value.toFixed(4),
  },
  {
    key: 'GBPUSDT',
    symbol: 'GBP/USD',
    label: 'Pound',
    accent: 'from-violet-300/70 via-fuchsia-200/45 to-pink-300/70',
    binanceSymbol: 'GBPUSDT',
    formatter: (value) => value.toFixed(4),
  },
]

// Fallback data for simulated live feed
const FALLBACK_DATA = {
  PAXGUSDT: { price: 2350.5, open: 2340.0, high: 2365.0, low: 2335.0 },
  EURUSDT: { price: 1.0850, open: 1.0820, high: 1.0890, low: 1.0810 },
  GBPUSDT: { price: 1.2650, open: 1.2610, high: 1.2690, low: 1.2600 },
}

function generateSimulatedData(key) {
  const base = FALLBACK_DATA[key]
  const volatility = 0.0005 // 0.05% move
  const change = 1 + (Math.random() * 2 - 1) * volatility
  
  return {
    ticker: key,
    price: base.price * change,
    open: base.open,
    high: Math.max(base.high, base.price * change),
    low: Math.min(base.low, base.price * change),
    timestamp: new Date().toISOString(),
    isSimulated: true
  }
}

async function fetchBinanceQuote(symbol) {
  const response = await fetch(`${BINANCE_API_URL}?symbol=${symbol}`)
  
  if (!response.ok) {
    throw new Error(`Binance API error: ${response.status}`)
  }

  const data = await response.json()
  
  return {
    ticker: symbol,
    price: Number(data.lastPrice),
    open: Number(data.openPrice),
    high: Number(data.highPrice),
    low: Number(data.lowPrice),
    timestamp: new Date(data.closeTime).toISOString(),
    isSimulated: false
  }
}

export async function fetchDashboardPrices() {
  const quotes = await Promise.all(
    MARKET_CONFIG.map(async (market) => {
      try {
        const liveData = await fetchBinanceQuote(market.binanceSymbol)
        return {
          key: market.key,
          ...market,
          ...liveData,
        }
      } catch (error) {
        console.warn(`Failed to fetch ${market.binanceSymbol}, using simulated data`, error)
        const simulatedData = generateSimulatedData(market.key)
        return {
          key: market.key,
          ...market,
          ...simulatedData,
        }
      }
    }),
  )

  return quotes.reduce((accumulator, quote) => {
    accumulator[quote.key] = quote
    return accumulator
  }, {})
}
