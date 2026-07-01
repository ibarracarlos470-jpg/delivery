export const metadata = { title: 'Términos y Condiciones — TuMarca' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

export default function Terminos() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-[#00873d] text-white py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Términos y Condiciones</h1>
          <p className="text-green-100 text-sm">Última actualización: julio 2026</p>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm border">

          <Section title="1. Aceptación de los Términos">
            <p>Al acceder y utilizar la plataforma TuMarca (sitio web y aplicación móvil), usted acepta quedar vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.</p>
          </Section>

          <Section title="2. Descripción del Servicio">
            <p>TuMarca es una plataforma de comercio electrónico especializada en productos farmacéuticos y de salud, que facilita la compra y entrega a domicilio dentro de las zonas de cobertura habilitadas en Venezuela.</p>
            <p>Los productos ofrecidos incluyen medicamentos de venta libre, vitaminas, suplementos y productos de cuidado personal. Los medicamentos de venta bajo prescripción médica requieren la presentación de la receta correspondiente.</p>
          </Section>

          <Section title="3. Registro y Cuenta de Usuario">
            <p>Para realizar pedidos debe crear una cuenta con información veraz y actualizada. Usted es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que ocurran bajo su cuenta.</p>
          </Section>

          <Section title="4. Precios y Pagos">
            <p>Los precios están expresados en dólares estadounidenses (USD). Aceptamos pagos mediante transferencia bancaria, pago móvil (Bolívares), Zelle y efectivo contra entrega, según disponibilidad.</p>
            <p>TuMarca se reserva el derecho de modificar los precios en cualquier momento. Los pedidos confirmados mantienen el precio al momento de la confirmación.</p>
          </Section>

          <Section title="5. Proceso de Pedido y Entrega">
            <p>Una vez realizado su pedido, recibirá una confirmación. El tiempo estimado de entrega depende de la zona de cobertura y disponibilidad del producto. TuMarca no se hace responsable por demoras ocasionadas por causas de fuerza mayor.</p>
            <p>Si un producto no está disponible, nos comunicaremos con usted para ofrecer una alternativa o proceder con el reembolso.</p>
          </Section>

          <Section title="6. Devoluciones y Reembolsos">
            <p>Por razones de salud pública, no se aceptan devoluciones de medicamentos una vez entregados. En caso de producto defectuoso, dañado o incorrecto, contáctenos dentro de las 24 horas siguientes a la entrega para gestionar el reemplazo o reembolso correspondiente.</p>
          </Section>

          <Section title="7. Limitación de Responsabilidad">
            <p>TuMarca actúa como intermediario entre el usuario y los distribuidores farmacéuticos. No somos responsables por el uso inapropiado de los productos adquiridos. Recomendamos siempre consultar con un profesional de la salud antes de iniciar cualquier tratamiento.</p>
          </Section>

          <Section title="8. Modificaciones">
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor al ser publicadas en la plataforma. El uso continuado del servicio constituye la aceptación de los nuevos términos.</p>
          </Section>

          <Section title="9. Contacto">
            <p>Para consultas relacionadas con estos términos, contáctenos a través de nuestros canales oficiales disponibles en la página <a href="/sobre-nosotros" className="text-green-700 hover:underline">Sobre Nosotros</a>.</p>
          </Section>
        </div>
      </section>
    </div>
  )
}
