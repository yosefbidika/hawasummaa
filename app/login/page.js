'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser, getCurrentUser } from '@/services/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()         // prevent default form submission
    setError('')               // clear previous errors
    setLoading(true)           // show loading state

    try {
      // Step 1: Call login service
      const loginResult = await loginUser(email, password)

      if (loginResult.success) {
        // Step 2: Fetch the current user after login
        const userResult = await getCurrentUser()

        if (userResult.success) {
          // User is logged in and session is valid
          router.push('/')  // Redirect to home/posts page
        } else {
          // Session exists but failed to fetch user info
          setError('Failed to fetch user information. Please try again.')
        }
      } else {
        // Login failed
        setError(loginResult.error || 'Invalid email or password.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Unexpected error occurred during login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '50px auto',
        padding: '30px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#1e1e1e',
        color: '#fff',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>

      {error && (
        <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '15px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#555' : '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Don't have an account?{' '}
        <a href="/register" style={{ color: '#4CAF50', textDecoration: 'underline' }}>
          Register
        </a>
      </p>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
        <p>
          Your login session will be saved automatically. If you are redirected to this page
          again, check your network connection or clear your browser cookies.
        </p>
      </div>
    </div>
  )
}