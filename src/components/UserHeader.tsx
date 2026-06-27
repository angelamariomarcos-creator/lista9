'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function UserHeader() {
  const [email, setEmail] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setEmail(null)
    window.location.href = '/'
  }

  if (!email) {
    return (
      <div style={{ padding: '0.5rem 1rem', textAlign: 'right', fontSize: '0.85rem' }}>
        <a href="/login">Iniciar sesión</a>
      </div>
    )
  }

  return (
    <div style={{ padding: '0.5rem 1rem', textAlign: 'right', fontSize: '0.85rem' }}>
      🦖 {email}{' '}
      <button onClick={handleLogout} style={{ marginLeft: '0.5rem' }}>
        Cerrar sesión
      </button>
    </div>
  )
}