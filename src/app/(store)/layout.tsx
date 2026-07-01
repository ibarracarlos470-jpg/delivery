import Header from '@/components/layout/Header'
import CategoryNav from '@/components/layout/CategoryNav'
import Footer from '@/components/layout/Footer'
import { ExchangeRateProvider } from '@/contexts/ExchangeRateContext'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <ExchangeRateProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <CategoryNav />
        <main className="flex-1 bg-gray-50">{children}</main>
        <Footer />
      </div>
    </ExchangeRateProvider>
  )
}
