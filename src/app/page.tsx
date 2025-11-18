"use client"

import { useState, useEffect, useRef } from "react"
import { TrendingUp, TrendingDown, Activity, BarChart3, Zap, Target, Clock, CheckCircle2, AlertCircle, ArrowLeft, Sparkles, Star, Crown, Lock, LineChart as LineChartIcon, CandlestickChart as CandleIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Tipos de dados
type Broker = {
  id: string
  name: string
  logo: string
  affiliateLink: string
  available: boolean
  color: string
  brandColor: string
  otcAssets: string[]
}

type Asset = {
  id: string
  name: string
  symbol: string
  price: number
  change: number
  isOTC?: boolean
}

type Strategy = {
  id: string
  name: string
  description: string
  accuracy: number
  type: "indicator" | "strategy"
}

type Signal = {
  direction: "CALL" | "PUT"
  confidence: number
  entry: number
  expiration: string
  strategy: string
}

type Candle = {
  time: string
  open: number
  high: number
  low: number
  close: number
  isGhost?: boolean
}

type Plan = "free" | "basic" | "medium" | "unlimited"

type ChartType = "candlestick" | "line"

type PerformanceStats = {
  wins: number
  losses: number
}

type Timeframe = "30s" | "1m" | "2m" | "5m"

// Dados mockados - CORRETORAS COM LOGOS REAIS
const brokers: Broker[] = [
  { 
    id: "binolla", 
    name: "Binolla", 
    logo: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/ca641528-67b5-449a-9b8b-07ca913edf2a.png", 
    affiliateLink: "https://binolla.com", 
    available: true, 
    color: "from-purple-600 to-purple-800",
    brandColor: "#8B5CF6",
    otcAssets: ["EURUSD_OTC", "GBPUSD_OTC", "USDJPY_OTC", "AUDUSD_OTC", "BTCUSD_OTC"]
  },
  { 
    id: "quotex", 
    name: "Quotex", 
    logo: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/7258ed48-3854-45df-979e-1cf5721c0dab.jpg", 
    affiliateLink: "https://quotex.io", 
    available: true, 
    color: "from-blue-500 to-cyan-600",
    brandColor: "#06B6D4",
    otcAssets: ["EURUSD_OTC", "GBPUSD_OTC", "USDJPY_OTC", "GOLD_OTC", "BTCUSD_OTC"]
  },
  { 
    id: "iqoption", 
    name: "IQ Option", 
    logo: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/cfd92d5b-9b86-432e-bc4c-7e71b757e495.png", 
    affiliateLink: "https://iqoption.com", 
    available: true, 
    color: "from-green-500 to-green-700",
    brandColor: "#22C55E",
    otcAssets: ["EURUSD_OTC", "GBPUSD_OTC", "USDJPY_OTC", "AUDUSD_OTC", "USDCAD_OTC"]
  },
  { 
    id: "pocket", 
    name: "Pocket Option", 
    logo: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/d74a5fe5-938c-4d34-83f1-4543432bb8da.jpg", 
    affiliateLink: "https://pocketoption.com", 
    available: true, 
    color: "from-orange-500 to-orange-700",
    brandColor: "#F97316",
    otcAssets: ["EURUSD_OTC", "GBPUSD_OTC", "USDJPY_OTC", "BTCUSD_OTC", "ETHUSD_OTC"]
  },
  { 
    id: "binomo", 
    name: "Binomo", 
    logo: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/34018856-c86e-48da-9b5d-4d73d945d629.png", 
    affiliateLink: "https://binomo.com", 
    available: true, 
    color: "from-yellow-500 to-yellow-700",
    brandColor: "#EAB308",
    otcAssets: ["EURUSD_OTC", "GBPUSD_OTC", "USDJPY_OTC", "GOLD_OTC", "SILVER_OTC"]
  },
  { 
    id: "olymptrade", 
    name: "Olymp Trade", 
    logo: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/16400bb8-6f72-416c-beec-9813bcc3985f.png", 
    affiliateLink: "https://olymptrade.com", 
    available: true, 
    color: "from-blue-600 to-indigo-700",
    brandColor: "#4F46E5",
    otcAssets: ["EURUSD_OTC", "GBPUSD_OTC", "USDJPY_OTC", "AUDUSD_OTC", "NZDUSD_OTC"]
  },
  { 
    id: "deriv", 
    name: "Deriv", 
    logo: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/11c91252-90e9-4c29-9db3-7d7edbdaea49.jpg", 
    affiliateLink: "https://deriv.com", 
    available: true, 
    color: "from-red-500 to-red-700",
    brandColor: "#EF4444",
    otcAssets: ["EURUSD_OTC", "GBPUSD_OTC", "USDJPY_OTC", "BTCUSD_OTC", "GOLD_OTC"]
  },
  { 
    id: "zeamy", 
    name: "Zeamy", 
    logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23EAB308'/%3E%3Ctext x='50' y='50' font-family='Arial, sans-serif' font-size='60' font-weight='bold' fill='%23000' text-anchor='middle' dominant-baseline='central'%3EZ%3C/text%3E%3C/svg%3E", 
    affiliateLink: "https://zeamy.com", 
    available: true, 
    color: "from-yellow-400 to-yellow-600",
    brandColor: "#EAB308",
    otcAssets: ["EURUSD_OTC", "GBPUSD_OTC", "USDJPY_OTC", "ETHUSD_OTC", "BTCUSD_OTC"]
  },
]

// ATIVOS - PARES DE MOEDAS EM DESTAQUE
const assets: Asset[] = [
  // Pares de Moedas (Prioridade)
  { id: "eurusd", name: "EUR/USD", symbol: "EURUSD", price: 1.0856, change: 0.23 },
  { id: "gbpusd", name: "GBP/USD", symbol: "GBPUSD", price: 1.2634, change: -0.15 },
  { id: "usdjpy", name: "USD/JPY", symbol: "USDJPY", price: 149.82, change: 0.45 },
  { id: "audusd", name: "AUD/USD", symbol: "AUDUSD", price: 0.6543, change: 0.18 },
  { id: "usdcad", name: "USD/CAD", symbol: "USDCAD", price: 1.3521, change: -0.22 },
  { id: "nzdusd", name: "NZD/USD", symbol: "NZDUSD", price: 0.6123, change: 0.31 },
  { id: "usdchf", name: "USD/CHF", symbol: "USDCHF", price: 0.8765, change: 0.12 },
  { id: "eurgbp", name: "EUR/GBP", symbol: "EURGBP", price: 0.8598, change: -0.08 },
  
  // Crypto
  { id: "btcusd", name: "Bitcoin", symbol: "BTCUSD", price: 43250, change: 2.34 },
  { id: "ethusd", name: "Ethereum", symbol: "ETHUSD", price: 2280, change: 1.87 },
  { id: "bnbusd", name: "Binance Coin", symbol: "BNBUSD", price: 312.45, change: 3.12 },
  
  // Commodities
  { id: "gold", name: "Ouro", symbol: "XAUUSD", price: 2045.30, change: -0.32 },
  { id: "silver", name: "Prata", symbol: "XAGUSD", price: 23.45, change: 0.87 },
  { id: "oil", name: "Petróleo WTI", symbol: "WTIUSD", price: 78.32, change: 1.23 },
]

const strategies: Strategy[] = [
  { id: "rsi", name: "RSI Divergence", description: "Identifica divergências no RSI", accuracy: 73.5, type: "indicator" },
  { id: "macd", name: "MACD Cross", description: "Cruzamento de médias MACD", accuracy: 68.2, type: "indicator" },
  { id: "bb", name: "Bollinger Bands", description: "Rompimento de bandas", accuracy: 71.8, type: "indicator" },
  { id: "ema", name: "EMA 9/21", description: "Cruzamento de médias exponenciais", accuracy: 69.5, type: "strategy" },
  { id: "stoch", name: "Stochastic", description: "Sobrecompra/sobrevenda", accuracy: 66.3, type: "indicator" },
  { id: "ichimoku", name: "Ichimoku Cloud", description: "Sistema completo Ichimoku", accuracy: 75.1, type: "strategy" },
  { id: "fibonacci", name: "Fibonacci Retracement", description: "Níveis de retração", accuracy: 70.4, type: "strategy" },
  { id: "support", name: "Support & Resistance", description: "Suporte e resistência", accuracy: 72.9, type: "strategy" },
  { id: "vwap", name: "VWAP", description: "Volume Weighted Average Price", accuracy: 74.3, type: "indicator" },
  { id: "adx", name: "ADX Trend", description: "Average Directional Index", accuracy: 71.2, type: "indicator" },
  { id: "parabolic", name: "Parabolic SAR", description: "Stop and Reverse", accuracy: 69.8, type: "indicator" },
  { id: "williams", name: "Williams %R", description: "Momentum indicator", accuracy: 67.5, type: "indicator" },
]

// Componente de Background Animado - FUNDO PRETO
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-black">
      {/* Estrelas cadentes */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full animate-shooting-star"
          style={{
            top: `${Math.random() * 50}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}
      
      {/* Estrelas fixas */}
      {[...Array(100)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
      
      {/* Gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/5 to-transparent" />
    </div>
  )
}

// Componente de Gráfico de Linhas com dados reais e interatividade
function LineChart({ asset, timeframe }: { asset: Asset; timeframe: Timeframe }) {
  const [points, setPoints] = useState<{ time: string; price: number; isGhost?: boolean }[]>([])
  const [key, setKey] = useState(0)
  const svgRef = useRef<SVGSVGElement>(null)
  const [scale, setScale] = useState(1)
  const [translateX, setTranslateX] = useState(0)
  const [translateY, setTranslateY] = useState(0)
  const [isPanning, setIsPanning] = useState(false)
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [lastDistance, setLastDistance] = useState(0)

  useEffect(() => {
    // Regenerar gráfico quando ativo ou timeframe mudar
    const generatePoints = () => {
      const newPoints: { time: string; price: number; isGhost?: boolean }[] = []
      let basePrice = asset.price
      
      // Determinar número de pontos baseado no timeframe
      const numPoints = timeframe === "30s" ? 60 : timeframe === "1m" ? 30 : timeframe === "2m" ? 15 : 12
      
      // Pontos históricos
      for (let i = 0; i < numPoints; i++) {
        const volatility = basePrice * 0.002
        const trend = (Math.random() - 0.5) * 2
        const price = basePrice + (trend * volatility)
        
        newPoints.push({
          time: `${numPoints - i}${timeframe}`,
          price,
          isGhost: false
        })
        
        basePrice = price
      }
      
      // 3 pontos de previsão
      const lastPrice = newPoints[newPoints.length - 1].price
      const trend = Math.random() > 0.5 ? 1 : -1
      
      for (let i = 0; i < 3; i++) {
        const price = lastPrice + (trend * (i + 1) * lastPrice * 0.003)
        newPoints.push({
          time: `+${i + 1}`,
          price,
          isGhost: true
        })
      }
      
      setPoints(newPoints)
      setKey(prev => prev + 1)
    }
    
    generatePoints()
  }, [asset.id, asset.price, timeframe])

  // Handlers de interação
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * -0.001
    const newScale = Math.min(Math.max(0.5, scale + delta), 3)
    setScale(newScale)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true)
    setStartPoint({ x: e.clientX - translateX, y: e.clientY - translateY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return
    setTranslateX(e.clientX - startPoint.x)
    setTranslateY(e.clientY - startPoint.y)
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true)
      setStartPoint({ x: e.touches[0].clientX - translateX, y: e.touches[0].clientY - translateY })
    } else if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      setLastDistance(distance)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning) {
      setTranslateX(e.touches[0].clientX - startPoint.x)
      setTranslateY(e.touches[0].clientY - startPoint.y)
    } else if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      if (lastDistance > 0) {
        const delta = (distance - lastDistance) * 0.01
        const newScale = Math.min(Math.max(0.5, scale + delta), 3)
        setScale(newScale)
      }
      setLastDistance(distance)
    }
  }

  const handleTouchEnd = () => {
    setIsPanning(false)
    setLastDistance(0)
  }

  if (points.length === 0) {
    return <div className="h-[500px] bg-black/50 rounded-lg border border-pink-500/20 flex items-center justify-center">
      <Activity className="w-8 h-8 text-pink-500 animate-spin" />
    </div>
  }

  const maxPrice = Math.max(...points.map(p => p.price))
  const minPrice = Math.min(...points.map(p => p.price))
  const priceRange = maxPrice - minPrice

  // Criar path SVG
  const pathData = points.map((point, index) => {
    const x = (index / (points.length - 1)) * 100
    const y = 100 - ((point.price - minPrice) / priceRange * 80) - 10
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  return (
    <div 
      key={key} 
      className="relative h-[500px] bg-black/50 rounded-lg border border-pink-500/20 overflow-hidden p-6 cursor-move touch-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Grid de fundo */}
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-10">
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="border-r border-b border-white/20" />
        ))}
      </div>
      
      {/* Gráfico SVG */}
      <svg 
        ref={svgRef}
        className="w-full h-full" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        style={{
          transform: `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`,
          transition: isPanning ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        {/* Área preenchida */}
        <defs>
          <linearGradient id={`lineGradient-${key}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${pathData} L 100 100 L 0 100 Z`}
          fill={`url(#lineGradient-${key})`}
        />
        
        {/* Linha principal */}
        <path
          d={pathData}
          fill="none"
          stroke="#ec4899"
          strokeWidth="0.5"
          className="drop-shadow-lg"
        />
        
        {/* Linha fantasma (previsão) */}
        <path
          d={points.slice(-4).map((point, index) => {
            const actualIndex = points.length - 4 + index
            const x = (actualIndex / (points.length - 1)) * 100
            const y = 100 - ((point.price - minPrice) / priceRange * 80) - 10
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
          }).join(' ')}
          fill="none"
          stroke="#ec4899"
          strokeWidth="0.5"
          strokeDasharray="2,2"
          opacity="0.6"
        />
        
        {/* Pontos */}
        {points.map((point, index) => {
          const x = (index / (points.length - 1)) * 100
          const y = 100 - ((point.price - minPrice) / priceRange * 80) - 10
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="0.8"
              fill={point.isGhost ? "#ec4899" : "#fff"}
              opacity={point.isGhost ? "0.6" : "1"}
              className="drop-shadow-lg"
            />
          )
        })}
      </svg>
      
      {/* Legenda de previsão */}
      <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-pink-500/30 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-pink-400" />
        <span className="text-xs text-pink-400">Previsão IA</span>
      </div>
      
      {/* Controles de zoom */}
      <div className="absolute bottom-4 right-4 bg-black/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-pink-500/30 flex items-center gap-2">
        <span className="text-xs text-slate-400">Zoom: {(scale * 100).toFixed(0)}%</span>
      </div>
      
      {/* Preço atual */}
      <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-pink-500/30">
        <div className="text-xs text-slate-400">Preço Atual</div>
        <div className="text-2xl font-bold text-white font-mono">{asset.price.toFixed(asset.id.includes('usd') && !asset.id.includes('btc') ? 4 : 2)}</div>
        <div className={`text-xs font-medium ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {asset.change >= 0 ? '+' : ''}{asset.change}%
        </div>
      </div>
    </div>
  )
}

// Componente de Gráfico Candlestick com dados reais e interatividade
function CandlestickChart({ asset, broker, timeframe }: { asset: Asset; broker: Broker; timeframe: Timeframe }) {
  const [candles, setCandles] = useState<Candle[]>([])
  const [key, setKey] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [translateX, setTranslateX] = useState(0)
  const [translateY, setTranslateY] = useState(0)
  const [isPanning, setIsPanning] = useState(false)
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [lastDistance, setLastDistance] = useState(0)

  useEffect(() => {
    // Regenerar gráfico quando ativo ou timeframe mudar
    const generateCandles = () => {
      const newCandles: Candle[] = []
      let basePrice = asset.price
      
      // Determinar número de velas baseado no timeframe
      const numCandles = timeframe === "30s" ? 60 : timeframe === "1m" ? 30 : timeframe === "2m" ? 15 : 12
      
      // Velas históricas
      for (let i = 0; i < numCandles; i++) {
        const volatility = basePrice * 0.002
        const open = basePrice + (Math.random() - 0.5) * volatility
        const close = open + (Math.random() - 0.5) * volatility * 1.5
        const high = Math.max(open, close) + Math.random() * volatility * 0.5
        const low = Math.min(open, close) - Math.random() * volatility * 0.5
        
        newCandles.push({
          time: `${numCandles - i}${timeframe}`,
          open,
          high,
          low,
          close,
          isGhost: false
        })
        
        basePrice = close
      }
      
      // 3 velas fantasmas (previsão)
      const lastPrice = newCandles[newCandles.length - 1].close
      const trend = Math.random() > 0.5 ? 1 : -1
      
      for (let i = 0; i < 3; i++) {
        const open = i === 0 ? lastPrice : newCandles[newCandles.length - 1].close
        const close = open + (trend * (i + 1) * lastPrice * 0.003)
        const high = Math.max(open, close) + Math.abs(close - open) * 0.3
        const low = Math.min(open, close) - Math.abs(close - open) * 0.3
        
        newCandles.push({
          time: `+${i + 1}`,
          open,
          high,
          low,
          close,
          isGhost: true
        })
      }
      
      setCandles(newCandles)
      setKey(prev => prev + 1)
    }
    
    generateCandles()
  }, [asset.id, asset.price, timeframe])

  // Handlers de interação
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * -0.001
    const newScale = Math.min(Math.max(0.5, scale + delta), 3)
    setScale(newScale)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true)
    setStartPoint({ x: e.clientX - translateX, y: e.clientY - translateY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return
    setTranslateX(e.clientX - startPoint.x)
    setTranslateY(e.clientY - startPoint.y)
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true)
      setStartPoint({ x: e.touches[0].clientX - translateX, y: e.touches[0].clientY - translateY })
    } else if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      setLastDistance(distance)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning) {
      setTranslateX(e.touches[0].clientX - startPoint.x)
      setTranslateY(e.touches[0].clientY - startPoint.y)
    } else if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      if (lastDistance > 0) {
        const delta = (distance - lastDistance) * 0.01
        const newScale = Math.min(Math.max(0.5, scale + delta), 3)
        setScale(newScale)
      }
      setLastDistance(distance)
    }
  }

  const handleTouchEnd = () => {
    setIsPanning(false)
    setLastDistance(0)
  }

  const maxPrice = Math.max(...candles.map(c => c.high))
  const minPrice = Math.min(...candles.map(c => c.low))
  const priceRange = maxPrice - minPrice

  if (candles.length === 0) {
    return <div className="h-[500px] bg-black/50 rounded-lg border border-pink-500/20 flex items-center justify-center">
      <Activity className="w-8 h-8 text-pink-500 animate-spin" />
    </div>
  }

  return (
    <div 
      key={key} 
      ref={containerRef}
      className="relative h-[500px] bg-black/50 rounded-lg border border-pink-500/20 overflow-hidden p-6 cursor-move touch-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Grid de fundo */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full grid grid-rows-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="border-b border-white/20" />
          ))}
        </div>
      </div>
      
      {/* Candles */}
      <div 
        className="relative h-full flex items-end justify-around gap-0.5 px-4"
        style={{
          transform: `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`,
          transition: isPanning ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        {candles.map((candle, index) => {
          const isGreen = candle.close >= candle.open
          const bodyHeight = Math.abs(candle.close - candle.open) / priceRange * 80
          const bodyBottom = (Math.min(candle.open, candle.close) - minPrice) / priceRange * 80
          const wickTopHeight = (candle.high - Math.max(candle.open, candle.close)) / priceRange * 80
          const wickBottomHeight = (Math.min(candle.open, candle.close) - candle.low) / priceRange * 80
          
          return (
            <div
              key={index}
              className="relative flex-1 h-full flex flex-col justify-end items-center group"
              style={{ maxWidth: '20px' }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 bg-black border border-pink-500/30 rounded-lg p-2 text-xs whitespace-nowrap">
                <div className="text-slate-400">{candle.time}</div>
                <div className="text-white">O: {candle.open.toFixed(4)}</div>
                <div className="text-white">H: {candle.high.toFixed(4)}</div>
                <div className="text-white">L: {candle.low.toFixed(4)}</div>
                <div className="text-white">C: {candle.close.toFixed(4)}</div>
                {candle.isGhost && (
                  <div className="text-pink-400 mt-1">Previsão IA</div>
                )}
              </div>
              
              {/* Wick superior */}
              <div
                className={`w-0.5 ${candle.isGhost ? 'bg-pink-500/50' : isGreen ? 'bg-green-500' : 'bg-red-500'}`}
                style={{
                  height: `${wickTopHeight}%`,
                  marginBottom: `${bodyHeight}%`
                }}
              />
              
              {/* Corpo da vela */}
              <div
                className={`w-full ${ 
                  candle.isGhost 
                    ? 'bg-pink-500/20 border-2 border-pink-500/60 border-dashed' 
                    : isGreen 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                }`}
                style={{
                  height: `${bodyHeight || 0.5}%`,
                  marginBottom: `${bodyBottom}%`
                }}
              />
              
              {/* Wick inferior */}
              <div
                className={`w-0.5 ${candle.isGhost ? 'bg-pink-500/50' : isGreen ? 'bg-green-500' : 'bg-red-500'}`}
                style={{
                  height: `${wickBottomHeight}%`,
                }}
              />
              
              {/* Label de tempo */}
              {index % Math.ceil(candles.length / 6) === 0 && (
                <div className={`absolute -bottom-6 text-xs ${candle.isGhost ? 'text-pink-400' : 'text-slate-500'}`}>
                  {candle.time}
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Legenda de velas fantasmas */}
      <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-pink-500/30 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-pink-400" />
        <span className="text-xs text-pink-400">Previsão IA</span>
      </div>
      
      {/* Controles de zoom */}
      <div className="absolute bottom-4 right-4 bg-black/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-pink-500/30 flex items-center gap-2">
        <span className="text-xs text-slate-400">Zoom: {(scale * 100).toFixed(0)}%</span>
      </div>
      
      {/* Preço atual */}
      <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-pink-500/30">
        <div className="text-xs text-slate-400">Preço Atual</div>
        <div className="text-2xl font-bold text-white font-mono">{asset.price.toFixed(asset.id.includes('usd') && !asset.id.includes('btc') ? 4 : 2)}</div>
        <div className={`text-xs font-medium ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {asset.change >= 0 ? '+' : ''}{asset.change}%
        </div>
      </div>
    </div>
  )
}

// Modal de Cadastro (aparece após clicar em Analisar sem cadastro)
function SignupModal({ broker, onClose, onSignup }: { broker: Broker; onClose: () => void; onSignup: () => void }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && email) {
      onSignup()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-slate-900 border-pink-500/30 p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Cadastre-se na Making a Money</h2>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-center mb-6">
          <img src={broker.logo} alt={broker.name} className="w-20 h-20 rounded-xl mx-auto mb-3 object-cover" />
          <p className="text-slate-400">Cadastre-se para usar o plano gratuito com {broker.name}</p>
          <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30">
            10 análises grátis
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-black/50 border border-pink-500/30 rounded-lg text-white focus:border-pink-500 focus:outline-none"
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-black/50 border border-pink-500/30 rounded-lg text-white focus:border-pink-500 focus:outline-none"
              placeholder="seu@email.com"
              required
            />
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white">
            Começar Teste Grátis
          </Button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-4">
          Ao cadastrar, você concorda com nossos termos de uso
        </p>
      </Card>
    </div>
  )
}

// Modal de Planos
function PricingModal({ onClose, onSelectPlan }: { onClose: () => void; onSelectPlan: (plan: Plan) => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-slate-900 border-pink-500/30 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Escolha seu Plano</h2>
          <p className="text-slate-400">Você usou suas 10 análises gratuitas</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Plano Básico */}
          <Card className="bg-black/50 border-pink-500/30 p-6 hover:border-pink-500 transition-all">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Básico</h3>
              <div className="text-4xl font-bold text-pink-500 mb-2">R$ 49</div>
              <p className="text-slate-400 text-sm">por mês</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>50 entradas/mês</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Todas as estratégias</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Suporte por email</span>
              </li>
            </ul>
            <Button 
              onClick={() => onSelectPlan("basic")}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
            >
              Assinar Básico
            </Button>
          </Card>

          {/* Plano Médio */}
          <Card className="bg-black/50 border-pink-500 p-6 relative transform scale-105">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pink-500 text-white">
              Mais Popular
            </Badge>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Médio</h3>
              <div className="text-4xl font-bold text-pink-500 mb-2">R$ 99</div>
              <p className="text-slate-400 text-sm">por mês</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>200 entradas/mês</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Todas as estratégias</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Suporte prioritário</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Alertas por Telegram</span>
              </li>
            </ul>
            <Button 
              onClick={() => onSelectPlan("medium")}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
            >
              Assinar Médio
            </Button>
          </Card>

          {/* Plano Completo */}
          <Card className="bg-black/50 border-pink-500/30 p-6 hover:border-pink-500 transition-all">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Completo</h3>
              <div className="text-4xl font-bold text-pink-500 mb-2">R$ 199</div>
              <p className="text-slate-400 text-sm">por mês</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="font-bold">Entradas ILIMITADAS</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Todas as estratégias</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Suporte VIP 24/7</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Alertas Telegram + WhatsApp</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Acesso antecipado</span>
              </li>
            </ul>
            <Button 
              onClick={() => onSelectPlan("unlimited")}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
            >
              Assinar Completo
            </Button>
          </Card>
        </div>

        <Button 
          onClick={onClose}
          variant="ghost"
          className="mt-6 w-full text-slate-400 hover:text-white"
        >
          Fechar
        </Button>
      </Card>
    </div>
  )
}

// Pop-up promocional (aparece periodicamente)
function PromoPopup({ onClose, onUpgrade }: { onClose: () => void; onUpgrade: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gradient-to-br from-pink-900/50 to-purple-900/50 border-pink-500 p-8 max-w-md w-full relative">
        <Button onClick={onClose} variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/10">
          <X className="w-5 h-5" />
        </Button>

        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Gostando dos Resultados?</h2>
          <p className="text-slate-300 mb-6">
            Aproveite entradas ilimitadas e maximize seus lucros com nossos planos premium
          </p>
          
          <div className="bg-black/50 rounded-lg p-4 mb-6">
            <div className="text-3xl font-bold text-pink-500 mb-1">50% OFF</div>
            <div className="text-sm text-slate-400">Nos primeiros 3 meses</div>
          </div>

          <Button 
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white mb-3"
          >
            Ver Planos Premium
          </Button>
          
          <Button onClick={onClose} variant="ghost" className="w-full text-slate-400 hover:text-white">
            Continuar com plano atual
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"broker-selection" | "analysis">("broker-selection")
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [signal, setSignal] = useState<Signal | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [favoriteBroker, setFavoriteBroker] = useState<string | null>(null)
  const [analysisCount, setAnalysisCount] = useState(0)
  const [currentPlan, setCurrentPlan] = useState<Plan>("free")
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showPromoPopup, setShowPromoPopup] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [chartType, setChartType] = useState<ChartType>("candlestick")
  const [performance, setPerformance] = useState<PerformanceStats>({ wins: 0, losses: 0 })
  const [chartTimeframe, setChartTimeframe] = useState<Timeframe>("1m")
  const [expirationTime, setExpirationTime] = useState<Timeframe>("5m")

  // Pop-up promocional após 2 análises
  useEffect(() => {
    if (isRegistered && currentPlan === "free" && analysisCount > 0) {
      // Mostrar pop-up a cada 2 análises
      if (analysisCount % 2 === 0) {
        const timer = setTimeout(() => {
          setShowPromoPopup(true)
        }, 3000) // 3 segundos após análise

        return () => clearTimeout(timer)
      }
    }
  }, [analysisCount, isRegistered, currentPlan])

  const handleBrokerSelect = (broker: Broker) => {
    setSelectedBroker(broker)
    setCurrentScreen("analysis")
    // NÃO abre modal de cadastro aqui
  }

  const handleSignup = () => {
    setIsRegistered(true)
  }

  const handleBackToBrokers = () => {
    setCurrentScreen("broker-selection")
    setSelectedBroker(null)
    setSelectedAsset(null)
    setSelectedStrategy(null)
    setSignal(null)
  }

  const handleAnalyze = () => {
    if (!selectedAsset || !selectedStrategy) return
    
    // Verificar se precisa se cadastrar
    if (!isRegistered) {
      setShowSignupModal(true)
      return
    }
    
    // Verificar limite de análises
    if (currentPlan === "free" && analysisCount >= 10) {
      setShowPricingModal(true)
      return
    }
    
    if (currentPlan === "basic" && analysisCount >= 50) {
      setShowPricingModal(true)
      return
    }
    
    if (currentPlan === "medium" && analysisCount >= 200) {
      setShowPricingModal(true)
      return
    }
    
    setAnalyzing(true)
    
    // Simula análise
    setTimeout(() => {
      const isCall = Math.random() > 0.5
      setSignal({
        direction: isCall ? "CALL" : "PUT",
        confidence: Math.floor(Math.random() * 20) + 65,
        entry: selectedAsset.price,
        expiration: expirationTime === "30s" ? "30 segundos" : expirationTime === "1m" ? "1 minuto" : expirationTime === "2m" ? "2 minutos" : "5 minutos",
        strategy: selectedStrategy.name
      })
      setAnalyzing(false)
      setAnalysisCount(prev => prev + 1)
    }, 2000)
  }

  const handleSetFavorite = (brokerId: string) => {
    setFavoriteBroker(brokerId === favoriteBroker ? null : brokerId)
  }

  const handleSelectPlan = (plan: Plan) => {
    setCurrentPlan(plan)
    setAnalysisCount(0)
    setShowPricingModal(false)
    alert(`Plano ${plan} ativado com sucesso!`)
  }

  const handleTradeResult = (result: "win" | "loss") => {
    setPerformance(prev => ({
      wins: result === "win" ? prev.wins + 1 : prev.wins,
      losses: result === "loss" ? prev.losses + 1 : prev.losses
    }))
    setSignal(null) // Limpa o sinal após registrar resultado
  }

  // Ordenar corretoras: favorita primeiro
  const sortedBrokers = [...brokers].sort((a, b) => {
    if (a.id === favoriteBroker) return -1
    if (b.id === favoriteBroker) return 1
    return 0
  })

  // Adicionar ativos OTC da corretora selecionada
  const availableAssets = selectedBroker 
    ? [
        ...assets,
        ...selectedBroker.otcAssets.map((otcId, index) => ({
          id: otcId.toLowerCase(),
          name: otcId.replace('_OTC', ' (OTC)'),
          symbol: otcId,
          price: assets[index % assets.length].price,
          change: (Math.random() - 0.5) * 2,
          isOTC: true
        }))
      ]
    : assets

  // Calcular taxa de acerto
  const totalTrades = performance.wins + performance.losses
  const winRate = totalTrades > 0 ? ((performance.wins / totalTrades) * 100).toFixed(1) : "0.0"

  return (
    <div className="min-h-screen relative">
      {/* Background Animado */}
      <AnimatedBackground />
      
      {/* Modal de Cadastro */}
      {showSignupModal && selectedBroker && (
        <SignupModal 
          broker={selectedBroker}
          onClose={() => setShowSignupModal(false)}
          onSignup={handleSignup}
        />
      )}
      
      {/* Modal de Planos */}
      {showPricingModal && (
        <PricingModal 
          onClose={() => setShowPricingModal(false)}
          onSelectPlan={handleSelectPlan}
        />
      )}

      {/* Pop-up Promocional */}
      {showPromoPopup && (
        <PromoPopup
          onClose={() => setShowPromoPopup(false)}
          onUpgrade={() => {
            setShowPromoPopup(false)
            setShowPricingModal(true)
          }}
        />
      )}
      
      {/* Conteúdo */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-pink-500/20 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentScreen === "analysis" && (
                  <Button
                    onClick={handleBackToBrokers}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                )}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Making a Money</h1>
                  <p className="text-xs text-slate-400">Análise profissional de sinais</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Contador de análises e botão Teste Grátis */}
                {!isRegistered ? (
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-sm px-3 py-1">
                      10 análises grátis
                    </Badge>
                    <Button 
                      onClick={() => setShowSignupModal(true)}
                      className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Teste Grátis
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">
                        {currentPlan === "free" && `${analysisCount}/10 análises grátis`}
                        {currentPlan === "basic" && `${analysisCount}/50 análises`}
                        {currentPlan === "medium" && `${analysisCount}/200 análises`}
                        {currentPlan === "unlimited" && "Análises ilimitadas"}
                      </div>
                      {currentPlan !== "free" && (
                        <Badge className="bg-pink-500 text-white text-xs">
                          Plano {currentPlan === "basic" ? "Básico" : currentPlan === "medium" ? "Médio" : "Completo"}
                        </Badge>
                      )}
                    </div>
                    <Button 
                      onClick={() => setShowPricingModal(true)}
                      className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      {currentPlan === "free" ? "Fazer Upgrade" : "Ver Planos"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* TELA 1: Seleção de Corretora */}
        {currentScreen === "broker-selection" && (
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Escolha sua Corretora
                </h2>
                <p className="text-slate-400 text-lg">
                  Selecione a corretora para começar a analisar sinais
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedBrokers.map((broker) => (
                  <Card
                    key={broker.id}
                    className="bg-black/50 border-pink-500/20 backdrop-blur-xl p-6 hover:border-pink-500 transition-all cursor-pointer group relative"
                    onClick={() => handleBrokerSelect(broker)}
                  >
                    {/* Botão de favorito */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSetFavorite(broker.id)
                      }}
                      className="absolute top-4 right-4 z-10"
                    >
                      <Star 
                        className={`w-5 h-5 ${
                          broker.id === favoriteBroker 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-slate-500 hover:text-yellow-400'
                        } transition-colors`}
                      />
                    </button>

                    {broker.id === favoriteBroker && (
                      <Badge className="absolute top-4 left-4 bg-yellow-500 text-black">
                        <Crown className="w-3 h-3 mr-1" />
                        Favorita
                      </Badge>
                    )}

                    <div className="flex flex-col items-center text-center space-y-4 mt-8">
                      <img 
                        src={broker.logo} 
                        alt={broker.name}
                        className="w-20 h-20 rounded-2xl object-cover group-hover:scale-110 transition-transform"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{broker.name}</h3>
                        {broker.available && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Online
                          </Badge>
                        )}
                      </div>
                      <Button 
                        className={`w-full bg-gradient-to-r ${broker.color} hover:opacity-90 text-white`}
                        style={{ backgroundColor: broker.brandColor }}
                      >
                        Selecionar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TELA 2: Análise (quando corretora selecionada) */}
        {currentScreen === "analysis" && selectedBroker && (
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedBroker.logo} 
                  alt={selectedBroker.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedBroker.name}</h2>
                  <p className="text-slate-400">Análise de sinais em tempo real</p>
                </div>
              </div>
              
              {/* Botão de cadastro na corretora */}
              <Button 
                onClick={() => window.open(selectedBroker.affiliateLink, '_blank')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                Criar Cadastro na {selectedBroker.name}
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Coluna Esquerda - Ativos */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="bg-black/50 border-pink-500/20 backdrop-blur-xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-pink-500" />
                    Ativos Disponíveis
                  </h2>
                  
                  <Tabs defaultValue="pares" className="w-full">
                    <TabsList className="grid grid-cols-3 bg-slate-800/50 mb-4">
                      <TabsTrigger value="pares" className="data-[state=active]:bg-pink-500">Pares</TabsTrigger>
                      <TabsTrigger value="crypto" className="data-[state=active]:bg-pink-500">Crypto</TabsTrigger>
                      <TabsTrigger value="outros" className="data-[state=active]:bg-pink-500">Outros</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pares" className="space-y-2 max-h-96 overflow-y-auto">
                      {availableAssets.filter(a => a.symbol.includes('USD') && !a.symbol.includes('BTC') && !a.symbol.includes('ETH')).map((asset) => (
                        <button
                          key={asset.id}
                          onClick={() => setSelectedAsset(asset)}
                          className={`w-full p-3 rounded-lg border transition-all ${
                            selectedAsset?.id === asset.id
                              ? "bg-pink-500/20 border-pink-500"
                              : "bg-slate-800/30 border-white/5 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-left">
                              <div className="text-white font-medium flex items-center gap-2">
                                {asset.name}
                                {asset.isOTC && (
                                  <Badge className="bg-orange-500/20 text-orange-400 text-xs">OTC</Badge>
                                )}
                              </div>
                              <div className="text-xs text-slate-400">{asset.symbol}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-mono text-sm">{asset.price.toFixed(4)}</div>
                              <div className={`text-xs font-medium ${asset.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                                {asset.change >= 0 ? "+" : ""}{asset.change.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="crypto" className="space-y-2 max-h-96 overflow-y-auto">
                      {availableAssets.filter(a => ['btcusd', 'ethusd', 'bnbusd'].includes(a.id) || (a.isOTC && a.symbol.includes('BTC'))).map((asset) => (
                        <button
                          key={asset.id}
                          onClick={() => setSelectedAsset(asset)}
                          className={`w-full p-3 rounded-lg border transition-all ${
                            selectedAsset?.id === asset.id
                              ? "bg-pink-500/20 border-pink-500"
                              : "bg-slate-800/30 border-white/5 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-left">
                              <div className="text-white font-medium flex items-center gap-2">
                                {asset.name}
                                {asset.isOTC && (
                                  <Badge className="bg-orange-500/20 text-orange-400 text-xs">OTC</Badge>
                                )}
                              </div>
                              <div className="text-xs text-slate-400">{asset.symbol}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-mono text-sm">{asset.price.toFixed(2)}</div>
                              <div className={`text-xs font-medium ${asset.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                                {asset.change >= 0 ? "+" : ""}{asset.change.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="outros" className="space-y-2 max-h-96 overflow-y-auto">
                      {availableAssets.filter(a => ['gold', 'silver', 'oil'].includes(a.id) || (a.isOTC && (a.symbol.includes('GOLD') || a.symbol.includes('SILVER')))).map((asset) => (
                        <button
                          key={asset.id}
                          onClick={() => setSelectedAsset(asset)}
                          className={`w-full p-3 rounded-lg border transition-all ${
                            selectedAsset?.id === asset.id
                              ? "bg-pink-500/20 border-pink-500"
                              : "bg-slate-800/30 border-white/5 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-left">
                              <div className="text-white font-medium flex items-center gap-2">
                                {asset.name}
                                {asset.isOTC && (
                                  <Badge className="bg-orange-500/20 text-orange-400 text-xs">OTC</Badge>
                                )}
                              </div>
                              <div className="text-xs text-slate-400">{asset.symbol}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-mono text-sm">{asset.price.toFixed(2)}</div>
                              <div className={`text-xs font-medium ${asset.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                                {asset.change >= 0 ? "+" : ""}{asset.change.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </TabsContent>
                  </Tabs>
                </Card>

                {/* Card de Performance */}
                {isRegistered && totalTrades > 0 && (
                  <Card className="bg-black/50 border-pink-500/20 backdrop-blur-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-pink-500" />
                      Sua Performance
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Acertos</span>
                        <span className="text-green-400 font-bold text-xl">{performance.wins}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Erros</span>
                        <span className="text-red-400 font-bold text-xl">{performance.losses}</span>
                      </div>
                      <div className="pt-4 border-t border-pink-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-400">Taxa de Acerto</span>
                          <span className="text-pink-500 font-bold text-2xl">{winRate}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-pink-500 to-pink-600 h-2 rounded-full transition-all"
                            style={{ width: `${winRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Botão de Upgrade na sidebar */}
                {isRegistered && currentPlan !== "unlimited" && (
                  <Card className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 border-pink-500/50 p-6">
                    <div className="text-center">
                      <Crown className="w-10 h-10 text-pink-500 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-white mb-2">Upgrade Premium</h3>
                      <p className="text-sm text-slate-400 mb-4">
                        Entradas ilimitadas e recursos exclusivos
                      </p>
                      <Button 
                        onClick={() => setShowPricingModal(true)}
                        className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                      >
                        Ver Planos
                      </Button>
                    </div>
                  </Card>
                )}
              </div>

              {/* Coluna Central e Direita - Gráfico e Análise */}
              <div className="lg:col-span-2 space-y-6">
                {/* Gráfico com seletor de tipo e timeframes */}
                <Card className="bg-black/50 border-pink-500/20 backdrop-blur-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-pink-500" />
                      {selectedAsset ? selectedAsset.name : "Selecione um ativo"}
                    </h2>
                    <div className="flex items-center gap-2">
                      {selectedAsset && (
                        <>
                          <Badge 
                            className="text-white border-0"
                            style={{ backgroundColor: selectedBroker.brandColor }}
                          >
                            {selectedBroker.name}
                          </Badge>
                          
                          {/* Seletor de tipo de gráfico */}
                          <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
                            <Button
                              size="sm"
                              variant={chartType === "candlestick" ? "default" : "ghost"}
                              onClick={() => setChartType("candlestick")}
                              className={chartType === "candlestick" ? "bg-pink-500 hover:bg-pink-600" : "hover:bg-slate-700"}
                            >
                              <CandleIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={chartType === "line" ? "default" : "ghost"}
                              onClick={() => setChartType("line")}
                              className={chartType === "line" ? "bg-pink-500 hover:bg-pink-600" : "hover:bg-slate-700"}
                            >
                              <LineChartIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Seletor de Timeframe do Gráfico */}
                  {selectedAsset && (
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-sm text-slate-400">Tempo Gráfico:</span>
                      <div className="flex gap-2">
                        {(["30s", "1m", "2m", "5m"] as Timeframe[]).map((tf) => (
                          <Button
                            key={tf}
                            size="sm"
                            variant={chartTimeframe === tf ? "default" : "outline"}
                            onClick={() => setChartTimeframe(tf)}
                            className={chartTimeframe === tf ? "bg-pink-500 hover:bg-pink-600 text-white" : "border-pink-500/30 text-slate-300 hover:bg-pink-500/20"}
                          >
                            {tf}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedAsset ? (
                    chartType === "candlestick" ? (
                      <CandlestickChart asset={selectedAsset} broker={selectedBroker} timeframe={chartTimeframe} />
                    ) : (
                      <LineChart asset={selectedAsset} timeframe={chartTimeframe} />
                    )
                  ) : (
                    <div className="h-[500px] bg-black/50 rounded-lg border border-pink-500/20 flex items-center justify-center text-slate-500">
                      Selecione um ativo para visualizar o gráfico
                    </div>
                  )}
                </Card>

                {/* Estratégias */}
                <Card className="bg-black/50 border-pink-500/20 backdrop-blur-xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-pink-500" />
                    Estratégias e Indicadores
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {strategies.map((strategy) => (
                      <button
                        key={strategy.id}
                        onClick={() => setSelectedStrategy(strategy)}
                        className={`p-4 rounded-lg border transition-all text-left ${
                          selectedStrategy?.id === strategy.id
                            ? "bg-pink-500/20 border-pink-500"
                            : "bg-slate-800/30 border-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-white font-medium text-sm">{strategy.name}</div>
                          <Badge 
                            className={`${
                              strategy.accuracy >= 70 
                                ? "bg-green-500/20 text-green-400 border-green-500/30" 
                                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            }`}
                          >
                            {strategy.accuracy}%
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-400 mb-2">{strategy.description}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          Últimos 30 min
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Seletor de Tempo de Expiração */}
                <Card className="bg-black/50 border-pink-500/20 backdrop-blur-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300 font-medium">Tempo de Expiração:</span>
                    <div className="flex gap-2">
                      {(["30s", "1m", "2m", "5m"] as Timeframe[]).map((tf) => (
                        <Button
                          key={tf}
                          size="sm"
                          variant={expirationTime === tf ? "default" : "outline"}
                          onClick={() => setExpirationTime(tf)}
                          className={expirationTime === tf ? "bg-pink-500 hover:bg-pink-600 text-white" : "border-pink-500/30 text-slate-300 hover:bg-pink-500/20"}
                        >
                          {tf}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Botão de Análise */}
                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedAsset || !selectedStrategy || analyzing}
                  className="w-full h-14 text-lg bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <>
                      <Activity className="w-5 h-5 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : currentPlan === "free" && analysisCount >= 10 ? (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Limite Atingido - Faça Upgrade
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5 mr-2" />
                      Analisar e Gerar Entrada
                    </>
                  )}
                </Button>

                {/* Botão de Upgrade abaixo do botão Analisar */}
                {isRegistered && currentPlan !== "unlimited" && (
                  <Button 
                    onClick={() => setShowPricingModal(true)}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Premium - Entradas Ilimitadas
                  </Button>
                )}

                {/* Sinal Gerado */}
                {signal && (
                  <Card className={`border-2 ${
                    signal.direction === "CALL" 
                      ? "bg-green-500/10 border-green-500" 
                      : "bg-red-500/10 border-red-500"
                  } backdrop-blur-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                        Entrada Identificada
                      </h3>
                      <Badge className={`text-lg px-4 py-1 ${
                        signal.direction === "CALL"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}>
                        {signal.direction}
                      </Badge>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div className="bg-black/50 p-4 rounded-lg">
                        <div className="text-slate-400 text-sm mb-1">Direção</div>
                        <div className="flex items-center gap-2">
                          {signal.direction === "CALL" ? (
                            <TrendingUp className="w-6 h-6 text-green-400" />
                          ) : (
                            <TrendingDown className="w-6 h-6 text-red-400" />
                          )}
                          <span className="text-white text-xl font-bold">
                            {signal.direction === "CALL" ? "COMPRA" : "VENDA"}
                          </span>
                        </div>
                      </div>

                      <div className="bg-black/50 p-4 rounded-lg">
                        <div className="text-slate-400 text-sm mb-1">Confiança</div>
                        <div className="text-white text-xl font-bold">{signal.confidence}%</div>
                      </div>

                      <div className="bg-black/50 p-4 rounded-lg">
                        <div className="text-slate-400 text-sm mb-1">Entrada</div>
                        <div className="text-white text-xl font-bold font-mono">{signal.entry.toFixed(4)}</div>
                      </div>

                      <div className="bg-black/50 p-4 rounded-lg">
                        <div className="text-slate-400 text-sm mb-1">Expiração</div>
                        <div className="text-white text-xl font-bold">{signal.expiration}</div>
                      </div>
                    </div>

                    <div className="bg-black/50 p-4 rounded-lg mb-4">
                      <div className="text-slate-400 text-sm mb-1">Estratégia Utilizada</div>
                      <div className="text-white font-medium">{signal.strategy}</div>
                    </div>

                    {/* Botões de resultado */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <Button
                        onClick={() => handleTradeResult("win")}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Acertei
                      </Button>
                      <Button
                        onClick={() => handleTradeResult("loss")}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Errei
                      </Button>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-200">
                        <strong>Aviso:</strong> Opções binárias envolvem risco. Opere apenas com capital que pode perder. Esta entrada é baseada em análise técnica e não garante lucro.
                      </p>
                    </div>

                    {/* Botão de upgrade após sinal */}
                    {currentPlan === "free" && (
                      <Button 
                        onClick={() => setShowPricingModal(true)}
                        className="w-full mt-4 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade para Entradas Ilimitadas
                      </Button>
                    )}
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-pink-500/20 bg-black/50 backdrop-blur-xl mt-12 py-6">
          <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
            <p>Making a Money - Análise profissional para opções binárias</p>
            <p className="mt-2 text-xs">Risco de perda de capital. Opere com responsabilidade.</p>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes shooting-star {
          0% {
            transform: translateX(0) translateY(0) rotate(-45deg);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateX(-500px) translateY(500px) rotate(-45deg);
            opacity: 0;
          }
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
        
        .animate-shooting-star {
          animation: shooting-star linear infinite;
        }
        
        .animate-twinkle {
          animation: twinkle ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
