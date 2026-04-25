'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logoutUser } from '@/services/auth'
import PostsPage from './posts/page' // adjust path if necessary

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if the user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const result = await getCurrentUser()
      if (result.success) {
        setUser(result.user)
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  // Logout handler
  const handleLogout = async () => {
    await logoutUser()
    setUser(null)
  }

  // While loading session
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: '#fff' }}>
        <p>Checking authentication...</p>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: 'url("/programmer-bg.jpg")',
        backgroundSize: 'cover',
        color: '#fff',
      }}
    >
      {user ? (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          {/* Logged-in user info + logout */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2>Welcome, {user.name}!</h2>
            <p>Email: {user.email}</p>

            <button
              onClick={handleLogout}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0070f3',
                color: '#000',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>

            <div style={{ marginTop: '20px' }}>
              <a
                href="/posts"
                style={{ color: 'yellow', textDecoration: 'underline' }}
              >
                View Posts
              </a>
            </div>
          </div>

          {/* Show Posts */}
          <PostsPage userFromHome={user} />
        </div>
      ) : (
        // User not logged in → show login/register prompt
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>Welcome to Hawaasummaa Social Media</h2>
          <p>Please login or register to continue.</p>

          <div style={{ marginTop: '20px' }}>
            <a
              href="/login"
              style={{
                color: 'blue',
                textDecoration: 'underline',
                marginRight: '15px',
              }}
            >
              Login
            </a>

            <a
              href="/register"
              style={{
                color: 'green',
                textDecoration: 'underline',
              }}
            >
              Register
            </a>
          </div>
        </div>
      )}
    </div>
  )
}