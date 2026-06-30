import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold mb-4">TuMarca</h3>
            <p className="text-sm">Tu farmacia online de confianza. Delivery 24/7 en Venezuela.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Categorías</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/categoria/salud-medicamentos" className="hover:text-white">Salud</Link></li>
              <li><Link href="/categoria/belleza" className="hover:text-white">Belleza</Link></li>
              <li><Link href="/categoria/cuidado-bebe" className="hover:text-white">Bebé</Link></li>
              <li><Link href="/categoria/cuidado-personal" className="hover:text-white">Personal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Mi Cuenta</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/perfil" className="hover:text-white">Mi Perfil</Link></li>
              <li><Link href="/pedidos" className="hover:text-white">Mis Pedidos</Link></li>
              <li><Link href="/carrito" className="hover:text-white">Mi Carrito</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Información</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sobre-nosotros" className="hover:text-white">Sobre Nosotros</Link></li>
              <li><Link href="/terminos" className="hover:text-white">Términos y Condiciones</Link></li>
              <li><Link href="/privacidad" className="hover:text-white">Política de Privacidad</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>© 2026 TuMarca. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
