'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type ExchangeRate = { rate: number; at: string | null }

const ExchangeRateContext = createContext<ExchangeRate>({ rate: 0, at: null })

export function ExchangeRateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ExchangeRate>({ rate: 0, at: null })

  useEffect(() => {
    fetch('/api/bcv')
      .then(r => r.json())
      .then(d => setData({ rate: d.rate ?? 0, at: d.at ?? null }))
      .catch(() => {})
  }, [])

  return (
    <ExchangeRateContext.Provider value={data}>
      {children}
    </ExchangeRateContext.Provider>
  )
}

export function useExchangeRate() {
  return useContext(ExchangeRateContext)
}

export function formatBs(usd: number, rate: number) {
  if (!rate) return null
  const bs = usd * rate
  return `Bs ${new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(bs)}`
}
