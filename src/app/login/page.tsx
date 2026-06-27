'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleLogin = async () => {
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
    } else {
      setEnviado(true)
    }
  }

  if (enviado) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>🦖 Revisa tu email, te hemos enviado el link mágico</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Lista de la Compra 9.0</h1>
      <p>Introduce tu email para entrar</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        style={{ padding: '0.5rem', marginRight: '0.5rem' }}
      />
      <button onClick={handleLogin} style={{ padding: '0.5rem 1rem' }}>
        Entrar con magic link
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}