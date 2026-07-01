import Link from 'next/link'

const WA_LINK = 'https://wa.me/584248207818'

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold mb-4">TuMarca</h3>
            <p className="text-sm mb-4">Tu farmacia online de confianza. Delivery en Venezuela.</p>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#20bd5a] transition-colors">
              <WhatsAppIcon />
              Escríbenos
            </a>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Categorías</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/categoria/analgesicos-antipireticos" className="hover:text-white">Analgésicos</Link></li>
              <li><Link href="/categoria/vitaminas-suplementos" className="hover:text-white">Vitaminas</Link></li>
              <li><Link href="/categoria/cuidado-personal" className="hover:text-white">Cuidado Personal</Link></li>
              <li><Link href="/categoria/primeros-auxilios" className="hover:text-white">Primeros Auxilios</Link></li>
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
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p>© 2026 TuMarca. Todos los derechos reservados.</p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#25D366] hover:text-[#20bd5a] transition-colors">
            <WhatsAppIcon />
            +58 424 820 7818
          </a>
        </div>
      </div>
    </footer>
  )
}
