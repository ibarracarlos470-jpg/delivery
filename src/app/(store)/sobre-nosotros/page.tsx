import Link from 'next/link'
import { MapPin, Mail, Clock, Shield, Truck, Heart } from 'lucide-react'

const WA_NUMBER = '+58 424 820 7818'
const WA_LINK = 'https://wa.me/584248207818'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

export const metadata = { title: 'Sobre Nosotros — TuMarca' }

export default function SobreNosotros() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-[#00873d] text-white py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold mb-4">Sobre TuMarca</h1>
          <p className="text-green-100 text-lg leading-relaxed">
            Tu farmacia de confianza con delivery a domicilio. Llevamos medicamentos y productos de salud directamente a tu puerta en Venezuela.
          </p>
        </div>
      </section>

      {/* Misión */}
      <section className="container mx-auto max-w-4xl px-4 py-14">
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Heart size={24} className="text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Nuestra Misión</h3>
            <p className="text-sm text-gray-600">Hacer accesible el cuidado de la salud a todos los venezolanos, con precios justos y servicio de calidad.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield size={24} className="text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Garantía de Calidad</h3>
            <p className="text-sm text-gray-600">Todos nuestros productos son originales, adquiridos de distribuidores autorizados y almacenados en condiciones óptimas.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Truck size={24} className="text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Delivery Rápido</h3>
            <p className="text-sm text-gray-600">Entregamos en el menor tiempo posible. Nuestros repartidores conocen cada rincón de la ciudad para llegar a tiempo.</p>
          </div>
        </div>

        {/* Historia */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Quiénes somos?</h2>
          <div className="prose prose-green max-w-none text-gray-600 space-y-4 text-sm leading-relaxed">
            <p>
              TuMarca nació con el objetivo de transformar la forma en que los venezolanos acceden a medicamentos y productos de salud. Entendemos que en muchas ocasiones no es posible salir a buscar lo que necesitas, ya sea por tiempo, distancia o salud.
            </p>
            <p>
              Comenzamos operaciones en Nueva Esparta, isla de Margarita, con la visión de expandirnos a nivel nacional. Contamos con un equipo comprometido de profesionales en farmacia, logística y tecnología para ofrecerte la mejor experiencia posible.
            </p>
            <p>
              Creemos en la transparencia de precios, la atención al cliente y la responsabilidad que implica manejar productos de salud. Cada pedido que gestionamos es tratado con la seriedad y el cuidado que merece.
            </p>
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Contáctanos</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Ubicación Principal</p>
                <p className="text-sm text-gray-500">Nueva Esparta, Venezuela</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                <Clock size={18} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Horario de Atención</p>
                <p className="text-sm text-gray-500">Lun–Vie 8:00am – 8:00pm</p>
                <p className="text-sm text-gray-500">Sáb 9:00am – 6:00pm</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-[#25D366] rounded-lg flex items-center justify-center shrink-0">
                <WhatsAppIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">WhatsApp</p>
                <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-[#25D366] hover:underline font-medium">
                  {WA_NUMBER}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                <Mail size={18} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Correo</p>
                <p className="text-sm text-gray-500">info@tumarca.ve</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
