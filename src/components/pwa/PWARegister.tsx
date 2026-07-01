'use client'
import { useEffect } from 'react'

export default function PWARegister({ manifest = '/manifest.json' }: { manifest?: string }) {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // Update manifest link dynamically (for driver app)
    const existing = document.querySelector('link[rel="manifest"]')
    if (existing) {
      existing.setAttribute('href', manifest)
    } else {
      const link = document.createElement('link')
      link.rel = 'manifest'
      link.href = manifest
      document.head.appendChild(link)
    }
  }, [manifest])

  return null
}
