export const metadata = { title: 'Política de Privacidad — TuMarca' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-[#00873d] text-white py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Política de Privacidad</h1>
          <p className="text-green-100 text-sm">Última actualización: julio 2026</p>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm border">

          <Section title="1. Información que Recopilamos">
            <p>Al usar TuMarca recopilamos la siguiente información:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Datos de registro:</strong> nombre, correo electrónico y número de teléfono.</li>
              <li><strong>Datos de entrega:</strong> dirección de envío y referencias de ubicación.</li>
              <li><strong>Datos de pago:</strong> método de pago y referencias de transacción (no almacenamos datos de tarjetas).</li>
              <li><strong>Datos de uso:</strong> historial de pedidos, productos consultados y preferencias de navegación.</li>
              <li><strong>Datos de ubicación:</strong> con su consentimiento, para detectar la sede más cercana y calcular zonas de entrega.</li>
            </ul>
          </Section>

          <Section title="2. Cómo Usamos su Información">
            <p>Utilizamos sus datos exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Procesar y entregar sus pedidos.</li>
              <li>Enviar notificaciones sobre el estado de su pedido.</li>
              <li>Mejorar nuestra plataforma y personalizar su experiencia.</li>
              <li>Cumplir con obligaciones legales aplicables en Venezuela.</li>
              <li>Comunicarle promociones y ofertas (puede desuscribirse en cualquier momento).</li>
            </ul>
          </Section>

          <Section title="3. Compartición de Datos">
            <p>No vendemos ni alquilamos sus datos personales a terceros. Podemos compartir información únicamente con:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Repartidores:</strong> nombre y dirección de entrega para completar su pedido.</li>
              <li><strong>Proveedores de tecnología:</strong> servicios de autenticación (Clerk) y base de datos (Neon), bajo acuerdos de confidencialidad.</li>
              <li><strong>Autoridades:</strong> cuando sea requerido por ley o mandato judicial.</li>
            </ul>
          </Section>

          <Section title="4. Seguridad de los Datos">
            <p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información, incluyendo cifrado en tránsito (HTTPS), autenticación segura y acceso restringido a datos sensibles.</p>
          </Section>

          <Section title="5. Cookies y Tecnologías Similares">
            <p>Usamos cookies de sesión para mantenerlo autenticado y una cookie de preferencia de sede (<code className="bg-gray-100 px-1 rounded text-xs">tmb</code>) para recordar su farmacia preferida. No usamos cookies de seguimiento de terceros con fines publicitarios.</p>
          </Section>

          <Section title="6. Sus Derechos">
            <p>Usted tiene derecho a:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Acceder, corregir o eliminar sus datos personales.</li>
              <li>Revocar su consentimiento para el uso de datos opcionales.</li>
              <li>Solicitar la portabilidad de sus datos.</li>
            </ul>
            <p>Para ejercer estos derechos, contáctenos a través de los canales disponibles en <a href="/sobre-nosotros" className="text-green-700 hover:underline">Sobre Nosotros</a>.</p>
          </Section>

          <Section title="7. Retención de Datos">
            <p>Conservamos sus datos mientras su cuenta esté activa o sea necesario para prestar el servicio. Al eliminar su cuenta, sus datos serán anonimizados o eliminados dentro de los 30 días siguientes, salvo obligación legal de conservación.</p>
          </Section>

          <Section title="8. Cambios a esta Política">
            <p>Podemos actualizar esta política en cualquier momento. Le notificaremos sobre cambios significativos mediante un aviso en la plataforma. Le recomendamos revisarla periódicamente.</p>
          </Section>

        </div>
      </section>
    </div>
  )
}
