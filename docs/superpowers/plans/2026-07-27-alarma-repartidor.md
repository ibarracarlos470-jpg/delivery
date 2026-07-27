# Alarma de pedidos nuevos para el repartidor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cuando aparece un pedido nuevo en la lista de "disponibles" del panel `/repartidor`, el repartidor recibe un aviso sonoro + vibración + toast visual, sin recargar la página.

**Architecture:** Módulo de cliente puro (`src/lib/driverAlarm.ts`) que encapsula generación de beep vía Web Audio API, vibración, desbloqueo de audio y persistencia del mute en `localStorage`. `src/app/repartidor/page.tsx` detecta pedidos nuevos comparando IDs de `available` entre polls (ya hace polling cada 5s) y llama al módulo.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Web Audio API, Vibration API, `localStorage`, Sonner (toasts, ya en uso).

## Global Constraints

- Solo aplica a `/repartidor` (`src/app/repartidor/page.tsx`). No se toca backend, `public/sw.js`, ni ninguna otra ruta.
- No se agregan dependencias nuevas ni archivos de audio en `public/`; el sonido se sintetiza con `AudioContext`.
- No se implementan push notifications reales (descartado en el spec por complejidad).
- La alarma se dispara **una sola vez por poll**, incluso si llegan varios pedidos nuevos simultáneamente.
- La primera carga de la página (`load()` inicial) nunca dispara la alarma.
- El toast visual se muestra siempre que hay pedido nuevo, esté o no muteado el sonido. El mute solo afecta beep + vibración.
- Mute persistido en `localStorage` bajo la clave `tumarca-driver-sound-muted`.
- Cualquier fallo de `AudioContext` o `navigator.vibrate` se captura en silencio y nunca interrumpe el polling.
- Spec de referencia: `docs/superpowers/specs/2026-07-27-alarma-repartidor-design.md`.

---

### Task 1: Módulo de alarma (sonido, vibración, mute)

**Files:**
- Create: `src/lib/driverAlarm.ts`

**Interfaces:**
- Produces:
  - `unlockAudioContext(): void`
  - `triggerOrderAlarm(): void`
  - `isSoundMuted(): boolean`
  - `setSoundMuted(muted: boolean): void`

- [ ] **Step 1: Escribir el módulo completo**

```ts
// src/lib/driverAlarm.ts

const SOUND_MUTED_KEY = 'tumarca-driver-sound-muted'

let sharedAudioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return null
  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContextClass()
  }
  return sharedAudioContext
}

export function unlockAudioContext(): void {
  if (typeof window === 'undefined') return
  const unlock = () => {
    try {
      getAudioContext()?.resume()
    } catch {
      // ignore: unlock is best-effort
    }
  }
  window.addEventListener('click', unlock, { once: true })
  window.addEventListener('touchstart', unlock, { once: true })
}

function playTone(ctx: AudioContext, frequency: number, startTime: number, duration: number): void {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.2, startTime)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

function playAlarmBeep(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    playTone(ctx, 660, now, 0.18)
    playTone(ctx, 880, now + 0.2, 0.28)
  } catch {
    // ignore: playback is best-effort
  }
}

function vibrateAlarm(): void {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
  } catch {
    // ignore: vibration is best-effort
  }
}

export function isSoundMuted(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(SOUND_MUTED_KEY) === 'true'
}

export function setSoundMuted(muted: boolean): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SOUND_MUTED_KEY, muted ? 'true' : 'false')
}

export function triggerOrderAlarm(): void {
  if (isSoundMuted()) return
  playAlarmBeep()
  vibrateAlarm()
}
```

- [ ] **Step 2: Verificar que TypeScript compila**

Run: `npx tsc --noEmit`
Expected: sin errores relacionados a `src/lib/driverAlarm.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/driverAlarm.ts
git commit -m "feat: modulo de alarma sonora para pedidos nuevos del repartidor"
```

---

### Task 2: Detectar pedidos nuevos y avisar en el panel del repartidor

**Files:**
- Modify: `src/app/repartidor/page.tsx`

**Interfaces:**
- Consumes (de Task 1, `@/lib/driverAlarm`): `unlockAudioContext(): void`, `triggerOrderAlarm(): void`, `isSoundMuted(): boolean`, `setSoundMuted(muted: boolean): void`

- [ ] **Step 1: Actualizar imports (líneas 1-7)**

Reemplazar:

```tsx
'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { MapPin, Phone, Package, Clock, CheckCircle, Truck, RefreshCw, User, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import OrderChat from '@/components/chat/OrderChat'
```

por:

```tsx
'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { MapPin, Phone, Package, Clock, CheckCircle, Truck, RefreshCw, User, Navigation, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import OrderChat from '@/components/chat/OrderChat'
import { unlockAudioContext, triggerOrderAlarm, isSoundMuted, setSoundMuted } from '@/lib/driverAlarm'
```

