'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerUser, getCurrentUser } from '@/services/auth'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      // Step 1: Register user
      const result = await registerUser(name, email, password)

      if (result.success) {
        // Step 2: Immediately fetch the current user session
        const userResult = await getCurrentUser()
        if (userResult.success) {
          setSuccess(true)

          // Optional: Redirect to posts page instead of login page
          setTimeout(() => {
            router.push('/') // go to posts page with session
          }, 2000)
        } else {
          setError('Registration succeeded, but failed to fetch user session.')
        }
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError('Unexpected error occurred during registration.')
    } finally {
      setLoading(false)
    }
  }

  // Success message page
  if (success) {
    return (
      <div
        style={{
          textAlign: 'center',
          marginTop: '10px',
          backgroundImage: 'url("/programmer-bg.jpg")',
          backgroundSize: 'cover',
          minHeight: '100vh',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h2>Registration successful!</h2>
        <p>Redirecting to posts page...</p>
      </div>
    )
  }

  // Registration form
  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '20px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        backgroundImage: 'url("/programmer-bg.jpg")',
        backgroundSize: 'cover',
        color: '#fff',
      }}
    >
      <h2 style={{ textAlign: 'center' }}>Register</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '3px',
            border: '1px solid #ccc',
            marginBottom: '10px',
          }}
        />

        <label>Email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '3px',
            border: '1px solid #ccc',
            marginBottom: '10px',
          }}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '3px',
            border: '1px solid #ccc',
            marginBottom: '10px',
          }}
        />

        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '3px',
            border: '1px solid #ccc',
            marginBottom: '15px',
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#555' : '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '3px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '10px' }}>
        Already have an account?{' '}
        <a href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
          Login
        </a>
      </p>
    </div>
  )
}