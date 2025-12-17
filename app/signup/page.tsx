'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

/* ---------------- Schema ---------------- */

const passwordRules = {
  minLength: (v: string) => v.length >= 8,
  uppercase: (v: string) => /[A-Z]/.test(v),
  lowercase: (v: string) => /[a-z]/.test(v),
  number: (v: string) => /[0-9]/.test(v),
  special: (v: string) => /[^A-Za-z0-9]/.test(v)
}

const signUpSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Invalid phone number'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine(passwordRules.uppercase, 'Must include uppercase letter')
      .refine(passwordRules.lowercase, 'Must include lowercase letter')
      .refine(passwordRules.number, 'Must include number')
      .refine(passwordRules.special, 'Must include special character'),
    confirmPassword: z.string()
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

type SignUpForm = z.infer<typeof signUpSchema>

/* ---------------- Component ---------------- */

export default function SignUpPage () {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange'
  })

  const password = watch('password', '')

  const conditions = [
    { label: '8 characters', valid: passwordRules.minLength(password) },
    { label: 'Uppercase letter', valid: passwordRules.uppercase(password) },
    { label: 'Lowercase letter', valid: passwordRules.lowercase(password) },
    { label: 'Number', valid: passwordRules.number(password) },
    { label: 'Special character', valid: passwordRules.special(password) }
  ]

  const onSubmit = (data: SignUpForm) => {
    console.log(data)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-4'>
      <div className='relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur'>
        <div className='pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-transparent to-sky-500/20 blur-3xl' />

        <div className='relative space-y-6'>
          {/* Header */}
          <div className='text-center space-y-2'>
            <div className='mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/40'>
              <span className='text-sm font-semibold text-emerald-300'>L</span>
            </div>
            <h1 className='text-xl font-semibold tracking-tight'>
              Create your account
            </h1>
            <p className='text-xs text-slate-400'>
              Start your loan journey with LendFlow
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-2' autoComplete='off'>
            {/* Full Name */}
            <div className='space-y-1'>
              <label htmlFor='fullName' className='text-xs text-slate-400'>
                Full name
              </label>
              <input
                id='fullName'
                {...register('fullName')}
                className='w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm'
                autoComplete="new-password"
              />
              {errors.fullName && (
                <p className='text-xs text-red-400'>
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className='space-y-1'>
              <label htmlFor='email' className='text-xs text-slate-400'>
                Email address
              </label>
              <input
                id='email'
                type='email'
                {...register('email')}
                className='w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm'
                autoComplete="new-password"
              />
              {errors.email && (
                <p className='text-xs text-red-400'>{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className='space-y-1'>
              <label htmlFor='phone' className='text-xs text-slate-400'>
                Phone number
              </label>
              <input
                id='phone'
                type='tel'
                {...register('phone')}
                className='w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm'
                autoComplete="new-password"
              />
              {errors.phone && (
                <p className='text-xs text-red-400'>{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div className='space-y-1'>
              <label htmlFor='password' className='text-xs text-slate-400'>
                Password
              </label>
              <input
                id='password'
                type='password'
                {...register('password')}
                className='w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm'
                autoComplete="new-password"
              />
            </div>

            {/* Password conditions */}
            <div className='flex flex-wrap gap-2 pt-1'>
              {conditions.map(c => (
                <div
                  key={c.label}
                  className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs border
        ${
          c.valid
            ? 'border-emerald-400/40 text-emerald-300'
            : 'border-white/10 text-slate-400'
        }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      c.valid ? 'bg-emerald-400' : 'bg-slate-500'
                    }`}
                  />
                  {c.label}
                </div>
              ))}
            </div>

            {/* Confirm Password */}
            <div className='space-y-1'>
              <label
                htmlFor='confirmPassword'
                className='text-xs text-slate-400'
              >
                Confirm password
              </label>
              <input
                id='confirmPassword'
                type='password'
                {...register('confirmPassword')}
                className='w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm'
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className='text-xs text-red-400'>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type='submit'
              className='w-full rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 hover:bg-emerald-300'
            >
              Create account
            </button>
          </form>

          {/* Footer */}
          <div className='text-center text-xs text-slate-400'>
            Already have an account?{' '}
            <Link
              href='/signin'
              className='text-emerald-300 hover:text-emerald-200'
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
