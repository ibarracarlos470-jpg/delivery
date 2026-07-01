import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, Shield, Truck, Heart } from 'lucide-react'

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
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                <Phone size={18} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">WhatsApp</p>
                <p className="text-sm text-gray-500">+58 (414) 000-0000</p>
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
