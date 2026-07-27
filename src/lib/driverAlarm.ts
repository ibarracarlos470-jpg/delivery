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
  try {
    getAudioContext()?.resume()
  } catch {
    // ignore: unlock is best-effort
  }
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
  try {
    return window.localStorage.getItem(SOUND_MUTED_KEY) === 'true'
  } catch {
    // ignore: localStorage may be unavailable (private mode, sandboxed iframe)
    return false
  }
}

export function setSoundMuted(muted: boolean): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SOUND_MUTED_KEY, muted ? 'true' : 'false')
  } catch {
    // ignore: localStorage may be unavailable (private mode, sandboxed iframe)
  }
}

export function triggerOrderAlarm(): void {
  if (isSoundMuted()) return
  playAlarmBeep()
  vibrateAlarm()
}
