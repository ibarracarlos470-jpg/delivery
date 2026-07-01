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
  return bs >= 1000
    ? `Bs ${(bs / 1000).toFixed(2)}k`
    : `Bs ${bs.toFixed(2)}`
}
