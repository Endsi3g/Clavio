'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Github, Mail, Loader2, Eye, EyeOff, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setOauthLoading(provider)
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
            <Check className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Check your email</h1>
          <p className="text-slate-400">
            We sent a confirmation link to <strong className="text-white">{email}</strong>.
            Click it to activate your account.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm text-blue-400 hover:text-blue-300">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-blue-500/8 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-white font-bold text-base">C</div>
            <span className="text-white font-semibold text-xl">Clavio</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-1.5 text-sm text-slate-400">Start your 14-day free trial</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm p-8 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
            >
              {oauthLoading === 'google' ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Google
            </Button>
            <Button
              variant="outline"
              className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              onClick={() => handleOAuth('github')}
              disabled={!!oauthLoading}
            >
              {oauthLoading === 'github' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
              GitHub
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-600">or</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300 text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-300 text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                  minLength={8}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-400 text-white font-semibold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create account'}
            </Button>

            <p className="text-xs text-slate-500 text-center">
              By signing up, you agree to our terms of service.
            </p>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