- [ ] **Step 2: Agregar estado de mute y ref de IDs previos (líneas 44-46)**

Reemplazar:

```tsx
  const [sharing, setSharing] = useState(false)
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const activesRef = useRef<Order[]>([])
```

por:

```tsx
  const [sharing, setSharing] = useState(false)
  const [muted, setMuted] = useState(false)
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const activesRef = useRef<Order[]>([])
  const prevAvailableIdsRef = useRef<Set<string> | null>(null)
```

- [ ] **Step 3: Detectar pedidos nuevos dentro de `load()` (líneas 48-56)**

Reemplazar:

```tsx
  const load = useCallback(async () => {
    const res = await fetch('/api/driver/orders')
    const data = await res.json()
    const active = data.active ?? []
    activesRef.current = active
    setAvailable(data.available ?? [])
    setActives(active)
    setLoading(false)
  }, [])
```

por:

```tsx
  const load = useCallback(async () => {
    const res = await fetch('/api/driver/orders')
    const data = await res.json()
    const active = data.active ?? []
    const availableOrders: Order[] = data.available ?? []

    const currentIds = new Set(availableOrders.map(o => o.id))
    if (prevAvailableIdsRef.current) {
      const hasNewOrder = availableOrders.some(o => !prevAvailableIdsRef.current!.has(o.id))
      if (hasNewOrder) {
        triggerOrderAlarm()
        toast.info('🔔 Nuevo pedido disponible')
      }
    }
    prevAvailableIdsRef.current = currentIds

    activesRef.current = active
    setAvailable(availableOrders)
    setActives(active)
    setLoading(false)
  }, [])
```

- [ ] **Step 4: Inicializar mute y desbloquear audio al montar (después de líneas 58-62)**

Después de este bloque existente:

```tsx
  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [load])
```

agregar inmediatamente debajo:

```tsx

  useEffect(() => {
    setMuted(isSoundMuted())
    unlockAudioContext()
  }, [])
```

- [ ] **Step 5: Agregar botón de mute en el header (líneas 153-162)**

Reemplazar:

```tsx
          <div className="flex items-center gap-2">
            {sharing && (
              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1.5 rounded-full">
                <Navigation size={11} className="animate-pulse" /> GPS activo
              </span>
            )}
            <button onClick={load} className="text-gray-400 hover:text-orange-500 transition-colors">
              <RefreshCw size={18} />
            </button>
          </div>
```

por:

```tsx
          <div className="flex items-center gap-2">
            {sharing && (
              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1.5 rounded-full">
                <Navigation size={11} className="animate-pulse" /> GPS activo
              </span>
            )}
            <button
              onClick={() => {
                const next = !muted
                setMuted(next)
                setSoundMuted(next)
              }}
              className="text-gray-400 hover:text-orange-500 transition-colors"
              aria-label={muted ? 'Activar sonido de alarma' : 'Silenciar alarma'}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button onClick={load} className="text-gray-400 hover:text-orange-500 transition-colors">
              <RefreshCw size={18} />
            </button>
          </div>
```

- [ ] **Step 6: Verificar que TypeScript compila**

Run: `npx tsc --noEmit`
Expected: sin errores relacionados a `src/app/repartidor/page.tsx`.

- [ ] **Step 7: Verificar lint**

Run: `npm run lint`
Expected: sin errores nuevos en `src/app/repartidor/page.tsx` ni `src/lib/driverAlarm.ts`.

- [ ] **Step 8: Verificación manual end-to-end**

Levantar el entorno: `npm run dev`

1. Iniciar sesión como `DRIVER` en `/repartidor`. Con otra sesión (o incógnito) como `CUSTOMER`, completar un checkout para crear un pedido nuevo en la misma sede.
2. Confirmar que en `/repartidor`, dentro de los 5s siguientes, suena el beep, vibra (si se prueba en Android) y aparece el toast "🔔 Nuevo pedido disponible", sin recargar la página.
3. Recargar `/repartidor` con pedidos ya disponibles en pantalla y confirmar que la carga inicial **no** dispara la alarma.
4. Tocar el ícono de altavoz para mutear, recargar la página, y confirmar que el ícono sigue mostrando el estado muteado (persistencia en `localStorage`) y que un pedido nuevo no suena ni vibra, pero el toast sigue apareciendo.
5. Crear dos pedidos nuevos casi al mismo tiempo (dentro de la misma ventana de 5s) y confirmar que solo se escucha un beep, no dos superpuestos.

- [ ] **Step 9: Commit**

```bash
git add src/app/repartidor/page.tsx
git commit -m "feat: alarma sonora y visual para pedidos nuevos en panel de repartidor"
```
