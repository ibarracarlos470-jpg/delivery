# Alarma de pedidos nuevos para el repartidor

## Problema

El panel `/repartidor` (`src/app/repartidor/page.tsx`) hace polling cada 5s a `/api/driver/orders` y separa los pedidos en `available` (sin asignar) y `actives` (asignados al repartidor). Hoy no hay ningún aviso sonoro ni visual cuando aparece un pedido nuevo en `available` — el repartidor solo se entera si tiene la pantalla abierta y la está mirando en ese momento.

## Objetivo

Cuando aparezca un pedido nuevo en `available`, el repartidor debe recibir un aviso sonoro + vibración + visual mientras tiene la app abierta (en cualquier pestaña/segundo plano reciente del navegador), sin requerir infraestructura de push notifications.

## Alcance

- Solo aplica a `/repartidor` (componente `DriverDashboard`).
- Solo se dispara por pedidos nuevos en `available` (pedidos sin asignar). No se dispara por cambios de estado en `actives` (los pedidos ya asignados al repartidor).
- Cambio 100% de cliente: no toca el backend, `service worker`, ni requiere nuevos assets.
- Explícitamente fuera de alcance (según lo conversado): notificaciones push reales que funcionen con la app cerrada — se descartó por complejidad (Service Worker, VAPID keys, suscripciones por repartidor, disparo desde servidor).

## Diseño

### 1. Detección de pedido nuevo

En `load()` (`src/app/repartidor/page.tsx:48-56`) se mantiene un `ref` (`prevAvailableIdsRef`) con los IDs de `available` del poll anterior. En cada poll:

1. Se calculan los IDs de `data.available` del poll actual.
2. Si `prevAvailableIdsRef` ya tenía un valor (es decir, no es la primera carga) y existe al menos un ID nuevo que no estaba antes → se dispara la alarma **una sola vez**, aunque hayan llegado varios pedidos nuevos en el mismo poll.
3. Se actualiza `prevAvailableIdsRef` con los IDs actuales, sin importar si hubo alarma o no.

La primera carga de la página nunca dispara alarma (evita sonar apenas se abre la app con pedidos ya disponibles).

### 2. Sonido

Se genera con Web Audio API (`AudioContext` + `OscillatorNode`), sin depender de ningún archivo de audio en `public/`: un beep corto de dos tonos ascendentes (~600ms total).

**Desbloqueo de audio (corregido tras QA manual):** los navegadores bloquean `AudioContext` hasta que el usuario interactúa explícitamente. El diseño original asumía un desbloqueo invisible en el primer click/tap en cualquier parte de la página — verificado en manual QA que esto falla en el caso de uso real: el repartidor abre `/repartidor` y deja la pestaña quieta esperando, sin tocar nada, por lo que el desbloqueo nunca ocurre y el beep queda mudo.

Se reemplaza por un botón visible en la parte superior del panel ("🔊 Toca para activar el sonido de alertas"), mostrado mientras el audio no esté desbloqueado. Al tocarlo, se llama a `unlockAudioContext()` (que intenta reproducir/resumir el `AudioContext` compartido) y el botón desaparece. Esto encaja con el flujo real: el repartidor abre la app al empezar su turno y toca una vez para activar las alertas, luego la deja corriendo.

Si `AudioContext` no está disponible o falla (navegador no soportado, error de reproducción), el error se captura en silencio — nunca debe romper el polling.

### 3. Vibración

`navigator.vibrate([...])` se llama junto con el sonido, dentro del mismo evento de "pedido nuevo detectado". En navegadores/SO sin soporte (iOS Safari) simplemente no hace nada; no requiere feature-detection especial más allá de comprobar que `navigator.vibrate` existe antes de llamarlo.

### 4. Aviso visual

Además del sonido, se muestra un `toast` (Sonner, ya usado en el resto de la app) del tipo "🔔 Nuevo pedido disponible" cuando se detecta el pedido nuevo. Refuerza el aviso si el sonido falló silenciosamente o el repartidor no escuchó el beep.

### 5. Control de silenciar

Se agrega un ícono de altavoz (mute/unmute) junto al botón de refresh existente (`src/app/repartidor/page.tsx:159-161`). Estado persistido en `localStorage` (ej. `tumarca-driver-sound-muted`), leído al montar el componente. Cuando está muteado, no suena el beep ni vibra, pero el toast visual se sigue mostrando igual (para no perder el aviso por completo).

### Manejo de errores

- Fallos de `AudioContext`/`vibrate` se capturan en `try/catch` y se ignoran silenciosamente — nunca deben interrumpir `load()` ni el resto del flujo de polling.
- Si `data.available` viene vacío o `undefined` en algún poll, se trata como lista vacía (comportamiento ya existente con `data.available ?? []`).

## Testing

No es viable un test automatizado significativo para audio/vibración del navegador. Verificación manual:

1. Abrir `/repartidor` en un dispositivo/navegador, y como `CUSTOMER` crear un pedido nuevo desde otra sesión.
2. Confirmar que suena el beep, vibra (en Android) y aparece el toast, sin haber recargado la página del repartidor.
3. Confirmar que la carga inicial de la página (con pedidos ya disponibles) **no** dispara la alarma.
4. Tocar el ícono de mute, recargar la página, y confirmar que sigue muteado (persistencia en `localStorage`) y que no suena ni vibra en un pedido nuevo, pero el toast sigue apareciendo.
5. Confirmar que dos pedidos nuevos llegando en el mismo poll de 5s solo generan un beep, no dos superpuestos.
