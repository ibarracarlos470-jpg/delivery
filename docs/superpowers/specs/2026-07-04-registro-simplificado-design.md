# Registro de usuario simplificado (TuMarca)

## Contexto

TuMarca usa Clerk para autenticación. Hoy el registro de clientes pasa por
el componente hospedado `<SignUp />` de Clerk
(`src/app/(auth)/registro/[[...registro]]/page.tsx`), que pide los campos
que Clerk tenga configurados en su dashboard (potencialmente usuario,
verificación por código, etc.) — friction que se quiere eliminar.

Clerk sigue siendo el proveedor de sesiones/autenticación para toda la
app (middleware, panel admin, super-admin, apps de repartidor Android/TWA).
Este cambio **no** reemplaza Clerk como backend de auth — solo reemplaza
la pantalla de registro que ve el cliente por un formulario propio, y crea
el usuario en Clerk por la API de backend en vez de por su UI.

## Flujo objetivo

1. Cliente llena un formulario propio en `/registro` con: cédula (texto
   libre, sin validación de formato), nombre, apellido, teléfono
   principal, teléfono alternativo, correo.
2. `POST /api/auth/registro`:
   - Verifica que no exista ya un `User` con ese email o cédula.
   - Genera una contraseña aleatoria segura (cumple la política mínima
     de Clerk).
   - Crea el usuario en Clerk vía `clerkClient.users.createUser` (backend
     API, sin pasar por el `<SignUp/>` de Clerk) con email, password,
     firstName, lastName.
   - Hace `upsert` (no `create`) del `User` en Prisma por `clerkId`, con
     email, name, phone, phone2, cedula, role `CUSTOMER` — `upsert` porque
     el webhook de Clerk (`user.created`) puede llegar antes o después de
     esta escritura.
   - Envía un correo (Resend) con la contraseña generada y un link a
     `/login`.
   - Si el envío de correo falla, la cuenta igual queda creada (no se
     revierte); se muestra un error indicando que debe contactar soporte
     para recibir su contraseña. No hay reintento automático en esta
     iteración (YAGNI).
3. Cliente inicia sesión en `/login` (sin cambios — sigue siendo el
   `<SignIn/>` de Clerk) con su correo + la contraseña recibida.
4. Página propia `/cuenta/cambiar-password` (requiere sesión activa):
   formulario con nueva contraseña + confirmar, que llama a
   `user.updatePassword()` del SDK cliente de Clerk. No usa el
   `<UserProfile/>` de Clerk.

## Cambios de esquema (Prisma)

En `model User` (`prisma/schema.prisma`):
- Agregar `cedula String @unique`
- Agregar `phone2 String?` (el campo `phone` existente pasa a ser el
  teléfono principal)

Requiere migración de Prisma.

## Webhook de Clerk

`src/app/api/webhooks/clerk/route.ts`: cambiar `prisma.user.create` por
`prisma.user.upsert` (`where: { clerkId }`) en el handler de
`user.created`, para que no choque si el registro ya insertó la fila
primero.

## Email transaccional

- Se agrega el paquete `resend` + variable de entorno `RESEND_API_KEY`.
- Plantilla simple en HTML (branding TuMarca): contraseña generada +
  botón/link a `/login`.
- **Pendiente de confirmar con el usuario:** dominio verificado de envío.
  Mientras no haya un dominio propio verificado en Resend, se usa su
  dominio de pruebas (`onboarding@resend.dev`), que **no entrega a bandejas
  de clientes reales** — solo sirve para pruebas internas. Antes de
  lanzar a producción hay que verificar un dominio propio en Resend.

## Errores y validación

- Email duplicado → "Ya existe una cuenta con ese correo."
- Cédula duplicada → "Ya existe una cuenta con esa cédula."
- Falla de creación en Clerk (formato de email inválido, etc.) → mensaje
  de error genérico devuelto por Clerk, traducido a español donde
  aplique.
- Falla de envío de correo → cuenta creada igual; mensaje pidiendo
  contactar soporte.

## Fuera de alcance

- No se elimina Clerk del resto de la app (login, middleware, admin,
  super-admin, apps de repartidor siguen igual).
- No se agrega verificación de formato de cédula (V-/E- + dígitos).
- No se agrega reenvío automático de contraseña si falla el correo.
- No se toca el `<SignIn/>` existente en `/login`.
