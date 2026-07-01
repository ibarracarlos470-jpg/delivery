import { useExchangeRate, formatBs } from '@/contexts/ExchangeRateContext'

type Props = {
  usd: number
  className?: string
  bsClassName?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Price({ usd, className = '', bsClassName = '', size = 'md' }: Props) {
  const { rate } = useExchangeRate()
  const bs = formatBs(usd, rate)

  const sizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size]

  return (
    <span className={`inline-flex flex-col leading-tight ${className}`}>
      <span className={`font-bold text-green-700 ${sizeClass}`}>${usd.toFixed(2)}</span>
      {bs && (
        <span className={`text-xs text-gray-400 font-normal ${bsClassName}`}>{bs}</span>
      )}
    </span>
  )
}
