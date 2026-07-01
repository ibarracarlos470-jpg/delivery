'use client'
import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, X, ChevronDown } from 'lucide-react'

type Message = {
  id: string
  senderId: string
  senderRole: string
  message: string
  createdAt: string
  sender: { name: string | null }
}

type Props = {
  orderId: string
  myRole: 'CUSTOMER' | 'DRIVER'
  myName: string
}

export default function OrderChat({ orderId, myRole, myName }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastCountRef = useRef(0)

  async function load(silent = false) {
    try {
      const res = await fetch(`/api/orders/${orderId}/chat`)
      if (!res.ok) return
      const data: Message[] = await res.json()
      setMessages(data)
      if (!silent) return
      const newCount = data.length - lastCountRef.current
      if (newCount > 0 && !open) setUnread(u => u + newCount)
      lastCountRef.current = data.length
    } catch { /* */ }
  }

  useEffect(() => {
    load()
    const interval = setInterval(() => load(true), 4000)
    return () => clearInterval(interval)
  }, [orderId])

  useEffect(() => {
    if (open) {
      setUnread(0)
      lastCountRef.current = messages.length
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [open, messages.length])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    try {
      await fetch(`/api/orders/${orderId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      })
      setText('')
      await load()
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    } finally {
      setSending(false)
    }
  }

  const roleLabel = myRole === 'CUSTOMER' ? 'DRIVER' : 'CUSTOMER'
  const otherLabel = roleLabel === 'DRIVER' ? 'Repartidor' : 'Cliente'

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat window */}
      {open && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden" style={{ height: 420 }}>
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 ${myRole === 'DRIVER' ? 'bg-orange-500' : 'bg-green-600'} text-white`}>
            <div>
              <p className="font-bold text-sm">Chat con {otherLabel}</p>
              <p className="text-xs opacity-75">Pedido #{orderId.slice(-6).toUpperCase()}</p>
            </div>
            <button onClick={() => setOpen(false)} className="hover:opacity-75 transition-opacity">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                Inicia la conversación
              </div>
            )}
            {messages.map(msg => {
              const isMe = msg.senderRole === myRole
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    isMe
                      ? myRole === 'DRIVER' ? 'bg-orange-500 text-white' : 'bg-green-600 text-white'
                      : 'bg-white text-gray-800 border shadow-sm'
                  }`}>
                    {!isMe && (
                      <p className="text-xs font-semibold opacity-60 mb-0.5">{msg.sender.name ?? otherLabel}</p>
                    )}
                    <p>{msg.message}</p>
                    <p className={`text-xs mt-0.5 ${isMe ? 'opacity-70' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={send} className="flex gap-2 p-3 border-t bg-white">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 text-sm border rounded-xl px-3 py-2 outline-none focus:border-green-400"
              maxLength={500}
            />
            <button type="submit" disabled={sending || !text.trim()}
              className={`p-2 rounded-xl text-white transition-colors disabled:opacity-40 ${
                myRole === 'DRIVER' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'
              }`}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* FAB button */}
      <button onClick={() => setOpen(o => !o)}
        className={`relative w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105 ${
          myRole === 'DRIVER' ? 'bg-orange-500' : 'bg-green-600'
        }`}>
        {open ? <ChevronDown size={22} /> : <MessageCircle size={22} />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </div>
  )
}
