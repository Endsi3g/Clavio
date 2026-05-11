'use client'

import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'

// --- ICONS ---
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
)

// --- TYPES ---
export interface Testimonial {
  avatarSrc: string
  name: string
  handle: string
  text: string
}

interface SignInPageProps {
  title?: React.ReactNode
  description?: React.ReactNode
  heroVideoSrc?: string
  testimonials?: Testimonial[]
  isSignUp?: boolean
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void
  onGoogleSignIn?: () => void
  onResetPassword?: () => void
  onCreateAccount?: () => void
  error?: string | null
  loading?: boolean
}

// --- SUB-COMPONENTS ---
const FormInput = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 transition-colors focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20">
    {children}
  </div>
)

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial; delay: string }) => (
  <div
    className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl p-5 w-64`}
    style={{
      background: 'rgba(0,0,0,0.35)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.15)',
    }}
  >
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl flex-shrink-0" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="font-semibold text-white">{testimonial.name}</p>
      <p className="text-white/60 text-xs">{testimonial.handle}</p>
      <p className="mt-1.5 text-white/80">{testimonial.text}</p>
    </div>
  </div>
)

// --- MAIN COMPONENT ---
export const SignInPage: React.FC<SignInPageProps> = ({
  title,
  description,
  heroVideoSrc,
  testimonials = [],
  isSignUp = false,
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
  error,
  loading = false,
}) => {
  const [showPassword, setShowPassword] = useState(false)

  const defaultTitle = (
    <span className="font-bold text-slate-900 dark:text-white tracking-tight">
      {isSignUp ? 'Create account' : 'Welcome back'}
    </span>
  )
  const defaultDesc = isSignUp
    ? 'Join thousands of creators on Clavio'
    : 'Sign in to your Clavio workspace'

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row w-[100dvw] bg-white dark:bg-slate-950 transition-colors">
      {/* ── Left column: form ── */}
      <section className="flex-1 flex flex-col">
        {/* Top bar: logo + theme toggle */}
        <div className="flex items-center justify-between px-8 pt-7 pb-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white font-bold text-sm group-hover:bg-blue-600 transition-colors">
              C
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">clavio</span>
          </Link>
          <AnimatedThemeToggler sound={true} />
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-8 py-6">
          <div className="w-full max-w-sm">
            <div className="mb-8 animate-element animate-delay-100">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {title ?? defaultTitle}
              </h1>
              <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm font-light">
                {description ?? defaultDesc}
              </p>
            </div>

            {/* Google */}
            <button
              onClick={onGoogleSignIn}
              disabled={loading}
              className="animate-element animate-delay-200 w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 mb-5"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="animate-element animate-delay-300 relative flex items-center mb-5">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="px-4 text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-950">or</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            <form className="space-y-4" onSubmit={onSignIn}>
              <div className="animate-element animate-delay-300">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Email
                </label>
                <FormInput>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="w-full bg-transparent text-sm px-4 py-3 rounded-xl focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </FormInput>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <FormInput>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      className="w-full bg-transparent text-sm px-4 py-3 pr-11 rounded-xl focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormInput>
              </div>

              {!isSignUp && (
                <div className="animate-element animate-delay-500 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="rememberMe" className="rounded border-slate-300 dark:border-slate-600" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Keep me signed in</span>
                  </label>
                  <button
                    type="button"
                    onClick={onResetPassword}
                    className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="animate-element animate-delay-600 w-full rounded-xl bg-slate-900 dark:bg-white py-3.5 text-sm font-bold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing…' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <p className="animate-element animate-delay-700 text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
              {isSignUp ? 'Already have an account? ' : 'New to Clavio? '}
              {isSignUp ? (
                <Link href="/login" className="text-blue-500 dark:text-blue-400 hover:underline font-medium">
                  Sign In
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onCreateAccount}
                  className="text-blue-500 dark:text-blue-400 hover:underline font-medium"
                >
                  Create free account
                </button>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ── Right column: video ── */}
      {heroVideoSrc && (
        <section className="hidden md:block flex-1 relative p-3">
          <div className="animate-slide-right animate-delay-300 absolute inset-3 rounded-2xl overflow-hidden shadow-2xl">
            <video
              src={heroVideoSrc}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Clavio tagline overlay */}
            <div className="absolute bottom-8 left-8 right-8">
              {testimonials.length > 0 && (
                <div className="flex gap-3 flex-wrap">
                  <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
                  {testimonials[1] && (
                    <div className="hidden xl:block">
                      <TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
